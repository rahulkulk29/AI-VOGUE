"""
Test GeminiService directly (not through Flask)
"""

import sys
import logging

# Setup logging to see everything
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:%(name)s:%(message)s'
)

from services.gemini_service import GeminiService

print("="*60)
print("🧪 Testing GeminiService Directly")
print("="*60)

try:
    # Initialize service
    print("\n1. Initializing GeminiService...")
    service = GeminiService()
    print(f"   ✅ Service initialized")
    print(f"   API Key: {service.api_key[:20]}...")
    print(f"   Models: {service.model_fallbacks}")
    
    # Test get_recommendations
    print("\n2. Calling get_recommendations...")
    result = service.get_recommendations(
        user_query="recommend a moisturizer for dry skin",
        user_profile={
            "skinType": "dry",
            "hairType": "straight",
            "stylePreference": "casual"
        }
    )
    
    print("\n3. Result:")
    print(f"   Success: {result.get('success')}")
    
    if result.get('success'):
        print(f"   ✅ GOT REAL AI RESPONSE!")
        print(f"   Model used: {result.get('model_used')}")
        data = result.get('data', '')
        print(f"   Response length: {len(data)} characters")
        print(f"   Preview: {data[:200]}...")
    else:
        print(f"   ❌ FAILED!")
        print(f"   Error: {result.get('error')}")
        print(f"   Details: {result.get('details')}")
        if 'errors' in result:
            print(f"   Model Errors:")
            for err in result['errors']:
                print(f"      - {err['model']}: {err['error']}")
    
except Exception as e:
    print(f"\n❌ Exception: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
