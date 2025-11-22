/**
 * Product Search Service
 * Handles searching and scraping products from Flipkart and Amazon
 * Also retrieves products from database
 */

const ProductSearchService = {
    scrapeApiUrl: 'http://localhost:5000/api/scrape',
    productsApiUrl: 'http://localhost:5000/api/products',
    
    /**
     * Search for products across both platforms (SCRAPE)
     * @param {string} query - Search query (e.g., 'men jeans')
     * @param {string} category - Product category (pants/shirts/shoes)
     * @param {number} limit - Max products per platform
     * @returns {Promise} Search results
     */
    searchProducts: async function(query, category = 'all', limit = 12) {
        try {
            if (!query || query.trim() === '') {
                console.error('Search query is required');
                return { success: false, error: 'Query required' };
            }
            
            const response = await fetch(`${this.scrapeApiUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query.trim(),
                    category: category,
                    limit: limit
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Search results:', data);
            return data;
            
        } catch (error) {
            console.error('Error searching products:', error);
            return {
                success: false,
                error: error.message || 'Error searching products'
            };
        }
    },
    
    /**
     * Get products from database by category (NO SCRAPING)
     * @param {string} category - Product category (pants/shirts/shoes)
     * @param {number} limit - Max products to retrieve
     * @returns {Promise} Products from database
     */
    getProductsByCategory: async function(category, limit = 12) {
        try {
            if (!category || !['pants', 'shirts', 'shoes'].includes(category.toLowerCase())) {
                console.error('Valid category required: pants, shirts, or shoes');
                return { success: false, error: 'Valid category required' };
            }
            
            const response = await fetch(`${this.productsApiUrl}/category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: category.toLowerCase(),
                    limit: limit
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Retrieved ${data.count} ${category} products from database`);
            return data;
            
        } catch (error) {
            console.error('Error retrieving products by category:', error);
            return {
                success: false,
                error: error.message || 'Error retrieving products'
            };
        }
    },
    
    /**
     * Search products in database (NO SCRAPING)
     * @param {string} query - Search query
     * @param {string} category - Product category
     * @param {number} limit - Max results
     * @returns {Promise} Search results from database
     */
    searchProductsInDatabase: async function(query, category = 'pants', limit = 12) {
        try {
            if (!query || query.trim() === '') {
                console.error('Search query is required');
                return { success: false, error: 'Query required' };
            }
            
            const response = await fetch(`${this.productsApiUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query.trim(),
                    category: category,
                    limit: limit
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Found ${data.count} products matching "${query}"`);
            return data;
            
        } catch (error) {
            console.error('Error searching database:', error);
            return {
                success: false,
                error: error.message || 'Error searching database'
            };
        }
    },
    
    /**
     * Get all products from database
     * @param {number} limit - Max products to retrieve
     * @returns {Promise} All products
     */
    getAllProducts: async function(limit = 100) {
        try {
            const response = await fetch(`${this.productsApiUrl}/all?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Retrieved ${data.count} total products from database`);
            return data;
            
        } catch (error) {
            console.error('Error retrieving all products:', error);
            return {
                success: false,
                error: error.message || 'Error retrieving products'
            };
        }
    },
    
    /**
     * Search Flipkart only
     * @param {string} query - Search query
     * @param {number} limit - Max products
     * @returns {Promise} Flipkart results
     */
    searchFlipkart: async function(query, limit = 12) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/flipkart?query=${encodeURIComponent(query)}&limit=${limit}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Flipkart search error:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Search Amazon only
     * @param {string} query - Search query
     * @param {number} limit - Max products
     * @returns {Promise} Amazon results
     */
    searchAmazon: async function(query, limit = 12) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/amazon?query=${encodeURIComponent(query)}&limit=${limit}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Amazon search error:', error);
            return { success: false, error: error.message };
        }
    }
};

/**
 * Product Display Helper
 * Formats and displays products on the page
 */
const ProductDisplay = {
    /**
     * Create a product card HTML
     * @param {Object} product - Product object
     * @param {string} platform - Platform name (flipkart/amazon)
     * @returns {string} HTML string
     */
    createProductCard: function(product, platform = 'unknown') {
    const imageUrl = product.image_url || 'https://via.placeholder.com/200x200?text=No+Image';
    const name = product.name || 'Unknown Product';
    const priceValue = Number(product.price) || 0;
    const price = priceValue > 0 ? `₹${priceValue.toLocaleString()}` : 'Price N/A';
        const discount = product.discount || '0% off';
        const link = product.product_link || '#';
        
        return `
            <div class="product-card" data-platform="${platform}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${name}" onerror="this.src='https://via.placeholder.com/200x200?text=Image+Error'">
                    <span class="platform-badge">${platform.toUpperCase()}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-name" title="${name}">${name.substring(0, 60)}...</h3>
                    <p class="product-price">${price}</p>
                    <p class="product-discount">${discount}</p>
                </div>
                <div class="product-actions">
                    <button class="btn-buy" onclick="window.open('${link}', '_blank')">
                        <i class="fas fa-shopping-cart"></i> Buy Now
                    </button>
                    <button class="btn-try" data-product='${JSON.stringify(product).replace(/'/g, "\\'")}'>
                        <i class="fas fa-cube"></i> Try On
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * Render products to a container
     * @param {Object} searchResult - Search result object
     * @param {string} containerId - Container element ID
     */
    renderProducts: function(searchResult, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        
        if (!searchResult.success) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${searchResult.error || 'Error loading products'}</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        // Render Flipkart products
        if (searchResult.flipkart && searchResult.flipkart.length > 0) {
            html += '<div class="products-section"><h3>Flipkart</h3><div class="products-grid">';
            searchResult.flipkart.forEach(product => {
                html += this.createProductCard(product, 'flipkart');
            });
            html += '</div></div>';
        }
        
        // Render Amazon products
        if (searchResult.amazon && searchResult.amazon.length > 0) {
            html += '<div class="products-section"><h3>Amazon</h3><div class="products-grid">';
            searchResult.amazon.forEach(product => {
                html += this.createProductCard(product, 'amazon');
            });
            html += '</div></div>';
        }
        
        if (!searchResult.flipkart?.length && !searchResult.amazon?.length) {
            html = '<div class="no-products"><p>No products found. Try a different search.</p></div>';
        }
        
        container.innerHTML = html;
    }
};

// Global click handler for 'Try On' buttons created dynamically
document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-try');
    if (!btn) return;
    try {
        const productData = btn.getAttribute('data-product');
        const product = JSON.parse(productData);
        // Save to localStorage for the MirrorX/3D try-on page
        localStorage.setItem('vogue_selected_product', JSON.stringify(product));
        // Redirect to MirrorX or try-on page (ensure file exists)
        window.location.href = 'mirrorx.html';
    } catch (err) {
        console.error('Error handling Try On:', err);
    }
});

