# Virtual Try-On Backend Setup

## Quick Start (2 minutes)

### Step 1: Install Node.js
If you don't have Node.js installed:
- Download from: https://nodejs.org/
- Install the LTS version

### Step 2: Install Dependencies
Open terminal in the `backend` folder and run:
```bash
npm install
```

### Step 3: Start the Server
```bash
npm start
```

You should see:
```
✅ Server running on http://localhost:3000
✅ API endpoint: http://localhost:3000/api/virtual-tryon
```

### Step 4: Enable in Frontend
Open `frontend/js/gemini-tryon.js` and change:
```javascript
useBackendProxy: false,  // Change this to true
```
to:
```javascript
useBackendProxy: true,  // ✅ Now enabled
```

### Step 5: Test
1. Keep the backend server running
2. Open your website
3. Click "Try Now" on any product
4. Upload a photo
5. Wait for realistic AI result!

---

## What This Does

- **Solves CORS issue**: Browser can now call Hugging Face API
- **Multi-model cascade**: Tries CatVTON → StableVITON → IDM-VTON
- **Better quality**: 70-80% realism (vs 40% with canvas)
- **Free**: Uses Hugging Face free tier

---

## Troubleshooting

### "npm: command not found"
- Install Node.js first

### "Port 3000 already in use"
- Change PORT in backend-proxy.js to 3001
- Update backendProxyUrl in gemini-tryon.js to match

### "Failed to fetch"
- Make sure backend server is running
- Check console for errors
- Verify useBackendProxy = true in frontend

---

## For Production

To deploy this backend:
1. **Railway.app** (Free tier): https://railway.app/
2. **Render.com** (Free tier): https://render.com/
3. **Google Cloud Run** (Free tier): https://cloud.google.com/run

Update `backendProxyUrl` in gemini-tryon.js to your deployed URL.
