"""
Test with standard gemini-pro model
"""

import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

print("Testing gemini-pro (standard production model)...")

try:
    model = genai.GenerativeModel('gemini-pro')
    
    prompt = """Recommend 2 popular moisturizers for oily skin available in India.

Return JSON:
{
  "products": [
    {"name": "Product Name", "brand": "Brand", "price": "Rs 599", "url": "https://www.nykaa.com/example", "description": "Brief description"}
  ]
}"""
    
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.3
        )
    )
    
    print(f"\nSUCCESS!")
    print(f"Response:\n{response.text}\n")
    
except Exception as e:
    print(f"\nERROR: {str(e)[:500]}")

print("\nDone!")
