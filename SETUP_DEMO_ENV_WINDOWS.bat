@echo off
setlocal
cd /d "%~dp0"
echo Setting up GeoWeb3 demo environment...
copy /Y .env.demo .env >nul
if errorlevel 1 (
  echo Failed to copy .env.demo to .env
  pause
  exit /b 1
)
echo Demo .env created successfully.
echo.
echo The demo uses fake credentials and mock external services.
echo Replace .env values before real production deployment.
pause
