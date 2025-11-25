# Creative Threads - Custom T-shirt Printing UI

A comprehensive, single-page responsive T-shirt customizer built for AI VOGUE's Creative Threads service. Features real-time canvas preview, advanced image/text editing, dynamic pricing, and complete Appwrite integration readiness.

## 🎨 Features

### Product Catalog
- **6 T-shirt Variants**: Normal Tee, Oversized Tee, Polo, Long Sleeve, Crop Tee, Premium Cotton Tee
- **Multiple Colors**: 6-7 color options per variant with premium color surcharges
- **Size Range**: S, M, L, XL, XXL with size-based pricing multipliers
- **Dynamic Pricing**: Real-time price calculation with full breakdown

### Advanced Customizer
- **Live Canvas Preview**: Real-time rendering of designs on t-shirt mockup
- **Image Upload**: Drag-and-drop or click to upload custom images
- **Image Manipulation**:
  - Scale (10-200%)
  - Rotation (0-360°)
  - Opacity (0-100%)
  - Flip horizontal/vertical
  - Drag to reposition
- **Text Editor**:
  - Multiple fonts (Inter, Playfair Display, Arial, Helvetica, Georgia, etc.)
  - Font size (12-120px)
  - Color picker
  - Bold, Italic formatting
  - Text alignment (left, center, right)
  - Letter spacing control
- **Graphics Library**: Pre-made graphics ready to add to designs
- **Undo/Redo**: 20-step history for all canvas operations
- **Print Area Guides**: Toggle-able safe zone indicators
- **Keyboard Shortcuts**: Power user features for efficiency

### Pricing Engine
Formula: `final_price = (base_price + size_multiplier + color_surcharge + print_complexity_fee + per_color_fee) × quantity × (1 - bulk_discount)`

**Base Prices (INR)**:
- Normal Tee: ₹499
- Oversized Tee: ₹599
- Polo: ₹699
- Long Sleeve: ₹799
- Crop Tee: ₹549
- Premium Cotton Tee: ₹899

**Size Multipliers**:
- L: +5%
- XL: +7%
- XXL: +10%

**Additional Fees**:
- Premium color: +20% of base
- Print complexity: ₹0-150 (based on colors)
- Per-color fee: ₹50/color

**Bulk Discounts**:
- 10-49 units: 5% off
- 50-99 units: 10% off
- 100+ units: 15% off

### Shopping Cart & Checkout
- **Persistent Cart**: Saved to localStorage
- **Cart Drawer**: Slide-out panel with full cart management
- **Item Preview**: Canvas snapshots of custom designs
- **Order Summary**: Complete price breakdown
- **Mock Checkout**: Simulated order placement

### Vendor Dashboard (Mock)
- **Order Management**: View all orders
- **Status Updates**: Pending → Accepted → Printing → Shipped
- **Order Details**: Customer info, customizations, pricing

### Accessibility & UX
- **ARIA Labels**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard control
- **Responsive Design**: Mobile, tablet, desktop optimized
- **Loading States**: Visual feedback for async operations
- **Error Handling**: Graceful degradation

## 🚀 Quick Start

### 1. File Structure
```
creative-threads/
├── tshirt-customizer.html      # Main page
├── tshirt-customizer.css       # Styles (extends main site)
├── tshirt-customizer.js        # Application logic
├── mock-data.js                # Mock API & data
├── assets/
│   ├── products/               # T-shirt mockup images
│   │   ├── normal-tee.png
│   │   ├── oversized-tee.png
│   │   ├── polo.png
│   │   ├── long-sleeve.png
│   │   ├── crop-tee.png
│   │   └── premium-cotton.png
│   └── graphics/               # Pre-made graphics
│       ├── abstract-wave.png
│       ├── geometric.png
│       ├── floral.png
│       ├── minimalist-logo.png
│       └── vintage-badge.png
└── README.md                   # This file
```

### 2. Add Product Mockups
Place 6 t-shirt mockup images (800x1000px recommended) in `assets/products/`:
- Use transparent PNGs or solid color backgrounds
- Front-view, centered, professional product photography style
- Name files exactly as specified above

### 3. Add Graphics
Place 4-5 graphic assets in `assets/graphics/`:
- PNG format with transparency recommended
- 500x500px or similar square dimensions
- Can be logos, patterns, illustrations, etc.

### 4. Open in Browser
Simply open `tshirt-customizer.html` in a modern browser. No build step required!

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `U` | Upload Image |
| `Z` | Undo |
| `Y` | Redo |
| `Shift + S` | Toggle Print Guides |
| `Ctrl/Cmd + Enter` | Add to Cart |

## 🗄️ Appwrite Integration

### Required Collections

