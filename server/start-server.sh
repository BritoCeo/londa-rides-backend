#!/bin/bash

# Londa Server Startup Script
echo "🚀 Starting Londa Server..."

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "📦 Building TypeScript..."
    npm run build
fi

# Set default port if not provided
PORT=${1:-3001}

echo "🔥 Starting server on port $PORT"
echo "📍 Server will be available at: http://localhost:$PORT"
echo "🧪 Test endpoint: http://localhost:$PORT/test"
echo "📱 API base URL: http://localhost:$PORT/api/v1"
echo ""
echo "💡 Tip: Use Ctrl+C to stop the server"
echo "----------------------------------------"

# Start the server
PORT=$PORT npm start 