"""
Test Gemini API with v1 endpoint and gemini-pro model
"""

import requests
import json

API_KEY = "AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q"
API_VERSION = "v1"
MODEL = "gemini-pro"

def test_v1_gemini_pro():
    print("="*60)
    print(f"🧪 Testing Gemini API: {API_VERSION} + {MODEL}")
    print("="*60)
    
    url = f"https://generativelanguage.googleapis.com/{API_VERSION}/models/{MODEL}:generateContent?key={API_KEY}"
    
    print(f"\n📍 Endpoint: {API_VERSION}")
    print(f"🤖 Model: {MODEL}")
    print(f"🔑 API Key: {API_KEY[:10]}...")
    
    payload = {
        "contents": [{
            "parts": [{"text": "Say hello in one word"}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 50
        }
    }
    
    print("\n📡 Sending test request...")
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS! Model {MODEL} works with {API_VERSION}!")
            if 'candidates' in data:
                content = data['candidates'][0]['content']['parts'][0]['text']
                print(f"💬 AI Response: {content}")
            return True
        else:
            error_data = response.json() if response.content else {}
            print(f"❌ FAILED: {response.status_code}")
            print(f"Error: {json.dumps(error_data, indent=2)}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    test_v1_gemini_pro()
