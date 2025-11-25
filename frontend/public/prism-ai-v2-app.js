// Prism AI 2.0 - Complete Application
// Integrates Appwrite, Gemini Search, Semantic Matching, and Ingredient Analysis

console.log('🚀 Prism AI 2.0 Loading...');

// Appwrite Configuration
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '68dd18860033ab7dffac',
    databaseId: '68dd21f50029362dfb7a',
    collectionId: 'user_preferences'
};

// Initialize Appwrite
const appwrite = new Appwrite.Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Appwrite.Databases(appwrite);
const account = new Appwrite.Account(appwrite);

// Quiz Questions with SVG Icons
const QUIZ_QUESTIONS = [
    {
        id: 1,
        field: 'skinType',
        question: "What's your skin type?",
        options: [
            { value: 'oily', label: 'Oily' },
            { value: 'dry', label: 'Dry' },
            { value: 'combination', label: 'Combination' },
            { value: 'normal', label: 'Normal' },
            { value: 'sensitive', label: 'Sensitive' }
        ]
    },
    {
        id: 2,
        field: 'skinConcern',
        question: "What's your primary skin concern?",
        options: [
            { value: 'acne', label: 'Acne & Breakouts' },
            { value: 'aging', label: 'Anti-Aging' },
            { value: 'dryness', label: 'Dryness' },
            { value: 'sensitivity', label: 'Sensitivity' },
            { value: 'pigmentation', label: 'Dark Spots' }
        ]
    },
    {
        id: 3,
        field: 'hairType',
        question: "What's your hair type?",
        options: [
            { value: 'straight', label: 'Straight' },
            { value: 'wavy', label: 'Wavy' },
            { value: 'curly', label: 'Curly' },
            { value: 'coily', label: 'Coily' }
        ]
    },
    {
        id: 4,
        field: 'hairTexture',
        question: "What's your hair texture?",
        options: [
            { value: 'fine', label: 'Fine' },
            { value: 'medium', label: 'Medium' },
            { value: 'thick', label: 'Thick' }
        ]
    },
    {
        id: 5,
        field: 'hairConcern',
        question: "What's your primary hair concern?",
        options: [
            { value: 'dryness', label: 'Dryness' },
            { value: 'frizz', label: 'Frizz' },
            { value: 'damage', label: 'Damage' },
            { value: 'thinning', label: 'Thinning' },
            { value: 'dandruff', label: 'Dandruff' }
        ]
    },
    {
        id: 6,
        field: 'stylePreference',
        question: "What's your style preference?",
        options: [
            { value: 'classic', label: 'Classic' },
            { value: 'trendy', label: 'Trendy' },
            { value: 'minimalist', label: 'Minimalist' },
            { value: 'bohemian', label: 'Bohemian' },
            { value: 'edgy', label: 'Edgy' }
        ]
    },
    {
        id: 7,
        field: 'skincareBudget',
        question: "What's your skincare budget?",
        options: [
            { value: 'budget', label: 'Under ₹1000' },
            { value: 'moderate', label: '₹1000-3000' },
            { value: 'premium', label: '₹3000-7000' },
            { value: 'luxury', label: '₹7000+' }
        ]
    },
    {
        id: 8,
        field: 'fashionBudget',
        question: "What's your fashion budget?",
        options: [
            { value: 'budget', label: 'Under ₹2000' },
            { value: 'moderate', label: '₹2000-5000' },
            { value: 'premium', label: '₹5000-15000' },
            { value: 'luxury', label: '₹15000+' }
        ]
    },
    {
        id: 9,
        field: 'shoppingFrequency',
        question: "How often do you shop?",
        options: [
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'seasonal', label: 'Seasonally' },
            { value: 'rarely', label: 'Rarely' }
        ]
    },
    {
        id: 10,
        field: 'occasions',
        question: "What occasions do you shop for?",
        options: [
            { value: 'daily', label: 'Daily Wear' },
            { value: 'work', label: 'Work/Office' },
            { value: 'party', label: 'Parties/Events' },
            { value: 'formal', label: 'Formal Events' },
            { value: 'casual', label: 'Casual Outings' }
        ]
    },
    {
        id: 11,
        field: 'ageRange',
        question: "What's your age range?",
        options: [
            { value: '18-24', label: '18-24' },
            { value: '25-34', label: '25-34' },
            { value: '35-44', label: '35-44' },
            { value: '45-54', label: '45-54' },
            { value: '55+', label: '55+' }
        ]
    },
    {
        id: 12,
        field: 'gender',
        question: "What's your gender?",
        options: [
            { value: 'female', label: 'Female' },
            { value: 'male', label: 'Male' },
            { value: 'non-binary', label: 'Non-Binary' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' }
        ]
    }
];

