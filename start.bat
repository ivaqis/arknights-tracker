@echo off
chcp 65001 >nul
title Launch Goyfield.moe

echo ==========================================
echo      Launch Goyfield.moe (Local)
echo ==========================================
echo.

echo [1/3] Starting backend...
cd arknights-backend
call npm install
start "Goyfield Backend" cmd /k "node server.js"
cd ..

echo.
echo [2/3] Starting frontend...
cd arknights-tracker
call npm install
start "Goyfield Frontend" cmd /k "npm run dev"
cd ..

echo.
echo [3/3] All done! 
echo The site will now open in your browser at http://localhost:5173
echo (Do not close the terminal windows while using the site!)
echo.

timeout /t 3 >nul
start http://localhost:5173