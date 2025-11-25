"""
Gemini AI Service (stable, structured-output friendly)
"""

import os
import requests
import json
import logging
import time
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class GeminiService:
    def __init__(self):
        # Always prefer environment variable keys for production:
        self.api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if not self.api_key or not self.api_key.strip():
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable must be set")
        self.api_key = self.api_key.strip()

        # Use env to pick model (default to stable 1.5 flash which supports JSON mode)
        self.model = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        self.timeout = int(os.getenv('REQUEST_TIMEOUT', '60'))
        self.max_retries = int(os.getenv('GENAI_MAX_RETRIES', '3'))
        self.base_url = os.getenv('GENAI_BASE_URL', 'https://generativelanguage.googleapis.com')
        # Example: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={KEY}
        self.api_url_template = f"{self.base_url}/v1beta/models/{{model}}:generateContent?key={{key}}"

        # Default generation params
        self.temperature = float(os.getenv('TEMPERATURE', '0.7'))
        self.max_output_tokens = int(os.getenv('MAX_OUTPUT_TOKENS', '1024'))

    def _build_payload(self, prompt_text: str, response_schema: Optional[Dict]=None) -> Dict[str, Any]:
        """
        Builds the payload for Gemini generateContent API.
        Uses the correct Gemini REST API format with contents array.
        """
        # Enhance prompt to specifically request Indian product links
        enhanced_prompt = f"""{prompt_text}

CRITICAL REQUIREMENTS:
1. Product Links: ONLY use Indian shopping websites:
   - amazon.in (format: https://www.amazon.in/dp/ASIN)
   - nykaa.com (format: https://www.nykaa.com/product-name/p/PRODUCTID)
   - flipkart.com (format: https://www.flipkart.com/product/p/PRODUCTID)
   - myntra.com (format: https://www.myntra.com/product/PRODUCTID)
   
2. Direct Product URLs ONLY - NO search pages, NO amazon.com international links
3. All prices MUST be in INR (₹) format
4. Include valid ASIN or Product IDs in URLs
5. Verify products are actually available in India

Return response in JSON format with this structure:
{{
    "generalAdvice": "personalized advice based on user profile",
    "products": [
        {{
            "name": "Product Name (Size)",
            "brand": "Brand Name",
            "category": "Skincare/Haircare/Fashion",
            "price": "₹XXX",
            "ingredients": ["ingredient1", "ingredient2"],
            "purchaseLink": "https://www.amazon.in/dp/ASIN or valid Indian site link",
            "compatibility": 85,
            "pros": ["pro1", "pro2"],
            "cons": ["con1", "con2"],
            "applicationTips": "How to use this product",
            "reason": "Why this suits the user's profile"
        }}
    ],
    "additionalTips": ["tip1", "tip2"]
}}"""

        # Correct Gemini API payload structure
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": enhanced_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": self.temperature,
                "maxOutputTokens": self.max_output_tokens,
                "responseMimeType": "application/json"
            }
        }

        # Add response schema if provided (for structured output)
        if response_schema:
            payload["generationConfig"]["responseSchema"] = response_schema

        return payload

    def get_recommendations(self, prompt_text: str, response_schema: Optional[Dict]=None) -> Dict[str, Any]:
        """
        Call the Gemini generateContent endpoint and return a parsed JSON object.
        Uses the correct Gemini REST API format.
        """
        url = self.api_url_template.format(model=self.model, key=self.api_key)
        payload = self._build_payload(prompt_text, response_schema=response_schema)
        headers = {"Content-Type": "application/json"}

        attempt = 0
        backoff = 1.0
        last_exc = None

        while attempt < self.max_retries:
            attempt += 1
            try:
                logger.info(f"Calling Gemini model {self.model} (attempt {attempt})")
                logger.debug(f"Request URL: {url}")
                logger.debug(f"Payload structure: {list(payload.keys())}")
                
                resp = requests.post(url, json=payload, headers=headers, timeout=self.timeout)
                logger.info(f"Gemini response status: {resp.status_code}")

                if resp.status_code == 200:
                    j = resp.json()
                    logger.debug("Full response keys: %s", list(j.keys()))
                    
                    # Gemini API returns: {"candidates": [{"content": {"parts": [{"text": "..."}]}}]}
                    if isinstance(j, dict) and 'candidates' in j and j['candidates']:
                        try:
                            candidate = j['candidates'][0]
                            
                            # Check for safety/finish reason issues
                            finish_reason = candidate.get('finishReason', 'UNKNOWN')
                            if finish_reason not in ['STOP', 'MAX_TOKENS', None]:
                                logger.warning(f"Unexpected finish reason: {finish_reason}")
                                if finish_reason == 'SAFETY':
                                    logger.error("Content blocked by safety filters")
                                    return {"success": False, "error": "safety_block", "details": "Content blocked by safety filters"}
                            
                            # Extract text from parts
                            content_parts = candidate.get('content', {}).get('parts', [])
                            text = "".join([p.get('text', '') for p in content_parts if isinstance(p, dict)])
                            
                            if not text.strip():
                                logger.error("Empty response text from Gemini")
                                return {"success": False, "error": "empty_response", "details": "No text in response"}
                            
                            logger.debug(f"Response text length: {len(text)} chars")
                            
                            # Parse JSON response
                            try:
                                parsed = json.loads(text)
                                logger.info("✅ Successfully parsed JSON response from Gemini")
                                logger.debug(f"Parsed keys: {list(parsed.keys())}")
                                
                                # Validate we have products
                                if 'products' in parsed:
                                    logger.info(f"Received {len(parsed.get('products', []))} products from Gemini")
                                
                                return {"success": True, "data": parsed}
                            except json.JSONDecodeError as e:
                                logger.error(f"JSON parse error: {e}")
                                logger.error(f"Response text: {text[:500]}...")
                                # Return raw text for parser to handle
                                return {"success": True, "data": {"raw_text": text}}
                        except Exception as e:
                            logger.error(f"Error extracting response: {e}")
                            # fallback: return raw JSON
                            return {"success": True, "data": j}
                    else:
                        logger.warning("Unexpected response structure (no candidates)")
                        logger.debug(f"Response: {j}")
                        return {"success": False, "error": "invalid_response", "details": "No candidates in response"}
                        
                elif resp.status_code in (429, 503, 502, 504):
                    # retryable errors
                    logger.warning(f"Rate-limited or service error ({resp.status_code}). Retrying after {backoff}s.")
                    time.sleep(backoff)
                    backoff *= 2
                    last_exc = Exception(f"HTTP {resp.status_code}: {resp.text}")
                    continue
                else:
                    # non-retryable: log and break
                    error_text = resp.text[:500] if resp.text else "No error text"
                    logger.error(f"Non-retryable HTTP error: {resp.status_code}")
                    logger.error(f"Error details: {error_text}")
                    return {"success": False, "error": f"HTTP {resp.status_code}", "details": error_text}
                    
            except requests.exceptions.Timeout as e:
                logger.warning(f"Request timeout: {e}. Retrying after {backoff}s.")
                time.sleep(backoff)
                backoff *= 2
                last_exc = e
                continue
            except requests.exceptions.RequestException as e:
                logger.error(f"Connection error: {e}")
                last_exc = e
                time.sleep(backoff)
                backoff *= 2
                continue
            except Exception as e:
                logger.error(f"Unexpected error: {e}", exc_info=True)
                return {"success": False, "error": "unexpected_error", "details": str(e)}

        # If we exhausted retries
        logger.error("Gemini call failed after retries: %s", last_exc)
        return {"success": False, "error": "request_failed", "details": str(last_exc)}
