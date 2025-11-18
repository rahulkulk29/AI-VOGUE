"""
Test Backend Request to see exact error
"""

import requests
import json

print("="*60)
print("🧪 Testing Backend /api/recommend endpoint")
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

try:
    response = requests.post(url, json=payload, timeout=30)
    
    print(f"\n📥 Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Response received:")
        print(json.dumps(data, indent=2))
        
        if data.get('success'):
            print(f"\n✅ SUCCESS! Backend is working!")
        else:
            print(f"\n❌ FAILED! Backend returned error:")
            print(f"   Error: {data.get('error')}")
            print(f"   Details: {data.get('details')}")
            if 'errors' in data:
                print(f"   Model Errors:")
                for err in data['errors']:
                    print(f"      - {err['model']}: {err['error']}")
    else:
        print(f"❌ HTTP Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"\n❌ Exception: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
