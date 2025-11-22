/**
 * ============================================
 * AI VOGUE - CUSTOM T-SHIRT PRINTING APP
 * ============================================
 * 
 * Production-ready T-shirt customizer with:
 * - Fabric.js canvas manipulation
 * - PSD import/export support
 * - FilePond file uploads
 * - Real-time pricing engine
 * - Mock API with Appwrite adapter scaffolding
 * - Vendor notification system
 * - Undo/Redo history
 * - Keyboard shortcuts
 * 
 * Dependencies:
 * - Fabric.js 5.3.0
 * - FilePond 4.x
 * - Pickr color picker
 * - PSD.js 3.2.0
 * - LZ-String 1.5.0
 * 
 * @author AI VOGUE Development Team
 * @version 1.0.0
 */

// ============================================
// PRICING ENGINE CONSTANTS
// ============================================
const PRICING = {
    sizeMultipliers: {
        'XS': 1.0,
        'S': 1.0,
        'M': 1.0,
        'L': 1.1,
        'XL': 1.2,
        'XXL': 1.3
    },
    colorPremium: {
        standard: 0,
        premium: 100
    },
    printComplexity: {
        single_color: 0,      // <=4 colors
        multi_color: 150,     // 5-16 colors
        photo_quality: 300    // >16 colors
    },
    bulkDiscounts: [
        { min: 10, discount: 0.10 },
        { min: 25, discount: 0.15 },
        { min: 50, discount: 0.20 },
        { min: 100, discount: 0.25 }
    ]
};

// ============================================
// MAIN APPLICATION CLASS
// ============================================
class TShirtCustomizer {
    constructor() {
        this.canvas = null;
        this.currentProduct = null;
        this.currentVariant = null;
        this.currentSize = 'M';
        this.currentColor = null;
        this.quantity = 1;
        this.cart = [];
        this.history = [];
        this.historyIndex = -1;
        this.guidesVisible = true;
        this.zoomLevel = 1;
        this.textColorPicker = null;
        this.filePond = null;
        this.mockData = null;

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Load mock data
            await this.loadMockData();

            // Initialize canvas
            this.initCanvas();

            // Initialize FilePond
            this.initFilePond();

            // Initialize color picker
            this.initColorPicker();

            // Load products
            this.loadProducts();

            // Load graphics library
            this.loadGraphics();

            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();

            // Set up menu toggle
            this.setupMenuToggle();

            // Load cart from localStorage
            this.loadCart();

            // Select first product by default
            if (this.mockData.products.length > 0) {
                this.selectProduct(this.mockData.products[0]);
            }

            console.log('✅ T-Shirt Customizer initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showToast('Error initializing application', 'error');
        }
    }

    /**
     * Load mock data from JSON
     */
    async loadMockData() {
        try {
            const response = await fetch('assets/mock-data.json');
            this.mockData = await response.json();
        } catch (error) {
            console.error('Error loading mock data:', error);
            // Fallback to inline data if file not found
            this.mockData = { products: [], graphics: [], vendors: [] };
        }
    }

    /**
     * Initialize Fabric.js canvas
     */
    initCanvas() {
        this.canvas = new fabric.Canvas('tshirtCanvas', {
            width: 600,
            height: 600,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true
        });

        // Set up canvas events
        this.canvas.on('object:modified', () => this.saveHistory());
        this.canvas.on('object:added', () => this.updateLayersList());
        this.canvas.on('object:removed', () => this.updateLayersList());
        this.canvas.on('selection:created', () => this.updateTransformControls());
        this.canvas.on('selection:updated', () => this.updateTransformControls());
        this.canvas.on('selection:cleared', () => this.clearTransformControls());

        // Enable object caching for better performance
        fabric.Object.prototype.objectCaching = true;
    }

