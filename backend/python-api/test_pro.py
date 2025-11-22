"""
Test gemini-2.5-pro-preview model
"""

import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.5-pro-preview-03-25')

prompt = """Recommend 3 popular moisturizers for oily skin available in India.

Return JSON:
{
  "products": [
    {"name": "Product Name", "brand": "Brand", "price": "Rs 599", "url": "https://www.nykaa.com/example", "description": "Brief description"}
  ]
}"""

print("Testing gemini-2.5-pro-preview...")
try:
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    print(f"SUCCESS!")
    print(f"Response:\n{response.text}\n")
    
    data = json.loads(response.text)
    print(f"Products: {len(data.get('products', []))}")
    for p in data.get('products', []):
        print(f"- {p.get('name')}")
        
except Exception as e:
    print(f"ERROR: {str(e)[:300]}")
