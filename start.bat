@echo off
cd /d "%~dp0"

echo Checking for node_modules...
if not exist "node_modules" (
    echo node_modules not found, installing dependencies...
    npm install
)

echo Starting bot.js...
node bot.js

pause
