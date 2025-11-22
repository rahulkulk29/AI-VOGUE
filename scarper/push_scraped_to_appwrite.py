"""
Push scraped.json items to Appwrite database collection

Usage (PowerShell):
 $Env:APPWRITE_API_KEY = "your_key"; $Env:APPWRITE_PROJECT_ID = "68dd..."; $Env:APPWRITE_ENDPOINT = "https://nyc.cloud.appwrite.io/v1"; python push_scraped_to_appwrite.py

This script intentionally does not write secrets anywhere; it reads API key & project from the environment.
"""
import os
import json
import requests
import sys
from pathlib import Path

def main():
    script_dir = Path(__file__).resolve().parent
    scraped_file = script_dir / 'scraped.json'

    if not scraped_file.exists():
        print('scraped.json not found in scarper/; add or move the file and try again')
        sys.exit(1)

    with open(scraped_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    endpoint = os.getenv('APPWRITE_ENDPOINT', 'https://nyc.cloud.appwrite.io/v1')
    project_id = os.getenv('APPWRITE_PROJECT_ID', '68dd18860033ab7dffac')
    api_key = os.getenv('APPWRITE_API_KEY')
    database_id = os.getenv('APPWRITE_DATABASE_ID', '68dd21f50029362dfb7a')
    collection_id = os.getenv('APPWRITE_COLLECTION_ID', 'voguevision')

    if not api_key:
        print('APPWRITE_API_KEY environment variable is not set; please set it and try again')
        sys.exit(1)

    headers = {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': project_id,
        'X-Appwrite-Key': api_key
    }

    url = f"{endpoint}/databases/{database_id}/collections/{collection_id}/documents"

    saved = 0
    errors = []

    for item in data:
        payload = {
            'documentId': 'unique()',
            'data': {
                'productId': item.get('id'),
                'brand': item.get('brand'),
                'title': item.get('title'),
                'link': item.get('link'),
                'image': item.get('image'),
                'price': item.get('price'),
                'originalPrice': item.get('originalPrice'),
                'discount': item.get('discount'),
                'tags': item.get('tags') or [],
                'sizes': item.get('sizes') or []
            }
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=20)
        except Exception as e:
            errors.append({'id': item.get('id'), 'error': str(e)})
            print(f"Network error saving {item.get('id')}: {e}")
            continue

        if resp.status_code in (200, 201):
            saved += 1
            print(f"Saved: {item.get('id')}")
        else:
            err_text = resp.text if resp.text else resp.status_code
            errors.append({'id': item.get('id'), 'status': resp.status_code, 'body': err_text})
            print(f"Failed {item.get('id')}: {resp.status_code} - {err_text}")
            # Stop if the API key is clearly wrong or project is missing
            if resp.status_code == 401:
                print('Unauthorized (401) - Appwrite API Key may be invalid or expired')
                break

    print('---')
    print(f'Saved: {saved} documents')
    if errors:
        print('Errors:', len(errors))
        for e in errors[:10]:
            print(' ', e)

if __name__ == '__main__':
    main()
