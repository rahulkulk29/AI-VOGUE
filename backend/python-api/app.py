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
