# T-shirt Customizer - Advanced Implementation Status

## Current Situation

The HTML file (`tshirt-customizer.html`) has become corrupted during the editing process. A backup has been created at `tshirt-customizer.html.backup`.

## Recommended Next Steps

### Option 1: Restore and Manual Integration (Recommended)
1. **Restore the backup file**:
   ```powershell
   Copy-Item "tshirt-customizer.html.backup" "tshirt-customizer.html" -Force
   ```

2. **Manually add Fabric.js to the HTML** (add after line 16):
   ```html
   <!-- Fabric.js for Advanced Canvas -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
   
   <!-- Extended Google Fonts -->
   <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Oswald:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Bebas+Neue&family=Pacifico&family=Dancing+Script:wght@400;700&family=Lobster&family=Righteous&family=Permanent+Marker&display=swap" rel="stylesheet">
   ```

3. **Update the font selector in HTML** (around line 287-296):
   ```html
   <select id="font-select" class="control-select">
       <option value="Inter">Inter</option>
       <option value="Playfair Display">Playfair Display</option>
       <option value="Roboto">Roboto</option>
       <option value="Open Sans">Open Sans</option>
       <option value="Montserrat">Montserrat</option>
       <option value="Lato">Lato</option>
       <option value="Oswald">Oswald</option>
       <option value="Raleway">Raleway</option>
       <option value="Poppins">Poppins</option>
       <option value="Bebas Neue">Bebas Neue</option>
       <option value="Pacifico">Pacifico</option>
       <option value="Dancing Script">Dancing Script</option>
       <option value="Lobster">Lobster</option>
       <option value="Righteous">Righteous</option>
       <option value="Permanent Marker">Permanent Marker</option>
   </select>
   ```

### Option 2: Create New Advanced Customizer File
Create a new file `tshirt-customizer-advanced.js` that uses Fabric.js for professional canvas manipulation.

## Key Features to Implement with Fabric.js

### 1. Initialize Fabric Canvas
```javascript
// Replace the basic canvas with Fabric.js canvas
this.fabricCanvas = new fabric.Canvas('tshirt-canvas', {
    width: 800,
    height: 1000,
    backgroundColor: '#ffffff'
});

// Enable object controls
this.fabricCanvas.selection = true;
this.fabricCanvas.preserveObjectStacking = true;
```

### 2. Add Images with Fabric
```javascript
fabric.Image.fromURL(imageUrl, (img) => {
    img.set({
        left: 300,
        top: 300,
        scaleX: 0.5,
        scaleY: 0.5,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        cornerSize: 10,
        transparentCorners: false,
        borderColor: '#0074D9',
        cornerColor: '#0074D9'
    });
    
    this.fabricCanvas.add(img);
    this.fabricCanvas.setActiveObject(img);
    this.fabricCanvas.renderAll();
});
```

### 3. Add Text with Fabric
```javascript
const text = new fabric.IText('Your Text Here', {
    left: 400,
    top: 400,
    fontFamily: 'Inter',
    fontSize: 36,
    fill: '#000000',
    selectable: true,
    editable: true
});

this.fabricCanvas.add(text);
this.fabricCanvas.setActiveObject(text);
this.fabricCanvas.renderAll();
```

### 4. Real-time Property Updates
```javascript
// When slider changes
const activeObject = this.fabricCanvas.getActiveObject();
if (activeObject) {
    activeObject.set({
        scaleX: scale,
        scaleY: scale,
        angle: rotation,
        opacity: opacity
    });
    this.fabricCanvas.renderAll();
}
```

### 5. Layer Management
```javascript
// Bring to front
this.fabricCanvas.bringToFront(activeObject);

// Send to back
this.fabricCanvas.sendToBack(activeObject);

// Move up/down
this.fabricCanvas.bringForward(activeObject);
this.fabricCanvas.sendBackwards(activeObject);
```

### 6. Image Filters (Photoshop-style)
```javascript
// Apply brightness filter
const filter = new fabric.Image.filters.Brightness({
    brightness: 0.2 // -1 to 1
});

activeObject.filters.push(filter);
activeObject.applyFilters();
this.fabricCanvas.renderAll();
```

### 7. Export High-Quality Image
```javascript
// Export as PNG
const dataURL = this.fabricCanvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 3 // 3x resolution for print quality
});

// Export as SVG (vector)
const svg = this.fabricCanvas.toSVG();
```

## Complete Implementation Checklist

