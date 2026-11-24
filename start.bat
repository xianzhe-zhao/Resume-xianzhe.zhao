@echo off
chcp 65001 >nul
title resume-server
cd /d "%~dp0"

echo ============================================
echo   resume server starting...
echo ============================================
echo.

rem 优先 PATH 中的 node；否则用环境变量 NODE_EXE 指定的路径
where node >nul 2>nul
if %errorlevel%==0 goto found

if defined NODE_EXE (
    if exist "%NODE_EXE%" goto found2
)

echo [error] Node.js not found
echo download: https://nodejs.org/
echo or set NODE_EXE to your node.exe path
pause
exit /b 1

:found
set NODE_CMD=node
goto run

:found2
set "NODE_CMD=%NODE_EXE%"
goto run

:run
set PORT=3000

rem server.js 会自动读取 .env 中的 ADMIN_PASSWORD（server.js 自 v1.5.0 起拒绝 admin123）
if exist ".env" goto run_server
echo   [first run] no .env found - please set an admin password
set /p ADMIN_PASSWORD=Enter admin password: 
echo ADMIN_PASSWORD=%ADMIN_PASSWORD%> .env
echo   saved to .env (edit to change)

:run_server
echo   URL:
echo     resume:  http://localhost:%PORT%/ai
echo     admin:   http://localhost:%PORT%/admin
echo.
echo   Ctrl+C to stop
echo ============================================
echo.

%NODE_CMD% server.js
pause
