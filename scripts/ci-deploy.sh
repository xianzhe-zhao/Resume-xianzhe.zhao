#!/bin/bash
# CI/CD 部署脚本（v1.6.0 加固版）
# 用法：./ci-deploy.sh [test|prod]
# 加固点（spec: docs/specs/2026-11-15-cicd-hardening.md）：
#   1. set -euo pipefail：rsync / .env 写入 / pm2 start 失败 → 立即非零退出，workflow 正确标红
#   2. 部署失败自动回滚：恢复最近备份（代码 + .env）并重启，退出非零
#   3. 真实密码只从服务器 ~/.secrets/resume.env 读取（git 零字面量，缺失即失败，禁止默认值回退）
#   4. PM2 多级解析（PATH → ~/.npm-global → npx 缓存），不再写死 npx hash 路径
#   5. 只操作 resume / resume-test 两个 PM2 进程名，绝不触碰其他进程（含 baobao-*）

set -euo pipefail

ENV=${1:-}
if [ -z "$ENV" ]; then
    echo "用法：$0 [test|prod]"
    exit 1
fi

case "$ENV" in
    test)
        TARGET_DIR=/home/xianzhe/Project/resume-test
        TARGET_PORT=3002
        PM2_NAME=resume-test
        ;;
    prod)
        TARGET_DIR=/home/xianzhe/Project/resume
        TARGET_PORT=3000
        PM2_NAME=resume
        ;;
    *)
        echo "未知环境：$ENV"
        exit 1
        ;;
esac

export PM2_HOME=/home/xianzhe/.pm2