### Phase 1: Core Fabric.js Integration
- [ ] Restore HTML file from backup
- [ ] Add Fabric.js CDN link
- [ ] Replace basic canvas initialization with Fabric canvas
- [ ] Update image upload to use Fabric.Image
- [ ] Update text creation to use Fabric.IText
- [ ] Test basic drag, resize, rotate functionality

### Phase 2: Advanced Controls
- [ ] Add extended font library (15+ fonts)
- [ ] Implement image filters (brightness, contrast, saturation)
- [ ] Add blend modes
- [ ] Implement layer panel UI
- [ ] Add layer reordering
- [ ] Add object locking

### Phase 3: Professional Features
- [ ] Add drop shadow effect
- [ ] Add stroke/outline effect
- [ ] Implement background removal (basic)
- [ ] Add curved text path
- [ ] Implement gradient fills
- [ ] Add pattern fills

### Phase 4: Mockup Integration
- [ ] Source high-quality t-shirt mockups (PNG format)
- [ ] Implement perspective transform for realistic preview
- [ ] Add color overlay for t-shirt color changes
- [ ] Create mockup switching (front/back views)
- [ ] Implement print area clipping

### Phase 5: Export & Polish
- [ ] Implement high-resolution export (300 DPI)
- [ ] Add design save/load functionality
- [ ] Create print-ready file generation
- [ ] Add design templates
- [ ] Implement undo/redo with Fabric's state management

## Quick Start Code

Here's a minimal working example to get started:

```javascript
class AdvancedTShirtCustomizer {
    constructor() {
        this.fabricCanvas = null;
        this.init();
    }
    
    init() {
        // Initialize Fabric canvas
        this.fabricCanvas = new fabric.Canvas('tshirt-canvas', {
            width: 800,
            height: 1000,
            backgroundColor: '#f0f0f0'
        });
        
        // Load t-shirt mockup as background
        fabric.Image.fromURL('mockup-url.png', (img) => {
            img.set({
                selectable: false,
                evented: false
            });
            this.fabricCanvas.setBackgroundImage(img, this.fabricCanvas.renderAll.bind(this.fabricCanvas));
        });
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    addImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            fabric.Image.fromURL(e.target.result, (img) => {
                img.scaleToWidth(200);
                img.set({
                    left: 300,
                    top: 300
                });
                this.fabricCanvas.add(img);
                this.fabricCanvas.setActiveObject(img);
            });
        };
        reader.readAsDataURL(file);
    }
    
    addText(text) {
        const fabricText = new fabric.IText(text, {
            left: 400,
            top: 400,
            fontFamily: 'Inter',
            fontSize: 36,
            fill: '#000000'
        });
        this.fabricCanvas.add(fabricText);
        this.fabricCanvas.setActiveObject(fabricText);
    }
    
    setupEventListeners() {
        // Object selection
        this.fabricCanvas.on('selection:created', (e) => {
            this.showPropertiesPanel(e.selected[0]);
        });
        
        this.fabricCanvas.on('selection:updated', (e) => {
            this.showPropertiesPanel(e.selected[0]);
        });
        
        this.fabricCanvas.on('selection:cleared', () => {
            this.hidePropertiesPanel();
        });
    }
    
    showPropertiesPanel(obj) {
        if (obj.type === 'image') {
            document.getElementById('image-transform-controls').style.display = 'block';
        } else if (obj.type === 'i-text') {
            document.getElementById('text-style-controls').style.display = 'block';
        }
    }
}

// Initialize
const customizer = new AdvancedTShirtCustomizer();
```

## Resources Needed

### T-shirt Mockups
**Free Sources**:
1. Mockup World - https://www.mockupworld.co/free/category/t-shirt/
2. Freepik - https://www.freepik.com/free-photos-vectors/t-shirt-mockup
3. Pixeden - https://www.pixeden.com/free-graphics

**Specifications**:
- Format: PNG with transparent background
- Resolution: 2000x2400px minimum
- Views: Front and back for each style
- Total needed: 12 mockup images (6 styles × 2 views)

### Graphics Library
**Free Clipart Sources**:
1. Flaticon - https://www.flaticon.com/
2. Freepik - https://www.freepik.com/
3. unDraw - https://undraw.co/

## Next Action Required

**Please choose one of the following**:

1. **Restore and continue** - I'll restore the HTML backup and add Fabric.js integration
2. **Start fresh** - I'll create a new advanced customizer file from scratch
3. **Provide mockups** - You provide the t-shirt mockup images and I'll integrate them

Let me know which approach you prefer, and I'll proceed accordingly!
