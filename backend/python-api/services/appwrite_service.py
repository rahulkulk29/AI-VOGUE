<<<<<<< HEAD
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
=======
"""
Appwrite Service for Python Backend
Handles all Appwrite database operations for storing scraped products
"""

import requests
import json
import logging
import os
from datetime import datetime
from typing import List, Dict, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AppwriteService:
    """Service to interact with Appwrite database"""
    
    def __init__(self):
        # Appwrite Configuration
        self.endpoint = "https://nyc.cloud.appwrite.io/v1"
        self.project_id = "68dd18860033ab7dffac"
        self.database_id = "68dd21f50029362dfb7a"
        self.collection_id = "voguevision"
    # Read API key from environment variables (set outside the project in production)
    self.api_key = os.getenv('APPWRITE_API_KEY', 'YOUR_APPWRITE_API_KEY')
        if self.api_key == 'YOUR_APPWRITE_API_KEY':
            logger.warning('APPWRITE_API_KEY is not set. Appwrite operations will fail if not configured.')
        
        self.headers = {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': self.project_id,
            'X-Appwrite-Key': self.api_key
        }
    
    def save_product(self, product_data: Dict) -> Optional[Dict]:
        """
        Save a single product to Appwrite database
        
        Args:
            product_data: Dictionary with product information
                {
                    'name': str,
                    'price': float,
                    'image_url': str,
                    'product_link': str,
                    'discount': str,
                    'brand': str,
                    'platform': str,  # 'flipkart' or 'amazon'
                    'category': str    # 'pants', 'shirts', 'shoes'
                }
        
        Returns:
            Created document or None if failed
        """
        try:
            url = f"{self.endpoint}/databases/{self.database_id}/collections/{self.collection_id}/documents"
            
            payload = {
                "documentId": "unique()",
                "data": {
                    "name": product_data.get('name', ''),
                    "price": float(product_data.get('price', 0)),
                    "image_url": product_data.get('image_url', ''),
                    "product_link": product_data.get('product_link', ''),
                    "discount": product_data.get('discount', ''),
                    "brand": product_data.get('brand', ''),
                    "platform": product_data.get('platform', 'flipkart'),
                    "category": product_data.get('category', ''),
                    "searchQuery": product_data.get('search_query', ''),
                    "addedAt": datetime.utcnow().isoformat() + 'Z'
                }
            }
            
            response = requests.post(url, json=payload, headers=self.headers, timeout=10)
            
            if response.status_code in [201, 200]:
                logger.info(f"Product saved: {product_data.get('name')}")
                return response.json()
            else:
                logger.error(f"Failed to save product: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error saving product: {str(e)}")
            return None
    
    def save_products(self, products: List[Dict], category: str, search_query: str) -> List[Dict]:
        """
        Save multiple products to database
        
        Args:
            products: List of product dictionaries
            category: Product category (pants, shirts, shoes)
            search_query: Search query used
        
        Returns:
            List of saved products
        """
        saved_products = []
        
        for product in products:
            product['category'] = category
            product['search_query'] = search_query
            saved = self.save_product(product)
            if saved:
                saved_products.append(saved)
        
        logger.info(f"Saved {len(saved_products)} out of {len(products)} products")
        return saved_products
    
    def get_products_by_category(self, category: str, limit: int = 12) -> List[Dict]:
        """
        Retrieve products by category
        
        Args:
            category: Product category
            limit: Number of products to retrieve
        
        Returns:
            List of products
        """
        try:
            url = f"{self.endpoint}/databases/{self.database_id}/collections/{self.collection_id}/documents"
            
            # Query: category equals the specified category
            params = [
                ('queries[]', f'equal("category", "{category}")'),
                ('queries[]', f'limit({limit})'),
                ('queries[]', 'orderDesc("$createdAt")')
            ]
            
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Retrieved {len(data.get('documents', []))} products for category: {category}")
                return data.get('documents', [])
            else:
                logger.error(f"Failed to get products: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error retrieving products: {str(e)}")
            return []
    
    def search_products(self, search_query: str, category: str, limit: int = 12) -> List[Dict]:
        """
        Search products by query and category
        
        Args:
            search_query: Search text
            category: Product category
            limit: Number of results
        
        Returns:
            List of matching products
        """
        try:
            url = f"{self.endpoint}/databases/{self.database_id}/collections/{self.collection_id}/documents"
            
            params = [
                ('queries[]', f'equal("category", "{category}" )'),
                ('queries[]', f'search("name", "{search_query}" )'),
                ('queries[]', f'limit({limit})'),
                ('queries[]', 'orderDesc("$createdAt")')
            ]
            
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Found {len(data.get('documents', []))} products matching: {search_query}")
                return data.get('documents', [])
            else:
                logger.error(f"Search failed: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching products: {str(e)}")
            return []
    
    def get_all_products(self, limit: int = 100) -> List[Dict]:
        """
        Get all products from database
        
        Args:
            limit: Maximum number of products to retrieve
        
        Returns:
            List of all products
        """
        try:
            url = f"{self.endpoint}/databases/{self.database_id}/collections/{self.collection_id}/documents"
            
            params = [
                ('queries[]', f'limit({limit})'),
                ('queries[]', 'orderDesc("$createdAt")')
            ]
            
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Retrieved total {len(data.get('documents', []))} products")
                return data.get('documents', [])
            else:
                logger.error(f"Failed to get all products: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error retrieving all products: {str(e)}")
            return []
    
    def delete_old_products(self, hours_old: int = 24) -> int:
        """
        Delete products older than specified hours
        
        Args:
            hours_old: Delete products older than this many hours
        
        Returns:
            Number of deleted products
        """
        try:
            url = f"{self.endpoint}/databases/{self.database_id}/collections/{self.collection_id}/documents"
            
            # Get old products
            from datetime import timedelta
            cutoff_time = (datetime.utcnow() - timedelta(hours=hours_old)).isoformat() + 'Z'
            
            params = {
                'queries': [f'lessThan("addedAt", "{cutoff_time}")', 'limit(100)']
            }
            
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code == 200:
                old_products = response.json().get('documents', [])
                deleted_count = 0
                
                for product in old_products:
                    try:
                        delete_url = f"{self.endpoint}/databases/{self.database_id}/collections/{self.collection_id}/documents/{product['$id']}"
                        delete_response = requests.delete(delete_url, headers=self.headers, timeout=10)
                        
                        if delete_response.status_code == 204:
                            deleted_count += 1
                    except Exception as e:
                        logger.error(f"Error deleting product {product.get('$id')}: {str(e)}")
                
                logger.info(f"Deleted {deleted_count} old products")
                return deleted_count
            else:
                logger.error(f"Failed to get old products: {response.status_code}")
                return 0
                
        except Exception as e:
            logger.error(f"Error deleting old products: {str(e)}")
            return 0


# Initialize Appwrite service
appwrite_service = AppwriteService()
>>>>>>> rahul
