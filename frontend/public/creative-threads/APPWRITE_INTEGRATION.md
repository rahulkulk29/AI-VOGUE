# Appwrite Integration Guide - Creative Threads T-shirt Customizer

## Overview
This document provides step-by-step instructions for integrating the T-shirt customizer with Appwrite backend services.

## Prerequisites
- Appwrite Cloud account or self-hosted Appwrite instance
- Project created in Appwrite console
- Basic understanding of JavaScript and Appwrite SDK

## Step 1: Install Appwrite SDK

Add to your HTML file:
```html
<script src="https://cdn.jsdelivr.net/npm/appwrite@13.0.1"></script>
```

Or install via npm:
```bash
npm install appwrite
```

## Step 2: Initialize Appwrite Client

Create a new file `appwrite-config.js`:

```javascript
import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
    .setProject('[YOUR_PROJECT_ID]'); // Your project ID

// Initialize services
export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export { ID, Query };

// Configuration
export const config = {
    databaseId: '[YOUR_DATABASE_ID]',
    collections: {
        products: 'products',
        vendors: 'vendors',
        orders: 'orders',
        graphics: 'graphics_library'
    },
    buckets: {
        productMockups: 'product-mockups',
        userUploads: 'user-uploads',
        orderPreviews: 'order-previews'
    }
};
```

## Step 3: Create Database Collections

### Collection 1: Products

**Via Appwrite Console:**
1. Go to Databases → Create Database
2. Create collection "products"
3. Add attributes:

| Attribute | Type | Size | Required | Array | Default |
|-----------|------|------|----------|-------|---------|
| productId | string | 50 | ✓ | ✗ | - |
| name | string | 100 | ✓ | ✗ | - |
| slug | string | 100 | ✓ | ✗ | - |
| base_price | integer | - | ✓ | ✗ | - |
| variants | string | 100 | ✗ | ✓ | - |
| colors | string | 10000 | ✓ | ✗ | - |
| sizes | string | 50 | ✗ | ✓ | - |
| print_area | string | 500 | ✗ | ✗ | - |
| mockup | string | 200 | ✗ | ✗ | - |
| description | string | 1000 | ✗ | ✗ | - |
| createdAt | datetime | - | ✓ | ✗ | - |

4. Create indexes:
   - `productId_index` (unique) on `productId`
   - `slug_index` (unique) on `slug`

5. Set permissions:
   - Read: `any`
   - Create: `users`
   - Update: `users`
   - Delete: `users`

**Via Appwrite CLI:**
```bash
appwrite databases createCollection \
    --databaseId=[DATABASE_ID] \
    --collectionId=products \
    --name="Products" \
    --permissions='["read(\"any\")"]'

# Add attributes (repeat for each)
appwrite databases createStringAttribute \
    --databaseId=[DATABASE_ID] \
    --collectionId=products \
    --key=productId \
    --size=50 \
    --required=true

# Create index
appwrite databases createIndex \
    --databaseId=[DATABASE_ID] \
    --collectionId=products \
    --key=productId_index \
    --type=unique \
    --attributes=productId
```

### Collection 2: Vendors

| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| vendorId | string | 50 | ✓ | ✗ |
| name | string | 200 | ✓ | ✗ |
| address | string | 500 | ✗ | ✗ |
| email | email | - | ✓ | ✗ |
| phone | string | 20 | ✗ | ✗ |
| services | string | 100 | ✗ | ✓ |
| rating | double | - | ✗ | ✗ |
| createdAt | datetime | - | ✓ | ✗ |

Indexes:
- `vendorId_index` (unique) on `vendorId`
- `email_index` (unique) on `email`

### Collection 3: Orders

| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| orderId | string | 50 | ✓ | ✗ |
| userId | string | 50 | ✓ | ✗ |
| vendorId | string | 50 | ✓ | ✗ |
| items | string | 50000 | ✓ | ✗ |
| customizations | string | 10000 | ✗ | ✗ |
| totalPrice | double | - | ✓ | ✗ |
| status | string | 50 | ✓ | ✗ |
| estimatedDelivery | datetime | - | ✗ | ✗ |
| createdAt | datetime | - | ✓ | ✗ |

Indexes:
- `orderId_index` (unique) on `orderId`
- `userId_index` (key) on `userId`
- `vendorId_index` (key) on `vendorId`
- `status_index` (key) on `status`

Permissions:
- Read: `user:[USER_ID]`
- Create: `user:[USER_ID]`
- Update: `user:[USER_ID]`

### Collection 4: Graphics Library

| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| graphicId | string | 50 | ✓ | ✗ |
| name | string | 200 | ✓ | ✗ |
| path | string | 500 | ✓ | ✗ |
| tags | string | 50 | ✗ | ✓ |

Indexes:
- `graphicId_index` (unique) on `graphicId`

## Step 4: Create Storage Buckets

