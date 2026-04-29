#!/usr/bin/env python3
"""
Project health check for the tracked backend and canonical /space frontend.

Updated in Phase 4 to validate the current repository layout instead of the
removed /frontend assumptions.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys


class Colors:
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    END = "\033[0m"


def print_header(text: str) -> None:
    rule = "=" * 60
    print(f"\n{Colors.BOLD}{Colors.CYAN}{rule}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{rule}{Colors.END}\n")


def print_success(text: str) -> None:
    print(f"{Colors.GREEN}[OK] {text}{Colors.END}")


def print_warning(text: str) -> None:
    print(f"{Colors.YELLOW}[WARN] {text}{Colors.END}")


def print_error(text: str) -> None:
    print(f"{Colors.RED}[ERR] {text}{Colors.END}")


def print_info(text: str) -> None:
    print(f"{Colors.BLUE}[INFO] {text}{Colors.END}")


def check_file_exists(path: str, label: str) -> bool:
    if os.path.exists(path):
        print_success(f"{label}: {path}")
        return True
    print_error(f"{label} missing: {path}")
    return False


def check_directory_exists(path: str, label: str) -> bool:
    if os.path.isdir(path):
        print_success(f"{label}: {path}")
        return True
    print_error(f"{label} missing: {path}")
    return False


def resolve_command(command: str) -> str | None:
    for candidate in (command, f"{command}.cmd", f"{command}.exe"):
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    return None


def check_command_available(command: str) -> bool:
    try:
        if command == "python":
            subprocess.run([sys.executable, "--version"], capture_output=True, check=True)
            return True

        if command == "pip":
            subprocess.run([sys.executable, "-m", "pip", "--version"], capture_output=True, check=True)
            return True

        resolved = resolve_command(command)
        if not resolved:
            return False

        subprocess.run([resolved, "--version"], capture_output=True, check=True)
        return True
    except subprocess.CalledProcessError:
        return False


def get_command_version(command: str) -> str:
    if command == "python":
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True, check=True)
        return (result.stdout or result.stderr).strip()

    if command == "pip":
        result = subprocess.run([sys.executable, "-m", "pip", "--version"], capture_output=True, text=True, check=True)
        return (result.stdout or result.stderr).strip()

    resolved = resolve_command(command)
    if not resolved:
        raise FileNotFoundError(command)

    result = subprocess.run([resolved, "--version"], capture_output=True, text=True, check=True)
    return (result.stdout or result.stderr).strip()


def check_python_package(package: str) -> bool:
    try:
        __import__(package)
        return True
    except ImportError:
        return False


def check_node_package(package_json_path: str, package: str) -> bool:
    try:
        with open(package_json_path, "r", encoding="utf-8") as handle:
            package_json = json.load(handle)
    except (FileNotFoundError, json.JSONDecodeError):
        return False

    dependencies = package_json.get("dependencies", {})
    dev_dependencies = package_json.get("devDependencies", {})
    return package in dependencies or package in dev_dependencies


def main() -> int:
    print_header("AI Satellite Monitor - Health Check")

    if not os.path.exists("package.json"):
        print_error("Please run this script from the project root directory.")
        return 1

    issues: list[str] = []

    print_header("Project Structure")

    required_files = [
        ("package.json", "Root package.json"),
        ("README.md", "Project README"),
        ("backend/main.py", "Backend main file"),
        ("backend/requirements.txt", "Backend requirements"),
        ("backend/.env.example", "Backend environment example"),
        ("space/package.json", "Frontend package.json"),
        ("space/.env.example", "Frontend environment example"),
        ("space/next.config.ts", "Next.js config"),
        ("space/src/app/globals.css", "Frontend design tokens"),
    ]

    for path, label in required_files:
        if not check_file_exists(path, label):
            issues.append(f"Missing file: {path}")

    required_dirs = [
        ("backend/app", "Backend app directory"),
        ("backend/app/api", "Backend API directory"),
        ("backend/app/models", "Backend models directory"),
        ("backend/app/services", "Backend services directory"),
        ("backend/app/ml", "Backend ML directory"),
        ("space/src", "Frontend source directory"),
        ("space/src/components", "Frontend components directory"),
        ("space/src/hooks", "Frontend hooks directory"),
        ("space/src/store", "Frontend state directory"),
        ("scripts", "Scripts directory"),
        ("docs", "Documentation directory"),
    ]

    for path, label in required_dirs:
        if not check_directory_exists(path, label):
            issues.append(f"Missing directory: {path}")

    print_header("System Requirements")

    for command in ("node", "python", "npm", "pip"):
        if check_command_available(command):
            print_success(f"{command}: {get_command_version(command)}")
        else:
            print_error(f"{command} not found")
            issues.append(f"Missing command: {command}")

    print_header("Backend Dependencies")

    for package in ("fastapi", "uvicorn", "sqlalchemy", "pydantic", "numpy", "pandas"):
        if check_python_package(package):
            print_success(f"Python package: {package}")
        else:
            print_error(f"Python package missing: {package}")
            issues.append(f"Missing Python package: {package}")

    print_header("Frontend Dependencies")

    for package in ("next", "react", "react-dom", "typescript", "tailwindcss", "@tanstack/react-query", "mapbox-gl", "framer-motion"):
        if check_node_package("space/package.json", package):
            print_success(f"Node.js package: {package}")
        else:
            print_error(f"Node.js package missing: {package}")
            issues.append(f"Missing Node.js package: {package}")

    print_header("Environment Configuration")

    for path, label in (("backend/.env", "Backend environment file"), ("space/.env.local", "Frontend environment file")):
        if os.path.exists(path):
            print_success(f"{label} exists")
        else:
            print_warning(f"{label} not found")

    print_header("API Endpoints")

    for path, label in (
        ("backend/app/api/v1/endpoints/environmental.py", "Environmental API"),
        ("backend/app/api/v1/endpoints/hazards.py", "Hazards API"),
        ("backend/app/api/v1/endpoints/ai_insights.py", "AI insights API"),
        ("backend/app/api/v1/endpoints/impact.py", "Impact API"),
        ("backend/app/api/v1/endpoints/satellite.py", "Satellite API"),
        ("backend/app/api/v1/endpoints/map_layers.py", "Map layer API"),
    ):
        if not check_file_exists(path, label):
            issues.append(f"Missing API endpoint: {path}")

    print_header("Frontend Routes")

    for path in (
        "space/src/app/page.tsx",
        "space/src/app/dashboard/page.tsx",
        "space/src/app/monitor/page.tsx",
        "space/src/app/analysis/page.tsx",
    ):
        if not check_file_exists(path, f"Route {path}"):
            issues.append(f"Missing route: {path}")

    print_header("Health Check Summary")

    if issues:
        print_error(f"Found {len(issues)} issues:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print_success("All checks passed.")

    print_header("Quick Start")
    print_info("1. npm install")
    print_info("2. npm run install:frontend")
    print_info("3. cd backend && pip install -r requirements.txt && cd ..")
    print_info("4. copy backend/.env.example backend/.env")
    print_info("5. copy space/.env.example space/.env.local")
    print_info("6. npm run dev:full")

    return 0 if not issues else 1


if __name__ == "__main__":
    sys.exit(main())
