# ⚡ Prism AI - Quick Start Guide

Get your AI beauty assistant running in **~25 minutes** (secure setup)!

---

## 🚀 3-Step Secure Setup

### **Step 1: Appwrite Database** (10 min)

1. Go to **Appwrite Console**: https://cloud.appwrite.io/
2. Select project: **AI VOGUE** (68dd18860033ab7dffac)
3. Navigate to: **Databases** → Click your database
4. Click **"Create Collection"**
5. Name: `user_preferences`
6. Set permissions to **"Users"** for Create, Read, Update, Delete

**Add these 13 attributes** (click "Add Attribute" for each):

```
userId              String    Size: 255   Required ✅
skinType            String    Size: 50    Required ✅
skinConcern         String    Size: 50    Required ✅
hairType            String    Size: 50    Optional
hairTexture         String    Size: 50    Optional
hairConcern         String    Size: 50    Optional
stylePreference     String    Size: 50    Required ✅
skincareBudget      String    Size: 50    Required ✅
fashionBudget       String    Size: 50    Required ✅
shoppingFrequency   String    Size: 50    Required ✅
occasions           String    Size: 50    Required ✅
ageRange            String    Size: 50    Required ✅
updatedAt           DateTime                Required ✅
```

**Optional arrays** (for future features):
```
allergens               String[]   Size: 2000
preferredIngredients    String[]   Size: 2000
avoidIngredients        String[]   Size: 2000
```

---

### **Step 2: Deploy Secure Gemini Function** (10 min)

**🔐 Security Note:** We use Appwrite Functions to keep your API key secure!

1. **Get Gemini API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)
   - Keep it handy for next step

2. **Deploy Appwrite Function:**
   - Go to: https://cloud.appwrite.io
   - Select project: AI VOGUE
   - Click "Functions" → "Create Function"
   - Name: `Gemini AI Proxy`
   - Function ID: `gemini-proxy`
   - Runtime: `Node.js 18.0`
   - Click "Create"

3. **Upload Code:**
   - In function page, click "Source" tab
   - Create a zip file with:
     - `appwrite-functions/gemini-proxy/index.js`
     - `appwrite-functions/gemini-proxy/package.json`
   - Upload zip file
   - Click "Deploy"

4. **Add Environment Variable:**
   - Click "Settings" tab
   - Scroll to "Environment Variables"
   - Click "Add Variable"
   - Key: `GEMINI_API_KEY`
   - Value: `[paste your API key]`
   - Click "Save"

5. **Verify Deployment:**
   - Status should show "Active" ✅
   - Click "Execute" tab to test

**📖 Detailed Guide:** See `APPWRITE-FUNCTION-DEPLOYMENT.md`

---

### **Step 3: Launch & Test** (2 min)

1. Open `prism-ai-appwrite.html` in your browser
2. Complete the 11-question quiz
3. Ask: **"Recommend a moisturizer for my skin type"**
4. See AI-powered product recommendations! ✨

---

## ✅ Verification

**After completing the quiz:**
- ✅ Check browser console: "Preferences saved to Appwrite"
- ✅ Go to Appwrite → user_preferences → See your data
- ✅ Chat should show personalized welcome message

**After asking for recommendations:**
- ✅ Typing indicator appears
- ✅ Products display with compatibility %
- ✅ Pros/cons show for your skin type
- ✅ Purchase links are clickable

---

## 🐛 Troubleshooting

### "Gemini API key not configured"
→ Check `js/config/api-keys.js` - make sure you replaced the placeholder

### "Collection not found"
→ Verify collection name is exactly: `user_preferences`

### No products showing
→ Open DevTools Console (F12) and check for errors

### Preferences not saving
→ Ensure Appwrite permissions are set to "Users" (not "Any")

---

## 📱 What You Built

✨ **11-Question Personalized Quiz**
- Skin type & concerns
- Hair type, texture & concerns
- Style preferences & budget
- Shopping habits & occasions

🧠 **AI-Powered Recommendations**
- Gemini AI integration
- Context-aware responses
- Product suggestions with details

📊 **Smart Compatibility Analysis**
- 0-100% matching scores
- Ingredient analysis
- Personalized pros/cons

💾 **Cloud Storage**
- Permanent Appwrite storage
- Offline fallback
- Auto-sync when online

---

## 🎯 Try These Queries

```
"Best moisturizer for oily skin"
"Shampoo for curly dry hair"
"Anti-aging serum recommendations"
"Affordable skincare routine"
"Outfit for casual work meeting"
"Products for sensitive skin"
```

---

## 📚 Full Documentation

- **Setup Guide**: `SETUP-CHECKLIST.md`
- **Implementation Details**: `IMPLEMENTATION-SUMMARY.md`
- **Technical Guide**: `PRISM-AI-IMPLEMENTATION-GUIDE.md`

---

## 🔐 Why Appwrite Functions?

**Previous Setup (Insecure):**
- ❌ API key exposed in browser code
- ❌ Anyone can copy and misuse your key
- ❌ No control over usage

**New Setup (Secure):**
- ✅ API key hidden in server environment
- ✅ Only authenticated users can access
- ✅ Full monitoring and logging
- ✅ Enterprise-grade security

**Learn More:** See `SECURITY-UPGRADE.md` for architecture details

---

**🎉 That's it! You're ready to go!**

Need help? Check the console for errors or refer to the detailed guides.

*Happy recommending! 💄✨*
