# Gemini API Virtual Try-On - Quick Reference

## API Configuration

**API Key:** `AIzaSyCIPSSYzB8caDukQPAX7GpqWFhhg9YKZ1I`  
**Model:** `gemini-1.5-flash`  
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`

## Predefined Prompt

The system uses this optimized prompt to apply clothing to user photos:

```
You are a professional fashion stylist AI. Apply the clothing item from the second image onto the person in the first image.

Requirements:
- Ensure realistic fitting that matches the person's body shape and size
- Maintain proper lighting and shadows that match the original photo
- Create seamless integration with natural wrinkles and fabric draping
- Preserve the person's original pose, body proportions, and background
- The clothing should look naturally worn by the person, not pasted on
- Match the color and texture of the clothing item accurately
- Ensure the clothing fits the context (formal/casual) of the original photo

Generate a photorealistic image showing the person wearing the clothing item.
```

## How It Works

1. User clicks "Try Now" on any product page (shirts, pants, shoes)
2. If first time: Upload photo modal appears (max 50KB)
3. Photo is saved to Appwrite storage
4. Modal shows loading spinner with status message
5. System calls Gemini API with:
   - User's uploaded photo (base64)
   - Product image from database (base64)
   - Predefined prompt
6. AI generates new image with clothing applied
7. Result displays in modal

## Files Modified

- **Created:** `frontend/js/gemini-tryon.js` - API integration module
- **Modified:** `frontend/js/product.js` - Updated try-on flow
- **Modified:** All product HTML pages - Added script reference

## Key Functions

### In gemini-tryon.js
- `applyDressToImage(userImage, productImageUrl)` - Main API call
- `imageUrlToBase64(url)` - Convert product image to base64
- `fileToBase64(file)` - Convert uploaded file to base64

### In product.js
- `handleTryNow()` - Orchestrates entire try-on flow
- `showTryOnModalWithLoading()` - Shows loading state
- `displayTryOnResult(imageDataUrl)` - Shows generated image
- `showTryOnError(errorMessage)` - Shows error messages

## Testing

1. Navigate to: `http://localhost:PORT/frontend/public/shirts.html`
2. Click any product
3. Click "Try Now" button
4. Upload a front-facing photo (under 50KB)
5. Wait for AI to generate result
6. View the virtual try-on in the modal

## Important Notes

⚠️ **API Key Security:** Currently hardcoded - move to backend for production  
📸 **Photo Requirements:** Clear, front-facing, well-lit photos work best  
⏱️ **Processing Time:** May take 5-10 seconds depending on API response  
🔄 **Retry:** Users can reupload photos using "Reupload Photo" button
