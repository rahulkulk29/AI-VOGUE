# 🐍 Python Backend Setup Guide

## Quick Setup (5 minutes)

### **Step 1: Add Your Gemini API Key** (2 min)

1. **Get API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)

2. **Update Python Code:**
   - Open: `backend/python-api/services/gemini_service.py`
   - Find line 17:
   ```python
   self.api_key = "YOUR_GEMINI_API_KEY_HERE"  # ⬅️ PUT YOUR API KEY HERE
   ```
   - Replace with your key:
   ```python
   self.api_key = "AIzaSy...your-actual-key"  # ⬅️ PUT YOUR API KEY HERE
   ```

### **Step 2: Install Dependencies** (1 min)

```bash
cd backend/python-api
pip install -r requirements.txt
```

### **Step 3: Start Backend** (1 min)

```bash
python app.py
```

You should see:
```
✅ Gemini service initialized successfully
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
* Running on http://localhost:5000
```

### **Step 4: Test Integration** (1 min)

1. Open: `test-integration.html` in your browser
2. Click "Test Health Endpoint" - should show ✅
3. Click "Test AI Recommendations" - should get product recommendations!

---

## 🎯 What This Does

### **Architecture:**
```
Frontend (HTML/JS)
    ↓ HTTP Request
Python Flask Backend
    ↓ API Call (with hidden key)
Google Gemini AI
    ↓ AI Response
Backend processes & returns
    ↓ JSON Response
Frontend displays recommendations
```

### **Security:**
- ✅ API key hidden in Python backend
- ✅ No client-side exposure
- ✅ CORS configured for security
- ✅ Input validation

### **Features:**
- 🤖 Direct Gemini AI integration
- 🔄 Automatic model fallbacks
- ⚡ Fast response times
- 🛡️ Error handling
- 📊 Request logging

---

## 🧪 Testing

### **Health Check:**
```bash
curl http://localhost:5000/health
```

### **AI Recommendation:**
```bash
curl -X POST http://localhost:5000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "Recommend a moisturizer",
    "userProfile": {
      "skinType": "oily",
      "skincareBudget": "mid"
    }
  }'
```

### **Test Endpoint:**
```bash
curl -X POST http://localhost:5000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## 📁 File Structure

```
backend/python-api/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── services/
│   └── gemini_service.py  # Gemini AI integration (set API key via environment)
├── utils/
│   ├── validators.py      # Input validation
│   └── response_parser.py # Response formatting
└── env_template.txt       # Example environment template (do not commit secrets)
```

---

## 🔧 Configuration

### **Environment Variables (Set in shell or deployment)**

Set environment variables in your shell or deployment platform (PowerShell/Bash/Appwrite Functions). Do not commit `.env` files with secrets. Example (PowerShell):
```powershell
$Env:GEMINI_API_KEY = "your-key-here"
$Env:GEMINI_MODEL = "gemini-1.5-flash"
$Env:FLASK_DEBUG = "True"
```

### **Direct Code Configuration (Current):**
```python
# In gemini_service.py line 17:
self.api_key = "AIzaSy...your-key"  # Direct API key
```

---

## 🚀 Frontend Integration

### **Using Python Backend Service:**

```javascript
// Import the service
import { pythonBackendService } from './frontend/js/services/python-backend-service.js';

// Test connection
const health = await pythonBackendService.testConnection();

// Get AI recommendations
const result = await pythonBackendService.getRecommendations(
    'Recommend a serum for aging skin',
    {
        skinType: 'dry',
        skinConcern: 'wrinkles',
        ageRange: 'forties',
        skincareBudget: 'high'
    }
);

