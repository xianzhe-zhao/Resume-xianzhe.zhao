# GitHub Actions 自托管 Runner CI/CD 搭建指南

> 适用于国内服务器部署 Node.js/Python 项目的完整 CI/CD 方案

---

## 📋 目录

1. [方案概述](#方案概述)
2. [前置条件](#前置条件)
3. [第一步：安装自托管 Runner](#第一步安装自托管-runner)
4. [第二步：配置 Git SSH 认证](#第二步配置-git-ssh-认证)
5. [第三步：编写 Workflow](#第三步编写-workflow)
6. [第四步：编写部署脚本](#第四步编写部署脚本)
7. [第五步：测试与验证](#第五步测试与验证)
8. [故障排查](#故障排查)
9. [完整文件清单](#完整文件清单)

---

## 方案概述

### 为什么选择自托管 Runner？

| 方案 | 优点 | 缺点 |
|---|---|---|
| **GitHub 托管 Runner** | 开箱即用 | 无法访问国内内网服务器 |
| **Tailscale + SSH** | 安全 | 配置复杂，网络不稳定 |
| **自托管 Runner** ✅ | 直接在服务器上运行，无网络问题 | 需要自己维护 Runner |

### 工作流程

```
推送代码到 main / PR 合并到 main
    ↓
GitHub Actions 检测到更新
    ↓
自托管 Runner（你的服务器）接收任务
    ↓
1. 拉取代码（git clone）
2. 运行测试
3. 测试通过 → 部署到生产目录
4. 重启服务（pm2/systemd）
5. 验证服务可访问
    ↓
✅ 部署完成
```

---

## 前置条件

### 服务器要求

- **操作系统**：Linux（Ubuntu/Debian/CentOS）
- **Node.js**：v18+（根据项目需求）
- **Python**：3.8+（如果需要运行测试）
- **pm2**：进程管理（可选，推荐）
- **Git**：已安装

### GitHub 仓库

- 仓库已创建
- 有 `main` 分支
- 有基本的测试脚本

---

## 第一步：安装自托管 Runner

### 1.1 获取 Runner Token

1. 打开 GitHub 仓库页面
2. 进入 **Settings** → **Actions** → **Runners**
3. 点击 **"New self-hosted runner"**
4. 选择 **Linux** → **x64**
5. 复制页面上显示的 token（类似 `AABCDEFGH1234567...`）

### 1.2 在服务器上安装

```bash
# SSH 登录服务器
ssh user@your-server

# 创建 runner 目录
mkdir -p ~/actions-runner && cd ~/actions-runner

# 下载 Runner（使用最新版本号）
curl -o actions-runner-linux-x64-2.338.2.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.338.2/actions-runner-linux-x64-2.338.2.tar.gz

# 解压
tar xzf ./actions-runner-linux-x64-2.338.2.tar.gz

# 配置（替换 YOUR_TOKEN 为实际 token）
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN

# 安装为服务（需要 sudo）
sudo ./svc.sh install

# 启动服务
sudo ./svc.sh start

# 检查状态
sudo ./svc.sh status
```

### 1.3 验证 Runner 在线

回到 GitHub 页面，应该能看到 Runner 状态为 **Online**（绿色）。

---

## 第二步：配置 Git SSH 认证

### 问题

Runner 拉取代码时，HTTPS 方式需要认证，但服务器没有配置 credential helper。

### 解决方案：使用 SSH 代替 HTTPS

```bash
# 创建/编辑 git 配置
cat > ~/.gitconfig << 'EOF'
[user]
    name = your-username
    email = your-email@example.com

# 使用 SSH 代替 HTTPS
[url "git@github.com:"]
    insteadOf = https://github.com/

[credential]
    helper = store
EOF
```

### 验证

```bash
# 测试 git clone
cd /tmp
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git test-clone
ls test-clone/  # 应该能看到项目文件
rm -rf test-clone
```

---

## 第三步：编写 Workflow

### 3.1 创建 Workflow 文件

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:  # 允许手动触发

jobs:
  test-and-deploy:
    name: Test & Deploy
    runs-on: self-hosted  # 使用自托管 Runner
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Run tests
        env:
          # 根据项目需要设置环境变量
          NODE_ENV: test
        run: |
          # 安装依赖（如果需要）
          # npm ci
          
          # 运行测试
          npm test
          # 或 python test/test.py

      - name: Deploy
        run: |
          set -e
          
          # ====== 配置变量（根据项目修改）======
          TARGET_DIR=/path/to/your/app  # 部署目标目录
          SERVICE_NAME=your-app         # 服务名称（pm2 或 systemd）
          
          # ====== 备份当前版本 ======
          if [ -d "$TARGET_DIR" ]; then
              BACKUP_DIR="${TARGET_DIR}-backup-$(date +%Y%m%d%H%M%S)"
              echo "备份当前版本到：$BACKUP_DIR"
              cp -r "$TARGET_DIR" "$BACKUP_DIR"
          fi
          
          # ====== 部署新版本 ======
          echo "部署新版本..."
          rsync -av --delete ./ "$TARGET_DIR/" \
            --exclude='.git' \
            --exclude='.github' \
            --exclude='node_modules' \
            --exclude='docs' \
            --exclude='test'
          
          # ====== 重启服务 ======
          cd "$TARGET_DIR"
          
          # 使用 pm2
          if command -v pm2 &> /dev/null; then
              if pm2 describe $SERVICE_NAME > /dev/null 2>&1; then
                  pm2 restart $SERVICE_NAME
              else
                  pm2 start app.js --name $SERVICE_NAME
              fi
              pm2 save
          fi
          
          # 或使用 systemd
          # sudo systemctl restart $SERVICE_NAME
          
          echo "✅ 部署完成！"

      - name: Verify deployment
        run: |
          sleep 3
          # 验证服务可访问（替换为你的 URL）
          HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
          if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ 部署验证成功：HTTP $HTTP_CODE"
          else
            echo "❌ 部署验证失败：HTTP $HTTP_CODE"
            exit 1
          fi
```

### 3.2 关键配置说明

| 配置项 | 说明 | 示例 |
|---|---|---|
| `runs-on` | 使用自托管 Runner | `self-hosted` |
| `branches` | 触发分支 | `[main]` |
| `TARGET_DIR` | 部署目标目录 | `/home/user/app` |
| `SERVICE_NAME` | 服务名称 | `my-app` |

---

## 第四步：编写部署脚本

### 4.1 创建部署脚本

创建 `scripts/deploy.sh`（用于手动部署）：

```bash
#!/bin/bash
set -e

# ====== 配置 ======
TARGET_DIR=/path/to/your/app
SERVICE_NAME=your-app
PORT=3000

# ====== 检查参数 ======
if [ -z "$1" ]; then
    echo "用法：$0 [test|prod]"
    exit 1
fi

ENV=$1

if [ "$ENV" = "prod" ]; then
    echo "⚠️  即将部署到生产环境..."
    read -p "确认？(yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "已取消"
        exit 0
    fi
fi

# ====== 备份 ======
if [ -d "$TARGET_DIR" ]; then
    BACKUP_DIR="${TARGET_DIR}-backup-$(date +%Y%m%d%H%M%S)"
    echo "备份到：$BACKUP_DIR"
    cp -r "$TARGET_DIR" "$BACKUP_DIR"
fi

# ====== 部署 ======
echo "部署新版本..."
rsync -av --delete ./ "$TARGET_DIR/" \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='node_modules'

# ====== 重启服务 ======
cd "$TARGET_DIR"
export PORT=$PORT

if command -v pm2 &> /dev/null; then
    if pm2 describe $SERVICE_NAME > /dev/null 2>&1; then
        pm2 restart $SERVICE_NAME --update-env
    else
        pm2 start app.js --name $SERVICE_NAME --update-env
    fi
    pm2 save
fi

echo "✅ 部署完成！"
echo "访问地址：http://localhost:$PORT"
```

### 4.2 添加执行权限

```bash
chmod +x scripts/deploy.sh
```

### 4.3 使用方式

```bash
# 部署到测试环境
./scripts/deploy.sh test

# 部署到生产环境（会要求确认）
./scripts/deploy.sh prod
```

---

## 第五步：测试与验证

### 5.1 本地测试

```bash
# 运行测试
npm test
# 或
python test/test.py
```

### 5.2 手动部署测试

```bash
# 部署到测试环境
./scripts/deploy.sh test

# 验证服务
curl http://localhost:3000/health
```

### 5.3 触发 CI/CD

```bash
# 提交并推送
git add .
git commit -m "feat: 添加 CI/CD 配置"
git push origin main
```

### 5.4 查看运行状态

1. 打开 GitHub 仓库页面
2. 进入 **Actions** 标签
3. 查看最新的 workflow 运行状态
4. 点击运行查看详细日志

---

## 故障排查

### 问题 1：Runner 离线

**现象**：GitHub 页面显示 Runner 为 Offline

**解决**：

```bash
# 检查 Runner 进程
ps aux | grep Runner.Listener

# 重启 Runner
cd ~/actions-runner
sudo ./svc.sh restart

# 查看日志
tail -f ~/actions-runner/_diag/Runner_*.log
```

### 问题 2：Git clone 失败

**现象**：`Failed to connect to github.com:443`

**原因**：国内网络访问 GitHub 不稳定

**解决方案 A**：等待重试（workflow 会自动重试）

**解决方案 B**：配置代理（见下方）

#### 配置 mihomo 代理

```bash
# 1. 安装 mihomo
curl -L https://github.com/MetaCubeX/mihomo/releases/latest/download/mihomo-linux-amd64-compatible.gz -o /tmp/mihomo.gz
gunzip /tmp/mihomo.gz
chmod +x /tmp/mihomo
sudo mv /tmp/mihomo /usr/local/bin/mihomo

# 2. 配置订阅
mkdir -p ~/.config/mihomo
# 将 Clash 订阅内容保存到 ~/.config/mihomo/config.yaml

# 3. 启动代理
nohup mihomo -d ~/.config/mihomo > /dev/null 2>&1 &

# 4. 配置 Git 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 5. 验证
git ls-remote https://github.com/YOUR_USERNAME/YOUR_REPO.git HEAD
```

### 问题 3：部署后服务无法访问

**检查清单**：

1. 服务是否启动：`pm2 list` 或 `systemctl status SERVICE_NAME`
2. 端口是否监听：`ss -tlnp | grep PORT`
3. 防火墙是否放行：`sudo ufw status`
4. 反向代理配置：nginx/cloudflared 配置是否正确

---

## 完整文件清单

```
your-project/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD 配置
├── scripts/
│   └── deploy.sh               # 手动部署脚本
├── src/                        # 源代码
├── test/                       # 测试文件
├── package.json                # 项目配置
└── README.md                   # 项目文档
```

---

## 安全加固（本仓库实践，2026-11-15）

> 通用教程之外，本仓库的 `scripts/ci-deploy.sh` 额外做了四层加固，可按需复制：

1. **凭据不进 git（豹豹模式）**：真实密码只存服务器 `~/.secrets/resume.env`（`ADMIN_PASSWORD=...`，`chmod 600`），部署脚本读取该文件，缺失/为空直接失败——**禁止在脚本或 workflow 里写默认密码**（仓库是 PUBLIC 时等于把密码挂公网）。
2. **fail-fast**：脚本启用 `set -euo pipefail`；rsync / `.env` 写入 / `pm2 start` 任一失败立即非零退出，让 workflow 在 Deploy 步骤标红，而不是靠后面的 curl 验证兜底（`pm2 start ... || true` 会吞掉启动失败，是反面教材）。
3. **失败自动回滚**：`trap ... ERR` 捕获部署失败 → 恢复最近一次备份目录（代码 + `.env`）→ 重启旧版本 → 非零退出。备份在部署前由脚本自动创建（保留最近 5 个）。
4. **PM2 解析健壮化**：按 `command -v pm2` → `~/.npm-global/bin/pm2` → npx 缓存三级解析；不要写死 `~/.npm/_npx/<hash>/...` 路径（hash 随 pm2 升级变化）。CLI 与 daemon 版本不一致时 pm2 打印的升级提示是警告噪音，不作失败判据；根治用 `npm install -g pm2 --prefix ~/.npm-global && pm2 update`（注意 `pm2 update` 会重启该 daemon 下**所有**进程）。
5. **进程边界**：部署脚本只操作自己的进程名，绝不 `pm2 kill` / `pm2 delete all`（同机常跑多个项目的进程）。workflow 的 Verify 步骤失败时**不要 `cat .env`**（会把密码打进 Actions 日志）。

---

## 📚 参考资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [自托管 Runner 文档](https://docs.github.com/en/actions/hosting-your-own-runners)
- [mihomo 文档](https://wiki.metacubex.one/)
- [pm2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

## 🎯 快速复制清单

### 需要修改的配置

1. **Workflow 文件**（`.github/workflows/deploy.yml`）
   - `TARGET_DIR`：部署目标目录
   - `SERVICE_NAME`：服务名称
   - 测试命令（`npm test` 或 `python test/test.py`）
   - 验证 URL

2. **部署脚本**（`scripts/deploy.sh`）
   - `TARGET_DIR`
   - `SERVICE_NAME`
   - `PORT`

3. **Git 配置**（`~/.gitconfig`）
   - `user.name`
   - `user.email`

---

**祝部署顺利！** 🚀
