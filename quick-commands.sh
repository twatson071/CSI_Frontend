#!/bin/bash

# CSI Frontend Quick Commands
# Helpful shortcuts for common development tasks

# Source utilities
source "$(dirname "$0")/dev-utils.sh"

# Function to show menu
show_menu() {
    print_section "CSI Quick Commands"
    echo "1) Start Development Environment"
    echo "2) Start Backend Only"
    echo "3) Start Frontend Only"
    echo "4) Start with Mock Service"
    echo "5) Reset Database"
    echo "6) Open Database Studio"
    echo "7) Run Backend Tests"
    echo "8) Run Frontend Lint"
    echo "9) View Logs"
    echo "10) Check Service Status"
    echo "11) Kill All Services"
    echo "12) Show Dev Info"
    echo "0) Exit"
    echo ""
}

# Check service status
check_services() {
    print_section "Service Status"
    
    # Backend
    if port_in_use 3001; then
        echo -e "Backend:    ${GREEN}✓ Running${NC} (port 3001)"
    else
        echo -e "Backend:    ${RED}✗ Not running${NC}"
    fi
    
    # Frontend
    if port_in_use 3002; then
        echo -e "Frontend:   ${GREEN}✓ Running${NC} (port 3002)"
    else
        echo -e "Frontend:   ${RED}✗ Not running${NC}"
    fi
    
    # Mock service
    if port_in_use 8092; then
        echo -e "Mock API:   ${GREEN}✓ Running${NC} (port 8092)"
    else
        echo -e "Mock API:   ${RED}✗ Not running${NC}"
    fi
    
    echo ""
}

# View logs
view_logs() {
    print_section "Log Viewer"
    echo "1) Backend logs"
    echo "2) Frontend logs"
    echo "3) Database queries"
    echo "0) Back"
    echo ""
    read -p "Select option: " log_choice
    
    case $log_choice in
        1)
            print_info "Showing backend logs (Ctrl+C to exit)..."
            cd CSI_API && bun run dev
            ;;
        2)
            print_info "Showing frontend logs (Ctrl+C to exit)..."
            cd CSI_UI && npm run dev
            ;;
        3)
            print_info "Opening database studio..."
            cd CSI_API && bun x drizzle-kit studio
            ;;
        0)
            return
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
}

# Kill all services
kill_all_services() {
    print_warning "Killing all development services..."
    kill_port 3001
    kill_port 3002
    kill_port 8092
    print_status "All services stopped"
}

# Main loop
main() {
    while true; do
        show_menu
        read -p "Select option: " choice
        
        case $choice in
            1)
                print_info "Starting development environment..."
                ./start-dev.sh
                ;;
            2)
                print_info "Starting backend only..."
                ./start-dev.sh backend
                ;;
            3)
                print_info "Starting frontend only..."
                ./start-dev.sh frontend
                ;;
            4)
                print_info "Starting with mock service..."
                ./start-dev.sh mock
                ;;
            5)
                print_info "Resetting database..."
                ./reset-dev.sh db
                ;;
            6)
                print_info "Opening database studio..."
                cd CSI_API && bun x drizzle-kit studio
                ;;
            7)
                print_info "Running backend tests..."
                cd CSI_API && bun test
                ;;
            8)
                print_info "Running frontend lint..."
                cd CSI_UI && npm run lint
                ;;
            9)
                view_logs
                ;;
            10)
                check_services
                read -p "Press Enter to continue..."
                ;;
            11)
                kill_all_services
                read -p "Press Enter to continue..."
                ;;
            12)
                show_dev_info
                read -p "Press Enter to continue..."
                ;;
            0)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option"
                sleep 1
                ;;
        esac
    done
}

# Show header
clear
echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║       CSI Frontend Quick Commands         ║${NC}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites first
if ! check_prerequisites; then
    print_error "Prerequisites check failed. Please install missing dependencies."
    exit 1
fi

# Run main menu
main