    /**
     * Initialize FilePond for file uploads
     */
    initFilePond() {
        // Register FilePond plugins
        FilePond.registerPlugin(
            FilePondPluginFileValidateSize,
            FilePondPluginFileValidateType,
            FilePondPluginImagePreview,
            FilePondPluginFileEncode
        );

        // Create FilePond instance
        const inputElement = document.querySelector('#fileUpload');
        this.filePond = FilePond.create(inputElement, {
            acceptedFileTypes: ['image/png', 'image/jpeg', 'image/psd', 'image/svg+xml'],
            maxFileSize: '100MB',
            maxFiles: 10,
            labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
            onaddfile: (error, file) => {
                if (!error) {
                    this.handleFileUpload(file);
                }
            }
        });
    }

    /**
     * Initialize color picker
     */
    initColorPicker() {
        this.textColorPicker = Pickr.create({
            el: '#textColorPicker',
            theme: 'nano',
            default: '#000000',
            swatches: [
                '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
                '#FFFF00', '#FF00FF', '#00FFFF', '#91855a', '#1d3937'
            ],
            components: {
                preview: true,
                opacity: true,
                hue: true,
                interaction: {
                    hex: true,
                    rgba: true,
                    input: true,
                    save: true
                }
            }
        });

        this.textColorPicker.on('save', (color) => {
            if (color) {
                this.updateTextColor(color.toHEXA().toString());
            }
        });
    }

    /**
     * Load products into grid
     */
    loadProducts() {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '';

        this.mockData.products.forEach(product => {
            const card = this.createProductCard(product);
            grid.appendChild(card);
        });
    }

    /**
     * Create product card element
     */
    /**
     * Create product card element
     */
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.onclick = () => this.selectProduct(product);

        const isPremium = product.base_price >= 800;