// SVG Icons for answers
const ANSWER_ICONS = {
    default: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/></svg>'
};

// Main Application Class
class PrismAI {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = QUIZ_QUESTIONS.length;
        this.answers = {};
        this.userId = null;

        this.elements = {
            startBtn: document.getElementById('start-quiz-btn'),
            quizModal: document.getElementById('quiz-modal'),
            quizClose: document.getElementById('quiz-close'),
            quizContent: document.getElementById('quiz-content'),
            quizProgress: document.getElementById('quiz-progress'),
            currentQ: document.getElementById('current-q'),
            totalQ: document.getElementById('total-q'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            chatSection: document.getElementById('chat-section'),
            chatMessages: document.getElementById('chat-messages'),
            userInput: document.getElementById('user-input'),
            sendBtn: document.getElementById('send-btn'),
            imageBtn: document.getElementById('image-btn'),
            imageInput: document.getElementById('image-input')
        };

        this.init();
    }

    async init() {
        console.log('✅ Initializing Prism AI 2.0');

        // Try to get current user
        try {
            const user = await account.get();
            this.userId = user.$id;
            console.log('✅ User logged in:', this.userId);

            // Try to load existing preferences
            await this.loadUserPreferences();
        } catch (error) {
            // User not logged in, create anonymous session
            this.userId = 'user_' + Date.now();
            console.log('📝 Anonymous user:', this.userId);
        }

        this.renderQuiz();
        this.setupEventListeners();
        this.updateProgress();
    }

    renderQuiz() {
        this.elements.quizContent.innerHTML = QUIZ_QUESTIONS.map((q, index) => `
            <div class="question-slide ${index === 0 ? 'active' : ''}" data-question="${q.id}">
                <h3 class="question-title">${q.question}</h3>
                <div class="answer-grid">
                    ${q.options.map(opt => `
                        <button class="answer-option" data-field="${q.field}" data-value="${opt.value}">
                            <div class="answer-icon">${ANSWER_ICONS.default}</div>
                            <span class="answer-label">${opt.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Start quiz
        this.elements.startBtn.addEventListener('click', () => this.showQuiz());
        this.elements.quizClose.addEventListener('click', () => this.skipQuiz());

        // Answer selection
        this.elements.quizContent.addEventListener('click', (e) => {
            const btn = e.target.closest('.answer-option');
            if (btn) this.selectAnswer(btn);
        });

        // Navigation
        this.elements.prevBtn.addEventListener('click', () => this.prevQuestion());
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());

        // Chat
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Image upload
        this.elements.imageBtn.addEventListener('click', () => {
            this.elements.imageInput.click();
        });
    }

    showQuiz() {
        this.elements.quizModal.style.display = 'flex';
        setTimeout(() => this.elements.quizModal.classList.add('active'), 10);
    }

    hideQuiz() {
        this.elements.quizModal.classList.remove('active');
        setTimeout(() => {
            this.elements.quizModal.style.display = 'none';
        }, 300);
    }

    skipQuiz() {
        this.hideQuiz();
        this.showChat();
        this.addAIMessage("You've skipped the quiz. I can still help, but my recommendations will be more general. What are you looking for today?");
    }

    selectAnswer(btn) {
        const field = btn.dataset.field;
        const value = btn.dataset.value;
        const slide = btn.closest('.question-slide');

        // Remove previous selection
        slide.querySelectorAll('.answer-option').forEach(b => b.classList.remove('selected'));

        // Mark as selected
        btn.classList.add('selected');

        // Store answer
        this.answers[field] = value;
        console.log('✅ Answer:', field, '=', value);

        // Auto-advance
        setTimeout(() => {
            if (this.currentQuestion < this.totalQuestions) {
                this.nextQuestion();
            } else {
                this.completeQuiz();
            }
        }, 400);
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            this.showQuestion(this.currentQuestion + 1);
        } else {
            this.completeQuiz();
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 1) {
            this.showQuestion(this.currentQuestion - 1);
        }
    }

    showQuestion(num) {
        document.querySelectorAll('.question-slide').forEach(slide => {
            slide.classList.remove('active');
        });

        const targetSlide = document.querySelector(`.question-slide[data-question="${num}"]`);
        if (targetSlide) {
            targetSlide.classList.add('active');
            this.currentQuestion = num;
            this.updateProgress();
        }
    }

