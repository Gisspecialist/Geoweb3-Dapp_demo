@echo off
setlocal
cd /d "%~dp0"
echo Cleaning old install folders that may lock Vite or dependencies...
taskkill /F /IM node.exe >nul 2>nul
rmdir /S /Q node_modules 2>nul
del package-lock.json 2>nul
npm cache clean --force
npm config set registry https://registry.npmjs.org/
echo Installing packages from public npm registry...
npm install --registry=https://registry.npmjs.org/
echo.
echo Install complete. Now run RUN_WINDOWS.bat or npm run dev.
pause
