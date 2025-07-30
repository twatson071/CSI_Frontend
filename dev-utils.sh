#!/bin/bash

# CSI Frontend Development Utilities
# Common functions and utilities for dev scripts

# Colors for output
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export MAGENTA='\033[0;35m'
export CYAN='\033[0;36m'
export BOLD='\033[1m'
export NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_section() {
    echo -e "\n${BOLD}${CYAN}$1${NC}"
    echo -e "${CYAN}$(printf '=%.0s' {1..50})${NC}"
}

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check if a port is in use
port_in_use() {
    lsof -ti:$1 &> /dev/null
}

# Kill process on port
kill_port() {
    local port=$1
    if port_in_use $port; then
        print_warning "Port $port is in use. Attempting to free it..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 1
        if port_in_use $port; then
            print_error "Failed to free port $port"
            return 1
        else
            print_status "Port $port freed"
        fi
    fi
    return 0
}

# Check prerequisites
check_prerequisites() {
    local all_good=true
    
    print_section "Checking Prerequisites"
    
    # Check Bun
    if command_exists bun; then
        print_status "Bun is installed ($(bun --version))"
    else
        print_error "Bun is not installed"
        echo "   Install with: curl -fsSL https://bun.sh/install | bash"
        all_good=false
    fi
    
    # Check Node.js
    if command_exists node; then
        print_status "Node.js is installed ($(node --version))"
    else
        print_error "Node.js is not installed"
        echo "   Install from: https://nodejs.org/"
        all_good=false
    fi
    
    # Check npm
    if command_exists npm; then
        print_status "npm is installed ($(npm --version))"
    else
        print_error "npm is not installed"
        all_good=false
    fi
    
    if [ "$all_good" = false ]; then
        return 1
    fi
    return 0
}

# Wait for a service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=${2:-30}
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    return 1
}

# Show development URLs and info
show_dev_info() {
    echo ""
    print_section "Development Environment Info"
    echo -e "${BOLD}URLs:${NC}"
    echo "   Frontend:  ${CYAN}http://localhost:3002${NC}"
    echo "   Backend:   ${CYAN}http://localhost:3001${NC}"
    echo "   Mock API:  ${CYAN}http://localhost:8092${NC}"
    echo ""
    echo -e "${BOLD}Credentials:${NC}"
    echo "   Email:     ${MAGENTA}dev@localhost.com${NC}"
    echo "   Password:  ${MAGENTA}password${NC}"
    echo ""
    echo -e "${BOLD}Database:${NC}"
    echo "   Location:  CSI_API/local.db"
    echo "   Studio:    ${CYAN}cd CSI_API && bun x drizzle-kit studio${NC}"
    echo ""
}

# Show available commands
show_commands() {
    print_section "Available Commands"
    echo -e "${BOLD}Development:${NC}"
    echo "   ./start-dev.sh         - Start all services"
    echo "   ./start-dev.sh backend - Start backend only"
    echo "   ./start-dev.sh frontend- Start frontend only"
    echo "   ./start-dev.sh mock    - Start with mock service"
    echo ""
    echo -e "${BOLD}Setup & Reset:${NC}"
    echo "   ./setup-dev.sh         - Initial setup"
    echo "   ./reset-dev.sh         - Reset database"
    echo "   ./reset-dev.sh full    - Full reset (includes node_modules)"
    echo ""
    echo -e "${BOLD}Database:${NC}"
    echo "   cd CSI_API && bun run seed        - Seed database"
    echo "   cd CSI_API && bun run seed:force  - Force reseed"
    echo "   cd CSI_API && bun run verify      - Verify data"
    echo ""
}

# Export functions so they can be used by other scripts
export -f print_status print_warning print_error print_info print_section
export -f command_exists port_in_use kill_port check_prerequisites
export -f wait_for_service show_dev_info show_commands