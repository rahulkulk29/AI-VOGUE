"""
Request validation utilities
"""

from typing import Dict, Any, Optional

def validate_request(data: Dict[str, Any]) -> Optional[str]:
    """
    Validate incoming request data
    
    Args:
        data: Request JSON data
        
    Returns:
        Error message if validation fails, None if valid
    """
    if not isinstance(data, dict):
        return "Request data must be a JSON object"
    
    # Check required fields
    if 'userQuery' not in data:
        return "userQuery is required"
    
    user_query = data['userQuery']
    if not isinstance(user_query, str) or not user_query.strip():
        return "userQuery must be a non-empty string"
    
    # Validate query length
    if len(user_query) > 1000:
        return "userQuery is too long (max 1000 characters)"
    
    # Validate user profile if provided
    user_profile = data.get('userProfile', {})
    if user_profile and not isinstance(user_profile, dict):
        return "userProfile must be an object"
    
    # Validate image data if provided
    image_data = data.get('imageData')
    if image_data is not None:
        if not isinstance(image_data, str):
            return "imageData must be a string (base64 encoded)"
        
        # Basic base64 validation
        if len(image_data) > 10 * 1024 * 1024:  # 10MB limit
            return "imageData is too large (max 10MB)"
    
    return None

def validate_user_profile(profile: Dict[str, Any]) -> Optional[str]:
    """
    Validate user profile data
    
    Args:
        profile: User profile dictionary
        
    Returns:
        Error message if validation fails, None if valid
    """
    if not isinstance(profile, dict):
        return "Profile must be an object"
    
    # Valid values for specific fields
    valid_skin_types = ['oily', 'dry', 'combination', 'normal', 'sensitive']
    valid_hair_types = ['straight', 'wavy', 'curly', 'coily']
    valid_budgets = ['budget', 'mid', 'premium', 'luxury']
    valid_age_ranges = ['teens', 'twenties', 'thirties', 'forties', 'fifties', 'sixties+']
    
    # Validate skin type
    skin_type = profile.get('skinType')
    if skin_type and skin_type not in valid_skin_types:
        return f"Invalid skinType. Must be one of: {', '.join(valid_skin_types)}"
    
    # Validate hair type
    hair_type = profile.get('hairType')
    if hair_type and hair_type not in valid_hair_types:
        return f"Invalid hairType. Must be one of: {', '.join(valid_hair_types)}"
    
    # Validate budgets
    skincare_budget = profile.get('skincareBudget')
    if skincare_budget and skincare_budget not in valid_budgets:
        return f"Invalid skincareBudget. Must be one of: {', '.join(valid_budgets)}"
    
    fashion_budget = profile.get('fashionBudget')
    if fashion_budget and fashion_budget not in valid_budgets:
        return f"Invalid fashionBudget. Must be one of: {', '.join(valid_budgets)}"
    
    # Validate age range
    age_range = profile.get('ageRange')
    if age_range and age_range not in valid_age_ranges:
        return f"Invalid ageRange. Must be one of: {', '.join(valid_age_ranges)}"
    
    # Validate arrays
    for field in ['allergens', 'preferredIngredients', 'avoidIngredients']:
        value = profile.get(field)
        if value is not None:
            if not isinstance(value, list):
                return f"{field} must be an array"
            if not all(isinstance(item, str) for item in value):
                return f"All items in {field} must be strings"
    
    return None
