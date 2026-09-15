# 🔐 Secure Appwrite Function Deployment Guide

## Why Use Appwrite Functions?

**Security Problem:** Storing API keys in client-side JavaScript exposes them to anyone who views your code.

**Solution:** Appwrite Functions act as a secure server-side proxy that:
- ✅ Keeps your Gemini API key secret
- ✅ Prevents unauthorized API usage
- ✅ Adds rate limiting and monitoring
- ✅ Enables server-side logic

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. ✅ Appwrite Cloud account (cloud.appwrite.io)
2. ✅ Gemini API key from https://makersuite.google.com/app/apikey
3. ✅ Appwrite CLI installed (optional, for command-line deployment)

---

## 🚀 Deployment Methods

### **Method 1: Web Console (Recommended for Beginners)**

#### Step 1: Navigate to Functions
```
1. Go to: https://cloud.appwrite.io
2. Select your project: AI VOGUE (68dd18860033ab7dffac)
3. Click "Functions" in the left sidebar
4. Click "Create Function"
```

#### Step 2: Configure Function
```
Function Name:    Gemini AI Proxy
Function ID:      gemini-proxy
Runtime:          Node.js 18.0
Entrypoint:       index.js
Execute Access:   Users (authenticated users only)
```

#### Step 3: Upload Code
```
1. Click "Source" tab
2. Click "Manual" deployment
3. Create a new folder locally with these files:
   - index.js (copy from appwrite-functions/gemini-proxy/index.js)
   - package.json (copy from appwrite-functions/gemini-proxy/package.json)
4. Zip the folder
5. Upload the zip file
6. Click "Deploy"
```

#### Step 4: Add Environment Variables
```
1. Click "Settings" tab
2. Scroll to "Environment Variables"
3. Click "Add Variable"
   - Key: GEMINI_API_KEY
   - Value: [Your Gemini API key from makersuite.google.com]
4. Click "Save"
```

#### Step 5: Test Function
```
1. Click "Execute" tab
2. Add test payload:
{
  "userQuery": "Recommend a moisturizer",
  "userProfile": {
    "skinType": "oily",
    "skincareBudget": "mid"
  }
}
3. Click "Execute"
4. Check response for success
```

---

### **Method 2: CLI Deployment (Advanced)**

#### Install Appwrite CLI
```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri https://appwrite.io/cli/install.ps1 -OutFile install.ps1; ./install.ps1

# macOS/Linux
curl -sL https://appwrite.io/cli/install.sh | bash
```

#### Login to Appwrite
```bash
appwrite login
```

#### Initialize Project
```bash
cd e:\Projects\website_v5\website_v5

appwrite init function
# Choose:
# - Function ID: gemini-proxy
# - Runtime: Node.js 18.0
```

#### Deploy Function
```bash
cd appwrite-functions/gemini-proxy

appwrite deploy function \
  --function-id gemini-proxy
```

#### Set Environment Variable
```bash
appwrite functions updateVariable \
  --functionId gemini-proxy \
  --key GEMINI_API_KEY \
  --value "YOUR_GEMINI_API_KEY_HERE"
```

---

## 🔧 Configuration

### Function Settings

**Timeout:** 30 seconds (adjust if needed for slow responses)

**Memory:** 512 MB (default is sufficient)

**Execute Access:** 
- Set to "Users" to require authentication
- OR set to "Any" for public access (not recommended)

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | `AIzaSy...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_RETRIES` | Retry attempts for API | `3` |
| `TIMEOUT_MS` | Request timeout | `30000` |
| `RATE_LIMIT` | Max requests/min | `10` |

---

## ✅ Verification Steps

### 1. Check Function Status
```
1. Go to Appwrite Console → Functions → gemini-proxy
2. Status should show "Active" (green dot)
3. Last execution should show successful runs
```

### 2. Test from Client
```javascript
// In browser console:
const { functions } = await import('./js/appwrite-config.js');

const result = await functions.createExecution(
    'gemini-proxy',
    JSON.stringify({
        userQuery: 'Test query',
        userProfile: { skinType: 'normal' }
    })
);

console.log(JSON.parse(result.responseBody));
```

### 3. Monitor Logs
```
1. Appwrite Console → Functions → gemini-proxy
2. Click "Executions" tab
3. View recent executions and their logs
4. Check for any errors
```

---

## 🐛 Troubleshooting

### Error: "Function not found"
**Cause:** Function ID mismatch or function not deployed

**Solution:**
```javascript
// Check function ID in gemini-service.js line 8:
this.functionId = 'gemini-proxy'; // Must match Appwrite

// Verify deployment in Appwrite Console → Functions
```

### Error: "GEMINI_API_KEY not configured"
**Cause:** Environment variable not set

**Solution:**
```
1. Appwrite Console → Functions → gemini-proxy → Settings
2. Environment Variables section
3. Add: GEMINI_API_KEY = your-key
4. Redeploy function
```

### Error: "Execution failed"
**Cause:** Code error or dependency issue

**Solution:**
```
1. Check Appwrite Console → Executions → View Logs
2. Look for error messages
3. Common issues:
   - Missing package.json dependencies
   - Syntax errors in index.js
   - API key incorrect format
```

### Error: "Timeout"
**Cause:** Function taking too long (>30s)

**Solution:**
```
1. Increase timeout in Function Settings
2. Or optimize prompt to reduce AI response time
```

### Error: "Permission denied"
**Cause:** User not authenticated

**Solution:**
```javascript
// Ensure user is logged in before calling:
const user = await authService.getCurrentUser();
if (!user) {
    console.error('Please log in first');
}
```

---

## 📊 Monitoring & Limits

### Free Tier Limits (Appwrite)
- **Executions:** 750,000/month
- **Bandwidth:** 2GB
- **Storage:** 2GB
- **Build Time:** 900 minutes/month

### Gemini API Limits (Free)
- **Requests:** 60/minute, 1,500/day
- **Rate limiting** built into function

### Monitor Usage
```
1. Appwrite Console → Overview
2. View executions graph
3. Check bandwidth usage
4. Set up alerts for quota limits
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep API key in environment variables only
- Use "Users" execute access (require authentication)
- Add input validation in function
- Monitor for unusual activity
- Rotate API keys periodically
- Set up rate limiting

### ❌ DON'T:
- Never commit API keys to Git
- Don't use "Any" execute access in production
- Don't log API keys in function code
- Avoid storing sensitive data in function logs

---

## 🚦 Cost Optimization

### Reduce Appwrite Function Executions
```javascript
// Client-side caching (already implemented)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Only call function if cache expired
if (cacheValid) {
    return cachedResponse;
}
```

### Reduce Gemini API Calls
```javascript
// Implement debouncing
let debounceTimer;
function debouncedQuery(query) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        // Call function
    }, 500);
}
```

---

## 📈 Scaling

### When to Upgrade

**Free tier sufficient for:**
- Development and testing
- Small user base (<100 active users)
- Low traffic sites (<10,000 requests/month)

**Consider Pro tier when:**
- >100 active users
- >750K function executions/month
- Need custom domains
- Require priority support

### Pro Tier Benefits
- 5M executions/month
- 150GB bandwidth
- Priority support
- Custom domains
- 99.99% SLA

---

## 🔄 Updates & Maintenance

### Update Function Code
```bash
# Method 1: CLI
cd appwrite-functions/gemini-proxy
# Edit index.js
appwrite deploy function --function-id gemini-proxy

# Method 2: Web Console
# 1. Edit code locally
# 2. Zip files
# 3. Upload in Console → Functions → Source
```

### Update Environment Variables
```
1. Console → Functions → gemini-proxy → Settings
2. Environment Variables
3. Edit GEMINI_API_KEY
4. Click "Update"
5. Function auto-restarts with new value
```

### Rollback to Previous Version
```
1. Console → Functions → gemini-proxy → Deployments
2. View deployment history
3. Click "..." on previous version
4. Select "Activate"
```

---

## 📝 Testing Checklist

Before going live, test:

- [ ] Function deploys successfully
- [ ] Environment variable is set
- [ ] Test execution in Console works
- [ ] Client can call function
- [ ] AI returns proper responses
- [ ] Error handling works
- [ ] Rate limiting functions
- [ ] Logs show correct info
- [ ] No API key leaks in responses
- [ ] Authentication required (if set)

---

## 🎯 Next Steps

After successful deployment:

1. **Remove old API key references**
   ```javascript
   // DELETE or comment out in api-keys.js:
   // geminiApiKey: 'AIza...' // NO LONGER NEEDED
   ```

2. **Update documentation**
   - Update QUICK-START.md
   - Remove API key setup instructions
   - Add function deployment section

3. **Monitor for 24 hours**
   - Check execution logs
   - Verify no errors
   - Monitor usage metrics

4. **Optimize as needed**
   - Adjust timeout settings
   - Tune rate limiting
   - Improve error messages

---

## 📞 Support Resources

- **Appwrite Docs:** https://appwrite.io/docs/products/functions
- **Appwrite Discord:** https://appwrite.io/discord
- **Gemini API Docs:** https://ai.google.dev/docs
- **GitHub Issues:** Create issue in your repo

---

## ✨ Benefits Summary

**Security:**
- ✅ API key hidden from client
- ✅ Server-side validation
- ✅ Request monitoring

**Reliability:**
- ✅ Built-in retry logic
- ✅ Error handling
- ✅ Timeout management

**Scalability:**
- ✅ Auto-scaling by Appwrite
- ✅ Global edge deployment
- ✅ Load balancing

**Cost-Effective:**
- ✅ Free tier generous
- ✅ Pay as you grow
- ✅ No server maintenance

---

**🎉 Your Gemini AI is now secure and production-ready!**

*Last Updated: October 4, 2024*
*Version: 1.0.0*
