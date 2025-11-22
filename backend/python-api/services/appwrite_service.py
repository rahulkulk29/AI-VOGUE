"""
Appwrite Service for Prism AI 2.0
Handles user preferences storage and retrieval
"""

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class AppwriteService:
    def __init__(self):
        """Initialize Appwrite client"""
        self.client = Client()
        self.client.set_endpoint('https://cloud.appwrite.io/v1')
        self.client.set_project('68dd18860033ab7dffac')
        self.client.set_key(os.getenv('APPWRITE_API_KEY', ''))  # Set via env
        
        self.databases = Databases(self.client)
        self.database_id = '68dd21f50029362dfb7a'
        self.collection_id = 'user_preferences'
        
        logger.info("✅ Appwrite service initialized")
    
    def get_user_preferences(self, user_id):
        """
        Fetch user preferences from Appwrite
        
        Args:
            user_id: User's unique identifier
            
        Returns:
            dict: User preferences or None if not found
        """
        try:
            document = self.databases.get_document(
                database_id=self.database_id,
                collection_id=self.collection_id,
                document_id=user_id
            )
            
            logger.info(f"✅ Retrieved preferences for user: {user_id}")
            return document
            
        except Exception as e:
            logger.warning(f"No preferences found for user {user_id}: {str(e)}")
            return None
    
    def save_user_preferences(self, user_id, preferences):
        """
        Save or update user preferences in Appwrite
        
        Args:
            user_id: User's unique identifier
            preferences: Dictionary of user preferences
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Prepare data matching Appwrite schema
            data = {
                'userId': user_id,
                'skinType': preferences.get('skinType', ''),
                'skinConcern': preferences.get('skinConcern', ''),
                'hairType': preferences.get('hairType'),
                'hairTexture': preferences.get('hairTexture'),
                'hairConcern': preferences.get('hairConcern'),
                'stylePreference': preferences.get('stylePreference', ''),
                'skincareBudget': preferences.get('skincareBudget', ''),
                'fashionBudget': preferences.get('fashionBudget', ''),
                'shoppingFrequency': preferences.get('shoppingFrequency', ''),
                'occasions': preferences.get('occasions', ''),
                'ageRange': preferences.get('ageRange'),
                'allergens': str(preferences.get('allergens', [])),
                'preferredIngredients': str(preferences.get('preferredIngredients', [])),
                'avoidIngredients': str(preferences.get('avoidIngredients', [])),
                'updatedAt': datetime.now().isoformat()
            }
            
            # Try to update existing document
            try:
                self.databases.update_document(
                    database_id=self.database_id,
                    collection_id=self.collection_id,
                    document_id=user_id,
                    data=data
                )
                logger.info(f"✅ Updated preferences for user: {user_id}")
                
            except:
                # If update fails, create new document
                self.databases.create_document(
                    database_id=self.database_id,
                    collection_id=self.collection_id,
                    document_id=user_id,
                    data=data
                )
                logger.info(f"✅ Created preferences for user: {user_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to save preferences: {str(e)}")
            return False
    
    def delete_user_preferences(self, user_id):
        """
        Delete user preferences
        
        Args:
            user_id: User's unique identifier
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            self.databases.delete_document(
                database_id=self.database_id,
                collection_id=self.collection_id,
                document_id=user_id
            )
            logger.info(f"✅ Deleted preferences for user: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete preferences: {str(e)}")
            return False
    
    def get_category_preferences(self, user_id, category):
        """
        Get preferences filtered by category (skincare, haircare, fashion)
        
        Args:
            user_id: User's unique identifier
            category: 'skincare', 'haircare', or 'fashion'
            
        Returns:
            dict: Filtered preferences
        """
        all_prefs = self.get_user_preferences(user_id)
        if not all_prefs:
            return {}
        
        if category == 'skincare':
            return {
                'skinType': all_prefs.get('skinType'),
                'skinConcern': all_prefs.get('skinConcern'),
                'skincareBudget': all_prefs.get('skincareBudget'),
                'allergens': all_prefs.get('allergens', []),
                'preferredIngredients': all_prefs.get('preferredIngredients', []),
                'avoidIngredients': all_prefs.get('avoidIngredients', [])
            }
        
        elif category == 'haircare':
            return {
                'hairType': all_prefs.get('hairType'),
                'hairTexture': all_prefs.get('hairTexture'),
                'hairConcern': all_prefs.get('hairConcern'),
                'allergens': all_prefs.get('allergens', []),
                'preferredIngredients': all_prefs.get('preferredIngredients', []),
                'avoidIngredients': all_prefs.get('avoidIngredients', [])
            }
        
        elif category == 'fashion':
            return {
                'stylePreference': all_prefs.get('stylePreference'),
                'fashionBudget': all_prefs.get('fashionBudget'),
                'occasions': all_prefs.get('occasions'),
                'shoppingFrequency': all_prefs.get('shoppingFrequency')
            }
        
        return all_prefs
