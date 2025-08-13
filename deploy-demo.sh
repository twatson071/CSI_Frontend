#!/bin/bash

# One-click demo deployment script
# Provides interactive menu for deployment options

set -e

echo "======================================"
echo "   CSI Demo Application Deployment    "
echo "======================================"
echo ""

# Function to check prerequisites
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed."
        echo "   Please install Docker first: https://docs.docker.com/get-docker/"
        return 1
    fi
    echo "✅ Docker is installed"
    return 0
}

check_aws() {
    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI is not installed."
        echo "   Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        return 1
    fi
    echo "✅ AWS CLI is installed"
    return 0
}

check_azure() {
    if ! command -v az &> /dev/null; then
        echo "❌ Azure CLI is not installed."
        echo "   Install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        return 1
    fi
    echo "✅ Azure CLI is installed"
    return 0
}

# Deployment functions
deploy_local() {
    echo ""
    echo "🚀 Starting local Docker deployment..."
    echo ""
    
    if ! check_docker; then
        return 1
    fi
    
    echo "Building Docker image..."
    docker-compose -f docker-compose.demo.yml build
    
    echo "Starting containers..."
    docker-compose -f docker-compose.demo.yml up -d
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📋 Access Information:"
    echo "   URL: http://localhost"
    echo "   Email: demo@csi.mil"
    echo "   Password: DemoPass123!"
    echo ""
    echo "📊 View logs: docker-compose -f docker-compose.demo.yml logs -f"
    echo "🛑 Stop: docker-compose -f docker-compose.demo.yml down"
}

deploy_aws() {
    echo ""
    echo "🚀 Starting AWS EC2 deployment..."
    echo ""
    
    if ! check_docker; then
        return 1
    fi
    
    if ! check_aws; then
        return 1
    fi
    
    echo "Checking AWS credentials..."
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "❌ AWS credentials not configured."
        echo "   Run: aws configure"
        return 1
    fi
    
    echo "✅ AWS credentials configured"
    echo ""
    
    # Run the AWS deployment script
    chmod +x deploy-aws-free.sh
    ./deploy-aws-free.sh
}

deploy_azure() {
    echo ""
    echo "🚀 Starting Azure deployment..."
    echo ""
    
    if ! check_docker; then
        return 1
    fi
    
    if ! check_azure; then
        return 1
    fi
    
    echo "Checking Azure login..."
    if ! az account show &> /dev/null; then
        echo "Please login to Azure..."
        az login
    fi
    
    echo "✅ Azure CLI configured"
    echo ""
    
    # Run the Azure deployment script
    chmod +x deploy-azure-free.sh
    ./deploy-azure-free.sh
}

quick_local() {
    echo ""
    echo "🚀 Quick local deployment (using pre-built image)..."
    echo ""
    
    if ! check_docker; then
        return 1
    fi
    
    echo "Starting container..."
    docker run -d \
        --name csi-demo-quick \
        -p 8080:80 \
        -e DEMO_MODE=true \
        -e DEMO_USER=demo@csi.mil \
        -e DEMO_PASSWORD=DemoPass123! \
        -v csi-demo-data:/app/data \
        --restart unless-stopped \
        csi-demo:latest 2>/dev/null || {
            echo "Building image first (this will take a few minutes)..."
            docker build -f Dockerfile.demo -t csi-demo:latest .
            docker run -d \
                --name csi-demo-quick \
                -p 8080:80 \
                -e DEMO_MODE=true \
                -e DEMO_USER=demo@csi.mil \
                -e DEMO_PASSWORD=DemoPass123! \
                -v csi-demo-data:/app/data \
                --restart unless-stopped \
                csi-demo:latest
        }
    
    echo ""
    echo "✅ Quick deployment complete!"
    echo ""
    echo "📋 Access Information:"
    echo "   URL: http://localhost:8080"
    echo "   Email: demo@csi.mil"
    echo "   Password: DemoPass123!"
    echo ""
    echo "📊 View logs: docker logs -f csi-demo-quick"
    echo "🛑 Stop: docker stop csi-demo-quick && docker rm csi-demo-quick"
}

# Main menu
while true; do
    echo ""
    echo "Choose deployment option:"
    echo ""
    echo "  1) 🖥️  Local Docker (Full)"
    echo "  2) ⚡ Quick Local (Fastest)"
    echo "  3) ☁️  AWS EC2 Free Tier"
    echo "  4) ☁️  Azure Free Tier"
    echo "  5) 📖 View Documentation"
    echo "  6) 🚪 Exit"
    echo ""
    read -p "Select option (1-6): " choice
    
    case $choice in
        1)
            deploy_local
            ;;
        2)
            quick_local
            ;;
        3)
            deploy_aws
            ;;
        4)
            deploy_azure
            ;;
        5)
            echo ""
            cat DEMO_DEPLOYMENT.md | less
            ;;
        6)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid option. Please select 1-6."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done