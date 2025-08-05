#!/bin/bash

# Build script for Pinpoint Browser Extensions
# Creates extension packages for both Chrome and Firefox

echo "🚀 Building Pinpoint Browser Extensions..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js and try again."
    exit 1
fi

# Run the Node.js build script
node build-extensions.js

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo "📦 Extension packages are available in the 'extension-builds/' directory"
    echo ""
    echo "To install:"
    echo "  Chrome: Open chrome://extensions/, enable Developer mode, and load the chrome/ folder"
    echo "  Firefox: Open about:debugging, click 'This Firefox', and load the firefox/manifest.json"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi