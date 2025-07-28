#!/bin/bash

# CSI Frontend Development Setup Script
# Enhanced version with better error handling and options

set -e  # Exit on any error

# Source utilities
source "$(dirname "$0")/dev-utils.sh"

# Options
SKIP_BACKEND=false
SKIP_FRONTEND=false
SKIP_SCRIPTS=false
FORCE_SEED=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backend)
            SKIP_BACKEND=true
            shift
            ;;
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        --skip-scripts)
            SKIP_SCRIPTS=true
            shift
            ;;
        --force-seed)
            FORCE_SEED=true
            shift
            ;;
        help|--help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-backend   Skip backend setup"
            echo "  --skip-frontend  Skip frontend setup"
            echo "  --skip-scripts   Skip creating dev scripts"
            echo "  --force-seed     Force database reseed"
            echo "  help, -h         Show this help"
            echo ""
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
done

# Error handler
handle_error() {
    local exit_code=$?
    print_error "Setup failed at line $1"
    echo "You can try running the setup again or check the error above."
    exit $exit_code
}

# Set error trap
trap 'handle_error $LINENO' ERR

# Welcome message
print_section "CSI Frontend Development Setup"
echo "This script will set up your development environment"
echo ""

# Check prerequisites
if ! check_prerequisites; then
    print_error "Prerequisites check failed. Please install missing dependencies."
    exit 1
fi

# Setup backend
setup_backend() {
    print_section "Backend Setup (CSI_API)"
    
    cd CSI_API
    
    # Check if already set up
    if [ -f "local.db" ] && [ "$FORCE_SEED" = false ]; then
        print_warning "Backend appears to be already set up"
        read -p "Do you want to reset and reseed the database? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping backend setup"
            cd ..
            return
        fi
    fi
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    if bun install; then
        print_status "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file..."
        cat > .env << EOF
DB_FILE_NAME=local.db
EXTERNAL_BASE_URL=http://localhost:8090
SYSTEM_OPERATOR_KEY=SystemOperator-1
HUB_KEY=Hub-1
NODE_ENV=development
EOF
        print_status "Environment file created"
    else
        print_info ".env file already exists"
    fi
    
    # Remove old database if force seed
    if [ "$FORCE_SEED" = true ] && [ -f "local.db" ]; then
        print_info "Removing existing database..."
        rm -f local.db local.db-shm local.db-wal
    fi
    
    # Apply migrations
    print_info "Applying database migrations..."
    if ! bun x drizzle-kit migrate 2>/dev/null; then
        print_warning "Migration had some issues, but continuing..."
    fi
    
    # Seed database
    if [ "$FORCE_SEED" = true ]; then
        print_info "Force seeding database..."
        bun run seed:force
    else
        print_info "Seeding database with dummy data..."
        bun run seed
    fi
    print_status "Database seeded successfully"
    
    # Verify data
    print_info "Verifying seeded data..."
    if bun run verify; then
        print_status "Data verification passed"
    else
        print_warning "Data verification had some warnings"
    fi
    
    cd ..
    print_status "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_section "Frontend Setup (CSI_UI)"
    
    cd CSI_UI
    
    # Check if already set up
    if [ -d "node_modules" ]; then
        print_info "Frontend dependencies already installed"
    else
        # Install dependencies
        print_info "Installing frontend dependencies..."
        if npm install; then
            print_status "Frontend dependencies installed"
        else
            print_error "Failed to install frontend dependencies"
            exit 1
        fi
    fi
    
    cd ..
    print_status "Frontend setup complete"
}

# Create development scripts
create_dev_scripts() {
    print_section "Creating Development Scripts"
    
    # Only create simple wrapper scripts if enhanced ones don't exist
    if [ ! -f "start-backend.sh" ]; then
        cat > start-backend.sh << 'EOF'
#!/bin/bash
source "$(dirname "$0")/dev-utils.sh"
print_info "Starting CSI API Backend..."
cd CSI_API && bun run dev
EOF
        chmod +x start-backend.sh
        print_status "Created start-backend.sh"
    fi
    
    if [ ! -f "start-frontend.sh" ]; then
        cat > start-frontend.sh << 'EOF'
#!/bin/bash
source "$(dirname "$0")/dev-utils.sh"
print_info "Starting CSI UI Frontend..."
cd CSI_UI && npm run dev
EOF
        chmod +x start-frontend.sh
        print_status "Created start-frontend.sh"
    fi
    
    print_status "Development scripts ready"
}

# Main setup function
main() {
    # Run setup steps
    [ "$SKIP_BACKEND" = false ] && setup_backend
    [ "$SKIP_FRONTEND" = false ] && setup_frontend
    [ "$SKIP_SCRIPTS" = false ] && create_dev_scripts
    
    # Setup complete message
    echo ""
    print_section "🎉 Setup Complete!"
    
    echo ""
    echo "📋 What was set up:"
    if [ "$SKIP_BACKEND" = false ]; then
        echo "   • Backend API with SQLite database"
        echo "   • 4 sites with comprehensive device inventory"
        echo "   • 16 devices across multiple types"
        echo "   • Default user: dev@localhost.com (password: password)"
    fi
    if [ "$SKIP_FRONTEND" = false ]; then
        echo "   • Frontend React application"
    fi
    if [ "$SKIP_SCRIPTS" = false ]; then
        echo "   • Development helper scripts"
    fi
    
    # Show available commands
    show_commands
    
    echo ""
    print_status "Ready for development! 🚀"
    print_info "Start with: ./start-dev.sh"
}

# Run main function
main