"""
Quick test script to verify Gemini API key works
Run this to test if your API key is valid
"""

import requests
import json

# Your API key
API_KEY = "AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q"

# Test with the simplest model
MODEL = "gemini-1.5-flash"

def test_gemini_api():
    print("="*60)
    print("🧪 Testing Gemini API Connection")
    print("="*60)
    
    url = f"https://generativelanguage.googleapis.com/v1/models/{MODEL}:generateContent?key={API_KEY}"
    
    print(f"\n📍 URL: {url[:80]}...")
    print(f"🔑 API Key (first 10 chars): {API_KEY[:10]}...")
    print(f"🤖 Model: {MODEL}")
    
    # Simple test prompt
    payload = {
        "contents": [{
            "role": "user",
            "parts": [{"text": "Say hello in one word"}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 50
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print("\n📡 Sending test request...")
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS! API is working!")
            print(f"\n📝 Response structure:")
            print(json.dumps(data, indent=2))
            
            if 'candidates' in data and len(data['candidates']) > 0:
                content = data['candidates'][0]['content']['parts'][0]['text']
                print(f"\n💬 AI Response: {content}")
            
            return True
            
        elif response.status_code == 400:
            error_data = response.json()
            print(f"❌ BAD REQUEST (400)")
            print(f"   Error: {error_data.get('error', {}).get('message', 'Unknown')}")
            print(f"\n📄 Full error response:")
            print(json.dumps(error_data, indent=2))
            return False
            
        elif response.status_code == 403:
            print(f"❌ FORBIDDEN (403) - API Key is invalid or doesn't have access")
            error_data = response.json() if response.content else {}
            print(f"\n📄 Full error response:")
            print(json.dumps(error_data, indent=2))
            return False
            
        elif response.status_code == 404:
            print(f"❌ NOT FOUND (404) - Model '{MODEL}' doesn't exist or isn't available")
            return False
            
        elif response.status_code == 429:
            print(f"❌ RATE LIMIT (429) - Too many requests or quota exceeded")
            error_data = response.json() if response.content else {}
            print(f"\n📄 Full error response:")
            print(json.dumps(error_data, indent=2))
            return False
            
        else:
            print(f"❌ UNEXPECTED STATUS: {response.status_code}")
            try:
                error_data = response.json()
                print(f"\n📄 Full error response:")
                print(json.dumps(error_data, indent=2))
            except:
                print(f"   Raw response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"❌ TIMEOUT - Request took longer than 10 seconds")
        return False
        
    except requests.exceptions.ConnectionError as e:
        print(f"❌ CONNECTION ERROR")
        print(f"   {str(e)}")
        print(f"   Check your internet connection")
        return False
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_gemini_api()
    
    print("\n" + "="*60)
    if success:
        print("✅ API TEST PASSED - Your Gemini API is working correctly!")
        print("   The issue might be elsewhere in the application.")
    else:
        print("❌ API TEST FAILED - Fix the API key or quota issue first.")
        print("\n💡 Common issues:")
        print("   1. API key is invalid or expired")
        print("   2. API key doesn't have Gemini API enabled")
        print("   3. Billing not enabled on Google Cloud project")
        print("   4. Free quota exhausted (15 requests/minute limit)")
        print("   5. Geographic restrictions on the API key")
    print("="*60)
