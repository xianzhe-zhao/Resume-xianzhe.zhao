@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Resume 系统部署脚本 (Windows 版)
:: 用法: scripts\deploy.bat [test|prod]

:: 配置
set SERVER_USER=xianzhe
set SERVER_HOST=192.168.50.100
set TEST_DIR=/home/xianzhe/Project/resume-test
set PROD_DIR=/home/xianzhe/Project/resume
set TEST_PORT=3004
set PROD_PORT=3000
set PM2_TEST_NAME=resume-test
set PM2_PROD_NAME=resume

:: 项目根目录
set PROJECT_ROOT=%~dp0..

:: 检查参数
if "%1"=="" (
    echo [错误] 请指定部署环境
    echo 用法: %0 [test^|prod]
    exit /b 1
)

set ENV=%1

:: 根据环境设置变量
if "%ENV%"=="test" (
    set TARGET_DIR=%TEST_DIR%
    set TARGET_PORT=%TEST_PORT%
    set PM2_NAME=%PM2_TEST_NAME%
    echo ========================================
    echo   部署到测试环境
    echo ========================================
) else if "%ENV%"=="prod" (
    set TARGET_DIR=%PROD_DIR%
    set TARGET_PORT=%PROD_PORT%
    set PM2_NAME=%PM2_PROD_NAME%
    echo ========================================
    echo   部署到生产环境
    echo ========================================
    echo.
    set /p confirm=确认要部署到生产环境吗? (yes/no): 
    if /i not "!confirm!"=="yes" (
        echo 已取消部署
        exit /b 0
    )
) else (
    echo [错误] 未知环境 '%ENV%'
    echo 用法: %0 [test^|prod]
    exit /b 1
)

echo.
echo 目标服务器: %SERVER_USER%@%SERVER_HOST%
echo 目标目录:   %TARGET_DIR%
echo 目标端口:   %TARGET_PORT%
echo PM2 进程名: %PM2_NAME%
echo.

:: 检查本地文件
if not exist "%PROJECT_ROOT%\server.js" (
    echo [错误] 未找到 server.js
    exit /b 1
)

:: 创建临时目录
set TEMP_DIR=%TEMP%\resume-deploy-%RANDOM%
mkdir "%TEMP_DIR%"

echo 正在打包文件...

:: 复制必要文件
robocopy "%PROJECT_ROOT%" "%TEMP_DIR%" /E /XD .git .github node_modules scripts docs test /XF *.md .gitignore start.bat >nul

:: 使用 tar 创建压缩包 (Windows 10+ 自带)
set TAR_FILE=%TEMP%\resume-deploy-%RANDOM%.tar.gz
echo 创建压缩包...

:: 先创建 tar，再用 gzip（如果没有 gzip，直接传 tar）
cd /d "%TEMP_DIR%"
tar -cf "%TEMP%\resume-deploy.tar" .
cd /d "%PROJECT_ROOT%"

:: 检查是否有 gzip
where gzip >nul 2>nul
if %errorlevel%==0 (
    gzip -c "%TEMP%\resume-deploy.tar" > "%TAR_FILE%"
    del "%TEMP%\resume-deploy.tar"
) else (
    set TAR_FILE=%TEMP%\resume-deploy.tar
)

:: 上传到服务器
echo 正在上传到服务器...
scp "%TAR_FILE%" %SERVER_USER%@%SERVER_HOST%:/tmp/
if %errorlevel% neq 0 (
    echo [错误] 上传失败
    rmdir /s /q "%TEMP_DIR%"
    del "%TAR_FILE%" 2>nul
    exit /b 1
)

:: 获取 tar 文件名
for %%f in ("%TAR_FILE%") do set TAR_BASENAME=%%~nxf

:: 在服务器上执行部署
echo 正在服务器上执行部署...
ssh %SERVER_USER%@%SERVER_HOST% "bash -s" < "%~dp0\deploy-remote.sh" "%TARGET_DIR%" "%TARGET_PORT%" "%PM2_NAME%" "%TAR_BASENAME%"

:: 清理本地临时文件
rmdir /s /q "%TEMP_DIR%"
del "%TAR_FILE%" 2>nul

echo.
echo ========================================
echo   部署成功!
echo ========================================
echo.
echo 测试地址: http://%SERVER_HOST%:%TARGET_PORT%/ai
echo 管理后台: http://%SERVER_HOST%:%TARGET_PORT%/admin
echo.
echo 查看日志: ssh %SERVER_USER%@%SERVER_HOST% "pm2 logs %PM2_NAME%"
echo 查看状态: ssh %SERVER_USER%@%SERVER_HOST% "pm2 list"

endlocal
