"""
AI VOGUE - Python Flask Backend
Simple, fast, and secure backend for Prism AI recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from datetime import datetime
import time

# Import our services
from services.gemini_service import GeminiService
from utils.validators import validate_request
from utils.response_parser import parse_ai_response

# Prism AI 2.0 services
try:
    from services.gemini_search_service import GeminiSearchService
    from services.appwrite_service import AppwriteService
    from services.semantic_matcher import SemanticMatcher
    from services.ingredient_analyzer import IngredientAnalyzer
    PRISM_V2_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Prism AI 2.0 services not available: {e}")
    PRISM_V2_AVAILABLE = False

# Load environment variables
load_dotenv()

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

# Initialize Prism AI 2.0 services
if PRISM_V2_AVAILABLE:
    try:
        gemini_search = GeminiSearchService()
        appwrite_service = AppwriteService()
        semantic_matcher = SemanticMatcher()
        ingredient_analyzer = IngredientAnalyzer()
        logger.info("✅ Prism AI 2.0 services initialized")
    except Exception as e:
        logger.error(f"Failed to initialize Prism AI 2.0 services: {e}")
        PRISM_V2_AVAILABLE = False

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

        # Parse and format response (with user profile for enrichment)
        parsed_response = parse_ai_response(ai_response['data'], user_profile)
        is_parsed_fallback = bool(parsed_response.get('_fallback'))
        if is_parsed_fallback:
            logger.warning("Parser produced fallback response due to AI JSON issues")
        
        # Remove internal parser markers before returning to client
        safe_data = dict(parsed_response)
        if is_parsed_fallback:
            safe_data.pop('_fallback', None)
            safe_data.pop('_originalResponse', None)

        processing_time = round(time.time() - start_time, 2)

        return jsonify({
            'success': True,
            'data': safe_data,
            'processingTime': f"{processing_time}s",
            'timestamp': datetime.now().isoformat(),
            'fallback': True if is_parsed_fallback else False
        })
        
    except Exception as e:
        logger.error(f"Error in get_recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e) if app.debug else None
        }), 500

@app.route('/api/recommend-v2', methods=['POST', 'OPTIONS'])
def get_recommendations_v2():
    """
    Prism AI 2.0 - Advanced recommendations with Gemini Search, semantic matching, and ingredient analysis
    """
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    start_time = time.time()
    
    try:
        if not PRISM_V2_AVAILABLE:
            return jsonify({
                'success': False,
                'error': 'Prism AI 2.0 services not available. Please install required libraries.'
            }), 503
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        user_query = data.get('userQuery')
        user_id = data.get('userId')
        user_profile = data.get('userProfile', {})
        
        if not user_query:
            return jsonify({'success': False, 'error': 'userQuery is required'}), 400
        
        logger.info(f"🔍 Prism AI 2.0 request: {user_query[:50]}...")
        
        # Step 1: Get user preferences from Appwrite if userId provided
        if user_id:
            stored_prefs = appwrite_service.get_user_preferences(user_id)
            if stored_prefs:
                user_profile = {**user_profile, **stored_prefs}
                logger.info(f"✅ Loaded preferences for user: {user_id}")
        
        # Step 2: Determine category
        query_lower = user_query.lower()
        if any(word in query_lower for word in ['skin', 'face', 'cream', 'serum', 'moisturizer']):
            category = 'skincare'
        elif any(word in query_lower for word in ['hair', 'shampoo', 'conditioner', 'scalp']):
            category = 'haircare'
        else:
            category = 'fashion'
        
        logger.info(f"📂 Category detected: {category}")
        
        # Step 3: Search for products using Gemini with Google Search
        products = gemini_search.search_products(
            query=user_query,
            user_preferences=user_profile,
            category=category,
            limit=5
        )
        
        logger.info(f"Step 3 result: Found {len(products) if products else 0} products")
        
        if not products:
            logger.warning("No products found by Gemini Search")
            return jsonify({
                'success': True,
                'text': "I couldn't find specific products right now. Could you try rephrasing your query?",
                'product': None
            })
        
        # Step 4: Calculate semantic match scores
        logger.info("Step 4: Calculating semantic match scores")
        for product in products:
            match_score, match_reasons = semantic_matcher.calculate_match_score(
                user_profile, product
            )
            product['match_percentage'] = match_score
            product['match_reasons'] = match_reasons
        
        # Step 5: Analyze ingredients (for skincare/haircare)
        logger.info(f"Step 5: Analyzing ingredients for category {category}")
        if category in ['skincare', 'haircare']:
            for product in products:
                # Extract ingredients from description (simplified)
                ingredients = product.get('ingredients', [])
                if not ingredients and product.get('description'):
                    # Try to extract from description
                    desc = product['description'].lower()
                    # This is simplified - in production, you'd scrape the product page
                    ingredients = []
                
                analysis = ingredient_analyzer.analyze_product(ingredients, user_profile)
                product['good_effects'] = analysis['good_effects']
                product['bad_effects'] = analysis['bad_effects']
                product['allergen_warnings'] = analysis['allergen_warnings']
                product['ingredient_score'] = analysis['ingredient_score']
        
        # Step 6: Rank products by match percentage
        logger.info("Step 6: Ranking products")
        ranked_products = sorted(products, key=lambda x: x.get('match_percentage', 0), reverse=True)
        
        # Step 7: Get AI recommendation text for top product
        logger.info("Step 7: Generating recommendation text")
        top_product = ranked_products[0]
        recommendation_text = gemini_search.get_ai_recommendation_text(
            user_query, user_profile, top_product
        )
        
        processing_time = round(time.time() - start_time, 2)
        logger.info(f"✅ Request completed in {processing_time}s")
        
        return jsonify({
            'success': True,
            'text': recommendation_text,
            'product': {
                'name': top_product.get('name'),
                'brand': top_product.get('brand'),
                'price': top_product.get('price'),
                'url': top_product.get('url'),
                'image': top_product.get('image'),
                'match_percentage': top_product.get('match_percentage'),
                'good_effects': top_product.get('good_effects', []),
                'bad_effects': top_product.get('bad_effects', []),
                'allergen_warnings': top_product.get('allergen_warnings', [])
            },
            'alternatives': [
                {
                    'name': p.get('name'),
                    'brand': p.get('brand'),
                    'price': p.get('price'),
                    'url': p.get('url'),
                    'match_percentage': p.get('match_percentage')
                }
                for p in ranked_products[1:3]
            ],
            'processingTime': f"{processing_time}s",
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in Prism AI 2.0: {str(e)}")
        import traceback
        traceback.print_exc()
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

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for debugging"""
    return jsonify({
        'success': True,
        'message': 'AI VOGUE Python Backend is running',
        'available_endpoints': [
            'GET /health - Health check',
            'POST /api/recommend - AI recommendations',
            'POST /api/test - Test endpoint'
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