# ---- PM2 解析：PATH → 用户全局 → npx 缓存（最后手段）→ 报错 ----
resolve_pm2() {
    local c
    if c=$(command -v pm2 2>/dev/null) && [ -x "$c" ]; then echo "$c"; return 0; fi
    for c in "$HOME/.npm-global/bin/pm2" /usr/local/bin/pm2; do
        if [ -x "$c" ]; then echo "$c"; return 0; fi
    done
    c=$(ls ~/.npm/_npx/*/node_modules/pm2/bin/pm2 2>/dev/null | head -n 1 || true)
    if [ -n "$c" ] && [ -x "$c" ]; then echo "$c"; return 0; fi
    return 1
}
PM2=$(resolve_pm2) || { echo "❌ pm2 不可用：先执行 npm install -g pm2 --prefix ~/.npm-global"; exit 1; }
echo "使用 pm2：$PM2（$("$PM2" -v 2>/dev/null)）"
# 注：CLI 与 daemon 版本不一致时 pm2 会打印升级提示，属警告噪音，不作为部署失败判据

# ---- 密码：服务器 secrets 文件（豹豹模式：真实密码只存服务器，git 零字面量）----
SECRETS_FILE="$HOME/.secrets/resume.env"
if [ ! -f "$SECRETS_FILE" ] || [ ! -s "$SECRETS_FILE" ]; then
    echo "❌ 缺少 $SECRETS_FILE（内容：ADMIN_PASSWORD=...，权限 600）。真实密码不进 git/日志。"
    exit 1
fi
# shellcheck disable=SC1090
. "$SECRETS_FILE"
if [ -z "${ADMIN_PASSWORD:-}" ]; then
    echo "❌ $SECRETS_FILE 中未定义 ADMIN_PASSWORD"
    exit 1
fi

echo "=== 部署到 $ENV 环境（目录 $TARGET_DIR，端口 $TARGET_PORT，进程 $PM2_NAME）==="

# ---- 回滚机制：部署失败 → 恢复最近备份（代码 + .env）→ 重启 → 非零退出 ----
ROLLBACK_BACKUP=""
rollback() {
    local code=$?
    set +e
    if [ -n "$ROLLBACK_BACKUP" ] && [ -d "$ROLLBACK_BACKUP" ]; then
        echo ""
        echo "⚠️ 部署失败（exit $code），自动回滚到备份：$ROLLBACK_BACKUP"
        rm -rf "$TARGET_DIR"
        if cp -r "$ROLLBACK_BACKUP" "$TARGET_DIR"; then
            if [ -f "$TARGET_DIR/.env" ]; then
                if "$PM2" describe "$PM2_NAME" >/dev/null 2>&1; then
                    "$PM2" delete "$PM2_NAME" >/dev/null 2>&1
                fi
                if (cd "$TARGET_DIR" && "$PM2" start server.js --name "$PM2_NAME" >/dev/null 2>&1); then
                    echo "已用备份版本重启 $PM2_NAME（旧版本 + 旧 .env）"
                else
                    echo "WARN: 备份版本启动失败，请手动检查：pm2 list / $TARGET_DIR"
                fi
            else
                echo "备份中无 .env，仅恢复文件；请手动重启：cd $TARGET_DIR && $PM2 start server.js --name $PM2_NAME"
            fi
        else
            echo "❌ 回滚复制失败，请手动恢复：cp -r $ROLLBACK_BACKUP $TARGET_DIR"
        fi
    else
        echo ""
        echo "⚠️ 部署失败（exit $code），且无备份可回滚（首次部署？）；请手动检查：$TARGET_DIR"
    fi
    exit "$code"
}
trap rollback ERR

# ---- 1. 备份当前版本（失败即中止：dual-branch spec C4「备份失败→中止部署」）----
if [ -d "$TARGET_DIR" ] && [ -n "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
    ROLLBACK_BACKUP="${TARGET_DIR}-backup-$(date +%Y%m%d%H%M%S)"
    echo "备份当前版本到：$ROLLBACK_BACKUP"
    cp -r "$TARGET_DIR" "$ROLLBACK_BACKUP"
    # 清理旧备份，保留最近 5 个（非关键：失败仅告警，不中止）
    ls -dt "${TARGET_DIR}-backup-"* 2>/dev/null | tail -n +6 | xargs -r rm -rf 2>/dev/null \
        || echo "WARN: 旧备份清理失败（不影响部署）"
fi

# ---- 2. 部署：同步文件（失败即中止 + 回滚）----
echo "部署新版本到 $ENV 环境..."
rsync -a --delete ./ "$TARGET_DIR/" \
    --exclude='.git' --exclude='.github' --exclude='node_modules' \
    --exclude='docs' --exclude='test' --exclude='*.md' \
    --exclude='.gitignore' --exclude='scripts'

# ---- 3. 写入 .env（rsync 之后写，防 --delete 清除；密码不回显）----
printf 'ADMIN_PASSWORD=%s\nPORT=%s\n' "$ADMIN_PASSWORD" "$TARGET_PORT" > "$TARGET_DIR/.env"
chmod 600 "$TARGET_DIR/.env"
echo ".env 文件已写入（含密码，不回显）"

# ---- 4. 停止旧进程（pm2 delete 仅在进程存在时执行；kill 容错）----
echo "停止旧进程..."
if "$PM2" describe "$PM2_NAME" >/dev/null 2>&1; then
    "$PM2" delete "$PM2_NAME" >/dev/null 2>&1 \
        || { echo "❌ pm2 delete $PM2_NAME 失败"; exit 1; }
else
    echo "pm2 中不存在进程 $PM2_NAME（首次部署），跳过 delete"
fi
OLD_PID=$(lsof -ti :"$TARGET_PORT" 2>/dev/null || true)
if [ -n "$OLD_PID" ]; then
    echo "杀掉占用端口 $TARGET_PORT 的进程：$OLD_PID"
    kill -9 $OLD_PID 2>/dev/null || echo "WARN: kill 失败（进程可能已退出）"
fi
sleep 2

# ---- 5. 启动新进程（失败即中止 + 回滚；不再 || true 吞错）----
echo "启动 PM2 进程：$PM2_NAME (端口 $TARGET_PORT)"
cd "$TARGET_DIR"
"$PM2" start server.js --name "$PM2_NAME"

# ---- 5.5 健康检查：pm2 start 秒回成功 ≠ 服务可用（应用可能启动即崩）----
# 最多等 20 秒拿 HTTP 200；拿不到 → 判定部署失败 → 触发回滚
HEALTH_URL="http://127.0.0.1:$TARGET_PORT/ai"
HEALTH_OK=0
for i in $(seq 1 20); do
    HTTP_CODE=$(curl -s -o /dev/null -m 2 -w '%{http_code}' "$HEALTH_URL" 2>/dev/null || true)
    if [ "$HTTP_CODE" = "200" ]; then
        HEALTH_OK=1
        break
    fi
    sleep 1
done
if [ "$HEALTH_OK" -ne 1 ]; then
    echo "❌ 健康检查失败：20 秒内 $HEALTH_URL 未返回 200（应用可能启动即崩）"
    echo "--- 最近错误日志 ---"
    tail -n 10 "$PM2_HOME/logs/$PM2_NAME-error.log" 2>/dev/null || true
    false  # 显式失败：触发 ERR trap -> 自动回滚（exit 1 不触发 ERR trap）
fi
echo "健康检查通过：$HEALTH_URL = 200"

"$PM2" save >/dev/null 2>&1 || echo "WARN: pm2 save 失败（不影响本次部署，resurrect 列表未更新）"

trap - ERR
echo "✅ $ENV 环境部署完成！"