    updateProgress() {
        const progress = (this.currentQuestion / this.totalQuestions) * 100;
        this.elements.quizProgress.style.width = `${progress}%`;
        this.elements.currentQ.textContent = this.currentQuestion;
        this.elements.totalQ.textContent = this.totalQuestions;

        this.elements.prevBtn.disabled = this.currentQuestion === 1;
        this.elements.nextBtn.innerHTML = this.currentQuestion === this.totalQuestions
            ? 'Complete <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-left: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : 'Next <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-left: 8px;"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    }

    async completeQuiz() {
        console.log('🎉 Quiz completed!', this.answers);

        // Save to Appwrite
        await this.saveUserPreferences();

        this.hideQuiz();
        this.showChat();

        const summary = this.generateSummary();
        this.addAIMessage(`✨ Perfect! I've saved your preferences:\n\n${summary}\n\nHow can I help you find the perfect products today?`);
    }

    async saveUserPreferences() {
        try {
            const data = {
                userId: this.userId,
                ...this.answers,
                allergens: '[]',
                preferredIngredients: '[]',
                avoidIngredients: '[]',
                updatedAt: new Date().toISOString()
            };

            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collectionId,
                this.userId,
                data
            );

            console.log('✅ Preferences saved to Appwrite');
        } catch (error) {
            if (error.code === 409) {
                // Document exists, update it
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collectionId,
                    this.userId,
                    { ...this.answers, updatedAt: new Date().toISOString() }
                );
                console.log('✅ Preferences updated in Appwrite');
            } else {
                console.error('Failed to save preferences:', error);
            }
        }
    }

    async loadUserPreferences() {
        try {
            const doc = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collectionId,
                this.userId
            );

            this.answers = { ...doc };
            console.log('✅ Loaded existing preferences');

            // Skip quiz if preferences exist
            this.showChat();
            this.addAIMessage("Welcome back! I remember your preferences. What are you looking for today?");
        } catch (error) {
            console.log('No existing preferences found');
        }
    }

    generateSummary() {
        const parts = [];
        if (this.answers.skinType) parts.push(`Skin: ${this.answers.skinType}`);
        if (this.answers.hairType) parts.push(`Hair: ${this.answers.hairType}`);
        if (this.answers.stylePreference) parts.push(`Style: ${this.answers.stylePreference}`);
        return parts.join(' • ');
    }

    showChat() {
        this.elements.chatSection.style.display = 'block';
        setTimeout(() => {
            this.elements.chatSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    async sendMessage() {
        const text = this.elements.userInput.value.trim();
        if (!text) return;

        // Add user message
        this.addUserMessage(text);
        this.elements.userInput.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            // Call backend API
            const response = await fetch('http://localhost:5000/api/recommend-v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userQuery: text,
                    userId: this.userId,
                    userProfile: this.answers
                })
            });

            const data = await response.json();
            this.removeTyping();

            if (data.success) {
                this.addAIMessage(data.text, data.product);
            } else {
                this.addAIMessage("Sorry, I encountered an error. Please try again.");
            }
        } catch (error) {
            console.error('API Error:', error);
            this.removeTyping();
            this.addAIMessage("I'm having trouble connecting to my AI brain. Please check if the backend is running.");
        }
    }

    addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'message user-message';
        msg.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="message-content"><p>${this.escapeHtml(text)}</p></div>
        `;
        this.elements.chatMessages.appendChild(msg);
        this.scrollToBottom();
    }

    addAIMessage(text, product = null) {
        const msg = document.createElement('div');
        msg.className = 'message ai-message';

        let content = `<div class="message-content"><p>${this.escapeHtml(text)}</p></div>`;

        if (product) {
            content += this.renderProductCard(product);
        }

        msg.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            </div>
            <div>${content}</div>
        `;

        this.elements.chatMessages.appendChild(msg);
        this.scrollToBottom();
    }

    renderProductCard(product) {
        return `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/550x220'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-header">
                        <h4 class="product-name">${product.name}</h4>
                        <span class="match-badge">${product.match_percentage || 85}% Match</span>
                    </div>
                    <p class="product-brand">${product.brand || 'Premium Brand'}</p>
                    <p class="product-price">${product.price || '₹999'}</p>
                    ${product.good_effects || product.bad_effects ? `
                        <div class="product-effects">
                            ${product.good_effects ? `
                                <div class="effect-item effect-good">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    ${product.good_effects[0] || 'Good for your skin'}
                                </div>
                            ` : ''}
                            ${product.bad_effects ? `
                                <div class="effect-item effect-bad">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    ${product.bad_effects[0] || 'May cause sensitivity'}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    <button class="buy-btn" onclick="window.open('${product.url || '#'}', '_blank')">
                        Buy Now
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-left: 8px;">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    showTyping() {
        const typing = document.createElement('div');
        typing.id = 'typing-indicator';
        typing.className = 'message ai-message';
        typing.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            </div>
            <div class="message-content"><p>Searching for perfect products...</p></div>
        `;
        this.elements.chatMessages.appendChild(typing);
        this.scrollToBottom();
    }

    removeTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Ready - Initializing Prism AI 2.0');
    window.prismAI = new PrismAI();
});

console.log('✅ Prism AI 2.0 Loaded Successfully');
