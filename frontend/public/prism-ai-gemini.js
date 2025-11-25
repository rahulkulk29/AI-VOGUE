// Prism AI - Complete Gemini Integration with Appwrite
console.log('🚀 Loading Prism AI with Gemini Integration...');

// Configuration
const CONFIG = {
    GEMINI_API_URL: 'http://localhost:5000/api/recommend',
    APPWRITE_ENDPOINT: 'https://cloud.appwrite.io/v1',
    APPWRITE_PROJECT_ID: '', // Will be provided by user
    APPWRITE_DATABASE_ID: '', // Will be provided by user
    APPWRITE_COLLECTION_ID: '' // Will be provided by user
};

// Quiz Questions Data with SVG icons
const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "What's your skin type?",
        field: 'skinType',
        category: 'skincare',
        options: [
            { value: 'oily', label: 'Oily', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' },
            { value: 'dry', label: 'Dry', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>' },
            { value: 'combination', label: 'Combination', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/></svg>' },
            { value: 'normal', label: 'Normal', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>' },
            { value: 'sensitive', label: 'Sensitive', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
            { value: 'unsure', label: 'Not Sure', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>' }
        ]
    },
    {
        id: 2,
        question: "What's your primary skin concern?",
        field: 'skinConcern',
        category: 'skincare',
        options: [
            { value: 'acne', label: 'Acne & Breakouts', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' },
            { value: 'aging', label: 'Anti-Aging', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
            { value: 'dryness', label: 'Dryness', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><line x1="8" y1="12" x2="16" y2="12"/></svg>' },
            { value: 'sensitivity', label: 'Sensitivity', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' },
            { value: 'pigmentation', label: 'Dark Spots', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>' },
            { value: 'pores', label: 'Large Pores', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="10" r="1"/><circle cx="16" cy="10" r="1"/><circle cx="12" cy="14" r="1"/></svg>' }
        ]
    },
    {
        id: 3,
        question: "What's your hair type?",
        field: 'hairType',
        category: 'haircare',
        options: [
            { value: 'straight', label: 'Straight', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="8" y1="5" x2="8" y2="19"/><line x1="16" y1="5" x2="16" y2="19"/></svg>' },
            { value: 'wavy', label: 'Wavy', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 6 0"/></svg>' },
            { value: 'curly', label: 'Curly', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12c0-4 2-6 4-6s4 2 4 6-2 6-4 6-4-2-4-6zM13 12c0-4 2-6 4-6s4 2 4 6-2 6-4 6-4-2-4-6z"/></svg>' },
            { value: 'coily', label: 'Coily', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/></svg>' },
            { value: 'bald', label: 'Bald/No Hair', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/></svg>' }
        ]
    },
    {
        id: 4,
        question: "What's your hair texture?",
        field: 'hairTexture',
        category: 'haircare',
        options: [
            { value: 'fine', label: 'Fine', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke-width="1"/></svg>' },
            { value: 'medium', label: 'Medium', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/></svg>' },
            { value: 'thick', label: 'Thick', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke-width="3"/></svg>' },
            { value: 'na', label: 'N/A', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' }
        ]
    },
    {
        id: 5,
        question: "What's your primary hair concern?",
        field: 'hairConcern',
        category: 'haircare',
        options: [
            { value: 'dryness', label: 'Dryness', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' },
            { value: 'frizz', label: 'Frizz', icon: '<svg viewBox="0 0 24 24" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>' },
            { value: 'damage', label: 'Damage', icon: '<svg viewBox="0 0 24 24" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
            { value: 'thinning', label: 'Thinning', icon: '<svg viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
            { value: 'dandruff', label: 'Dandruff', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/></svg>' },
            { value: 'none', label: 'None', icon: '<svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"/></svg>' }
        ]
    },
    {
        id: 6,
        question: "What's your style preference?",
        field: 'stylePreference',
        category: 'fashion',
        options: [
            { value: 'classic', label: 'Classic', icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>' },
            { value: 'trendy', label: 'Trendy', icon: '<svg viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
            { value: 'minimalist', label: 'Minimalist', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/></svg>' },
            { value: 'bohemian', label: 'Bohemian', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
            { value: 'edgy', label: 'Edgy', icon: '<svg viewBox="0 0 24 24" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
            { value: 'romantic', label: 'Romantic', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' }
        ]
    },
    {
        id: 7,
        question: "What's your skincare budget?",
        field: 'skincareBudget',
        category: 'skincare',
        options: [
            { value: 'budget', label: 'Under ₹1000', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
            { value: 'moderate', label: '₹1000-3000', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
            { value: 'premium', label: '₹3000-7000', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
            { value: 'luxury', label: '₹7000+', icon: '<svg viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' }
        ]
    },
    {
        id: 8,
        question: "What's your fashion budget?",
        field: 'fashionBudget',
        category: 'fashion',
        options: [
            { value: 'budget', label: 'Under ₹2000', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
            { value: 'moderate', label: '₹2000-5000', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
            { value: 'premium', label: '₹5000-15000', icon: '<svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
            { value: 'luxury', label: '₹15000+', icon: '<svg viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' }
        ]
    },
    {
        id: 9,
        question: "How often do you shop?",
        field: 'shoppingFrequency',
        category: 'general',
        options: [
            { value: 'weekly', label: 'Weekly', icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
            { value: 'monthly', label: 'Monthly', icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
            { value: 'seasonal', label: 'Seasonally', icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
            { value: 'rarely', label: 'Rarely', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' }
        ]
    },
    {
        id: 10,
        question: "What occasions do you shop for?",
        field: 'occasions',
        category: 'fashion',
        options: [
            { value: 'daily', label: 'Daily Wear', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
            { value: 'work', label: 'Work/Office', icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
            { value: 'party', label: 'Parties/Events', icon: '<svg viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
            { value: 'formal', label: 'Formal Events', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
            { value: 'casual', label: 'Casual Outings', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>' },
            { value: 'all', label: 'All Occasions', icon: '<svg viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' }
        ]
    },
    {
        id: 11,
        question: "What's your age range?",
        field: 'ageRange',
        category: 'general',
        options: [
            { value: '18-24', label: '18-24', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
            { value: '25-34', label: '25-34', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
            { value: '35-44', label: '35-44', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
            { value: '45-54', label: '45-54', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
            { value: '55+', label: '55+', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
        ]
    },
    {
        id: 12,
        question: "What's your gender?",
        field: 'gender',
        category: 'general',
        options: [
            { value: 'female', label: 'Female', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="5"/><path d="M12 13v8m-4 0h8"/></svg>' },
            { value: 'male', label: 'Male', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="10" cy="14" r="5"/><path d="M14.5 5.5l5-5m0 0v5m0-5h-5"/><path d="M14 10l2-2"/></svg>' },
            { value: 'non-binary', label: 'Non-Binary', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/></svg>' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
        ]
    }
];

// Prism AI Application Class
class PrismAI {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 12;
        this.answers = {};
        this.backendOnline = false;
        this.userId = null;
        this.appwrite = null;

        this.elements = {
            modal: document.getElementById('onboarding-modal'),
            chatSection: document.getElementById('chat-section'),
            quizContent: document.getElementById('quiz-content'),
            progressFill: document.getElementById('progress-fill'),
            currentQuestionSpan: document.getElementById('current-question'),
            totalQuestionsSpan: document.getElementById('total-questions'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            closeBtn: document.getElementById('close-quiz-btn'),
            chatMessages: document.getElementById('chat-messages'),
            userInput: document.getElementById('user-input'),
            sendBtn: document.getElementById('send-btn'),
            imageUpload: document.getElementById('image-upload'),
            imageInput: document.getElementById('image-input'),
            imagePreview: document.getElementById('image-preview'),
            backendStatus: document.getElementById('backend-status'),
            statusText: document.getElementById('status-text')
        };

        this.init();
    }

    async init() {
        console.log('✅ Initializing Prism AI Application');

        // Check backend status
        await this.checkBackendStatus();

        // Initialize Appwrite if credentials provided
        if (CONFIG.APPWRITE_PROJECT_ID) {
            await this.initializeAppwrite();
        }

        // Render quiz
        this.renderQuizQuestions();
        this.setupEventListeners();
        this.updateProgress();

        // Show modal after short delay
        setTimeout(() => this.showModal(), 500);
    }

    async initializeAppwrite() {
        try {
            // Initialize Appwrite SDK (to be implemented when credentials are provided)
            console.log('📱 Appwrite initialization pending - credentials needed');
        } catch (error) {
            console.error('Appwrite initialization failed:', error);
        }
    }

    async checkBackendStatus() {
        try {
            const response = await fetch('http://localhost:5000/health', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                this.backendOnline = true;
                this.updateBackendStatus(true, 'AI Backend Online');
            } else {
                throw new Error('Backend not responding');
            }
        } catch (error) {
            console.warn('Backend offline, using fallback mode');
            this.backendOnline = false;
            this.updateBackendStatus(false, 'AI Offline (Fallback)');
        }
    }

    updateBackendStatus(online, text) {
        const statusEl = this.elements.backendStatus;
        const dotEl = statusEl.querySelector('.status-dot');

        if (online) {
            statusEl.classList.remove('offline');
            statusEl.classList.add('online');
            dotEl.classList.remove('offline');
            dotEl.classList.add('online');
        } else {
            statusEl.classList.remove('online');
            statusEl.classList.add('offline');
            dotEl.classList.remove('online');
            dotEl.classList.add('offline');
        }

        this.elements.statusText.textContent = text;
    }

    renderQuizQuestions() {
        if (!this.elements.quizContent) return;

        this.elements.quizContent.innerHTML = QUIZ_QUESTIONS.map((q, index) => `
            <div class="question-card ${index === 0 ? 'active' : ''}" data-question="${q.id}">
                <h3>${q.question}</h3>
                <div class="answer-options">
                    ${q.options.map(opt => `
                        <button class="answer-btn" data-value="${opt.value}" data-field="${q.field}" data-category="${q.category}">
                            ${opt.icon}
                            <span>${opt.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Answer buttons - use event delegation
        this.elements.quizContent.addEventListener('click', (e) => {
            const btn = e.target.closest('.answer-btn');
            if (btn) this.selectAnswer(btn);
        });

        // Navigation buttons
        this.elements.prevBtn?.addEventListener('click', () => this.prevQuestion());
        this.elements.nextBtn?.addEventListener('click', () => this.nextQuestion());
        this.elements.closeBtn?.addEventListener('click', () => this.skipQuiz());

        // Chat interface
        this.elements.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.elements.userInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Image upload
        this.elements.imageUpload?.addEventListener('click', () => {
            this.elements.imageInput.click();
        });
        this.elements.imageInput?.addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });
    }

    selectAnswer(btn) {
        const value = btn.dataset.value;
        const field = btn.dataset.field;
        const category = btn.dataset.category;
        const questionCard = btn.closest('.question-card');

        // Remove selected class from all buttons in this question
        questionCard.querySelectorAll('.answer-btn').forEach(b => {
            b.classList.remove('selected');
        });

        // Add selected class to clicked button
        btn.classList.add('selected');

        // Store answer with category
        this.answers[field] = { value, category };
        console.log('✅ Answer selected:', field, '=', value, `(${category})`);

        // Auto-advance after short delay
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

    showQuestion(questionNumber) {
        // Hide all questions
        document.querySelectorAll('.question-card').forEach(card => {
            card.classList.remove('active');
        });

        // Show target question
        const targetCard = document.querySelector(`.question-card[data-question="${questionNumber}"]`);
        if (targetCard) {
            targetCard.classList.add('active');
            this.currentQuestion = questionNumber;
            this.updateProgress();
        }
    }

    updateProgress() {
        const progress = (this.currentQuestion / this.totalQuestions) * 100;

        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress}%`;
        }
        if (this.elements.currentQuestionSpan) {
            this.elements.currentQuestionSpan.textContent = this.currentQuestion;
        }
        if (this.elements.totalQuestionsSpan) {
            this.elements.totalQuestionsSpan.textContent = this.totalQuestions;
        }

        // Update button states
        if (this.elements.prevBtn) {
            this.elements.prevBtn.disabled = this.currentQuestion === 1;
        }
        if (this.elements.nextBtn) {
            const isLast = this.currentQuestion === this.totalQuestions;
            this.elements.nextBtn.innerHTML = isLast
                ? 'Complete <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-left: 0.5rem;"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                : 'Next <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-left: 0.5rem;"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        }
    }

    showModal() {
        if (this.elements.modal) {
            this.elements.modal.classList.add('active');
            this.elements.modal.style.display = 'flex';
            console.log('✅ Onboarding modal displayed');
        }
    }

    hideModal() {
        if (this.elements.modal) {
            this.elements.modal.classList.remove('active');
            setTimeout(() => {
                this.elements.modal.style.display = 'none';
            }, 300);
        }
    }

    skipQuiz() {
        console.log('⏭️ Quiz skipped by user');
        this.hideModal();
        this.showChatInterface();
        this.addWelcomeMessage("You've skipped the personalization quiz. I can still help you, but my recommendations will be more general. Feel free to ask me anything about beauty and fashion!");
    }

    async completeQuiz() {
        console.log('🎉 Quiz completed!', this.answers);

        // Save to Appwrite if available
        if (CONFIG.APPWRITE_PROJECT_ID && this.userId) {
            await this.savePreferencesToAppwrite();
        }

        this.hideModal();
        this.showChatInterface();

        const profileSummary = this.generateProfileSummary();
        this.addWelcomeMessage(`✨ Perfect! I've created your personalized profile:\n\n${profileSummary}\n\nHow can I help you find the perfect products today?`);
    }

    async savePreferencesToAppwrite() {
        try {
            // Save preferences to Appwrite database
            console.log('💾 Saving preferences to Appwrite...');
            // Implementation pending Appwrite credentials
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }

    generateProfileSummary() {
        const parts = [];
        Object.entries(this.answers).forEach(([key, data]) => {
            if (data && data.value) {
                const label = key.replace(/([A-Z])/g, ' $1').trim();
                parts.push(`${label}: ${data.value}`);
            }
        });
        return parts.slice(0, 4).join(' • ');
    }

    showChatInterface() {
        if (this.elements.chatSection) {
            this.elements.chatSection.style.display = 'block';
            console.log('✅ Chat interface displayed');

            // Scroll to chat section
            setTimeout(() => {
                this.elements.chatSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    addWelcomeMessage(text) {
        this.addAIMessage(text);
    }

    addUserMessage(text, imageFile = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';

        let content = '';
        if (imageFile) {
            const imageUrl = URL.createObjectURL(imageFile);
            content += `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 200px; border-radius: 12px; margin-bottom: 10px; display: block;">`;
        }
        if (text) {
            content += `<div class="message-content"><p>${this.escapeHtml(text)}</p></div>`;
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div>${content}</div>
        `;

        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addAIMessage(text, product = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';

        let content = `<div class="message-content"><p>${this.escapeHtml(text)}</p></div>`;

        // Add product recommendation if provided
        if (product) {
            content += this.renderProductCard(product);
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            </div>
            <div>${content}</div>
        `;

        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    renderProductCard(product) {
        return `
            <div class="product-recommendation">
                <img src="${product.image}" alt="${product.name}" class="product-rec-image">
                <div class="product-rec-content">
                    <div class="product-rec-header">
                        <h4 class="product-rec-title">${product.name}</h4>
                        <span class="match-badge">${product.matchPercentage}% Match</span>
                    </div>
                    <div class="product-rec-price">₹${product.price}</div>
                    <div class="product-rec-effects">
                        <div class="effect-item effect-good">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 0.3rem;">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            ${product.goodEffect}
                        </div>
                        <div class="effect-item effect-bad">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 0.3rem;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            ${product.badEffect}
                        </div>
                    </div>
                    <button class="buy-now-btn" onclick="window.open('${product.buyLink}', '_blank')">
                        Buy Now
                    </button>
                </div>
            </div>
        `;
    }

    async sendMessage() {
        const text = this.elements.userInput.value.trim();
        const imageFile = this.elements.imageInput.files[0];

        if (!text && !imageFile) return;

        // Add user message
        this.addUserMessage(text, imageFile);

        // Clear input
        this.elements.userInput.value = '';
        this.clearImagePreview();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get category-specific preferences
            const relevantPreferences = this.getRelevantPreferences(text);

            // Call Gemini API
            const response = await this.getGeminiRecommendations(text, relevantPreferences, imageFile);
            this.removeTypingIndicator();

            // Display AI response with product
            if (response) {
                this.addAIMessage(response.text, response.product);
            }
        } catch (error) {
            console.error('Error getting recommendations:', error);
            this.removeTypingIndicator();
            this.addAIMessage("I'm sorry, I encountered an error. Please try again or check if the AI backend is online.");
        }
    }

    getRelevantPreferences(query) {
        const queryLower = query.toLowerCase();
        const relevantPrefs = {};

        // Determine query category
        let category = 'general';
        if (queryLower.includes('skin') || queryLower.includes('face') || queryLower.includes('cream') || queryLower.includes('serum')) {
            category = 'skincare';
        } else if (queryLower.includes('hair') || queryLower.includes('shampoo') || queryLower.includes('conditioner')) {
            category = 'haircare';
        } else if (queryLower.includes('dress') || queryLower.includes('shirt') || queryLower.includes('pants') || queryLower.includes('fashion')) {
            category = 'fashion';
        }

        // Filter preferences by category
        Object.entries(this.answers).forEach(([key, data]) => {
            if (data && (data.category === category || data.category === 'general')) {
                relevantPrefs[key] = data.value;
            }
        });

        console.log('📊 Relevant preferences for query:', relevantPrefs);
        return relevantPrefs;
    }

    async getGeminiRecommendations(query, preferences, imageFile) {
        if (this.backendOnline) {
            try {
                const formData = new FormData();
                formData.append('query', query);
                formData.append('userProfile', JSON.stringify(preferences));
                if (imageFile) {
                    formData.append('image', imageFile);
                }

                const response = await fetch(CONFIG.GEMINI_API_URL, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    return this.parseGeminiResponse(data);
                }
            } catch (error) {
                console.warn('Gemini API request failed, using fallback');
            }
        }

        // Fallback response
        return this.getFallbackResponse(query, preferences);
    }

    parseGeminiResponse(data) {
        // Parse Gemini response and extract product recommendation
        return {
            text: data.text || data.response || 'Here\'s what I found for you:',
            product: data.product || null
        };
    }

    getFallbackResponse(query, preferences) {
        // Generate intelligent fallback based on preferences
        const prefSummary = Object.entries(preferences).map(([k, v]) => `${k}: ${v}`).join(', ');

        return {
            text: `Based on your query "${query}" and your preferences (${prefSummary}), I recommend exploring products on Nykaa, Amazon India, or Myntra. For the best results, please ensure the AI backend is online.`,
            product: {
                name: 'Sample Product - AI Offline',
                price: '999',
                image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
                matchPercentage: 85,
                goodEffect: 'Matches your preferences',
                badEffect: 'AI backend offline - limited data',
                buyLink: 'https://www.nykaa.com'
            }
        };
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'message ai-message typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            </div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.elements.chatMessages.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.elements.imagePreview.innerHTML = `
                    <div style="position: relative; display: inline-block; margin-bottom: 10px;">
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100px; border-radius: 8px; border: 2px solid var(--color-beige);">
                        <button onclick="window.prismAI.clearImagePreview()" style="position: absolute; top: -8px; right: -8px; background: var(--color-dark-green); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">&times;</button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    clearImagePreview() {
        this.elements.imageInput.value = '';
        this.elements.imagePreview.innerHTML = '';
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

// Initialize Prism AI when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ DOM Loaded - Initializing Prism AI');
    window.prismAI = new PrismAI();
});

// Function to set Appwrite credentials (call this with your credentials)
window.setPrismAICredentials = function (projectId, databaseId, collectionId) {
    CONFIG.APPWRITE_PROJECT_ID = projectId;
    CONFIG.APPWRITE_DATABASE_ID = databaseId;
    CONFIG.APPWRITE_COLLECTION_ID = collectionId;
    console.log('✅ Appwrite credentials configured');
};

console.log('✅ Prism AI with Gemini Integration Loaded Successfully');
console.log('📝 To set Appwrite credentials, call: window.setPrismAICredentials(projectId, databaseId, collectionId)');
