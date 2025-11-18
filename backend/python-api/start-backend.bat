@echo off
echo ============================================
echo   Starting AI VOGUE Python Backend
echo ============================================
echo.

:: Activate virtual environment
echo [1/3] Activating virtual environment...
call .venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv .venv
    pause
    exit /b 1
)

:: Check if requirements are installed
echo [2/3] Checking dependencies...
python -c "import flask" 2>nul
if %errorlevel% neq 0 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

:: Start the Flask server
echo [3/3] Starting Flask server...
echo.
echo ============================================
echo   Backend will be available at:
echo   http://localhost:5000
echo.
echo   Press Ctrl+C to stop the server
echo ============================================
echo.
python app.py

pause
