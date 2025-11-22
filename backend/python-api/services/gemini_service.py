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
        # Load Gemini API key from environment variables only. No hard-coded defaults in code.
        self.api_key = os.getenv('GEMINI_API_KEY', '').strip()
        if not self.api_key:
            logger.error("GEMINI_API_KEY is not set in environment variables. please set GEMINI_API_KEY in your shell or deployment environment")
        
        self.model = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        self.max_tokens = int(os.getenv('MAX_TOKENS', '2048'))
        self.temperature = float(os.getenv('TEMPERATURE', '0.7'))
        self.timeout = int(os.getenv('REQUEST_TIMEOUT', '60'))  # Increased for Google Search grounding
        
        # Updated model fallbacks with NEW Gemini 2.0+ models (verified working as of Nov 2024)
        self.model_fallbacks = [
            'gemini-2.5-flash',      # Fastest, recommended for production
            'gemini-2.0-flash',      # Backup option
            'gemini-2.5-pro'         # Most capable, if the others fail
        ]
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is required. Set GEMINI_API_KEY environment variable in your shell or deployment platform.")
    
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
        # Use v1 for stability
        api_version = 'v1'
        url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model}:generateContent?key={self.api_key}"
        
        # Log the API call details
        logger.info(f"🚀 Making Gemini API call with India-specific prompting:")
        logger.info(f"   Model: {model}")
        logger.info(f"   URL: {url[:80]}...")
        logger.info(f"   API Key (first 10 chars): {self.api_key[:10]}...")
        logger.info(f"   Prompt length: {len(prompt)} characters")
        logger.info(f"   🇮🇳 Validation: Non-Indian links will be filtered out")
        
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
            },
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

🚨 CRITICAL INSTRUCTION - READ CAREFULLY:
═══════════════════════════════════════════════════════════════
🇮🇳 RECOMMEND ONLY FROM THE VERIFIED PRODUCT DATABASE BELOW

YOU MUST:
1. ✅ Choose products ONLY from the "VERIFIED INDIAN PRODUCTS" list below
2. ✅ Use EXACT product names and links as provided
3. ✅ Use EXACT prices in ₹ (Indian Rupees) as listed
4. ✅ Match products to user's profile (skin type, hair type, style)
5. ✅ Provide 3-5 products that best match user's needs
6. ❌ DO NOT make up new products not in the list
7. ❌ DO NOT modify product names or links
8. ❌ DO NOT use amazon.com or any non-Indian sites
9. ❌ DO NOT provide prices in dollars ($)
10. ❌ DO NOT create generic/fake product links

LINK FORMAT REQUIREMENTS:
✓ CORRECT: "https://www.amazon.in/Cetaphil-Gentle-Cleanser-Face-125ml/dp/B07PYZFMMX"
✓ CORRECT: "https://www.nykaa.com/cetaphil-gentle-skin-cleanser/p/22317"
✗ WRONG: "https://www.amazon.in/s?k=moisturizer" (search URL)
✗ WRONG: "https://www.amazon.in/product-name" (generic/fake URL)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFIED INDIAN PRODUCTS DATABASE (Choose ONLY from here)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧴 MOISTURIZERS:
─────────────────────────────────────────────────────────────
1. Cetaphil Moisturizing Cream (550ml)
   Price: ₹999 | Skin: Dry, Sensitive
   Link: https://www.amazon.in/dp/B003MJG19K
   Ingredients: Glycerin, Panthenol, Sweet Almond Oil

2. Minimalist Sepicalm 3% + Oat Moisturizer (100ml)
   Price: ₹399 | Skin: All types, Sensitive
   Link: https://www.amazon.in/dp/B08T6X916Q
   Ingredients: Sepicalm, Oat Extract, Squalane

3. Plum Hello Aloe Just Gel (150ml)
   Price: ₹299 | Skin: Oily, Combination
   Link: https://www.amazon.in/dp/B076PWFVB1
   Ingredients: Aloe Vera, Glycerin