### Bucket 1: product-mockups
```javascript
// Via SDK
const bucket = await storage.createBucket(
    'product-mockups',
    'Product Mockups',
    ['read("any")'],
    false, // Not file security
    true,  // Enabled
    5000000, // 5MB max file size
    ['png', 'jpg', 'jpeg', 'webp']
);
```

### Bucket 2: user-uploads
```javascript
const bucket = await storage.createBucket(
    'user-uploads',
    'User Uploads',
    ['read("any")', 'create("users")', 'delete("user:[USER_ID]")'],
    true, // File security enabled
    true,
    10000000, // 10MB
    ['png', 'jpg', 'jpeg']
);
```

### Bucket 3: order-previews
```javascript
const bucket = await storage.createBucket(
    'order-previews',
    'Order Previews',
    ['read("any")', 'create("users")'],
    true,
    true,
    5000000,
    ['png']
);
```

## Step 5: Seed Initial Data

### Seed Products
```javascript
import { databases, config, ID } from './appwrite-config.js';

async function seedProducts() {
    const products = [
        {
            productId: "prod_001",
            name: "Normal Tee",
            slug: "normal-tee",
            base_price: 499,
            variants: ["Normal Tee"],
            colors: JSON.stringify([
                { name: "White", hex: "#FFFFFF", premium: false },
                { name: "Black", hex: "#000000", premium: false },
                { name: "Navy", hex: "#001f3f", premium: false },
                { name: "Gray", hex: "#AAAAAA", premium: false },
                { name: "Red", hex: "#FF4136", premium: false },
                { name: "Royal Blue", hex: "#0074D9", premium: true },
                { name: "Forest Green", hex: "#2ECC40", premium: true }
            ]),
            sizes: ["S", "M", "L", "XL", "XXL"],
            print_area: JSON.stringify({ x: 200, y: 150, width: 400, height: 500 }),
            mockup: "assets/products/normal-tee.png",
            description: "Classic comfortable cotton t-shirt, perfect for everyday wear and custom designs.",
            createdAt: new Date().toISOString()
        },
        // Add other products...
    ];

    for (const product of products) {
        try {
            await databases.createDocument(
                config.databaseId,
                config.collections.products,
                ID.unique(),
                product
            );
            console.log(`Created product: ${product.name}`);
        } catch (error) {
            console.error(`Error creating ${product.name}:`, error);
        }
    }
}

seedProducts();
```

### Seed Graphics
```javascript
async function seedGraphics() {
    const graphics = [
        {
            graphicId: "gfx_001",
            name: "Abstract Wave",
            path: "assets/graphics/abstract-wave.png",
            tags: ["abstract", "modern", "wave"]
        },
        // Add other graphics...
    ];

    for (const graphic of graphics) {
        try {
            await databases.createDocument(
                config.databaseId,
                config.collections.graphics,
                ID.unique(),
                graphic
            );
            console.log(`Created graphic: ${graphic.name}`);
        } catch (error) {
            console.error(`Error creating ${graphic.name}:`, error);
        }
    }
}
```

## Step 6: Update Application Code

### Replace MockAPI.getProducts()
```javascript
// OLD (Mock)
const response = await MockAPI.getProducts();

// NEW (Appwrite)
import { databases, config, Query } from './appwrite-config.js';

async function getProducts() {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.collections.products,
            [
                Query.limit(100),
                Query.orderAsc('name')
            ]
        );
        
        // Parse JSON fields
        const products = response.documents.map(doc => ({
            ...doc,
            colors: JSON.parse(doc.colors),
            print_area: JSON.parse(doc.print_area)
        }));
        
        return { success: true, data: products };
    } catch (error) {
        console.error('Error fetching products:', error);
        return { success: false, error: error.message };
    }
}
```

### Replace MockAPI.createOrder()
```javascript
// NEW (Appwrite)
import { databases, storage, account, config, ID } from './appwrite-config.js';

async function createOrder(orderData) {
    try {
        // Get current user
        const user = await account.get();
        
        // Upload canvas preview
        const canvasBlob = await fetch(this.canvas.toDataURL('image/png'))
            .then(r => r.blob());
        const file = new File([canvasBlob], `order_${Date.now()}.png`, { type: 'image/png' });
        
        const preview = await storage.createFile(
            config.buckets.orderPreviews,
            ID.unique(),
            file
        );
        
        // Create order document
        const order = {
            orderId: ID.unique(),
            userId: user.$id,
            vendorId: orderData.vendorId,
            items: JSON.stringify(orderData.items),
            customizations: JSON.stringify(orderData.customizations || {}),
            totalPrice: orderData.totalPrice,
            status: 'pending',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
        };
        
        const result = await databases.createDocument(
            config.databaseId,
            config.collections.orders,
            ID.unique(),
            order
        );
        
        return { success: true, data: result };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: error.message };
    }
}
```

