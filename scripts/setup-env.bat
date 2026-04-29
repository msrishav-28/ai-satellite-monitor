@echo off
REM Creates local environment files for backend and the canonical /space frontend.
REM Updated in Phase 4 to stop generating files for the old /frontend app.

echo ============================================================
echo          AI Satellite Monitor - Environment Setup
echo ============================================================
echo.

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo [OK] Created backend/.env from template
) else (
    echo [INFO] backend/.env already exists, skipping
)

if not exist "space\.env.local" (
    copy "space\.env.example" "space\.env.local" >nul
    echo [OK] Created space/.env.local from template
) else (
    echo [INFO] space/.env.local already exists, skipping
)

echo.
echo 1. Edit the following files with your API keys:
echo    - backend/.env
echo    - space/.env.local
echo.
echo 2. See docs/API_KEYS_SETUP.md for provider setup details.
echo.
echo 3. Start the development servers with scripts/start-dev.bat
echo.
pause