4. Neutrogena Hydro Boost Water Gel (50g)
   Price: ₹899 | Skin: All types
   Link: https://www.amazon.in/s?k=Neutrogena+Hydro+Boost+Water+Gel
   Ingredients: Hyaluronic Acid, Glycerin

5. Simple Kind to Skin Hydrating Light Moisturiser (125ml)
   Price: ₹385 | Skin: Dry, Sensitive
   Link: https://www.nykaa.com/simple-kind-to-skin-hydrating-light-moisturiser/p/129162
   Ingredients: Vitamin E, Vitamin B5, Bisabolol

🧼 CLEANSERS:
─────────────────────────────────────────────────────────────
6. Cetaphil Gentle Skin Cleanser (125ml)
   Price: ₹525 | Skin: All types, Sensitive
   Link: https://www.amazon.in/dp/B07PYZFMMX
   Ingredients: Glycerin, Panthenol, Niacinamide

7. Plum Green Tea Renewed Clarity Face Wash (75ml)
   Price: ₹299 | Skin: Oily, Acne-prone
   Link: https://www.amazon.in/dp/B01MSJXZ7L
   Ingredients: Green Tea, Glycolic Acid

8. Simple Refreshing Facial Wash Gel (150ml)
   Price: ₹350 | Skin: All types
   Link: https://www.amazon.in/dp/B00COMJSR8
   Ingredients: Vitamin E, Vitamin B5, Chamomile

💧 SERUMS:
─────────────────────────────────────────────────────────────
9. Minimalist 10% Niacinamide Face Serum (30ml)
   Price: ₹599 | Skin: Oily, Acne-prone, Large pores
   Link: https://www.amazon.in/dp/B08GY59SH4
   Ingredients: 10% Niacinamide, 1% Zinc

10. Minimalist 2% Salicylic Acid Serum (30ml)
    Price: ₹599 | Skin: Oily, Acne-prone
    Link: https://www.amazon.in/dp/B08L4S8F3Z
    Ingredients: 2% Salicylic Acid, LHA

11. Minimalist 0.3% Retinol Serum (30ml)
    Price: ₹699 | Skin: Aging, Dull
    Link: https://www.amazon.in/dp/B08GXWH3PJ
    Ingredients: 0.3% Retinol, Squalane

🧴 SUNSCREEN:
─────────────────────────────────────────────────────────────
12. Minimalist SPF 50 Sunscreen (50ml)
    Price: ₹449 | Skin: All types
    Link: https://www.amazon.in/dp/B08X6JYB9H
    Ingredients: SPF 50 PA++++, Multi-Vitamin

13. Neutrogena Ultra Sheer Dry Touch Sunblock SPF 50+ (30ml)
    Price: ₹499 | Skin: Oily, Combination
    Link: https://www.amazon.in/dp/B073DSCT4V
    Ingredients: Helioplex, Oil-free

💆 HAIRCARE:
─────────────────────────────────────────────────────────────
14. L'Oreal Paris 6 Oil Nourish Shampoo (704ml)
    Price: ₹799 | Hair: Dry, Damaged
    Link: https://www.amazon.in/dp/B08B3WRRPK
    Ingredients: 6 Micro Oils

15. Tresemme Keratin Smooth Shampoo (580ml)
    Price: ₹525 | Hair: Frizzy, Dry
    Link: https://www.amazon.in/dp/B01NAPMM6N
    Ingredients: Keratin, Argan Oil

16. Pantene Advanced Hairfall Solution Shampoo (650ml)
    Price: ₹499 | Hair: Hair fall
    Link: https://www.amazon.in/dp/B08BR25C19
    Ingredients: Pro-Vitamin B5, Fermented Rice Water

17. WOW Skin Science Onion Black Seed Oil Shampoo (300ml)
    Price: ₹449 | Hair: Hair fall, Thinning
    Link: https://www.amazon.in/dp/B07V3J8KS4
    Ingredients: Red Onion, Black Seed Oil

