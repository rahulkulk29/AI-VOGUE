@echo off
echo ============================================
echo   Starting AI VOGUE Frontend Server
echo ============================================
echo.
echo Starting HTTP server on port 8000...
echo.
echo ============================================
echo   Frontend will be available at:
echo   http://localhost:8000/public/prism-ai-3.0.html
echo.
echo   Press Ctrl+C to stop the server
echo ============================================
echo.

cd public
python -m http.server 8000

pause
