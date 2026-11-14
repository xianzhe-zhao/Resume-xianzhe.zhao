#!/bin/bash

PM2=/home/xianzhe/.npm/_npx/5f7878ce38f1eb13/node_modules/pm2/bin/pm2
export PM2_HOME=/home/xianzhe/.pm2
TARGET_DIR=/home/xianzhe/Project/resume-test
TARGET_PORT=3002
PM2_NAME=resume-test

echo "=== 1. 停止并清理旧进程 ==="
$PM2 delete $PM2_NAME 2>&1 || echo "PM2 进程不存在，继续..."

# 杀掉占用端口的进程
OLD_PID=$(lsof -ti :$TARGET_PORT 2>/dev/null)
if [ -n "$OLD_PID" ]; then
    echo "杀掉占用端口 $TARGET_PORT 的进程: $OLD_PID"
    kill -9 $OLD_PID 2>/dev/null || true
fi
sleep 2

echo ""
echo "=== 2. 写入 .env 文件 ==="
cat > $TARGET_DIR/.env << 'ENVEOF'
ADMIN_PASSWORD=Resume@Secure2026!
PORT=3002
ENVEOF
cat $TARGET_DIR/.env

echo ""
echo "=== 3. 启动服务 ==="
cd $TARGET_DIR
$PM2 start server.js --name $PM2_NAME 2>&1 || true

sleep 3

echo ""
echo "=== 4. 验证 ==="
$PM2 list 2>&1 | grep resume || true
echo ""
echo "HTTP 状态:"
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:$TARGET_PORT/ai
