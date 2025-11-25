"""
Product Scraper Service
Uses Google search to find real product pages
"""

import requests
from bs4 import BeautifulSoup
import logging
import urllib.parse
import re

logger = logging.getLogger(__name__)

class ProductScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    
    def google_search_product(self, product_name, brand=None):
        """
        Use Google search to find product on Nykaa or Amazon
        """
        try:
            # Build search query targeting specific sites
            if brand:
                query = f"{brand} {product_name} site:nykaa.com OR site:amazon.in"
            else:
                query = f"{product_name} site:nykaa.com OR site:amazon.in"
            
            encoded_query = urllib.parse.quote(query)
            google_url = f"https://www.google.com/search?q={encoded_query}"
            
            logger.info(f"Google searching for: {query}")
            
            response = requests.get(google_url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find all search result links
                links = soup.find_all('a', href=True)
                
                for link in links:
                    href = link.get('href', '')
                    
                    # Extract actual URL from Google's redirect
                    if '/url?q=' in href:
                        actual_url = href.split('/url?q=')[1].split('&')[0]
                        actual_url = urllib.parse.unquote(actual_url)
                        
                        # Check if it's a Nykaa product page
                        if 'nykaa.com' in actual_url and '/p/' in actual_url:
                            logger.info(f"✅ Found Nykaa product: {actual_url}")
                            return {
                                'url': actual_url,
                                'price': None,
                                'source': 'Nykaa'
                            }
                        
                        # Check if it's an Amazon product page
                        if 'amazon.in' in actual_url and '/dp/' in actual_url:
                            logger.info(f"✅ Found Amazon product: {actual_url}")
                            return {
                                'url': actual_url,
                                'price': None,
                                'source': 'Amazon India'
                            }
                
                logger.warning(f"No product pages found in Google search")
                return None
                
        except Exception as e:
            logger.error(f"Google search failed: {str(e)}")
            return None
    
    def build_generic_search_url(self, product_name, brand=None):
        """
        Build a generic search URL for Nykaa as fallback
        """
        search_query = f"{brand} {product_name}" if brand else product_name
        encoded_query = urllib.parse.quote(search_query)
        
        # Return a Nykaa search URL
        return f"https://www.nykaa.com/search/result/?q={encoded_query}"
    
    def find_product(self, product_name, brand=None):
        """
        Find product using Google search
        """
        logger.info(f"Searching for product: {product_name} (Brand: {brand})")
        
        # Try Google search first
        google_result = self.google_search_product(product_name, brand)
        if google_result:
            return google_result
        
        # Fallback: construct a direct Nykaa/Amazon product URL pattern
        # This is a heuristic approach based on common URL patterns
        url = self.construct_product_url(product_name, brand)
        if url:
            return {
                'url': url,
                'price': None,
                'source': 'Nykaa' if 'nykaa' in url else 'Amazon'
            }
        
        # Last resort: return search page
        logger.warning(f"Could not find specific product page for: {product_name}")
        search_url = self.build_generic_search_url(product_name, brand)
        
        return {
            'url': search_url,
            'price': None,
            'source': 'Search Results'
        }
    
    def construct_product_url(self, product_name, brand=None):
        """
        Attempt to construct a Nykaa URL based on common patterns
        """
        try:
            # Nykaa URL pattern: brand-product-name-variant/p/SKU
            # Example: minimalist-10-vitamin-b5-gel-face-moisturizer/p/709739
            
            full_name = f"{brand} {product_name}" if brand else product_name
            
            # Convert to URL slug
            slug = full_name.lower()
            slug = re.sub(r'[^a-z0-9\s-]', '', slug)  # Remove special chars
            slug = re.sub(r'\s+', '-', slug)  # Replace spaces with hyphens
            slug = re.sub(r'-+', '-', slug)  # Remove multiple hyphens
            
            # Common Nykaa product SKUs for popular brands (heuristic)
            # This is a simplified approach - in production you'd need a database
            known_products = {
                'minimalist-10-vitamin-b5-gel': 'minimalist-10-vitamin-b5-gel-face-moisturizer/p/709739',
                'minimalist-vitamin-c': 'minimalist-10-vitamin-c-face-serum/p/1310167',
                'cetaphil-gentle': 'cetaphil-gentle-skin-cleanser/p/12695',
                'plum-green-tea': 'plum-green-tea-renewed-clarity-night-gel/p/134447',
                'dot-key-vitamin-c': 'dot-key-vitamin-c-e-super-bright-serum/p/1218699'
            }
            
            # Check if we have a known pattern
            for pattern, url_path in known_products.items():
                if pattern in slug:
                    logger.info(f"✅ Matched known product pattern: {pattern}")
                    return f"https://www.nykaa.com/{url_path}"
            
            # If no match, return None to fall back to search
            return None
            
        except Exception as e:
            logger.error(f"Error constructing URL: {str(e)}")
            return None

