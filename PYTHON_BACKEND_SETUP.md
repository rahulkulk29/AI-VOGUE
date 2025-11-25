# 🚀 **Python Backend Setup Guide**

**Complete setup instructions for AI VOGUE's new Python backend**

## 📋 **What You Need to Do**

### **Step 1: Create .env File**

```bash
# Navigate to Python backend folder
cd E:\Projects\website_v5\website_v5\backend\python-api

# Create .env file from template
copy env_template.txt .env
```

**Edit the `.env` file and add your Gemini API key:**
```env
GEMINI_API_KEY=AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q
GEMINI_MODEL=gemini-2.5-flash
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
MAX_TOKENS=512
TEMPERATURE=0.7
REQUEST_TIMEOUT=30
```

### **Step 2: Install Python Dependencies**

```bash
# Make sure you're in the python-api folder
cd E:\Projects\website_v5\website_v5\backend\python-api

# Install required packages
pip install -r requirements.txt
```

**Dependencies that will be installed:**
- `flask` - Web framework
- `flask-cors` - Cross-origin requests
- `python-dotenv` - Environment variables
- `requests` - HTTP requests to Gemini API
- `gunicorn` - Production server (optional)

### **Step 3: Start the Python Backend**

```bash
# Run the Flask application
python app.py
```

**You should see:**
```
Starting AI VOGUE Python Backend...
CORS origins: ['http://localhost:8000', 'http://127.0.0.1:8000']
Backend will be available at: http://localhost:5000
Health check: http://localhost:5000/health
API endpoint: http://localhost:5000/api/recommend
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[::1]:5000
```

### **Step 4: Test the Backend**

**Open a new terminal and test:**

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"healthy","timestamp":"...","service":"AI VOGUE Python Backend","version":"1.0.0"}
```

### **Step 5: Start the Frontend**

```bash
# Open another terminal
cd E:\Projects\website_v5\website_v5\frontend\public

# Start frontend server
python -m http.server 8000
```

### **Step 6: Test Complete Integration**

1. **Open browser:** `http://localhost:8000`
2. **Navigate to:** Prism AI page (`prism-ai-appwrite.html`)
3. **Complete the onboarding quiz**
4. **Ask a question:** "Recommend a moisturizer for oily skin"
5. **Verify:** You get AI recommendations in 2-5 seconds

## ✅ **Verification Checklist**

- [ ] Python backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:8000`
- [ ] Health check returns `{"status":"healthy"}`
- [ ] Prism AI page loads without errors
- [ ] AI recommendations work and return quickly
- [ ] No CORS errors in browser console
- [ ] Backend logs show successful API calls

## 🔧 **What Changed from Appwrite Functions**

### **Before (Appwrite Functions)**
```javascript
// Old way - complex function deployment
const execution = await functions.createExecution('gemini-proxy', payload);
// Often timed out, hard to debug
```

### **After (Python Backend)**
```javascript
// New way - simple HTTP request
const response = await fetch('http://localhost:5000/api/recommend', {
    method: 'POST',
    body: JSON.stringify(payload)
});
// Fast, easy to debug
```

## 🎯 **Benefits You'll See**

1. **⚡ Faster Responses**
   - Before: 30+ seconds (often timeout)
   - After: 2-5 seconds

2. **🐛 Easier Debugging**
   - Before: Check Appwrite function logs
   - After: See errors directly in terminal

3. **🚀 Simpler Deployment**
   - Before: Package tar.gz, upload, configure
   - After: Just run `python app.py`

4. **💰 No Function Costs**
   - Before: Appwrite function execution costs
   - After: Free local development

## 🔍 **Troubleshooting**

### **"GEMINI_API_KEY not found"**
```bash
# Check if .env file exists
ls -la .env

# If not, create it:
copy env_template.txt .env
# Then edit .env with your API key
```

### **"Module not found" errors**
```bash
# Install dependencies
pip install flask flask-cors python-dotenv requests
```

### **"Connection refused" from frontend**
```bash
# Make sure Python backend is running
python app.py
# Should show "Running on http://localhost:5000"
```

### **CORS errors in browser**
```bash
# Check CORS_ORIGINS in .env file
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

### **Gemini API errors**
```bash
# Check your API key at: https://makersuite.google.com/app/apikey
# Try different model in .env:
GEMINI_MODEL=gemini-2.5-pro
```

## 📱 **Testing Commands**

**Test the backend directly:**
```bash
# Health check
curl http://localhost:5000/health

# Test endpoint
curl -X POST http://localhost:5000/api/test -H "Content-Type: application/json" -d '{"test": true}'

# AI recommendation test
curl -X POST http://localhost:5000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "Recommend a cleanser for oily skin",
    "userProfile": {
      "skinType": "oily",
      "skincareBudget": "mid"
    }
  }'
```

## 🎊 **Success!**

Once you complete these steps, you'll have:

- ✅ **Fast Python backend** running locally
- ✅ **Simple debugging** with print statements
- ✅ **No more function timeouts**
- ✅ **Same great AI recommendations**
- ✅ **All existing features working**

**Your AI VOGUE project is now running with a much simpler and faster backend!** 🚀

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check the terminal output for error messages
2. Verify all files are in the correct locations
3. Ensure your Gemini API key is valid
4. Make sure both backend (port 5000) and frontend (port 8000) are running

**The Python backend approach is much simpler than Appwrite Functions - you should be up and running in minutes!**
