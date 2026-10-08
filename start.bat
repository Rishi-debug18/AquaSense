@echo off
echo ===================================================
echo     AquaSense - Smart Water Management System
echo ===================================================
echo.

echo Starting Backend Server on http://localhost:8000 ...
start "AquaSense Backend" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --reload --port 8000"

timeout /t 2 >nul

echo Starting Frontend Dev Server on http://localhost:5173 ...
start "AquaSense Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   AquaSense is running!
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:8000/docs
echo.
echo   Demo Credentials:
echo   - Admin: admin@aquasense.demo / AquaSense@Admin2026
echo   - House H-102: h102@aquasense.demo / House@102Demo
echo   - House H-001: h001@aquasense.demo / House@001Demo
echo ===================================================
pause
