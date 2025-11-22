"""
Test gemini-1.5-pro
"""

import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
import time

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

models_to_try = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest'
]

for model_name in models_to_try:
    print(f"\nTrying {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        
        response = model.generate_content(
            "Say 'Hello' in one word",
            generation_config=genai.GenerationConfig(temperature=0.3)
        )
        
        print(f"SUCCESS with {model_name}!")
        print(f"Response: {response.text}")
        
        # If successful, test with product recommendation
        print(f"\nTesting product recommendation with {model_name}...")
        prompt = """Recommend 2 moisturizers for oily skin in India.
Return JSON: {{"products": [{{"name": "...", "brand": "...", "price": "Rs ...", "url": "https://..."}}]}}"""
        
        response2 = model.generate_content(prompt)
        print(f"Product response: {response2.text[:200]}...")
        break
        
    except Exception as e:
        print(f"Failed: {str(e)[:100]}")
        time.sleep(1)

print("\nDone!")
