// Prism AI - Gemini Service with Python Backend Integration
// Handles communication with the Python backend for AI recommendations

// Imports removed - using global variables
// const { APPWRITE_CONFIG, authService } = window;
// const { preferencesService } = window;

class PrismGeminiService {
    constructor() {
        this.pythonApiUrl = window.APPWRITE_CONFIG.pythonApiUrl;
        this.isProcessing = false;
        this.requestQueue = [];
        this.maxRetries = 3;
        // Check if backend is healthy
        if (!this.backendHealthy) {
            console.warn('🔄 Backend unhealthy, attempting health check...');
            const healthCheck = await this.checkBackendHealth();
            if (!healthCheck.healthy) {
                return this.getFallbackResponse(userQuery, userProfile, 'Backend unavailable');
            }
        }

        // Check rate limiting
        if (!this.checkRateLimit()) {
            throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }

        const maxRetries = this.maxRetries;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                console.log('🤖 Calling Gemini AI via Python Backend...');
                console.log('📡 Backend URL:', this.apiUrl);

                // Build complete user profile with defaults
                const mergedProfile = await this.buildUserProfile(userProfile);

                const payload = {
                    userQuery: userQuery || 'Hello',
                    userProfile: mergedProfile,
                    imageData: imageData || null
                };

                console.log('📤 Sending to Python backend:', {
                    userQuery: payload.userQuery,
                    profileKeys: Object.keys(payload.userProfile),
                    hasImage: !!payload.imageData
                });

                // Call Python Backend with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log('📡 Backend response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Backend error: ${response.status}`);
                }

                const result = await response.json();
                console.log('✅ Python backend response received');

                // CHECK IF BACKEND RETURNED FALLBACK DATA
                if (result.fallback === true) {
                    console.warn('⚠️ BACKEND RETURNED FALLBACK - GEMINI API FAILED!');
                    console.warn('   This means the Gemini API call failed on the backend.');
                    console.warn('   Check the backend terminal logs for the error details!');
                    console.warn('   Backend response:', result);
                    if (result.backendError) {
                        console.warn('   backendError:', result.backendError);
                    }
                    if (result.backendDetails) {
                        console.warn('   backendDetails:', result.backendDetails);
                    }
                    if (result.modelErrors) {
                        console.warn('   modelErrors:', result.modelErrors);
                    }
                }

                // Track successful request
                this.trackRequest();

