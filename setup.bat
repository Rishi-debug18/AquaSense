@echo off
echo ===================================================
echo     AquaSense - Initial Setup & Seed Script
echo ===================================================
echo.

cd /d %~dp0backend
if not exist ".env" (
    echo Copying .env.example to .env ...
    copy .env.example .env
)

echo.
echo [1/3] Creating Database Tables...
python scripts/create_tables.py

echo.
echo [2/3] Creating Default Admin User...
python scripts/create_admin.py

echo.
echo [3/3] Seeding Demo Data (550 households, 90-day readings, bills)...
python scripts/seed_demo_data.py

echo.
echo ===================================================
echo   Setup Complete!
echo   You can now launch the project using start.bat
echo ===================================================
pause
