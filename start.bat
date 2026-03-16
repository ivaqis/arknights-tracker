@echo off
chcp 65001 >nul
title Goyfield.moe (Local)

echo ==========================================
echo      Launch Goyfield.moe locally
echo ==========================================
echo.

echo [0/3] Checking Node.js version...
node -e "if(parseInt(process.versions.node.split('.')[0])<20)process.exit(1);" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or version is too old!
    echo Goyfield.moe requires Node.js version 20 or higher.
    echo Please go to https://nodejs.org/ and install the latest LTS version.
    echo.
    pause
    exit /b
)

echo [1/3] Installing/Checking modules...
cd arknights-backend
call npm install --quiet
cd ../arknights-tracker
call npm install --quiet
cd ..

echo.
echo [2/3] Starting servers...

start /b cmd /c "cd arknights-backend && node server.js"

cd arknights-tracker
echo.
echo [3/3] All done! 
echo The site will now open in your browser at http://localhost:5173
echo.

timeout /t 5 >nul
start http://localhost:5173

call npm run dev

pause