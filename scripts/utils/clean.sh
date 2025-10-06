#!/bin/bash

# Clean build script
# Removes all build artifacts and compiled files

echo "🧹 Cleaning build artifacts..."

# Remove dist folder
if [ -d "dist" ]; then
    rm -rf dist
    echo "✓ Removed dist/"
fi

# Remove build folder
if [ -d "build" ]; then
    rm -rf build
    echo "✓ Removed build/"
fi

# Remove release folder
if [ -d "release" ]; then
    rm -rf release
    echo "✓ Removed release/"
fi

# Remove logs
if [ -d "logs" ]; then
    rm -rf logs
    echo "✓ Removed logs/"
fi

echo "✅ Clean complete!"
