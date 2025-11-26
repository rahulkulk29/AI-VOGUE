# 🔑 Backend Credentials Setup

## Create .env File

The `.env` file is gitignored for security. You need to create it manually.

### Step 1: Navigate to backend directory
```bash
cd e:\Projects\website_v5\website_v5\backend
```

### Step 2: Create .env file

**Option A: Using Command Prompt**
```bash
copy .env.example .env
notepad .env
```

**Option B: Using PowerShell**
```powershell
Copy-Item .env.example .env
notepad .env
```

**Option C: Manually create file**
1. Create a new file named `.env` (no extension)
2. Copy the content below

### Step 3: Paste this exact content into .env

```env
# Prism AI 3.0 - Backend Environment Variables
# ✅ CONFIGURED AND READY TO USE

# ============================================
# GEMINI API CONFIGURATION
# ============================================
GEMINI_API_KEY=AIzaSyCrcQOA0UEOuaVjQd2U-hk8SmEXddL8bxo

# ============================================
# SERP API CONFIGURATION
# ============================================
SERP_API_KEY=315405cd3e931795aa18ceb0a01da0b9629c5fc8838da836a6f1835eed093f8c

# ============================================
# APPWRITE CONFIGURATION (Server-side)
# ============================================
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=68dd18860033ab7dffac
APPWRITE_API_KEY=standard_84f3b53dad51d8adf0ce6835554ae869d8fa4a3095b6644176806ec85053977f0c3488fc5c85f5339db76c41098b7d072f2aa3aabc9a5d9596b3b4944787fb9c53384766fd47757ea8bbd793b42e951ab78731bae8fdb81f0c27b80a63597649eb62e8bae00fdb33159ee72ecc4841e27d0a278cefa51526b9c9401a773a0cee
APPWRITE_DATABASE_ID=68dd21f50029362dfb7a
APPWRITE_COLLECTION_ID=user_profiles

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# CORS CONFIGURATION
# ============================================
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000
```

### Step 4: Save and close

### Step 5: Verify

Run this command to check if the file exists:
```bash
dir .env
```

You should see `.env` listed.

## ✅ Ready to Start!

Now you can start the backend:
```bash
npm install
npm start
```

You should see:
```
✅ All required environment variables are configured
```

---

## 🔒 Security Note

**NEVER commit the `.env` file to Git!**

It's already in `.gitignore`, but double-check:
```bash
type .gitignore
```

Should contain:
```
.env
node_modules/
```
