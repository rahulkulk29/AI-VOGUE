"""
Quick Test Script for Gemini API Fixes
Run this to verify the backend is working correctly
"""

import requests
import json

BACKEND_URL = "http://localhost:5000"

def test_health():
    """Test if backend is running"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is healthy!")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend!")
        print("   Make sure to run: python app.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_recommendation():
    """Test the recommendation endpoint"""
    print("\n🔍 Testing recommendation endpoint...")
    
    payload = {
        "userQuery": "Recommend me a moisturizer for oily skin under ₹1000",
        "userProfile": {
            "skinType": "oily",
            "skincareBudget": "mid",
            "ageRange": "twenties"
        }
    }
    
    try:
        print("📤 Sending request...")
        response = requests.post(
            f"{BACKEND_URL}/api/recommend",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Request successful!")
            
            if data.get('success'):
                products = data.get('data', {}).get('products', [])
                print(f"\n📦 Received {len(products)} products")
                
                if data.get('fallback'):
                    print("⚠️  WARNING: Backend returned FALLBACK data (Gemini API failed)")
                    if data.get('backendError'):
                        print(f"   Error: {data['backendError']}")
                else:
                    print("✅ Real AI recommendations (not fallback)")
                
                # Check product links
                for i, product in enumerate(products, 1):
                    link = product.get('purchaseLink', '')
                    is_valid = any(d in link for d in ['amazon.in', 'nykaa.com', 'flipkart.com', 'myntra.com'])
                    status = "✅" if is_valid else "❌"
                    print(f"\n   {status} Product {i}: {product.get('name', 'Unknown')}")
                    print(f"      Link: {link}")
                    print(f"      Price: {product.get('price', 'N/A')}")
                    
            else:
                print(f"❌ Request failed: {data.get('error')}")
        else:
            print(f"❌ HTTP Error {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout (>60 seconds)")
        print("   Backend might be processing, check terminal logs")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("=" * 60)
    print("  Gemini API Fix - Quick Test")
    print("=" * 60)
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ Backend is not running. Please start it first:")
        print("   cd e:\\Projects\\website_v5\\website_v5\\backend\\python-api")
        print("   python app.py")
        return
    
    # Test 2: Recommendation
    test_recommendation()
    
    print("\n" + "=" * 60)
    print("  Test Complete!")
    print("=" * 60)
    print("\n💡 Next steps:")
    print("1. Check backend terminal logs for detailed validation messages")
    print("2. Look for ✅ or ❌ emoji indicators in the logs")
    print("3. Test in browser: http://localhost:8000 → Prism AI")

if __name__ == "__main__":
    main()
