# AI VOGUE - Python Backend

Simple, fast, and secure Python Flask backend for Prism AI recommendations.

## 🚀 **Quick Start**

### **1. Setup Environment (no .env files)**

Set environment variables in your shell, Appwrite Function settings, Docker/Docker Compose, or hosting platform. Do not commit keys to a `.env` file.

Windows PowerShell:
```powershell
$Env:GEMINI_API_KEY = "your_gemini_api_key_here"
$Env:APPWRITE_API_KEY = "your_appwrite_api_key_here"
```

Linux/macOS (Bash):
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
export APPWRITE_API_KEY="your_appwrite_api_key_here"
```

### **2. Install Dependencies**

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### **3. Run the Backend**

```bash
# Start the Flask server
python app.py
```

**Backend will be available at:** `http://localhost:5000`

### **4. Test the Backend**

```bash
# Health check
curl http://localhost:5000/health

# Test endpoint
curl -X POST http://localhost:5000/api/test -H "Content-Type: application/json" -d "{\"test\": true}"
```

## 📁 **Project Structure**

```
python-api/
├── app.py                 # Main Flask application
├── env_template.txt       # Environment template (optional - do not commit secrets)
├── env_template.txt       # Environment template
├── requirements.txt       # Python dependencies
├── services/
│   ├── __init__.py
│   └── gemini_service.py  # Gemini AI integration
├── utils/
│   ├── __init__.py
│   ├── validators.py      # Request validation
│   └── response_parser.py # AI response parsing
└── README.md             # This file
```

## 🔧 **Configuration**

### **Environment Variables (set in shell or deployment)**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | - | Your Gemini API key |
| `GEMINI_MODEL` | ❌ No | `gemini-2.5-flash` | Gemini model to use |
| `FLASK_ENV` | ❌ No | `development` | Flask environment |
| `FLASK_DEBUG` | ❌ No | `True` | Enable debug mode |
| `CORS_ORIGINS` | ❌ No | `http://localhost:8000` | Allowed CORS origins |
| `MAX_TOKENS` | ❌ No | `512` | Max AI response tokens |
| `TEMPERATURE` | ❌ No | `0.7` | AI creativity (0-1) |
| `REQUEST_TIMEOUT` | ❌ No | `30` | Request timeout (seconds) |

### **Get Gemini API Key**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set the key as an environment variable in your shell or deployment (do not commit it to `.env`). Example (PowerShell):
```powershell
$Env:GEMINI_API_KEY = "your_gemini_api_key_here"
```

## 📡 **API Endpoints**

### **Health Check**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T20:05:00.000Z",
  "service": "AI VOGUE Python Backend",
  "version": "1.0.0"
}
```

### **AI Recommendations**
```http
POST /api/recommend
```

**Request:**
```json
{
  "userQuery": "Recommend a moisturizer for oily skin",
  "userProfile": {
    "skinType": "oily",
    "skinConcern": "acne",
    "skincareBudget": "mid",
    "ageRange": "twenties",
    "allergens": ["fragrance"]
  },
  "imageData": "base64_string" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generalAdvice": "For oily, acne-prone skin...",
    "products": [
      {
        "name": "CeraVe Foaming Cleanser",
        "brand": "CeraVe",
        "category": "Skincare",
        "price": "$14.99",
        "ingredients": ["Ceramides", "Niacinamide"],
        "purchaseLink": "https://www.amazon.com/...",
        "compatibility": 92,
        "pros": ["Oil-free", "Non-comedogenic"],
        "cons": ["May be drying"],
        "applicationTips": "Use twice daily"
      }
    ],
    "additionalTips": ["Use sunscreen", "Avoid heavy oils"]
  },
  "processingTime": "2.3s",
  "timestamp": "2025-10-04T20:05:00.000Z"
}
```

### **Test Endpoint**
```http
POST /api/test
```

**Request:**
```json
{
  "test": true,
  "message": "Test message"
}
```

## 🧪 **Testing**

### **Manual Testing**

1. **Start the backend:**
   ```bash
   python app.py
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Test AI recommendations:**
   ```bash
   curl -X POST http://localhost:5000/api/recommend \
     -H "Content-Type: application/json" \
     -d '{
       "userQuery": "Recommend a cleanser",
       "userProfile": {"skinType": "oily"}
     }'
   ```

### **Frontend Integration Testing**

1. **Start Python backend:**
   ```bash
   cd backend/python-api
   python app.py
   ```

2. **Start frontend:**
   ```bash
   cd frontend/public
   python -m http.server 8000
   ```

3. **Open browser:**
   ```
   http://localhost:8000/prism-ai-appwrite.html
   ```

4. **Test AI recommendations in the interface**

## 🔍 **Troubleshooting**

### **Common Issues**

**1. "GEMINI_API_KEY not found"**
```bash
# Solution: Export the environment variable in your shell (PowerShell/Bash) or configure it in your deployment platform
export GEMINI_API_KEY="your_gemini_api_key_here"
```

**2. "Module not found" errors**
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**3. "CORS policy blocked"**
```bash
# Solution: Check CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

**4. "Connection refused" from frontend**
```bash
# Solution: Ensure Python backend is running
python app.py
# Should show: Running on http://localhost:5000
```

**5. "Gemini API error: 404"**
```bash
# Solution: Check your API key and model
# Try different model in .env:
GEMINI_MODEL=gemini-2.5-pro
```

### **Debug Mode**

Enable detailed logging:
```bash
# In .env
FLASK_DEBUG=True
```

View logs in terminal where you run `python app.py`.

## 🚀 **Deployment**

### **Local Development**
```bash
python app.py
# Runs on http://localhost:5000
```

### **Production (Optional)**

**Using Gunicorn:**
```bash
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 app:app
```

**Using Railway/Render:**
1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy automatically

## 📊 **Performance**

### **Expected Response Times**
- **Health check:** < 50ms
- **AI recommendations:** 2-5 seconds
- **Test endpoint:** < 100ms

### **Optimization Tips**
- Use `gemini-2.5-flash` for fastest responses
- Keep `MAX_TOKENS` at 512 or lower
- Implement caching for frequent queries (future enhancement)

## 🔒 **Security**

### **Best Practices**
- ✅ API key stored in environment variables
- ✅ CORS configured for specific origins
- ✅ Input validation on all endpoints
- ✅ Request timeout protection
- ✅ Error handling without exposing internals

### **Production Considerations**
- Use HTTPS in production
- Set up rate limiting
- Monitor API usage
- Rotate API keys regularly
- Use environment-specific configurations

## 🔄 **Migration from Appwrite Functions**

### **What Changed**
- ❌ **Before:** Complex Appwrite Function deployment
- ✅ **After:** Simple `python app.py`

- ❌ **Before:** Function timeouts and debugging issues
- ✅ **After:** Direct Python debugging with print statements

- ❌ **Before:** 30+ second response times
- ✅ **After:** 2-5 second responses

### **What Stayed the Same**
- ✅ Frontend code (minimal changes)
- ✅ Appwrite database for user preferences
- ✅ Same API request/response format
- ✅ All existing functionality

## 📚 **Additional Resources**

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Python Requests Documentation](https://requests.readthedocs.io/)

---

## 🎯 **Next Steps**

1. ✅ **Setup complete** - Backend is ready to use
2. 🔄 **Test integration** - Verify frontend works with Python backend
3. 🚀 **Deploy** - Optional deployment to cloud service
4. 📈 **Enhance** - Add caching, analytics, etc.

**Your Python backend is now ready! Start it with `python app.py` and test the integration.** 🚀
