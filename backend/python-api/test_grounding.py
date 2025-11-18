"""
Test Gemini with Google Search Grounding (longer timeout)
"""

import requests
import json

print("="*60)
print("🔍 Testing Gemini with Google Search Grounding")
print("="*60)

url = "http://localhost:5000/api/recommend"

payload = {
    "userQuery": "recommend a moisturizer for dry skin",
    "userProfile": {
        "skinType": "dry",
        "hairType": "straight",
        "stylePreference": "casual"
    }
}

print(f"\n📡 Sending POST request to: {url}")
print(f"📦 Payload: {json.dumps(payload, indent=2)}")
print(f"⏱️  Timeout: 90 seconds (AI needs time to search web)")

try:
    response = requests.post(url, json=payload, timeout=90)
    
    print(f"\n📥 Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Response received!")
        
        if data.get('success') and not data.get('fallback'):
            print(f"\n🎉 SUCCESS! Google Search Grounding is working!")
            print(f"\nProcessing Time: {data.get('processingTime', 'N/A')}")
            
            products = data.get('data', {}).get('products', [])
            print(f"\nProducts Found: {len(products)}")
            
            for i, product in enumerate(products, 1):
                print(f"\n{i}. {product.get('name')} - {product.get('brand')}")
                print(f"   Price: {product.get('price')}")
                print(f"   Link: {product.get('purchaseLink')}")
                print(f"   Compatibility: {product.get('compatibility')}%")
        else:
            print(f"\n⚠️  Fallback response (AI failed)")
            print(f"Error: {data.get('backendError')}")
            if 'modelErrors' in data:
                print(f"\nModel Errors:")
                for err in data['modelErrors']:
                    print(f"  - {err['model']}: {err['error'][:100]}")
    else:
        print(f"❌ HTTP Error: {response.status_code}")
        print(response.text)
        
except requests.exceptions.Timeout:
    print(f"\n❌ Request timed out after 90 seconds")
    print(f"   This means Google Search is taking too long")
    print(f"   The AI might be doing extensive web searches")
    
except Exception as e:
    print(f"\n❌ Exception: {str(e)}")

print("\n" + "="*60)
