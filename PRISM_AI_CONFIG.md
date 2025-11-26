# Prism AI 3.0 - Configuration Guide

Quick reference for all configuration values needed to run Prism AI 3.0.

## 📋 Configuration Checklist

### 1. Backend Environment Variables

File: `e:\Projects\website_v5\website_v5\backend\.env`

```env
# === REQUIRED ===
GEMINI_API_KEY=AIza...................................  # From https://makersuite.google.com/app/apikey
SERP_API_KEY=abc123.................................  # From https://serpapi.com/manage-api-key

# === OPTIONAL (but recommended) ===
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=65f4...........................  # From Appwrite console
APPWRITE_API_KEY=standard_abc123...................  # Server-side API key from Appwrite
APPWRITE_DATABASE_ID=65f5..........................  # Your database ID
APPWRITE_COLLECTION_ID=65f6........................  # user_profiles collection ID

# === SERVER ===
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

### 2. Frontend Appwrite Config

File: `e:\Projects\website_v5\website_v5\frontend\public\appwrite-config-v3.js`

**Line 10-15:**
```javascript
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '65f4...',           // MUST match backend
    databaseId: '65f5...',          // MUST match backend  
    collectionId: '65f6...'         // MUST match backend
};
```

### 3. Frontend API Endpoint

File: `e:\Projects\website_v5\website_v5\frontend\public\prism-ai-3.js`

**Line ~267:**
```javascript
this.apiEndpoint = 'http://localhost:3000/api/chat';
```

**For production, change to:**
```javascript
this.apiEndpoint = 'https://your-backend-domain.com/api/chat';
```

## 🗄️ Appwrite Collection Schema

Create in Appwrite Console:

**Database Name:** `prism-ai-db` (or your choice)

**Collection Name:** `user_profiles`

**Attributes:**

| Attribute Name | Type | Size | Required | Array | Default |
|----------------|------|------|----------|-------|---------|
| userId | String | 255 | Yes | No | - |
| skinType | String | 50 | No | No | - |
| skinConcerns | String | 50 | No | Yes | - |
| hairType | String | 50 | No | No | - |
| hairThickness | String | 50 | No | No | - |
| scalpType | String | 50 | No | No | - |
| hairConcerns | String | 50 | No | Yes | - |
| clothingStyles | String | 50 | No | Yes | - |
| skincareBudgetMin | Integer | - | No | No | 200 |
| skincareBudgetMax | Integer | - | No | No | 1000 |
| haircareBudgetMin | Integer | - | No | No | 200 |
| haircareBudgetMax | Integer | - | No | No | 800 |
| fashionBudgetMin | Integer | - | No | No | 500 |
| fashionBudgetMax | Integer | - | No | No | 3000 |
| createdAt | String | 50 | No | No | - |
| updatedAt | String | 50 | No | No | - |

**Indexes:**
- **Key:** `userId` (Unique, Ascending)

**Permissions (Development):**
- ✅ Create: Anyone
- ✅ Read: Anyone
- ✅ Update: Anyone
- ❌ Delete: None

**Permissions (Production):**
- Create: Users
- Read: Users (own documents only)
- Update: Users (own documents only)
- Delete: None

## 📍 File Locations Summary

```
website_v5/
├── frontend/
│   └── public/
│       ├── prism-ai-3.0.html        ← Main page
│       ├── prism-ai-3.js            ← Frontend logic
│       └── appwrite-config-v3.js    ← Config: Lines 10-15
│
└── backend/
    ├── server.js                     ← Main server
    ├── api/
    │   └── chat.js                   ← Chat endpoint
    ├── package.json                  ← Dependencies
    ├── .env                          ← Config (CREATE THIS)
    ├── .env.example                  ← Template
    └── PRISM_AI_README.md            ← Backend docs
```

## 🔑 Where to Get API Keys

### Gemini API
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API key"
4. Copy key (starts with `AIza`)
5. **Free tier:** 60 requests/minute

### SERP API
1. Visit: https://serpapi.com/users/sign_up
2. Create account
3. Go to: https://serpapi.com/manage-api-key
4. Copy API key
5. **Free tier:** 100 searches/month

### Appwrite
1. Visit: https://cloud.appwrite.io/
2. Create account
3. Create project → Copy project ID
4. Create database → Copy database ID
5. Create collection (see schema above) →  Copy collection ID
6. Settings → API Keys → Create server key → Copy key

## ⚙️ Installation Commands

### Backend Setup
```bash
# Navigate to backend
cd e:\Projects\website_v5\website_v5\backend

# Install dependencies (only needed once)
npm install

# Create .env file
copy .env.example .env

# Edit .env (add your API keys)
notepad .env

# Start server
npm start

# Or for development with auto-reload
npm run dev
```

### Verify Backend Running
```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return:
# {"status":"OK","service":"Prism AI 3.0 Backend",...}
```

## 🌐 Running Frontend

### Option 1: Live Server (Recommended)
1. Open VS Code
2. Install "Live Server" extension
3. Right-click `prism-ai-3.0.html`
4. Select "Open with Live Server"
5. Opens on `http://127.0.0.1:5500/prism-ai-3.0.html`

### Option 2: Other HTTP Server
```bash
# Using Python
cd e:\Projects\website_v5\website_v5\frontend\public
python -m http.server 8000

# Opens on http://localhost:8000/prism-ai-3.0.html
```

### Option 3: Direct File (Limited)
```
file:///e:/Projects/website_v5/website_v5/frontend/public/prism-ai-3.0.html
```
⚠️ Note: CORS may block API calls. Use HTTP server instead.

## ✅ Verification Quick Test

```bash
# 1. Start backend
cd backend
npm start

# 2. In another terminal, test health
curl http://localhost:3000/health

# 3. Test chat endpoint
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{\"userId\":\"test\",\"message\":\"Hello\"}"

# 4. Open frontend
# Use Live Server or HTTP server

# 5. Test full flow
# - Open browser to frontend
# - Complete quiz
# - Send chat message
# - Verify products appear
```

## 🔐 Security Notes

### Development
- API keys in `.env` (never commit!)
- CORS allows localhost
- Appwrite allows "Anyone"

### Production
- Use environment variables on server
- Restrict CORS to production domain
- Implement proper authentication
- Appwrite permissions: Users only
- Use HTTPS for all requests
- Add rate limiting
- Validate all inputs

## 📝 Common Configuration Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| API keys not set | "Missing env vars" warning | Copy `.env.example` to `.env`, fill keys |
| Wrong Appwrite IDs | "Project not found" | Ensure frontend & backend IDs match |
| Wrong API endpoint | CORS error | Check `prism-ai-3.js` line 267 |
| CORS not configured | Network error | Add frontend URL to `ALLOWED_ORIGINS` |
| Appwrite permissions | "Unauthorized" | Set to "Anyone" for development |

## 🎯 Configuration Complete!

When properly configured, you should see:

**Backend console:**
```
✅ All required environment variables are configured
```

**Browser console:**
```
Prism AI 3.0 initialized successfully!
```

**No errors in:**
- Network tab (all requests 200 OK)
- Console (no red errors)

---

Need help? Check the [walkthrough.md](file:///C:/Users/HEMANTH/.gemini/antigravity/brain/56d54cd2-efa7-4efe-a782-ad529a89ef4e/walkthrough.md) for detailed setup and troubleshooting.
