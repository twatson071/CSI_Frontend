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