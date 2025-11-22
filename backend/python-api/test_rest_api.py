"""
Direct test of new REST API Gemini service
"""

import sys
sys.path.insert(0, '.')

from services.gemini_search_service import GeminiSearchService
from dotenv import load_dotenv

load_dotenv()

print("Testing Gemini REST API Service...")
print("="*60)

try:
    service = GeminiSearchService()
    print("✅ Service initialized\n")
    
    # Test search
    print("Testing product search...")
    user_prefs = {
        'skinType': 'oily',
        'skinConcern': 'acne',
        'skincareBudget': 'moderate'
    }
    
    products = service.search_products(
        query="Recommend moisturizer for oily skin",
        user_preferences=user_prefs,
        category='skincare',
        limit=3
    )
    
    print(f"\nResults: {len(products)} products found")
    
    if products:
        print("\nProducts:")
        for i, p in enumerate(products, 1):
            print(f"{i}. {p.get('name')} - {p.get('price')}")
            print(f"   Brand: {p.get('brand')}")
            print(f"   URL: {p.get('url', 'N/A')[:50]}...")
            print()
    else:
        print("No products returned")
        
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()

print("\nDone!")
