@echo off
setlocal
cd /d "%~dp0"
if not exist .env copy /Y .env.demo .env >nul
if not exist node_modules (
  echo node_modules was not found. Installing dependencies from public npm registry...
  call npm install --registry=https://registry.npmjs.org/
  if errorlevel 1 (
    echo npm install failed. Check your internet connection or proxy settings.
    pause
    exit /b 1
  )
)
echo Starting GeoWeb3 demo backend at http://127.0.0.1:8080
echo OTP codes will print in this terminal in demo mode.
npm run backend
