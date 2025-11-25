# PSD to PNG Conversion Guide - Your Black T-shirt Mockup

## 📁 Your File
**Location**: `E:\Projects\website_v5\psd-isolated-pack-black-tshirts-front-view\psd_isolated_pack_of_black_tshirts_front_view.psd`

---

## 🔄 Conversion Options

### **Option 1: Use Photopea (Free Online - RECOMMENDED)**

1. **Open Photopea**
   - Go to: https://www.photopea.com/

2. **Open Your PSD**
   - Click "File" → "Open"
   - Navigate to: `E:\Projects\website_v5\psd-isolated-pack-black-tshirts-front-view\`
   - Select: `psd_isolated_pack_of_black_tshirts_front_view.psd`

3. **Prepare the Image**
   - Look for layers panel on the right
   - Find the t-shirt layer (usually the main visible layer)
   - If there's a "Smart Object" or "Your Design Here" layer, delete it or hide it
   - Keep only the t-shirt mockup visible

4. **Export as PNG**
   - Click "File" → "Export As" → "PNG"
   - **Settings**:
     - Width: 3000 pixels (or keep original if larger)
     - Height: 3600 pixels (or keep original if larger)
     - Quality: 100%
     - Transparency: Checked ✓
   - Click "Save"

5. **Save Location**
   - Save as: `E:\Projects\website_v5\website_v5\frontend\public\creative-threads\mockups\normal-tee-front-black.png`

---

### **Option 2: Use Photoshop (If You Have It)**

1. Open the PSD in Photoshop
2. Delete/hide any smart object layers
3. Go to: File → Export → Export As
4. Format: PNG
5. Width: 3000px, Height: 3600px
6. Check "Transparency"
7. Export to: `E:\Projects\website_v5\website_v5\frontend\public\creative-threads\mockups\normal-tee-front-black.png`

---

### **Option 3: Use GIMP (Free Software)**

1. Download GIMP: https://www.gimp.org/downloads/
2. Install and open GIMP
3. Open the PSD file
4. Flatten image if needed
5. Export as PNG (3000 x 3600 px)
6. Save to mockups folder

---

## 📐 After Conversion - Measure Print Area

Once you have the PNG file, we need to measure where the print area is:

### **Using Photopea (Easy)**

1. Open the PNG in Photopea
2. Click the ruler tool or use guides
3. Measure the print area (the flat chest area where designs go)
4. Note these values:
   - **X** (left edge): Distance from left side to print area start
   - **Y** (top edge): Distance from top to print area start
   - **Width**: Width of the printable area
   - **Height**: Height of the printable area

### **Typical Values** (for reference)
For a 3000 x 3600 px mockup:
```javascript
print_area: {
    x: 750,      // 25% from left
    y: 900,      // 25% from top
    width: 1500, // 50% of image width
    height: 1800 // 50% of image height
}
```

---

## 🎯 Quick Action Steps

### **Step 1: Create Mockups Folder**
```powershell
# Run this in PowerShell
New-Item -ItemType Directory -Path "E:\Projects\website_v5\website_v5\frontend\public\creative-threads\mockups" -Force
```

### **Step 2: Convert PSD to PNG**
- Use Photopea.com (easiest)
- Export as PNG (3000 x 3600 px)
- Save to: `mockups\normal-tee-front-black.png`

### **Step 3: Tell Me When Done**
Once you have the PNG file, let me know and provide:
1. ✅ Confirmation that PNG is saved
2. ✅ Actual dimensions of the PNG (width x height)
3. ✅ Print area coordinates (I can help measure if needed)

---

## 🚀 What I'll Do Next

Once you provide the PNG file, I will:

1. ✅ Update `mock-data.js` to use the new mockup
2. ✅ Set the correct print area coordinates
3. ✅ Test the integration in the customizer
4. ✅ Show you how it looks
5. ✅ Make any adjustments needed

---

## 💡 Alternative: I Can Guide You Step-by-Step

If you'd like, you can:
1. Open Photopea.com right now
2. Share your screen or describe what you see
3. I'll guide you through the exact steps

Or if you prefer, just:
1. Convert the PSD to PNG using any method above
2. Save it in the mockups folder
3. Let me know it's ready!

---

## 📝 Expected Result

After conversion, you should have:
- **File**: `mockups/normal-tee-front-black.png`
- **Size**: ~3000 x 3600 pixels (or similar)
- **Format**: PNG with transparency
- **Quality**: High resolution, clear image

Then I'll integrate it and show you the live preview! 🎨
