// Python Backend Service
// Handles communication with the Python Flask backend

class PythonBackendService {
    constructor() {
        this.baseUrl = 'http://localhost:5000';
        this.timeout = 30000; // 30 seconds
        this.maxRetries = 2;
    }

    /**
     * Test backend connection
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });

            if (!response.ok) {
                throw new Error(`Backend health check failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            return { 
                success: false, 
                error: error.message,
                suggestion: 'Make sure Python backend is running on http://localhost:5000'
            };
        }
    }

    /**
     * Get AI recommendations from Python backend
     * @param {string} userQuery - User's question
     * @param {Object} userProfile - User's profile preferences
     * @param {string} imageData - Optional base64 image data
     * @returns {Promise<Object>} AI response with products and advice
     */
    async getRecommendations(userQuery, userProfile, imageData = null) {
        const maxRetries = this.maxRetries;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                console.log(`🔄 Calling Python backend (attempt ${attempt + 1}/${maxRetries})`);
                
                const requestData = {
                    userQuery: userQuery,
                    userProfile: userProfile,
                    imageData: imageData
                };

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(`${this.baseUrl}/api/recommend`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Backend error: ${response.status} - ${errorData.error || 'Unknown error'}`);
                }

                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Backend returned unsuccessful response');
                }

                console.log('✅ Got recommendations from Python backend');
                return {
                    success: true,
                    generalAdvice: data.data.generalAdvice || 'Here are some recommendations for you:',
                    products: data.data.products || [],
                    additionalTips: data.data.additionalTips || [],
                    processingTime: data.processingTime,
                    timestamp: data.timestamp
                };

            } catch (error) {
                attempt++;
                console.error(`❌ Backend attempt ${attempt} failed:`, error);

                if (error.name === 'AbortError') {
                    console.error('Request timeout');
                }

                if (attempt >= maxRetries) {
                    // Return fallback response
                    return this.getFallbackResponse(userQuery, userProfile, error.message);
                }

                // Wait before retry (exponential backoff)
                await this.delay(1000 * Math.pow(2, attempt));
            }
        }
    }

    /**
     * Test endpoint for debugging
     */
    async testEndpoint(testData = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/api/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData)
            });

            const data = await response.json();
            console.log('Test endpoint response:', data);
            return data;

        } catch (error) {
            console.error('Test endpoint failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get fallback response when backend fails
     */
    getFallbackResponse(userQuery, userProfile, errorMessage) {
        const fallbackProducts = this.generateFallbackProducts(userProfile);
        
        return {
            success: true,
            generalAdvice: `I'm experiencing some technical difficulties connecting to the backend, but here are some general recommendations based on your profile. These products are commonly recommended for ${userProfile?.skinType || 'all'} skin types.`,
            products: fallbackProducts,
            additionalTips: [
                'Always patch test new products before full application',
                'Introduce new products gradually to avoid irritation',
                'Consistency is key - use products regularly for best results'
            ],
            fallback: true,
            error: errorMessage
        };
    }

    /**
     * Generate fallback products when backend is unavailable
     */
    generateFallbackProducts(userProfile) {
        const skinType = userProfile?.skinType || 'normal';
        const budget = userProfile?.skincareBudget || 'mid';
        
        const fallbackProducts = {
            oily: [
                {
                    name: 'Foaming Facial Cleanser',
                    brand: 'CeraVe',
                    category: 'Skincare',
                    price: '$12.99',
                    ingredients: ['Ceramides', 'Niacinamide', 'Hyaluronic Acid'],
                    purchaseLink: 'https://www.cerave.com/skincare/cleansers/foaming-facial-cleanser',
                    compatibility: 85,
                    pros: ['Controls oil production', 'Non-comedogenic', 'Gentle formula'],
                    cons: ['May be drying for some', 'Fragrance-free (some prefer scented)'],
                    applicationTips: 'Use twice daily, morning and evening. Massage gently and rinse with lukewarm water.'
                }
            ],
            dry: [
                {
                    name: 'Daily Moisturizing Lotion',
                    brand: 'CeraVe',
                    category: 'Skincare',
                    price: '$16.99',
                    ingredients: ['Ceramides', 'Hyaluronic Acid', 'MVE Technology'],
                    purchaseLink: 'https://www.cerave.com/skincare/moisturizers/daily-moisturizing-lotion',
                    compatibility: 90,
                    pros: ['24-hour hydration', 'Non-greasy', 'Restores skin barrier'],
                    cons: ['May not be rich enough for very dry skin', 'Pump bottle can be messy'],
                    applicationTips: 'Apply to damp skin for better absorption. Use morning and night.'
                }
            ],
            sensitive: [
                {
                    name: 'Gentle Skin Cleanser',
                    brand: 'Cetaphil',
                    category: 'Skincare',
                    price: '$13.49',
                    ingredients: ['Glycerin', 'Dimethicone', 'Glyceryl Stearate'],
                    purchaseLink: 'https://www.cetaphil.com/us/product/gentle-skin-cleanser',
                    compatibility: 95,
                    pros: ['Soap-free', 'Non-irritating', 'Suitable for all skin types'],
                    cons: ['May not remove heavy makeup', 'Some find it too gentle'],
                    applicationTips: 'Can be used with or without water. Gentle enough for daily use.'
                }
            ]
        };

        return fallbackProducts[skinType] || fallbackProducts.normal || [
            {
                name: 'Hydrating Cleanser',
                brand: 'Generic',
                category: 'Skincare',
                price: '$15.00',
                ingredients: ['Gentle surfactants', 'Moisturizing agents'],
                purchaseLink: '#',
                compatibility: 75,
                pros: ['Suitable for most skin types', 'Affordable'],
                cons: ['Generic recommendation', 'May not address specific concerns'],
                applicationTips: 'Use as directed on packaging.'
            }
        ];
    }

    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if backend is running
     */
    async isBackendRunning() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                timeout: 3000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Export service instance
export const pythonBackendService = new PythonBackendService();
