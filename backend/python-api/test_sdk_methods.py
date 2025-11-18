"""
Test different SDK configuration methods
"""

import google.generativeai as genai
import os

API_KEY = "AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q"

print("="*60)
print("🔍 Testing Different SDK Configuration Methods")
print("="*60)

# Method 1: Global configure (what we're currently using)
print("\n1️⃣ Method 1: Global genai.configure()")
try:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Say hello")
    print(f"   ✅ SUCCESS: {response.text}")
except Exception as e:
    print(f"   ❌ FAILED: {str(e)[:100]}")

# Method 2: Using environment variable
print("\n2️⃣ Method 2: Environment variable GOOGLE_API_KEY")
try:
    os.environ['GOOGLE_API_KEY'] = API_KEY
    genai.configure()  # Should auto-detect from env
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Say hello")
    print(f"   ✅ SUCCESS: {response.text}")
except Exception as e:
    print(f"   ❌ FAILED: {str(e)[:100]}")

# Method 3: Check if there's a way to pass key to model
print("\n3️⃣ Method 3: Check GenerativeModel parameters")
import inspect
sig = inspect.signature(genai.GenerativeModel.__init__)
print(f"   GenerativeModel params: {sig}")

# Method 4: List all configuration options
print("\n4️⃣ Method 4: Check current SDK configuration")
try:
    # Try to access internal config
    print(f"   Checking SDK internals...")
    print(f"   genai module attributes: {[attr for attr in dir(genai) if not attr.startswith('_')][:20]}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "="*60)
