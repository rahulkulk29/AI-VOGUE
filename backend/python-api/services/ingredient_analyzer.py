"""
Ingredient Analyzer for Skincare and Haircare Products
Analyzes ingredients against user preferences and known beneficial/harmful ingredients
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class IngredientAnalyzer:
    def __init__(self):
        """Load ingredient database"""
        db_path = Path(__file__).parent.parent / 'data' / 'ingredients_database.json'
        
        try:
            with open(db_path, 'r') as f:
                self.ingredients_db = json.load(f)
            logger.info("✅ Ingredient analyzer initialized with database")
        except Exception as e:
            logger.error(f"Failed to load ingredient database: {str(e)}")
            self.ingredients_db = {'beneficial': {}, 'harmful': {}, 'allergens': {'common': []}}
    
    def analyze_product(self, ingredients_list, user_profile):
        """
        Analyze product ingredients against user profile
        
        Args:
            ingredients_list: List of ingredient names
            user_profile: User preferences dict
            
        Returns:
            dict: Analysis with good effects, bad effects, allergen warnings, score
        """
        if not ingredients_list:
            return {
                'good_effects': [],
                'bad_effects': [],
                'allergen_warnings': [],
                'ingredient_score': 50  # Neutral score when no ingredients
            }
        
        good_effects = []
        bad_effects = []
        allergen_warnings = []
        
        # Normalize ingredients to lowercase
        ingredients_lower = [ing.lower().strip() for ing in ingredients_list]
        
        # Check beneficial ingredients
        for ingredient in ingredients_lower:
            if ingredient in self.ingredients_db['beneficial']:
                effect = self.ingredients_db['beneficial'][ingredient]
                
                # Check if it matches user's skin/hair type
                if self._matches_user_profile(effect, user_profile):
                    good_effects.append(effect['benefit'])
        
        # Check harmful ingredients
        for ingredient in ingredients_lower:
            if ingredient in self.ingredients_db['harmful']:
                effect = self.ingredients_db['harmful'][ingredient]
                
                # Check if user should avoid it
                if self._should_avoid(effect, user_profile):
                    bad_effects.append(effect['concern'])
        
        # Check allergens
        user_allergens = user_profile.get('allergens', [])
        if isinstance(user_allergens, str):
            try:
                user_allergens = json.loads(user_allergens)
            except:
                user_allergens = []
        
        for allergen in user_allergens:
            allergen_lower = allergen.lower().strip()
            if any(allergen_lower in ing for ing in ingredients_lower):
                allergen_warnings.append(f"Contains {allergen}")
        
        # Calculate ingredient score (0-100)
        score = self._calculate_ingredient_score(
            len(good_effects),
            len(bad_effects),
            len(allergen_warnings)
        )
        
        return {
            'good_effects': good_effects[:2],  # Top 2 good effects
            'bad_effects': bad_effects[:2],    # Top 2 bad effects
            'allergen_warnings': allergen_warnings,
            'ingredient_score': score
        }
    
    def _matches_user_profile(self, effect, user_profile):
        """Check if ingredient effect matches user's needs"""
        # Check skin type match
        good_for = effect.get('good_for', [])
        skin_type = user_profile.get('skinType', '').lower()
        if skin_type in good_for or 'all' in good_for:
            return True
        
        # Check concerns match
        concerns = effect.get('concerns', [])
        user_concern = user_profile.get('skinConcern', '').lower()
        if user_concern in concerns:
            return True
        
        # Check hair type match
        good_for_hair = effect.get('good_for_hair', [])
        hair_type = user_profile.get('hairType', '').lower()
        if hair_type in good_for_hair:
            return True
        
        # Check hair concerns
        hair_concerns = effect.get('hair_concerns', [])
        user_hair_concern = user_profile.get('hairConcern', '').lower()
        if user_hair_concern in hair_concerns:
            return True
        
        return False
    
    def _should_avoid(self, effect, user_profile):
        """Check if user should avoid this ingredient"""
        avoid_for = effect.get('avoid_for', [])
        
        # Check skin type
        skin_type = user_profile.get('skinType', '').lower()
        if skin_type in avoid_for or 'all' in avoid_for:
            return True
        
        # Check hair type
        avoid_for_hair = effect.get('avoid_for_hair', [])
        hair_type = user_profile.get('hairType', '').lower()
        if hair_type in avoid_for_hair:
            return True
        
        return False
    
    def _calculate_ingredient_score(self, good_count, bad_count, allergen_count):
        """
        Calculate overall ingredient score
        
        Args:
            good_count: Number of beneficial ingredients
            bad_count: Number of harmful ingredients
            allergen_count: Number of allergens detected
            
        Returns:
            int: Score from 0-100
        """
        # Start with base score
        score = 50
        
        # Add points for good ingredients (up to +40)
        score += min(good_count * 10, 40)
        
        # Subtract points for bad ingredients (up to -30)
        score -= min(bad_count * 10, 30)
        
        # Heavy penalty for allergens (up to -40)
        score -= min(allergen_count * 20, 40)
        
        # Clamp to 0-100
        return max(0, min(100, score))
