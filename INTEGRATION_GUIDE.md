# Quick Integration Guide - Database with Search Pages

This guide shows how to integrate the Appwrite database with your product pages (pants.html, shirts.html, shoes.html).

## Step 1: Update Product Pages HTML

### For pants.html

Add this inside the `<head>` section:
```html
<link rel="stylesheet" href="../css/search-products.css">
```

Add this before the closing `</body>` tag:
```html
<script src="../js/services/product-search.js"></script>
```


Add this search bar section in the page (usually near the top):
```html
<div class="search-section">
    <div class="search-container">
        <div class="search-bar-wrapper">
            <input type="text" class="search-input" id="searchInput" placeholder="Search pants, jeans, trousers...">
            <button class="search-button" onclick="handlePantsSearch()">
                <i class="fas fa-search"></i> Search
            </button>
        </div>
    </div>
</div>

<div id="products-results" class="products-results"></div>
```

Add this script at the end of the page:
```javascript
<script>
    // Load initial products from database
    async function loadInitialProducts() {
        const result = await ProductSearchService.getProductsByCategory('pants', 12);
        ProductDisplay.renderProducts(result, 'products-results');
    }
    
    // Handle search
    async function handlePantsSearch() {
        const query = document.getElementById('searchInput').value;
        if (!query.trim()) {
            alert('Please enter a search term');
            return;
        }
        
        // First try to search in database
        let result = await ProductSearchService.searchProductsInDatabase(query, 'pants', 12);
        
        // If no results in database, scrape and save
        if (!result.success || result.count === 0) {
            console.log('No products in database, scraping...');
            result = await ProductSearchService.searchProducts(query, 'pants', 12);
        }
        
        ProductDisplay.renderProducts(result, 'products-results');
    }
    
    // Load products on page load
    window.addEventListener('DOMContentLoaded', loadInitialProducts);
</script>
```

### For shirts.html - Same pattern

```html
<script>
    async function loadInitialProducts() {
        const result = await ProductSearchService.getProductsByCategory('shirts', 12);
        ProductDisplay.renderProducts(result, 'products-results');
    }
    
    async function handleShirtsSearch() {
        const query = document.getElementById('searchInput').value;
        if (!query.trim()) {
            alert('Please enter a search term');
            return;
        }
        
        let result = await ProductSearchService.searchProductsInDatabase(query, 'shirts', 12);
        
        if (!result.success || result.count === 0) {
            console.log('No products in database, scraping...');
            result = await ProductSearchService.searchProducts(query, 'shirts', 12);
        }
        
        ProductDisplay.renderProducts(result, 'products-results');
    }
    
    window.addEventListener('DOMContentLoaded', loadInitialProducts);
</script>
```

### For shoes.html - Same pattern

```html
<script>
    async function loadInitialProducts() {
        const result = await ProductSearchService.getProductsByCategory('shoes', 12);
        ProductDisplay.renderProducts(result, 'products-results');
    }
    
    async function handleShoesSearch() {
        const query = document.getElementById('searchInput').value;
        if (!query.trim()) {
            alert('Please enter a search term');
            return;
        }
        
        let result = await ProductSearchService.searchProductsInDatabase(query, 'shoes', 12);
        
        if (!result.success || result.count === 0) {
            console.log('No products in database, scraping...');
            result = await ProductSearchService.searchProducts(query, 'shoes', 12);
        }
        
        ProductDisplay.renderProducts(result, 'products-results');
    }
    
    window.addEventListener('DOMContentLoaded', loadInitialProducts);
</script>
```

## Step 2: Update Backend Configuration

### Add API Key to Environment (no `.env` file needed)

Provide the `APPWRITE_API_KEY` to your runtime environment — set it in your shell, Docker, or Appwrite Function environment. Example (PowerShell):

```powershell
$Env:APPWRITE_API_KEY = "your_appwrite_api_key_here"
```

### Get Your Appwrite API Key

1. Go to https://cloud.appwrite.io/console/
2. Log in to your project
3. Go to Settings → API Keys
4. Click "Create API Key"
5. Name it "Python Backend"
6. Check these scopes:
   - ✅ databases.read
   - ✅ databases.write
   - ✅ collections.read
   - ✅ documents.read
   - ✅ documents.write
   - ✅ documents.delete
7. Copy the key and set it as an environment variable in your runtime or Appwrite Function settings (do not store it in a committed `.env` file). Example (PowerShell):

```powershell
$Env:APPWRITE_API_KEY = "your_appwrite_api_key_here"
```

### Update appwrite_service.py

Update the `AppwriteService.__init__()` method to read from the runtime environment (no `.env` file needed):

```python
import os

class AppwriteService:
    def __init__(self):
        self.endpoint = "https://nyc.cloud.appwrite.io/v1"
        self.project_id = "68dd18860033ab7dffac"
        self.database_id = "68dd21f50029362dfb7a"
        self.collection_id = "voguevision"
    self.api_key = os.getenv('APPWRITE_API_KEY', 'YOUR_APPWRITE_API_KEY')
        
        if self.api_key == 'YOUR_APPWRITE_API_KEY':
            raise ValueError("APPWRITE_API_KEY not set in environment variables")
```

## Step 3: Start Services

### Terminal 1: Start Backend

```bash
cd backend/python-api
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Terminal 2: Start Frontend

```bash
cd frontend
python -m http.server 8000
```

Expected output:
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)
```

