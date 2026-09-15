@echo off
echo ========================================
echo   🎨 Starting Prism AI 3.0
echo ========================================
echo.

echo 🔍 Checking if backend is running...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is already running!
) else (
    echo 🚀 Starting Node.js backend...
    echo.
    cd backend
    
    echo 📦 Installing dependencies...
    call npm install >nul 2>&1
    
    echo 🔑 Starting Prism AI server...
    start /min npm start
    
    cd ..
    
    echo ⏳ Waiting for backend to start...
    timeout /t 5 >nul
)

echo.
echo 🌐 Opening Prism AI in your browser...

echo.
echo ========================================
echo   ✨ Prism AI is ready!
echo ========================================
echo.
start frontend\public\prism-ai-3.0.html
echo 📍 Frontend: frontend\public\prism-ai-3.0.html
echo 📍 Backend:  http://localhost:3000
echo 📍 Health:   http://localhost:3000/health
echo 📍 Chat API: http://localhost:3000/api/chat
echo.
echo Press any key to close this window...
pause >nul
