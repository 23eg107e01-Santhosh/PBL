#!/bin/bash

# Study Collab Angular Setup Script
echo "========================================="
echo "Study Collab - Angular Frontend Setup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Navigate to Angular frontend directory
cd frontend-angular

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "To start the development server, run:"
echo "  cd frontend-angular"
echo "  npm start"
echo ""
echo "The app will be available at: http://localhost:4200"
echo ""
echo "Make sure your backend is running on: http://localhost:5000"
echo ""
