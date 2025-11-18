// Prism AI - Gemini AI Service
// Handles AI-powered product recommendations via Python Backend with Direct Gemini API Integration

import { APPWRITE_CONFIG } from '../appwrite-config.js';
import { preferencesService } from './preferences-service.js';

class GeminiService {
    constructor() {
        this.pythonBackend = APPWRITE_CONFIG.pythonBackend;
        this.apiUrl = `${this.pythonBackend.baseUrl}${this.pythonBackend.endpoints.recommend}`;
        this.healthUrl = `${this.pythonBackend.baseUrl}${this.pythonBackend.endpoints.health}`;
        this.timeout = 30000; // 30 seconds
        this.maxRetries = 3;
        this.requestCount = 0;
        this.requestWindow = 60000; // 1 minute
        this.maxRequestsPerMinute = 15;
        this.requestTimestamps = [];
        this.backendHealthy = false;
        
        // Health check backoff
        this.healthCheckInterval = 10000; // Start with 10s
        this.maxHealthCheckInterval = 60000; // Max 60s
        this.healthCheckFailCount = 0;
        
        // Debug URLs
        console.log('🔧 Gemini Service URLs:');
        console.log('📍 API URL:', this.apiUrl);
        console.log('📍 Health URL:', this.healthUrl);
        console.log('📍 Backend Config:', this.pythonBackend);
        
        // Initialize backend health check with adaptive interval
        this.startHealthMonitoring();
    }
    
    /**
     * Start health monitoring with adaptive backoff
     */
    startHealthMonitoring() {
        this.checkBackendHealth();
        
        // Clear any existing interval
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        
        // Set up interval that adapts based on backend status
        this.healthCheckTimer = setInterval(() => {
            this.checkBackendHealth();
        }, this.healthCheckInterval);
    }

    /**
     * Check if Python backend is healthy and responsive
     */
    async checkBackendHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