#### 1. **products**
```javascript
{
  "collectionId": "products",
  "name": "Products",
  "permissions": ["read(\"any\")"],
  "attributes": [
    { "key": "productId", "type": "string", "size": 50, "required": true },
    { "key": "name", "type": "string", "size": 100, "required": true },
    { "key": "slug", "type": "string", "size": 100, "required": true },
    { "key": "base_price", "type": "integer", "required": true },
    { "key": "variants", "type": "string", "size": 500, "array": true },
    { "key": "colors", "type": "string", "size": 10000, "required": true }, // JSON string
    { "key": "sizes", "type": "string", "size": 200, "array": true },
    { "key": "print_area", "type": "string", "size": 500 }, // JSON string
    { "key": "mockup", "type": "string", "size": 200 },
    { "key": "description", "type": "string", "size": 1000 },
    { "key": "createdAt", "type": "datetime", "required": true }
  ],
  "indexes": [
    { "key": "productId_index", "type": "unique", "attributes": ["productId"] },
    { "key": "slug_index", "type": "unique", "attributes": ["slug"] }
  ]
}
```

**Sample Document**:
```json
{
  "productId": "prod_001",
  "name": "Normal Tee",
  "slug": "normal-tee",
  "base_price": 499,
  "variants": ["Normal Tee"],
  "colors": "[{\"name\":\"White\",\"hex\":\"#FFFFFF\",\"premium\":false},{\"name\":\"Black\",\"hex\":\"#000000\",\"premium\":false}]",
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "print_area": "{\"x\":200,\"y\":150,\"width\":400,\"height\":500}",
  "mockup": "https://cloud.appwrite.io/v1/storage/buckets/product-mockups/files/normal-tee/view",
  "description": "Classic comfortable cotton t-shirt",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

#### 2. **vendors**
```javascript
{
  "collectionId": "vendors",
  "name": "Vendors",
  "permissions": ["read(\"any\")"],
  "attributes": [
    { "key": "vendorId", "type": "string", "size": 50, "required": true },
    { "key": "name", "type": "string", "size": 200, "required": true },
    { "key": "address", "type": "string", "size": 500 },
    { "key": "email", "type": "email", "required": true },
    { "key": "phone", "type": "string", "size": 20 },
    { "key": "services", "type": "string", "size": 200, "array": true },
    { "key": "rating", "type": "double" },
    { "key": "createdAt", "type": "datetime", "required": true }
  ],
  "indexes": [
    { "key": "vendorId_index", "type": "unique", "attributes": ["vendorId"] },
    { "key": "email_index", "type": "unique", "attributes": ["email"] }
  ]
}
```

#### 3. **orders**
```javascript
{
  "collectionId": "orders",
  "name": "Orders",
  "permissions": [
    "read(\"user:[USER_ID]\")",
    "create(\"user:[USER_ID]\")",
    "update(\"user:[USER_ID]\")"
  ],
  "attributes": [
    { "key": "orderId", "type": "string", "size": 50, "required": true },
    { "key": "userId", "type": "string", "size": 50, "required": true },
    { "key": "vendorId", "type": "string", "size": 50, "required": true },
    { "key": "items", "type": "string", "size": 50000, "required": true }, // JSON string
    { "key": "customizations", "type": "string", "size": 10000 }, // JSON string
    { "key": "totalPrice", "type": "double", "required": true },
    { "key": "status", "type": "string", "size": 50, "required": true },
    { "key": "estimatedDelivery", "type": "datetime" },
    { "key": "createdAt", "type": "datetime", "required": true }
  ],
  "indexes": [
    { "key": "orderId_index", "type": "unique", "attributes": ["orderId"] },
    { "key": "userId_index", "type": "key", "attributes": ["userId"] },
    { "key": "vendorId_index", "type": "key", "attributes": ["vendorId"] },
    { "key": "status_index", "type": "key", "attributes": ["status"] }
  ]
}
```

#### 4. **graphics_library**
```javascript
{
  "collectionId": "graphics_library",
  "name": "Graphics Library",
  "permissions": ["read(\"any\")"],
  "attributes": [
    { "key": "graphicId", "type": "string", "size": 50, "required": true },
    { "key": "name", "type": "string", "size": 200, "required": true },
    { "key": "path", "type": "string", "size": 500, "required": true },
    { "key": "tags", "type": "string", "size": 50, "array": true }
  ],
  "indexes": [
    { "key": "graphicId_index", "type": "unique", "attributes": ["graphicId"] }
  ]
}
```

### Required Storage Buckets

#### 1. **product-mockups**
- **Purpose**: Store t-shirt mockup images
- **Permissions**: `read("any")`
- **File Size Limit**: 5MB
- **Allowed Extensions**: png, jpg, jpeg, webp

#### 2. **user-uploads**
- **Purpose**: Store user-uploaded images for customization
- **Permissions**: `read("any")`, `create("users")`, `delete("user:[USER_ID]")`
- **File Size Limit**: 10MB
- **Allowed Extensions**: png, jpg, jpeg

#### 3. **order-previews**
- **Purpose**: Store canvas snapshots of completed designs
- **Permissions**: `read("any")`, `create("users")`
- **File Size Limit**: 5MB
- **Allowed Extensions**: png

### Code Migration Guide

#### Replace Mock API Calls

**Current (Mock)**:
```javascript
const response = await MockAPI.getProducts();
```

**Replace with (Appwrite)**:
```javascript
import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('[YOUR_PROJECT_ID]');

