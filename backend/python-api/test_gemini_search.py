"""
Test Gemini Search with Google Search Grounding
"""

import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key: {api_key[:20]}...")

genai.configure(api_key=api_key)

# Test 1: Simple generation
print("\n" + "="*60)
print("Test 1: Simple Text Generation")
print("="*60)

try:
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content("Say hello in one word")
    print(f"✅ Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Google Search Grounding
print("\n" + "="*60)
print("Test 2: Google Search Grounding")
print("="*60)

try:
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = """
    Search for the top 3 moisturizers for oily skin available in India under ₹1000.
    
    For each product, provide:
    1. Product name
    2. Brand
    3. Estimated price in INR
    4. Where to buy (Nykaa, Amazon India, or Flipkart)
    
    Return as JSON in this format:
    {
      "products": [
        {
          "name": "Product Name",
          "brand": "Brand",
          "price": "₹999",
          "url": "https://www.nykaa.com/..."
        }
      ]
    }
    """
    
    # Try with Google Search grounding
    response = model.generate_content(
        prompt,
        tools='google_search_retrieval',
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    print(f"✅ Response received!")
    print(f"Response text:\n{response.text[:500]}...")
    
    # Try to parse JSON
    try:
        data = json.loads(response.text)
        print(f"\n✅ JSON parsed successfully!")
        print(f"Number of products: {len(data.get('products', []))}")
        if data.get('products'):
            print(f"First product: {data['products'][0].get('name')}")
    except json.JSONDecodeError as e:
        print(f"⚠️ JSON parse error: {e}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
print("Test Complete")
print("="*60)
