"""
Verify Amazon.in product links
"""

import requests

# Products from our database
products_to_verify = [
    {"name": "Cetaphil Moisturizing Cream", "link": "https://www.amazon.in/dp/B003MJG19K"},
    {"name": "Minimalist Sepicalm Moisturizer", "link": "https://www.amazon.in/dp/B08T6X916Q"},
    {"name": "Plum Hello Aloe Gel", "link": "https://www.amazon.in/dp/B076PWFVB1"},
    {"name": "Neutrogena Hydro Boost", "link": "https://www.amazon.in/dp/B016167N6A"},
    {"name": "Simple Hydrating Moisturiser", "link": "https://www.amazon.in/dp/B00CRHP9D6"},
    {"name": "Cetaphil Gentle Cleanser", "link": "https://www.amazon.in/dp/B07PYZFMMX"},
]

print("="*60)
print("🔍 Verifying Amazon.in Product Links")
print("="*60)

for product in products_to_verify:
    print(f"\n📦 {product['name']}")
    print(f"   Link: {product['link']}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(product['link'], headers=headers, timeout=5, allow_redirects=True)
        
        if response.status_code == 200:
            # Check if we got redirected to homepage (invalid product)
            if 'amazon.in' in response.url and '/dp/' in response.url:
                print(f"   ✅ VALID - Product page loads")
            else:
                print(f"   ❌ INVALID - Redirected to: {response.url[:50]}")
        elif response.status_code == 404:
            print(f"   ❌ INVALID - 404 Not Found")
        else:
            print(f"   ⚠️  Status: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Error: {str(e)[:50]}")

print("\n" + "="*60)
print("⚠️  NOTE: Some links may need to be updated with current ASINs")
print("="*60)
