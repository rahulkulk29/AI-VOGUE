// Prism AI - Main Application Logic (Global Mode)
// Integrates Appwrite, Gemini AI, and Recommendation Engine

console.log('🚀 PrismAI script loading...');

class PrismAI {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 12;
        this.answers = {};
        this.isProcessing = false;
        this.chatHistory = [];
        this.autoAdvanceTimeout = null;

        // DOM Elements
        this.elements = {
            onboardingModal: document.getElementById('onboarding-modal'),
            chatSection: document.getElementById('chat-section'),
            progressBar: document.querySelector('.progress-fill'),
            currentQuestionSpan: document.getElementById('current-question'),
            chatMessages: document.getElementById('chat-messages'),
            userInput: document.getElementById('user-input'),
            sendBtn: document.getElementById('send-btn'),
            imageUpload: document.getElementById('image-upload'),
            imageInput: document.getElementById('image-input'),
            imagePreview: document.getElementById('image-preview'),
            authButton: document.getElementById('authButton'),
            closeQuizBtn: document.getElementById('close-quiz-btn')
        };

        this.init();
    }

    async init() {
        console.log('✨ Initializing Prism AI...');

        // Check authentication
        const isAuth = await window.authService.isAuthenticated();
        this.updateAuthUI(isAuth);

        // Setup event listeners
        this.setupEventListeners();

        // Check onboarding status
        await this.checkOnboardingStatus();
    }

    updateAuthUI(isAuthenticated) {
        if (this.elements.authButton) {
            this.elements.authButton.innerHTML = isAuthenticated ?
                '<i class="fas fa-user-check"></i>' :
                '<i class="fas fa-user"></i>';
        }
    }

    setupEventListeners() {
        // Answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAnswer(e));
        });

        // Navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevQuestion());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());

        // Chat interface
        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (this.elements.userInput) {
            this.elements.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Image upload
        if (this.elements.imageUpload && this.elements.imageInput) {
            this.elements.imageUpload.addEventListener('click', () => {
                this.elements.imageInput.click();
            });

            this.elements.imageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }

        // Close quiz button
        if (this.elements.closeQuizBtn) {
            this.elements.closeQuizBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close quiz button clicked');
                this.closeQuiz();
            });
        }
    }

    async checkOnboardingStatus() {
        try {
            const user = await window.authService.getCurrentUser();
            if (user) {
                // Check if user has completed onboarding
                const preferences = await window.preferencesService.getPreferences(user.$id);

                // If we have preferences, assume onboarding is complete
                if (preferences && Object.keys(preferences).length > 0) {
                    this.showChatInterface();
                    return;
                }
            }

            // Otherwise show onboarding
            this.showOnboarding();

        } catch (error) {
            console.error('Error checking status:', error);
            this.showOnboarding();
        }
    }

    showOnboarding() {
        if (this.elements.onboardingModal) {
            this.elements.onboardingModal.style.display = 'flex';
            this.elements.chatSection.style.display = 'none';
            this.showQuestion(1);
        }
    }

    showChatInterface() {
        if (this.elements.onboardingModal) {
            this.elements.onboardingModal.style.display = 'none';
            this.elements.chatSection.style.display = 'flex';

            // Add welcome message if chat is empty
            if (this.elements.chatMessages && this.elements.chatMessages.children.length === 0) {
                this.addAIResponse({
                    text: "Welcome to Prism AI! I've analyzed your profile and I'm ready to help you find the perfect beauty and fashion products. How can I assist you today?"
                });
            }
        }
    }

    closeQuiz() {
        console.log('Closing quiz...');
        if (this.elements.onboardingModal) {
            this.elements.onboardingModal.style.display = 'none';
            this.elements.chatSection.style.display = 'flex';

            // Mark as completed in session/local storage so it doesn't pop up again immediately
            // (Optional: save a "skipped" preference)
            this.addAIResponse({
                text: "You've skipped the onboarding quiz. I can still help you, but my recommendations will be more generic. You can update your profile later!"
            });
        }
    }

    showQuestion(questionNumber) {
        // Hide all questions
        document.querySelectorAll('.question-card').forEach(card => {
            card.classList.remove('active');
        });

        // Show current question
        const currentCard = document.querySelector(`.question-card[data-question="${questionNumber}"]`);
        if (currentCard) {
            currentCard.classList.add('active');
            this.currentQuestion = questionNumber;
            this.updateProgress();
        } else {
            console.error(`Question ${questionNumber} not found!`);
            // Fallback: if question not found, maybe we are done?
            if (questionNumber > this.totalQuestions) {
                this.completeOnboarding();
            }
        }
    }

    updateProgress() {
        if (this.elements.progressBar) {
            const progress = (this.currentQuestion / this.totalQuestions) * 100;
            this.elements.progressBar.style.width = `${progress}%`;
        }
        if (this.elements.currentQuestionSpan) {
            this.elements.currentQuestionSpan.textContent = this.currentQuestion;
        }
    }

    selectAnswer(e) {
        const btn = e.currentTarget;
        const value = btn.dataset.value;
        const questionCard = btn.closest('.question-card');
        const questionId = questionCard.dataset.question;

        // Remove active class from siblings
        questionCard.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Save answer
        this.mapAnswerToPreference(questionId, value);

        // Clear any existing timeout to prevent double-skipping
        if (this.autoAdvanceTimeout) {
            clearTimeout(this.autoAdvanceTimeout);
        }

        // Auto advance after delay
        this.autoAdvanceTimeout = setTimeout(() => {
            this.nextQuestion();
        }, 500);
    }

    mapAnswerToPreference(questionId, value) {
        const mapping = {
            '1': 'skinType',
            '2': 'skinConcern',
            '3': 'hairType',
            '4': 'hairTexture',
            '5': 'hairConcern',
            '6': 'stylePreference',
            '7': 'skincareBudget',
            '8': 'fashionBudget',
            '9': 'shoppingFrequency',
            '10': 'occasions',
            '11': 'ageRange',
            '12': 'gender'
        };

        const field = mapping[questionId];
        if (field) {
            this.answers[field] = value;
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 1) {
            this.showQuestion(this.currentQuestion - 1);
        }
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            this.showQuestion(this.currentQuestion + 1);
        } else {
            this.completeOnboarding();
        }
    }

    async completeOnboarding() {
        console.log('Onboarding completed!', this.answers);

        // Show loading state
        if (this.elements.onboardingModal) {
            const content = this.elements.onboardingModal.querySelector('.quiz-content');
            if (content) {
                content.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Creating your personalized profile...</p></div>';
            }
        }

        try {
            // Save preferences
            await window.preferencesService.savePreferences(this.answers);

            // Switch to chat
            this.showChatInterface();

            // Initial greeting
            this.addAIResponse({
                text: "Thanks for sharing! I've built your personalized profile. I can now recommend products that match your specific skin type, hair needs, and style preferences. What are you looking for today?"
            });

        } catch (error) {
            console.error('Error saving preferences:', error);
            // Show chat anyway
            this.showChatInterface();
            this.addAIResponse({
                text: "I've saved your preferences locally. Let's start shopping!"
            });
        }
    }

    async sendMessage() {
        const text = this.elements.userInput.value.trim();
        const imageFile = this.elements.imageInput.files[0];

        if (!text && !imageFile) return;

        // Clear input
        this.elements.userInput.value = '';
        this.clearImagePreview();

        // Add user message to chat
        this.addUserMessage(text, imageFile);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const response = await window.geminiService.getRecommendations(text, imageFile);

            // Remove typing indicator
            this.removeTypingIndicator();

            // Add AI response to chat
            this.addAIResponse(response);

        } catch (error) {
            console.error('Error sending message:', error);
            this.removeTypingIndicator();
            this.addAIResponse({
                text: "I'm sorry, I encountered an error. Please try again.",
                error: true
            });
        }
    }

    addUserMessage(text, imageFile) {
        const div = document.createElement('div');
        div.className = 'message user-message';

        let content = '';
        if (imageFile) {
            const imageUrl = URL.createObjectURL(imageFile);
            content += `<img src="${imageUrl}" class="message-image" alt="Uploaded image">`;
        }
        if (text) {
            content += `<p>${this.escapeHtml(text)}</p>`;
        }

        div.innerHTML = content;
        this.elements.chatMessages.appendChild(div);
        this.scrollToBottom();
    }

    addAIResponse(response) {
        const div = document.createElement('div');
        div.className = 'message ai-message';

        // Use recommendation engine to generate HTML
        div.innerHTML = window.recommendationEngine.processResponse(response);

        this.elements.chatMessages.appendChild(div);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'message ai-message typing-indicator';
        div.id = 'typing-indicator';
        div.innerHTML = '<span></span><span></span><span></span>';
        this.elements.chatMessages.appendChild(div);
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
                    <div class="preview-container">
                        <img src="${e.target.result}" alt="Preview">
                        <button class="remove-image" onclick="window.prismAI.clearImagePreview()">
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

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.prismAI = new PrismAI();
    });
} else {
    window.prismAI = new PrismAI();
}

console.log('✅ PrismAI Loaded (Global Mode)');
