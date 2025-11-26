"""
Debug scraper to see what URLs it's actually finding
"""

import sys
sys.path.insert(0, '.')

from services.product_scraper import ProductScraper
import requests

scraper = ProductScraper()

# Test product
product_name = "Minimalist 10% Vitamin B5 Gel Moisturizer"
brand = "Minimalist"

print(f"Searching for: {product_name}")
print(f"Brand: {brand}")
print("="*60)

result = scraper.find_product(product_name, brand)

if result:
    print(f"\n✅ Found product:")
    print(f"URL: {result['url']}")
    print(f"Price: {result.get('price', 'N/A')}")
    print(f"Source: {result.get('source', 'N/A')}")
    
    # Test if URL is accessible
    print(f"\n🔍 Testing URL accessibility...")
    try:
        response = requests.get(result['url'], headers=scraper.headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ URL is accessible!")
            
            # Check if it's a product page or search page
            if '/p/' in result['url']:
                print("✅ Looks like a product page URL (/p/ pattern)")
            elif '/search/' in result['url'] or '?q=' in result['url']:
                print("⚠️  This is a SEARCH page, not a product page!")
            
        else:
            print(f"❌ URL returned {response.status_code}")
    except Exception as e:
        print(f"❌ Error accessing URL: {str(e)}")
else:
    print("❌ No result found")
