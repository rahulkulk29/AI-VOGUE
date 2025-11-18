"""
Gemini AI Service
Handles all interactions with Google's Gemini AI API
"""

import os
import requests
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        # 🔑 DIRECT API KEY FOR TESTING - Replace with your actual key
        self.api_key = "AIzaSyDGZdru4jUqEfaZFG9L0bmvbhpg0pVl64Q"  # ⬅️ PUT YOUR API KEY HERE
        
        # Try environment variable first, fallback to direct key
        env_key = os.getenv('GEMINI_API_KEY')
        if env_key and env_key.strip():
            self.api_key = env_key.strip()
            logger.info("Using Gemini API key from environment variable")
        else:
            logger.warning("Using direct API key from code (for testing only)")
        
        self.model = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        self.max_tokens = int(os.getenv('MAX_TOKENS', '2048'))
        self.temperature = float(os.getenv('TEMPERATURE', '0.7'))
        self.timeout = int(os.getenv('REQUEST_TIMEOUT', '30'))
        
        # Updated model fallbacks with NEW Gemini 2.0+ models (verified working as of Nov 2024)
        self.model_fallbacks = [
            'gemini-2.5-flash',      # Fastest, recommended for production
            'gemini-2.0-flash',      # Backup option
            'gemini-2.5-pro'         # Most capable, if the others fail
        ]
        
        if not self.api_key or self.api_key == "YOUR_GEMINI_API_KEY_HERE":
            raise ValueError("Please replace 'YOUR_GEMINI_API_KEY_HERE' with your actual Gemini API key in gemini_service.py")
    
    def get_recommendations(self, user_query: str, user_profile: Dict[str, Any], image_data: Optional[str] = None) -> Dict[str, Any]:
        """
        Get AI recommendations from Gemini API
        
        Args:
            user_query: User's question/request
            user_profile: User's preferences and profile data
            image_data: Optional base64 encoded image
            
        Returns:
            Dict with success status and data/error
        """
        logger.info("="*60)
        logger.info("🎯 Starting get_recommendations")
        logger.info(f"   Query: {user_query[:100]}...")
        logger.info(f"   Profile keys: {list(user_profile.keys()) if user_profile else 'None'}")
        logger.info(f"   Has image: {bool(image_data)}")
        logger.info("="*60)
        
        try:
            model_errors = []
            # Build the prompt
            logger.info("📝 Building prompt...")
            prompt = self._build_prompt(user_query, user_profile, image_data)
            logger.info(f"✅ Prompt built: {len(prompt)} characters")
            
            # Try each model until one works
            logger.info(f"🔄 Trying {len(self.model_fallbacks)} models: {self.model_fallbacks}")
            for model in self.model_fallbacks:
                try:
                    logger.info(f"Trying Gemini model: {model}")
                    
                    response = self._call_gemini_api(prompt, model)
                    
                    if response:
                        logger.info(f"Successfully got response from {model}")
                        return {
                            'success': True,
                            'data': response,
                            'model_used': model
                        }
                        
                except Exception as e:
                    err_msg = str(e)
                    logger.error(f"❌ Model {model} failed: {err_msg}")
                    logger.error(f"   Full error details: {repr(e)}")
                    model_errors.append({'model': model, 'error': err_msg})
                    continue
            
            # If all models failed
            return {
                'success': False,
                'error': 'All Gemini models failed. Please try again later.',
                'details': 'No available models could process the request',
                'errors': model_errors
            }
            
        except Exception as e:
            logger.error(f"Error in get_recommendations: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _call_gemini_api(self, prompt: str, model: str) -> Optional[str]:
        """
        Make API call to Gemini
        
        Args:
            prompt: The formatted prompt
            model: Model name to use
            
        Returns:
            AI response text or None if failed
        """
        api_version = os.getenv('GEMINI_API_VERSION', 'v1')  # Changed to v1 for broader compatibility
        url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model}:generateContent?key={self.api_key}"
        
        # Log the API call details
        logger.info(f"🚀 Making Gemini API call:")
        logger.info(f"   Model: {model}")
        logger.info(f"   URL: {url[:80]}...")
        logger.info(f"   API Key (first 10 chars): {self.api_key[:10]}...")
        logger.info(f"   Prompt length: {len(prompt)} characters")
        
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": self.temperature,
                "topK": 20,
                "topP": 0.9,
                "maxOutputTokens": self.max_tokens
            }
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        logger.info("📡 Sending POST request to Gemini API...")
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=self.timeout
            )
            
            logger.info(f"📥 Received response: Status {response.status_code}")
        except requests.exceptions.Timeout:
            logger.error(f"⏱️ Request timeout after {self.timeout} seconds")
            raise Exception(f"Request timeout after {self.timeout} seconds")
        except requests.exceptions.ConnectionError as e:
            logger.error(f"🔌 Connection error: {str(e)}")
            raise Exception(f"Connection error: {str(e)}")
        except Exception as e:
            logger.error(f"❌ Request failed: {str(e)}")
            raise
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"✅ API call successful! Response keys: {list(data.keys())}")
            
            if 'candidates' in data and len(data['candidates']) > 0:
                content = data['candidates'][0]['content']['parts'][0]['text']
                logger.info(f"📝 Generated content length: {len(content)} characters")
                return content
            else:
                logger.error(f"❌ No candidates in response. Full response: {json.dumps(data, indent=2)}")
                raise Exception("No candidates in response")
        
        elif response.status_code == 404:
            logger.error(f"❌ Model not found: {model}")
            raise Exception(f"Model {model} not found or not supported")
        
        else:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get('error', {}).get('message', f"HTTP {response.status_code}")
            logger.error(f"❌ API error {response.status_code}: {error_msg}")
            logger.error(f"   Full error response: {json.dumps(error_data, indent=2)}")
            raise Exception(f"API error: {error_msg}")
    
    def _build_prompt(self, user_query: str, user_profile: Dict[str, Any], image_data: Optional[str] = None) -> str:
        """
        Build optimized prompt for Gemini AI
        
        Args:
            user_query: User's question
            user_profile: User preferences
            image_data: Optional image data
            
        Returns:
            Formatted prompt string
        """
        # Format user profile
        profile_context = self._format_user_profile(user_profile)
        
        prompt = f"""You are an expert beauty and fashion consultant specializing in the INDIAN MARKET with deep knowledge of skincare, haircare, and fashion products available in India.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{profile_context}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USER QUESTION: {user_query}

        INSTRUCTIONS:
        1. Provide personalized recommendations based on their profile
        2. Suggest 3-5 specific products AVAILABLE IN INDIA
        3. Include match percentage (0-100%) for each product
        4. Explain why each product suits their profile
        5. Use Indian Rupees (₹) for all prices
        6. Include links to Indian retailers (Amazon.in, Nykaa, Flipkart, Myntra)
        
        RESPONSE FORMAT (JSON only, no markdown):
        {{
          "generalAdvice": "Personalized advice paragraph based on their profile (2-3 sentences)",
          "products": [
            {{
              "name": "Product Name",
              "brand": "Brand Name",
              "category": "Skincare/Haircare/Fashion",
              "price": "₹1,250",
              "ingredients": ["Ingredient1", "Ingredient2", "Ingredient3"],
              "pros": ["Pros matched to their profile"],
              "cons": ["Potential downsides for their profile"],
              "purchaseLink": "https://www.amazon.in/dp/XXXXXXXXX",
              "compatibility": 95,
              "applicationTips": "How to use"
            }}
          ],
          "additionalTips": ["Tip 1 specific to their profile", "Tip 2", "Tip 3"]
        }}

CRITICAL REQUIREMENTS:
✓ Use REAL products available on Amazon.in, Nykaa, Flipkart
✓ Brands: Cetaphil, Minimalist, Plum, Mamaearth, The Ordinary, CeraVe, Neutrogena, Lakme, Biotique, Himalaya, etc.
✓ Prices in Indian Rupees (₹500-₹5000 range typical)
✓ Match percentage must reflect compatibility with their profile
✓ Match reasons must be specific to their skin/hair type and concerns
✓ AVOID these ingredients if user is allergic: {user_profile.get('allergens', [])}
✓ Focus on products within their budget: {user_profile.get('skincareBudget', 'mid')}
✓ Consider Indian climate and skin concerns

Respond ONLY with valid JSON. No markdown, no code blocks, no explanations."""

        if image_data:
            prompt += f"\n\nIMAGE CONTEXT: User has uploaded an image for analysis. Please analyze it in your recommendations."
        
        return prompt
    
    def _format_user_profile(self, user_profile: Dict[str, Any]) -> str:
        """
        Format user profile for prompt inclusion
        
        Args:
            user_profile: User preferences dictionary
            
        Returns:
            Formatted profile string
        """
        if not user_profile:
            return "No specific profile information provided."
        
        profile_parts = []
        
        # Skin information
        profile_parts.append(f"• Skin Type: {user_profile.get('skinType', 'Not specified')}")
        profile_parts.append(f"• Primary Skin Concern: {user_profile.get('skinConcern', 'Not specified')}")
        
        # Hair information
        profile_parts.append(f"• Hair Type: {user_profile.get('hairType', 'Not specified')}")
        if user_profile.get('hairTexture'):
            profile_parts.append(f"• Hair Texture: {user_profile['hairTexture']}")
        if user_profile.get('hairConcern'):
            profile_parts.append(f"• Hair Concern: {user_profile['hairConcern']}")
        
        # Style and budget
        profile_parts.append(f"• Style Preference: {user_profile.get('stylePreference', 'Not specified')}")
        profile_parts.append(f"• Skincare Budget: {user_profile.get('skincareBudget', 'mid-range')}")
        profile_parts.append(f"• Fashion Budget: {user_profile.get('fashionBudget', 'mid-range')}")
        
        # Shopping habits
        if user_profile.get('shoppingFrequency'):
            profile_parts.append(f"• Shopping Frequency: {user_profile['shoppingFrequency']}")
        if user_profile.get('occasions'):
            profile_parts.append(f"• Occasions: {user_profile['occasions']}")
        
        # Demographics
        if user_profile.get('ageRange'):
            profile_parts.append(f"• Age Range: {user_profile['ageRange']}")
        
        # Allergies and preferences
        if user_profile.get('allergens'):
            allergens = ', '.join(user_profile['allergens']) if isinstance(user_profile['allergens'], list) else user_profile['allergens']
            profile_parts.append(f"Allergies/Avoid: {allergens}")
        
        if user_profile.get('preferredIngredients'):
            preferred = ', '.join(user_profile['preferredIngredients']) if isinstance(user_profile['preferredIngredients'], list) else user_profile['preferredIngredients']
            profile_parts.append(f"Preferred Ingredients: {preferred}")
        
        return '\n'.join(profile_parts) if profile_parts else "No specific profile information provided."