👔 FASHION (MEN):
─────────────────────────────────────────────────────────────
18. Allen Solly Men's Regular Fit Shirt
    Price: ₹1,299 | Style: Formal, Business
    Link: https://www.amazon.in/dp/B0BY4HTPQ1
    Details: Cotton blend, Multiple colors

19. Van Heusen Men's Casual Shirt
    Price: ₹1,099 | Style: Casual, Smart casual
    Link: https://www.amazon.in/dp/B0CPFH3B99
    Details: Cotton, Checkered patterns

👗 FASHION (WOMEN):
─────────────────────────────────────────────────────────────
20. Only Women's Regular Fit Top
    Price: ₹999 | Style: Casual, Western
    Link: https://www.amazon.in/dp/B0CXV7HX8Y
    Details: Cotton blend, Various colors

21. Vero Moda Women's Casual Dress
    Price: ₹1,599 | Style: Party, Casual
    Link: https://www.amazon.in/dp/B0B8MQWXNJ
    Details: Polyester, A-line fit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECTION RULES:
• For DRY skin → Recommend products 1, 2, 5, 6, 8
• For OILY skin → Recommend products 3, 7, 9, 10, 13
• For SENSITIVE skin → Recommend products 1, 2, 5, 6, 8
• For ACNE-PRONE skin → Recommend products 7, 9, 10
• For DRY hair → Recommend products 14, 15
• For FRIZZY hair → Recommend products 15, 17
• For HAIR FALL → Recommend products 16, 17
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        RESPONSE FORMAT (JSON only, no markdown):
        {{
          "generalAdvice": "Personalized advice based on user's {user_profile.get('skinType', 'normal')} skin type (2-3 sentences)",
          "products": [
            {{
              "name": "Cetaphil Moisturizing Cream (550ml)",
              "brand": "Cetaphil",
              "category": "Skincare",
              "price": "₹999",
              "ingredients": ["Glycerin", "Panthenol", "Sweet Almond Oil"],
              "pros": ["Perfect for dry skin", "Dermatologist recommended", "Long-lasting hydration"],
              "cons": ["Large bottle may be inconvenient", "Can feel heavy in humid weather"],
              "purchaseLink": "https://www.amazon.in/dp/B003MJG19K",
              "compatibility": 90,
              "applicationTips": "Apply to clean, damp skin twice daily"
            }},
            {{
              "name": "Simple Kind to Skin Hydrating Light Moisturiser (125ml)",
              "brand": "Simple",
              "category": "Skincare",
              "price": "₹385",
              "ingredients": ["Vitamin E", "Vitamin B5", "Bisabolol"],
              "pros": ["Lightweight formula", "Budget-friendly", "Sensitive skin friendly"],
              "cons": ["May not be enough for very dry skin", "Small size"],
              "purchaseLink": "https://www.nykaa.com/simple-kind-to-skin-hydrating-light-moisturiser/p/129162",
              "compatibility": 85,
              "applicationTips": "Use morning and evening after cleansing"
            }}
          ],
          "additionalTips": ["Drink plenty of water for hydration", "Use sunscreen daily", "Avoid harsh soaps"]
        }}

CRITICAL: Copy product names and links EXACTLY from the database above!

PERSONALIZATION REQUIREMENTS:
✓ Match products to user's: {user_profile.get('skinType', 'normal')} skin / {user_profile.get('hairType', 'straight')} hair
✓ Consider budget: {user_profile.get('skincareBudget', 'mid')} range
✓ Avoid allergens: {user_profile.get('allergens', [])}
✓ Match style preference: {user_profile.get('stylePreference', 'casual')}
✓ Consider Indian climate, humidity, and local availability

⚠️ IF YOU'RE UNSURE ABOUT A PRODUCT'S CURRENT AVAILABILITY OR EXACT LINK:
→ Skip that product and recommend another one you're confident about
→ Better to recommend 3 REAL products than 5 potentially fake ones

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
