"""
AI VOGUE - Python Flask Backend
Simple, fast, and secure backend for Prism AI recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
import time

# Import our services
from services.gemini_service import GeminiService
from services.scraper_service import ScraperService
from services.appwrite_service import appwrite_service
from utils.validators import validate_request
from utils.response_parser import parse_ai_response

# Environment variables should be set in the runtime environment (PowerShell, Bash, or CI/CD)
# We do not load .env files in the app to avoid committed secrets and to keep behavior consistent across environments.

# Initialize Flask app
app = Flask(__name__)

# Configure CORS - Allow all origins for development
cors_origins = [
    'http://localhost:8000',
    'http://127.0.0.1:8000', 
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'file://',  # For local HTML files
    '*'  # Allow all origins for development
]
CORS(app, origins=cors_origins, methods=['GET', 'POST', 'OPTIONS'], allow_headers=['Content-Type'])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
gemini_service = GeminiService()

# Sample products fallback
SAMPLE_PRODUCTS = [
    {
        'name': "Blue Denim Jeans",
        'price': 1299.00,
        'image_url': 'https://via.placeholder.com/400x600?text=Blue+Jeans',
        'product_link': 'https://example.com/blue-jeans',
        'discount': '25% off',
        'brand': 'Lee',
        'platform': 'flipkart'
    },
    {
        'name': "Casual Cotton Trousers",
        'price': 899.00,
        'image_url': 'https://via.placeholder.com/400x600?text=Cotton+Trousers',
        'product_link': 'https://example.com/cotton-trousers',
        'discount': '10% off',
        'brand': 'Van Heusen',
        'platform': 'amazon'
    },
    {
        'name': "Formal Black Pants",
        'price': 1599.00,
        'image_url': 'https://via.placeholder.com/400x600?text=Formal+Pants',
        'product_link': 'https://example.com/formal-pants',
        'discount': '30% off',
        'brand': 'Arrow',
        'platform': 'flipkart'
    },
    {
        'name': "White Cotton Shirt",
        'price': 699.00,
        'image_url': 'https://via.placeholder.com/400x600?text=White+Shirt',
        'product_link': 'https://example.com/white-shirt',
        'discount': '15% off',
        'brand': 'Raymonds',
        'platform': 'amazon'
    },
    {
        'name': "Blue Casual Shirt",
        'price': 549.00,
        'image_url': 'https://via.placeholder.com/400x600?text=Blue+Shirt',
        'product_link': 'https://example.com/blue-shirt',
        'discount': '5% off',
        'brand': 'Wrangler',
        'platform': 'flipkart'
    },
    {
        'name': "Black Formal Shoes",
        'price': 2499.00,
        'image_url': 'https://via.placeholder.com/400x600?text=Black+Shoes',
        'product_link': 'https://example.com/black-shoes',
        'discount': '20% off',
        'brand': 'Bata',
        'platform': 'amazon'
    }
]

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'AI VOGUE Python Backend',
        'version': '1.0.0'
    })

@app.route('/api/recommend', methods=['POST', 'OPTIONS'])
def get_recommendations():
    """
    Main endpoint for AI recommendations
    Replaces the Appwrite Function with direct Python implementation
    """
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    start_time = time.time()
    
    try:
        logger.info(f"Received request from: {request.origin}")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        # Get request data
        data = request.get_json()
        logger.info(f"Request data keys: {list(data.keys()) if data else 'None'}")
        
        if not data:
            logger.error("No JSON data provided")
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        # Validate request
        validation_error = validate_request(data)
        if validation_error:
            return jsonify({
                'success': False,
                'error': validation_error
            }), 400
        
        # Extract data
        user_query = data.get('userQuery')
        user_profile = data.get('userProfile', {})
        image_data = data.get('imageData')
        
        logger.info(f"Processing recommendation request: {user_query[:50]}...")
        
        # Call Gemini AI service
        ai_response = gemini_service.get_recommendations(
            user_query=user_query,
            user_profile=user_profile,
            image_data=image_data
        )

        # If AI failed, return a structured fallback instead of 500
        if not ai_response['success']:
            processing_time = round(time.time() - start_time, 2)
            fallback = {
                'generalAdvice': 'The AI is currently unavailable. Here are some general recommendations based on your profile while we reconnect.',
                'products': [],
                'additionalTips': [
                    'Try again in a few moments',
                    'Keep your routine simple and consistent',
                    'Patch test new products before full use'
                ]
            }
            return jsonify({
                'success': True,
                'data': fallback,
                'fallback': True,
                'backendError': ai_response.get('error'),
                'backendDetails': ai_response.get('details'),
                'modelErrors': ai_response.get('errors'),
                'processingTime': f"{processing_time}s",
                'timestamp': datetime.now().isoformat()
            })

        # Parse and format response
        parsed_response = parse_ai_response(ai_response['data'])

        processing_time = round(time.time() - start_time, 2)

        return jsonify({
            'success': True,
            'data': parsed_response,
            'processingTime': f"{processing_time}s",
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in get_recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e) if app.debug else None
        }), 500

@app.route('/api/test', methods=['POST'])
def test_endpoint():
    """Test endpoint for debugging"""
    try:
        data = request.get_json()
        return jsonify({
            'success': True,
            'message': 'Test endpoint working',
            'received_data': data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ====== PRODUCT SCRAPER ENDPOINTS ======

@app.route('/api/scrape/search', methods=['POST', 'GET'])
def scrape_products():
    """
    Search for products from Flipkart and Amazon and save to Appwrite database
    
    Request Parameters:
    - query: Product search term (e.g., 'men jeans', 'casual shirts')
    - category: Product category ('pants', 'shirts', 'shoes')
    - limit: Max products per platform (default: 12)
    
    Response:
    {
        'success': bool,
        'query': str,
        'category': str,
        'flipkart': [ { name, price, image_url, product_link, discount, brand } ],
        'amazon': [ { name, price, image_url, product_link, discount, brand } ],
        'total_count': int,
        'saved_to_db': bool,
        'saved_count': int
    }
    """
    try:
        # Get parameters from query or JSON
        if request.method == 'POST':
            data = request.get_json() or {}
            search_query = data.get('query', '').strip()
            category = data.get('category', 'all').lower()
            limit = data.get('limit', 12)
        else:  # GET
            search_query = request.args.get('query', '').strip()
            category = request.args.get('category', 'all').lower()
            limit = request.args.get('limit', 12, type=int)
        
        # Validate inputs
        if not search_query:
            return jsonify({
                'success': False,
                'error': 'Query parameter is required',
                'example': '/api/scrape/search?query=mens+jeans&category=pants'
            }), 400
        
        if limit < 1 or limit > 50:
            limit = 12
        
        logger.info(f"Scrape request: query='{search_query}', category='{category}', limit={limit}")
        
        # Call scraper service
        result = ScraperService.search_products(
            search_query=search_query,
            category=category,
            limit=limit
        )
        
    # Save scraped products to Appwrite database (if any)
        saved_count = 0
        try:
            all_products = []
            
            # Combine Flipkart and Amazon products
            if 'flipkart' in result and result['flipkart']:
                for product in result['flipkart']:
                    product['platform'] = 'flipkart'
                    all_products.append(product)
            
            if 'amazon' in result and result['amazon']:
                for product in result['amazon']:
                    product['platform'] = 'amazon'
                    all_products.append(product)
            
            # Save to Appwrite
            if all_products and category != 'all':
                saved_products = appwrite_service.save_products(
                    products=all_products,
                    category=category,
                    search_query=search_query
                )
                saved_count = len(saved_products)
                logger.info(f"Successfully saved {saved_count} products to Appwrite")
            
        except Exception as db_error:
            logger.error(f"Error saving to database: {str(db_error)}")
            # Continue returning scraper results even if DB save fails
        
        # If no products from scraping, attempt to retrieve from database
        if result.get('total_count', 0) == 0:
            logger.info('No scraped products found; attempting to fetch from DB fallback')
            try:
                db_products = appwrite_service.get_products_by_category(category, limit)
                if db_products:
                    # Convert appwrite docs to standard product dicts if necessary
                    products = []
                    for d in db_products:
                        if isinstance(d, dict) and 'data' in d:
                            prod = {**d.get('data', {}), '$id': d.get('$id')}
                        else:
                            prod = d
                        products.append(prod)
                    result['flipkart'] = [p for p in products if p.get('platform','').lower() == 'flipkart']
                    result['amazon'] = [p for p in products if p.get('platform','').lower() == 'amazon']
                    result['total_count'] = len(products)
            except Exception as db_fallback_error:
                logger.warning(f"DB fallback failed: {db_fallback_error}")

        # Final fallback: if still no products, use sample list
        if result.get('total_count', 0) == 0:
            logger.info('Using SAMPLE_PRODUCTS fallback')
            result['flipkart'] = [p for p in SAMPLE_PRODUCTS if p.get('platform') == 'flipkart']
            result['amazon'] = [p for p in SAMPLE_PRODUCTS if p.get('platform') == 'amazon']
            result['total_count'] = len(result['flipkart']) + len(result['amazon'])

        result['timestamp'] = datetime.now().isoformat()
        result['saved_to_db'] = saved_count > 0
        result['saved_count'] = saved_count
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in scrape_products: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error during scraping',
            'details': str(e) if app.debug else None
        }), 500


@app.route('/api/scrape/flipkart', methods=['GET', 'POST'])
def scrape_flipkart_only():
    """
    Scrape only from Flipkart
    
    Parameters: query, limit
    """
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
            search_query = data.get('query', '').strip()
            limit = data.get('limit', 12)
        else:
            search_query = request.args.get('query', '').strip()
            limit = request.args.get('limit', 12, type=int)
        
        if not search_query:
            return jsonify({'success': False, 'error': 'Query required'}), 400
        
        from services.scraper_service import FlipkartScraper
        products = FlipkartScraper.scrape_products(search_query, limit)
        
        return jsonify({
            'success': True,
            'platform': 'flipkart',
            'query': search_query,
            'products': [p.to_dict() for p in products],
            'count': len(products),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Flipkart scrape error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/scrape/amazon', methods=['GET', 'POST'])
def scrape_amazon_only():
    """
    Scrape only from Amazon
    
    Parameters: query, limit
    """
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
            search_query = data.get('query', '').strip()
            limit = data.get('limit', 12)
        else:
            search_query = request.args.get('query', '').strip()
            limit = request.args.get('limit', 12, type=int)
        
        if not search_query:
            return jsonify({'success': False, 'error': 'Query required'}), 400
        
        from services.scraper_service import AmazonScraper
        products = AmazonScraper.scrape_products(search_query, limit)
        
        return jsonify({
            'success': True,
            'platform': 'amazon',
            'query': search_query,
            'products': [p.to_dict() for p in products],
            'count': len(products),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Amazon scrape error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ====== DATABASE RETRIEVAL ENDPOINTS ======

@app.route('/api/products/category', methods=['GET', 'POST'])
def get_products_by_category():
    """
    Get products from database by category
    
    Parameters:
    - category: 'pants', 'shirts', or 'shoes'
    - limit: Number of products (default: 12, max: 50)
    """
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
            category = data.get('category', '').lower()
            limit = data.get('limit', 12)
        else:
            category = request.args.get('category', '').lower()
            limit = request.args.get('limit', 12, type=int)
        
        if not category or category not in ['pants', 'shirts', 'shoes']:
            return jsonify({
                'success': False,
                'error': 'Valid category required: pants, shirts, or shoes'
            }), 400
        
        if limit < 1 or limit > 50:
            limit = 12
        
        logger.info(f"Retrieving {category} products from database (limit: {limit})")
        
        # Get from database
        products = appwrite_service.get_products_by_category(category, limit)
        
        return jsonify({
            'success': True,
            'category': category,
            'products': products,
            'count': len(products),
            'source': 'database',
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error retrieving products: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error retrieving products',
            'details': str(e) if app.debug else None
        }), 500

@app.route('/api/products/search', methods=['GET', 'POST'])
def search_products_db():
    """
    Search products in database
    
    Parameters:
    - query: Search term
    - category: 'pants', 'shirts', or 'shoes'
    - limit: Number of results (default: 12, max: 50)
    """
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
            search_query = data.get('query', '').strip()
            category = data.get('category', '').lower()
            limit = data.get('limit', 12)
        else:
            search_query = request.args.get('query', '').strip()
            category = request.args.get('category', '').lower()
            limit = request.args.get('limit', 12, type=int)
        
        if not search_query:
            return jsonify({
                'success': False,
                'error': 'Search query is required'
            }), 400
        
        if category and category not in ['pants', 'shirts', 'shoes']:
            return jsonify({
                'success': False,
                'error': 'Valid category: pants, shirts, or shoes'
            }), 400
        
        if limit < 1 or limit > 50:
            limit = 12
        
        logger.info(f"Searching database: query='{search_query}', category='{category}'")
        
        # Search database
        products = appwrite_service.search_products(search_query, category if category else 'pants', limit)
        
        return jsonify({
            'success': True,
            'query': search_query,
            'category': category if category else 'all',
            'products': products,
            'count': len(products),
            'source': 'database',
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error searching products: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error searching products',
            'details': str(e) if app.debug else None
        }), 500

@app.route('/api/products/all', methods=['GET'])
def get_all_products_db():
    """
    Get all products from database
    
    Parameters:
    - limit: Number of products (default: 100, max: 500)
    """
    try:
        limit = request.args.get('limit', 100, type=int)
        
        if limit < 1 or limit > 500:
            limit = 100
        
        logger.info(f"Retrieving all products from database (limit: {limit})")
        
        # Get from database
        products = appwrite_service.get_all_products(limit)
        
        return jsonify({
            'success': True,
            'products': products,
            'count': len(products),
            'source': 'database',
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error retrieving all products: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error retrieving products',
            'details': str(e) if app.debug else None
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for debugging"""
    return jsonify({
        'success': True,
        'message': 'AI VOGUE Python Backend is running',
        'available_endpoints': [
            'GET /health - Health check',
            'POST /api/recommend - AI recommendations',
            'POST /api/test - Test endpoint',
            'GET/POST /api/scrape/search - Search & scrape Flipkart & Amazon (saves to DB)',
            'GET/POST /api/scrape/flipkart - Scrape Flipkart only',
            'GET/POST /api/scrape/amazon - Scrape Amazon only',
            'GET/POST /api/products/category - Get products from DB by category',
            'GET/POST /api/products/search - Search products in DB',
            'GET /api/products/all - Get all products from DB'
        ]
    })

@app.errorhandler(404)
def not_found(error):
    logger.error(f"404 Error - Requested URL: {request.url}")
    logger.error(f"Request method: {request.method}")
    logger.error(f"Request path: {request.path}")
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'requested_url': request.url,
        'available_endpoints': ['/health', '/api/recommend', '/api/test']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    logger.info("Starting AI VOGUE Python Backend...")
    logger.info(f"CORS origins: {cors_origins}")
    logger.info("Backend will be available at: http://localhost:5000")
    logger.info("Health check: http://localhost:5000/health")
    logger.info("API endpoint: http://localhost:5000/api/recommend")
    logger.info("Test endpoint: http://localhost:5000/api/test")
    
    # Initialize Gemini service to check API key
    try:
        gemini_test = GeminiService()
        logger.info("✅ Gemini service initialized successfully")
    except ValueError as e:
        logger.error(f"❌ Gemini API key error: {e}")
        logger.error("Please update the API key in services/gemini_service.py")
        exit(1)
    
    # Run the app
    app.run(
        debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true',
        port=5000,
        host='0.0.0.0'
    )
