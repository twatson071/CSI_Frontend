#!/bin/bash

# CSI Application Health Check Script

set -e

# Default values
HOST="localhost"
PORT="8080"
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            HOST="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --host HOST     Host to check (default: localhost)"
            echo "  --port PORT     Port to check (default: 8080)"
            echo "  --verbose, -v   Show detailed output"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

BASE_URL="http://$HOST:$PORT"

echo "🏥 CSI Application Health Check"
echo "==============================="
echo "Checking: $BASE_URL"
echo ""

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local description=$2
    
    if [ "$VERBOSE" = true ]; then
        echo -n "Checking $description ($endpoint)... "
    fi
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        if [ "$VERBOSE" = true ]; then
            echo "✅ OK"
        else
            echo "✅ $description: OK"
        fi
        return 0
    else
        if [ "$VERBOSE" = true ]; then
            echo "❌ Failed (HTTP $response)"
        else
            echo "❌ $description: Failed (HTTP $response)"
        fi
        return 1
    fi
}

# Function to check response time
check_response_time() {
    local endpoint=$1
    local description=$2
    
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL$endpoint" 2>/dev/null || echo "0")
    response_time_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "0")
    
    echo "⏱️  $description response time: ${response_time_ms%.*}ms"
}

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl is not installed"
    exit 1
fi

# Perform health checks
overall_status=0

# Check main endpoints
check_endpoint "/health" "Frontend health" || overall_status=1
check_endpoint "/api/health" "Backend API health" || overall_status=1

if [ "$VERBOSE" = true ]; then
    echo ""
    echo "📊 Performance Metrics:"
    check_response_time "/" "Frontend"
    check_response_time "/api/health" "API"
fi

# Check container status if running locally
if [ "$HOST" = "localhost" ] && command -v docker &> /dev/null; then
    echo ""
    echo "🐳 Docker Container Status:"
    if docker ps | grep -q csi-production; then
        echo "✅ Container is running"
        
        if [ "$VERBOSE" = true ]; then
            # Get container stats
            stats=$(docker stats csi-production --no-stream --format "CPU: {{.CPUPerc}} | Memory: {{.MemUsage}}" 2>/dev/null || echo "Unable to get stats")
            echo "   $stats"
        fi
    else
        echo "❌ Container is not running"
        overall_status=1
    fi
fi

echo ""
if [ $overall_status -eq 0 ]; then
    echo "✅ All health checks passed!"
else
    echo "❌ Some health checks failed!"
    exit 1
fi