            const response = await fetch(this.healthUrl, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const wasUnhealthy = !this.backendHealthy;
                this.backendHealthy = true;
                this.healthCheckFailCount = 0;
                
                // Reset to normal interval
                if (this.healthCheckInterval !== 10000) {
                    this.healthCheckInterval = 10000;
                    this.startHealthMonitoring();
                }
                
                if (wasUnhealthy) {
                    console.log('✅ Backend is back online!', data.service);
                }
                return { healthy: true, data };
            } else {
                throw new Error(`Backend unhealthy: ${response.status}`);
            }
        } catch (error) {
            this.backendHealthy = false;
            this.healthCheckFailCount++;
            
            // Implement exponential backoff: 10s → 20s → 40s → 60s (max)
            const newInterval = Math.min(
                this.healthCheckInterval * 2,
                this.maxHealthCheckInterval
            );
            
            // Only log every 5th failure to reduce spam
            if (this.healthCheckFailCount === 1 || this.healthCheckFailCount % 5 === 0) {
                console.warn(`⚠️ Backend offline (attempt ${this.healthCheckFailCount}). Next check in ${newInterval/1000}s`);
            }
            
            // Update interval if it changed
            if (newInterval !== this.healthCheckInterval) {
                this.healthCheckInterval = newInterval;
                this.startHealthMonitoring();
            }
            
            return { healthy: false, error: error.message };
        }
    }

    /**
     * Build a complete user profile by merging saved preferences
     * with any provided overrides and sensible defaults.
     */
    async buildUserProfile(userProfile) {
        try {
            // Start with provided profile (if any)
            let merged = (userProfile && Object.keys(userProfile || {}).length)
                ? { ...userProfile }
                : {};

            // Merge saved preferences from Appwrite/localStorage
            const saved = await preferencesService.getPreferences();
            if (saved) {
                const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...savedProfile } = saved;
                // Caller overrides take precedence
                merged = { ...savedProfile, ...merged };
            }

            // Apply defaults for critical fields
            const defaults = {
                skinType: 'normal',
                skincareBudget: 'mid',
                ageRange: 'twenties',
                allergens: [],
                preferredIngredients: [],
                avoidIngredients: []
            };

            return { ...defaults, ...merged };
        } catch (e) {
            console.warn('buildUserProfile: unable to load saved preferences', e);
            const defaults = {
                skinType: 'normal',
                skincareBudget: 'mid',
                ageRange: 'twenties',
                allergens: [],
                preferredIngredients: [],
                avoidIngredients: []
            };
            return { ...defaults, ...(userProfile || {}) };
        }
    }

    /**
     * Generate AI response with user context via Python Backend
     * @param {string} userQuery - User's question
     * @param {Object} userProfile - User's profile preferences
     * @param {string} imageData - Optional base64 image data
     * @returns {Promise<Object>} AI response with products and advice
     */
    async generateResponse(userQuery, userProfile, imageData = null) {
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
                    name: "Niacinamide 10% + Zinc 1%",
                    brand: "The Ordinary",
                    category: "Skincare",
                    price: "$5.90",
                    ingredients: ["Niacinamide", "Zinc PCA"],
                    purchaseLink: "https://www.sephora.com/product/the-ordinary-deciem-niacinamide-10-zinc-1-P427417",
                    compatibility: 90,
                    pros: ["Controls oil production", "Minimizes pores", "Affordable"],
                    cons: ["May cause purging initially"],
                    applicationTips: "Apply a few drops to clean skin before moisturizer"
                }
            ],
            dry: [
                {
                    name: "Hyaluronic Acid 2% + B5",
                    brand: "The Ordinary",
                    category: "Skincare",
                    price: "$6.80",
                    ingredients: ["Hyaluronic Acid", "Vitamin B5"],
                    purchaseLink: "https://www.sephora.com/product/the-ordinary-deciem-hyaluronic-acid-2-b5-P427419",
                    compatibility: 88,
                    pros: ["Deep hydration", "Plumps skin", "Lightweight"],
                    cons: ["Needs to be sealed with moisturizer"],
                    applicationTips: "Apply to damp skin for best results"
                }
            ],
            combination: [
                {
                    name: "Salicylic Acid 2% Solution",
                    brand: "The Ordinary",
                    category: "Skincare",
                    price: "$5.30",
                    ingredients: ["Salicylic Acid"],
                    purchaseLink: "https://www.sephora.com/product/the-ordinary-deciem-salicylic-acid-2-solution-P442563",
                    compatibility: 85,
                    pros: ["Exfoliates", "Clears pores", "Balances skin"],
                    cons: ["May be drying if overused"],
                    applicationTips: "Use 2-3 times per week on oily areas"
                }
            ],
            sensitive: [
                {
                    name: "Moisturizing Cream",
                    brand: "CeraVe",
                    category: "Skincare",
                    price: "$16.99",
                    ingredients: ["Ceramides", "Hyaluronic Acid", "MVE Technology"],
                    purchaseLink: "https://www.amazon.com/CeraVe-Moisturizing-Cream/dp/B00TTD9BRC",
                    compatibility: 92,
                    pros: ["Gentle formula", "Fragrance-free", "Dermatologist recommended"],
                    cons: ["May feel heavy for oily skin"],
                    applicationTips: "Apply liberally morning and night"
                }
            ],
            normal: [
                {
                    name: "Daily Facial Moisturizer SPF 30",
                    brand: "Neutrogena",
                    category: "Skincare",
                    price: "$14.99",
                    ingredients: ["SPF 30", "Hyaluronic Acid"],
                    purchaseLink: "https://www.ulta.com/p/hydro-boost-water-gel-lotion-spf-30-pimprod2017839",
                    compatibility: 87,
                    pros: ["SPF protection", "Lightweight", "Non-greasy"],
                    cons: ["Reapplication needed throughout day"],
                    applicationTips: "Apply as last step in morning routine"
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
            'budget': 'Under $50',
            'mid': '$50-$150',
            'premium': '$150-$300',
            'luxury': '$300+'
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
