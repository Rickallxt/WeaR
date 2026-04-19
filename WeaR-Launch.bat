@echo off
setlocal enabledelayedexpansion
cd /d "D:\Claude WeaR"

:: Check if already running
curl -s --connect-timeout 1 --max-time 2 http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 goto :open

:: Start the dev server minimised
start "WeaR Server" /min cmd /c "node dev.mjs > .dev-stdout.log 2>.dev-stderr.log"

:: Wait up to 25 seconds for it to come up
for /l %%i in (1,1,25) do (
    timeout /t 1 /nobreak >nul
    curl -s --connect-timeout 1 --max-time 1 http://localhost:5173 >nul 2>&1
    if !errorlevel! equ 0 goto :open
)

:open
start "" "http://localhost:5173"
exit /b 0
