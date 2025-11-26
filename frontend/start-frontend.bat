@echo off
echo ============================================
echo   Starting AI VOGUE Frontend Server
echo ============================================
echo.
echo Starting HTTP server on port 8000 from the FRONTEND ROOT...
echo.
echo ============================================
echo   Frontend will be available at:
echo   http://localhost:8000/public/prism-ai-appwrite.html
echo.
echo   Press Ctrl+C to stop the server
echo ============================================
echo.

python -m http.server 8000

pause
