@echo off
setlocal enabledelayedexpansion

REM Starts the FastAPI backend and the canonical /space frontend for local
REM development. Updated in Phase 4 to remove stale /frontend references.

echo.
echo AI Satellite Monitor - Development Setup
echo =======================================
echo.

if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

if not exist "backend" (
    echo [ERROR] backend directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

if not exist "space" (
    echo [ERROR] space directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+.
    pause
    exit /b 1
)

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.10+.
    pause
    exit /b 1
)

if not exist "backend\.env" (
    if not exist "backend\.env.example" (
        echo [ERROR] backend\.env.example is missing.
        pause
        exit /b 1
    )
    copy "backend\.env.example" "backend\.env" >nul
    echo [WARN] Created backend/.env from backend/.env.example
)

if not exist "space\.env.local" (
    if not exist "space\.env.example" (
        echo [ERROR] space\.env.example is missing.
        pause
        exit /b 1
    )
    copy "space\.env.example" "space\.env.local" >nul
    echo [WARN] Created space/.env.local from space/.env.example
)

if not exist "node_modules\concurrently" (
    echo [ERROR] Root dependencies are missing. Run npm install first.
    pause
    exit /b 1
)

if not exist "space\node_modules" (
    echo [ERROR] Frontend dependencies are missing. Run npm run install:frontend first.
    pause
    exit /b 1
)

echo [INFO] Starting backend server on http://localhost:8000...
start "Backend Server" cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [INFO] Starting frontend server on http://localhost:3000...
start "Frontend Server" cmd /k "cd space && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo [OK] Development servers started successfully.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Close the spawned terminal windows to stop the services.
echo.
pause
