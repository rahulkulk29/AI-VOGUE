"""
Simple Gemini API Test
"""

import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"Testing Gemini API...")
print(f"API Key starts with: {api_key[:20]}")

genai.configure(api_key=api_key)

# Test simple generation
print("\n[TEST 1] Simple generation...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content("Say hello")
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"ERROR: {str(e)}")

# Test with Google Search
print("\n[TEST 2] Google Search grounding...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = """Find 2 moisturizers for oily skin in India under Rs 1000.
Return JSON: {"products": [{"name": "...", "brand": "...", "price": "Rs ..."}]}"""
    
    response = model.generate_content(
        prompt,
        tools='google_search_retrieval',
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    print(f"SUCCESS: Got response")
    print(f"Length: {len(response.text)} characters")
    print(f"First 200 chars: {response.text[:200]}")
    
    data = json.loads(response.text)
    print(f"Products found: {len(data.get('products', []))}")
    
except Exception as e:
    print(f"ERROR: {str(e)}")

print("\nTest complete!")
