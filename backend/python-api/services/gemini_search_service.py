"""
Gemini Service with Product Database Matching
Uses curated database for reliable product URLs
"""

import requests
import os
import json
import logging
from sentence_transformers import SentenceTransformer
import numpy as np

logger = logging.getLogger(__name__)

class GeminiSearchService:
    def __init__(self):
        """Initialize Gemini REST API with product database"""
        self.api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY must be set")
        
        # Use REST API endpoint
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model_name = "gemini-2.5-flash"
        
        # Load product database
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'products_database.json')
        if not os.path.exists(db_path):
            logger.error(f"Product database not found at: {db_path}")
            raise FileNotFoundError(f"Product database not found: {db_path}")
            
        with open(db_path, 'r', encoding='utf-8') as f:
            self.products_db = json.load(f)
        
        logger.info(f"✅ Loaded {self._count_products()} products from database")
        
        # Initialize semantic matching model
        self.matcher = SentenceTransformer('all-MiniLM-L6-v2')
        
        logger.info(f"✅ Gemini service initialized with product database")
    
    def _count_products(self):
        """Count total products in database"""
        count = 0
        for cat_data in self.products_db.values():
            if isinstance(cat_data, dict):
                for subcat in cat_data.values():
                    if isinstance(subcat, list):
                        count += len(subcat)
            elif isinstance(cat_data, list):
                count += len(cat_data)
        return count
    
    def search_products(self, query, user_preferences, category='skincare', limit=5):
        """
        Search for products using Gemini + database matching
        """
        try:
            # Step 1: Get AI recommendations
            prompt = self._build_search_prompt(query, user_preferences, category, limit)
            
            url = f"{self.base_url}/{self.model_name}:generateContent?key={self.api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 1024,
                }
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                if 'candidates' in result and len(result['candidates']) > 0:
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    
                    # Step 2: Match AI recommendations to database
                    matched_products = self._match_to_database(text, category, user_preferences, limit)
                    
                    logger.info(f"✅ Found {len(matched_products)} products")
                    return matched_products
            
            logger.error(f"API error {response.status_code}")
            return[]
                
        except Exception as e:
            logger.error(f"Gemini search failed: {str(e)}")
            return []
    
    def _match_to_database(self, ai_text, category, user_preferences, limit):
        """
        Match AI recommendations to database products using semantic similarity
        """
        # Extract all products from database based on category
        db_products = []
        
        if category == 'skincare':
            for subcat in self.products_db.get('skincare', {}).values():
                if isinstance(subcat, list):
                    db_products.extend(subcat)
        elif category == 'haircare':
            for subcat in self.products_db.get('haircare', {}).values():
                if isinstance(subcat, list):
                    db_products.extend(subcat)
        else:
            # Get all products
            for cat_data in self.products_db.values():
                if isinstance(cat_data, dict):
                    for subcat in cat_data.values():
                        if isinstance(subcat, list):
                            db_products.extend(subcat)
                elif isinstance(cat_data, list):
                    db_products.extend(cat_data)
        
        # Calculate embeddings
        ai_embedding = self.matcher.encode(ai_text)
        
        # Score each product
        scored_products = []
        for product in db_products:
            # Filter by user preferences
            if not self._matches_preferences(product, user_preferences, category):
                continue
            
            # Create product text for matching
            product_text = f"{product['brand']} {product['name']}"
            if 'concerns' in product:
                product_text += " " + " ".join(product['concerns'])
            
            product_embedding = self.matcher.encode(product_text)
            
            # Calculate cosine similarity
            similarity = np.dot(ai_embedding, product_embedding) / (
                np.linalg.norm(ai_embedding) * np.linalg.norm(product_embedding)
            )
            
            if similarity > 0.3:  # Minimum threshold
                product_copy = product.copy()
                product_copy['match_score'] = float(similarity)
                product_copy['match_reason'] = f"Matches your {category} needs"
                scored_products.append(product_copy)
        
        # Sort by similarity and return top matches
        scored_products.sort(key=lambda x: x['match_score'], reverse=True)
        
        return scored_products[:limit]
    
    def _matches_preferences(self, product, preferences, category):
        """
        Check if product matches user preferences
        """
        if category == 'skincare':
            skin_type = preferences.get('skinType', '').lower()
            concern = preferences.get('skinConcern', '').lower()
            
            if skin_type and 'skin_types' in product:
                if skin_type not in product['skin_types'] and 'all' not in product['skin_types']:
                    return False
            
            if concern and 'concerns' in product:
                # Check if any concern matches
                concerns_match = any(concern in c.lower() for c in product['concerns'])
                if not concerns_match:
                    return False
        
        elif category == 'haircare':
            hair_type = preferences.get('hairType', '').lower()
            concern = preferences.get('hairConcern', '').lower()
            
            if hair_type and 'hair_types' in product:
                if hair_type not in product['hair_types'] and 'all' not in product['hair_types']:
                    return False
            
            if concern and 'concerns' in product:
                concerns_match = any(concern in c.lower() for c in product['concerns'])
                if not concerns_match:
                    return False
        
        return True
    
    def _build_search_prompt(self, query, user_preferences, category, limit):
        """Build search prompt for Gemini"""
        
        pref_context = ""
        if category == 'skincare':
            pref_context = f"Skin Type: {user_preferences.get('skinType')}, Concern: {user_preferences.get('skinConcern')}"
        elif category == 'haircare':
            pref_context = f"Hair Type: {user_preferences.get('hairType')}, Concern: {user_preferences.get('hairConcern')}"
        
        prompt = f"""Recommend {limit} specific product names for: "{query}"

User Profile: {pref_context}

List ONLY product names and brands from popular Indian brands like:
- Minimalist, Plum, Dot & Key, The Ordinary
- Cetaphil, Neutrogena, La Roche-Posay
- L'Oreal, Dove, TRESemmé

Focus on products matching the user's needs."""
        
        return prompt
    
    def get_ai_recommendation_text(self, query, user_preferences, top_product):
        """Generate personalized recommendation text"""
        return f"Based on your {user_preferences.get('skinType', '')} skin, I recommend {top_product.get('brand')} {top_product.get('name')}. It's perfect for {user_preferences.get('skinConcern', 'your needs')}!"
