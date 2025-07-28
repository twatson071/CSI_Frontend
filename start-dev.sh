#!/bin/bash

# CSI Frontend Development Starter
# Enhanced script with better process management and options

# Source utilities
source "$(dirname "$0")/dev-utils.sh"

# Default settings
RUN_BACKEND=true
RUN_FRONTEND=true
RUN_MOCK=false
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        backend|--backend|-b)
            RUN_BACKEND=true
            RUN_FRONTEND=false
            shift
            ;;
        frontend|--frontend|-f)
            RUN_BACKEND=false
            RUN_FRONTEND=true
            shift
            ;;
        mock|--mock|-m)
            RUN_MOCK=true
            shift
            ;;
        verbose|--verbose|-v)
            VERBOSE=true
            shift
            ;;
        help|--help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  backend, -b    Run backend only"
            echo "  frontend, -f   Run frontend only"
            echo "  mock, -m       Also run mock external service"
            echo "  verbose, -v    Show detailed output"
            echo "  help, -h       Show this help"
            echo ""
            echo "Examples:"
            echo "  $0             # Run both backend and frontend"
            echo "  $0 backend     # Run backend only"
            echo "  $0 mock        # Run all services including mock"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
done

# Process PIDs
BACKEND_PID=""
FRONTEND_PID=""
MOCK_PID=""

# Cleanup function
cleanup() {
    echo ""
    print_info "Shutting down development servers..."
    
    # Kill processes
    [ ! -z "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null && print_status "Backend stopped"
    [ ! -z "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null && print_status "Frontend stopped"
    [ ! -z "$MOCK_PID" ] && kill $MOCK_PID 2>/dev/null && print_status "Mock service stopped"
    
    # Wait a moment for processes to terminate
    sleep 1
    
    # Force kill if still running
    [ ! -z "$BACKEND_PID" ] && kill -9 $BACKEND_PID 2>/dev/null
    [ ! -z "$FRONTEND_PID" ] && kill -9 $FRONTEND_PID 2>/dev/null
    [ ! -z "$MOCK_PID" ] && kill -9 $MOCK_PID 2>/dev/null
    
    print_status "All services stopped"
    exit
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Main execution
print_section "Starting CSI Development Environment"

# Check prerequisites
if ! check_prerequisites; then
    print_error "Prerequisites check failed. Please install missing dependencies."
    exit 1
fi

# Check and free ports if needed
if [ "$RUN_BACKEND" = true ]; then
    kill_port 3001
fi
if [ "$RUN_FRONTEND" = true ]; then
    kill_port 3002
fi
if [ "$RUN_MOCK" = true ]; then
    kill_port 8090
fi

# Start mock service if requested
if [ "$RUN_MOCK" = true ]; then
    print_info "Starting mock external service..."
    cd CSI_API
    if [ "$VERBOSE" = true ]; then
        bun run mock-service &
    else
        bun run mock-service > /dev/null 2>&1 &
    fi
    MOCK_PID=$!
    cd ..
    
    # Wait for mock service
    if wait_for_service "http://localhost:8090/health" 10; then
        print_status "Mock service started on port 8090"
    else
        print_warning "Mock service may not be ready yet"
    fi
fi

# Start backend
if [ "$RUN_BACKEND" = true ]; then
    print_info "Starting backend server..."
    cd CSI_API
    if [ "$VERBOSE" = true ]; then
        bun run dev &
    else
        bun run dev > /dev/null 2>&1 &
    fi
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend
    if wait_for_service "http://localhost:3001/health" 20; then
        print_status "Backend started on port 3001"
    else
        print_warning "Backend may not be ready yet"
    fi
fi

# Start frontend
if [ "$RUN_FRONTEND" = true ]; then
    print_info "Starting frontend server..."
    cd CSI_UI
    if [ "$VERBOSE" = true ]; then
        npm run dev &
    else
        npm run dev > /dev/null 2>&1 &
    fi
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend
    sleep 3  # Give Vite time to start
    if wait_for_service "http://localhost:3002" 20; then
        print_status "Frontend started on port 3002"
    else
        print_warning "Frontend may not be ready yet"
    fi
fi

# Show running services
echo ""
print_section "Services Running"
[ "$RUN_BACKEND" = true ] && echo -e "   Backend:   ${GREEN}✓${NC} http://localhost:3001"
[ "$RUN_FRONTEND" = true ] && echo -e "   Frontend:  ${GREEN}✓${NC} http://localhost:3002"
[ "$RUN_MOCK" = true ] && echo -e "   Mock API:  ${GREEN}✓${NC} http://localhost:8090"

# Show dev info
show_dev_info

# Instructions
echo ""
print_info "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait