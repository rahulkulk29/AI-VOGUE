"""
Live Web Scraper Service for Flipkart and Amazon
Fetches product data on-the-fly without storing in database
"""

import requests
from bs4 import BeautifulSoup
import time
import logging
from typing import List, Dict
from urllib.parse import quote
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Product:
    def __init__(self, name: str, price: float, image_url: str, product_link: str, 
                 discount: str = "0%", brand: str = ""):
        self.name = name
        self.price = price
        self.image_url = image_url
        self.product_link = product_link
        self.discount = discount
        self.brand = brand
    
    def to_dict(self):
        return {
            'name': self.name,
            'price': self.price,
            'image_url': self.image_url,
            'product_link': self.product_link,
            'discount': self.discount,
            'brand': self.brand
        }


class FlipkartScraper:
    """Scrape products from Flipkart"""
    
    BASE_URL = "https://www.flipkart.com"
    SEARCH_URL = "https://www.flipkart.com/search?q={query}"
    
    REQUEST_TIMEOUT = 15
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.flipkart.com/',
    }
    
    @staticmethod
    def scrape_products(search_query: str, limit: int = 12) -> List[Product]:
        """
        Scrape products from Flipkart based on search query
        
        Args:
            search_query: Product name/type to search (e.g., 'pants', 'shirts', 'shoes')
            limit: Maximum number of products to return
        
        Returns:
            List of Product objects
        """
        try:
            url = FlipkartScraper.SEARCH_URL.format(query=quote(search_query))
            # Attempt with retries
            response = None
            for attempt in range(3):
                try:
                    response = requests.get(url, headers=FlipkartScraper.HEADERS, timeout=FlipkartScraper.REQUEST_TIMEOUT)
                    response.raise_for_status()
                    break
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Flipkart request attempt {attempt+1} failed: {e}")
                    time.sleep(1 + attempt)
            if not response:
                raise requests.exceptions.RequestException('Flipkart request failed after retries')
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            products = []
            
            logger.info(f"Flipkart scrape URL: {url}")
            # Find all product containers (div with data-id attribute) — fallback to known container classes if none found
            product_containers = soup.find_all('div', {'data-id': True})
            if not product_containers:
                logger.info("Flipkart: No data-id containers found, trying fallback selectors...")
            if not product_containers:
                # fallback containers used commonly on Flipkart
                product_containers = soup.find_all('div', class_=re.compile(r'(_2kHMtA|_1AtVbE|_3liAhj|_4ddWXP)'))
            logger.info(f"Flipkart: Found {len(product_containers)} candidate containers")
            
            for container in product_containers[:limit]:
                try:
                    # Extract product link (fallback selector)
                    link_elem = container.find('a', href=True)
                    if not link_elem:
                        continue
                    
                    product_link = link_elem.get('href', '')
                    if not product_link.startswith('http'):
                        product_link = FlipkartScraper.BASE_URL + product_link
                    
                    # Extract image (try multiple attributes)
                    img_elem = container.find('img')
                    image_url = ''
                    if img_elem:
                        image_url = img_elem.get('data-src') or img_elem.get('src') or img_elem.get('data-image') or ''
                    
                    # Extract product title
                    product_name = ''
                    if link_elem:
                        product_name = link_elem.get('title') or link_elem.get_text(strip=True)
                    if not product_name:
                        # Check image alt
                        product_name = img_elem.get('alt') if img_elem and img_elem.get('alt') else ''
                    
                    # Extract brand
                    brand_elem = container.find('div', {'class': 'syl9yP'}) or container.find('span', {'class': re.compile(r'(_3WhJ9|_2WkVRV)')})
                    brand = brand_elem.get_text(strip=True) if brand_elem else 'Unknown'
                    
                    # Extract price — find first occurrence of Indian Rupee symbol in container text
                    price_text = '₹0'
                    try:
                        text = container.get_text(separator=' ', strip=True)
                        m = re.search(r'₹\s?([0-9,]+(?:\.[0-9]{1,2})?)', text)
                        if m:
                            price_text = m.group(0)
                    except Exception:
                        pass
                    # Clean price - remove currency symbol
                    price = float(re.sub(r'[^\d.]', '', price_text) or 0)
                    
                    # Extract discount - look for % off pattern
                    discount = '0% off'
                    try:
                        text = container.get_text(separator=' ', strip=True)
                        m = re.search(r'(\d{1,3}%\s?off)', text, re.IGNORECASE)
                        if m:
                            discount = m.group(0)
                    except Exception:
                        pass
                    
                    if product_name:
                        product = Product(
                            name=product_name[:80],  # Limit name length
                            price=price,
                            image_url=image_url,
                            product_link=product_link,
                            discount=discount,
                            brand=brand
                        )
                        products.append(product)
                
                except Exception as e:
                    logger.warning(f"Error parsing product container: {e}")
                    continue
            
            logger.info(f"Flipkart: Found {len(products)} products for '{search_query}'")
            return products
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Flipkart scraping error: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in Flipkart scraper: {e}")
            return []


class AmazonScraper:
    """Scrape products from Amazon"""
    
    BASE_URL = "https://www.amazon.in"
    SEARCH_URL = "https://www.amazon.in/s?k={query}"
    
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    @staticmethod
    def scrape_products(search_query: str, limit: int = 12) -> List[Product]:
        """
        Scrape products from Amazon based on search query
        
        Args:
            search_query: Product name/type to search (e.g., 'pants', 'shirts', 'shoes')
            limit: Maximum number of products to return
        
        Returns:
            List of Product objects
        """
        try:
            url = AmazonScraper.SEARCH_URL.format(query=quote(search_query))
            response = None
            for attempt in range(3):
                try:
                    response = requests.get(url, headers=AmazonScraper.HEADERS, timeout=AmazonScraper.REQUEST_TIMEOUT)
                    response.raise_for_status()
                    break
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Amazon request attempt {attempt+1} failed: {e}")
                    time.sleep(2 + attempt)
            if not response:
                raise requests.exceptions.RequestException('Amazon request failed after retries')
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            products = []
            logger.info(f"Amazon scrape URL: {url}")
            
            # Find all product containers
            product_containers = soup.find_all('div', {'data-component-type': 's-search-result'})
            logger.info(f"Amazon: Found {len(product_containers)} candidate containers")
            
            for container in product_containers[:limit]:
                try:
                    # Extract product link
                    link_elem = container.find('h2').find('a') if container.find('h2') else None
                    if not link_elem:
                        continue
                    
                    product_link = link_elem.get('href', '')
                    if not product_link.startswith('http'):
                        product_link = AmazonScraper.BASE_URL + product_link
                    
                    # Extract image (src or data-src)
                    img_elem = container.find('img')
                    image_url = ''
                    if img_elem:
                        image_url = img_elem.get('data-src') or img_elem.get('src') or ''
                    
                    # Extract product name
                    product_name = link_elem.get_text(strip=True) if link_elem else ''
                    
                    # Extract price - look for a-price-offscreen or a-price-whole
                    price_text = '₹0'
                    price_elem = container.find('span', {'class': 'a-offscreen'}) or container.find('span', {'class': 'a-price-whole'})
                    if price_elem:
                        price_text = price_elem.get_text(strip=True)
                    else:
                        # fallback: search for rupee symbol in text
                        try:
                            text = container.get_text(separator=' ', strip=True)
                            m = re.search(r'₹\s?([0-9,]+(?:\.[0-9]{1,2})?)', text)
                            if m:
                                price_text = m.group(0)
                        except Exception:
                            pass
                    price = float(re.sub(r'[^\d.]', '', price_text) or 0)
                    
                    # Extract rating (if available)
                    rating_elem = container.find('span', {'class': 'a-star-small'})
                    rating = rating_elem.get_text(strip=True) if rating_elem else ''
                    
                    if product_name:
                        product = Product(
                            name=product_name[:80],
                            price=price,
                            image_url=image_url,
                            product_link=product_link,
                            discount=rating,
                            brand='Amazon'
                        )
                        products.append(product)
                
                except Exception as e:
                    logger.warning(f"Error parsing Amazon product: {e}")
                    continue
            
            logger.info(f"Amazon: Found {len(products)} products for '{search_query}'")
            return products
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Amazon scraping error: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in Amazon scraper: {e}")
            return []


class ScraperService:
    """Main scraper service that combines Flipkart and Amazon"""
    
    # Simple cache: {search_key: (timestamp, products)}
    cache = {}
    CACHE_DURATION = 3600  # 1 hour
    
    @staticmethod
    def search_products(search_query: str, category: str = 'all', limit: int = 12) -> Dict:
        """
        Search for products across Flipkart and Amazon
        
        Args:
            search_query: Product name to search for
            category: Product category (pants/shirts/shoes)
            limit: Max products per platform
        
        Returns:
            Dictionary with products from both platforms
        """
        cache_key = f"{search_query}_{category}_{limit}"
        
        # Check cache
        if cache_key in ScraperService.cache:
            timestamp, cached_data = ScraperService.cache[cache_key]
            if time.time() - timestamp < ScraperService.CACHE_DURATION:
                logger.info(f"Returning cached results for '{search_query}'")
                return cached_data
        
        try:
            # Scrape from both platforms
            flipkart_products = FlipkartScraper.scrape_products(search_query, limit)
            time.sleep(1)  # Be respectful - add delay between requests
            amazon_products = AmazonScraper.scrape_products(search_query, limit)
            
            # Format response
            result = {
                'success': True,
                'query': search_query,
                'category': category,
                'flipkart': [p.to_dict() for p in flipkart_products],
                'amazon': [p.to_dict() for p in amazon_products],
                'total_count': len(flipkart_products) + len(amazon_products)
            }
            
            # Cache the result
            ScraperService.cache[cache_key] = (time.time(), result)
            
            return result
        
        except Exception as e:
            logger.error(f"Error in search_products: {e}")
            return {
                'success': False,
                'error': str(e),
                'query': search_query,
                'flipkart': [],
                'amazon': []
            }
