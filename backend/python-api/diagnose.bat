@echo off
echo ============================================
echo   GEMINI API DIAGNOSTICS
echo ============================================
echo.

echo [STEP 1] Testing Gemini API Key...
echo.
python test_gemini_api.py

echo.
echo.
echo ============================================
echo   NEXT STEPS:
echo ============================================
echo.
echo 1. If the test PASSED (green success):
echo    - Your API key works!
echo    - The issue is in the backend integration
echo    - Look at the backend terminal logs
echo    - Look for lines starting with: 🎯 🚀 ❌
echo.
echo 2. If the test FAILED (red error):
echo    - Fix the API key issue first
echo    - Get new key: https://aistudio.google.com/app/apikey
echo    - Update gemini_service.py line 17
echo    - Run this script again
echo.
echo 3. After fixing, restart the backend:
echo    python app.py
echo.
echo 4. Then test in browser and watch backend logs
echo.
echo ============================================
pause
