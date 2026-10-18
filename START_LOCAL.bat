@echo off
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 (
 echo Python was not found. Open index.html directly, or install Python from python.org.
 pause
 exit /b 1
)
py -3 launch_local.py
pause
