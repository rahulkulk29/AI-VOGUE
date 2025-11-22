// Mock Data for T-shirt Customizer
// This file contains all product data, vendor info, and sample orders
// Replace with Appwrite SDK calls in production

const MOCK_DATA = {
    // Product catalog
    products: [
        {
            productId: "prod_001",
            name: "Normal Tee",
            slug: "normal-tee",
            base_price: 499,
            variants: ["Normal Tee"],
            colors: [
                { name: "White", hex: "#FFFFFF", premium: false },
                { name: "Black", hex: "#000000", premium: false },
                { name: "Navy", hex: "#001f3f", premium: false },
                { name: "Gray", hex: "#AAAAAA", premium: false },
                { name: "Red", hex: "#FF4136", premium: false },
                { name: "Royal Blue", hex: "#0074D9", premium: true },
                { name: "Forest Green", hex: "#2ECC40", premium: true }
            ],
            sizes: ["S", "M", "L", "XL", "XXL"],
            print_area: { x: 200, y: 150, width: 400, height: 500 },
            mockup: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop&q=80",
            description: "Classic comfortable cotton t-shirt, perfect for everyday wear and custom designs.",
            createdAt: "2024-01-15T10:00:00Z"
        },
        {
            productId: "prod_002",
            name: "Oversized Tee",
            slug: "oversized-tee",
            base_price: 599,
            variants: ["Oversized Tee"],
            colors: [
                { name: "White", hex: "#FFFFFF", premium: false },
                { name: "Black", hex: "#000000", premium: false },
                { name: "Beige", hex: "#d6cabc", premium: true },
                { name: "Olive", hex: "#3D9970", premium: true },
                { name: "Charcoal", hex: "#333333", premium: false },
                { name: "Dusty Pink", hex: "#FFB6C1", premium: true }
            ],
            sizes: ["S", "M", "L", "XL", "XXL"],
            print_area: { x: 180, y: 120, width: 440, height: 550 },
            mockup: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop&q=80",
            description: "Trendy oversized fit for a relaxed, modern streetwear look.",
            createdAt: "2024-01-15T10:00:00Z"
        },
        {
            productId: "prod_003",
            name: "Polo",
            slug: "polo",
            base_price: 699,
            variants: ["Polo"],
            colors: [
                { name: "White", hex: "#FFFFFF", premium: false },
                { name: "Black", hex: "#000000", premium: false },
                { name: "Navy", hex: "#001f3f", premium: false },
                { name: "Burgundy", hex: "#85144b", premium: true },
                { name: "Sky Blue", hex: "#7FDBFF", premium: true },
                { name: "Emerald", hex: "#195042", premium: true }
            ],
            sizes: ["S", "M", "L", "XL", "XXL"],
            print_area: { x: 220, y: 180, width: 360, height: 450 },
            mockup: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=1000&fit=crop&q=80",
            description: "Smart casual polo shirt with collar, ideal for semi-formal occasions.",
            createdAt: "2024-01-15T10:00:00Z"
        },
        {
            productId: "prod_004",
            name: "Long Sleeve",
            slug: "long-sleeve",
            base_price: 799,
            variants: ["Long Sleeve"],
            colors: [
                { name: "White", hex: "#FFFFFF", premium: false },
                { name: "Black", hex: "#000000", premium: false },
                { name: "Gray", hex: "#AAAAAA", premium: false },
                { name: "Navy", hex: "#001f3f", premium: false },
                { name: "Maroon", hex: "#85144b", premium: true },
                { name: "Teal", hex: "#39CCCC", premium: true }
            ],
            sizes: ["S", "M", "L", "XL", "XXL"],
            print_area: { x: 200, y: 150, width: 400, height: 500 },
            mockup: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop&q=80",
            description: "Full sleeve t-shirt for cooler weather and layered looks.",
            createdAt: "2024-01-15T10:00:00Z"
        },
        {
            productId: "prod_005",
            name: "Crop Tee",
            slug: "crop-tee",
            base_price: 549,
            variants: ["Crop Tee"],
            colors: [
                { name: "White", hex: "#FFFFFF", premium: false },
                { name: "Black", hex: "#000000", premium: false },
                { name: "Baby Pink", hex: "#FFB6C1", premium: true },
                { name: "Lavender", hex: "#B10DC9", premium: true },
                { name: "Mint", hex: "#2ECC40", premium: true },
                { name: "Peach", hex: "#FF851B", premium: true }
            ],
            sizes: ["S", "M", "L", "XL"],
            print_area: { x: 200, y: 100, width: 400, height: 350 },
            mockup: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop&q=80",
            description: "Trendy cropped t-shirt for a fashionable, contemporary style.",
            createdAt: "2024-01-15T10:00:00Z"
        },
        {
            productId: "prod_006",
            name: "Premium Cotton Tee",
            slug: "premium-cotton-tee",
            base_price: 899,
            variants: ["Premium Cotton Tee"],
            colors: [
                { name: "White", hex: "#FFFFFF", premium: true },
                { name: "Black", hex: "#000000", premium: true },
                { name: "Ivory", hex: "#FFFFF0", premium: true },
                { name: "Charcoal", hex: "#333333", premium: true },
                { name: "Sage", hex: "#87AE73", premium: true },
                { name: "Camel", hex: "#C19A6B", premium: true }
            ],
            sizes: ["S", "M", "L", "XL", "XXL"],
            print_area: { x: 200, y: 150, width: 400, height: 500 },
            mockup: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&h=1000&fit=crop&q=80",
            description: "Luxury premium cotton t-shirt with superior quality and comfort.",
            createdAt: "2024-01-15T10:00:00Z"
        }
    ],

    // Graphics library
    graphics: [
        {
            graphicId: "gfx_001",
            name: "Abstract Wave",
            path: "assets/graphics/abstract-wave.png",
            tags: ["abstract", "modern", "wave"]
        },
        {
            graphicId: "gfx_002",
            name: "Geometric Pattern",
            path: "assets/graphics/geometric.png",
            tags: ["geometric", "pattern", "modern"]
        },
        {
            graphicId: "gfx_003",
            name: "Floral Design",
            path: "assets/graphics/floral.png",
            tags: ["floral", "nature", "elegant"]
        },
        {
            graphicId: "gfx_004",
            name: "Minimalist Logo",
            path: "assets/graphics/minimalist-logo.png",
            tags: ["minimalist", "logo", "simple"]
        },
        {
            graphicId: "gfx_005",
            name: "Vintage Badge",
            path: "assets/graphics/vintage-badge.png",
            tags: ["vintage", "retro", "badge"]
        }
    ],

    // Vendor information
    vendors: [
        {
            vendorId: "vendor_001",
            name: "Creative Threads Print Studio",
            address: "123 Fashion Street, Mumbai, Maharashtra 400001",
            email: "prints@creativethreads.com",
            phone: "+91-9876543210",
            services: ["Custom T-shirt Printing", "Bulk Orders", "Express Delivery"],
            rating: 4.8,
            createdAt: "2023-06-01T10:00:00Z"
        }
    ],

    // Sample orders
    orders: [
        {
            orderId: "order_001",
            userId: "user_123",
            vendorId: "vendor_001",
            items: [
                {
                    productId: "prod_001",
                    productName: "Normal Tee",
                    variant: "Normal Tee",
                    size: "M",
                    color: "Black",
                    quantity: 2,
                    customizations: {
                        hasImage: true,
                        hasText: true,
                        textContent: "Custom Design",
                        printComplexity: 2
                    },
                    unitPrice: 549,
                    totalPrice: 1098
                }
            ],
            totalPrice: 1098,
            status: "pending",
            estimatedDelivery: "2024-11-28T00:00:00Z",
            createdAt: "2024-11-21T00:29:51+05:30"
        },
        {
            orderId: "order_002",
            userId: "user_456",
            vendorId: "vendor_001",
            items: [
                {
                    productId: "prod_002",
                    productName: "Oversized Tee",
                    variant: "Oversized Tee",
                    size: "L",
                    color: "White",
                    quantity: 50,
                    customizations: {
                        hasImage: true,
                        hasText: false,
                        printComplexity: 3
                    },
                    unitPrice: 629,
                    totalPrice: 29827.5
                }
            ],
            totalPrice: 29827.5,
            status: "accepted",
            estimatedDelivery: "2024-11-30T00:00:00Z",
            createdAt: "2024-11-20T14:20:00+05:30"
        },
        {
            orderId: "order_003",
            userId: "user_789",
            vendorId: "vendor_001",
            items: [
                {
                    productId: "prod_003",
                    productName: "Polo",
                    variant: "Polo",
                    size: "XL",
                    color: "Navy",
                    quantity: 5,
                    customizations: {
                        hasImage: false,
                        hasText: true,
                        textContent: "Company Logo",
                        printComplexity: 1
                    },
                    unitPrice: 749,
                    totalPrice: 3745
                }
            ],
            totalPrice: 3745,
            status: "printing",
            estimatedDelivery: "2024-11-26T00:00:00Z",
            createdAt: "2024-11-19T09:15:00+05:30"
        },
        {
            orderId: "order_004",
            userId: "user_321",
            vendorId: "vendor_001",
            items: [
                {
                    productId: "prod_006",
                    productName: "Premium Cotton Tee",
                    variant: "Premium Cotton Tee",
                    size: "M",
                    color: "Black",
                    quantity: 1,
                    customizations: {
                        hasImage: true,
                        hasText: true,
                        textContent: "Limited Edition",
                        printComplexity: 4
                    },
                    unitPrice: 1149,
                    totalPrice: 1149
                }
            ],
            totalPrice: 1149,
            status: "shipped",
            estimatedDelivery: "2024-11-23T00:00:00Z",
            createdAt: "2024-11-18T16:45:00+05:30"
        }
    ]
};

