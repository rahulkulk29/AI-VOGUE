"""
Test new Gemini 2.5 Flash model
"""

import requests
import json

API_KEY = "AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q"
MODEL = "gemini-2.5-flash"

print("="*60)
print(f"🧪 Testing NEW Model: {MODEL}")
print("="*60)

url = f"https://generativelanguage.googleapis.com/v1/models/{MODEL}:generateContent?key={API_KEY}"

payload = {
    "contents": [{
        "parts": [{"text": "Recommend a moisturizer for dry skin in one sentence"}]
    }],
    "generationConfig": {
        "temperature": 0.7,
        "topK": 20,
        "topP": 0.9,
        "maxOutputTokens": 2048
    }
}

print(f"\n📡 Sending request to {MODEL}...")

try:
    response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
    
    print(f"📥 Response Status: {response.status_code}\n")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ SUCCESS! {MODEL} is working!")
        
        if 'candidates' in data:
            content = data['candidates'][0]['content']['parts'][0]['text']
            print(f"\n💬 AI Response:")
            print(f"   {content}\n")
            print("="*60)
            print("🎉 GEMINI API IS NOW WORKING!")
            print("   The backend will now work correctly!")
            print("="*60)
        else:
            print(f"⚠️ No candidates in response")
    else:
        error_data = response.json() if response.content else {}
        print(f"❌ Failed: {response.status_code}")
        print(json.dumps(error_data, indent=2))
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
