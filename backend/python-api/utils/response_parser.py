"""
AI response parsing utilities
"""

import json
import re
import logging
from typing import Dict, Any, Union

logger = logging.getLogger(__name__)

def parse_ai_response(ai_text: str) -> Dict[str, Any]:
    """
    Parse and clean AI response text into structured data
    
    Args:
        ai_text: Raw AI response text
        
    Returns:
        Parsed and validated response dictionary
    """
    try:
        # Clean the response text
        cleaned_text = clean_ai_response(ai_text)
        
        # Try to parse as JSON
        parsed_data = json.loads(cleaned_text)
        
        # Validate the structure
        validated_data = validate_response_structure(parsed_data)
        
        return validated_data
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        logger.error(f"AI response text: {ai_text[:500]}...")
        
        # Return fallback response
        return create_fallback_response(ai_text)
    
    except Exception as e:
        logger.error(f"Error parsing AI response: {str(e)}")
        return create_fallback_response(ai_text)

def clean_ai_response(text: str) -> str:
    """
    Clean AI response text to extract valid JSON
    
    Args:
        text: Raw AI response
        
    Returns:
        Cleaned JSON string
    """
    # Remove markdown code blocks
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*$', '', text)
    text = re.sub(r'^```\s*', '', text)
    
    # Remove any text before the first {
    json_start = text.find('{')
    if json_start != -1:
        text = text[json_start:]
    
    # Remove any text after the last }
    json_end = text.rfind('}')
    if json_end != -1:
        text = text[:json_end + 1]
    
    # Clean up common issues
    text = text.strip()
    
    # Fix common JSON formatting issues
    text = re.sub(r',\s*}', '}', text)  # Remove trailing commas
    text = re.sub(r',\s*]', ']', text)  # Remove trailing commas in arrays
    
    return text

