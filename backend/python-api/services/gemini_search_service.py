"""
Gemini Service using REST API instead of SDK
Better quota management and works with all API keys
"""

import requests
import os
import json
import logging

logger = logging.getLogger(__name__)

class GeminiSearchService:
    def __init__(self):
        """Initialize Gemini REST API"""
        self.api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY must be set")
        
        # Use REST API endpoint
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model_name = "gemini-2.5-flash"  # Production model available for this API key
        logger.info(f"✅ Gemini REST API service initialized with {self.model_name}")
    
    def search_products(self, query, user_preferences, category='skincare', limit=5):
        """
        Search for products using Gemini REST API
        """
        try:
            prompt = self._build_search_prompt(query, user_preferences, category, limit)
            
            # Call REST API
            url = f"{self.base_url}/{self.model_name}:generateContent?key={self.api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 2048,
                    "responseMimeType": "application/json"  # Force JSON output
                }
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            logger.info(f"API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Response structure: {list(result.keys())}")
                
                # Handle different response structures
                try:
                    if 'candidates' in result and len(result['candidates']) > 0:
                        candidate = result['candidates'][0]
                        if 'content' in candidate:
                            content = candidate['content']
                            if 'parts' in content and len(content['parts']) > 0:
                                text = content['parts'][0]['text']
                            elif isinstance(content, str):
                                text = content
                            else:
                                logger.error(f"Unexpected content structure: {content}")
                                return []
                        elif 'text' in candidate:
                            text = candidate['text']
                        else:
                            logger.error(f"No text in candidate: {candidate.keys()}")
                            return []
                    else:
                        logger.error(f"No candidates in response: {result}")
                        return []
                    
                    logger.info(f"Raw response text: {text[:200]}...")
                    
                    # Try to parse JSON from response
                    try:
                        # Clean markdown code blocks if present
                        if '```json' in text:
                            text = text.split('```json')[1].split('```')[0].strip()
                        elif '```' in text:
                            text = text.split('```')[1].split('```')[0].strip()
                        
                        products = json.loads(text)
                        logger.info(f"✅ Generated {len(products.get('products', []))} product recommendations")
                        return products.get('products', [])
                    except json.JSONDecodeError as e:
                        logger.warning(f"Could not parse JSON from response: {text[:200]}")
                        logger.error(f"JSON error: {str(e)}")
                        return []
                        
                except Exception as e:
                    logger.error(f"Error parsing response: {str(e)}")
                    logger.error(f"Full response: {result}")
                    return []
            else:
                logger.error(f"API error {response.status_code}: {response.text[:200]}")
                return []
                
        except Exception as e:
            logger.error(f"Gemini search failed: {str(e)}")
            return []
    
    def _build_search_prompt(self, query, user_preferences, category, limit):
        """Build optimized search prompt"""
        
        # Build preference context
        pref_context = ""
        if category == 'skincare':
            pref_context = f"""
User Profile:
- Skin Type: {user_preferences.get('skinType', 'not specified')}
- Skin Concern: {user_preferences.get('skinConcern', 'not specified')}
- Budget: {user_preferences.get('skincareBudget', 'moderate')}
"""
        elif category == 'haircare':
            pref_context = f"""
User Profile:
- Hair Type: {user_preferences.get('hairType', 'not specified')}
- Hair Texture: {user_preferences.get('hairTexture', 'not specified')}
- Hair Concern: {user_preferences.get('hairConcern', 'not specified')}
"""
        elif category == 'fashion':
            pref_context = f"""
User Profile:
- Style Preference: {user_preferences.get('stylePreference', 'not specified')}
- Budget: {user_preferences.get('fashionBudget', 'moderate')}
- Occasions: {user_preferences.get('occasions', 'all')}
"""
        
        prompt = f"""You are a product recommendation AI. Based on your knowledge of popular products in India, recommend {limit} products for this query: "{query}"

{pref_context}

Recommend products from well-known brands available on Nykaa, Amazon India, or Flipkart.

You MUST return ONLY a valid JSON object with this EXACT structure (no additional text, no explanations, no markdown):

{{
  "products": [
    {{
      "name": "Full Product Name",
      "brand": "Brand Name",
      "url": "https://www.nykaa.com/product-name/p/123456",
      "price": "Rs 599",
      "description": "Brief description",
      "match_reason": "Why it matches"
    }}
  ]
}}

Rules:
- Start your response with {{ and end with }}
- No text before or after the JSON
- No markdown code blocks
- URLs should be realistic product page URLs
- Prices in Indian Rupees (Rs)
- Focus on products matching the user's {category} preferences

Return the JSON now:"""
        
        return prompt
    
    def get_ai_recommendation_text(self, query, user_preferences, top_product):
        """Generate personalized recommendation text"""
        try:
            prompt = f"""Write a friendly 2-sentence recommendation for this product:

User asked: "{query}"
User has: {user_preferences.get('skinType', '')} skin with {user_preferences.get('skinConcern', '')} concerns

Product: {top_product.get('name')} by {top_product.get('brand')} - {top_product.get('price')}

Explain why it's perfect for them."""
            
            url = f"{self.base_url}/{self.model_name}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.7, "maxOutputTokens": 200}
            }
            
            response = requests.post(url, json=payload, timeout=15)
            
            if response.status_code == 200:
                result = response.json()
                return result['candidates'][0]['content']['parts'][0]['text'].strip()
            else:
                return f"Based on your {user_preferences.get('skinType', '')} skin, I recommend this product!"
                
        except Exception as e:
            logger.error(f"Failed to generate recommendation text: {str(e)}")
            return f"I recommend this product for your needs!"
