# 🚀 Hugging Face Virtual Try-On Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Your Free API Token

1. Go to **[Hugging Face](https://huggingface.co/join)** and create a free account
2. Navigate to **[Settings → Access Tokens](https://huggingface.co/settings/tokens)**
3. Click **"New token"**
4. Give it a name (e.g., "AI-VOGUE-TryOn")
5. Select **"Read"** permission (free tier)
6. Click **"Generate token"**
7. **Copy the token** (starts with `hf_...`)

### Step 2: Add Token to Your Code

Open `frontend/js/gemini-tryon.js` and replace line 8:

**Before:**
```javascript
apiToken: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with actual token
```

**After:**
```javascript
apiToken: 'hf_YOUR_ACTUAL_TOKEN_HERE', // Your Hugging Face token
```

### Step 3: Test It!

1. Navigate to any product page (shirts, pants, shoes)
2. Click **"Try Now"**
3. Upload a clear, front-facing photo
4. Wait 10-30 seconds for AI processing
5. See realistic virtual try-on result!

## How It Works

### IDM-VTON Model

The system uses **[IDM-VTON](https://huggingface.co/yisol/IDM-VTON)**, one of the best free virtual try-on models:

✅ **Realistic fitting** - Adapts clothing to body shape  
✅ **Pose preservation** - Maintains person's original pose  
✅ **Natural draping** - Creates realistic fabric wrinkles  
✅ **Lighting match** - Matches original photo lighting  
✅ **Background preservation** - Keeps original background

### Processing Flow

```
User uploads photo
    ↓
Convert to proper format
    ↓
Send to Hugging Face API
    ↓
IDM-VTON processes (10-30 seconds)
    ↓
Receive realistic try-on image
    ↓
Display in modal
```

### API Parameters

The code uses optimized settings:
- `denoise_steps: 30` - Balance between quality and speed
- `is_checked: true` - Auto-masking for better results
- `seed: 42` - Reproducible results

## Fallback Behavior

**Without API token:**
- System uses canvas overlay (simple preview)
- Shows watermark: "Set Hugging Face API token for realistic try-on"

**With API token:**
- Uses AI-powered realistic try-on
- Professional quality results
- No watermark

## Free Tier Limits

Hugging Face free tier includes:
- **Unlimited requests** for inference API
- May have **rate limiting** during peak times
- **Model loading time** (~20 seconds first request)
- Subsequent requests are faster (model stays loaded)

## Troubleshooting

### "Model is loading" Error
- **Cause:** First request or model was unloaded
- **Solution:** Wait 20-30 seconds, system auto-retries
- **Status:** Shows in console logs

### "API token not set" Warning
- **Cause:** Token still has 'xxx' placeholder
- **Solution:** Replace with actual token from Step 1

### Slow Processing
- **Normal:** First request takes 20-30 seconds
- **Subsequent:** Usually 10-15 seconds
- **Peak times:** May take longer

### Poor Results
- **Photo quality:** Use clear, well-lit, front-facing photos
- **Pose:** Standing straight works best
- **Background:** Simple backgrounds give better results

## Alternative Models

You can switch to other models by changing line 12 in `gemini-tryon.js`:

```javascript
// Current (recommended)
modelEndpoint: 'https://api-inference.huggingface.co/models/yisol/IDM-VTON',

// Alternative 1: OOTDiffusion
modelEndpoint: 'https://api-inference.huggingface.co/models/levihsu/OOTDiffusion',

// Alternative 2: CatVTON (newer)
modelEndpoint: 'https://api-inference.huggingface.co/models/zhengchong/CatVTON',
```

## Advanced Configuration

### Adjust Quality vs Speed

In `gemini-tryon.js`, line 222:
```javascript
formData.append('denoise_steps', '30'); // Default: 30

// Options:
// '20' - Faster, lower quality
// '30' - Balanced (recommended)
// '50' - Slower, higher quality
```

### Change Retry Behavior

Lines 18-19:
```javascript
maxRetries: 3,        // Number of retry attempts
retryDelay: 2000      // Delay between retries (ms)
```

## Cost

✅ **100% FREE** with Hugging Face account  
✅ No credit card required  
✅ No hidden fees  
✅ Unlimited inference requests

## Support

- **Hugging Face Docs:** https://huggingface.co/docs/api-inference
- **IDM-VTON Model:** https://huggingface.co/yisol/IDM-VTON
- **Community:** https://huggingface.co/spaces

---

**Ready to go!** Just add your token and enjoy realistic AI-powered virtual try-on! 🎉
