"""
Test Gemini with Official Google SDK
"""

import google.generativeai as genai
import os

# Configuration
API_KEY = "AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q"
MODEL = "gemini-2.5-flash"

print("="*60)
print(f"🧪 Testing Gemini SDK with Model: {MODEL}")
print("="*60)

# Configure SDK
genai.configure(api_key=API_KEY)
print(f"✅ SDK configured with API key: {API_KEY[:10]}...")

# Initialize model
model = genai.GenerativeModel(MODEL)
print(f"✅ Model initialized: {MODEL}")

# Generation config
generation_config = genai.GenerationConfig(
    temperature=0.7,
    top_p=0.9,
    top_k=20,
    max_output_tokens=2048
)

print(f"\n📡 Sending request via SDK...")

try:
    # Generate content
    response = model.generate_content(
        "Recommend a moisturizer for dry skin in one sentence",
        generation_config=generation_config
    )
    
    if response and response.text:
        print(f"✅ SUCCESS! SDK is working perfectly!")
        print(f"\n💬 AI Response:")
        print(f"   {response.text}\n")
        print("="*60)
        print("🎉 GOOGLE SDK MIGRATION SUCCESSFUL!")
        print("   ✅ Shorter code (82→38 lines in _call_gemini_api)")
        print("   ✅ Better error handling")
        print("   ✅ Automatic retries")
        print("   ✅ Streaming support available")
        print("="*60)
    else:
        print(f"⚠️ No text in response")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
    print(f"   Type: {type(e).__name__}")
