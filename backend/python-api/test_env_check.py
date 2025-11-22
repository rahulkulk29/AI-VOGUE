"""
Check environment variables
"""

import os

print("="*60)
print("🔍 Environment Variable Check")
print("="*60)

print("\n1. Before load_dotenv():")
print(f"   GEMINI_API_KEY from env: {os.getenv('GEMINI_API_KEY', 'NOT SET')[:20] if os.getenv('GEMINI_API_KEY') else 'NOT SET'}")
print(f"   GOOGLE_API_KEY from env: {os.getenv('GOOGLE_API_KEY', 'NOT SET')[:20] if os.getenv('GOOGLE_API_KEY') else 'NOT SET'}")

print("\n2. Environment variables (no .env being loaded) — values come from the OS/runtime environment:")
print(f"   GEMINI_API_KEY from env: {os.getenv('GEMINI_API_KEY', 'NOT SET')[:20] if os.getenv('GEMINI_API_KEY') else 'NOT SET'}")
print(f"   GOOGLE_API_KEY from env: {os.getenv('GOOGLE_API_KEY', 'NOT SET')[:20] if os.getenv('GOOGLE_API_KEY') else 'NOT SET'}")

print('\n4. Note: No local .env file should be required. Please set environment variables in your shell or in the deployment platform (Appwrite/CI).')

print("\n" + "="*60)
