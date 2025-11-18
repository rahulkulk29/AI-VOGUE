"""
Debug SDK API Key Issue
"""

import google.generativeai as genai
import os

API_KEY = "AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q"

print("="*60)
print("🔍 Debugging SDK API Key Issue")
print("="*60)

print(f"\n1. API Key: {API_KEY[:20]}...")
print(f"2. API Key Length: {len(API_KEY)}")
print(f"3. API Key Type: {type(API_KEY)}")

try:
    print(f"\n4. Configuring SDK...")
    genai.configure(api_key=API_KEY)
    print(f"   ✅ SDK configured successfully")
    
    print(f"\n5. Initializing model: gemini-2.5-flash")
    model = genai.GenerativeModel('gemini-2.5-flash')
    print(f"   ✅ Model initialized")
    
    print(f"\n6. Creating generation config...")
    generation_config = genai.GenerationConfig(
        temperature=0.7,
        top_p=0.9,
        top_k=20,
        max_output_tokens=2048
    )
    print(f"   ✅ Generation config created")
    
    print(f"\n7. Sending test request...")
    response = model.generate_content(
        "Say hello in one word",
        generation_config=generation_config
    )
    
    print(f"\n8. Response received:")
    print(f"   Type: {type(response)}")
    print(f"   Has text: {hasattr(response, 'text')}")
    
    if response and hasattr(response, 'text'):
        print(f"   ✅ Text: {response.text}")
        print(f"\n✅ SUCCESS! SDK is working!")
    else:
        print(f"   ❌ No text in response")
        print(f"   Response: {response}")
        
except Exception as e:
    print(f"\n❌ ERROR CAUGHT:")
    print(f"   Type: {type(e).__name__}")
    print(f"   Message: {str(e)}")
    print(f"   Full error: {repr(e)}")
    
    import traceback
    print(f"\n📋 Full Traceback:")
    traceback.print_exc()

print("\n" + "="*60)