const databases = new Databases(client);

const response = await databases.listDocuments(
    '[DATABASE_ID]',
    'products'
);
```

#### Example: Get Products
```javascript
async loadProducts() {
    try {
        const response = await databases.listDocuments(
            '[DATABASE_ID]',
            'products',
            [
                Query.limit(100),
                Query.orderAsc('name')
            ]
        );
        
        const products = response.documents.map(doc => ({
            ...doc,
            colors: JSON.parse(doc.colors),
            print_area: JSON.parse(doc.print_area)
        }));
        
        this.renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}
```

#### Example: Create Order
```javascript
async checkout() {
    try {
        const account = new Account(client);
        const user = await account.get();
        
        // Upload canvas preview
        const blob = await fetch(this.canvas.toDataURL('image/png')).then(r => r.blob());
        const file = new File([blob], `order_${Date.now()}.png`, { type: 'image/png' });
        
        const storage = new Storage(client);
        const preview = await storage.createFile(
            'order-previews',
            ID.unique(),
            file
        );
        
        // Create order document
        const orderData = {
            orderId: ID.unique(),
            userId: user.$id,
            vendorId: 'vendor_001',
            items: JSON.stringify(this.state.cart),
            totalPrice: this.state.cart.reduce((sum, item) => sum + item.totalPrice, 0),
            status: 'pending',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
        };
        
        const order = await databases.createDocument(
            '[DATABASE_ID]',
            'orders',
            ID.unique(),
            orderData
        );
        
        this.showNotification('Order placed successfully!', 'success');
        this.state.cart = [];
        this.saveCart();
        this.updateCartUI();
    } catch (error) {
        console.error('Checkout error:', error);
        this.showNotification('Checkout failed. Please try again.', 'error');
    }
}
```

#### Example: Upload User Image
```javascript
async handleImageFile(file) {
    try {
        const storage = new Storage(client);
        const uploaded = await storage.createFile(
            'user-uploads',
            ID.unique(),
            file
        );
        
        const imageUrl = storage.getFileView('user-uploads', uploaded.$id);
        this.addImageToCanvas(imageUrl);
    } catch (error) {
        console.error('Upload error:', error);
        this.showNotification('Upload failed. Please try again.', 'error');
    }
}
```

### Authentication Integration

Add user authentication before checkout:

```javascript
import { Account } from 'appwrite';

const account = new Account(client);

// Check if user is logged in
async checkAuth() {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        // Redirect to login
        window.location.href = '../login.html';
        return null;
    }
}

// Call before checkout
async checkout() {
    const user = await this.checkAuth();
    if (!user) return;
    
    // Proceed with checkout...
}
```

### Real-time Updates (Optional)

For vendor dashboard real-time order updates:

```javascript
import { Client } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('[YOUR_PROJECT_ID]');

// Subscribe to order updates
client.subscribe('databases.[DATABASE_ID].collections.orders.documents', response => {
    if (response.events.includes('databases.*.collections.*.documents.*.update')) {
        console.log('Order updated:', response.payload);
        this.refreshOrders();
    }
});
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+ (Two-column customizer)
- **Tablet**: 768px-1199px (Single column, full controls)
- **Mobile**: <768px (Stacked layout, simplified controls)

## 🎨 Design System Integration

This UI extends the AI VOGUE design system:

**Colors**:
- Dark Green: `#1d3937`
- Deep Green: `#195042`
- Gold: `#91855a`
- Beige: `#d6cabc`

**Fonts**:
- Serif: `Playfair Display`
- Sans: `Inter`

**Transitions**:
- Smooth: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Slow: `0.6s cubic-bezier(0.4, 0, 0.2, 1)`

## 🐛 Known Limitations (Mock Version)

1. **Canvas Persistence**: Canvas state not saved between sessions
2. **Image Storage**: Images loaded as data URLs, not uploaded to server
3. **Order Tracking**: Orders stored in mock array, not persistent
4. **User Auth**: No authentication, uses demo user ID
5. **Payment**: No payment gateway integration

All these will be resolved with Appwrite integration.

## 🔧 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

Part of AI VOGUE platform. All rights reserved.

## 👥 Support

For issues or questions, contact: hello@aivogue.com

---

**Built with ❤️ for AI VOGUE Creative Threads**
