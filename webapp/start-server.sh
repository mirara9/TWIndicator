#!/bin/bash

# XAUUSD Live Trading Chart - Linux/macOS Startup Script
# This script starts a local HTTP server for the web application

echo "================================================"
echo "  XAUUSD Live Trading Chart Web Application"
echo "================================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
port_available() {
    local port=$1
    ! netstat -tuln 2>/dev/null | grep -q ":$port " && ! ss -tuln 2>/dev/null | grep -q ":$port "
}

# Function to get local IP address
get_local_ip() {
    local ip
    # Try different methods to get IP
    if command_exists ip; then
        ip=$(ip route get 1 2>/dev/null | grep -oP 'src \K\S+')
    elif command_exists ifconfig; then
        ip=$(ifconfig | grep -E 'inet.*broadcast' | awk '{print $2}' | head -1)
    elif command_exists hostname; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    echo "${ip:-localhost}"
}

# Change to script directory
cd "$(dirname "$0")"

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo -e "${RED}ERROR: index.html not found in current directory${NC}"
    echo "Please make sure you're running this script from the webapp folder"
    exit 1
fi

echo "Current directory: $(pwd)"

# Find available port
PORT=8080
echo
echo "Checking for available port..."

for port in 8080 8081 8082 8083 8084 8085; do
    if port_available $port; then
        PORT=$port
        break
    fi
done

echo -e "${GREEN}Using port: $PORT${NC}"
echo

# Determine which server to use
SERVER_CMD=""
SERVER_TYPE=""

if command_exists python3; then
    SERVER_CMD="python3 -m http.server $PORT"
    SERVER_TYPE="Python 3"
elif command_exists python; then
    # Check if it's Python 2 or 3
    if python -c "import sys; exit(0 if sys.version_info[0] == 3 else 1)" 2>/dev/null; then
        SERVER_CMD="python -m http.server $PORT"
        SERVER_TYPE="Python 3"
    else
        SERVER_CMD="python -m SimpleHTTPServer $PORT"
        SERVER_TYPE="Python 2"
    fi
elif command_exists node; then
    if command_exists npx; then
        SERVER_CMD="npx http-server -p $PORT -c-1"
        SERVER_TYPE="Node.js (http-server)"
    else
        echo -e "${YELLOW}Node.js found but npx not available. Install http-server globally:${NC}"
        echo "npm install -g http-server"
        echo
    fi
elif command_exists php; then
    SERVER_CMD="php -S localhost:$PORT"
    SERVER_TYPE="PHP"
elif command_exists ruby; then
    SERVER_CMD="ruby -run -e httpd . -p $PORT"
    SERVER_TYPE="Ruby"
fi

if [ -z "$SERVER_CMD" ]; then
    echo -e "${RED}ERROR: No suitable HTTP server found${NC}"
    echo
    echo "Please install one of the following:"
    echo "  • Python 3:     sudo apt-get install python3"
    echo "  • Python 2:     sudo apt-get install python"
    echo "  • Node.js:      sudo apt-get install nodejs npm"
    echo "  • PHP:          sudo apt-get install php"
    echo "  • Ruby:         sudo apt-get install ruby"
    echo
    exit 1
fi

# Get local IP for network access
LOCAL_IP=$(get_local_ip)

# Start the server
echo "Starting HTTP server using $SERVER_TYPE..."
echo
echo "================================================"
echo "  Server Information"
echo "================================================"
echo -e "  Local URL:     ${BLUE}http://localhost:$PORT${NC}"
echo -e "  Network URL:   ${BLUE}http://$LOCAL_IP:$PORT${NC}"
echo -e "  Directory:     ${GREEN}$(pwd)${NC}"
echo -e "  Server Type:   ${YELLOW}$SERVER_TYPE${NC}"
echo "================================================"
echo

# Try to open browser (optional)
if command_exists xdg-open; then
    echo "Opening browser..."
    xdg-open "http://localhost:$PORT" >/dev/null 2>&1 &
elif command_exists open; then
    echo "Opening browser..."
    open "http://localhost:$PORT" >/dev/null 2>&1 &
fi

echo -e "${GREEN}Server is running. Press Ctrl+C to stop.${NC}"
echo

# Set up signal handlers for clean shutdown
trap 'echo -e "\n${YELLOW}Shutting down server...${NC}"; exit 0' INT TERM

# Start the server
eval $SERVER_CMD