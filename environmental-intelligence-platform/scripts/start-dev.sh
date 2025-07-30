#!/bin/bash

# Environmental Intelligence Platform - Development Startup Script
# This script starts both frontend and backend in development mode

set -e

echo "🌍 Environmental Intelligence Platform - Development Setup"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check for required tools
print_status "Checking required tools..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.9+ and try again."
    exit 1
fi

# Check pip
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip3 and try again."
    exit 1
fi

print_success "All required tools are available"

# Check environment files
print_status "Checking environment configuration..."

if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your API keys before continuing"
    else
        print_error ".env.example file not found"
        exit 1
    fi
fi

if [ ! -f "backend/.env" ]; then
    print_warning "backend/.env file not found. Creating from backend/.env.example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        print_warning "Please edit backend/.env file with your configuration"
    else
        print_error "backend/.env.example file not found"
        exit 1
    fi
fi

if [ ! -f "frontend/.env.local" ]; then
    print_warning "frontend/.env.local file not found. Creating from frontend/.env.example..."
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env.local
        print_warning "Please edit frontend/.env.local file with your API keys"
    else
        print_error "frontend/.env.example file not found"
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

print_success "All dependencies installed"

# Check database connection (optional)
print_status "Checking database connection..."
if command -v psql &> /dev/null; then
    # Try to connect to PostgreSQL
    if psql -h localhost -U postgres -c "SELECT 1;" &> /dev/null; then
        print_success "PostgreSQL connection successful"
    else
        print_warning "PostgreSQL connection failed. Make sure PostgreSQL is running."
        print_warning "You can start PostgreSQL with: sudo service postgresql start"
    fi
else
    print_warning "PostgreSQL client not found. Install with: sudo apt-get install postgresql-client"
fi

# Check Redis connection (optional)
print_status "Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        print_success "Redis connection successful"
    else
        print_warning "Redis connection failed. Make sure Redis is running."
        print_warning "You can start Redis with: sudo service redis-server start"
    fi
else
    print_warning "Redis client not found. Install with: sudo apt-get install redis-tools"
fi

# Start services
print_status "Starting development servers..."

# Function to cleanup background processes
cleanup() {
    print_status "Shutting down development servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend
print_status "Starting backend server on http://localhost:8000..."
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
print_status "Starting frontend server on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

print_success "Development servers started successfully!"
echo ""
echo "🌍 Environmental Intelligence Platform is now running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop the servers
wait
