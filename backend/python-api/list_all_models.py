"""
List ALL available models including production ones
"""

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key: {api_key[:20]}...")

genai.configure(api_key=api_key)

print("\nALL Available models:")
print("="*60)
for model in genai.list_models():
    print(f"\nModel: {model.name}")
    print(f"  Display Name: {model.display_name}")
    print(f"  Supported methods: {model.supported_generation_methods}")
    print(f"  Input token limit: {model.input_token_limit}")
    print(f"  Output token limit: {model.output_token_limit}")
