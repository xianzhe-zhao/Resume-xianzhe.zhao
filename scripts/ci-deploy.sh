#!/bin/bash
# CI/CD 部署脚本
# 用法：./ci-deploy.sh [test|prod]

ENV=$1
if [ -z "$ENV" ]; then
    echo "用法：$0 [test|prod]"
    exit 1
fi

PM2=/home/xianzhe/.npm/_npx/5f7878ce38f1eb13/node_modules/pm2/bin/pm2
export PM2_HOME=/home/xianzhe/.pm2

if [ "$ENV" = "test" ]; then
    TARGET_DIR=/home/xianzhe/Project/resume-test
    TARGET_PORT=3002
    PM2_NAME=resume-test
    ADMIN_PASSWORD=${ADMIN_PASSWORD:-Resume@Secure2026!}
elif [ "$ENV" = "prod" ]; then
    TARGET_DIR=/home/xianzhe/Project/resume
    TARGET_PORT=3000
    PM2_NAME=resume
    ADMIN_PASSWORD=${ADMIN_PASSWORD:-Resume@Secure2026!}
else
    echo "未知环境：$ENV"
    exit 1
fi

echo "=== 部署到 $ENV 环境 ==="

# 1. 备份当前版本
if [ -d "$TARGET_DIR" ] && [ "$(ls -A $TARGET_DIR 2>/dev/null)" ]; then
    BACKUP_DIR="${TARGET_DIR}-backup-$(date +%Y%m%d%H%M%S)"
    echo "备份当前版本到：$BACKUP_DIR"
    cp -r "$TARGET_DIR" "$BACKUP_DIR"
    # 清理旧备份，保留最近 5 个
    ls -dt ${TARGET_DIR}-backup-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true
fi

# 2. 部署：同步文件
echo "部署新版本到 $ENV 环境..."
rsync -av --delete ./ "$TARGET_DIR/" \
    --exclude='.git' --exclude='.github' --exclude='node_modules' \
    --exclude='docs' --exclude='test' --exclude='*.md' \
    --exclude='.gitignore' --exclude='scripts'

# 3. 写入 .env 文件
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD" > "$TARGET_DIR/.env"
echo "PORT=$TARGET_PORT" >> "$TARGET_DIR/.env"
echo ".env 文件已写入"

# 4. 停止旧进程
echo "停止旧进程..."
$PM2 delete $PM2_NAME >/dev/null 2>&1 || true
OLD_PID=$(lsof -ti :$TARGET_PORT 2>/dev/null)
if [ -n "$OLD_PID" ]; then
    echo "杀掉占用端口 $TARGET_PORT 的进程：$OLD_PID"
    kill -9 $OLD_PID 2>/dev/null || true
fi
sleep 2

# 5. 启动新进程
echo "启动 PM2 进程：$PM2_NAME (端口 $TARGET_PORT)"
cd "$TARGET_DIR"
$PM2 start server.js --name $PM2_NAME 2>&1 || true
$PM2 save 2>&1 || true

echo "✅ $ENV 环境部署完成！"