// Mock API endpoints with simulated latency
const MockAPI = {
    // Simulate network latency
    delay: () => new Promise(resolve => setTimeout(resolve, Math.random() * 350 + 250)),

    // GET /api/products
    getProducts: async () => {
        await MockAPI.delay();
        return {
            success: true,
            data: MOCK_DATA.products
        };
    },

    // GET /api/products/:id
    getProduct: async (productId) => {
        await MockAPI.delay();
        const product = MOCK_DATA.products.find(p => p.productId === productId);
        if (product) {
            return {
                success: true,
                data: product
            };
        }
        return {
            success: false,
            error: "Product not found"
        };
    },

    // GET /api/graphics
    getGraphics: async () => {
        await MockAPI.delay();
        return {
            success: true,
            data: MOCK_DATA.graphics
        };
    },

    // POST /api/cart
    addToCart: async (cartItem) => {
        await MockAPI.delay();
        // In production, this would save to Appwrite database
        console.log("Adding to cart:", cartItem);
        return {
            success: true,
            data: {
                cartId: `cart_${Date.now()}`,
                ...cartItem
            }
        };
    },

    // POST /api/order
    createOrder: async (orderData) => {
        await MockAPI.delay();
        const newOrder = {
            orderId: `order_${Date.now()}`,
            ...orderData,
            status: "pending",
            createdAt: new Date().toISOString()
        };
        // In production, this would save to Appwrite database
        MOCK_DATA.orders.push(newOrder);
        console.log("Order created:", newOrder);
        return {
            success: true,
            data: newOrder
        };
    },

    // GET /api/orders?vendorId=...
    getVendorOrders: async (vendorId) => {
        await MockAPI.delay();
        const orders = MOCK_DATA.orders.filter(o => o.vendorId === vendorId);
        return {
            success: true,
            data: orders
        };
    },

    // PATCH /api/orders/:orderId
    updateOrderStatus: async (orderId, newStatus) => {
        await MockAPI.delay();
        const orderIndex = MOCK_DATA.orders.findIndex(o => o.orderId === orderId);
        if (orderIndex !== -1) {
            MOCK_DATA.orders[orderIndex].status = newStatus;
            return {
                success: true,
                data: MOCK_DATA.orders[orderIndex]
            };
        }
        return {
            success: false,
            error: "Order not found"
        };
    }
};