### Image Upload
```javascript
async function uploadImage(file) {
    try {
        const uploaded = await storage.createFile(
            config.buckets.userUploads,
            ID.unique(),
            file
        );
        
        // Get file URL
        const fileUrl = storage.getFileView(
            config.buckets.userUploads,
            uploaded.$id
        );
        
        return { success: true, url: fileUrl };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}
```

## Step 7: Authentication Integration

### Add Login Check
```javascript
import { account } from './appwrite-config.js';

async function checkAuthentication() {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        // User not logged in
        window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.href);
        return null;
    }
}

// Call before checkout
async function checkout() {
    const user = await checkAuthentication();
    if (!user) return;
    
    // Proceed with checkout...
}
```

## Step 8: Real-time Updates (Optional)

### Subscribe to Order Updates
```javascript
import { client } from './appwrite-config.js';

// Subscribe to order collection changes
client.subscribe(`databases.${config.databaseId}.collections.${config.collections.orders}.documents`, response => {
    console.log('Order update:', response);
    
    if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        console.log('New order created:', response.payload);
    }
    
    if (response.events.includes('databases.*.collections.*.documents.*.update')) {
        console.log('Order updated:', response.payload);
        // Refresh vendor dashboard
        refreshOrders();
    }
});
```

## Step 9: Error Handling

### Implement Robust Error Handling
```javascript
async function safeApiCall(apiFunction, errorMessage) {
    try {
        const result = await apiFunction();
        return { success: true, data: result };
    } catch (error) {
        console.error(errorMessage, error);
        
        // Handle specific Appwrite errors
        if (error.code === 401) {
            // Unauthorized - redirect to login
            window.location.href = '../login.html';
        } else if (error.code === 404) {
            // Not found
            showNotification('Resource not found', 'error');
        } else if (error.code === 429) {
            // Rate limit
            showNotification('Too many requests. Please try again later.', 'error');
        } else {
            // Generic error
            showNotification(errorMessage, 'error');
        }
        
        return { success: false, error: error.message };
    }
}

// Usage
const result = await safeApiCall(
    () => databases.listDocuments(config.databaseId, config.collections.products),
    'Failed to load products'
);
```

## Step 10: Testing

### Test Checklist
- [ ] Products load correctly
- [ ] Graphics load correctly
- [ ] Image upload works
- [ ] Canvas preview saves to storage
- [ ] Orders create successfully
- [ ] User authentication works
- [ ] Permissions are correct
- [ ] Error handling works
- [ ] Real-time updates work (if implemented)

### Test Script
```javascript
async function runTests() {
    console.log('Starting Appwrite integration tests...');
    
    // Test 1: Fetch products
    const products = await getProducts();
    console.assert(products.success, 'Products should load');
    
    // Test 2: Fetch graphics
    const graphics = await getGraphics();
    console.assert(graphics.success, 'Graphics should load');
    
    // Test 3: Check authentication
    const user = await checkAuthentication();
    console.assert(user !== null, 'User should be authenticated');
    
    console.log('All tests completed!');
}
```

## Troubleshooting

### Common Issues

**Issue: "Document not found"**
- Solution: Check collection IDs and database ID are correct

**Issue: "Unauthorized"**
- Solution: Verify permissions on collections and buckets

**Issue: "File too large"**
- Solution: Check bucket file size limits

**Issue: "Invalid JSON"**
- Solution: Ensure JSON.stringify() is used for complex objects

**Issue: "CORS error"**
- Solution: Add your domain to Appwrite platform settings

## Performance Optimization

### 1. Implement Caching
```javascript
const cache = new Map();

async function getCachedProducts() {
    if (cache.has('products')) {
        return cache.get('products');
    }
    
    const products = await getProducts();
    cache.set('products', products);
    
    // Clear cache after 5 minutes
    setTimeout(() => cache.delete('products'), 5 * 60 * 1000);
    
    return products;
}
```

### 2. Lazy Load Images
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img);
});
```

### 3. Batch Operations
```javascript
// Instead of multiple individual calls
const promises = productIds.map(id => 
    databases.getDocument(config.databaseId, config.collections.products, id)
);
const products = await Promise.all(promises);
```

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Use Appwrite's built-in authentication**
3. **Set proper permissions on collections**
4. **Validate user input before saving**
5. **Use HTTPS only**
6. **Implement rate limiting**
7. **Sanitize file uploads**

## Next Steps

1. Set up production Appwrite instance
2. Configure custom domain
3. Set up email templates for order confirmations
4. Implement payment gateway
5. Add analytics tracking
6. Set up monitoring and logging
7. Create admin dashboard

## Support

For Appwrite-specific issues:
- Documentation: https://appwrite.io/docs
- Discord: https://appwrite.io/discord
- GitHub: https://github.com/appwrite/appwrite

For Creative Threads customizer issues:
- Email: hello@aivogue.com
