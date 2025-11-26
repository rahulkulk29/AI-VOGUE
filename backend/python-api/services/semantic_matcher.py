"""
Semantic Matcher using Sentence Transformers
Calculates similarity between user preferences and products
"""

from sentence_transformers import SentenceTransformer, util
import logging

logger = logging.getLogger(__name__)

class SemanticMatcher:
    def __init__(self):
        """Initialize sentence transformer model"""
        # Use lightweight but accurate model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("✅ Semantic matcher initialized")
    
    def calculate_match_score(self, user_preferences, product):
        """
        Calculate semantic similarity between user preferences and product
        
        Args:
            user_preferences: Dict of user preferences
            product: Dict with product information
            
        Returns:
            tuple: (match_percentage, match_reasons)
        """
        try:
            # Build user preference text
            pref_text = self._build_preference_text(user_preferences)
            
            # Build product description text
            product_text = f"{product.get('name', '')} {product.get('description', '')} {product.get('brand', '')}"
            
            # Encode texts
            pref_embedding = self.model.encode(pref_text, convert_to_tensor=True)
            product_embedding = self.model.encode(product_text, convert_to_tensor=True)
            
            # Calculate cosine similarity
            similarity = util.cos_sim(pref_embedding, product_embedding).item()
            
            # Convert to percentage (0-100)
            match_percentage = int(similarity * 100)
            
            # Generate match reasons
            match_reasons = self._explain_match(user_preferences, product, similarity)
            
            logger.info(f"Match score: {match_percentage}% for {product.get('name', 'product')}")
            
            return match_percentage, match_reasons
            
        except Exception as e:
            logger.error(f"Semantic matching failed: {str(e)}")
            return 70, ["Good match for your needs"]  # Default fallback
    
    def _build_preference_text(self, preferences):
        """Build text representation of user preferences"""
        parts = []
        
        # Skin preferences
        if preferences.get('skinType'):
            parts.append(f"{preferences['skinType']} skin")
        if preferences.get('skinConcern'):
            parts.append(f"concerned about {preferences['skinConcern']}")
        
        # Hair preferences
        if preferences.get('hairType'):
            parts.append(f"{preferences['hairType']} hair")
        if preferences.get('hairConcern'):
            parts.append(f"hair concern: {preferences['hairConcern']}")
        
        # Style preferences
        if preferences.get('stylePreference'):
            parts.append(f"{preferences['stylePreference']} style")
        
        # Budget
        if preferences.get('skincareBudget'):
            parts.append(f"budget: {preferences['skincareBudget']}")
        
        return " ".join(parts)
    
    def _explain_match(self, preferences, product, similarity):
        """Generate human-readable match reasons"""
        reasons = []
        
        product_name_lower = product.get('name', '').lower()
        product_desc_lower = product.get('description', '').lower()
        
        # Check skin type match
        skin_type = preferences.get('skinType', '').lower()
        if skin_type and skin_type in product_desc_lower:
            reasons.append(f"Formulated for {skin_type} skin")
        
        # Check concern match
        concern = preferences.get('skinConcern', '').lower()
        if concern and concern in product_desc_lower:
            reasons.append(f"Targets {concern}")
        
        # Check hair type match
        hair_type = preferences.get('hairType', '').lower()
        if hair_type and hair_type in product_desc_lower:
            reasons.append(f"Designed for {hair_type} hair")
        
        # If no specific matches, use generic based on similarity
        if not reasons:
            if similarity > 0.7:
                reasons.append("Highly compatible with your profile")
            elif similarity > 0.5:
                reasons.append("Good match for your needs")
            else:
                reasons.append("May suit your requirements")
        
        return reasons[:2]  # Return top 2 reasons
