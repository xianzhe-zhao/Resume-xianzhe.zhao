#!/bin/bash
# 远程部署脚本 - 在服务器上执行
# 由 deploy.sh 或 deploy.bat 调用

set -e

TARGET_DIR="$1"
TARGET_PORT="$2"
PM2_NAME="$3"
TAR_BASENAME="$4"

if [ -z "$TARGET_DIR" ] || [ -z "$TARGET_PORT" ] || [ -z "$PM2_NAME" ] || [ -z "$TAR_BASENAME" ]; then
    echo "错误: 参数不完整"
    echo "用法: $0 <target_dir> <port> <pm2_name> <tar_basename>"
    exit 1
fi

# 检查 pm2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "pm2 未安装，正在安装..."
    npm install -g pm2
    # 添加到 PATH
    export PATH="$(npm config get prefix)/bin:$PATH"
fi

# 确保目标目录存在
mkdir -p "$TARGET_DIR"

# 备份当前版本
if [ -d "$TARGET_DIR" ] && [ "$(ls -A $TARGET_DIR 2>/dev/null)" ]; then
    BACKUP_DIR="${TARGET_DIR}-backup-$(date +%Y%m%d%H%M%S)"
    echo "备份当前版本到: $BACKUP_DIR"
    cp -r "$TARGET_DIR" "$BACKUP_DIR"
fi

# 解压新版本
echo "解压新版本..."
TEMP_EXTRACT="/tmp/resume-extract-$$"
mkdir -p "$TEMP_EXTRACT"

# 判断是 tar 还是 tar.gz
if [[ "$TAR_BASENAME" == *.gz ]]; then
    tar -xzf "/tmp/$TAR_BASENAME" -C "$TEMP_EXTRACT"
else
    tar -xf "/tmp/$TAR_BASENAME" -C "$TEMP_EXTRACT"
fi

# 原子替换目录内容
rm -rf "$TARGET_DIR"/*
cp -r "$TEMP_EXTRACT"/* "$TARGET_DIR"/
rm -rf "$TEMP_EXTRACT"
rm "/tmp/$TAR_BASENAME"

# 设置环境变量并启动/重启服务
cd "$TARGET_DIR"
export PORT=$TARGET_PORT
export ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}

# 检查 pm2 中是否已有该进程
if pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
    echo "重启 PM2 进程: $PM2_NAME"
    pm2 restart "$PM2_NAME" --update-env
else
    echo "启动新的 PM2 进程: $PM2_NAME"
    pm2 start server.js --name "$PM2_NAME" --update-env
fi

# 保存 PM2 配置
pm2 save

echo ""
echo "部署完成!"
