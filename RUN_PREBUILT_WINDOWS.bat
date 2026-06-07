@echo off
setlocal
cd /d "%~dp0"
echo Starting GeoWeb3 frontend from the included prebuilt dist folder.
echo This does NOT require npm install, Vite, or node_modules.
node scripts\serve-dist.mjs
pause
