import requests
import json
import time

def test_prism_ai():
    print("🚀 Starting Prism AI System Test...")
    print("-----------------------------------")
    
    url = "http://localhost:5000/api/recommend-v2"
    
    # Test Case: Sensitive Skin Sunscreen
    payload = {
        "userQuery": "Best sunscreen for sensitive skin",
        "userId": "test_user_final",
        "userProfile": {
            "skinType": "sensitive",
            "skinConcern": "redness",
            "skincareBudget": "high"
        }
    }
    
    print(f"📝 Sending Query: '{payload['userQuery']}'")
    print(f"👤 User Profile: {payload['userProfile']}")
    
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, timeout=60)
        duration = round(time.time() - start_time, 2)
        
        print(f"\n⏱️  Response Time: {duration}s")
        print(f"📡 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                product = data.get('product')
                if product:
                    print("\n✅ SUCCESS: Product Found!")
                    print("-----------------------------------")
                    print(f"🧴 Name:  {product.get('name')}")
                    print(f"🏷️  Brand: {product.get('brand')}")
                    print(f"💰 Price: {product.get('price')}")
                    print(f"🔗 URL:   {product.get('url')}")
                    print(f"📝 Desc:  {product.get('description')}")
                    print(f"🤖 AI Rec: {data.get('text')}")
                    print("-----------------------------------")
                    
                    # Check alternatives
                    alts = data.get('alternatives', [])
                    print(f"\n➕ Found {len(alts)} alternatives")
                    for alt in alts:
                        print(f"   - {alt.get('name')} ({alt.get('brand')})")
                else:
                    print("\n⚠️  Response received but NO product returned.")
                    print(f"Message: {data.get('text')}")
            else:
                print("\n❌ API returned success=False")
                print(f"Error: {data.get('error')}")
        else:
            print(f"\n❌ HTTP Error: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Connection Error: {str(e)}")

if __name__ == "__main__":
    test_prism_ai()
