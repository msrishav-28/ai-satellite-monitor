@echo off
echo ============================================================
echo     Environmental Intelligence Platform - Environment Setup
echo ============================================================
echo.

REM Check if .env files exist
if not exist "backend\.env" (
    echo Creating backend environment file...
    copy "backend\.env.example" "backend\.env"
    echo ✓ Created backend/.env from template
) else (
    echo ⚠ backend/.env already exists, skipping...
)

if not exist "frontend\.env.local" (
    echo Creating frontend environment file...
    copy "frontend\.env.example" "frontend\.env.local"
    echo ✓ Created frontend/.env.local from template
) else (
    echo ⚠ frontend/.env.local already exists, skipping...
)

if not exist ".env" (
    echo Creating root environment file...
    copy ".env.example" ".env"
    echo ✓ Created .env from template
) else (
    echo ⚠ .env already exists, skipping...
)

echo.
echo ============================================================
echo                    Next Steps
echo ============================================================
echo.
echo 1. Edit the following files with your API keys:
echo    - backend/.env (OpenWeatherMap, WAQI, Google Earth Engine)
echo    - frontend/.env.local (Mapbox token)
echo.
echo 2. See docs/API_KEYS_SETUP.md for detailed setup instructions
echo.
echo 3. Start the development servers:
echo    scripts/start-dev.bat
echo.
echo ============================================================

pause
