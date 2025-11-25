// Chat API Endpoint  
// Integrates Groq AI (Llama 3.1) and SERP API for personalized recommendations

import express from 'express';
import fetch from 'node-fetch';
import { getJson } from 'serpapi';
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ============================================
// INITIALIZE APIS
// ============================================

// Groq AI (Llama 3.1 - Fast & Free!)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Appwrite (optional - for server-side profile fetching)
let appwriteClient;
let appwriteDatabases;

if (process.env.APPWRITE_API_KEY) {
    appwriteClient = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    appwriteDatabases = new Databases(appwriteClient);
}

// ============================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Fetch user profile from Appwrite
 */
async function getUserProfile(userId) {
    if (!appwriteDatabases) {
        return null;
    }

    try {
        const document = await appwriteDatabases.getDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_COLLECTION_ID,
            userId
        );

        return {
            skinType: document.skinType,
            skinConcerns: document.skinConcerns,
            hairType: document.hairType,
            hairThickness: document.hairThickness,
            scalpType: document.scalpType,
            hairConcerns: document.hairConcerns,
            clothingStyles: document.clothingStyles,
            skincareBudget: {
                min: document.skincareBudgetMin,
                max: document.skincareBudgetMax
            },
            haircareBudget: {
                min: document.haircareBudgetMin,
                max: document.haircareBudgetMax
            },
            fashionBudget: {
                min: document.fashionBudgetMin,
                max: document.fashionBudgetMax
            }
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Generate AI prompt with user profile and question
 */
function buildPrompt(userProfile, userMessage) {
    let profileContext = '';

    if (userProfile) {
        profileContext = `
User Profile:
- Skin: ${userProfile.skinType}, Concerns: ${userProfile.skinConcerns?.join(', ') || 'none'}
- Hair: ${userProfile.hairType} (${userProfile.hairThickness}), Scalp: ${userProfile.scalpType}, Concerns: ${userProfile.hairConcerns?.join(', ') || 'none'}
- Style Preferences: ${userProfile.clothingStyles?.join(', ') || 'not specified'}
- Skincare Budget: ₹${userProfile.skincareBudget?.min || 200}-₹${userProfile.skincareBudget?.max || 1000}
- Haircare Budget: ₹${userProfile.haircareBudget?.min || 200}-₹${userProfile.haircareBudget?.max || 800}
- Fashion Budget: ₹${userProfile.fashionBudget?.min || 500}-₹${userProfile.fashionBudget?.max || 3000}
`;
    }

    return `You are a luxury fashion, beauty, and style consultant for AI VOGUE, India's premier AI-powered fashion technology platform.

${profileContext}

User Question: "${userMessage}"

Provide a helpful, personalized response following these guidelines:
1. Give specific, actionable advice in 3-4 sentences
2. Recommend product types that match their profile and budget
3. At the end, provide a JSON object with search parameters for finding products

Format your response as:
[Your advice text here]

PRODUCT_SEARCH:
{
  "category": "product category (e.g., facewash, moisturizer, shampoo, t-shirt, jeans)",
  "concerns": ["specific concerns to address"],
  "maxPrice": [appropriate max price in INR based on budget],
  "keywords": ["specific ingredients or features to look for"],
  "siteRestriction": "site:amazon.in OR site:flipkart.com OR site:nykaa.com OR site:myntra.com OR site:ajio.com"
}

Make the advice warm, professional, and tailored to their specific needs.`;
}

/**
 * Parse AI response to extract advice and product search params
 */
function parseAIResponse(aiText) {
    try {
        const parts = aiText.split('PRODUCT_SEARCH:');

        let advice = parts[0].trim();
        let productSearch = null;

        if (parts.length > 1) {
            const jsonMatch = parts[1].match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                productSearch = JSON.parse(jsonMatch[0]);
            }
        }

        return { advice, productSearch };
    } catch (error) {
        console.error('Error parsing AI response:', error);
        return { advice: aiText, productSearch: null };
    }
}

/**
 * Search for products using SERP API
 */
async function searchProducts(productSearch) {
    if (!productSearch || !process.env.SERP_API_KEY) {
        return [];
    }

    try {
        const concernsText = productSearch.concerns?.join(' ') || '';
        const keywordsText = productSearch.keywords?.join(' ') || '';

        const query = `${productSearch.category} ${concernsText} ${keywordsText} under ${productSearch.maxPrice} rupees ${productSearch.siteRestriction || ''}`.trim();

        console.log('SERP Search Query:', query);

        const results = await getJson({
            engine: "google",
            q: query,
            api_key: process.env.SERP_API_KEY,
            location: "India",
            hl: "en",
            gl: "in",
            num: 5
        });

        const products = [];

        if (results.organic_results) {
            for (const result of results.organic_results.slice(0, 5)) {
                let price = 'Price varies';
                const priceMatch = result.snippet?.match(/₹[\d,]+/);
                if (priceMatch) {
                    price = priceMatch[0];
                } else {
                    const titlePriceMatch = result.title?.match(/₹[\d,]+/);
                    if (titlePriceMatch) {
                        price = titlePriceMatch[0];
                    }
                }

                let store = 'Online Store';
                if (result.link.includes('amazon.in')) store = 'Amazon';
                else if (result.link.includes('flipkart.com')) store = 'Flipkart';
                else if (result.link.includes('nykaa.com')) store = 'Nykaa';
                else if (result.link.includes('myntra.com')) store = 'Myntra';
                else if (result.link.includes('ajio.com')) store = 'AJIO';

                products.push({
                    title: result.title,
                    price: price,
                    store: store,
                    url: result.link
                });
            }
        }

        return products;
    } catch (error) {
        console.error('Error searching products with SERP API:', error);
        return [];
    }
}
/**
 * Call Groq API using node-fetch
 */
async function callGroqAPI(prompt) {
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is missing in environment variables');
    }

    console.log('[GROQ] Sending request to:', GROQ_API_URL);

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a luxury fashion, beauty, and style consultant for AI VOGUE.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[GROQ] API Error Body:', errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
}