                // Ensure proper response format
                if (result.success && result.data) {
                    return {
                        success: true,
                        generalAdvice: result.data.generalAdvice || 'Here are some recommendations for you:',
                        products: result.data.products || [],
                        additionalTips: result.data.additionalTips || [],
                        processingTime: result.processingTime,
                        timestamp: result.timestamp,
                        isFallback: result.fallback === true  // Flag fallback responses
                    };
                } else {
                    throw new Error(result.error || 'Invalid response format from backend');
                }

            } catch (error) {
                attempt++;
                console.error(`❌ Backend attempt ${attempt}/${maxRetries} failed:`, error.message);

                // Check for specific error types
                if (error.name === 'AbortError') {
                    console.error('⏰ Request timeout - backend taking too long');
                } else if (error.message.includes('fetch') || error.name === 'TypeError') {
                    console.error('🚨 Cannot connect to Python backend!');
                    console.error('💡 Make sure backend is running: cd backend/python-api && python app.py');
                    this.backendHealthy = false;
                }

                if (attempt >= maxRetries) {
                    // Return structured fallback response
                    return this.getFallbackResponse(userQuery, userProfile, error.message);
                }

                // Exponential backoff
                await this.delay(1000 * Math.pow(2, attempt - 1));
            }
        }
    }

    /**
     * Legacy method for compatibility with existing code
     */
    async getRecommendations(userQuery, userProfile, imageData = null) {
        return this.generateResponse(userQuery, userProfile, imageData);
    }


    /**
     * Test the backend with a simple request
     */
    async testBackend() {
        try {
            const testUrl = `${this.pythonBackend.baseUrl}${this.pythonBackend.endpoints.test}`;
            const response = await fetch(testUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    test: true,
                    message: 'Frontend test request'
                }),
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`Test failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('🧪 Backend test successful:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Backend test failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get fallback response when API fails
     */
    getFallbackResponse(userQuery, preferences, errorMessage = 'Technical difficulties') {
        const fallbackProducts = this.generateFallbackProducts(preferences);

        let advice = `I'm experiencing some technical difficulties, but here are some general recommendations based on your profile.`;

        // Add specific error context
        if (errorMessage.includes('Backend unavailable') || errorMessage.includes('fetch')) {
            advice = `The AI backend is currently unavailable. Here are some general recommendations while we reconnect.`;
        } else if (errorMessage.includes('timeout')) {
            advice = `The AI is taking longer than usual to respond. Here are some quick recommendations.`;
        }

        return {
            success: true,
            generalAdvice: advice,
            products: fallbackProducts,
            additionalTips: [
                "Always patch test new products before full application",
                "Stay hydrated and maintain a consistent skincare routine",
                "Consult with a dermatologist for persistent concerns",
                "Try asking your question again in a moment"
            ],
            fallback: true,
            error: errorMessage,
            processingTime: "0.1s",
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate fallback product recommendations
     */
    generateFallbackProducts(preferences) {
        const skinType = preferences?.skinType || 'normal';
        const budget = preferences?.skincareBudget || 'mid';

        const productDatabase = {
            oily: [
                {
                    name: "Minimalist 10% Niacinamide Face Serum (30ml)",
                    brand: "Minimalist",
                    category: "Skincare",
                    price: "₹599",
                    ingredients: ["Niacinamide", "Zinc"],
                    purchaseLink: "https://www.amazon.in/dp/B08GY59SH4",
                    compatibility: 90,
                    pros: ["Controls oil production", "Minimizes pores", "Budget-friendly"],
                    cons: ["Can be drying if overused"],
                    applicationTips: "Apply a few drops after cleansing, before moisturizer"
                },
                {
                    name: "Minimalist 2% Salicylic Acid Serum (30ml)",
                    brand: "Minimalist",
                    category: "Skincare",
                    price: "₹599",
                    ingredients: ["Salicylic Acid", "LHA"],
                    purchaseLink: "https://www.amazon.in/dp/B08L4S8F3Z",
                    compatibility: 88,
                    pros: ["Unclogs pores", "Reduces blackheads", "Controls excess oil"],
                    cons: ["May be drying initially"],
                    applicationTips: "Use 2-3 times per week in the evening"
                },
                {
                    name: "Plum Green Tea Renewed Clarity Face Wash (75ml)",
                    brand: "Plum",
                    category: "Skincare",
                    price: "₹345",
                    ingredients: ["Green Tea", "Glycolic Acid"],
                    purchaseLink: "https://www.amazon.in/dp/B01MSJXZ7L",
                    compatibility: 86,
                    pros: ["Oil control", "Gentle exfoliation", "Natural ingredients"],
                    cons: ["May dry out skin if used twice daily"],
                    applicationTips: "Use once daily, preferably in the morning"
                }
            ],
            dry: [
                {
                    name: "Cetaphil Moisturizing Cream (550ml)",
                    brand: "Cetaphil",
                    category: "Skincare",
                    price: "₹999",
                    ingredients: ["Glycerin", "Panthenol", "Sweet Almond Oil"],
                    purchaseLink: "https://www.amazon.in/dp/B003MJG19K",
                    compatibility: 92,
                    pros: ["Deep hydration", "Dermatologist recommended", "Non-greasy"],
                    cons: ["Large bottle may be inconvenient for travel"],
                    applicationTips: "Apply to clean, damp skin twice daily for best results"
                },
                {
                    name: "Minimalist Sepicalm 3% + Oat Moisturizer (100ml)",
                    brand: "Minimalist",
                    category: "Skincare",
                    price: "₹699",
                    ingredients: ["Sepicalm", "Oat Extract", "Ceramides"],
                    purchaseLink: "https://www.amazon.in/dp/B08T6X916Q",
                    compatibility: 90,
                    pros: ["Soothes dry skin", "Strengthens skin barrier", "Lightweight texture"],
                    cons: ["Smaller bottle size"],
                    applicationTips: "Apply morning and night after serum"
                }
            ],
            combination: [
                {
                    name: "Neutrogena Hydro Boost Water Gel (50g)",
                    brand: "Neutrogena",
                    category: "Skincare",
                    price: "₹899",
                    ingredients: ["Hyaluronic Acid", "Glycerin"],
                    purchaseLink: "https://www.nykaa.com/neutrogena-hydro-boost-water-gel/p/260639",
                    compatibility: 89,
                    pros: ["Lightweight hydration", "Non-greasy", "Oil-free formula"],
                    cons: ["Small jar size"],
                    applicationTips: "Apply as last step in routine before sunscreen"
                },
                {
                    name: "Minimalist 10% Niacinamide Face Serum (30ml)",
                    brand: "Minimalist",
                    category: "Skincare",
                    price: "₹599",
                    ingredients: ["Niacinamide", "Zinc"],
                    purchaseLink: "https://www.amazon.in/dp/B08GY59SH4",
                    compatibility: 87,
                    pros: ["Balances oil production", "Minimizes pores", "Budget-friendly"],
                    cons: ["May cause purging initially"],
                    applicationTips: "Use twice daily after cleansing"
                }
            ],
            sensitive: [
                {
                    name: "Simple Kind to Skin Hydrating Light Moisturiser (125ml)",
                    brand: "Simple",
                    category: "Skincare",
                    price: "₹385",
                    ingredients: ["Vitamin E", "Vitamin B5", "Bisabolol"],
                    purchaseLink: "https://www.nykaa.com/simple-kind-to-skin-hydrating-light-moisturiser/p/129162",
                    compatibility: 92,
                    pros: ["Fragrance-free", "Lightweight", "Sensitive skin friendly"],
                    cons: ["Not enough for very dry skin"],
                    applicationTips: "Use morning and evening after cleansing"
                }
            ],
            normal: [
                {
                    name: "Neutrogena Hydro Boost Water Gel (50g)",
                    brand: "Neutrogena",
                    category: "Skincare",
                    price: "₹899",
                    ingredients: ["Hyaluronic Acid", "Glycerin"],
                    purchaseLink: "https://www.nykaa.com/neutrogena-hydro-boost-water-gel/p/260639",
                    compatibility: 87,
                    pros: ["Lightweight hydration", "Non-greasy"],
                    cons: ["Jar may require frequent restock"],
                    applicationTips: "Apply as last step in routine (before sunscreen in AM)"
                }
            ]
        };

        return productDatabase[skinType] || productDatabase.normal;
    }

    /**
     * Rate limiting
     */
    checkRateLimit() {
        const now = Date.now();

        // Remove timestamps older than window
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => now - timestamp < this.requestWindow
        );

        // Check if under limit
        return this.requestTimestamps.length < this.maxRequestsPerMinute;
    }

    trackRequest() {
        this.requestTimestamps.push(Date.now());
    }

    /**
     * Utility functions
     */
    formatBudget(budget) {
        const budgetMap = {
            'budget': 'Under ₹500',
            'mid': '₹500-₹1500',
            'premium': '₹1500-₹3000',
            'luxury': '₹3000+'
        };
        return budgetMap[budget] || 'Any';
    }

    formatAgeRange(range) {
        const rangeMap = {
            'teens': '13-19',
            'twenties': '20-29',
            'thirties': '30-39',
            'forties': '40-49',
            'fifties': '50-59',
            'sixty-plus': '60+'
        };
        return rangeMap[range] || 'Not specified';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get estimated wait time for rate limit
     */
    getWaitTime() {
        if (this.requestTimestamps.length === 0) return 0;

        const oldestTimestamp = this.requestTimestamps[0];
        const waitTime = this.requestWindow - (Date.now() - oldestTimestamp);

        return Math.max(0, waitTime);
    }
}

// Export singleton instance
export const geminiService = new GeminiService();
