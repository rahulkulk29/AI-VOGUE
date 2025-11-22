"""
AI response parsing utilities
"""

import json
import re
import logging
import requests
from typing import Dict, Any, Union, Tuple

logger = logging.getLogger(__name__)

# Verified product registry: enforce correct, working links
VERIFIED_PRODUCTS: Dict[str, str] = {
    # Skincare - Moisturizers
    "cetaphil moisturizing cream (550ml)": "https://www.amazon.in/dp/B003MJG19K",
    "cetaphil moisturizing cream": "https://www.amazon.in/dp/B003MJG19K",
    "minimalist sepicalm 3% + oat moisturizer (100ml)": "https://www.amazon.in/dp/B08T6X916Q",
    "plum hello aloe just gel (150ml)": "https://www.amazon.in/dp/B076PWFVB1",
    "neutrogena hydro boost water gel (50g)": "https://www.nykaa.com/neutrogena-hydro-boost-water-gel/p/260639",
    "neutrogena hydro boost water gel": "https://www.nykaa.com/neutrogena-hydro-boost-water-gel/p/260639",
    "simple kind to skin hydrating light moisturiser (125ml)": "https://www.nykaa.com/simple-kind-to-skin-hydrating-light-moisturiser/p/129162",
    "simple kind to skin hydrating light moisturiser": "https://www.nykaa.com/simple-kind-to-skin-hydrating-light-moisturiser/p/129162",
    
    # Cleansers
    "cetaphil gentle skin cleanser (125ml)": "https://www.amazon.in/dp/B07PYZFMMX",
    "cetaphil gentle skin cleanser": "https://www.amazon.in/dp/B07PYZFMMX",
    "plum green tea renewed clarity face wash (75ml)": "https://www.amazon.in/dp/B01MSJXZ7L",
    "plum green tea face wash": "https://www.amazon.in/dp/B01MSJXZ7L",
    "simple refreshing facial wash gel (150ml)": "https://www.amazon.in/dp/B00COMJSR8",
    "simple refreshing facial wash gel": "https://www.amazon.in/dp/B00COMJSR8",
    "garnier micellar cleansing water (125ml)": "https://www.amazon.in/dp/B01LZWDMZD",
    "bioderma sensibio h2o micellar water (250ml)": "https://www.nykaa.com/bioderma-sensibio-h2o-micellar-water/p/31767",
    
    # Serums
    "minimalist 10% niacinamide face serum (30ml)": "https://www.amazon.in/dp/B08GY59SH4",
    "minimalist 10% niacinamide serum": "https://www.amazon.in/dp/B08GY59SH4",
    "minimalist 2% salicylic acid serum (30ml)": "https://www.amazon.in/dp/B08L4S8F3Z",
    "minimalist 2% salicylic acid serum": "https://www.amazon.in/dp/B08L4S8F3Z",
    "minimalist 0.3% retinol serum (30ml)": "https://www.amazon.in/dp/B08GXWH3PJ",
    "minimalist retinol serum": "https://www.amazon.in/dp/B08GXWH3PJ",
    "plum 15% vitamin c serum (30ml)": "https://www.amazon.in/dp/B08B5K8V7K",
    "the ordinary niacinamide 10% + zinc 1% (30ml)": "https://www.nykaa.com/the-ordinary-niacinamide-10-percent-zinc-1-percent/p/459337",
    
    # Sunscreen
    "minimalist spf 50 sunscreen (50ml)": "https://www.amazon.in/dp/B08X6JYB9H",
    "minimalist spf 50 sunscreen": "https://www.amazon.in/dp/B08X6JYB9H",
    "neutrogena ultra sheer dry touch sunblock spf 50+ (30ml)": "https://www.amazon.in/dp/B073DSCT4V",
    "neutrogena ultra sheer sunblock": "https://www.amazon.in/dp/B073DSCT4V",
    "la shield fisico spf 50+ sunscreen (50g)": "https://www.amazon.in/dp/B07571HMBY",
    "re'equil ultra matte dry touch sunscreen spf 50 (50g)": "https://www.amazon.in/dp/B07VYFKV48",
    
    # Haircare - Shampoos
    "l'oreal paris 6 oil nourish shampoo (704ml)": "https://www.amazon.in/dp/B08B3WRRPK",
    "l'oreal 6 oil nourish shampoo": "https://www.amazon.in/dp/B08B3WRRPK",
    "tresemme keratin smooth shampoo (580ml)": "https://www.amazon.in/dp/B01NAPMM6N",
    "tresemme keratin smooth shampoo": "https://www.amazon.in/dp/B01NAPMM6N",
    "pantene advanced hairfall solution shampoo (650ml)": "https://www.amazon.in/dp/B08BR25C19",
    "pantene hairfall solution shampoo": "https://www.amazon.in/dp/B08BR25C19",
    "wow skin science onion black seed oil shampoo (300ml)": "https://www.amazon.in/dp/B07V3J8KS4",
    "wow onion shampoo": "https://www.amazon.in/dp/B07V3J8KS4",
    "mamaearth onion hair fall shampoo (250ml)": "https://www.amazon.in/dp/B07WHLLMP8",
    "dove intense repair shampoo (650ml)": "https://www.amazon.in/dp/B084KZVFMV",
    
    # Haircare - Conditioners
    "tresemme keratin smooth conditioner (580ml)": "https://www.amazon.in/dp/B01NAQ3TH3",
    "l'oreal paris 6 oil nourish conditioner (704ml)": "https://www.amazon.in/dp/B08B3XT5QK",
    
    # Makeup - Face
    "maybelline fit me foundation": "https://www.nykaa.com/maybelline-new-york-fit-me-matte-poreless-foundation/p/5433",
    "lakme 9 to 5 primer + matte powder foundation": "https://www.nykaa.com/lakme-9-to-5-primer-matte-powder-foundation-compact/p/6069",
    "sugar cosmetics contour de force mini blush (01 pink pinnacle)": "https://www.nykaa.com/sugar-cosmetics-contour-de-force-mini-blush-01-pink-pinnacle/p/8075686",
    
    # Fashion - Basics
    "allen solly men's regular fit shirt": "https://www.amazon.in/dp/B0BY4HTPQ1",
    "allen solly men's shirt": "https://www.amazon.in/dp/B0BY4HTPQ1",
    "van heusen men's casual shirt": "https://www.amazon.in/dp/B0CPFH3B99",
    "van heusen casual shirt": "https://www.amazon.in/dp/B0CPFH3B99",
    "only women's regular fit top": "https://www.amazon.in/dp/B0CXV7HX8Y",
    "only women's top": "https://www.amazon.in/dp/B0CXV7HX8Y",
    "vero moda women's casual dress": "https://www.amazon.in/dp/B0B8MQWXNJ",
    "vero moda dress": "https://www.amazon.in/dp/B0B8MQWXNJ",
}