/**
 * Render products returned by database queries (products array)
 * The DB returns a flat products array (with platform and category fields).
 * Convert to the shape expected by renderProducts (flipkart/amazon) and call renderProducts.
 */
ProductDisplay.renderProductsFromDatabase = function(dbResult, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!dbResult.success) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${dbResult.error || 'Error loading products'}</p>
            </div>
        `;
        return;
    }

    // categorize products by platform
    const flipkart = [];
    const amazon = [];
    const rawDocs = dbResult.products || dbResult.documents || [];
    const products = rawDocs.map(d => {
        // Appwrite returns documents with { $id, $collectionId, data: { ... } }
        if (d && d.data) {
            const mapped = { $id: d.$id, ...d.data };
            return mapped;
        }
        return d;
    });
    products.forEach(p => {
        if (p && p.platform && p.platform.toLowerCase() === 'amazon') amazon.push(p);
        else flipkart.push(p);
    });

    const shaped = { success: true, flipkart: flipkart, amazon: amazon };
    ProductDisplay.renderProducts(shaped, containerId);
};

/**
 * Export for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProductSearchService, ProductDisplay };
}

// Expose to window namespace for inline page scripts
if (typeof window !== 'undefined') {
    window.ProductSearchService = ProductSearchService;
    window.ProductDisplay = ProductDisplay;
}