        // Fallback image if mockup path is invalid
        const fallbackImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A15pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.5%22%20y%3D%22157.1%22%3ET-Shirt%20Mockup%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${product.variants[0].mockup_path}" 
                     alt="${product.name}" 
                     class="product-image"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${fallbackImage}';">
                ${isPremium ? '<div class="product-badge">Premium</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">₹${product.base_price}</div>
                <p class="product-price-note">${product.description}</p>
                <div class="color-swatches">
                    ${product.colors.slice(0, 4).map(color => `
                        <div class="color-swatch ${color.premium ? 'premium' : ''}" 
                             style="background-color: ${color.hex}"
                             title="${color.name}"></div>
                    `).join('')}
                </div>
                <button class="product-cta">
                    <i class="fas fa-paint-brush"></i> Customize
                </button>
            </div>
        `;

        return card;
    }

    /**
     * Select a product
     */
    selectProduct(product) {
        this.currentProduct = product;
        this.currentVariant = product.variants[0];
        this.currentColor = product.colors[0];
        this.currentSize = product.sizes[2] || product.sizes[0]; // Default to M or first size

        // Update variant selector
        const variantSelect = document.getElementById('variantSelect');
        variantSelect.innerHTML = product.variants.map(v => `
            <option value="${v.type}">${v.type.charAt(0).toUpperCase() + v.type.slice(1)}</option>
        `).join('');

        // Update size selector
        this.updateSizeSelector();

        // Update color swatches
        this.updateColorSwatches();

        // Load product mockup on canvas
        this.loadProductMockup();

        // Update print area overlay
        this.updatePrintAreaOverlay();

        // Calculate price
        this.calculatePrice();

        // Scroll to customizer
        document.getElementById('customizer').scrollIntoView({ behavior: 'smooth' });

        this.showToast(`Selected ${product.name}`, 'success');
    }

    /**
     * Update size selector
     */
    updateSizeSelector() {
        const sizeSelector = document.getElementById('sizeSelector');
        sizeSelector.innerHTML = this.currentProduct.sizes.map(size => `
            <button class="size-btn ${size === this.currentSize ? 'active' : ''}" 
                    onclick="TShirtApp.selectSize('${size}')">
                ${size}
            </button>
        `).join('');
    }

    /**
     * Update color swatches
     */
    updateColorSwatches() {
        const colorSwatches = document.getElementById('colorSwatches');
        colorSwatches.innerHTML = this.currentProduct.colors.map(color => `
            <div class="color-swatch ${color.premium ? 'premium' : ''} ${color === this.currentColor ? 'active' : ''}" 
                 style="background-color: ${color.hex}"
                 title="${color.name}${color.premium ? ' (Premium)' : ''}"
                 onclick="TShirtApp.selectColor('${color.name}')"></div>
        `).join('');
    }

    /**
     * Load product mockup on canvas
     */
    loadProductMockup() {
        fabric.Image.fromURL(this.currentVariant.mockup_path, (img) => {
            // Clear canvas
            this.canvas.clear();

            // Scale image to fit canvas
            const scale = Math.min(
                this.canvas.width / img.width,
                this.canvas.height / img.height
            );

            img.scale(scale);
            img.set({
                left: (this.canvas.width - img.width * scale) / 2,
                top: (this.canvas.height - img.height * scale) / 2,
                selectable: false,
                evented: false,
                name: 'mockup'
            });

            this.canvas.add(img);
            this.canvas.sendToBack(img);
            this.canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

    /**
     * Update print area overlay
     */
    updatePrintAreaOverlay() {
        const overlay = document.getElementById('printAreaOverlay');
        const printArea = this.currentProduct.print_area;

        overlay.style.left = `${printArea.x_percent}%`;
        overlay.style.top = `${printArea.y_percent}%`;
        overlay.style.width = `${printArea.width_percent}%`;
        overlay.style.height = `${printArea.height_percent}%`;
    }

    /**
     * Select size
     */
    selectSize(size) {
        this.currentSize = size;
        this.updateSizeSelector();
        this.calculatePrice();
    }

    /**
     * Select color
     */
    selectColor(colorName) {
        this.currentColor = this.currentProduct.colors.find(c => c.name === colorName);
        this.updateColorSwatches();
        this.calculatePrice();
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(file) {
        const fileType = file.file.type;
        const fileName = file.file.name;

        this.showLoading('Processing file...');

        try {
            if (fileName.endsWith('.psd')) {
                // Handle PSD file
                await this.handlePSDUpload(file.file);
            } else {
                // Handle regular image
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.addImageToCanvas(e.target.result, fileName);
                };
                reader.readAsDataURL(file.file);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            this.showToast('Error uploading file', 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle PSD file upload
     * Uses PSD.js to parse and extract layers
     */
    async handlePSDUpload(file) {
        try {
            this.showLoading('Parsing PSD file...');

            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Parse PSD using PSD.js
            // Note: This runs in main thread. For production, use Web Worker
            const psd = PSD.fromArrayBuffer(arrayBuffer);
            psd.parse();

            this.showToast('PSD parsed successfully! Importing layers...', 'success');

            // Get all layers
            const layers = psd.tree().descendants();

            // Import each layer
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];

                if (layer.isGroup()) continue; // Skip groups

                try {
                    // Export layer as PNG
                    const png = layer.toPng();

                    // Add to canvas
                    await this.addImageToCanvas(png.src, layer.name);

                    this.showLoading(`Importing layer ${i + 1}/${layers.length}...`);
                } catch (layerError) {
                    console.warn('Could not import layer:', layer.name, layerError);
                }
            }

            this.showToast(`Imported ${layers.length} layers from PSD`, 'success');
        } catch (error) {
            console.error('Error parsing PSD:', error);
            this.showToast('Error parsing PSD file. Try opening in Photopea instead.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Add image to canvas
     */
    addImageToCanvas(imageSrc, name = 'Image') {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(imageSrc, (img) => {
                if (!img) {
                    reject(new Error('Failed to load image'));
                    return;
                }

                // Scale to fit print area
                const printArea = this.currentProduct.print_area;
                const maxWidth = (this.canvas.width * printArea.width_percent) / 100;
                const maxHeight = (this.canvas.height * printArea.height_percent) / 100;

                const scale = Math.min(
                    maxWidth / img.width,
                    maxHeight / img.height,
                    1 // Don't scale up
                );

                img.scale(scale);
                img.set({
                    left: this.canvas.width / 2,
                    top: this.canvas.height / 2,
                    originX: 'center',
                    originY: 'center',
                    name: name
                });

                this.canvas.add(img);
                this.canvas.setActiveObject(img);
                this.canvas.renderAll();

                this.saveHistory();
                resolve(img);
            }, { crossOrigin: 'anonymous' });
        });
    }

    /**
     * Load graphics library
     */
    loadGraphics() {
        const grid = document.getElementById('graphicsGrid');

        // Create placeholder graphics (in production, load from mockData.graphics)
        const placeholderGraphics = [
            { id: 1, icon: '🎨', name: 'Art' },
            { id: 2, icon: '⭐', name: 'Star' },
            { id: 3, icon: '❤️', name: 'Heart' },
            { id: 4, icon: '🔥', name: 'Fire' },
            { id: 5, icon: '✨', name: 'Sparkle' },
            { id: 6, icon: '🌟', name: 'Glow' }
        ];

        grid.innerHTML = placeholderGraphics.map(graphic => `
            <div class="graphic-item" onclick="TShirtApp.addGraphic('${graphic.icon}', '${graphic.name}')">
                <div style="font-size: 3rem; display: flex; align-items: center; justify-content: center; height: 100%;">
                    ${graphic.icon}
                </div>
            </div>
        `).join('');
    }

    /**
     * Add graphic to canvas
     */
    addGraphic(emoji, name) {
        const text = new fabric.Text(emoji, {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            fontSize: 100,
            originX: 'center',
            originY: 'center',
            name: name
        });

        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        this.canvas.renderAll();

        this.saveHistory();
        this.showToast(`Added ${name} graphic`, 'success');
    }

    /**
     * Add text to canvas
     */
    addText() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value.trim();

        if (!text) {
            this.showToast('Please enter some text', 'error');
            return;
        }

        const fontSelect = document.getElementById('fontSelect');
        const fontSizeSlider = document.getElementById('fontSizeSlider');

        const textObj = new fabric.IText(text, {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            fontSize: parseInt(fontSizeSlider.value),
            fontFamily: fontSelect.value,
            fill: this.textColorPicker.getColor().toHEXA().toString(),
            originX: 'center',
            originY: 'center',
            name: `Text: ${text.substring(0, 20)}`
        });

        this.canvas.add(textObj);
        this.canvas.setActiveObject(textObj);
        this.canvas.renderAll();

        this.saveHistory();
        textInput.value = '';
        this.showToast('Text added successfully', 'success');
    }

    /**
     * Update text font
     */
    updateTextFont(font) {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'i-text') {
            activeObject.set('fontFamily', font);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Update text size
     */
    updateTextSize(size) {
        document.getElementById('fontSizeValue').textContent = size;
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
            activeObject.set('fontSize', parseInt(size));
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Update text color
     */
    updateTextColor(color) {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
            activeObject.set('fill', color);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Toggle text bold
     */
    toggleTextBold() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
            const currentWeight = activeObject.fontWeight;
            activeObject.set('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold');
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Toggle text italic
     */
    toggleTextItalic() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
            const currentStyle = activeObject.fontStyle;
            activeObject.set('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic');
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Toggle text underline
     */
    toggleTextUnderline() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
            activeObject.set('underline', !activeObject.underline);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Update layers list
     */
    updateLayersList() {
        const layersList = document.getElementById('layersList');
        const objects = this.canvas.getObjects().filter(obj => obj.name !== 'mockup');

        if (objects.length === 0) {
            layersList.innerHTML = '<p class="empty-state">No layers yet. Add text or upload an image to get started.</p>';
            return;
        }

        layersList.innerHTML = objects.reverse().map((obj, index) => {
            const actualIndex = objects.length - 1 - index;
            const isActive = this.canvas.getActiveObject() === obj;
            const icon = this.getLayerIcon(obj);

            return `
                <div class="layer-item ${isActive ? 'active' : ''}" onclick="TShirtApp.selectLayer(${actualIndex})">
                    <div class="layer-thumbnail">${icon}</div>
                    <div class="layer-info">
                        <div class="layer-name">${obj.name || 'Layer ' + (actualIndex + 1)}</div>
                        <div class="layer-type">${obj.type}</div>
                    </div>
                    <div class="layer-actions">
                        <button onclick="event.stopPropagation(); TShirtApp.toggleLayerVisibility(${actualIndex})" title="Toggle visibility">
                            <i class="fas fa-eye${obj.visible === false ? '-slash' : ''}"></i>
                        </button>
                        <button onclick="event.stopPropagation(); TShirtApp.deleteLayer(${actualIndex})" title="Delete layer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get layer icon
     */
    getLayerIcon(obj) {
        const icons = {
            'i-text': '<i class="fas fa-font"></i>',
            'text': '<i class="fas fa-font"></i>',
            'image': '<i class="fas fa-image"></i>',
            'rect': '<i class="fas fa-square"></i>',
            'circle': '<i class="fas fa-circle"></i>',
            'triangle': '<i class="fas fa-play"></i>'
        };
        return icons[obj.type] || '<i class="fas fa-layer-group"></i>';
    }

    /**
     * Select layer
     */
    selectLayer(index) {
        const objects = this.canvas.getObjects().filter(obj => obj.name !== 'mockup');
        const reversedIndex = objects.length - 1 - index;
        const obj = objects[reversedIndex];

        if (obj) {
            this.canvas.setActiveObject(obj);
            this.canvas.renderAll();
            this.updateLayersList();
        }
    }

    /**
     * Toggle layer visibility
     */
    toggleLayerVisibility(index) {
        const objects = this.canvas.getObjects().filter(obj => obj.name !== 'mockup');
        const reversedIndex = objects.length - 1 - index;
        const obj = objects[reversedIndex];

        if (obj) {
            obj.set('visible', !obj.visible);
            this.canvas.renderAll();
            this.updateLayersList();
        }
    }

    /**
     * Delete layer
     */
    deleteLayer(index) {
        const objects = this.canvas.getObjects().filter(obj => obj.name !== 'mockup');
        const reversedIndex = objects.length - 1 - index;
        const obj = objects[reversedIndex];

        if (obj && confirm('Delete this layer?')) {
            this.canvas.remove(obj);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Update transform controls
     */
    updateTransformControls() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;

        const scaleSlider = document.getElementById('scaleSlider');
        const rotationSlider = document.getElementById('rotationSlider');
        const opacitySlider = document.getElementById('opacitySlider');

        const scale = Math.round(activeObject.scaleX * 100);
        const rotation = Math.round(activeObject.angle || 0);
        const opacity = Math.round((activeObject.opacity || 1) * 100);

        scaleSlider.value = scale;
        rotationSlider.value = rotation;
        opacitySlider.value = opacity;

        document.getElementById('scaleValue').textContent = scale;
        document.getElementById('rotationValue').textContent = rotation;
        document.getElementById('opacityValue').textContent = opacity;
    }

    /**
     * Clear transform controls
     */
    clearTransformControls() {
        document.getElementById('scaleSlider').value = 100;
        document.getElementById('rotationSlider').value = 0;
        document.getElementById('opacitySlider').value = 100;
        document.getElementById('scaleValue').textContent = 100;
        document.getElementById('rotationValue').textContent = 0;
        document.getElementById('opacityValue').textContent = 100;
    }

    /**
     * Update scale
     */
    updateScale(value) {
        document.getElementById('scaleValue').textContent = value;
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            const scale = value / 100;
            activeObject.scale(scale);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Update rotation
     */
    updateRotation(value) {
        document.getElementById('rotationValue').textContent = value;
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('angle', parseInt(value));
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Update opacity
     */
    updateOpacity(value) {
        document.getElementById('opacityValue').textContent = value;
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('opacity', value / 100);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Flip horizontal
     */
    flipHorizontal() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('flipX', !activeObject.flipX);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Flip vertical
     */
    flipVertical() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('flipY', !activeObject.flipY);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    /**
     * Toggle guides
     */
    toggleGuides() {
        this.guidesVisible = !this.guidesVisible;
        const overlay = document.getElementById('printAreaOverlay');
        overlay.classList.toggle('hidden', !this.guidesVisible);
    }

    /**
     * Zoom in
     */
    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 0.1, 3);
        this.applyZoom();
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
        this.applyZoom();
    }

    /**
     * Reset zoom
     */
    resetZoom() {
        this.zoomLevel = 1;
        this.applyZoom();
    }

    /**
     * Apply zoom
     */
    applyZoom() {
        this.canvas.setZoom(this.zoomLevel);
        document.getElementById('zoomLevel').textContent = Math.round(this.zoomLevel * 100) + '%';
        this.canvas.renderAll();
    }

    /**
     * Save history for undo/redo
     */
    saveHistory() {
        const state = JSON.stringify(this.canvas.toJSON(['name']));

        // Remove future states if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(state);
        this.historyIndex++;

        // Limit history to 50 states
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }

        this.updateLayersList();
        this.calculatePrice();
    }

    /**
     * Undo
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.canvas.loadFromJSON(state, () => {
                this.canvas.renderAll();
                this.updateLayersList();
            });
        }
    }

    /**
     * Redo
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.canvas.loadFromJSON(state, () => {
                this.canvas.renderAll();
                this.updateLayersList();
            });
        }
    }

    /**
     * Calculate price
     */
    calculatePrice() {
        if (!this.currentProduct) return;

        const basePrice = this.currentProduct.base_price;
        const sizeMultiplier = PRICING.sizeMultipliers[this.currentSize] || 1;
        const colorPremium = this.currentColor.premium ? PRICING.colorPremium.premium : 0;

        // Analyze print complexity (simplified - in production, use Web Worker)
        const printComplexity = this.analyzePrintComplexity();

        // Calculate subtotal
        const itemPrice = (basePrice * sizeMultiplier) + colorPremium + printComplexity;
        const subtotal = itemPrice * this.quantity;

        // Apply bulk discount
        let discount = 0;
        for (const tier of PRICING.bulkDiscounts) {
            if (this.quantity >= tier.min) {
                discount = tier.discount;
            }
        }

        const total = subtotal * (1 - discount);

        // Update UI
        document.getElementById('basePrice').textContent = `₹${basePrice}`;
        document.getElementById('sizeMultiplier').textContent = `₹${Math.round(basePrice * (sizeMultiplier - 1))}`;
        document.getElementById('colorPremium').textContent = `₹${colorPremium}`;
        document.getElementById('printComplexity').textContent = `₹${printComplexity}`;
        document.getElementById('qtyDisplay').textContent = this.quantity;
        document.getElementById('subtotal').textContent = `₹${Math.round(subtotal)}`;
        document.getElementById('totalPrice').textContent = `₹${Math.round(total)}`;
    }

    /**
     * Analyze print complexity
     * In production, use Web Worker with color quantization
     */
    analyzePrintComplexity() {
        const objects = this.canvas.getObjects().filter(obj => obj.name !== 'mockup');

        if (objects.length === 0) return 0;
        if (objects.length <= 2) return PRICING.printComplexity.single_color;
        if (objects.length <= 5) return PRICING.printComplexity.multi_color;

        return PRICING.printComplexity.photo_quality;
    }

    /**
     * Update quantity
     */
    updateQuantity(value) {
        this.quantity = Math.max(1, Math.min(100, parseInt(value) || 1));
        document.getElementById('quantityInput').value = this.quantity;
        this.calculatePrice();
    }

    /**
     * Increase quantity
     */
    increaseQuantity() {
        this.updateQuantity(this.quantity + 1);
    }

    /**
     * Decrease quantity
     */
    decreaseQuantity() {
        this.updateQuantity(this.quantity - 1);
    }

    /**
     * Export preview
     */
    exportPreview() {
        // Export at 2x resolution for high quality
        const dataURL = this.canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });

        // Download
        const link = document.createElement('a');
        link.download = `tshirt-design-${Date.now()}.png`;
        link.href = dataURL;
        link.click();

        this.showToast('Preview downloaded', 'success');
    }

