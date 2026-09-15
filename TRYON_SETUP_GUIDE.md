# Try-On Images Setup Guide (No Database Needed!)

## Overview
This guide shows you how to set up pre-generated try-on images **without needing database IDs**. We use product image URLs as identifiers instead.

---

## Quick Setup (Manual - 10 minutes)

### Step 1: Create Appwrite Bucket

1. Go to [Appwrite Console](https://nyc.cloud.appwrite.io/console)
2. Navigate to **Storage** → **Create Bucket**
3. Name: `product-tryons`
4. Click **Create**
5. Go to **Settings** → **Permissions**
6. Add permission: **Role: Any** → **Read** access
7. Save

### Step 2: Upload Your 5 Images

1. In the `product-tryons` bucket, click **Add File**
2. Upload each of your 5 try-on images:
   - Black shirt image
   - Pink shirt image
   - Plaid shirt image
   - Camo shirt image
   - Striped shirt image

3. **For each uploaded file**, note down the **File ID** (looks like: `67abc123def456`)

### Step 3: Get Product Image URLs

For each product on your website:
1. Right-click on the product image
2. Select **Copy Image Address**
3. Note it down

Example URLs:
```
https://example.com/images/black-shirt.jpg
https://example.com/images/pink-shirt.jpg
```

### Step 4: Update Mapping File

Open `frontend/js/tryon-image-mapping.js` and update the `imageMap`:

```javascript
imageMap: {
    // Black Shirt
    'https://your-site.com/images/black-shirt.jpg': '67abc123def456',
    
    // Pink Shirt
    'https://your-site.com/images/pink-shirt.jpg': '67def789ghi012',
    
    // Plaid Shirt
    'https://your-site.com/images/plaid-shirt.jpg': '67jkl345mno678',
    
    // Camo Shirt
    'https://your-site.com/images/camo-shirt.jpg': '67pqr901stu234',
    
    // Striped Shirt
    'https://your-site.com/images/striped-shirt.jpg': '67vwx567yza890'
}
```

### Step 5: Include Script in HTML

Add this line to your product page HTML (before `gemini-tryon.js`):

```html
<script src="js/tryon-image-mapping.js"></script>
<script src="js/gemini-tryon.js"></script>
```

### Step 6: Test

1. Go to a product page
2. Click **Try Now**
3. Should show the pre-generated image instantly!

---

## Automated Setup (Script - 5 minutes)

### Prerequisites
```bash
cd scripts
npm install node-appwrite
```

### Step 1: Get Appwrite API Key

1. Go to Appwrite Console → **Settings** → **View API Keys**
2. Click **Create API Key**
3. Name: `Try-On Upload Script`
4. Scopes: Select **files.write**
5. Copy the API key

### Step 2: Prepare Images

1. Copy your 5 uploaded images to the `scripts` folder
2. Rename them:
   ```
   black_shirt.png
   pink_shirt.png
   plaid_shirt.png
   camo_shirt.png
   striped_shirt.png
   ```

### Step 3: Configure Script

Edit `scripts/upload-tryon-images.js`:

1. Add your API key:
   ```javascript
   apiKey: 'YOUR_API_KEY_HERE'
   ```

2. Add product image URLs:
   ```javascript
   productImageUrl: 'https://your-site.com/images/black-shirt.jpg'
   ```

### Step 4: Run Script

```bash
node upload-tryon-images.js
```

The script will:
- Upload all 5 images to Appwrite
- Generate the mapping automatically
- Save it to `generated-mapping.json`

### Step 5: Copy Mapping

Copy the generated mapping from console output to `tryon-image-mapping.js`

---

## How It Works

### Without Database IDs:

```
Product Image URL → Try-On Image File ID
```

**Example Flow:**

1. User clicks "Try Now" on a product
2. System gets product's image URL: `https://site.com/black-shirt.jpg`
3. Looks up in mapping: `'https://site.com/black-shirt.jpg'` → `'67abc123'`
4. Fetches from Appwrite: `https://nyc.cloud.appwrite.io/.../67abc123/view`
5. Displays try-on image instantly!

**No database queries needed!**

---

## Troubleshooting

### Image not showing?

1. Check browser console for errors
2. Verify product image URL matches exactly in mapping
3. Verify Appwrite bucket has public read permissions
4. Check file ID is correct

### Wrong image showing?

- Product image URL in mapping doesn't match
- Check for typos in URLs (case-sensitive!)

### All images showing same result?

- Mapping might have duplicate file IDs
- Verify each product has unique image URL

---

## Benefits of This Approach

✅ **No database needed** - Uses image URLs as keys  
✅ **Simple** - Just a JavaScript object mapping  
✅ **Fast** - Instant lookup  
✅ **Reliable** - No API calls to database  
✅ **Easy to update** - Just edit the mapping file  

---

## Next Steps

After setup:
1. Test with all 5 products
2. Verify correct images show for each
3. Add more products as needed
4. Consider adding multiple try-on images per product (carousel)
