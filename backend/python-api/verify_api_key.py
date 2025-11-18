"""
Verify API Key with direct REST API call
"""

import requests
import json

API_KEY = "AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q"

print("="*60)
print("🔍 Verifying API Key with REST API")
print("="*60)

# Try with v1 endpoint (current)
url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={API_KEY}"

payload = {
    "contents": [{
        "parts": [{"text": "Say hello in one word"}]
    }]
}

print(f"\n📡 Testing with v1 endpoint...")
print(f"URL: {url[:80]}...")
print(f"API Key: {API_KEY[:20]}...")

try:
    response = requests.post(url, json=payload, timeout=10)
    
    print(f"\n📥 Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if 'candidates' in data:
            text = data['candidates'][0]['content']['parts'][0]['text']
            print(f"✅ API KEY IS VALID!")
            print(f"Response: {text}")
        else:
            print(f"⚠️ Unexpected response format")
            print(json.dumps(data, indent=2))
    else:
        print(f"❌ API KEY IS INVALID OR HAS ISSUES!")
        error_data = response.json() if response.content else {}
        print(json.dumps(error_data, indent=2))
        
        if response.status_code == 400:
            print(f"\n🔍 Error Analysis:")
            error_msg = error_data.get('error', {}).get('message', '')
            if 'API Key not found' in error_msg or 'API_KEY_INVALID' in str(error_data):
                print(f"   ❌ API key is invalid or expired")
                print(f"   💡 Solution: Generate a new API key at https://makersuite.google.com/app/apikey")
            elif 'quota' in error_msg.lower():
                print(f"   ❌ API quota exceeded")
            elif 'billing' in error_msg.lower():
                print(f"   ❌ Billing not enabled")
        
except Exception as e:
    print(f"❌ Request failed: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