// ============================================
// CHAT ENDPOINT
// ============================================

router.post('/chat', async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                details: 'Message is required and must be a string'
            });
        }

        console.log(`\n[CHAT] User ${userId}: ${message}`);

        // 1. Fetch user profile
        let userProfile = null;
        if (userId && userId !== 'guest' && !userId.startsWith('temp-')) {
            userProfile = await getUserProfile(userId);
        }

        // 2. Build prompt
        const prompt = buildPrompt(userProfile, message);

        // 3. Call Groq AI
        console.log('[GROQ] Generating response...');
        const groqData = await callGroqAPI(prompt);
        const aiText = groqData.choices[0].message.content;

        console.log('[GROQ] Response received');

        // 4. Parse AI response
        const { advice, productSearch } = parseAIResponse(aiText);

        // 5. Search for products
        let products = [];
        if (productSearch) {
            console.log('[SERP] Searching for products...');
            products = await searchProducts(productSearch);
            console.log(`[SERP] Found ${products.length} products`);
        }

        // 6. Return response
        const responseData = {
            advice: advice,
            products: products,
            timestamp: new Date().toISOString()
        };

        console.log('[CHAT] Response sent successfully\n');
        res.json(responseData);

    } catch (error) {
        console.error('Error in chat endpoint:', error);

        res.status(500).json({
            error: 'Failed to process your message',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            advice: 'I apologize, but I encountered an error. Please try again in a moment.',
            products: []
        });
    }
});

// Test endpoint
router.get('/chat/test', async (req, res) => {
    res.json({
        message: 'Chat API is working',
        groqConfigured: !!process.env.GROQ_API_KEY,
        serpConfigured: !!process.env.SERP_API_KEY,
        appwriteConfigured: !!process.env.APPWRITE_API_KEY,
        model: GROQ_MODEL
    });
});

export default router;
