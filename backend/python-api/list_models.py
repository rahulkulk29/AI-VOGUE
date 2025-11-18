"""
List available Gemini models
"""

import requests
import json

API_KEY = "AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q"

def list_models():
    print("="*60)
    print("📋 Listing Available Gemini Models")
    print("="*60)
    
    url = f"https://generativelanguage.googleapis.com/v1/models?key={API_KEY}"
    
    print(f"\n📡 Fetching model list...")
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', [])
            
            print(f"\n✅ Found {len(models)} models:\n")
            
            for model in models:
                name = model.get('name', '').replace('models/', '')
                display_name = model.get('displayName', '')
                supported_methods = model.get('supportedGenerationMethods', [])
                
                if 'generateContent' in supported_methods:
                    print(f"✓ {name}")
                    print(f"  Display Name: {display_name}")
                    print(f"  Methods: {', '.join(supported_methods)}")
                    print()
            
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    list_models()
