"""
Test with stable Gemini model
"""

import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"Testing Gemini API with stable model...")
print(f"API Key starts with: {api_key[:20]}")

genai.configure(api_key=api_key)

# Test with stable model
print("\n[TEST] Using gemini-1.5-flash (stable)...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = """Find 2 moisturizers for oily skin available in India under Rs 1000.
Return JSON format: {"products": [{"name": "product name", "brand": "brand", "price": "Rs 999", "url": "https://www.nykaa.com/..."}]}"""
    
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    print(f"SUCCESS: Got response")
    print(f"Response: {response.text[:300]}")
    
    data = json.loads(response.text)
    print(f"\nProducts found: {len(data.get('products', []))}")
    if data.get('products'):
        for i, p in enumerate(data['products'][:2], 1):
            print(f"{i}. {p.get('name')} - {p.get('price')}")
    
except Exception as e:
    print(f"ERROR: {str(e)[:200]}")

print("\nTest complete!")
