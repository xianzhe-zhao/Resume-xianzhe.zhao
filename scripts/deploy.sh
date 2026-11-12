#!/bin/bash
# Resume 系统部署脚本
# 用法: ./scripts/deploy.sh [test|prod]
#
# 环境:
#   test - 部署到测试环境 (192.168.50.100:3001)
#   prod - 部署到生产环境 (需手动确认)

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
SERVER_USER="xianzhe"
SERVER_HOST="192.168.50.100"
TEST_DIR="/home/xianzhe/Project/resume-test"
PROD_DIR="/home/xianzhe/Project/resume"
TEST_PORT=3004
PROD_PORT=3000
PM2_TEST_NAME="resume-test"
PM2_PROD_NAME="resume"

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请指定部署环境${NC}"
    echo "用法: $0 [test|prod]"
    exit 1
fi

ENV="$1"

# 根据环境设置变量
if [ "$ENV" = "test" ]; then
    TARGET_DIR="$TEST_DIR"
    TARGET_PORT="$TEST_PORT"
    PM2_NAME="$PM2_TEST_NAME"
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}  部署到测试环境${NC}"
    echo -e "${YELLOW}========================================${NC}"
elif [ "$ENV" = "prod" ]; then
    TARGET_DIR="$PROD_DIR"
    TARGET_PORT="$PROD_PORT"
    PM2_NAME="$PM2_PROD_NAME"
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  部署到生产环境${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    read -p "确认要部署到生产环境吗? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "已取消部署"
        exit 0
    fi
else
    echo -e "${RED}错误: 未知环境 '$ENV'${NC}"
    echo "用法: $0 [test|prod]"
    exit 1
fi

echo ""
echo "目标服务器: ${SERVER_USER}@${SERVER_HOST}"
echo "目标目录:   ${TARGET_DIR}"
echo "目标端口:   ${TARGET_PORT}"
echo "PM2 进程名: ${PM2_NAME}"
echo ""

# 检查本地文件
if [ ! -f "$PROJECT_ROOT/server.js" ]; then
    echo -e "${RED}错误: 未找到 server.js，请在项目根目录执行${NC}"
    exit 1
fi

# 创建临时打包目录
TEMP_DIR=$(mktemp -d)
echo "正在打包文件..."

# 复制必要文件（排除不需要的）
rsync -av --progress "$PROJECT_ROOT/" "$TEMP_DIR/" \
    --exclude='.git' \
    --exclude='.github' \
    --exclude='node_modules' \
    --exclude='scripts' \
    --exclude='docs' \
    --exclude='test' \
    --exclude='*.md' \
    --exclude='.gitignore' \
    --exclude='start.bat' \
    > /dev/null

# 创建 tar 包
TAR_FILE="/tmp/resume-deploy-$(date +%Y%m%d%H%M%S).tar.gz"
echo "创建压缩包: $TAR_FILE"
tar -czf "$TAR_FILE" -C "$TEMP_DIR" .
rm -rf "$TEMP_DIR"

# 上传到服务器
echo ""
echo "正在上传到服务器..."
scp "$TAR_FILE" "${SERVER_USER}@${SERVER_HOST}:/tmp/"
TAR_BASENAME=$(basename "$TAR_FILE")

# 在服务器上执行部署
echo ""
echo "正在服务器上执行部署..."
ssh "${SERVER_USER}@${SERVER_HOST}" << EOF
    set -e
    
    # 检查 pm2 是否安装
    if ! command -v pm2 &> /dev/null; then
        echo "pm2 未安装，正在安装..."
        npm install -g pm2
        # 添加到 PATH
        export PATH="\$(npm config get prefix)/bin:\$PATH"
    fi
    
    # 确保目标目录存在
    mkdir -p "$TARGET_DIR"
    
    # 备份当前版本
    if [ -d "$TARGET_DIR" ] && [ "\$(ls -A $TARGET_DIR 2>/dev/null)" ]; then
        BACKUP_DIR="\${TARGET_DIR}-backup-\$(date +%Y%m%d%H%M%S)"
        echo "备份当前版本到: \$BACKUP_DIR"
        cp -r "$TARGET_DIR" "\$BACKUP_DIR"
    fi
    
    # 解压新版本（原子替换）
    echo "解压新版本..."
    TEMP_EXTRACT="/tmp/resume-extract-\$\$"
    mkdir -p "\$TEMP_EXTRACT"
    tar -xzf "/tmp/$TAR_BASENAME" -C "\$TEMP_EXTRACT"
    
    # 原子替换目录内容
    rm -rf "$TARGET_DIR"/*
    cp -r "\$TEMP_EXTRACT"/* "$TARGET_DIR"/
    rm -rf "\$TEMP_EXTRACT"
    rm "/tmp/$TAR_BASENAME"
    
    # 设置环境变量并启动/重启服务
    cd "$TARGET_DIR"
    export PORT=$TARGET_PORT
    export ADMIN_PASSWORD=\${ADMIN_PASSWORD:-admin123}
    
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
    echo "服务地址: http://$SERVER_HOST:$TARGET_PORT"
EOF

# 清理本地临时文件
rm -f "$TAR_FILE"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署成功!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "测试地址: http://${SERVER_HOST}:${TARGET_PORT}/ai"
echo "管理后台: http://${SERVER_HOST}:${TARGET_PORT}/admin"
echo ""
echo "查看日志: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs ${PM2_NAME}'"
echo "查看状态: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 list'"
