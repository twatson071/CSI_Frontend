#!/bin/bash

# CSI Frontend Development Reset Script
# Resets the development environment to a clean state

# Source utilities
source "$(dirname "$0")/dev-utils.sh"

# Default settings
RESET_DB=true
RESET_NODE_MODULES=false
RESET_ENV=false
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        full|--full)
            RESET_DB=true
            RESET_NODE_MODULES=true
            RESET_ENV=true
            shift
            ;;
        db|--db)
            RESET_DB=true
            RESET_NODE_MODULES=false
            RESET_ENV=false
            shift
            ;;
        deps|--deps)
            RESET_NODE_MODULES=true
            shift
            ;;
        env|--env)
            RESET_ENV=true
            shift
            ;;
        force|--force|-f)
            FORCE=true
            shift
            ;;
        help|--help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  full           Full reset (database, dependencies, env)"
            echo "  db             Reset database only (default)"
            echo "  deps           Reset node_modules/dependencies"
            echo "  env            Reset environment files"
            echo "  force, -f      Force reset without confirmation"
            echo "  help, -h       Show this help"
            echo ""
            echo "Examples:"
            echo "  $0             # Reset database only"
            echo "  $0 full        # Full reset"
            echo "  $0 db deps     # Reset database and dependencies"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
done

# Confirmation function
confirm_action() {
    if [ "$FORCE" = true ]; then
        return 0
    fi
    
    local message=$1
    echo -e "${YELLOW}$message${NC}"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Operation cancelled"
        return 1
    fi
    return 0
}

# Main execution
print_section "CSI Development Environment Reset"

# Show what will be reset
echo "The following will be reset:"
[ "$RESET_DB" = true ] && echo "   • Database (local.db)"
[ "$RESET_NODE_MODULES" = true ] && echo "   • Node modules (backend & frontend)"
[ "$RESET_ENV" = true ] && echo "   • Environment files (.env)"
echo ""

# Confirm action
if ! confirm_action "This will delete the selected data and reset to defaults."; then
    exit 0
fi

# Kill any running services
print_info "Checking for running services..."
kill_port 3001
kill_port 3002
kill_port 8092

# Reset database
if [ "$RESET_DB" = true ]; then
    print_section "Resetting Database"
    
    cd CSI_API
    
    # Remove database files
    if [ -f "local.db" ]; then
        rm -f local.db local.db-shm local.db-wal
        print_status "Database files removed"
    fi
    
    # Run migrations
    print_info "Running database migrations..."
    if ! bun x drizzle-kit migrate 2>/dev/null; then
        print_warning "Migration had some issues, but continuing..."
    fi
    
    # Seed database
    print_info "Seeding database with fresh data..."
    bun run seed:force
    print_status "Database reset complete"
    
    # Verify data
    print_info "Verifying seeded data..."
    bun run verify
    
    cd ..
fi

# Reset node_modules
if [ "$RESET_NODE_MODULES" = true ]; then
    print_section "Resetting Dependencies"
    
    # Backend dependencies
    if [ -d "CSI_API/node_modules" ]; then
        print_info "Removing backend node_modules..."
        rm -rf CSI_API/node_modules
        rm -f CSI_API/bun.lockb
        print_status "Backend dependencies removed"
    fi
    
    # Frontend dependencies
    if [ -d "CSI_UI/node_modules" ]; then
        print_info "Removing frontend node_modules..."
        rm -rf CSI_UI/node_modules
        rm -f CSI_UI/package-lock.json
        print_status "Frontend dependencies removed"
    fi
    
    # Reinstall dependencies
    print_info "Reinstalling backend dependencies..."
    cd CSI_API && bun install && cd ..
    print_status "Backend dependencies installed"
    
    print_info "Reinstalling frontend dependencies..."
    cd CSI_UI && npm install && cd ..
    print_status "Frontend dependencies installed"
fi

# Reset environment files
if [ "$RESET_ENV" = true ]; then
    print_section "Resetting Environment Files"
    
    # Backend .env
    if [ -f "CSI_API/.env" ]; then
        print_info "Backing up existing .env to .env.backup..."
        cp CSI_API/.env CSI_API/.env.backup
    fi
    
    print_info "Creating fresh .env file..."
    cat > CSI_API/.env << EOF
DB_FILE_NAME=local.db
EXTERNAL_BASE_URL=http://localhost:8090
SYSTEM_OPERATOR_KEY=SystemOperator-1
HUB_KEY=Hub-1
NODE_ENV=development
EOF
    print_status "Environment file reset"
fi

# Summary
echo ""
print_section "Reset Complete!"

if [ "$RESET_DB" = true ]; then
    echo "✓ Database has been reset with fresh data"
    echo "  - 4 sites created"
    echo "  - 16 devices added"
    echo "  - Default user: dev@localhost.com"
fi

if [ "$RESET_NODE_MODULES" = true ]; then
    echo "✓ Dependencies have been reinstalled"
fi

if [ "$RESET_ENV" = true ]; then
    echo "✓ Environment files have been reset"
    [ -f "CSI_API/.env.backup" ] && echo "  - Previous .env backed up to .env.backup"
fi

# Show next steps
echo ""
print_info "Next steps:"
echo "1. Start the development environment: ./start-dev.sh"
echo "2. Or run individual services:"
echo "   - Backend only: ./start-dev.sh backend"
echo "   - Frontend only: ./start-dev.sh frontend"
echo "   - With mock service: ./start-dev.sh mock"

# Show available commands
show_commands