"""
Check environment variables
"""

import os
from dotenv import load_dotenv

print("="*60)
print("🔍 Environment Variable Check")
print("="*60)

print("\n1. Before load_dotenv():")
print(f"   GEMINI_API_KEY from env: {os.getenv('GEMINI_API_KEY', 'NOT SET')[:20] if os.getenv('GEMINI_API_KEY') else 'NOT SET'}")
print(f"   GOOGLE_API_KEY from env: {os.getenv('GOOGLE_API_KEY', 'NOT SET')[:20] if os.getenv('GOOGLE_API_KEY') else 'NOT SET'}")

print("\n2. Loading .env file...")
load_dotenv()

print("\n3. After load_dotenv():")
print(f"   GEMINI_API_KEY from env: {os.getenv('GEMINI_API_KEY', 'NOT SET')[:20] if os.getenv('GEMINI_API_KEY') else 'NOT SET'}")
print(f"   GOOGLE_API_KEY from env: {os.getenv('GOOGLE_API_KEY', 'NOT SET')[:20] if os.getenv('GOOGLE_API_KEY') else 'NOT SET'}")

print("\n4. Checking .env file existence:")
import pathlib
env_path = pathlib.Path('.env')
print(f"   .env exists: {env_path.exists()}")

if env_path.exists():
    print("\n5. .env file contents:")
    with open('.env', 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key = line.split('=')[0]
                if 'KEY' in key or 'API' in key:
                    value = line.split('=', 1)[1] if '=' in line else ''
                    print(f"   {key}={value[:20] if value else 'EMPTY'}...")

print("\n" + "="*60)
