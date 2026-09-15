// Prism AI - Complete Integration with Appwrite & Gemini
// Combines all services for a complete AI beauty and fashion assistant

import { preferencesService } from '../services/preferences-service.js';
import { geminiService } from '../services/gemini-service.js';
import { recommendationEngine } from '../services/recommendation-engine.js';
import { authService } from '../appwrite-config.js';

class PrismAI {
    constructor() {
        // Quiz state
        this.currentQuestion = 1;
        this.totalQuestions = 11; // Updated from 8 to 11 (added 3 hair questions)
        this.userProfile = {};
        this.conversations = [];
        this.currentImageData = null;
        this.isTransitioning = false;
        this.currentUser = null;
        
        // Initialize the application
        this.init();
    }
    
    async init() {
        try {
            // Check authentication
            this.currentUser = await authService.getCurrentUser();
            
            if (this.currentUser) {
                console.log('✅ User authenticated:', this.currentUser.email);
                // Update UI to show logged in state
                this.updateAuthUI(true);
                // Load user preferences from Appwrite
                await this.loadUserPreferences();
                // Show welcome message
                if (typeof showAuthBanner === 'function') {
                    showAuthBanner(`Welcome back, ${this.currentUser.name || 'User'}! 👋`);
                }
            } else {
                console.log('⚠️ User not authenticated - using guest mode');
                this.updateAuthUI(false);
                // Show guest mode banner
                if (typeof showAuthBanner === 'function') {
                    showAuthBanner('💡 Login to save your preferences across devices', 7000);
                }
            }
            
            this.setupEventListeners();
            this.checkOnboardingStatus();
            this.initializeAccessibility();
            this.setupAutoSave();
            
            // Check backend status and show indicator
            this.setupBackendStatusIndicator();
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.updateAuthUI(false);
            this.setupEventListeners();
            this.checkOnboardingStatus();
        }
    }
    
    /**
     * Update UI based on authentication state
     */
    updateAuthUI(isAuthenticated) {
        const authButton = document.getElementById('authButton');
        if (!authButton) return;
        
        if (isAuthenticated) {
            // Change icon to indicate logged in
            authButton.innerHTML = '<i class="fas fa-user-check"></i>';
            authButton.setAttribute('aria-label', 'Account (Logged In)');
            authButton.style.color = '#10b981'; // Green color
        } else {
            // Default state
            authButton.innerHTML = '<i class="fas fa-user"></i>';
            authButton.setAttribute('aria-label', 'Login / Sign Up');
        }
    }

    /**
     * Setup backend status indicator
     */
    async setupBackendStatusIndicator() {
        // Create status indicator if it doesn't exist
        let statusIndicator = document.getElementById('backend-status-indicator');
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.id = 'backend-status-indicator';
            statusIndicator.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            document.body.appendChild(statusIndicator);
        }

        // Check backend health
        const healthCheck = await geminiService.checkBackendHealth();
        
        if (healthCheck.healthy) {
            statusIndicator.innerHTML = `
                <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                <span>AI Backend Online</span>
            `;
            statusIndicator.style.background = 'rgba(16, 185, 129, 0.2)';
            statusIndicator.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        } else {
            statusIndicator.innerHTML = `
                <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
                <span>AI Backend Offline</span>
            `;
            statusIndicator.style.background = 'rgba(239, 68, 68, 0.2)';
            statusIndicator.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }

