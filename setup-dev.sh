#!/bin/bash

# CSI Frontend Development Setup Script
# This script automates the setup process for new developers

set -e  # Exit on any error

echo "🚀 CSI Frontend Development Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Bun is installed
check_bun() {
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install it first:"
        echo "curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi
    print_status "Bun is installed ($(bun --version))"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. You'll need it for the frontend."
        print_info "Install from: https://nodejs.org/"
    else
        print_status "Node.js is installed ($(node --version))"
    fi
}

# Setup backend
setup_backend() {
    print_info "Setting up backend (CSI_API)..."
    
    cd CSI_API
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    bun install
    print_status "Backend dependencies installed"
    
    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        echo "📝 Creating .env file..."
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
    
    # Apply migrations
    echo "🗄️  Applying database migrations..."
    if ! bun x drizzle-kit migrate 2>/dev/null; then
        print_warning "Migration had some issues, but continuing..."
    fi
    
    # Seed database
    echo "🌱 Seeding database with dummy data..."
    bun run seed
    print_status "Database seeded successfully"
    
    # Verify data
    echo "🔍 Verifying seeded data..."
    bun run verify
    
    cd ..
    print_status "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_info "Setting up frontend (CSI_UI)..."
    
    cd CSI_UI
    
    # Install dependencies
    echo "📦 Installing frontend dependencies..."
    npm install
    print_status "Frontend dependencies installed"
    
    cd ..
    print_status "Frontend setup complete"
}

# Create development scripts
create_dev_scripts() {
    print_info "Creating development scripts..."
    
    # Backend start script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🔧 Starting CSI API Backend..."
cd CSI_API
bun run dev
EOF
    chmod +x start-backend.sh
    
    # Frontend start script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🎨 Starting CSI UI Frontend..."
cd CSI_UI
npm run dev
EOF
    chmod +x start-frontend.sh
    
    # Combined start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting CSI Frontend Development Environment..."
echo "This will start both backend and frontend servers."
echo "Press Ctrl+C to stop both servers."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT

# Start backend in background
echo "Starting backend..."
cd CSI_API && bun run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend..."
cd ../CSI_UI && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo "   Default User: dev@localhost.com"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait for both processes
wait
EOF
    chmod +x start-dev.sh
    
    print_status "Development scripts created"
}

# Main setup function
main() {
    print_info "Starting CSI Frontend development setup..."
    
    # Check prerequisites
    check_bun
    check_node
    
    # Setup components
    setup_backend
    setup_frontend
    create_dev_scripts
    
    echo ""
    echo "🎉 Setup Complete!"
    echo "================="
    echo ""
    echo "📋 What was set up:"
    echo "   • Backend API with SQLite database"
    echo "   • 4 sites with comprehensive device inventory"
    echo "   • 16 devices across multiple types (PDU, Server, RF, etc.)"
    echo "   • Default user account: dev@localhost.com"
    echo "   • User-site relationships configured"
    echo "   • Frontend React application"
    echo ""
    echo "🚀 Quick start options:"
    echo "   • Run both servers: ./start-dev.sh"
    echo "   • Backend only:     ./start-backend.sh"
    echo "   • Frontend only:    ./start-frontend.sh"
    echo ""
    echo "🌐 URLs:"
    echo "   • Frontend: http://localhost:5173"
    echo "   • Backend:  http://localhost:3000"
    echo "   • DB Studio: bun x drizzle-kit studio (from CSI_API directory)"
    echo ""
    echo "📚 Documentation:"
    echo "   • Setup Guide: CSI_API/DEV_SETUP.md"
    echo "   • Verify Data: cd CSI_API && bun run verify"
    echo ""
    print_status "Ready for development! 🎯"
}

# Run main function
main