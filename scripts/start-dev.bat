@echo off
setlocal enabledelayedexpansion

REM Environmental Intelligence Platform - Development Startup Script (Windows)
REM This script starts both frontend and backend in development mode

echo.
echo 🌍 Environmental Intelligence Platform - Development Setup
echo =========================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "backend" (
    echo [ERROR] backend directory not found. Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] frontend directory not found. Please run this script from the project root directory
    pause
    exit /b 1
)

echo [INFO] Checking required tools...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.9+ and try again.
    pause
    exit /b 1
)

REM Check pip
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip is not installed. Please install pip and try again.
    pause
    exit /b 1
)

echo [SUCCESS] All required tools are available
echo.

echo [INFO] Checking environment configuration...

REM Check environment files
if not exist ".env" (
    echo [WARNING] .env file not found. Creating from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [WARNING] Please edit .env file with your API keys before continuing
    ) else (
        echo [ERROR] .env.example file not found
        pause
        exit /b 1
    )
)

if not exist "backend\.env" (
    echo [WARNING] backend\.env file not found. Creating from backend\.env.example...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo [WARNING] Please edit backend\.env file with your configuration
    ) else (
        echo [ERROR] backend\.env.example file not found
        pause
        exit /b 1
    )
)

if not exist "frontend\.env.local" (
    echo [WARNING] frontend\.env.local file not found. Creating from frontend\.env.example...
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env.local" >nul
        echo [WARNING] Please edit frontend\.env.local file with your API keys
    ) else (
        echo [ERROR] frontend\.env.example file not found
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Installing dependencies...

REM Install root dependencies
echo [INFO] Installing root dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd backend
call pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo [SUCCESS] All dependencies installed
echo.

echo [INFO] Starting development servers...
echo.

REM Start backend in a new window
echo [INFO] Starting backend server on http://localhost:8000...
start "Backend Server" cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo [INFO] Starting frontend server on http://localhost:3000...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo [SUCCESS] Development servers started successfully!
echo.
echo 🌍 Environmental Intelligence Platform is now running:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo Both servers are running in separate windows.
echo Close the server windows to stop the services.
echo.
echo Press any key to exit this script...
pause >nul
