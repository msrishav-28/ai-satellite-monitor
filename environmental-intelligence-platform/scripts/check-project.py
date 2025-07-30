#!/usr/bin/env python3
"""
Environmental Intelligence Platform - Project Health Check
This script verifies that all components are properly configured and ready to run.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Any

# Colors for terminal output
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def print_header(text: str):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}\n")

def print_success(text: str):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_warning(text: str):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_error(text: str):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_info(text: str):
    print(f"{Colors.BLUE}ℹ {text}{Colors.END}")

def check_file_exists(file_path: str, description: str) -> bool:
    """Check if a file exists and print status"""
    if os.path.exists(file_path):
        print_success(f"{description}: {file_path}")
        return True
    else:
        print_error(f"{description} missing: {file_path}")
        return False

def check_directory_exists(dir_path: str, description: str) -> bool:
    """Check if a directory exists and print status"""
    if os.path.isdir(dir_path):
        print_success(f"{description}: {dir_path}")
        return True
    else:
        print_error(f"{description} missing: {dir_path}")
        return False

def check_command_available(command: str) -> bool:
    """Check if a command is available in PATH"""
    try:
        subprocess.run([command, '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def check_python_package(package: str) -> bool:
    """Check if a Python package is installed"""
    try:
        __import__(package)
        return True
    except ImportError:
        return False

def check_node_package(package_json_path: str, package: str) -> bool:
    """Check if a Node.js package is installed"""
    try:
        with open(package_json_path, 'r') as f:
            package_json = json.load(f)
        
        dependencies = package_json.get('dependencies', {})
        dev_dependencies = package_json.get('devDependencies', {})
        
        return package in dependencies or package in dev_dependencies
    except (FileNotFoundError, json.JSONDecodeError):
        return False

def main():
    print_header("Environmental Intelligence Platform - Health Check")
    
    # Check if we're in the right directory
    if not os.path.exists('package.json'):
        print_error("Please run this script from the project root directory")
        sys.exit(1)
    
    issues = []
    
    # 1. Check project structure
    print_header("Project Structure")
    
    required_files = [
        ('package.json', 'Root package.json'),
        ('README.md', 'Project README'),
        ('LICENSE', 'License file'),
        ('.env.example', 'Environment example'),
        ('backend/main.py', 'Backend main file'),
        ('backend/requirements.txt', 'Backend requirements'),
        ('backend/.env.example', 'Backend environment example'),
        ('frontend/package.json', 'Frontend package.json'),
        ('frontend/.env.example', 'Frontend environment example'),
        ('frontend/next.config.js', 'Next.js config'),
        ('frontend/tailwind.config.ts', 'Tailwind config'),
    ]
    
    for file_path, description in required_files:
        if not check_file_exists(file_path, description):
            issues.append(f"Missing file: {file_path}")
    
    required_dirs = [
        ('backend/app', 'Backend app directory'),
        ('backend/app/api', 'Backend API directory'),
        ('backend/app/models', 'Backend models directory'),
        ('backend/app/services', 'Backend services directory'),
        ('backend/app/ml', 'Backend ML directory'),
        ('frontend/src', 'Frontend source directory'),
        ('frontend/src/components', 'Frontend components directory'),
        ('frontend/src/hooks', 'Frontend hooks directory'),
        ('scripts', 'Scripts directory'),
        ('docs', 'Documentation directory'),
    ]
    
    for dir_path, description in required_dirs:
        if not check_directory_exists(dir_path, description):
            issues.append(f"Missing directory: {dir_path}")
    
    # 2. Check system requirements
    print_header("System Requirements")
    
    # Check Node.js
    if check_command_available('node'):
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            version = result.stdout.strip()
            print_success(f"Node.js: {version}")
        except:
            print_error("Failed to get Node.js version")
            issues.append("Node.js version check failed")
    else:
        print_error("Node.js not found")
        issues.append("Node.js not installed")
    
    # Check Python
    if check_command_available('python'):
        try:
            result = subprocess.run(['python', '--version'], capture_output=True, text=True)
            version = result.stdout.strip()
            print_success(f"Python: {version}")
        except:
            print_error("Failed to get Python version")
            issues.append("Python version check failed")
    else:
        print_error("Python not found")
        issues.append("Python not installed")
    
    # Check npm
    if check_command_available('npm'):
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            version = result.stdout.strip()
            print_success(f"npm: {version}")
        except:
            print_error("Failed to get npm version")
            issues.append("npm version check failed")
    else:
        print_error("npm not found")
        issues.append("npm not installed")
    
    # Check pip
    if check_command_available('pip'):
        try:
            result = subprocess.run(['pip', '--version'], capture_output=True, text=True)
            version = result.stdout.strip()
            print_success(f"pip: {version}")
        except:
            print_error("Failed to get pip version")
            issues.append("pip version check failed")
    else:
        print_error("pip not found")
        issues.append("pip not installed")
    
    # 3. Check backend dependencies
    print_header("Backend Dependencies")
    
    critical_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
        'numpy',
        'pandas',
    ]
    
    for package in critical_packages:
        if check_python_package(package):
            print_success(f"Python package: {package}")
        else:
            print_error(f"Python package missing: {package}")
            issues.append(f"Missing Python package: {package}")
    
    # 4. Check frontend dependencies
    print_header("Frontend Dependencies")
    
    frontend_package_json = 'frontend/package.json'
    critical_frontend_packages = [
        'next',
        'react',
        'react-dom',
        'typescript',
        'tailwindcss',
        '@tanstack/react-query',
        'mapbox-gl',
        'framer-motion',
    ]
    
    for package in critical_frontend_packages:
        if check_node_package(frontend_package_json, package):
            print_success(f"Node.js package: {package}")
        else:
            print_error(f"Node.js package missing: {package}")
            issues.append(f"Missing Node.js package: {package}")
    
    # 5. Check environment configuration
    print_header("Environment Configuration")
    
    env_files = [
        ('.env', 'Root environment file'),
        ('backend/.env', 'Backend environment file'),
        ('frontend/.env.local', 'Frontend environment file'),
    ]
    
    for env_file, description in env_files:
        if os.path.exists(env_file):
            print_success(f"{description} exists")
        else:
            print_warning(f"{description} not found (will use defaults)")
    
    # 6. Check API endpoints
    print_header("API Endpoints")
    
    api_files = [
        ('backend/app/api/v1/endpoints/environmental.py', 'Environmental API'),
        ('backend/app/api/v1/endpoints/hazards.py', 'Hazards API'),
        ('backend/app/api/v1/endpoints/ai_insights.py', 'AI Insights API'),
        ('backend/app/api/v1/endpoints/impact.py', 'Impact Analysis API'),
        ('backend/app/api/v1/endpoints/satellite.py', 'Satellite API'),
    ]
    
    for api_file, description in api_files:
        if check_file_exists(api_file, description):
            pass
        else:
            issues.append(f"Missing API endpoint: {api_file}")
    
    # 7. Check ML models
    print_header("ML Models")
    
    ml_files = [
        ('backend/app/ml/wildfire_model.py', 'Wildfire ML Model'),
        ('backend/app/ml/flood_model.py', 'Flood ML Model'),
        ('backend/app/ml/landslide_model.py', 'Landslide ML Model'),
        ('backend/app/ml/model_manager.py', 'ML Model Manager'),
    ]
    
    for ml_file, description in ml_files:
        if check_file_exists(ml_file, description):
            pass
        else:
            issues.append(f"Missing ML model: {ml_file}")
    
    # 8. Final summary
    print_header("Health Check Summary")
    
    if not issues:
        print_success("🎉 All checks passed! The project is ready to run.")
        print_info("You can start the development servers with:")
        print_info("  Windows: scripts/start-dev.bat")
        print_info("  Linux/Mac: scripts/start-dev.sh")
    else:
        print_error(f"Found {len(issues)} issues that need attention:")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
        print_warning("\nPlease fix these issues before running the project.")
    
    print_header("Quick Start Commands")
    print_info("1. Install dependencies:")
    print("   npm install")
    print("   cd frontend && npm install && cd ..")
    print("   cd backend && pip install -r requirements.txt && cd ..")
    print_info("2. Configure environment:")
    print("   Copy .env.example to .env and edit with your API keys")
    print("   Copy backend/.env.example to backend/.env")
    print("   Copy frontend/.env.example to frontend/.env.local")
    print_info("3. Start development servers:")
    print("   scripts/start-dev.bat (Windows)")
    print("   scripts/start-dev.sh (Linux/Mac)")
    
    return len(issues) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
