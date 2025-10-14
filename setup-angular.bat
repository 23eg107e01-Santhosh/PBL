@echo off
REM Study Collab Angular Setup Script for Windows

echo =========================================
echo Study Collab - Angular Frontend Setup
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo √ Node.js is installed
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo X npm is not installed. Please install npm first.
    exit /b 1
)

echo √ npm is installed
npm --version

REM Navigate to Angular frontend directory
cd frontend-angular

echo.
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo X Failed to install dependencies
    exit /b 1
)

echo.
echo √ Dependencies installed successfully!
echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo To start the development server, run:
echo   cd frontend-angular
echo   npm start
echo.
echo The app will be available at: http://localhost:4200
echo.
echo Make sure your backend is running on: http://localhost:5000
echo.

pause
