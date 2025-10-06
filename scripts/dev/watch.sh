#!/bin/bash

# Development watch script with enhanced features
# Watches for changes and provides hot reload capabilities

set -e

echo "🚀 Starting development mode with hot reload..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Clean previous build
echo "🧹 Cleaning previous build..."
npm run clean

# Start TypeScript compiler in watch mode
echo "📦 Starting TypeScript compiler in watch mode..."
npm run build:watch &
TSC_PID=$!

# Wait for initial build
echo "⏳ Waiting for initial build..."
while [ ! -f dist/main.js ]; do
    sleep 1
done

echo -e "${GREEN}✅ Initial build complete${NC}"

# Start Electron
echo "🖥️  Starting Electron..."
npm start &
ELECTRON_PID=$!

# Trap to clean up processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
    kill $TSC_PID 2>/dev/null || true
    kill $ELECTRON_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${GREEN}✅ Development mode started${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"

# Wait for processes
wait
