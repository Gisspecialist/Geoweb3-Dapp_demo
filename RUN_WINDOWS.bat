@echo off
setlocal
cd /d "%~dp0"
if not exist .env copy .env.example .env

echo Starting GeoWeb3 backend on http://127.0.0.1:8080
start "GeoWeb3 Backend" cmd /k "cd /d %~dp0 && npm run backend"

timeout /t 2 >nul

echo Starting GeoWeb3 frontend on http://127.0.0.1:3000
npm run dev
