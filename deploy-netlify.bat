@echo off
REM HANU-YOUTH Netlify Deployment Script
REM This script prepares the project for Netlify deployment

echo 🚀 Starting HANU-YOUTH Netlify deployment preparation...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version check passed
node --version

REM Set environment variables for production
echo 🔧 Setting up environment variables...
set NODE_ENV=production
set NEXT_TELEMETRY_DISABLED=1
set NETLIFY=true

REM Install dependencies
echo 📦 Installing dependencies...
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Generate Prisma client
echo 🔄 Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    exit /b 1
)

REM Run database migrations
echo 🗄️ Running database migrations...
npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ❌ Database migration failed
    exit /b 1
)

REM Build the application
echo 🏗️  Building the application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    exit /b 1
)

echo ✅ Build completed successfully!
echo 🚀 Your application is ready for deployment to Netlify.
echo 💡 You can now push your code to your Git repository and connect it to Netlify.

REM Check if Netlify CLI is installed
echo 🔍 Checking for Netlify CLI...
npx netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ℹ️ Netlify CLI is not installed. Installing now...
    npm install -g netlify-cli
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Netlify CLI
        exit /b 1
    )
)

echo ✅ Netlify CLI is ready

echo 🌐 Starting Netlify deployment...
npx netlify deploy --prod
if %errorlevel% neq 0 (
    echo ❌ Netlify deployment failed
    exit /b 1
)

echo 🎉 Deployment completed successfully!
pause

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npm run db:generate

if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

echo ✅ Prisma client generated successfully

REM Build the project for Netlify
echo 🏗️  Building project for Netlify...
npm run build:netlify

if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully

REM Check if the output directory exists
if not exist ".next" (
    echo ❌ Build output directory not found
    pause
    exit /b 1
)

echo ✅ Output directory verified

REM Show build summary
echo.
echo 🎉 HANU-YOUTH Netlify deployment preparation completed!
echo.
echo 📋 Build Summary:
echo    - Node.js version: 
node --version
echo    - Dependencies: Installed
echo    - Prisma client: Generated
echo    - Next.js build: Successful
echo    - Output directory: .next/
echo.
echo 🚀 Ready for Netlify deployment!
echo.
echo Next steps:
echo 1. Connect your repository to Netlify
echo 2. Set environment variables in Netlify dashboard
echo 3. Deploy automatically on push to main branch
echo.

pause