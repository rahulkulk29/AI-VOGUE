// AI VOGUE - Product Page Functionality

// Product data (mock data for demonstration)
const productData = {
    1: {
        id: 1,
        name: "Luxury Emerald Blazer",
        price: 2850,
        images: [
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
            "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600"
        ],
        video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        description: "Crafted from the finest Italian wool, this emerald blazer embodies sophistication and modern luxury. Perfect for the discerning fashion enthusiast.",
        features: [
            "100% Italian Wool",
            "Hand-tailored construction",
            "Sustainable materials",
            "Limited edition"
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Emerald", "Navy", "Charcoal"]
    },
    2: {
        id: 2,
        name: "Golden Hour Dress",
        price: 1950,
        images: [
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600",
            "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600"
        ],
        description: "An ethereal piece that captures the essence of golden hour. Flowing silhouette meets contemporary design.",
        features: [
            "Silk blend fabric",
            "Hand-embroidered details",
            "Adjustable fit",
            "Eco-friendly dyes"
        ],
        sizes: ["XS", "S", "M", "L"],
        colors: ["Gold", "Rose", "Ivory"]
    }
};

// DOM Elements
let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentImageIndex = 0;

// Initialize product page
document.addEventListener('DOMContentLoaded', function() {
    loadProduct();
    initializeGallery();
    initializeProductOptions();
    initializeTryOnModal();
});

// Load product data
function loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || '1';
    
    currentProduct = productData[productId];
    
    if (currentProduct) {
        renderProduct();
    } else {
        // Redirect to home if product not found
        window.location.href = 'index.html';
    }
}

// Render product information
function renderProduct() {
    const product = currentProduct;
    
    // Update page title
    document.title = `${product.name} - AI VOGUE`;
    
    // Update product details
    const productTitle = document.querySelector('.product-title');
    const productPrice = document.querySelector('.product-price');
    const productDescription = document.querySelector('.product-description');
    const productFeatures = document.querySelector('.product-features');
    
    if (productTitle) productTitle.textContent = product.name;
    if (productPrice) productPrice.textContent = `$${product.price.toLocaleString()}`;
    if (productDescription) productDescription.textContent = product.description;
    
    // Render features
    if (productFeatures && product.features) {
        productFeatures.innerHTML = product.features
            .map(feature => `<li>${feature}</li>`)
            .join('');
    }
    
    // Render size options
    const sizeOptions = document.querySelector('.size-options');
    if (sizeOptions && product.sizes) {
        sizeOptions.innerHTML = product.sizes
            .map(size => `<button class="size-option" data-size="${size}">${size}</button>`)
            .join('');
    }
    
    // Render color options
    const colorOptions = document.querySelector('.color-options');
    if (colorOptions && product.colors) {
        colorOptions.innerHTML = product.colors
            .map(color => `<button class="color-option" data-color="${color}">${color}</button>`)
            .join('');
    }
    
    // Render gallery
    renderGallery();
}

// Render product gallery
function renderGallery() {
    const mainImage = document.querySelector('.main-image');
    const thumbnails = document.querySelector('.thumbnails');
    const product = currentProduct;
    
    if (mainImage && product.images.length > 0) {
        mainImage.src = product.images[0];
        mainImage.alt = product.name;
    }
    
    if (thumbnails) {
        thumbnails.innerHTML = product.images
            .map((image, index) => 
                `<img src="${image}" alt="${product.name}" class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">`
            ).join('');
        
        // Add video thumbnail if available
        if (product.video) {
            thumbnails.innerHTML += `<div class="video-thumbnail" data-video="${product.video}">▶ Video</div>`;
        }
    }
}

// Initialize gallery functionality
function initializeGallery() {
    const mainImage = document.querySelector('.main-image');
    const thumbnails = document.querySelector('.thumbnails');
    
    if (thumbnails) {
        thumbnails.addEventListener('click', function(e) {
            if (e.target.classList.contains('thumbnail')) {
                const index = parseInt(e.target.dataset.index);
                changeMainImage(index);
            } else if (e.target.classList.contains('video-thumbnail')) {
                const videoUrl = e.target.dataset.video;
                showVideo(videoUrl);
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            navigateGallery(-1);
        } else if (e.key === 'ArrowRight') {
            navigateGallery(1);
        }
    });
}

// Change main image
function changeMainImage(index) {
    const mainImage = document.querySelector('.main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const product = currentProduct;
    
    if (index >= 0 && index < product.images.length) {
        currentImageIndex = index;
        mainImage.src = product.images[index];
        
        // Update active thumbnail
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
}

// Navigate gallery with arrows
function navigateGallery(direction) {
    const product = currentProduct;
    const newIndex = currentImageIndex + direction;
    
    if (newIndex >= 0 && newIndex < product.images.length) {
        changeMainImage(newIndex);
    }
}

// Show video in modal
function showVideo(videoUrl) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <button class="close-video">&times;</button>
            <video controls autoplay>
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close video modal
    modal.querySelector('.close-video').addEventListener('click', function() {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    });
}

// Initialize product options
function initializeProductOptions() {
    const sizeOptions = document.querySelector('.size-options');
    const colorOptions = document.querySelector('.color-options');
    
    if (sizeOptions) {
        sizeOptions.addEventListener('click', function(e) {
            if (e.target.classList.contains('size-option')) {
                // Remove active class from all size options
                sizeOptions.querySelectorAll('.size-option').forEach(option => {
                    option.classList.remove('active');
                });
                
                // Add active class to clicked option
                e.target.classList.add('active');
                selectedSize = e.target.dataset.size;
                updateAddToCartButton();
            }
        });
    }
    
    if (colorOptions) {
        colorOptions.addEventListener('click', function(e) {
            if (e.target.classList.contains('color-option')) {
                // Remove active class from all color options
                colorOptions.querySelectorAll('.color-option').forEach(option => {
                    option.classList.remove('active');
                });
                
                // Add active class to clicked option
                e.target.classList.add('active');
                selectedColor = e.target.dataset.color;
                updateAddToCartButton();
            }
        });
    }
    
    // Buy and Try Now buttons
    const buyButton = document.querySelector('.btn-buy');
    const tryButton = document.querySelector('.btn-try');
    
    if (buyButton) {
        buyButton.addEventListener('click', function() {
            if (selectedSize && selectedColor) {
                window.location.href = `checkout.html?mode=buy&product=${currentProduct.id}&size=${selectedSize}&color=${selectedColor}`;
            } else {
                alert('Please select size and color before purchasing.');
            }
        });
    }
    
    if (tryButton) {
        tryButton.addEventListener('click', openTryOnModal);
    }
}

// Update add to cart button state
function updateAddToCartButton() {
    const buyButton = document.querySelector('.btn-buy');
    
    if (buyButton) {
        if (selectedSize && selectedColor) {
            buyButton.disabled = false;
            buyButton.textContent = 'Add to Cart';
        } else {
            buyButton.disabled = true;
            buyButton.textContent = 'Select Options';
        }
    }
}

// Initialize try-on modal
function initializeTryOnModal() {
    const modal = document.querySelector('.try-on-modal');
    const closeButton = document.querySelector('.close-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (closeButton) {
        closeButton.addEventListener('click', closeTryOnModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeTryOnModal);
    }
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Open try-on modal
function openTryOnModal() {
    const modal = document.querySelector('.try-on-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Close try-on modal
function closeTryOnModal() {
    const modal = document.querySelector('.try-on-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Export functions for global use
window.ProductPage = {
    openTryOnModal,
    closeTryOnModal,
    changeMainImage,
    navigateGallery
};