// Pricing calculation utilities
const PricingEngine = {
    // Base prices (INR)
    basePrices: {
        "Normal Tee": 499,
        "Oversized Tee": 599,
        "Polo": 699,
        "Long Sleeve": 799,
        "Crop Tee": 549,
        "Premium Cotton Tee": 899
    },

    // Size multipliers
    sizeMultipliers: {
        "S": 0,
        "M": 0,
        "L": 0.05,
        "XL": 0.07,
        "XXL": 0.10
    },

    // Premium color surcharge (20% of base)
    premiumColorSurcharge: 0.20,

    // Per color fee for print
    perColorFee: 50,

    // Bulk discounts
    bulkDiscounts: [
        { min: 10, max: 49, discount: 0.05 },
        { min: 50, max: 99, discount: 0.10 },
        { min: 100, max: Infinity, discount: 0.15 }
    ],

    // Calculate print complexity fee (0-150 based on colors used)
    calculateComplexityFee: (colorCount) => {
        return Math.min(colorCount * 50, 150);
    },

    // Main pricing calculation
    calculatePrice: (variant, size, isPremiumColor, quantity, printComplexity = 0) => {
        const basePrice = PricingEngine.basePrices[variant] || 499;
        const sizeMultiplier = PricingEngine.sizeMultipliers[size] || 0;
        const colorSurcharge = isPremiumColor ? basePrice * PricingEngine.premiumColorSurcharge : 0;
        const complexityFee = PricingEngine.calculateComplexityFee(printComplexity);
        const perColorFee = printComplexity * PricingEngine.perColorFee;

        // Calculate unit price before bulk discount
        const unitPrice = basePrice + (basePrice * sizeMultiplier) + colorSurcharge + complexityFee + perColorFee;

        // Calculate bulk discount
        let bulkDiscount = 0;
        const discountTier = PricingEngine.bulkDiscounts.find(
            tier => quantity >= tier.min && quantity <= tier.max
        );
        if (discountTier) {
            bulkDiscount = unitPrice * quantity * discountTier.discount;
        }

        // Calculate final price
        const totalPrice = (unitPrice * quantity) - bulkDiscount;

        return {
            basePrice,
            sizeMultiplier: basePrice * sizeMultiplier,
            colorSurcharge,
            printComplexity: complexityFee,
            perColorFee,
            bulkDiscount,
            unitPrice,
            totalPrice,
            breakdown: {
                base: basePrice,
                sizeAdjustment: basePrice * sizeMultiplier,
                colorExtra: colorSurcharge,
                complexity: complexityFee,
                colorFee: perColorFee,
                subtotal: unitPrice * quantity,
                discount: bulkDiscount,
                final: totalPrice
            }
        };
    }
};

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MOCK_DATA, MockAPI, PricingEngine };
}
