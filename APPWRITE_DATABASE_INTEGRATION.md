# Appwrite Database Integration - Complete Setup

## Overview

The Appwrite database integration has been successfully configured for the Vogue Vision product scraper. Products are now automatically saved to the `voguevision` collection when they are scraped from Flipkart and Amazon.

## Database Structure

### Collection: `voguevision`

**Fields**:
- `name` (String) - Product name
- `price` (Float) - Product price in INR
- `image_url` (String) - Product image URL
- `product_link` (String) - Direct link to product on Flipkart/Amazon
- `discount` (String) - Discount percentage (e.g., "40% off")
- `brand` (String) - Product brand
- `platform` (String) - Source platform ("flipkart" or "amazon")
- `category` (String) - Product category ("pants", "shirts", "shoes")
- `searchQuery` (String) - The search term used to find this product
- `addedAt` (DateTime) - Timestamp when product was saved

### Sample Data Structure

```json
{
  "name": "Men's Blue Denim Jeans",
  "price": 1299.00,
  "image_url": "https://example.com/image.jpg",
  "product_link": "https://flipkart.com/p/...",
  "discount": "40% off",
  "brand": "Lee",
  "platform": "flipkart",
  "category": "pants",
  "searchQuery": "men jeans",
  "addedAt": "2025-11-18T10:30:00Z"
}
```

## Backend Services

### 1. Appwrite Service (`services/appwrite_service.py`)

Handles all database operations:

```python
# Save single product
appwrite_service.save_product(product_data)

# Save multiple products
appwrite_service.save_products(products, category, search_query)

# Retrieve by category
appwrite_service.get_products_by_category('pants', limit=12)

# Search products
appwrite_service.search_products('jeans', 'pants', limit=12)

# Get all products
appwrite_service.get_all_products(limit=100)

# Delete old products (cleanup)
appwrite_service.delete_old_products(hours_old=24)
```

### 2. Flask API Endpoints

#### Scraper Endpoints (with Database Save)

**POST/GET `/api/scrape/search`**
- Scrapes both Flipkart and Amazon
- Automatically saves results to database
- Parameters: `query`, `category`, `limit`
- Response includes: `saved_to_db: true`, `saved_count: int`

Example:
```bash
curl "http://localhost:5000/api/scrape/search?query=men+jeans&category=pants&limit=12"
```

#### Database Retrieval Endpoints (No Scraping)

**GET/POST `/api/products/category`**
- Get products from database by category
- Parameters: `category`, `limit`

Example:
```bash
curl "http://localhost:5000/api/products/category?category=pants&limit=12"
```

**GET/POST `/api/products/search`**
- Search products in database
- Parameters: `query`, `category`, `limit`

Example:
```bash
curl "http://localhost:5000/api/products/search?query=blue+jeans&category=pants"
```

**GET `/api/products/all`**
- Get all products from database
- Parameters: `limit`

Example:
```bash
curl "http://localhost:5000/api/products/all?limit=50"
```

## Frontend Service (`frontend/js/appwrite-config.js`)

### VogueVisionService Class

```javascript
// Save products from backend
vogueVisionService.saveProducts(products, category, searchQuery)

// Get products by category
vogueVisionService.getProductsByCategory('pants', limit=12)

// Search products
vogueVisionService.searchProducts('jeans', 'pants', limit=12)

// Get all products
vogueVisionService.getAllProducts(limit=100)

// Get products by platform
vogueVisionService.getProductsByPlatform('flipkart', 'pants', limit=12)

// Delete old products (cleanup)
vogueVisionService.deleteOldProducts(hoursOld=24)
```

## Setup Instructions

### 1. Environment Configuration (no `.env` file)

Set the Appwrite keys and IDs as environment variables in your runtime environment (PowerShell, Bash, hosting platform, or Appwrite Function settings). Example (PowerShell):

```powershell
$Env:APPWRITE_API_KEY = "YOUR_API_KEY_HERE"
$Env:APPWRITE_ENDPOINT = "https://nyc.cloud.appwrite.io/v1"
$Env:APPWRITE_PROJECT_ID = "68dd18860033ab7dffac"
$Env:APPWRITE_DATABASE_ID = "68dd21f50029362dfb7a"
$Env:APPWRITE_COLLECTION_ID = "voguevision"
```

**To get your API Key:**
1. Go to https://cloud.appwrite.io/console/
2. Navigate to Settings → API Keys
3. Create a new API Key with these scopes:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `documents.read`
   - `documents.write`
   - `documents.delete`

### 2. Update Appwrite Service

Update `backend/python-api/services/appwrite_service.py`:

```python
import os

class AppwriteService:
   def __init__(self):
      self.api_key = os.getenv('APPWRITE_API_KEY')
```