    /**
     * Add to cart
     */
    async addToCart() {
        if (!this.currentProduct) {
            this.showToast('Please select a product first', 'error');
            return;
        }

        this.showLoading('Adding to cart...');

        try {
            // Generate preview thumbnail
            const thumbnail = this.canvas.toDataURL({
                format: 'png',
                quality: 0.8,
                multiplier: 0.5
            });

            // Create cart item
            const cartItem = {
                id: Date.now(),
                product: this.currentProduct,
                variant: this.currentVariant,
                size: this.currentSize,
                color: this.currentColor,
                quantity: this.quantity,
                thumbnail: thumbnail,
                canvasState: JSON.stringify(this.canvas.toJSON(['name'])),
                price: this.calculateItemPrice()
            };

            this.cart.push(cartItem);
            this.saveCart();
            this.updateCartUI();

            this.showToast(`Added ${this.quantity} item(s) to cart`, 'success');
            this.toggleCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showToast('Error adding to cart', 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Calculate item price
     */
    calculateItemPrice() {
        const basePrice = this.currentProduct.base_price;
        const sizeMultiplier = PRICING.sizeMultipliers[this.currentSize] || 1;
        const colorPremium = this.currentColor.premium ? PRICING.colorPremium.premium : 0;
        const printComplexity = this.analyzePrintComplexity();

        return Math.round((basePrice * sizeMultiplier + colorPremium + printComplexity) * this.quantity);
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem('tshirt_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            const saved = localStorage.getItem('tshirt_cart');
            if (saved) {
                this.cart = JSON.parse(saved);
                this.updateCartUI();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    /**
     * Update cart UI
     */
    updateCartUI() {
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');

        cartCount.textContent = this.cart.length;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            cartTotal.textContent = '₹0';
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.textContent = `₹${total}`;

        cartItems.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.thumbnail}" alt="${item.product.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-details">
                        ${item.size} • ${item.color.name} • Qty: ${item.quantity}
                    </div>
                    <div class="cart-item-price">₹${item.price}</div>
                </div>
                <button class="cart-item-remove" onclick="TShirtApp.removeFromCart(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    /**
     * Remove from cart
     */
    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartUI();
        this.showToast('Item removed from cart', 'info');
    }

    /**
     * Toggle cart drawer
     */
    toggleCart() {
        const cartDrawer = document.getElementById('cartDrawer');
        cartDrawer.classList.toggle('open');
    }

    /**
     * Checkout
     */
    async checkout() {
        if (this.cart.length === 0) {
            this.showToast('Your cart is empty', 'error');
            return;
        }

        this.showLoading('Processing order...');

        try {
            // Create order
            const order = {
                orderId: `ORD-${Date.now()}`,
                userId: 'user-123', // In production, get from auth
                vendorId: this.mockData.vendors[0].vendorId,
                items: this.cart.map(item => ({
                    productId: item.product.productId,
                    variant: item.variant.type,
                    size: item.size,
                    color: item.color.name,
                    quantity: item.quantity,
                    price: item.price,
                    customizations: {
                        canvasState: item.canvasState,
                        thumbnail: item.thumbnail
                    }
                })),
                totalPrice: this.cart.reduce((sum, item) => sum + item.price, 0),
                status: 'Pending',
                estimatedDelivery: '4-5 working days',
                createdAt: new Date().toISOString()
            };

            // Save to mock DB (in production, send to Appwrite)
            await this.mockAPI.createOrder(order);

            // Notify vendor
            this.notifyVendor(order);

            // Clear cart
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            this.toggleCart();

            this.showToast(`Order placed successfully! Order ID: ${order.orderId}`, 'success');
        } catch (error) {
            console.error('Error placing order:', error);
            this.showToast('Error placing order', 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Notify vendor
     */
    notifyVendor(order) {
        this.showToast(`New order received — Order #${order.orderId} — Estimated delivery ${order.estimatedDelivery}`, 'info');

        // In production, send real notification via Appwrite
        console.log('Vendor notification:', order);
    }

    /**
     * Save draft
     */
    saveDraft() {
        try {
            const draft = {
                product: this.currentProduct,
                variant: this.currentVariant,
                size: this.currentSize,
                color: this.currentColor,
                quantity: this.quantity,
                canvasState: JSON.stringify(this.canvas.toJSON(['name'])),
                savedAt: new Date().toISOString()
            };

            localStorage.setItem('tshirt_draft', JSON.stringify(draft));
            this.showToast('Draft saved successfully', 'success');
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showToast('Error saving draft', 'error');
        }
    }

    /**
     * Open in Photopea
     */
    openPhotopea() {
        // Export current canvas as PSD-compatible format
        const dataURL = this.canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });

        // Open Photopea in new tab with the image
        // Note: Photopea requires the image to be accessible via URL
        // For production, upload to Appwrite bucket first and use signed URL

        const photopeaURL = `https://www.photopea.com`;
        window.open(photopeaURL, '_blank');

        this.showToast('Opening Photopea... Upload your PSD file there to edit', 'info');

        // TODO: Implement proper Photopea integration with file upload
        // See README.md for detailed instructions
    }

    /**
     * Toggle section (accordion)
     */
    toggleSection(button) {
        const section = button.parentElement;
        const wasActive = section.classList.contains('active');

        // Close all sections
        document.querySelectorAll('.control-section').forEach(s => {
            s.classList.remove('active');
        });

        // Open clicked section if it wasn't active
        if (!wasActive) {
            section.classList.add('active');
        }
    }

    /**
     * Change variant
     */
    changeVariant(variantType) {
        this.currentVariant = this.currentProduct.variants.find(v => v.type === variantType);
        this.loadProductMockup();
        this.calculatePrice();
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Z - Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            // Ctrl/Cmd + Y - Redo
            else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
            // U - Upload
            else if (e.key === 'u' && !e.ctrlKey && !e.metaKey) {
                document.getElementById('fileUpload').click();
            }
            // Shift + S - Toggle guides
            else if (e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.toggleGuides();
            }
            // Ctrl/Cmd + Enter - Add to cart
            else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.addToCart();
            }
            // Delete - Delete selected
            else if (e.key === 'Delete' || e.key === 'Backspace') {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.name !== 'mockup') {
                    e.preventDefault();
                    this.canvas.remove(activeObject);
                    this.canvas.renderAll();
                    this.saveHistory();
                }
            }
        });
    }

    /**
     * Setup menu toggle
     */
    setupMenuToggle() {
        const menuBtn = document.querySelector('.gucci-menu-btn');
        const overlay = document.querySelector('.gucci-overlay');
        const overlayBg = document.querySelector('.gucci-overlay-bg');
        const closeBtn = document.querySelector('.gucci-close-btn');

        menuBtn.addEventListener('click', () => {
            overlay.classList.add('active');
            overlayBg.classList.add('active');
        });

        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            overlayBg.classList.remove('active');
        });

        overlayBg.addEventListener('click', () => {
            overlay.classList.remove('active');
            overlayBg.classList.remove('active');
        });
    }

    /**
     * Toggle vendor dashboard
     */
    toggleVendorDashboard() {
        const dashboard = document.getElementById('vendorDashboard');
        dashboard.style.display = dashboard.style.display === 'none' ? 'flex' : 'none';
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || 'ℹ'}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.4s ease-out';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    /**
     * Show loading overlay
     */
    showLoading(text = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        loadingText.textContent = text;
        overlay.classList.add('active');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('active');
    }

    /**
     * Mock API adapter
     * In production, replace with Appwrite SDK calls
     */
    mockAPI = {
        createOrder: async (order) => {
            // TODO: Replace with Appwrite
            // const response = await databases.createDocument(
            //     'database_id',
            //     'orders',
            //     ID.unique(),
            //     order
            // );

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Save to localStorage for demo
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            return order;
        }
    };
}

// ============================================
// INITIALIZE APP
// ============================================
let TShirtApp;

document.addEventListener('DOMContentLoaded', () => {
    TShirtApp = new TShirtCustomizer();
});

// ============================================
// APPWRITE INTEGRATION NOTES
// ============================================
/*
To integrate with Appwrite, replace mockAPI methods with:

import { Client, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client()
    .setEndpoint('YOUR_APPWRITE_ENDPOINT')
    .setProject('YOUR_PROJECT_ID');

const databases = new Databases(client);
const storage = new Storage(client);

// Create order
await databases.createDocument(
    'database_id',
    'orders',
    ID.unique(),
    orderData
);

// Upload file
await storage.createFile(
    'user-uploads',
    ID.unique(),
    file
);

// List orders for vendor
await databases.listDocuments(
    'database_id',
    'orders',
    [Query.equal('vendorId', vendorId)]
);

See README.md for complete Appwrite setup instructions.
*/