        // Add pulse animation
        if (!document.getElementById('pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }

        // Update status every 30 seconds
        setTimeout(() => this.setupBackendStatusIndicator(), 30000);
    }
    
    // ========================================
    // DATA MANAGEMENT
    // ========================================
    
    async loadUserPreferences() {
        try {
            const preferences = await preferencesService.getPreferences();
            
            if (preferences) {
                // Map database format to internal format
                this.userProfile = {
                    question_1: preferences.skinType,
                    question_2: preferences.skinConcern,
                    question_3: preferences.hairType,
                    question_4: preferences.hairTexture,
                    question_5: preferences.hairConcern,
                    question_6: preferences.stylePreference,
                    question_7: preferences.skincareBudget,
                    question_8: preferences.fashionBudget,
                    question_9: preferences.shoppingFrequency,
                    question_10: preferences.occasions,
                    question_11: preferences.ageRange,
                    skinType: preferences.skinType,
                    skinConcern: preferences.skinConcern,
                    hairType: preferences.hairType,
                    hairTexture: preferences.hairTexture,
                    hairConcern: preferences.hairConcern,
                    stylePreference: preferences.stylePreference,
                    skincareBudget: preferences.skincareBudget,
                    fashionBudget: preferences.fashionBudget,
                    shoppingFrequency: preferences.shoppingFrequency,
                    occasions: preferences.occasions,
                    ageRange: preferences.ageRange,
                    allergens: preferences.allergens || [],
                    preferredIngredients: preferences.preferredIngredients || [],
                    avoidIngredients: preferences.avoidIngredients || [],
                    completedOnboarding: true
                };
                
                console.log('User preferences loaded from Appwrite');
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }
    
    async saveUserPreferences() {
        try {
            const preferences = {
                skinType: this.userProfile.question_1 || this.userProfile.skinType || '',
                skinConcern: this.userProfile.question_2 || this.userProfile.skinConcern || '',
                hairType: this.userProfile.question_3 || this.userProfile.hairType || '',
                hairTexture: this.userProfile.question_4 || this.userProfile.hairTexture || '',
                hairConcern: this.userProfile.question_5 || this.userProfile.hairConcern || '',
                stylePreference: this.userProfile.question_6 || this.userProfile.stylePreference || '',
                skincareBudget: this.userProfile.question_7 || this.userProfile.skincareBudget || '',
                fashionBudget: this.userProfile.question_8 || this.userProfile.fashionBudget || '',
                shoppingFrequency: this.userProfile.question_9 || this.userProfile.shoppingFrequency || '',
                occasions: this.userProfile.question_10 || this.userProfile.occasions || '',
                ageRange: this.userProfile.question_11 || this.userProfile.ageRange || '',
                allergens: this.userProfile.allergens || [],
                preferredIngredients: this.userProfile.preferredIngredients || [],
                avoidIngredients: this.userProfile.avoidIngredients || []
            };
            
            const result = await preferencesService.savePreferences(preferences);
            if (result && result.savedTo === 'localStorage') {
                console.log('Preferences saved locally (guest mode)');
                this.showNotification('Preferences saved locally. Login to sync across devices.', 'info');
            } else {
                console.log('Preferences saved to account');
                this.showNotification('Your preferences have been saved!', 'success');
            }
            
        } catch (error) {
            console.error('Error saving preferences:', error);
            this.showNotification(error.message || 'Failed to save preferences', 'error');
        }
    }
    
    setupAutoSave() {
        // Auto-save every 2 minutes
        setInterval(() => {
            if (this.userProfile && Object.keys(this.userProfile).length > 3) {
                this.saveUserPreferences().catch(err => {
                    console.log('Auto-save skipped:', err.message);
                });
            }
        }, 120000);
    }
    
    // ========================================
    // ONBOARDING & PROFILE MANAGEMENT
    // ========================================
    
    checkOnboardingStatus() {
        const profile = this.userProfile;
        if (profile && profile.completedOnboarding) {
            this.hideOnboarding();
            this.showChat();
        } else {
            this.showOnboarding();
        }
    }
    
    setupEventListeners() {
        // Quiz navigation
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const finishBtn = document.getElementById('finish-btn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!nextBtn.disabled && !this.isTransitioning) {
                    this.nextQuestion();
                }
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!prevBtn.disabled && !this.isTransitioning) {
                    this.prevQuestion();
                }
            });
        }
        
