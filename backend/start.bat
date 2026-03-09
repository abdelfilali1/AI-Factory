@echo off
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080 "') do (
    taskkill /F /PID %%a >/dev/null 2>&1
)
timeout /t 1 /nobreak >/dev/null
cd /d "%~dp0.."
backend\venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8080
