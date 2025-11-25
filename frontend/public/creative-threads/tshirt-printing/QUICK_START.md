# 🚀 Quick Start Guide - AI VOGUE Custom T-Shirt Printing

**Get up and running in 30 seconds!**

---

## ⚡ **Instant Start**

### **Step 1: Open the App**

```bash
# Navigate to the directory
cd E:\Projects\website_v5\website_v5\frontend\public\creative-threads\tshirt-printing

# Open in your browser
start index.html
```

**OR** use Live Server in VS Code:
1. Right-click `index.html`
2. Select "Open with Live Server"

---

## 🎨 **Try It Out**

### **1. Select a Product**
- Scroll to "Choose Your Style"
- Click any t-shirt card
- Page scrolls to customizer

### **2. Customize**
- **Upload Image:** Click "Upload Design" → Drag & drop PNG/JPG
- **Add Text:** Click "Add Text" → Type text → Click "Add Text" button
- **Add Graphic:** Click "Graphics Library" → Click any emoji
- **Adjust:** Use transform sliders (scale, rotate, opacity)

### **3. Add to Cart**
- Click "Add to Cart" button
- Cart drawer slides in from right
- Click "Place Order" to simulate checkout

---

## 🎯 **Key Features to Test**

### **Canvas Editor**
- ✅ Drag objects around
- ✅ Resize with corner handles
- ✅ Rotate with rotation handle
- ✅ Double-click text to edit

### **Keyboard Shortcuts**
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Delete` - Delete selected
- `Shift+S` - Toggle print guides
- `0` - Reset zoom

### **File Upload**
- Drag & drop images
- Multiple files supported
- PSD files import layers

### **Pricing**
- Changes as you edit
- Shows breakdown
- Bulk discounts at 10, 25, 50, 100 units

---

## 📁 **File Structure**

```
tshirt-printing/
├── index.html              # Main app (open this!)
├── styles.css              # Styling
├── app.js                  # Application logic
├── README.md               # Full documentation
├── PROJECT_SUMMARY.md      # Technical docs
├── DELIVERY_SUMMARY.md     # What's included
└── assets/
    ├── mock-data.json      # Product data
    └── products/           # T-shirt mockups
```

---

## 🔧 **Customization**

### **Add Your Own Products**

Edit `assets/mock-data.json`:

```json
{
  "products": [
    {
      "productId": "my-tee",
      "name": "My Custom Tee",
      "base_price": 599,
      "variants": [{
        "type": "custom",
        "mockup_path": "assets/products/my-tee.png"
      }],
      "colors": [
        { "name": "Black", "hex": "#000000", "premium": false }
      ],
      "sizes": ["S", "M", "L", "XL"]
    }
  ]
}
```

### **Change Pricing**

Edit `app.js` (top of file):

```javascript
const PRICING = {
    sizeMultipliers: {
        'S': 1.0,
        'M': 1.0,
        'L': 1.1,  // ← Change these
        'XL': 1.2,
        'XXL': 1.3
    },
    colorPremium: {
        standard: 0,
        premium: 100  // ← Change premium surcharge
    }
};
```

---

## 🔌 **Connect to Appwrite**

### **Quick Setup**

1. **Create Appwrite Project**
   - Go to https://cloud.appwrite.io
   - Create new project
   - Copy project ID

2. **Add to `app.js`**

Replace this section:
```javascript
// ============================================
// MOCK API
// ============================================
mockAPI = {
    createOrder: async (order) => { ... }
}
```

With:
```javascript
// ============================================
// APPWRITE API
// ============================================
import { Client, Databases, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('YOUR_PROJECT_ID');

const databases = new Databases(client);

async createOrder(order) {
    return await databases.createDocument(
        'custom_tshirt_db',
        'orders',
        ID.unique(),
        order
    );
}
```

3. **Create Collections** (see README.md for schemas)

---

## 🎨 **Add Graphics**

### **Option 1: Use Emojis (Current)**
Already working! Graphics library shows 6 emojis.

### **Option 2: Add PNG Graphics**

1. Create/download 6 PNG graphics
2. Save to `assets/graphics/`
3. Update `mock-data.json`:

```json
{
  "graphics": [
    {
      "graphicId": "graphic-1",
      "name": "Logo",
      "path": "assets/graphics/logo.png",
      "tags": ["logo", "brand"]
    }
  ]
}
```

4. Update `loadGraphics()` in `app.js` to use real images

---

## 📱 **Test on Mobile**

### **Option 1: Local Network**

```bash
# Start local server
python -m http.server 8000

# Or use Live Server in VS Code
```

Then visit from phone: `http://YOUR_IP:8000`

### **Option 2: Deploy to Vercel**

```bash
npm install -g vercel
vercel --prod
```

Get instant HTTPS URL to test on any device.

---

## 🐛 **Troubleshooting**

### **Canvas Not Loading**
- Check browser console for errors
- Ensure Fabric.js CDN is accessible
- Try refreshing page

### **PSD Upload Not Working**
- Check file size (max 100MB)
- Verify PSD.js loaded (check console)
- Try simpler PSD file
- Use "Edit in Photopea" button instead

### **Pricing Not Updating**
- Open browser console
- Check for JavaScript errors
- Verify `calculatePrice()` is being called

### **Images Not Uploading**
- Check file type (PNG, JPG, PSD, SVG only)
- Verify file size (max 100MB)
- Check FilePond console messages

---

## 📚 **Learn More**

- **Full Documentation:** `README.md`
- **Technical Details:** `PROJECT_SUMMARY.md`
- **What's Included:** `DELIVERY_SUMMARY.md`

---

## 🎯 **Next Steps**

1. ✅ **Test the app** - Open `index.html` and play around
2. ⚠️ **Add real graphics** - Replace emoji placeholders
3. 🔌 **Connect Appwrite** - Set up database and storage
4. 🚀 **Deploy** - Use Vercel, Netlify, or Appwrite hosting

---

## 💡 **Pro Tips**

### **Keyboard Shortcuts**
Learn these for faster editing:
- `U` - Open upload dialog
- `Ctrl+Z` / `Ctrl+Y` - Undo/Redo
- `Delete` - Remove selected
- `Shift+S` - Toggle guides
- `+` / `-` - Zoom in/out
- `0` - Reset zoom

### **Layer Management**
- Click layer in list to select
- Eye icon toggles visibility
- Trash icon deletes layer
- Drag objects on canvas to reorder

### **Transform Controls**
- Use sliders for precise control
- Or drag handles on canvas
- Hold Shift while dragging to constrain proportions

---

## ✨ **Features Checklist**

Try all these features:

- [ ] Select different products
- [ ] Upload an image
- [ ] Add text with custom font
- [ ] Add emoji graphic
- [ ] Scale, rotate, adjust opacity
- [ ] Toggle layer visibility
- [ ] Undo/Redo changes
- [ ] Change t-shirt color
- [ ] Select different size
- [ ] Adjust quantity
- [ ] Add to cart
- [ ] View cart
- [ ] Place order
- [ ] Use keyboard shortcuts

---

## 🎉 **You're Ready!**

The app is **100% functional** right now. Just open `index.html` and start designing!

**Questions?** Check `README.md` for detailed documentation.

---

**Happy Designing! 🎨**

*Built with ❤️ for AI VOGUE*
