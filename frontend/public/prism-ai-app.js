// Prism AI - Complete Application
console.log('🚀 Loading Prism AI Application...');

// Quiz Questions Data
const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "What's your skin type?",
        field: 'skinType',
        options: [
            { value: 'oily', label: 'Oily', icon: 'fa-droplet' },
            { value: 'dry', label: 'Dry', icon: 'fa-sun' },
            { value: 'combination', label: 'Combination', icon: 'fa-balance-scale' },
            { value: 'normal', label: 'Normal', icon: 'fa-check-circle' },
            { value: 'sensitive', label: 'Sensitive', icon: 'fa-heart' },
            { value: 'unsure', label: 'Not Sure', icon: 'fa-question-circle' }
        ]
    },
    {
        id: 2,
        question: "What's your primary skin concern?",
        field: 'skinConcern',
        options: [
            { value: 'acne', label: 'Acne & Breakouts', icon: 'fa-ban' },
            { value: 'aging', label: 'Anti-Aging', icon: 'fa-hourglass-half' },
            { value: 'dryness', label: 'Dryness', icon: 'fa-tint-slash' },
            { value: 'sensitivity', label: 'Sensitivity', icon: 'fa-exclamation-triangle' },
            { value: 'pigmentation', label: 'Dark Spots', icon: 'fa-moon' },
            { value: 'pores', label: 'Large Pores', icon: 'fa-circle' }
        ]
    },
    {
        id: 3,
        question: "What's your hair type?",
        field: 'hairType',
        options: [
            { value: 'straight', label: 'Straight', icon: 'fa-grip-lines' },
            { value: 'wavy', label: 'Wavy', icon: 'fa-water' },
            { value: 'curly', label: 'Curly', icon: 'fa-wind' },
            { value: 'coily', label: 'Coily', icon: 'fa-tornado' },
            { value: 'bald', label: 'Bald/No Hair', icon: 'fa-circle-notch' }
        ]
    },
    {
        id: 4,
        question: "What's your hair texture?",
        field: 'hairTexture',
        options: [
            { value: 'fine', label: 'Fine', icon: 'fa-feather' },
            { value: 'medium', label: 'Medium', icon: 'fa-equals' },
            { value: 'thick', label: 'Thick', icon: 'fa-bars' },
            { value: 'na', label: 'N/A', icon: 'fa-minus' }
        ]
    },
    {
        id: 5,
        question: "What's your primary hair concern?",
        field: 'hairConcern',
        options: [
            { value: 'dryness', label: 'Dryness', icon: 'fa-sun' },
            { value: 'frizz', label: 'Frizz', icon: 'fa-bolt' },
            { value: 'damage', label: 'Damage', icon: 'fa-exclamation-triangle' },
            { value: 'thinning', label: 'Thinning', icon: 'fa-arrow-down' },
            { value: 'dandruff', label: 'Dandruff', icon: 'fa-snowflake' },
            { value: 'none', label: 'None', icon: 'fa-check' }
        ]
    },
    {
        id: 6,
        question: "What's your style preference?",
        field: 'stylePreference',
        options: [
            { value: 'classic', label: 'Classic', icon: 'fa-gem' },
            { value: 'trendy', label: 'Trendy', icon: 'fa-fire' },
            { value: 'minimalist', label: 'Minimalist', icon: 'fa-circle' },
            { value: 'bohemian', label: 'Bohemian', icon: 'fa-leaf' },
            { value: 'edgy', label: 'Edgy', icon: 'fa-bolt' },
            { value: 'romantic', label: 'Romantic', icon: 'fa-heart' }
        ]
    },
    {
        id: 7,
        question: "What's your skincare budget?",
        field: 'skincareBudget',
        options: [
            { value: 'budget', label: 'Budget (Under ₹1000)', icon: 'fa-rupee-sign' },
            { value: 'moderate', label: 'Moderate (₹1000-3000)', icon: 'fa-rupee-sign' },
            { value: 'premium', label: 'Premium (₹3000-7000)', icon: 'fa-rupee-sign' },
            { value: 'luxury', label: 'Luxury (₹7000+)', icon: 'fa-gem' }
        ]
    },
    {
        id: 8,
        question: "What's your fashion budget?",
        field: 'fashionBudget',
        options: [
            { value: 'budget', label: 'Budget (Under ₹2000)', icon: 'fa-rupee-sign' },
            { value: 'moderate', label: 'Moderate (₹2000-5000)', icon: 'fa-rupee-sign' },
            { value: 'premium', label: 'Premium (₹5000-15000)', icon: 'fa-rupee-sign' },
            { value: 'luxury', label: 'Luxury (₹15000+)', icon: 'fa-gem' }
        ]
    },
    {
        id: 9,
        question: "How often do you shop?",
        field: 'shoppingFrequency',
        options: [
            { value: 'weekly', label: 'Weekly', icon: 'fa-calendar-week' },
            { value: 'monthly', label: 'Monthly', icon: 'fa-calendar-alt' },
            { value: 'seasonal', label: 'Seasonally', icon: 'fa-calendar' },
            { value: 'rarely', label: 'Rarely', icon: 'fa-clock' }
        ]
    },
    {
        id: 10,
        question: "What occasions do you shop for?",
        field: 'occasions',
        options: [
            { value: 'daily', label: 'Daily Wear', icon: 'fa-home' },
            { value: 'work', label: 'Work/Office', icon: 'fa-briefcase' },
            { value: 'party', label: 'Parties/Events', icon: 'fa-champagne-glasses' },
            { value: 'formal', label: 'Formal Events', icon: 'fa-user-tie' },
            { value: 'casual', label: 'Casual Outings', icon: 'fa-walking' },
            { value: 'all', label: 'All Occasions', icon: 'fa-star' }
        ]
    },
    {
        id: 11,
        question: "What's your age range?",
        field: 'ageRange',
        options: [
            { value: '18-24', label: '18-24', icon: 'fa-user' },
            { value: '25-34', label: '25-34', icon: 'fa-user' },
            { value: '35-44', label: '35-44', icon: 'fa-user' },
            { value: '45-54', label: '45-54', icon: 'fa-user' },
            { value: '55+', label: '55+', icon: 'fa-user' }
        ]
    },
    {
        id: 12,
        question: "What's your gender?",
        field: 'gender',
        options: [
            { value: 'female', label: 'Female', icon: 'fa-venus' },
            { value: 'male', label: 'Male', icon: 'fa-mars' },
            { value: 'non-binary', label: 'Non-Binary', icon: 'fa-genderless' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: 'fa-user' }
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

        // Render quiz
        this.renderQuizQuestions();
        this.setupEventListeners();
        this.updateProgress();

        // Show modal after short delay
        setTimeout(() => this.showModal(), 500);
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
            this.updateBackendStatus(false, 'AI Backend Offline (Fallback Mode)');
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
                        <button class="answer-btn" data-value="${opt.value}" data-field="${q.field}">
                            <i class="fas ${opt.icon}"></i>
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
        const questionCard = btn.closest('.question-card');

        // Remove selected class from all buttons in this question
        questionCard.querySelectorAll('.answer-btn').forEach(b => {
            b.classList.remove('selected');
        });

        // Add selected class to clicked button
        btn.classList.add('selected');

        // Store answer
        this.answers[field] = value;
        console.log('✅ Answer selected:', field, '=', value);

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
            this.elements.nextBtn.innerHTML = this.currentQuestion === this.totalQuestions
                ? 'Complete <i class="fas fa-check"></i>'
                : 'Next <i class="fas fa-arrow-right"></i>';
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

    completeQuiz() {
        console.log('🎉 Quiz completed!', this.answers);
        this.hideModal();
        this.showChatInterface();

        const profileSummary = this.generateProfileSummary();
        this.addWelcomeMessage(`✨ Perfect! I've created your personalized profile:\n\n${profileSummary}\n\nHow can I help you find the perfect products today?`);
    }

    generateProfileSummary() {
        const parts = [];
        if (this.answers.skinType) parts.push(`Skin: ${this.answers.skinType}`);
        if (this.answers.hairType) parts.push(`Hair: ${this.answers.hairType}`);
        if (this.answers.stylePreference) parts.push(`Style: ${this.answers.stylePreference}`);
        if (this.answers.skincareBudget) parts.push(`Skincare Budget: ${this.answers.skincareBudget}`);
        return parts.join(' • ');
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
            <div class="message-avatar"><i class="fas fa-user"></i></div>
            <div>${content}</div>
        `;

        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addAIMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content"><p>${this.escapeHtml(text)}</p></div>
        `;
        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
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
            // Call backend API or use fallback
            const response = await this.getRecommendations(text, imageFile);
            this.removeTypingIndicator();

            // Display AI response
            if (response && response.text) {
                this.addAIMessage(response.text);
            }
        } catch (error) {
            console.error('Error getting recommendations:', error);
            this.removeTypingIndicator();
            this.addAIMessage("I'm sorry, I encountered an error. Please try again or check if the AI backend is online.");
        }
    }

    async getRecommendations(query, imageFile) {
        if (this.backendOnline) {
            try {
                const formData = new FormData();
                formData.append('query', query);
                formData.append('userProfile', JSON.stringify(this.answers));
                if (imageFile) {
                    formData.append('image', imageFile);
                }

                const response = await fetch('http://localhost:5000/api/recommend', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn('Backend request failed, using fallback');
            }
        }

        // Fallback response
        return this.getFallbackResponse(query);
    }

    getFallbackResponse(query) {
        const responses = [
            `Based on your query "${query}" and your ${this.answers.skinType || 'unique'} skin type, I recommend exploring hydrating serums and gentle cleansers. Visit Nykaa or Amazon India for the best deals!`,
            `For ${this.answers.stylePreference || 'your'} style preferences, I suggest checking out the latest collections on Myntra and Ajio. They have great options that match your taste!`,
            `Given your ${this.answers.hairType || 'beautiful'} hair, I recommend sulfate-free shampoos and nourishing hair masks. Check out the curated selections on Nykaa!`,
            `Your ${this.answers.fashionBudget || 'moderate'} budget opens up wonderful possibilities! I suggest exploring both premium and affordable brands on Flipkart Fashion.`
        ];

        return {
            text: responses[Math.floor(Math.random() * responses.length)]
        };
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'message ai-message typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
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
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100px; border-radius: 8px;">
                        <button onclick="window.prismAI.clearImagePreview()" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-times"></i>
                        </button>
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

console.log('✅ Prism AI Application Loaded Successfully');
