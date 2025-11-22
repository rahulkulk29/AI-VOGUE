"""
Direct test of Gemini product recommendations
"""

import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key: {api_key[:20]}...")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

prompt = """Based on your knowledge, recommend 3 popular moisturizers for oily skin available in India under Rs 1000.

For each product, provide:
- name: Full product name
- brand: Brand name
- price: Estimated price in Rs
- url: A realistic URL to Nykaa, Amazon India, or Flipkart
- description: Brief 1-sentence description

Return ONLY valid JSON in this exact format:
{
  "products": [
    {
      "name": "Product Name",
      "brand": "Brand",
      "price": "Rs 599",
      "url": "https://www.nykaa.com/product-name/p/123456",
      "description": "Brief description"
    }
  ]
}"""

print("\nSending request to Gemini...")
try:
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    print(f"\nSUCCESS! Response received:")
    print(response.text)
    
    data = json.loads(response.text)
    print(f"\nParsed {len(data.get('products', []))} products:")
    for p in data.get('products', []):
        print(f"- {p.get('name')} ({p.get('brand')}) - {p.get('price')}")
        
except Exception as e:
    print(f"\nERROR: {str(e)}")

print("\nDone!")
