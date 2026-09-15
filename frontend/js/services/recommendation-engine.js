// Prism AI - Recommendation Engine
// Handles product compatibility analysis and HTML generation

class RecommendationEngine {
    constructor() {
        this.compatibilityWeights = {
            baseScore: 60,
            budgetMatch: 10,
            noAllergens: 10,
            preferredIngredients: 10,
            suitableForType: 10,
            avoidedIngredients: -20
        };
    }

    /**
     * Calculate compatibility score for a product based on user profile
     * @param {Object} product - Product data
     * @param {Object} userProfile - User preferences
     * @returns {number} Compatibility score (0-100)
     */
    calculateCompatibility(product, userProfile) {
        let score = this.compatibilityWeights.baseScore;

        // If product already has compatibility from AI, use it as base
        if (product.compatibility && product.compatibility > 0) {
            return Math.min(100, Math.max(0, product.compatibility));
        }

        // Budget matching
        if (this.budgetMatches(product, userProfile)) {
            score += this.compatibilityWeights.budgetMatch;
        }

        // Check for allergens
        if (this.hasNoAllergens(product, userProfile)) {
            score += this.compatibilityWeights.noAllergens;
        }

        // Preferred ingredients
        if (this.hasPreferredIngredients(product, userProfile)) {
            score += this.compatibilityWeights.preferredIngredients;
        }

        // Suitable for skin/hair type
        if (this.isSuitableForType(product, userProfile)) {
            score += this.compatibilityWeights.suitableForType;
        }

        // Ingredients to avoid
        if (this.hasAvoidedIngredients(product, userProfile)) {
            score += this.compatibilityWeights.avoidedIngredients;
        }

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Check if product price matches user budget
     */
    budgetMatches(product, userProfile) {
        if (!product.price || !userProfile) return false;

        const price = this.extractPrice(product.price);
        const category = product.category?.toLowerCase();
        
        let budgetRange;
        if (category?.includes('skincare') || category?.includes('beauty')) {
            budgetRange = this.getBudgetRange(userProfile.skincareBudget);
        } else if (category?.includes('fashion') || category?.includes('clothing')) {
            budgetRange = this.getBudgetRange(userProfile.fashionBudget);
        } else {
            budgetRange = this.getBudgetRange(userProfile.skincareBudget);
        }

        return price >= budgetRange.min && price <= budgetRange.max;
    }

    /**
     * Extract numeric price from string
     */
    extractPrice(priceStr) {
        const match = priceStr.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }

    /**
     * Get budget range values
     */
    getBudgetRange(budget) {
        const ranges = {
            'budget': { min: 0, max: 50 },
            'mid': { min: 50, max: 150 },
            'premium': { min: 150, max: 300 },
            'luxury': { min: 300, max: Infinity }
        };
        return ranges[budget] || ranges.mid;
    }

    /**
     * Check if product has no allergens
     */
    hasNoAllergens(product, userProfile) {
        if (!userProfile?.allergens || userProfile.allergens.length === 0) {
            return true;
        }

        if (!product.ingredients || product.ingredients.length === 0) {
            return true; // No ingredient info, assume safe
        }

        const allergens = userProfile.allergens.map(a => a.toLowerCase());
        const ingredients = product.ingredients.map(i => i.toLowerCase());

        return !ingredients.some(ing => 
            allergens.some(allergen => ing.includes(allergen))
        );
    }

    /**
     * Check if product contains preferred ingredients
     */
    hasPreferredIngredients(product, userProfile) {
        if (!userProfile?.preferredIngredients || userProfile.preferredIngredients.length === 0) {
            return false;
        }

        if (!product.ingredients || product.ingredients.length === 0) {
            return false;
        }

        const preferred = userProfile.preferredIngredients.map(p => p.toLowerCase());
        const ingredients = product.ingredients.map(i => i.toLowerCase());

        return ingredients.some(ing => 
            preferred.some(pref => ing.includes(pref))
        );
    }

    /**
     * Check if product contains ingredients to avoid
     */
    hasAvoidedIngredients(product, userProfile) {
        if (!userProfile?.avoidIngredients || userProfile.avoidIngredients.length === 0) {
            return false;
        }

        if (!product.ingredients || product.ingredients.length === 0) {
            return false;
        }

        const avoided = userProfile.avoidIngredients.map(a => a.toLowerCase());
        const ingredients = product.ingredients.map(i => i.toLowerCase());

        return ingredients.some(ing => 
            avoided.some(avoid => ing.includes(avoid))
        );
    }

    /**
     * Check if product is suitable for user's skin/hair type
     */
    isSuitableForType(product, userProfile) {
        if (!product.name && !product.brand) return false;

        const productText = `${product.name} ${product.brand}`.toLowerCase();
        
        // Check skin type suitability
        if (userProfile?.skinType) {
            const skinType = userProfile.skinType.toLowerCase();
            if (productText.includes(skinType)) return true;
        }

        // Check hair type suitability
        if (userProfile?.hairType) {
            const hairType = userProfile.hairType.toLowerCase();
            if (productText.includes(hairType)) return true;
        }

        return false;
    }

    /**
     * Generate HTML for product card
     * @param {Object} product - Product data
     * @param {Object} userProfile - User preferences
     * @param {number} index - Product index for animation delay
     * @returns {string} HTML string
     */
    generateProductCardHTML(product, userProfile, index = 0) {
        const compatibility = this.calculateCompatibility(product, userProfile);
        const compatibilityClass = this.getCompatibilityClass(compatibility);
        const compatibilityLabel = this.getCompatibilityLabel(compatibility);

        const ingredientsList = this.formatIngredients(product.ingredients, userProfile);
        const prosHTML = this.formatList(product.pros);
        const consHTML = this.formatList(product.cons);

        return `
            <div class="product-card" style="animation-delay: ${index * 0.1}s">
                <div class="product-header">
                    <div class="product-image-placeholder" style="background: ${this.getProductGradient(product.category)}">
                        <i class="fas ${this.getCategoryIcon(product.category)}"></i>
                    </div>
                    <div class="product-title-section">
                        <h4 class="product-name">${this.sanitize(product.name)}</h4>
                        <p class="product-brand">${this.sanitize(product.brand)}</p>
                    </div>
                </div>
                
                <div class="product-meta">
                    <span class="product-category">
                        <i class="fas fa-tag"></i> ${this.sanitize(product.category)}
                    </span>
                    <span class="product-price">
                        <i class="fas fa-dollar-sign"></i> ${this.sanitize(product.price)}
                    </span>
                </div>

                <div class="compatibility-badge ${compatibilityClass}">
                    <div class="compatibility-circle">
                        <svg width="60" height="60">
                            <circle cx="30" cy="30" r="25" fill="none" stroke="#e0e0e0" stroke-width="4"/>
                            <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" stroke-width="4"
                                    stroke-dasharray="${2 * Math.PI * 25}" 
                                    stroke-dashoffset="${2 * Math.PI * 25 * (1 - compatibility / 100)}"
                                    transform="rotate(-90 30 30)"/>
                        </svg>
                        <span class="compatibility-percent">${compatibility}%</span>
                    </div>
                    <span class="compatibility-label">${compatibilityLabel}</span>
                </div>

                ${ingredientsList ? `
                    <div class="product-ingredients">
                        <h5><i class="fas fa-flask"></i> Key Ingredients</h5>
                        ${ingredientsList}
                    </div>
                ` : ''}

                <div class="product-analysis">
                    ${prosHTML ? `
                        <div class="pros-section">
                            <h5><i class="fas fa-check-circle"></i> Pros for You</h5>
                            ${prosHTML}
                        </div>
                    ` : ''}
                    
                    ${consHTML ? `
                        <div class="cons-section">
                            <h5><i class="fas fa-exclamation-circle"></i> Cons to Consider</h5>
                            ${consHTML}
                        </div>
                    ` : ''}
                </div>

                ${product.applicationTips ? `
                    <div class="application-tips">
                        <h5><i class="fas fa-lightbulb"></i> Application Tips</h5>
                        <p>${this.sanitize(product.applicationTips)}</p>
                    </div>
                ` : ''}

                <div class="product-footer">
                    <a href="${this.sanitize(product.purchaseLink)}" 
                       class="buy-btn" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       aria-label="Buy ${this.sanitize(product.name)}">
                        <i class="fas fa-shopping-cart"></i> Shop Now
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Format ingredients with highlighting
     */
    formatIngredients(ingredients, userProfile) {
        if (!ingredients || ingredients.length === 0) return null;

        const preferred = userProfile?.preferredIngredients?.map(p => p.toLowerCase()) || [];
        const avoided = userProfile?.avoidIngredients?.map(a => a.toLowerCase()) || [];
        const allergens = userProfile?.allergens?.map(a => a.toLowerCase()) || [];

        const formattedIngredients = ingredients.map(ingredient => {
            const ingLower = ingredient.toLowerCase();
            let className = 'ingredient';
            let icon = '';

            if (preferred.some(p => ingLower.includes(p))) {
                className += ' ingredient-good';
                icon = '<i class="fas fa-heart"></i>';
            } else if (avoided.some(a => ingLower.includes(a)) || allergens.some(a => ingLower.includes(a))) {
                className += ' ingredient-bad';
                icon = '<i class="fas fa-exclamation-triangle"></i>';
            }

            return `<span class="${className}">${icon} ${this.sanitize(ingredient)}</span>`;
        });

        return `<div class="ingredients-list">${formattedIngredients.join('')}</div>`;
    }

    /**
     * Format pros/cons list
     */
    formatList(items) {
        if (!items || items.length === 0) return null;

        const listItems = items.map(item => 
            `<li>${this.sanitize(item)}</li>`
        ).join('');

        return `<ul>${listItems}</ul>`;
    }

    /**
     * Get compatibility class for styling
     */
    getCompatibilityClass(score) {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    }

    /**
     * Get compatibility label
     */
    getCompatibilityLabel(score) {
        if (score >= 85) return 'Excellent Match';
        if (score >= 70) return 'Good Match';
        if (score >= 50) return 'Fair Match';
        return 'Consider Alternatives';
    }

    /**
     * Get gradient color for product category
     */
    getProductGradient(category) {
        const gradients = {
            'skincare': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'haircare': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'fashion': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'makeup': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'beauty': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'default': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        };

        const categoryLower = category?.toLowerCase() || 'default';
        for (const [key, gradient] of Object.entries(gradients)) {
            if (categoryLower.includes(key)) return gradient;
        }
        return gradients.default;
    }

    /**
     * Get icon for product category
     */
    getCategoryIcon(category) {
        const icons = {
            'skincare': 'fa-heart',
            'haircare': 'fa-spray-can',
            'fashion': 'fa-tshirt',
            'makeup': 'fa-palette',
            'beauty': 'fa-gem',
            'default': 'fa-star'
        };

        const categoryLower = category?.toLowerCase() || 'default';
        for (const [key, icon] of Object.entries(icons)) {
            if (categoryLower.includes(key)) return icon;
        }
        return icons.default;
    }

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitize(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Generate complete recommendations HTML
     */
    generateRecommendationsHTML(response, userProfile) {
        if (!response || !response.products || response.products.length === 0) {
            return `
                <div class="no-recommendations">
                    <i class="fas fa-info-circle"></i>
                    <p>No specific product recommendations available at this time.</p>
                    <p>${this.sanitize(response?.generalAdvice || 'Please try rephrasing your question or providing more details.')}</p>
                </div>
            `;
        }

        const productsHTML = response.products.map((product, index) => 
            this.generateProductCardHTML(product, userProfile, index)
        ).join('');

        let html = '';

        // General advice section
        if (response.generalAdvice) {
            html += `
                <div class="ai-advice-section">
                    <div class="advice-header">
                        <i class="fas fa-sparkles"></i>
                        <h3>Personalized Advice</h3>
                    </div>
                    <p>${this.sanitize(response.generalAdvice)}</p>
                </div>
            `;
        }

        // Products section
        html += `
            <div class="products-grid">
                ${productsHTML}
            </div>
        `;

        // Additional tips
        if (response.additionalTips && response.additionalTips.length > 0) {
            const tipsHTML = response.additionalTips.map(tip => 
                `<li><i class="fas fa-check"></i> ${this.sanitize(tip)}</li>`
            ).join('');

            html += `
                <div class="additional-tips">
                    <h4><i class="fas fa-lightbulb"></i> Additional Tips</h4>
                    <ul>${tipsHTML}</ul>
                </div>
            `;
        }

        // Fallback indicator
        if (response.isFallback) {
            html += `
                <div class="fallback-notice">
                    <i class="fas fa-info-circle"></i>
                    <small>Note: These are general recommendations. For more personalized suggestions, please try again later.</small>
                </div>
            `;
        }

        return html;
    }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