### 3. Install Dependencies

```bash
pip install appwrite requests
```

## Usage Examples

### Example 1: Scrape and Save Products

```bash
# Search and save products from both Flipkart and Amazon
curl -X POST http://localhost:5000/api/scrape/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "men jeans",
    "category": "pants",
    "limit": 12
  }'

# Response:
{
  "success": true,
  "query": "men jeans",
  "category": "pants",
  "flipkart": [...],
  "amazon": [...],
  "total_count": 24,
  "saved_to_db": true,
  "saved_count": 24,
  "timestamp": "2025-11-18T10:30:00"
}
```

### Example 2: Retrieve from Database

```bash
# Get pants from database
curl "http://localhost:5000/api/products/category?category=pants&limit=12"

# Response:
{
  "success": true,
  "category": "pants",
  "products": [
    {
      "$id": "...",
      "name": "Blue Jeans",
      "price": 1299,
      "image_url": "...",
      "product_link": "...",
      ...
    }
  ],
  "count": 12,
  "source": "database"
}
```

### Example 3: Frontend Integration

```javascript
// Get products from database
const products = await vogueVisionService.getProductsByCategory('pants', 12);

// Display products
products.forEach(product => {
  console.log(`${product.name} - ₹${product.price}`);
});

// Or search database
const results = await vogueVisionService.searchProducts('jeans', 'pants', 12);
```

## Data Flow

```
1. User searches on pants.html/shirts.html/shoes.html
   ↓
2. Frontend calls ProductSearchService.searchProducts()
   ↓
3. Backend /api/scrape/search endpoint is called
   ↓
4. Scraper fetches from Flipkart and Amazon
   ↓
5. Backend saves products to Appwrite database via AppwriteService
   ↓
6. Response returned to frontend with saved_count
   ↓
7. Frontend displays products from response
```

OR for displaying cached products:

```
1. Page loads (pants.html, etc.)
   ↓
2. Frontend calls vogueVisionService.getProductsByCategory('pants')
   ↓
3. Frontend fetches from /api/products/category endpoint
   ↓
4. Backend retrieves from Appwrite database
   ↓
5. Products displayed immediately without scraping
```

## Sample Data (6 Samples)

Here are 6 sample products that should be in your database:

### Pants
1. **Blue Denim Jeans**
   - Price: ₹1,299
   - Brand: Lee
   - Platform: Flipkart
   - Image: [Jeans image]

2. **Casual Cotton Trousers**
   - Price: ₹899
   - Brand: Van Heusen
   - Platform: Amazon
   - Image: [Trousers image]

3. **Formal Black Pants**
   - Price: ₹1,599
   - Brand: Arrow
   - Platform: Flipkart
   - Image: [Formal pants]

### Shirts
4. **White Cotton Shirt**
   - Price: ₹699
   - Brand: Raymonds
   - Platform: Amazon
   - Image: [White shirt]

5. **Blue Casual Shirt**
   - Price: ₹549
   - Brand: Wrangler
   - Platform: Flipkart
   - Image: [Blue shirt]

### Shoes
6. **Black Formal Shoes**
   - Price: ₹2,499
   - Brand: Bata
   - Platform: Amazon
   - Image: [Black shoes]

## Troubleshooting

### Issue: "API Key not configured"
**Solution**: Add API key to environment variables or `.env` file

### Issue: "Collection not found"
**Solution**: Ensure collection ID matches your Appwrite console: `voguevision`

### Issue: "Products not saving"
**Solution**: Check API key permissions include `documents.write`

### Issue: "Slow queries"
**Solution**: Add indexes to frequently searched fields (name, category, platform)

## Database Maintenance

### Regular Cleanup (Delete old products)

```python
# Delete products older than 24 hours
appwrite_service.delete_old_products(hours_old=24)

# Schedule this via a cron job or background task
```

### Add Indexes for Performance

In Appwrite console, add indexes to:
- `category` (for category queries)
- `platform` (for platform filtering)
- `searchQuery` (for search history)
- `addedAt` (for sorting)

## Next Steps

1. ✅ Appwrite service created and integrated
2. ✅ Backend API endpoints created (scrape + retrieve)
3. ✅ Frontend service created (VogueVisionService)
4. TODO: Integrate display pages (pants.html, shirts.html, shoes.html)
5. TODO: Add pagination for large result sets
6. TODO: Implement product filtering (price, brand, discount)
7. TODO: Add user ratings and reviews to database

## Security Considerations

- API keys are stored in environment variables (not in code)
- Database queries are parameterized (no SQL injection risk)
- CORS is configured for authorized origins only
- Rate limiting prevents abuse
- Old products are auto-deleted to save storage

---

**Status**: ✅ Complete and Ready for Integration
**Last Updated**: November 18, 2025
