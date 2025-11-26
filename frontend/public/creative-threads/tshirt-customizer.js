// T-shirt Customizer Application
// Main application logic with canvas manipulation, state management, and UI controls

class TShirtCustomizer {
    constructor() {
        // State management
        this.state = {
            currentProduct: null,
            selectedVariant: null,
            selectedSize: 'M',
            selectedColor: null,
            quantity: 1,
            canvasElements: [],
            selectedElement: null,
            undoStack: [],
            redoStack: [],
            cart: [],
            showGuides: false
        };

        // Canvas setup
        this.canvas = document.getElementById('tshirt-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Initialize
        this.init();
    }

    async init() {
        // Load products
        await this.loadProducts();

        // Setup event listeners
        this.setupEventListeners();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Load cart from localStorage
        this.loadCart();

        // Initialize Gucci menu (from main.js)
        this.initializeGucciMenu();
    }

    // ========================================
    // PRODUCT LOADING
    // ========================================

    async loadProducts() {
        try {
            const response = await MockAPI.getProducts();
            if (response.success) {
                this.renderProducts(response.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderProducts(products) {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        products.forEach((product, index) => {
            const card = this.createProductCard(product);
            // Add staggered fade-in animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            grid.appendChild(card);

            // Trigger animation after a brief delay
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.mockup}" alt="${product.name}" class="product-mockup" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect fill=%22%23d6cabc%22 width=%22400%22 height=%22500%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%231d3937%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-base-price">₹${product.base_price}</p>
                <div class="product-swatches">
                    ${product.colors.slice(0, 6).map(color => `
                        <div class="swatch ${color.premium ? 'premium' : ''}" 
                             style="background-color: ${color.hex}" 
                             title="${color.name}${color.premium ? ' (Premium)' : ''}"></div>
                    `).join('')}
                </div>
                <button class="customize-btn" data-product-id="${product.productId}">
                    <i class="fas fa-paint-brush"></i> Customize
                </button>
            </div>
        `;

        card.querySelector('.customize-btn').addEventListener('click', () => {
            this.openCustomizer(product);
        });

        return card;
    }

    // ========================================
    // CUSTOMIZER PANEL
    // ========================================

    async openCustomizer(product) {
        this.state.currentProduct = product;
        this.state.selectedVariant = product.variants[0];
        this.state.selectedColor = product.colors[0];

        // Hide products, show customizer
        document.getElementById('tshirt-products').style.display = 'none';
        document.getElementById('customizer-panel').style.display = 'block';

        // Initialize canvas
        this.initializeCanvas();

        // Populate controls
        this.populateVariantSelect();
        this.populateColorSwatches();

        // Load graphics
        await this.loadGraphics();

        // Update pricing
        this.updatePricing();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    initializeCanvas() {
        const product = this.state.currentProduct;
        const color = this.state.selectedColor;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Load and draw t-shirt mockup with color overlay
        const mockupImg = new Image();
        mockupImg.crossOrigin = "anonymous";

        mockupImg.onload = () => {
            // Draw the mockup image
            this.ctx.drawImage(mockupImg, 0, 0, this.canvas.width, this.canvas.height);

            // Apply color overlay using blend mode
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = color.hex;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Reset composite operation
            this.ctx.globalCompositeOperation = 'source-over';

            // Redraw any existing canvas elements on top
            this.state.canvasElements.forEach(element => {
                if (element.type === 'image') {
                    this.drawImageElement(element);
                } else if (element.type === 'text') {
                    this.drawTextElement(element);
                }
            });
        };

        mockupImg.onerror = () => {
            // Fallback: draw simple t-shirt shape with color
            this.drawTShirtShape(color.hex);
        };

        mockupImg.src = product.mockup;

        // Setup print area guide
        this.setupPrintAreaGuide(product.print_area);
    }

    drawTShirtShape(color) {
        // Fallback simple t-shirt silhouette
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw basic t-shirt outline
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(150, 100);
        this.ctx.lineTo(250, 50);
        this.ctx.lineTo(350, 50);
        this.ctx.lineTo(450, 100);
        this.ctx.lineTo(650, 100);
        this.ctx.lineTo(650, 950);
        this.ctx.lineTo(150, 950);
        this.ctx.closePath();
        this.ctx.fill();

        // Add subtle shadow for depth
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;
    }

    setupPrintAreaGuide(printArea) {
        const guide = document.getElementById('print-area-guide');
        const canvasRect = this.canvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this.canvas.width;
        const scaleY = canvasRect.height / this.canvas.height;

        guide.style.left = `${printArea.x * scaleX}px`;
        guide.style.top = `${printArea.y * scaleY}px`;
        guide.style.width = `${printArea.width * scaleX}px`;
        guide.style.height = `${printArea.height * scaleY}px`;
    }

    populateVariantSelect() {
        const select = document.getElementById('variant-select');
        const product = this.state.currentProduct;

        select.innerHTML = product.variants.map(variant => `
            <option value="${variant}">${variant}</option>
        `).join('');

        select.value = this.state.selectedVariant;
    }

    populateColorSwatches() {
        const container = document.getElementById('color-swatches');
        const product = this.state.currentProduct;

        container.innerHTML = product.colors.map(color => `
            <div class="color-swatch ${color.premium ? 'premium' : ''} ${color === this.state.selectedColor ? 'active' : ''}" 
                 data-color='${JSON.stringify(color)}'>
                <div class="color-swatch-inner" style="background-color: ${color.hex}"></div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = JSON.parse(swatch.dataset.color);
                this.changeColor(color);
            });
        });
    }

    changeColor(color) {
        this.state.selectedColor = color;
        this.initializeCanvas();
        this.redrawCanvas();
        this.populateColorSwatches();
        this.updatePricing();
    }

    // ========================================
    // GRAPHICS LIBRARY
    // ========================================

    async loadGraphics() {
        try {
            const response = await MockAPI.getGraphics();
            if (response.success) {
                this.renderGraphics(response.data);
            }
        } catch (error) {
            console.error('Error loading graphics:', error);
        }
    }

    renderGraphics(graphics) {
        const grid = document.getElementById('graphics-grid');
        grid.innerHTML = graphics.map(graphic => `
            <div class="graphic-item" data-graphic-id="${graphic.graphicId}">
                <img src="${graphic.path}" alt="${graphic.name}"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23d6cabc%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2212%22 fill=%22%231d3937%22%3E${graphic.name}%3C/text%3E%3C/svg%3E'">
            </div>
        `).join('');

        // Add click listeners
        grid.querySelectorAll('.graphic-item').forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                this.addImageToCanvas(img.src);
            });
        });
    }

    // ========================================
    // IMAGE UPLOAD & MANIPULATION
    // ========================================

    setupImageUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('image-upload');

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-dark-green)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--color-beige)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-beige)';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageFile(file);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageFile(file);
            }
        });
    }

    handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.addImageToCanvas(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    addImageToCanvas(imageSrc) {
        const img = new Image();
        img.onload = () => {
            const element = {
                type: 'image',
                image: img,
                x: 300,
                y: 300,
                width: 200,
                height: 200,
                rotation: 0,
                opacity: 1,
                flipH: false,
                flipV: false
            };

            this.state.canvasElements.push(element);
            this.state.selectedElement = element;
            this.saveState();
            this.redrawCanvas();
            this.showImageControls();
        };
        img.src = imageSrc;
    }

    showImageControls() {
        document.getElementById('image-transform-controls').style.display = 'block';
    }

    // ========================================
    // TEXT MANIPULATION
    // ========================================

    addTextToCanvas() {
        const textInput = document.getElementById('text-input');
        const text = textInput.value.trim();

        if (!text) return;

        const element = {
            type: 'text',
            text: text,
            x: 400,
            y: 400,
            fontSize: 36,
            fontFamily: 'Inter',
            color: '#000000',
            bold: false,
            italic: false,
            align: 'center',
            letterSpacing: 0
        };

        this.state.canvasElements.push(element);
        this.state.selectedElement = element;
        this.saveState();
        this.redrawCanvas();
        this.showTextControls();

        textInput.value = '';
    }

    showTextControls() {
        document.getElementById('text-style-controls').style.display = 'block';
    }

    // ========================================
    // CANVAS RENDERING
    // ========================================

    redrawCanvas() {
        const product = this.state.currentProduct;
        const color = this.state.selectedColor;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Load and draw t-shirt mockup with color overlay
        const mockupImg = new Image();
        mockupImg.crossOrigin = "anonymous";

        mockupImg.onload = () => {
            // Draw the mockup image
            this.ctx.drawImage(mockupImg, 0, 0, this.canvas.width, this.canvas.height);

            // Apply color overlay using blend mode
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = color.hex;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Reset composite operation
            this.ctx.globalCompositeOperation = 'source-over';

            // Draw all elements
            this.state.canvasElements.forEach(element => {
                if (element.type === 'image') {
                    this.drawImageElement(element);
                } else if (element.type === 'text') {
                    this.drawTextElement(element);
                }
            });

            // Draw selection if any
            if (this.state.selectedElement) {
                this.drawSelection(this.state.selectedElement);
            }
        };

        mockupImg.onerror = () => {
            // Fallback: draw simple t-shirt shape with color
            this.drawTShirtShape(color.hex);

            // Draw all elements
            this.state.canvasElements.forEach(element => {
                if (element.type === 'image') {
                    this.drawImageElement(element);
                } else if (element.type === 'text') {
                    this.drawTextElement(element);
                }
            });

            // Draw selection if any
            if (this.state.selectedElement) {
                this.drawSelection(this.state.selectedElement);
            }
        };

        mockupImg.src = product.mockup;
    }

    drawImageElement(element) {
        this.ctx.save();

        this.ctx.globalAlpha = element.opacity;
        this.ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
        this.ctx.rotate((element.rotation * Math.PI) / 180);
        this.ctx.scale(element.flipH ? -1 : 1, element.flipV ? -1 : 1);

        this.ctx.drawImage(
            element.image,
            -element.width / 2,
            -element.height / 2,
            element.width,
            element.height
        );

        this.ctx.restore();
    }

    drawTextElement(element) {
        this.ctx.save();

        this.ctx.font = `${element.italic ? 'italic' : ''} ${element.bold ? 'bold' : ''} ${element.fontSize}px ${element.fontFamily}`;
        this.ctx.fillStyle = element.color;
        this.ctx.textAlign = element.align;
        this.ctx.textBaseline = 'middle';

        // Apply letter spacing
        if (element.letterSpacing !== 0) {
            const chars = element.text.split('');
            let xOffset = 0;
            chars.forEach(char => {
                this.ctx.fillText(char, element.x + xOffset, element.y);
                xOffset += this.ctx.measureText(char).width + element.letterSpacing;
            });
        } else {
            this.ctx.fillText(element.text, element.x, element.y);
        }

        this.ctx.restore();
    }

    drawSelection(element) {
        this.ctx.save();
        this.ctx.strokeStyle = '#0074D9';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        if (element.type === 'image') {
            this.ctx.strokeRect(element.x, element.y, element.width, element.height);
        } else if (element.type === 'text') {
            const metrics = this.ctx.measureText(element.text);
            this.ctx.strokeRect(element.x - 10, element.y - element.fontSize / 2 - 5, metrics.width + 20, element.fontSize + 10);
        }

        this.ctx.restore();
    }

    // ========================================
    // UNDO/REDO SYSTEM
    // ========================================

    saveState() {
        const state = JSON.stringify({
            canvasElements: this.state.canvasElements,
            selectedElement: this.state.selectedElement
        });

        this.state.undoStack.push(state);
        this.state.redoStack = [];

        // Limit undo stack to 20 items
        if (this.state.undoStack.length > 20) {
            this.state.undoStack.shift();
        }

        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.state.undoStack.length > 0) {
            const currentState = JSON.stringify({
                canvasElements: this.state.canvasElements,
                selectedElement: this.state.selectedElement
            });

            this.state.redoStack.push(currentState);
            const previousState = this.state.undoStack.pop();
            const parsed = JSON.parse(previousState);

            this.state.canvasElements = parsed.canvasElements;
            this.state.selectedElement = parsed.selectedElement;

            this.redrawCanvas();
            this.updateUndoRedoButtons();
        }
    }

    redo() {
        if (this.state.redoStack.length > 0) {
            const currentState = JSON.stringify({
                canvasElements: this.state.canvasElements,
                selectedElement: this.state.selectedElement
            });

            this.state.undoStack.push(currentState);
            const nextState = this.state.redoStack.pop();
            const parsed = JSON.parse(nextState);

            this.state.canvasElements = parsed.canvasElements;
            this.state.selectedElement = parsed.selectedElement;

            this.redrawCanvas();
            this.updateUndoRedoButtons();
        }
    }

    updateUndoRedoButtons() {
        document.getElementById('undo-btn').disabled = this.state.undoStack.length === 0;
        document.getElementById('redo-btn').disabled = this.state.redoStack.length === 0;
    }

    // ========================================
    // PRICING ENGINE
    // ========================================

    updatePricing() {
        const variant = this.state.selectedVariant;
        const size = this.state.selectedSize;
        const isPremium = this.state.selectedColor?.premium || false;
        const quantity = this.state.quantity;
        const printComplexity = this.calculatePrintComplexity();

        const pricing = PricingEngine.calculatePrice(variant, size, isPremium, quantity, printComplexity);

        // Update UI
        document.getElementById('base-price').textContent = `₹${pricing.basePrice}`;
        document.getElementById('size-multiplier').textContent = `+₹${pricing.sizeMultiplier.toFixed(0)}`;
        document.getElementById('color-surcharge').textContent = `+₹${pricing.colorSurcharge.toFixed(0)}`;
        document.getElementById('print-complexity').textContent = `+₹${pricing.printComplexity}`;
        document.getElementById('per-color-fee').textContent = `+₹${pricing.perColorFee}`;
        document.getElementById('bulk-discount').textContent = `-₹${pricing.bulkDiscount.toFixed(0)}`;
        document.getElementById('total-price').textContent = `₹${pricing.totalPrice.toFixed(0)}`;
    }

    calculatePrintComplexity() {
        // Simple heuristic: count unique colors in images and text
        let colorCount = 0;

        this.state.canvasElements.forEach(element => {
            if (element.type === 'image') colorCount += 2; // Assume 2 colors per image
            if (element.type === 'text') colorCount += 1;
        });

        return Math.min(colorCount, 3); // Cap at 3 for complexity fee
    }

    // ========================================
    // CART MANAGEMENT
    // ========================================

    addToCart() {
        const pricing = PricingEngine.calculatePrice(
            this.state.selectedVariant,
            this.state.selectedSize,
            this.state.selectedColor?.premium || false,
            this.state.quantity,
            this.calculatePrintComplexity()
        );

        // Capture canvas as image
        const canvasDataURL = this.canvas.toDataURL('image/png');

        const cartItem = {
            id: `cart_${Date.now()}`,
            productId: this.state.currentProduct.productId,
            productName: this.state.currentProduct.name,
            variant: this.state.selectedVariant,
            size: this.state.selectedSize,
            color: this.state.selectedColor.name,
            quantity: this.state.quantity,
            unitPrice: pricing.unitPrice,
            totalPrice: pricing.totalPrice,
            preview: canvasDataURL,
            customizations: {
                hasImage: this.state.canvasElements.some(e => e.type === 'image'),
                hasText: this.state.canvasElements.some(e => e.type === 'text'),
                printComplexity: this.calculatePrintComplexity()
            }
        };

        this.state.cart.push(cartItem);
        this.saveCart();
        this.updateCartUI();
        this.openCartDrawer();

        // Show success message
        this.showNotification('Added to cart successfully!', 'success');
    }

    saveCart() {
        localStorage.setItem('tshirt_cart', JSON.stringify(this.state.cart));
    }

    loadCart() {
        const saved = localStorage.getItem('tshirt_cart');
        if (saved) {
            this.state.cart = JSON.parse(saved);
            this.updateCartUI();
        }
    }

    updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartCount = document.getElementById('cart-count');

        if (this.state.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: var(--color-gray-medium); padding: 2rem;">Your cart is empty</p>';
            cartTotal.textContent = '₹0';
            cartCount.textContent = '0';
            return;
        }

        cartItems.innerHTML = this.state.cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.preview}" alt="${item.productName}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.productName}</div>
                    <div class="cart-item-specs">${item.size} | ${item.color} | Qty: ${item.quantity}</div>
                    <div class="cart-item-price">₹${item.totalPrice.toFixed(0)}</div>
                </div>
                <button class="cart-item-remove" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Add remove listeners
        cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.removeFromCart(index);
            });
        });

        const total = this.state.cart.reduce((sum, item) => sum + item.totalPrice, 0);
        cartTotal.textContent = `₹${total.toFixed(0)}`;
        cartCount.textContent = this.state.cart.length.toString();
    }

    removeFromCart(index) {
        this.state.cart.splice(index, 1);
        this.saveCart();
        this.updateCartUI();
    }

    openCartDrawer() {
        document.getElementById('cart-drawer').classList.add('open');
        document.getElementById('cart-overlay').classList.add('active');
    }

    closeCartDrawer() {
        document.getElementById('cart-drawer').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('active');
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        // Back to products
        document.getElementById('back-to-products').addEventListener('click', () => {
            document.getElementById('customizer-panel').style.display = 'none';
            document.getElementById('tshirt-products').style.display = 'block';
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
            });
        });

        // Size selection
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.selectedSize = btn.dataset.size;
                this.updatePricing();
            });
        });

        // Quantity controls
        document.getElementById('qty-decrease').addEventListener('click', () => {
            const input = document.getElementById('quantity-input');
            if (input.value > 1) {
                input.value = parseInt(input.value) - 1;
                this.state.quantity = parseInt(input.value);
                this.updatePricing();
            }
        });

        document.getElementById('qty-increase').addEventListener('click', () => {
            const input = document.getElementById('quantity-input');
            input.value = parseInt(input.value) + 1;
            this.state.quantity = parseInt(input.value);
            this.updatePricing();
        });

        document.getElementById('quantity-input').addEventListener('change', (e) => {
            this.state.quantity = Math.max(1, parseInt(e.target.value) || 1);
            e.target.value = this.state.quantity;
            this.updatePricing();
        });

        // Canvas controls
        document.getElementById('toggle-guides').addEventListener('click', () => {
            this.state.showGuides = !this.state.showGuides;
            document.getElementById('print-area-guide').classList.toggle('visible', this.state.showGuides);
        });

        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());

        // Image upload
        this.setupImageUpload();

        // Text controls
        document.getElementById('add-text-btn').addEventListener('click', () => this.addTextToCanvas());

        // Real-time image transform controls
        const imageScaleSlider = document.getElementById('image-scale');
        const imageRotationSlider = document.getElementById('image-rotation');
        const imageOpacitySlider = document.getElementById('image-opacity');

        if (imageScaleSlider) {
            imageScaleSlider.addEventListener('input', (e) => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'image') {
                    const scale = parseInt(e.target.value) / 100;
                    const baseWidth = 200;
                    const baseHeight = 200;
                    this.state.selectedElement.width = baseWidth * scale;
                    this.state.selectedElement.height = baseHeight * scale;
                    document.getElementById('scale-value').textContent = `${e.target.value}%`;
                    this.redrawCanvas();
                }
            });
        }

        if (imageRotationSlider) {
            imageRotationSlider.addEventListener('input', (e) => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'image') {
                    this.state.selectedElement.rotation = parseInt(e.target.value);
                    document.getElementById('rotation-value').textContent = `${e.target.value}°`;
                    this.redrawCanvas();
                }
            });
        }

        if (imageOpacitySlider) {
            imageOpacitySlider.addEventListener('input', (e) => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'image') {
                    this.state.selectedElement.opacity = parseInt(e.target.value) / 100;
                    document.getElementById('opacity-value').textContent = `${e.target.value}%`;
                    this.redrawCanvas();
                }
            });
        }

        // Image flip buttons
        const flipHBtn = document.getElementById('flip-horizontal');
        const flipVBtn = document.getElementById('flip-vertical');
        const removeImgBtn = document.getElementById('remove-image');

        if (flipHBtn) {
            flipHBtn.addEventListener('click', () => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'image') {
                    this.state.selectedElement.flipH = !this.state.selectedElement.flipH;
                    this.redrawCanvas();
                }
            });
        }

        if (flipVBtn) {
            flipVBtn.addEventListener('click', () => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'image') {
                    this.state.selectedElement.flipV = !this.state.selectedElement.flipV;
                    this.redrawCanvas();
                }
            });
        }

        if (removeImgBtn) {
            removeImgBtn.addEventListener('click', () => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'image') {
                    const index = this.state.canvasElements.indexOf(this.state.selectedElement);
                    if (index > -1) {
                        this.state.canvasElements.splice(index, 1);
                        this.state.selectedElement = null;
                        document.getElementById('image-transform-controls').style.display = 'none';
                        this.redrawCanvas();
                    }
                }
            });
        }

        // Real-time text controls
        const textSizeSlider = document.getElementById('text-size');
        const textColorPicker = document.getElementById('text-color');
        const fontSelect = document.getElementById('font-select');
        const letterSpacingSlider = document.getElementById('letter-spacing');

        if (textSizeSlider) {
            textSizeSlider.addEventListener('input', (e) => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    this.state.selectedElement.fontSize = parseInt(e.target.value);
                    document.getElementById('text-size-value').textContent = `${e.target.value}px`;
                    this.redrawCanvas();
                }
            });
        }

        if (textColorPicker) {
            textColorPicker.addEventListener('input', (e) => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    this.state.selectedElement.color = e.target.value;
                    this.redrawCanvas();
                }
            });
        }

        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    this.state.selectedElement.fontFamily = e.target.value;
                    this.redrawCanvas();
                }
            });
        }

        if (letterSpacingSlider) {
            letterSpacingSlider.addEventListener('input', (e) => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    this.state.selectedElement.letterSpacing = parseInt(e.target.value);
                    document.getElementById('letter-spacing-value').textContent = `${e.target.value}px`;
                    this.redrawCanvas();
                }
            });
        }

        // Text formatting buttons
        const boldBtn = document.getElementById('text-bold');
        const italicBtn = document.getElementById('text-italic');
        const alignLeftBtn = document.getElementById('text-align-left');
        const alignCenterBtn = document.getElementById('text-align-center');
        const alignRightBtn = document.getElementById('text-align-right');
        const removeTextBtn = document.getElementById('remove-text');

        if (boldBtn) {
            boldBtn.addEventListener('click', () => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    this.state.selectedElement.bold = !this.state.selectedElement.bold;
                    boldBtn.classList.toggle('active');
                    this.redrawCanvas();
                }
            });
        }

        if (italicBtn) {
            italicBtn.addEventListener('click', () => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    this.state.selectedElement.italic = !this.state.selectedElement.italic;
                    italicBtn.classList.toggle('active');
                    this.redrawCanvas();
                }
            });
        }

        if (alignLeftBtn) {
            alignLeftBtn.addEventListener('click', () => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    this.state.selectedElement.align = 'left';
                    this.redrawCanvas();
                }
            });
        }

        if (alignCenterBtn) {
            alignCenterBtn.addEventListener('click', () => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    this.state.selectedElement.align = 'center';
                    this.redrawCanvas();
                }
            });
        }

        if (alignRightBtn) {
            alignRightBtn.addEventListener('click', () => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    this.state.selectedElement.align = 'right';
                    this.redrawCanvas();
                }
            });
        }

        if (removeTextBtn) {
            removeTextBtn.addEventListener('click', () => {
                if (this.state.selectedElement && this.state.selectedElement.type === 'text') {
                    const index = this.state.canvasElements.indexOf(this.state.selectedElement);
                    if (index > -1) {
                        this.state.canvasElements.splice(index, 1);
                        this.state.selectedElement = null;
                        document.getElementById('text-style-controls').style.display = 'none';
                        this.redrawCanvas();
                    }
                }
            });
        }

        // Add to cart
        document.getElementById('add-to-cart').addEventListener('click', () => this.addToCart());

        // Cart drawer
        document.getElementById('floating-cart-btn').addEventListener('click', () => this.openCartDrawer());
        document.getElementById('cart-close').addEventListener('click', () => this.closeCartDrawer());
        document.getElementById('cart-overlay').addEventListener('click', () => this.closeCartDrawer());

        // Checkout
        document.getElementById('checkout-btn').addEventListener('click', () => this.checkout());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // U - Upload image
            if (e.key === 'u' || e.key === 'U') {
                document.getElementById('image-upload').click();
            }

            // Z - Undo
            if (e.key === 'z' || e.key === 'Z') {
                this.undo();
            }

            // Y - Redo
            if (e.key === 'y' || e.key === 'Y') {
                this.redo();
            }

            // Shift + S - Toggle guides
            if (e.shiftKey && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                document.getElementById('toggle-guides').click();
            }

            // Ctrl/Cmd + Enter - Add to cart
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.state.currentProduct) {
                    this.addToCart();
                }
            }
        });
    }

    // ========================================
    // CHECKOUT & ORDERS
    // ========================================

    async checkout() {
        if (this.state.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }

        const orderData = {
            userId: 'user_demo', // In production, get from auth
            vendorId: 'vendor_001',
            items: this.state.cart,
            totalPrice: this.state.cart.reduce((sum, item) => sum + item.totalPrice, 0)
        };

        try {
            const response = await MockAPI.createOrder(orderData);
            if (response.success) {
                this.showNotification('Order placed successfully!', 'success');
                this.state.cart = [];
                this.saveCart();
                this.updateCartUI();
                this.closeCartDrawer();

                // Show order confirmation
                alert(`Order ID: ${response.data.orderId}\nTotal: ₹${response.data.totalPrice.toFixed(0)}\n\nThank you for your order!`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            this.showNotification('Checkout failed. Please try again.', 'error');
        }
    }

    // ========================================
    // UTILITIES
    // ========================================

    showNotification(message, type = 'info') {
        // Simple notification (can be enhanced with a toast library)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#0074D9'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    initializeGucciMenu() {
        // Reuse menu logic from main.js if available
        const menuBtn = document.querySelector('.gucci-menu-btn');
        const overlay = document.querySelector('.gucci-overlay');
        const overlayBg = document.querySelector('.gucci-overlay-bg');
        const closeBtn = document.querySelector('.gucci-close-btn');

        if (menuBtn && overlay) {
            menuBtn.addEventListener('click', () => {
                overlay.classList.add('active');
                overlayBg.classList.add('active');
            });

            closeBtn?.addEventListener('click', () => {
                overlay.classList.remove('active');
                overlayBg.classList.remove('active');
            });

            overlayBg?.addEventListener('click', () => {
                overlay.classList.remove('active');
                overlayBg.classList.remove('active');
            });
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.customizer = new TShirtCustomizer();
});
