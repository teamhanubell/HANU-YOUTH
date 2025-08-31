#!/bin/bash

# HANU-YOUTH Netlify Deployment Script
# This script prepares the project for Netlify deployment

echo "🚀 Starting HANU-YOUTH Netlify deployment preparation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated successfully"

# Build the project for Netlify
echo "🏗️  Building project for Netlify..."
npm run build:netlify

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if the output directory exists
if [ ! -d "out" ]; then
    echo "❌ Build output directory not found"
    exit 1
fi

echo "✅ Output directory verified"

# Show build summary
echo ""
echo "🎉 HANU-YOUTH Netlify deployment preparation completed!"
echo ""
echo "📋 Build Summary:"
echo "   - Project name: hanu-youth"
echo "   - Node.js version: $(node -v)"
echo "   - Dependencies: Installed"
echo "   - Prisma client: Generated"
echo "   - Next.js build: Successful"
echo "   - Output directory: out/"
echo ""
echo "🚀 Ready for Netlify deployment!"
echo ""
echo "Next steps:"
echo "1. Connect your repository to Netlify"
echo "2. Set environment variables in Netlify dashboard"
echo "3. Deploy automatically on push to main branch"
echo ""
echo "🌐 Your site will be available at: https://hanu-youth.netlify.app"