def validate_response_structure(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and fix response structure
    
    Args:
        data: Parsed JSON data
        
    Returns:
        Validated and fixed response
    """
    validated = {}
    
    # Ensure required fields exist
    validated['generalAdvice'] = data.get('generalAdvice', 'No specific advice provided.')
    
    # Validate products array
    products = data.get('products', [])
    if not isinstance(products, list):
        products = []
    
    validated_products = []
    for product in products:
        if isinstance(product, dict):
            validated_product = validate_product(product)
            # Only add if validation passed (not None - means Indian link)
            if validated_product is not None:
                validated_products.append(validated_product)
            else:
                logger.info(f"Filtered out product with non-Indian link")
    
    validated['products'] = validated_products
    
    # Validate additional tips
    tips = data.get('additionalTips', [])
    if not isinstance(tips, list):
        tips = []
    
    # Ensure all tips are strings
    validated_tips = [str(tip) for tip in tips if tip]
    validated['additionalTips'] = validated_tips
    
    return validated

def validate_product(product: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and fix individual product data
    
    Args:
        product: Product dictionary
        
    Returns:
        Validated product or None if invalid (non-Indian link)
    """
    validated = {}
    
    # Required fields with defaults
    validated['name'] = product.get('name', 'Unknown Product')
    validated['brand'] = product.get('brand', 'Unknown Brand')
    validated['category'] = product.get('category', 'Beauty')
    
    # Price - ensure it's in ₹
    price = product.get('price', 'Price not available')
    if '$' in str(price) and '₹' not in str(price):
        logger.warning(f"Product {validated['name']} has price in dollars, converting/rejecting")
        price = 'Price not available'
    validated['price'] = price
    
    # Arrays
    validated['ingredients'] = ensure_string_array(product.get('ingredients', []))
    validated['pros'] = ensure_string_array(product.get('pros', []))
    validated['cons'] = ensure_string_array(product.get('cons', []))
    
    # URLs - CRITICAL: Validate Indian domains only
    purchase_link = product.get('purchaseLink', '')
    if not purchase_link or not purchase_link.startswith('http'):
        logger.warning(f"Product {validated['name']} has invalid/missing link")
        purchase_link = ''
    else:
        # Check if link is from Indian website
        indian_domains = ['.in/', '.in?', 'amazon.in', 'nykaa.com', 'flipkart.com', 'myntra.com']
        is_indian_link = any(domain in purchase_link.lower() for domain in indian_domains)
        
        if not is_indian_link:
            logger.warning(f"Product {validated['name']} has non-Indian link: {purchase_link}")
            # Reject this product by returning None
            return None
    
    validated['purchaseLink'] = purchase_link
    
    # Compatibility score
    compatibility = product.get('compatibility', 0)
    try:
        compatibility = int(compatibility)
        if compatibility < 0:
            compatibility = 0
        elif compatibility > 100:
            compatibility = 100
    except (ValueError, TypeError):
        compatibility = 75  # Default
    
    validated['compatibility'] = compatibility
    
    # Application tips
    validated['applicationTips'] = product.get('applicationTips', 'Follow product instructions.')
    
    return validated

def ensure_string_array(value: Any) -> list:
    """
    Ensure value is an array of strings
    
    Args:
        value: Input value
        
    Returns:
        List of strings
    """
    if not isinstance(value, list):
        if isinstance(value, str):
            return [value]
        return []
    
    return [str(item) for item in value if item]

def create_fallback_response(original_text: str) -> Dict[str, Any]:
    """
    Create a fallback response when parsing fails
    
    Args:
        original_text: Original AI response
        
    Returns:
        Fallback response structure
    """
    # Try to extract useful information from the text
    advice = extract_advice_from_text(original_text)
    
    return {
        'generalAdvice': advice,
        'products': [
            {
                'name': 'Cetaphil Moisturizing Cream (550ml)',
                'brand': 'Cetaphil',
                'category': 'Skincare',
                'price': '₹999',
                'ingredients': ['Glycerin', 'Panthenol', 'Sweet Almond Oil'],
                'purchaseLink': 'https://www.amazon.in/dp/B003MJG19K',
                'compatibility': 85,
                'pros': ['Gentle formula', 'Widely available', 'Suitable for dry skin'],
                'cons': ['May feel heavy for some', 'Large bottle size'],
                'applicationTips': 'Apply to clean, damp skin twice daily for best results'
            },
            {
                'name': 'Simple Kind to Skin Hydrating Light Moisturiser (125ml)',
                'brand': 'Simple',
                'category': 'Skincare',
                'price': '₹385',
                'ingredients': ['Vitamin E', 'Vitamin B5', 'Bisabolol'],
                'purchaseLink': 'https://www.nykaa.com/simple-kind-to-skin-hydrating-light-moisturiser/p/129162',
                'compatibility': 80,
                'pros': ['Lightweight', 'Affordable', 'Sensitive skin friendly'],
                'cons': ['May not be enough for very dry skin'],
                'applicationTips': 'Use morning and evening after cleansing'
            }
        ],
        'additionalTips': [
            'Always patch test new products',
            'Use sunscreen daily',
            'Maintain a consistent routine'
        ],
        '_fallback': True,
        '_originalResponse': original_text[:200] + '...' if len(original_text) > 200 else original_text
    }

def extract_advice_from_text(text: str) -> str:
    """
    Extract general advice from unstructured text
    
    Args:
        text: AI response text
        
    Returns:
        Extracted advice string
    """
    # Look for sentences that contain advice keywords
    advice_keywords = ['recommend', 'suggest', 'try', 'use', 'avoid', 'consider', 'look for']
    
    sentences = text.split('.')
    advice_sentences = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if any(keyword in sentence.lower() for keyword in advice_keywords):
            advice_sentences.append(sentence)
    
    if advice_sentences:
        return '. '.join(advice_sentences[:2]) + '.'
    
    # Fallback to first few sentences
    first_sentences = sentences[:2]
    return '. '.join(s.strip() for s in first_sentences if s.strip()) + '.'