        if (finishBtn) {
            finishBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!finishBtn.disabled && !this.isTransitioning) {
                    this.finishOnboarding();
                }
            });
        }
        
        // Answer selection
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAnswer(e));
        });
        
        // Chat functionality
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Image upload
        const uploadBtn = document.getElementById('upload-btn');
        const imageUpload = document.getElementById('image-upload');
        
        if (uploadBtn && imageUpload) {
            uploadBtn.addEventListener('click', () => imageUpload.click());
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        // Control buttons
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const clearChatBtn = document.getElementById('clear-chat-btn');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.editProfile());
        }
        
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }
    
    selectAnswer(event) {
        const button = event.target.closest('.answer-btn');
        if (!button) return;
        
        const questionCard = button.closest('.question-card');
        const questionNum = parseInt(questionCard.dataset.question);
        const value = button.dataset.value;
        
        // Remove previous selection
        questionCard.querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-checked', 'false');
            btn.setAttribute('tabindex', '-1');
        });
        
        // Add selection to clicked button
        button.classList.add('selected');
        button.setAttribute('aria-pressed', 'true');
        button.setAttribute('aria-checked', 'true');
        button.setAttribute('tabindex', '0');
        button.focus();
        
        // Store answer
        this.userProfile[`question_${questionNum}`] = value;
        
        // Enable next button
        const nextBtn = document.getElementById('next-btn');
        const finishBtn = document.getElementById('finish-btn');
        
        if (questionNum === this.totalQuestions) {
            if (finishBtn) finishBtn.disabled = false;
        } else {
            if (nextBtn) nextBtn.disabled = false;
        }
        
        // Auto-advance after short delay
        setTimeout(() => {
            if (questionNum < this.totalQuestions) {
                this.nextQuestion();
            }
        }, 500);
    }
    
    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            this.showQuestion(this.currentQuestion + 1);
        }
    }
    
    prevQuestion() {
        if (this.currentQuestion > 1) {
            this.showQuestion(this.currentQuestion - 1);
        }
    }
    
    showQuestion(questionNum) {
        if (questionNum < 1 || questionNum > this.totalQuestions) {
            return;
        }
        
        const currentQuestion = document.querySelector('.question-card.active');
        const newQuestion = document.querySelector(`[data-question="${questionNum}"]`);
        
        if (!newQuestion) {
            console.error(`Question ${questionNum} not found`);
            return;
        }
        
        // Hide current question
        if (currentQuestion) {
            currentQuestion.classList.remove('active');
        }
        
        // Show new question
        newQuestion.classList.add('active');
        this.currentQuestion = questionNum;
        
        // Update progress and navigation
        this.updateProgress();
        this.updateNavigationButtons();
        
        // Restore previously selected answer if exists
        this.restoreQuestionState(newQuestion, questionNum);
    }
    
    restoreQuestionState(questionElement, questionNum) {
        const savedAnswer = this.userProfile[`question_${questionNum}`];
        if (savedAnswer) {
            const answerButton = questionElement.querySelector(`[data-value="${savedAnswer}"]`);
            if (answerButton) {
                questionElement.querySelectorAll('.answer-btn').forEach(btn => {
                    btn.classList.remove('selected');
                    btn.setAttribute('aria-pressed', 'false');
                    btn.setAttribute('aria-checked', 'false');
                    btn.setAttribute('tabindex', '-1');
                });
                
                answerButton.classList.add('selected');
                answerButton.setAttribute('aria-pressed', 'true');
                answerButton.setAttribute('aria-checked', 'true');
                answerButton.setAttribute('tabindex', '0');
            }
        }
    }
    
    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const currentQuestionSpan = document.getElementById('current-question');
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressFill) {
            const percentage = (this.currentQuestion / this.totalQuestions) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', this.currentQuestion.toString());
        }
        
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = this.currentQuestion;
        }
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const finishBtn = document.getElementById('finish-btn');
        
        // Previous button
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestion === 1;
        }
        
        // Check if current question has an answer
        const currentAnswer = this.userProfile[`question_${this.currentQuestion}`];
        const hasAnswer = currentAnswer !== undefined && currentAnswer !== null;
        
        // Update button states
        if (this.currentQuestion === this.totalQuestions) {
            // Last question - show finish button
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
            if (finishBtn) {
                finishBtn.style.display = 'block';
                finishBtn.disabled = !hasAnswer;
            }
        } else {
            // Not last question - show next button
            if (nextBtn) {
                nextBtn.style.display = 'block';
                nextBtn.disabled = !hasAnswer;
            }
            if (finishBtn) {
                finishBtn.style.display = 'none';
            }
        }
    }
    
    async finishOnboarding() {
        // Validate completion
        if (!this.validateQuizCompletion()) {
            this.showNotification('Please answer all questions before proceeding.', 'warning');
            return;
        }
        
        // Process answers
        this.processUserProfile();
        
        // Save to Appwrite
        await this.saveUserPreferences();
        
        // Hide onboarding and show chat
        this.hideOnboarding();
        this.showChat();
        
        // Send welcome message
        this.sendWelcomeMessage();
    }
    
    validateQuizCompletion() {
        for (let i = 1; i <= this.totalQuestions; i++) {
            if (!this.userProfile[`question_${i}`]) {
                return false;
            }
        }
        return true;
    }
    
    processUserProfile() {
        this.userProfile = {
            ...this.userProfile,
            skinType: this.userProfile.question_1 || 'normal',
            skinConcern: this.userProfile.question_2 || 'general',
            hairType: this.userProfile.question_3 || 'straight',
            hairTexture: this.userProfile.question_4 || 'medium',
            hairConcern: this.userProfile.question_5 || 'none',
            stylePreference: this.userProfile.question_6 || 'classic',
            skincareBudget: this.userProfile.question_7 || 'mid',
            fashionBudget: this.userProfile.question_8 || 'mid',
            shoppingFrequency: this.userProfile.question_9 || 'monthly',
            occasions: this.userProfile.question_10 || 'mixed',
            ageRange: this.userProfile.question_11 || 'twenties',
            allergens: [],
            preferredIngredients: [],
            avoidIngredients: [],
            completedOnboarding: true,
            createdAt: new Date().toISOString()
        };
    }
    
    editProfile() {
        if (confirm('Are you sure you want to edit your profile? This will restart the onboarding process.')) {
            this.currentQuestion = 1;
            this.showOnboarding();
            this.hideChat();
            
            // Reset quiz state but keep answers
            this.showQuestion(1);
        }
    }
    
    showOnboarding() {
        const modal = document.getElementById('onboarding-modal');
        const chatSection = document.getElementById('chat-section');
        if (modal) modal.classList.add('active');
        if (chatSection) chatSection.style.display = 'none';
    }
    
    hideOnboarding() {
        const modal = document.getElementById('onboarding-modal');
        if (modal) modal.classList.remove('active');
    }
    
    showChat() {
        const chatSection = document.getElementById('chat-section');
        if (chatSection) chatSection.style.display = 'block';
    }
    
    hideChat() {
        const chatSection = document.getElementById('chat-section');
        if (chatSection) chatSection.style.display = 'none';
    }
    
    // ========================================
    // CHAT FUNCTIONALITY WITH GEMINI AI
    // ========================================
    
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const message = input.value.trim();
        
        if (!message && !this.currentImageData) {
            input.focus();
            return;
        }
        
        // Disable controls
        sendBtn.disabled = true;
        input.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Add user message
        this.addMessage(message, 'user', this.currentImageData);
        
        // Store image data
        const currentImage = this.currentImageData;
        
        // Clear input
        input.value = '';
        this.clearImagePreview();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get AI response with user preferences
            const response = await geminiService.generateResponse(
                message,
                this.userProfile,
                currentImage
            );
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Generate and add AI response
            setTimeout(() => {
                this.addAIResponse(response);
            }, 200);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            
            setTimeout(() => {
                this.addMessage(
                    `Sorry, I encountered an error: ${error.message}. Please try again.`,
                    'ai'
                );
            }, 200);
        } finally {
            // Re-enable controls
            sendBtn.disabled = false;
            input.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            input.focus();
        }
    }
    
    addMessage(text, sender, imageData = null) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'ai' 
            ? '<i class="fas fa-robot"></i>' 
            : '<i class="fas fa-user"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (text) {
            const textP = document.createElement('p');
            textP.textContent = text;
            contentDiv.appendChild(textP);
        }
        
        if (imageData) {
            const img = document.createElement('img');
            img.src = imageData;
            img.style.maxWidth = '250px';
            img.style.borderRadius = '12px';
            img.style.marginTop = '8px';
            contentDiv.appendChild(img);
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    addAIResponse(response) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Generate recommendations HTML
        const recommendationsHTML = recommendationEngine.generateRecommendationsHTML(
            response,
            this.userProfile
        );
        
        contentDiv.innerHTML = recommendationsHTML;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    sendWelcomeMessage() {
        const welcomeText = `Welcome! I've loaded your profile and I'm ready to provide personalized recommendations. 

Your Profile:
- Skin Type: ${this.capitalizeFirst(this.userProfile.skinType)}
- Hair Type: ${this.capitalizeFirst(this.userProfile.hairType)}
- Style: ${this.capitalizeFirst(this.userProfile.stylePreference)}

Feel free to ask me about skincare, haircare, or fashion recommendations!`;
        
        this.addMessage(welcomeText, 'ai');
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'message ai-message typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageData = e.target.result;
            this.showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    showImagePreview(imageData) {
        const preview = document.getElementById('image-preview');
        if (!preview) return;
        
        preview.innerHTML = `
            <img src="${imageData}" alt="Upload preview">
            <button class="remove-image-btn" onclick="window.prismAI.clearImagePreview()">
                <i class="fas fa-times"></i>
            </button>
        `;
        preview.style.display = 'block';
    }
    
    clearImagePreview() {
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.innerHTML = '';
            preview.style.display = 'none';
        }
        this.currentImageData = null;
        
        const imageUpload = document.getElementById('image-upload');
        if (imageUpload) {
            imageUpload.value = '';
        }
    }
    
    clearChat() {
        if (!confirm('Are you sure you want to clear the chat history?')) {
            return;
        }
        
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Chat cleared! How can I help you today?</p>
                    </div>
                </div>
            `;
        }
        
        this.conversations = [];
        this.showNotification('Chat history cleared', 'success');
    }
    
    // ========================================
    // ACCESSIBILITY & UI ENHANCEMENTS
    // ========================================
    
    initializeAccessibility() {
        this.createLiveRegion();
        this.setupKeyboardShortcuts();
    }
    
    createLiveRegion() {
        if (document.getElementById('live-region')) return;
        
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);
    }
    
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    setupKeyboardShortcuts() {
        // Keep existing keyboard shortcuts
    }
    
    handleKeyboardNavigation(e) {
        // Keyboard navigation for quiz
        const activeCard = document.querySelector('.question-card.active');
        if (!activeCard) return;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.prevQuestion();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.userProfile[`question_${this.currentQuestion}`]) {
                this.nextQuestion();
            }
        }
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(notificationContainer);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${type === 'error' ? '#ff4757' : type === 'warning' ? '#ffa502' : type === 'success' ? '#26de81' : '#3742fa'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 14px;
        `;
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        this.announceToScreenReader(message);
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
    }
}

// Initialize the application
let prismAI;
document.addEventListener('DOMContentLoaded', function() {
    prismAI = new PrismAI();
});

// Export for global access
window.prismAI = prismAI;

export default PrismAI;
