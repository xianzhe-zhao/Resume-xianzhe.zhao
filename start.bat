@echo off
chcp 936 >nul
title resume-server
cd /d "%~dp0"

echo ============================================
echo   resume server starting...
echo ============================================
echo.

where node >nul 2>nul
if %errorlevel%==0 goto found

if exist "C:\Users\xianzhe.zhao\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" goto found2

echo [error] Node.js not found
echo download: https://nodejs.org/
pause
exit /b 1

:found
set NODE_CMD=node
goto run

:found2
set "NODE_CMD=C:\Users\xianzhe.zhao\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
goto run

:run
set PORT=3000
set ADMIN_PASSWORD=admin123

echo   URL:
echo     resume:  http://localhost:%PORT%/ai
echo     admin:  http://localhost:%PORT%/admin
echo     pass:   %ADMIN_PASSWORD%
echo.
echo   Ctrl+C to stop
echo ============================================
echo.

%NODE_CMD% server.js
pause