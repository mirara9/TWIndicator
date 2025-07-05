@echo off
REM XAUUSD Live Trading Chart - Windows Startup Script
REM This script starts a local HTTP server for the web application

echo ================================================
echo  XAUUSD Live Trading Chart Web Application
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

REM Get Python version
for /f "tokens=2 delims= " %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Python version: %PYTHON_VERSION%

REM Change to webapp directory
cd /d "%~dp0"
echo Current directory: %CD%

REM Check if index.html exists
if not exist "index.html" (
    echo ERROR: index.html not found in current directory
    echo Please make sure you're running this script from the webapp folder
    pause
    exit /b 1
)

REM Find available port
set PORT=8080
echo.
echo Checking for available port...

REM Try different ports if 8080 is busy
netstat -an | findstr ":8080" >nul
if %errorlevel% equ 0 (
    set PORT=8081
    netstat -an | findstr ":8081" >nul
    if %errorlevel% equ 0 (
        set PORT=8082
        netstat -an | findstr ":8082" >nul
        if %errorlevel% equ 0 (
            set PORT=8083
        )
    )
)

echo Using port: %PORT%
echo.

REM Start the server
echo Starting HTTP server...
echo.
echo ================================================
echo  Server Information
echo ================================================
echo  Local URL:     http://localhost:%PORT%
echo  Network URL:   http://%COMPUTERNAME%:%PORT%
echo  Directory:     %CD%
echo ================================================
echo.
echo Server is running. Press Ctrl+C to stop.
echo.

REM Start Python HTTP server (compatible with both Python 2 and 3)
python -c "import sys; sys.exit(0 if sys.version_info[0] == 3 else 1)" >nul 2>&1
if %errorlevel% equ 0 (
    REM Python 3
    python -m http.server %PORT%
) else (
    REM Python 2
    python -m SimpleHTTPServer %PORT%
)

REM If server stops, pause to show any error messages
echo.
echo Server stopped.
pause