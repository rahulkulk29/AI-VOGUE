import requests
import json
import time

def test_real_urls():
    print("🔍 Testing Real URL Scraping...")
    print("-----------------------------------")
    
    url = "http://localhost:5000/api/recommend-v2"
    
    payload = {
        "userQuery": "Best vitamin C serum for glowing skin",
        "userId": "test_scraper",
        "userProfile": {
            "skinType": "combination",
            "skinConcern": "dullness",
            "skincareBudget": "moderate"
        }
    }
    
    print(f"📝 Query: '{payload['userQuery']}'")
    
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, timeout=90)
        duration = round(time.time() - start_time, 2)
        
        print(f"\n⏱️  Response Time: {duration}s")
        print(f"📡 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('product'):
                product = data['product']
                print("\n✅ PRODUCT FOUND")
                print("-----------------------------------")
                print(f"🧴 Name:   {product.get('name')}")
                print(f"🏷️  Brand:  {product.get('brand')}")
                print(f"💰 Price:  {product.get('price')}")
                print(f"🌐 Source: {product.get('source', 'Unknown')}")
                print(f"🔗 URL:    {product.get('url')}")
                print("-----------------------------------")
                
                # Verify URL
                url = product.get('url', '')
                if 'nykaa.com' in url or 'amazon.in' in url:
                    print("\n✅ URL VERIFIED: Real e-commerce link!")
                else:
                    print(f"\n⚠️  URL might be hallucinated: {url}")
                    
            else:
                print(f"\n⚠️  No product: {data.get('text')}")
        else:
            print(f"\n❌ Error: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    test_real_urls()