def _norm_name(name: str) -> str:
    s = (name or '').lower()
    s = re.sub(r"\s+", " ", re.sub(r"[^a-z0-9%+&'()\- ]", " ", s)).strip()
    return s

def _canonicalize_purchase_link(link: str) -> str:
    try:
        u = (link or '').strip()
        low = u.lower()
        if 'amazon.in' in low:
            m = re.search(r"/(?:dp|gp/product)/([A-Z0-9]{8,12})", u, re.IGNORECASE)
            if m:
                asin = m.group(1).upper()
                return f"https://www.amazon.in/dp/{asin}"
        # Strip query params for stability on other sites
        if '?' in u and ('nykaa.com' in low or 'flipkart.com' in low or 'myntra.com' in low):
            return u.split('?', 1)[0]
        return u
    except Exception:
        return link

def _is_link_live(url: str, timeout: float = 3.0) -> bool:
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
        }
        # Try HEAD first
        r = requests.head(url, timeout=timeout, allow_redirects=True, headers=headers)
        if 200 <= r.status_code < 400:
            return True
        # Some sites block HEAD; try a lightweight GET
        r = requests.get(url, timeout=timeout, allow_redirects=True, headers=headers, stream=True)
        return 200 <= r.status_code < 400
    except Exception:
        return False

# Replace the existing parsing block roughly with:

def parse_ai_response(ai_text: str, user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
    try:
        # try direct JSON parse first
        try:
            parsed_data = json.loads(ai_text)
        except json.JSONDecodeError:
            # try to extract JSON substring (common case: "text\n\n{...json...}")
            import re
            m = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', ai_text)
            if m:
                try:
                    parsed_data = json.loads(m.group(1))
                except json.JSONDecodeError:
                    # last resort: return raw_text flagged so callers can fallback safely
                    return {"_fallback": True, "_originalResponse": ai_text, "raw_text": ai_text}
            else:
                return {"_fallback": True, "_originalResponse": ai_text, "raw_text": ai_text}

        # validate structure (existing validate_response_structure)
        validated_data = validate_response_structure(parsed_data)
        if user_profile:
            validated_data = enrich_with_user_profile(user_profile, validated_data)
        return validated_data

    except Exception as e:
        logger.exception("Parser failure")
        return {"_fallback": True, "_originalResponse": ai_text, "error": str(e)}

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
        logger.warning(f"❌ Product '{validated['name']}' has price in dollars: {price} - rejecting")
        price = 'Price not available'
    validated['price'] = price
    
    # Arrays
    validated['ingredients'] = ensure_string_array(product.get('ingredients', []))
    validated['pros'] = ensure_string_array(product.get('pros', []))
    validated['cons'] = ensure_string_array(product.get('cons', []))
    
    # URLs - CRITICAL: Validate Indian domains only and ensure direct product pages (not search)
    purchase_link = product.get('purchaseLink', '')
    if not purchase_link or not purchase_link.startswith('http'):
        logger.warning(f"❌ Product '{validated['name']}' has invalid/missing link: '{purchase_link}' - rejecting")
        return None
    else:
        link = purchase_link.lower()
        is_indian_domain = any(d in link for d in ['amazon.in', 'nykaa.com', 'flipkart.com', 'myntra.com'])
        if not is_indian_domain:
            logger.warning(f"❌ Product '{validated['name']}' has non-Indian link: {purchase_link}")
            logger.warning(f"   ⚠️  TELL GEMINI TO USE: amazon.in, nykaa.com, flipkart.com, or myntra.com ONLY!")
            return None

        # Direct product page heuristics
        def is_direct_product(u: str) -> bool:
            if 'amazon.in' in u:
                # Require /dp/ or /gp/product/
                asin_match = re.search(r"/(dp|gp/product)/([A-Z0-9]{8,12})", u)
                if asin_match:
                    return True
                # Reject search or generic pages
                if '/s?' in u or '/s=' in u or '/k=' in u:
                    return False
                return False
            if 'nykaa.com' in u:
                return '/p/' in u
            if 'flipkart.com' in u:
                return '/p/' in u
            if 'myntra.com' in u:
                # Myntra product pages often contain numeric IDs
                return '/buy' in u or any(ch.isdigit() for ch in u.split('/'))
            return False

        if not is_direct_product(link):
            logger.warning(f"❌ Product '{validated['name']}' has non-direct product link (likely search page): {purchase_link}")
            logger.warning(f"   ⚠️  TELL GEMINI: Use direct product URLs like amazon.in/dp/ASIN or nykaa.com/product/p/ID")
            return None

    # Override with verified link if product name matches our registry
    original_link = purchase_link
    verified_link = VERIFIED_PRODUCTS.get(_norm_name(validated['name']))
    if verified_link:
        purchase_link = verified_link
        logger.info(f"✅ Using verified link for '{validated['name']}': {verified_link}")

    # Canonicalize and verify link is live
    purchase_link = _canonicalize_purchase_link(purchase_link)
    if not _is_link_live(purchase_link):
        logger.warning(f"❌ Product '{validated['name']}' link not accessible: {purchase_link}")
        logger.warning(f"   Original link: {original_link}")
        logger.warning(f"   ⚠️  Link might be broken, rate-limited, or region-restricted")
        return None
    else:
        logger.info(f"✅ Product '{validated['name']}' link verified: {purchase_link}")

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
    
    # Optional fields
    validated['applicationTips'] = product.get('applicationTips', 'Follow product instructions.')
    # Optional image and reason
    image = product.get('image')
    if isinstance(image, str) and image.startswith('http'):
        validated['image'] = image
    reason = product.get('reason')
    if isinstance(reason, str) and reason.strip():
        validated['reason'] = reason.strip()

    logger.info(f"✅ Product '{validated['name']}' validated successfully")
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

def enrich_with_user_profile(user_profile: Dict[str, Any], response: Dict[str, Any]) -> Dict[str, Any]:
    products = response.get('products', []) or []
    enriched = []
    for p in products:
        try:
            score, reason = compute_compatibility_and_reason(p, user_profile)
            p['compatibility'] = score
            if not isinstance(p.get('reason'), str) or not p.get('reason').strip():
                if reason:
                    p['reason'] = reason
        except Exception as e:
            logger.warning(f"Compatibility enrichment error: {e}")
        enriched.append(p)
    out = dict(response)
    out['products'] = enriched
    return out

def compute_compatibility_and_reason(product: Dict[str, Any], user: Dict[str, Any]) -> Tuple[int, str]:
    score = 50
    reasons = []

    category = str(product.get('category', '') or '').lower()
    price_str = str(product.get('price', '') or '')
    price_val = _parse_inr(price_str)

    user_skin = str(user.get('skinType', '') or '').lower()
    user_hair = str(user.get('hairType', '') or '').lower()
    user_gender = str(user.get('gender', '') or '').lower()
    skincare_budget = str(user.get('skincareBudget', '') or '').lower()
    fashion_budget = str(user.get('fashionBudget', '') or '').lower()

    ingredients = [str(i).lower() for i in (product.get('ingredients') or []) if i]
    preferred = [str(i).lower() for i in (user.get('preferredIngredients') or []) if i]
    avoided = [str(i).lower() for i in (user.get('avoidIngredients') or []) if i]
    allergens = [str(i).lower() for i in (user.get('allergens') or []) if i]

    # Budget fit
    if price_val is not None:
        p_label = _label_price(price_val, 'skincare' if 'skin' in category or 'care' in category else 'fashion')
        u_label = skincare_budget if ('skin' in category or 'care' in category) else fashion_budget or skincare_budget
        if u_label:
            delta = _budget_distance(p_label, u_label)
            if delta == 0:
                score += 25
                reasons.append('fits your budget')
            elif abs(delta) == 1:
                score += 10
            else:
                score -= 10

    # Preferred ingredients
    if ingredients and preferred:
        hits = [ing for ing in ingredients if any(p in ing for p in preferred)]
        if hits:
            score += min(20, 8 * len(hits))
            reasons.append(f"contains preferred ingredient: {hits[0]}")

    # Avoided ingredients
    if ingredients and avoided:
        hits = [ing for ing in ingredients if any(a in ing for a in avoided)]
        if hits:
            score -= min(50, 25 * len(hits))
            reasons.append('contains one of your avoided ingredients')
        else:
            reasons.append('free from your avoided ingredients')

    # Allergens
    if ingredients and allergens:
        hits = [ing for ing in ingredients if any(a in ing for a in allergens)]
        if hits:
            score -= 40

    # Hair/skin relevance
    if 'hair' in category:
        if user_hair and user_hair not in ['na', 'bald']:
            score += 5
            reasons.append(f"good for {user_hair} hair")
        else:
            score -= 10
    else:
        if user_skin:
            reasons.append(f"suits {user_skin} skin")

    # Gender soft match
    name_brand = (str(product.get('name', '') or '') + ' ' + str(product.get('brand', '') or '')).lower()
    if user_gender in ['male', 'female']:
        if ('men' in name_brand or "men's" in name_brand) and user_gender == 'male':
            score += 5
        elif ('women' in name_brand or "women's" in name_brand) and user_gender == 'female':
            score += 5

    score = max(0, min(100, int(round(score))))
    reason_text = ''
    if reasons:
        # Deduplicate and keep concise
        seen = set()
        deduped = []
        for r in reasons:
            if r and r not in seen:
                seen.add(r)
                deduped.append(r)
        reason_text = 'Recommended because it ' + ', '.join(deduped[:3]) + '.'
    return score, reason_text

def _parse_inr(price: str):
    try:
        s = price.replace('₹', '').replace(',', '').strip()
        digits = re.findall(r"\d+", s)
        if not digits:
            return None
        return int(''.join(digits))
    except Exception:
        return None

def _label_price(val: int, kind: str) -> str:
    if kind == 'fashion':
        if val <= 1000:
            return 'budget'
        if val <= 5000:
            return 'mid'
        if val <= 10000:
            return 'premium'
        return 'luxury'
    # skincare default
    if val <= 500:
        return 'budget'
    if val <= 1500:
        return 'mid'
    if val <= 3000:
        return 'premium'
    return 'luxury'

def _budget_distance(price_label: str, user_label: str) -> int:
    order = ['budget', 'mid', 'premium', 'luxury']
    try:
        return order.index(price_label) - order.index(user_label)
    except ValueError:
        return 0
