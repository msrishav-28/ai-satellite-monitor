#!/bin/bash
#
# Starts the FastAPI backend and the canonical /space frontend for local
# development. Updated in Phase 4 to remove the stale /frontend dependency.

set -e

echo "AI Satellite Monitor - Development Setup"
echo "======================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "space" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking required tools..."

if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
    print_error "Python 3 is not installed. Please install Python 3.10+."
    exit 1
fi

if ! command -v pip3 >/dev/null 2>&1; then
    print_error "pip3 is not installed. Please install pip3."
    exit 1
fi

print_success "Required tools are available"

print_status "Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    if [ ! -f "backend/.env.example" ]; then
        print_error "backend/.env.example is missing"
        exit 1
    fi
    cp backend/.env.example backend/.env
    print_warning "Created backend/.env from backend/.env.example"
fi

if [ ! -f "space/.env.local" ]; then
    if [ ! -f "space/.env.example" ]; then
        print_error "space/.env.example is missing"
        exit 1
    fi
    cp space/.env.example space/.env.local
    print_warning "Created space/.env.local from space/.env.example"
fi

if [ ! -d "node_modules/concurrently" ]; then
    print_error "Root dependencies are missing. Run: npm install"
    exit 1
fi

if [ ! -d "space/node_modules" ]; then
    print_error "Frontend dependencies are missing. Run: npm run install:frontend"
    exit 1
fi

print_status "Starting development servers..."

cleanup() {
    print_status "Shutting down development servers..."
    jobs -p | xargs -r kill
    exit 0
}

trap cleanup SIGINT SIGTERM

print_status "Starting backend server on http://localhost:8000..."
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
cd ..

sleep 3

print_status "Starting frontend server on http://localhost:3000..."
cd space
npm run dev &
cd ..

sleep 5

print_success "Development servers started successfully"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

wait
