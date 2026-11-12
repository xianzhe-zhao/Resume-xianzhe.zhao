#!/bin/bash
PM2=/home/xianzhe/.npm/_npx/5f7878ce38f1eb13/node_modules/pm2/bin/pm2
export PM2_HOME=/home/xianzhe/.pm2

# 备份当前版本
echo "备份当前版本..."
BACKUP_DIR="/home/xianzhe/Project/resume-backup-$(date +%Y%m%d%H%M%S)"
cp -r /home/xianzhe/Project/resume "$BACKUP_DIR"

# 解压新版本
echo "解压新版本..."
cd /home/xianzhe/Project/resume
rm -rf *
tar -xf /tmp/resume-deploy.tar

# 重启服务
echo "重启服务..."
$PM2 stop resume 2>/dev/null || true
$PM2 delete resume 2>/dev/null || true

# 设置环境变量
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-Resume@Secure2026!}"
export PORT=3000

$PM2 start server.js --name resume
$PM2 save

sleep 2
echo ""
echo "=== 服务状态 ==="
$PM2 list | grep resume

echo ""
echo "=== 健康检查 ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000/ai