console.log(result.products); // Array of product recommendations
```

### **Response Format:**
```json
{
  "success": true,
  "generalAdvice": "For aging skin, focus on ingredients like retinol...",
  "products": [
    {
      "name": "Retinol Serum",
      "brand": "The Ordinary",
      "category": "Skincare",
      "price": "$6.90",
      "ingredients": ["Retinol", "Squalane"],
      "purchaseLink": "https://theordinary.com/...",
      "compatibility": 92,
      "pros": ["Reduces fine lines", "Affordable"],
      "cons": ["May cause irritation initially"],
      "applicationTips": "Start with 2-3 times per week..."
    }
  ],
  "additionalTips": ["Always use sunscreen", "Start slowly"],
  "processingTime": "2.3s",
  "timestamp": "2024-10-08T13:08:07.123Z"
}
```

---

## 🐛 Troubleshooting

### **"Please replace YOUR_GEMINI_API_KEY_HERE"**
```
Solution: Update line 17 in services/gemini_service.py with your actual API key
```

### **"ModuleNotFoundError: No module named 'flask'"**
```
Solution: Install dependencies
cd backend/python-api
pip install -r requirements.txt
```

### **"CORS error" in browser**
```
Solution: Backend includes CORS headers automatically
Make sure backend is running on localhost:5000
```

### **"Connection refused"**
```
Solution: Start the Python backend
cd backend/python-api
python app.py
```

### **"All Gemini models failed"**
```
Solution: Check your API key is valid
Visit: https://makersuite.google.com/app/apikey
Verify key has proper permissions
```

---

## 📊 Performance

### **Response Times:**
- Health check: ~50ms
- AI recommendation: ~2-5 seconds
- Fallback response: ~100ms

### **Gemini Models (in order of preference):**
1. `gemini-1.5-flash` (fastest)
2. `gemini-1.5-pro` (most capable)
3. `gemini-pro` (fallback)

### **Rate Limits:**
- Gemini Free: 60 requests/minute
- Built-in retry logic with exponential backoff
- Automatic model fallbacks

---

## 🔒 Security Features

### **API Key Protection:**
- ✅ Never exposed to frontend
- ✅ Stored in backend code/environment
- ✅ Not logged in responses

### **Input Validation:**
- ✅ JSON schema validation
- ✅ Required field checking
- ✅ Type validation
- ✅ Length limits

### **CORS Security:**
- ✅ Configured origins
- ✅ Proper headers
- ✅ Method restrictions

### **Error Handling:**
- ✅ No sensitive data in errors
- ✅ Graceful degradation
- ✅ Fallback responses

---

## 🎨 Customization

### **Add New Endpoints:**
```python
@app.route('/api/custom', methods=['POST'])
def custom_endpoint():
    data = request.get_json()
    # Your custom logic here
    return jsonify({'success': True, 'data': result})
```

### **Modify AI Prompts:**
Edit `services/gemini_service.py` line 164+ to customize the AI prompt format.

### **Add New Models:**
Update `model_fallbacks` list in `gemini_service.py` line 33.

### **Change Response Format:**
Modify `utils/response_parser.py` to customize the output structure.

---

## 📈 Scaling

### **For Production:**
1. Use environment variables for API key
2. Add authentication middleware
3. Implement rate limiting
4. Add request logging
5. Use production WSGI server (gunicorn)
6. Add database for user preferences
7. Implement caching (Redis)

### **Deploy with Gunicorn:**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🎉 Success!

If you see this in your terminal:
```
✅ Gemini service initialized successfully
* Running on http://localhost:5000
```

And the test page shows green checkmarks ✅, you're all set!

**Your Python backend is now:**
- 🔗 Connected to Gemini AI
- 🛡️ Securely handling API keys
- ⚡ Ready for frontend integration
- 🧪 Fully tested and working

---

## 📞 Need Help?

1. **Check the logs** in your terminal
2. **Test each endpoint** individually
3. **Verify API key** is correct and has permissions
4. **Check network connectivity** to Google APIs
5. **Review error messages** for specific issues

**Common fixes:**
- Restart the backend: `Ctrl+C` then `python app.py`
- Clear browser cache and reload
- Check firewall/antivirus isn't blocking port 5000
- Verify Python version is 3.7+ with `python --version`

---

*Your AI-powered beauty assistant backend is ready! 🚀*

**Next:** Open `test-integration.html` and click the test buttons!