## Step 4: Populate Database with Sample Data

Open browser console and run:

```javascript
// Scrape and save 12 pants samples
await ProductSearchService.searchProducts('jeans', 'pants', 12);

// Scrape and save 12 shirts samples  
await ProductSearchService.searchProducts('casual shirts', 'shirts', 12);

// Scrape and save 12 shoes samples
await ProductSearchService.searchProducts('formal shoes', 'shoes', 12);
```

Or use curl from terminal:

```bash
# Save pants
curl -X POST http://localhost:5000/api/scrape/search \
  -H "Content-Type: application/json" \
  -d '{"query":"mens jeans","category":"pants","limit":12}'

# Save shirts
curl -X POST http://localhost:5000/api/scrape/search \
  -H "Content-Type: application/json" \
  -d '{"query":"casual shirts","category":"shirts","limit":12}'

# Save shoes
curl -X POST http://localhost:5000/api/scrape/search \
  -H "Content-Type: application/json" \
  -d '{"query":"formal shoes","category":"shoes","limit":12}'
```

## Step 5: Verify Integration

### Check Backend Health

```bash
curl http://localhost:5000/health
```

Response should show: `"status": "healthy"`

### Check Database Endpoints

```bash
# Get all pants from database
curl "http://localhost:5000/api/products/category?category=pants"

# Get all products
curl "http://localhost:5000/api/products/all?limit=50"

# Search in database
curl -X POST http://localhost:5000/api/products/search \
  -H "Content-Type: application/json" \
  -d '{"query":"jeans","category":"pants"}'
```

### Test Frontend

1. Open http://localhost:8000/public/pants.html
2. You should see:
   - Search bar at the top
   - Grid of pants products loaded from database
   - Search functionality working

## Workflow

### Loading Products (on page load)

```
1. pants.html loads
2. JavaScript runs: loadInitialProducts()
3. Calls: ProductSearchService.getProductsByCategory('pants', 12)
4. Fetches from: /api/products/category?category=pants
5. Backend retrieves from Appwrite DB
6. Products displayed via ProductDisplay.renderProducts()
```

### Searching Products

```
1. User types search term and clicks Search
2. JavaScript runs: handlePantsSearch()
3. First tries: ProductSearchService.searchProductsInDatabase(query, 'pants')
4. If no results: ProductSearchService.searchProducts(query, 'pants')
   - This scrapes Flipkart & Amazon
   - Saves results to DB
   - Returns results
5. Products displayed
```

## Directory Structure After Setup

```
frontend/
├── public/
│   ├── pants.html          ✅ Updated with search integration
│   ├── shirts.html         ✅ Updated with search integration
│   ├── shoes.html          ✅ Updated with search integration
│   └── ...
├── js/
│   ├── appwrite-config.js  ✅ Updated with VogueVisionService
│   └── services/
│       └── product-search.js  ✅ Updated with DB methods
├── css/
│   ├── search-products.css ✅ Already configured
│   └── ...
└── ...

backend/python-api/
├── app.py                  ✅ Updated with DB endpoints
├── requirements.txt        ✅ Updated with beautifulsoup4
├── env_template.txt        ✅ Template (do not add secrets here)
└── services/
    ├── scraper_service.py
    ├── appwrite_service.py ✅ NEW - Database service
    └── ...
```

## Troubleshooting

### Issue: "API Key not configured"
Ensure `APPWRITE_API_KEY` and other environment variables are set in your runtime (PowerShell/Bash/hosting platform) and that the backend can access them.
Example PowerShell: `$Env:APPWRITE_API_KEY = "your_appwrite_api_key_here"`

### Issue: "Products not displaying"
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check that database has products: `curl http://localhost:5000/api/products/all`

### Issue: "Scraping not working"
1. Check internet connection
2. Verify Flipkart/Amazon are accessible
3. Check network tab for blocked requests
4. Try: `curl http://localhost:5000/health` to verify backend is up

### Issue: "Search is too slow"
1. Database queries are faster than scraping
2. If first database search is slow, it's building indexes
3. Subsequent searches should be faster

## Sample Test Cases

### Test 1: Load pants page
```
1. Open http://localhost:8000/public/pants.html
2. Should see 12 pants products from database
3. Should see search bar at top
```

### Test 2: Search within database
```
1. On pants page, search for "blue"
2. Should show only blue pants from database
3. No network delay (uses cached DB)
```

### Test 3: Search not in database (scrape and save)
```
1. On pants page, search for "cargo"
2. If not in DB, will scrape Flipkart & Amazon
3. Should see cargo pants from both platforms
4. Results saved to DB for future searches
```

### Test 4: Cross-page consistency
```
1. Search on pants.html
2. Go to shirts.html
3. Shirt search should work independently
4. Different category isolation maintained
```

## Next Steps

1. ✅ Update pants.html with integration code
2. ✅ Update shirts.html with integration code
3. ✅ Update shoes.html with integration code
4. ✅ Add search functionality to all pages
5. ✅ Populate database with sample products
6. ✅ Test all workflows
7. TODO: Implement 3D Try-On feature for "Try Now" button
8. TODO: Add product filtering (price, brand, rating)
9. TODO: Add pagination for large result sets
10. TODO: Add user reviews and ratings

---

**Status**: Ready for HTML Integration
**Last Updated**: November 18, 2025
