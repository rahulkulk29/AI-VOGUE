@echo off
echo ========================================
echo   🎨 Starting Prism AI Beauty Assistant
echo ========================================
echo.

echo 🔍 Checking if Python backend is running...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is already running!
) else (
    echo 🚀 Starting Python backend...
    echo.
    cd backend\python-api
    
    echo 📦 Installing dependencies...
    pip install -r requirements.txt >nul 2>&1
    
    echo 🔑 Starting Flask server...
    start /min python app.py
    
    cd ..\..
    
    echo ⏳ Waiting for backend to start...
    timeout /t 3 >nul
)

echo.
echo 🌐 Opening Prism AI in your browser...
start frontend\public\prism-ai-appwrite.html

echo.
echo ========================================
echo   ✨ Prism AI is ready!
echo ========================================
echo.
echo 📍 Frontend: frontend\public\prism-ai-appwrite.html
echo 📍 Backend:  http://localhost:5000
echo 📍 Health:   http://localhost:5000/health
echo.
echo Press any key to close this window...
pause >nul
