// Prism AI - Advanced Chatbot Functionality
// AI VOGUE - Premium Beauty & Fashion Assistant

class PrismAI {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 8;
        this.userProfile = {};
        this.conversations = [];
        this.currentImageData = null;
        this.isTransitioning = false;
        
        this.init();
    }

    restoreQuestionState(questionElement, questionNum) {
        // Check if this question has a previously selected answer
        const savedAnswer = this.userProfile[`question_${questionNum}`];
        if (savedAnswer) {
            // Find and restore the selected answer
            const answerButton = questionElement.querySelector(`[data-value="${savedAnswer}"]`);
            if (answerButton) {
                // Remove selection from all buttons first
                questionElement.querySelectorAll('.answer-btn').forEach(btn => {
                    btn.classList.remove('selected');
                    btn.setAttribute('aria-pressed', 'false');
                    btn.setAttribute('aria-checked', 'false');
                    btn.setAttribute('tabindex', '-1');
                });
                
                // Restore selection to the saved answer
                answerButton.classList.add('selected');
                answerButton.setAttribute('aria-pressed', 'true');
                answerButton.setAttribute('aria-checked', 'true');
                answerButton.setAttribute('tabindex', '0');
            }
        } else {
            // No saved answer - reset all buttons to default state
            questionElement.querySelectorAll('.answer-btn').forEach(btn => {
                btn.classList.remove('selected');
                btn.setAttribute('aria-pressed', 'false');
                btn.setAttribute('aria-checked', 'false');
                btn.setAttribute('tabindex', '-1');
            });
            
            // Set first button as focusable
            const firstButton = questionElement.querySelector('.answer-btn');
            if (firstButton) {
                firstButton.setAttribute('tabindex', '0');
            }
        }
    }

    focusCurrentQuestion(questionElement) {
        // Focus management for better accessibility
        setTimeout(() => {
            const savedAnswer = this.userProfile[`question_${this.currentQuestion}`];
            let targetElement;
            
            if (savedAnswer) {
                // Focus the selected answer if one exists
                targetElement = questionElement.querySelector(`[data-value="${savedAnswer}"]`);
            } else {
                // Focus the first answer button if no selection exists
                targetElement = questionElement.querySelector('.answer-btn[tabindex="0"]');
            }
            
            if (targetElement) {
                targetElement.focus();
            }
        }, 100);
    }

    init() {
        this.loadUserProfile();
        this.loadConversations();
        this.setupEventListeners();
        this.checkOnboardingStatus();
        this.initializeSessionTracking();
        this.setupAutoSave();
        this.initializeAccessibility();
    }
    
    initializeAccessibility() {
        // Add live region for screen reader announcements
        this.createLiveRegion();
        
        // Enhanced focus management
        this.setupFocusManagement();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // High contrast mode detection
        this.detectHighContrastMode();
    }
    
    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);
    }
    
    announceToScreenReader(message, priority = 'polite') {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification container if it doesn't exist
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
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${type === 'error' ? '#ff4757' : type === 'warning' ? '#ffa502' : '#3742fa'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 14px;
            line-height: 1.4;
        `;
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        // Announce to screen readers
        this.announceToScreenReader(message, type === 'error' ? 'assertive' : 'polite');
    }
    
    setupFocusManagement() {
        // Focus trap for modal
        const modal = document.getElementById('onboarding-modal');
        if (modal) {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
            });
        }
    }
    
    trapFocus(event, container) {
        const focusableElements = container.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + C to focus chat input
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                const chatInput = document.getElementById('chat-input');
                if (chatInput && !chatInput.disabled) {
                    chatInput.focus();
                    this.announceToScreenReader('Chat input focused');
                }
            }
            
            // Alt + Q to start/restart quiz
            if (e.altKey && e.key === 'q') {
                e.preventDefault();
                this.showOnboarding();
                this.announceToScreenReader('Quiz started');
            }
            
            // Alt + H for help
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.showKeyboardHelp();
            }
        });
    }
    
    showKeyboardHelp() {
        const helpMessage = `
            Keyboard shortcuts:
            Alt + C: Focus chat input
            Alt + Q: Start quiz
            Alt + H: Show this help
            Arrow keys: Navigate quiz options
            Tab: Move between elements
            Enter/Space: Select options
            Escape: Close modals
        `;
        
        // Create and show keyboard help modal instead of alert
        this.showNotification(helpMessage, 'info', 5000);
        this.announceToScreenReader('Keyboard shortcuts displayed');
    }
    
    detectHighContrastMode() {
        // Check for high contrast mode
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // Listen for changes
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }
    
    initializeSessionTracking() {
        // Track user activity for session management
        const events = ['click', 'keypress', 'scroll', 'mousemove'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true, once: false });
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveUserProfile();
                this.saveConversations();
            } else {
                this.updateLastActivity();
            }
        });
        
        // Save data before page unload
        window.addEventListener('beforeunload', () => {
            this.saveUserProfile();
            this.saveConversations();
        });
    }
    
    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            if (this.userProfile && Object.keys(this.userProfile).length > 0) {
                this.saveUserProfile();
            }
            if (this.conversations && this.conversations.length > 0) {
                this.saveConversations();
            }
        }, 30000);
    }

    // ========================================
    // ONBOARDING & PROFILE MANAGEMENT
    // ========================================

    checkOnboardingStatus() {
        const profile = this.getUserProfile();
        if (profile && Object.keys(profile).length > 0) {
            this.hideOnboarding();
            this.showChat();
            this.loadChatHistory();
        } else {
            this.showOnboarding();
        }
    }

    setupEventListeners() {
        // Quiz navigation with null checks and enhanced functionality
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

        // Answer selection with validation
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAnswer(e));
        });

        // Chat functionality
        document.getElementById('send-btn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Image upload
        document.getElementById('upload-btn')?.addEventListener('click', () => {
            const imageUpload = document.getElementById('image-upload');
            if (imageUpload) {
                imageUpload.click();
            } else {
                console.warn('Image upload element not found');
            }
        });
        document.getElementById('image-upload')?.addEventListener('change', (e) => this.handleImageUpload(e));

        // Control buttons
        document.getElementById('edit-profile-btn')?.addEventListener('click', () => this.editProfile());
        document.getElementById('clear-chat-btn')?.addEventListener('click', () => this.clearChat());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    selectAnswer(event) {
        const button = event.target;
        const questionCard = button.closest('.question-card');
        const questionNum = parseInt(questionCard.dataset.question);
        const value = button.dataset.value;

        // Remove previous selection and update ARIA states
        questionCard.querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-checked', 'false');
            btn.setAttribute('tabindex', '-1');
        });

        // Add selection to clicked button and update ARIA states
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

        // Auto-advance after short delay for better UX
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
        // Validate question number
        if (questionNum < 1 || questionNum > this.totalQuestions) {
            console.warn(`Invalid question number: ${questionNum}`);
            return;
        }
        
        // Get current and new question elements
        const currentQuestion = document.querySelector('.question-card.active');
        const newQuestion = document.querySelector(`[data-question="${questionNum}"]`);
        
        if (!newQuestion) {
            console.error(`Question ${questionNum} not found`);
            return;
        }
        
        // Add transition class for smooth animation
        const quizContainer = document.querySelector('.quiz-questions');
        if (quizContainer) {
            quizContainer.classList.add('transitioning');
        }
        
        // Hide current question with fade out
        if (currentQuestion) {
            currentQuestion.classList.add('fade-out');
            setTimeout(() => {
                currentQuestion.classList.remove('active', 'fade-out');
            }, 150);
        }
        
        // Show new question with fade in
        setTimeout(() => {
            newQuestion.classList.add('active', 'fade-in');
            this.currentQuestion = questionNum;
            
            // Announce question change to screen readers
            const questionTitle = newQuestion.querySelector('h3')?.textContent || `Question ${questionNum}`;
            this.announceToScreenReader(`${questionTitle}. Question ${questionNum} of ${this.totalQuestions}`);
            
            // Update progress and navigation
            this.updateProgress();
            this.updateNavigationButtons();
            
            // Restore previously selected answer if exists
            this.restoreQuestionState(newQuestion, questionNum);
            
            // Focus management for accessibility
            this.focusCurrentQuestion(newQuestion);
            
            // Remove transition classes
            setTimeout(() => {
                newQuestion.classList.remove('fade-in');
                if (quizContainer) {
                    quizContainer.classList.remove('transitioning');
                }
            }, 300);
        }, currentQuestion ? 150 : 0);
    }

    updateProgress() {
        const progressBar = document.querySelector('.progress-bar');
        const progressFill = document.querySelector('.progress-fill');
        const currentQuestionSpan = document.getElementById('current-question');
        
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
        
        // Previous button - enable if not on first question
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestion === 1;
            prevBtn.setAttribute('aria-disabled', this.currentQuestion === 1 ? 'true' : 'false');
        }
        
        // Check if current question has an answer
        const currentAnswer = this.userProfile[`question_${this.currentQuestion}`];
        const hasAnswer = currentAnswer !== undefined && currentAnswer !== null;
        
        // Update button states based on current question
        if (this.currentQuestion === this.totalQuestions) {
            // Last question - show finish button
            if (nextBtn) {
                nextBtn.style.display = 'none';
                nextBtn.setAttribute('aria-hidden', 'true');
            }
            if (finishBtn) {
                finishBtn.style.display = 'block';
                finishBtn.disabled = !hasAnswer;
                finishBtn.setAttribute('aria-disabled', hasAnswer ? 'false' : 'true');
                finishBtn.setAttribute('aria-hidden', 'false');
            }
        } else {
            // Not last question - show next button
            if (nextBtn) {
                nextBtn.style.display = 'block';
                nextBtn.disabled = !hasAnswer;
                nextBtn.setAttribute('aria-disabled', hasAnswer ? 'false' : 'true');
                nextBtn.setAttribute('aria-hidden', 'false');
            }
            if (finishBtn) {
                finishBtn.style.display = 'none';
                finishBtn.setAttribute('aria-hidden', 'true');
            }
        }
    }

    finishOnboarding() {
        // Validate that all questions are answered
        if (!this.validateQuizCompletion()) {
            this.showNotification('Please answer all questions before proceeding.', 'warning', 3000);
            return;
        }
        
        // Process answers and determine skin type
        this.processUserProfile();
        
        // Save profile
        this.saveUserProfile();
        
        // Hide onboarding and show chat
        this.hideOnboarding();
        this.showChat();
        
        // Send welcome message
        this.sendWelcomeMessage();
    }
    
    validateQuizCompletion() {
        // Check if all questions have been answered
        for (let i = 1; i <= this.totalQuestions; i++) {
            if (!this.userProfile[`question_${i}`]) {
                return false;
            }
        }
        return true;
    }

    processUserProfile() {
        // Determine skin type based on answers
        const skinTypeAnswer = this.userProfile.question_1;
        const skinConcernAnswer = this.userProfile.question_2;
        const styleAnswer = this.userProfile.question_3;
        const skincareBudgetAnswer = this.userProfile.question_4;
        const fashionBudgetAnswer = this.userProfile.question_5;
        const shoppingFrequencyAnswer = this.userProfile.question_6;
        const occasionsAnswer = this.userProfile.question_7;
        const ageRangeAnswer = this.userProfile.question_8;

        // Create comprehensive profile
        this.userProfile = {
            ...this.userProfile,
            skinType: skinTypeAnswer || 'normal',
            primaryConcern: skinConcernAnswer || 'general',
            stylePreference: styleAnswer || 'classic',
            skincareBudget: skincareBudgetAnswer || 'mid',
            fashionBudget: fashionBudgetAnswer || 'mid',
            shoppingFrequency: shoppingFrequencyAnswer || 'monthly',
            occasions: occasionsAnswer || 'mixed',
            ageRange: ageRangeAnswer || 'twenties',
            createdAt: new Date().toISOString(),
            completedOnboarding: true
        };
    }

    editProfile() {
        if (confirm('Are you sure you want to edit your profile? This will restart the onboarding process.')) {
            this.userProfile = {};
            this.currentQuestion = 1;
            this.saveUserProfile();
            this.showOnboarding();
            this.hideChat();
            
            // Reset quiz state
            document.querySelectorAll('.answer-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.showQuestion(1);
        }
    }

    // ========================================
    // CHAT FUNCTIONALITY
    // ========================================

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const message = input.value.trim();
        
        if (!message && !this.currentImageData) {
            input.focus();
            // Add subtle shake animation for empty input
            input.style.animation = 'shake 0.3s ease';
            setTimeout(() => input.style.animation = '', 300);
            return;
        }
        
        // Disable send button and input during processing
        sendBtn.disabled = true;
        input.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Add user message with animation
        this.addMessage(message, 'user', this.currentImageData);
        
        // Store current image data for conversation history
        const currentImage = this.currentImageData;
        
        // Clear input and image preview
        input.value = '';
        this.clearImagePreview();
        
        // Show enhanced typing indicator
        this.showTypingIndicator();
        
        try {
            // Add realistic delay for better UX
            const minDelay = 1500; // Minimum response time
            const startTime = Date.now();
            
            // Simulate API call
            const response = await this.simulateGeminiAPI(message, currentImage);
            
            // Ensure minimum delay for realistic feel
            const elapsed = Date.now() - startTime;
            if (elapsed < minDelay) {
                await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
            }
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response with staggered animation
            setTimeout(() => {
                this.addMessage(response.text, 'ai', null, response.products, response.outfits);
            }, 200);
            
            // Save conversation
            this.saveConversations();
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            setTimeout(() => {
                this.addMessage('Sorry, I encountered an error. Please try again later. 🤖', 'ai');
            }, 200);
        } finally {
            // Re-enable controls
            sendBtn.disabled = false;
            input.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            input.focus();
        }
    }

    addMessage(text, sender, imageData = null, products = null, outfits = null) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) {
            console.error('Chat messages container not found');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.setAttribute('role', 'article');
        messageDiv.setAttribute('aria-label', `${sender === 'ai' ? 'AI Assistant' : 'User'} message`);
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.setAttribute('aria-hidden', 'true');
        avatarDiv.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Add text content
        if (text) {
            const textP = document.createElement('p');
            textP.textContent = text;
            contentDiv.appendChild(textP);
        }
        
        // Add image if present
        if (imageData) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'message-image-container';
            imageContainer.style.marginTop = '0.5rem';
            
            const img = document.createElement('img');
            img.src = imageData;
            img.style.maxWidth = '250px';
            img.style.borderRadius = '12px';
            img.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            img.style.transition = 'transform 0.3s ease';
            img.style.cursor = 'pointer';
            
            // Add click to expand functionality
            img.addEventListener('click', () => {
                this.expandImage(imageData);
            });
            
            imageContainer.appendChild(img);
            contentDiv.appendChild(imageContainer);
        }
        
        // Add product suggestions
        if (products && products.length > 0) {
            const productsDiv = document.createElement('div');
            productsDiv.className = 'product-suggestions';
            
            products.forEach((product, index) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // Enhanced product card with structured data
                const ratingStars = product.rating ? this.generateStarRating(product.rating) : '';
                const ingredientsList = product.ingredients ? product.ingredients.join(', ') : '';
                
                productCard.innerHTML = `
                    <div class="product-header">
                        <h4>${product.name}</h4>
                        ${product.price ? `<span class="product-price">${product.price}</span>` : ''}
                    </div>
                    ${ratingStars ? `<div class="product-rating">${ratingStars}</div>` : ''}
                    <p class="product-reason">${product.reason}</p>
                    ${ingredientsList ? `<div class="product-ingredients"><strong>Key Ingredients:</strong> ${ingredientsList}</div>` : ''}
                    <div class="product-footer">
                        <span class="product-category">${product.category}</span>
                        <a href="${product.buyLink}" class="buy-btn" target="_blank" rel="noopener noreferrer">
                            <i class="fas fa-shopping-cart"></i> Shop Now
                        </a>
                    </div>
                `;
                
                // Add staggered animation delay
                productCard.style.animationDelay = `${index * 0.1}s`;
                productsDiv.appendChild(productCard);
            });
            
            contentDiv.appendChild(productsDiv);
        }
        
        // Add outfit suggestions with enhanced structure
        if (outfits && outfits.length > 0) {
            const outfitsDiv = document.createElement('div');
            outfitsDiv.className = 'outfit-suggestions';
            
            outfits.forEach((outfit, index) => {
                const outfitCard = document.createElement('div');
                outfitCard.className = 'outfit-card';
                
                if (outfit.items && outfit.name) {
                    // Structured outfit with items
                    const itemsList = outfit.items.map(item => 
                        `<div class="outfit-item">
                            <span class="item-piece">${item.piece}</span>
                            <span class="item-brand">${item.brand}</span>
                            <span class="item-price">${item.price}</span>
                            <a href="${item.buyLink}" class="item-link" target="_blank" rel="noopener noreferrer">Shop</a>
                        </div>`
                    ).join('');
                    
                    outfitCard.innerHTML = `
                        <div class="outfit-header">
                            <h4>${outfit.name}</h4>
                            <span class="outfit-total">${outfit.totalPrice}</span>
                        </div>
                        <div class="outfit-details">
                            <span class="outfit-occasion"><i class="fas fa-calendar"></i> ${outfit.occasion}</span>
                            <span class="outfit-season"><i class="fas fa-leaf"></i> ${outfit.season}</span>
                        </div>
                        <div class="outfit-items">${itemsList}</div>
                    `;
                } else {
                    // Legacy text-based outfit
                    outfitCard.innerHTML = `
                        <p><strong>Style Suggestion:</strong> ${outfit.text}</p>
                        ${outfit.buyLink ? `<a href="${outfit.buyLink}" class="buy-btn" target="_blank" rel="noopener noreferrer">Shop Similar</a>` : ''}
                    `;
                }
                
                // Add staggered animation delay
                outfitCard.style.animationDelay = `${index * 0.15}s`;
                outfitsDiv.appendChild(outfitCard);
            });
            
            contentDiv.appendChild(outfitsDiv);
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Save to conversations
        this.conversations.push({
            text: text || '',
            sender: sender || 'user',
            imageData: imageData || null,
            products: products || null,
            outfits: outfits || null,
            timestamp: new Date().toISOString()
        });
        this.saveConversations();
        
        // Smooth scroll to bottom
        this.scrollToBottom();
    }
    
    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHtml = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star"></i>';
        }
        
        return `<span class="star-rating" title="${rating}/5 stars">${starsHtml} <span class="rating-number">(${rating})</span></span>`;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) {
            console.error('Chat messages container not found for typing indicator');
            return;
        }
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.setAttribute('aria-label', 'AI is typing');
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="typing-text">AI is thinking...</div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add realistic typing behavior
        this.animateTypingIndicator(typingDiv);
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.opacity = '0';
            typingIndicator.style.transform = 'translateY(10px)';
            setTimeout(() => {
                if (typingIndicator.parentNode) {
                    typingIndicator.remove();
                }
            }, 200);
        }
    }

    animateTypingIndicator(typingDiv) {
        const typingText = typingDiv.querySelector('.typing-text');
        const messages = [
            'AI is thinking...',
            'Analyzing your request...',
            'Preparing recommendations...',
            'Almost ready...'
        ];
        
        let messageIndex = 0;
        const interval = setInterval(() => {
            if (!document.getElementById('typing-indicator')) {
                clearInterval(interval);
                return;
            }
            
            messageIndex = (messageIndex + 1) % messages.length;
            if (typingText) {
                typingText.textContent = messages[messageIndex];
            }
        }, 1000);
        
        // Store interval ID for cleanup
        typingDiv.dataset.intervalId = interval;
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file.', 'error', 3000);
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Image size must be less than 5MB.', 'error', 3000);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageData = e.target.result;
            this.showImagePreview(this.currentImageData);
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(imageData) {
        const previewContainer = document.getElementById('image-preview');
        if (!previewContainer) {
            console.error('Image preview container not found');
            return;
        }
        
        previewContainer.innerHTML = `
            <img src="${imageData}" alt="Upload preview">
            <button class="remove-image" onclick="window.prismAI.clearImagePreview()" aria-label="Remove image">
                <i class="fas fa-times"></i>
            </button>
        `;
        previewContainer.style.display = 'block';
        
        // Add animation class
        previewContainer.classList.add('fade-in');
        setTimeout(() => previewContainer.classList.remove('fade-in'), 300);
    }

    clearImagePreview() {
        const previewContainer = document.getElementById('image-preview');
        if (previewContainer) {
            previewContainer.style.display = 'none';
            previewContainer.innerHTML = '';
        }
        
        this.currentImageData = null;
        
        const imageUpload = document.getElementById('image-upload');
        if (imageUpload) {
            imageUpload.value = '';
        }
    }

    expandImage(imageData) {
        // Create modal overlay for expanded image view
        const overlay = document.createElement('div');
        overlay.className = 'image-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
            animation: fadeIn 0.3s ease;
        `;
        
        const img = document.createElement('img');
        img.src = imageData;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: scaleIn 0.3s ease;
        `;
        
        overlay.appendChild(img);
        document.body.appendChild(overlay);
        
        // Close on click
        overlay.addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => document.body.removeChild(overlay), 300);
        });
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                overlay.click();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    clearChat() {
        // Show confirmation notification instead of confirm dialog
        this.showConfirmation(
            'Are you sure you want to clear all chat history? This action cannot be undone.',
            () => this.performClearChat()
        );
    }
    
    showConfirmation(message, onConfirm) {
        // Create confirmation modal
        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;
        
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 400px;
            margin: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
        `;
        
        modal.innerHTML = `
            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="confirm-btn" style="
                    background: #ff4757;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                ">Yes, Clear</button>
                <button class="cancel-btn" style="
                    background: #ddd;
                    color: #333;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                ">Cancel</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Event handlers
        const confirmBtn = modal.querySelector('.confirm-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        
        const cleanup = () => {
            document.body.removeChild(overlay);
        };
        
        confirmBtn.addEventListener('click', () => {
            cleanup();
            onConfirm();
        });
        
        cancelBtn.addEventListener('click', cleanup);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup();
        });
        
        // Focus management
        cancelBtn.focus();
    }
    
    performClearChat() {
            this.conversations = [];
            this.saveConversations();
            
            const messagesContainer = document.getElementById('chat-messages');
            if (!messagesContainer) {
                console.error('Chat messages container not found for clearing chat');
                return;
            }
            
            messagesContainer.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Hello! I'm your personal Prism AI assistant. I'm here to help you with skincare recommendations, fashion advice, and style suggestions. Feel free to ask me anything or upload an image for analysis!</p>
                    </div>
                </div>
            `;
    }

    sendWelcomeMessage() {
        const profile = this.getUserProfile();
        
        // Check if profile has required data before creating personalized message
        if (profile && profile.skinType && profile.personalStyle && profile.primaryConcern) {
            const welcomeMessage = `Welcome back! Based on your profile, I see you have ${profile.skinType} skin and prefer ${profile.personalStyle} style. I'm here to provide personalized recommendations for your ${profile.primaryConcern} concerns. How can I help you today?`;
            
            setTimeout(() => {
                this.addMessage(welcomeMessage, 'ai');
                this.saveConversations();
            }, 1000);
        } else {
            // Fallback message if profile is incomplete
            const welcomeMessage = "Welcome back! I'm your personal Prism AI assistant. I'm here to help you with skincare recommendations, fashion advice, and style suggestions. Feel free to ask me anything or upload an image for analysis!";
            
            setTimeout(() => {
                this.addMessage(welcomeMessage, 'ai');
                this.saveConversations();
            }, 1000);
        }
    }

    // ========================================
    // API SIMULATION (Placeholder for Gemini API)
    // ========================================

    async simulateGeminiAPI(userMessage, userImageData = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const profile = this.getUserProfile();
                let response = {
                    text: '',
                    products: [],
                    outfits: []
                };

                // Analyze message content and provide contextual responses
                const message = userMessage.toLowerCase();
                
                if (message.includes('skincare') || message.includes('skin') || message.includes('acne') || message.includes('dry') || message.includes('oily')) {
                    response = this.generateSkincareResponse(message, profile);
                } else if (message.includes('outfit') || message.includes('fashion') || message.includes('style') || message.includes('wear') || message.includes('dress')) {
                    response = this.generateFashionResponse(message, profile);
                } else if (userImageData) {
                    response = this.generateImageAnalysisResponse(profile);
                } else {
                    response = this.generateGeneralResponse(message, profile);
                }

                resolve(response);
            }, 1500); // 1.5 second delay to simulate network
        });
    }

    generateSkincareResponse(message, profile) {
        const skincareDatabase = {
            oily: {
                morning: [
                    { 
                        name: 'CeraVe Foaming Facial Cleanser', 
                        reason: 'Removes excess oil without over-drying', 
                        category: 'Budget-Friendly', 
                        price: '$12-15',
                        rating: 4.5,
                        ingredients: ['Ceramides', 'Hyaluronic Acid'],
                        buyLink: 'https://www.cerave.com/skincare/cleansers/foaming-facial-cleanser'
                    },
                    { 
                        name: 'The Ordinary Niacinamide 10% + Zinc 1%', 
                        reason: 'Controls sebum production and minimizes pores', 
                        category: 'Budget-Friendly', 
                        price: '$7-10',
                        rating: 4.2,
                        ingredients: ['Niacinamide', 'Zinc'],
                        buyLink: 'https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html'
                    }
                ],
                evening: [
                    { 
                        name: 'Paula\'s Choice SKIN PERFECTING 2% BHA', 
                        reason: 'Exfoliates inside pores to prevent blackheads', 
                        category: 'Mid-Range', 
                        price: '$30-35',
                        rating: 4.7,
                        ingredients: ['Salicylic Acid', 'Green Tea'],
                        buyLink: 'https://www.paulaschoice.com/skin-perfecting-2pct-bha-liquid-exfoliant/201.html'
                    }
                ]
            },
            dry: {
                morning: [
                    { 
                        name: 'Neutrogena Hydrating Gentle Cleanser', 
                        reason: 'Cleanses without stripping natural oils', 
                        category: 'Budget-Friendly', 
                        price: '$8-12',
                        rating: 4.3,
                        ingredients: ['Hyaluronic Acid', 'Glycerin'],
                        buyLink: 'https://www.neutrogena.com/products/skincare/hydrating-gentle-cleanser/6811047.html'
                    },
                    { 
                        name: 'The INKEY List Hyaluronic Acid Serum', 
                        reason: 'Provides deep hydration and plumps skin', 
                        category: 'Budget-Friendly', 
                        price: '$8-12',
                        rating: 4.4,
                        ingredients: ['Hyaluronic Acid', 'Glycerin'],
                        buyLink: 'https://www.theinkeylist.com/products/hyaluronic-acid-serum'
                    }
                ],
                evening: [
                    { 
                        name: 'Olay Regenerist Micro-Sculpting Cream', 
                        reason: 'Rich moisturizer that repairs skin barrier overnight', 
                        category: 'Mid-Range', 
                        price: '$25-30',
                        rating: 4.6,
                        ingredients: ['Niacinamide', 'Peptides'],
                        buyLink: 'https://www.olay.com/en-us/skin-care-products/regenerist-micro-sculpting-cream'
                    }
                ]
            },
            sensitive: {
                morning: [
                    { 
                        name: 'Vanicream Gentle Facial Cleanser', 
                        reason: 'Fragrance-free and gentle for reactive skin', 
                        category: 'Budget-Friendly', 
                        price: '$8-12',
                        rating: 4.5,
                        ingredients: ['No harsh sulfates', 'No fragrances'],
                        buyLink: 'https://www.vanicream.com/product/vanicream-gentle-facial-cleanser'
                    },
                    { 
                        name: 'La Roche-Posay Toleriane Double Repair Moisturizer', 
                        reason: 'Restores skin barrier with prebiotics', 
                        category: 'Mid-Range', 
                        price: '$20-25',
                        rating: 4.4,
                        ingredients: ['Ceramides', 'Niacinamide', 'Prebiotics'],
                        buyLink: 'https://www.laroche-posay.us/our-products/face/face-moisturizer/toleriane-double-repair-face-moisturizer-3606000437449.html'
                    }
                ]
            },
            normal: {
                morning: [
                    { 
                        name: 'Vitamin C Serum', 
                        reason: 'Brightens skin and provides antioxidant protection', 
                        category: 'Premium', 
                        price: '$25-40',
                        rating: 4.6,
                        ingredients: ['Vitamin C', 'Vitamin E'],
                        buyLink: 'https://www.skinceuticals.com/vitamin-c-e-ferulic-635494263000.html'
                    },
                    { 
                        name: 'Daily Moisturizer with SPF', 
                        reason: 'Maintains healthy skin and prevents aging', 
                        category: 'Mid-Range', 
                        price: '$15-25',
                        rating: 4.4,
                        ingredients: ['SPF 30', 'Hyaluronic Acid'],
                        buyLink: 'https://www.neutrogena.com/products/sun/neutrogena-hydra-boost-water-gel-lotion-spf-30/6811048.html'
                    }
                ],
                evening: [
                    { 
                        name: 'Retinol Night Serum', 
                        reason: 'Promotes cell turnover and reduces signs of aging', 
                        category: 'Premium', 
                        price: '$35-50',
                        rating: 4.5,
                        ingredients: ['Retinol', 'Hyaluronic Acid'],
                        buyLink: 'https://www.neutrogena.com/products/skincare/rapid-wrinkle-repair-regenerating-cream/6802870.html'
                    }
                ]
            },
            combination: {
                morning: [
                    { 
                        name: 'Gentle Foaming Cleanser', 
                        reason: 'Balances oil in T-zone while hydrating cheeks', 
                        category: 'Mid-Range', 
                        price: '$18-25',
                        rating: 4.3,
                        ingredients: ['Salicylic Acid', 'Glycerin'],
                        buyLink: 'https://www.cerave.com/skincare/cleansers/foaming-facial-cleanser-for-normal-to-oily-skin'
                    },
                    { 
                        name: 'Lightweight Moisturizer', 
                        reason: 'Hydrates without clogging pores', 
                        category: 'Budget-Friendly', 
                        price: '$12-18',
                        rating: 4.2,
                        ingredients: ['Hyaluronic Acid', 'Niacinamide'],
                        buyLink: 'https://www.neutrogena.com/products/skincare/hydro-boost-water-gel/6811010.html'
                    }
                ],
                evening: [
                    { 
                        name: 'BHA Toner for T-Zone', 
                        reason: 'Targets oily areas while being gentle on dry zones', 
                        category: 'Mid-Range', 
                        price: '$22-28',
                        rating: 4.4,
                        ingredients: ['Salicylic Acid', 'Witch Hazel'],
                        buyLink: 'https://www.paulaschoice.com/skin-balancing-pore-reducing-toner/760.html'
                    }
                ]
            }
        };

        const routineProducts = skincareDatabase[profile.skinType] || skincareDatabase.normal;
        const allProducts = [...(routineProducts.morning || []), ...(routineProducts.evening || [])];
        
        // Select top 3 products based on user's concerns
        const selectedProducts = this.selectProductsByConcern(allProducts, profile.primaryConcern).slice(0, 3);
        
        return {
            text: `Based on your ${profile.skinType} skin type and ${profile.primaryConcern} concerns, here's your personalized skincare routine:`,
            products: selectedProducts,
            outfits: [],
            routine: {
                morning: routineProducts.morning || [],
                evening: routineProducts.evening || []
            }
        };
    }
    
    selectProductsByConcern(products, concern) {
        // Priority mapping for different skin concerns
        const concernPriority = {
            'acne': ['Salicylic Acid', 'Niacinamide', 'BHA'],
            'aging': ['Retinol', 'Vitamin C', 'Peptides', 'Niacinamide'],
            'dryness': ['Hyaluronic Acid', 'Ceramides', 'Glycerin'],
            'sensitivity': ['Centella', 'No fragrances', 'Prebiotics'],
            'pigmentation': ['Vitamin C', 'Niacinamide', 'Alpha Arbutin']
        };
        
        const priorityIngredients = concernPriority[concern] || [];
        
        // Sort products by relevance to concern
        return products.sort((a, b) => {
            const aScore = a.ingredients.some(ing => 
                priorityIngredients.some(priority => ing.includes(priority))
            ) ? 1 : 0;
            const bScore = b.ingredients.some(ing => 
                priorityIngredients.some(priority => ing.includes(priority))
            ) ? 1 : 0;
            
            if (aScore !== bScore) return bScore - aScore;
            return b.rating - a.rating; // Secondary sort by rating
        });
    }

    generateFashionResponse(message, profile) {
        const outfitDatabase = {
            classic: {
                workwear: [
                    {
                        name: 'Professional Blazer Set',
                        items: [
                            { piece: 'Navy Wool Blazer', brand: 'J.Crew', price: '$298', buyLink: 'https://www.jcrew.com' },
                            { piece: 'Tailored Trousers', brand: 'Banana Republic', price: '$89', buyLink: 'https://bananarepublic.gap.com' },
                            { piece: 'Silk Blouse', brand: 'Everlane', price: '$78', buyLink: 'https://www.everlane.com' }
                        ],
                        occasion: 'Business meetings, interviews',
                        season: 'All seasons',
                        totalPrice: '$465'
                    }
                ],
                casual: [
                    {
                        name: 'Timeless Weekend Look',
                        items: [
                            { piece: 'Cashmere Sweater', brand: 'Uniqlo', price: '$59', buyLink: 'https://www.uniqlo.com' },
                            { piece: 'Dark Wash Jeans', brand: 'Levi\'s', price: '$69', buyLink: 'https://www.levi.com' },
                            { piece: 'White Sneakers', brand: 'Adidas', price: '$85', buyLink: 'https://www.adidas.com' }
                        ],
                        occasion: 'Weekend outings, casual dates',
                        season: 'Fall/Winter',
                        totalPrice: '$213'
                    }
                ]
            },
            trendy: {
                streetwear: [
                    {
                        name: 'Urban Chic Ensemble',
                        items: [
                            { piece: 'Oversized Blazer', brand: 'Zara', price: '$79', buyLink: 'https://www.zara.com' },
                            { piece: 'High-Waisted Jeans', brand: 'Urban Outfitters', price: '$64', buyLink: 'https://www.urbanoutfitters.com' },
                            { piece: 'Chunky Sneakers', brand: 'Nike', price: '$110', buyLink: 'https://www.nike.com' }
                        ],
                        occasion: 'Social events, shopping',
                        season: 'Spring/Summer',
                        totalPrice: '$253'
                    }
                ]
            },
            casual: {
                everyday: [
                    {
                        name: 'Comfortable Day Look',
                        items: [
                            { piece: 'Soft Knit Sweater', brand: 'Target', price: '$25', buyLink: 'https://www.target.com' },
                            { piece: 'Comfortable Jeans', brand: 'Old Navy', price: '$35', buyLink: 'https://oldnavy.gap.com' },
                            { piece: 'Canvas Sneakers', brand: 'Converse', price: '$55', buyLink: 'https://www.converse.com' }
                        ],
                        occasion: 'Daily errands, relaxed hangouts',
                        season: 'All seasons',
                        totalPrice: '$115'
                    }
                ]
            },
            edgy: {
                nightout: [
                    {
                        name: 'Rock Chic Look',
                        items: [
                            { piece: 'Leather Jacket', brand: 'AllSaints', price: '$298', buyLink: 'https://www.allsaints.com' },
                            { piece: 'Ripped Black Jeans', brand: 'Topshop', price: '$68', buyLink: 'https://www.topshop.com' },
                            { piece: 'Combat Boots', brand: 'Dr. Martens', price: '$150', buyLink: 'https://www.drmartens.com' }
                        ],
                        occasion: 'Concerts, night out',
                        season: 'Fall/Winter',
                        totalPrice: '$516'
                    }
                ]
            },
            romantic: {
                datenight: [
                    {
                        name: 'Elegant Date Look',
                        items: [
                            { piece: 'Midi Dress', brand: 'Reformation', price: '$148', buyLink: 'https://www.thereformation.com' },
                            { piece: 'Delicate Jewelry Set', brand: 'Mejuri', price: '$95', buyLink: 'https://mejuri.com' },
                            { piece: 'Block Heels', brand: 'Sam Edelman', price: '$120', buyLink: 'https://www.samedelman.com' }
                        ],
                        occasion: 'Date nights, dinner parties',
                        season: 'Spring/Summer',
                        totalPrice: '$363'
                    }
                ]
            },
            minimalist: {
                workwear: [
                    {
                        name: 'Clean Professional Look',
                        items: [
                            { piece: 'White Button-Down', brand: 'COS', price: '$79', buyLink: 'https://www.cosstores.com' },
                            { piece: 'Black Tailored Pants', brand: 'Everlane', price: '$98', buyLink: 'https://www.everlane.com' },
                            { piece: 'Minimal Watch', brand: 'MVMT', price: '$95', buyLink: 'https://www.mvmt.com' }
                        ],
                        occasion: 'Office, professional meetings',
                        season: 'All seasons',
                        totalPrice: '$272'
                    }
                ]
            }
        };

        // Select outfits based on user's style preference
        const userStyleOutfits = outfitDatabase[profile.personalStyle] || outfitDatabase.classic;
        const allOutfits = Object.values(userStyleOutfits).flat();
        
        // Select 2 outfit recommendations
        const selectedOutfits = allOutfits.slice(0, 2);
        
        return {
            text: `Perfect! Based on your ${profile.personalStyle} style preference, here are some curated outfit ideas that will make you look and feel amazing:`,
            products: [],
            outfits: selectedOutfits
        };
    }

    generateImageAnalysisResponse(profile) {
        const skinType = profile?.skinType || 'your';
        const stylePreference = profile?.personalStyle || 'preferred';
        
        return {
            text: `I can see you've uploaded an image! Based on your ${skinType} skin type and ${stylePreference} style preference, here's my analysis and recommendations:`,
            products: [
                { name: 'Color-Matching Foundation', reason: 'Perfect shade match for your skin tone', category: 'Premium', buyLink: '#' },
                { name: 'Complementary Lipstick', reason: 'Enhances your natural lip color', category: 'Mid-Range', buyLink: '#' }
            ],
            outfits: [
                { text: 'The colors in your image suggest earth tones would look amazing on you. Try a warm brown or olive green top.', buyLink: '#' }
            ]
        };
    }

    generateGeneralResponse(message, profile) {
        const skinType = profile?.skinType || 'your';
        const stylePreference = profile?.personalStyle || 'preferred';
        
        const responses = [
            `As someone with ${skinType} skin and ${stylePreference} style, I'd be happy to help! Could you be more specific about what you're looking for?`,
            `I'm here to help with both skincare and fashion advice tailored to your preferences. What would you like to know more about?`,
            `Based on your profile, I can provide personalized recommendations. Are you interested in skincare products, outfit suggestions, or something else?`
        ];
        
        return {
            text: responses[Math.floor(Math.random() * responses.length)],
            products: [],
            outfits: []
        };
    }

    // ========================================
    // ACCESSIBILITY & KEYBOARD NAVIGATION
    // ========================================

    handleKeyboardNavigation(event) {
        // Handle modal navigation
        const onboardingModal = document.getElementById('onboarding-modal');
        if (onboardingModal && onboardingModal.classList.contains('active')) {
            if (event.key === 'Escape') {
                // Don't allow closing onboarding with escape if no profile exists
                if (this.getUserProfile() && Object.keys(this.getUserProfile()).length > 0) {
                    this.hideOnboarding();
                    this.showChat();
                }
            }
            
            // Handle arrow key navigation for answer buttons
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const currentQuestion = document.querySelector('.question-card.active');
                if (currentQuestion) {
                    const buttons = currentQuestion.querySelectorAll('.answer-btn');
                    const currentIndex = Array.from(buttons).findIndex(btn => btn.getAttribute('tabindex') === '0');
                    
                    let newIndex;
                    if (event.key === 'ArrowDown') {
                        newIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                    } else {
                        newIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                    }
                    
                    // Update tabindex and focus
                    buttons.forEach((btn, index) => {
                        btn.setAttribute('tabindex', index === newIndex ? '0' : '-1');
                    });
                    buttons[newIndex].focus();
                }
            }
            
            // Handle space/enter for answer selection
            if (event.key === ' ' || event.key === 'Enter') {
                const focusedButton = document.activeElement;
                if (focusedButton && focusedButton.classList.contains('answer-btn')) {
                    event.preventDefault();
                    this.selectAnswer({ target: focusedButton });
                }
            }
            
            // Handle navigation button keyboard shortcuts
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                const nextBtn = document.getElementById('next-btn');
                const prevBtn = document.getElementById('prev-btn');
                const finishBtn = document.getElementById('finish-btn');
                
                if (event.key === 'ArrowLeft' && prevBtn && !prevBtn.disabled && !this.isTransitioning) {
                    this.prevQuestion();
                } else if (event.key === 'ArrowRight') {
                    if (finishBtn && !finishBtn.hidden && !finishBtn.disabled && !this.isTransitioning) {
                        this.finishOnboarding();
                    } else if (nextBtn && !nextBtn.disabled && !this.isTransitioning) {
                        this.nextQuestion();
                    }
                }
            }
        }
        
        // Handle chat navigation
        if (event.key === 'Escape' && document.activeElement.id === 'chat-input') {
            document.activeElement.blur();
        }
    }

    // ========================================
    // UI STATE MANAGEMENT
    // ========================================

    showOnboarding() {
        const modal = document.getElementById('onboarding-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show the first question
            this.showQuestion(1);
            
            // Focus first answer button for accessibility
            setTimeout(() => {
                const firstAnswer = document.querySelector('.question-card.active .answer-btn');
                if (firstAnswer) firstAnswer.focus();
            }, 300);
        }
    }

    hideOnboarding() {
        const modal = document.getElementById('onboarding-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showChat() {
        const chatSection = document.getElementById('chat-section');
        if (chatSection) {
            chatSection.style.display = 'block';
            
            // Focus chat input for accessibility
            setTimeout(() => {
                const chatInput = document.getElementById('chat-input');
                if (chatInput) chatInput.focus();
            }, 300);
        }
    }

    hideChat() {
        const chatSection = document.getElementById('chat-section');
        if (chatSection) {
            chatSection.style.display = 'none';
        }
    }

    // ========================================
    // LOCAL STORAGE MANAGEMENT
    // ========================================

    saveUserProfile() {
        try {
            const profileData = {
                ...this.userProfile,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem('prismAI_profile', JSON.stringify(profileData));
            this.saveSessionData();
        } catch (error) {
            console.error('Error saving user profile:', error);
            this.showStorageError('profile');
        }
    }

    loadUserProfile() {
        try {
            const saved = localStorage.getItem('prismAI_profile');
            if (saved) {
                const profileData = JSON.parse(saved);
                // Validate profile data structure
                if (this.validateProfileData(profileData)) {
                    this.userProfile = profileData;
                    this.loadSessionData();
                } else {
                    console.warn('Invalid profile data found, resetting profile');
                    this.userProfile = {};
                    this.clearStorageData('profile');
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            this.userProfile = {};
            this.showStorageError('profile');
        }
    }
    
    validateProfileData(data) {
        // Check if data has required structure and valid values
        if (!data || typeof data !== 'object') return false;
        
        const requiredFields = ['skinType', 'primaryConcern', 'personalStyle'];
        const validSkinTypes = ['oily', 'dry', 'sensitive', 'combination', 'normal'];
        const validConcerns = ['acne', 'aging', 'dryness', 'sensitivity', 'pigmentation'];
        const validStyles = ['classic', 'trendy', 'casual', 'edgy', 'romantic', 'minimalist'];
        
        // Check if all required fields exist and have valid values
        if (data.skinType && !validSkinTypes.includes(data.skinType)) return false;
        if (data.primaryConcern && !validConcerns.includes(data.primaryConcern)) return false;
        if (data.personalStyle && !validStyles.includes(data.personalStyle)) return false;
        
        return true;
    }

    getUserProfile() {
        return this.userProfile;
    }

    saveConversations() {
        try {
            // Limit conversation history to last 50 messages for performance
            const limitedConversations = this.conversations.slice(-50);
            const conversationData = {
                conversations: limitedConversations,
                lastSaved: new Date().toISOString(),
                totalMessages: this.conversations.length,
                version: '1.0'
            };
            localStorage.setItem('prismAI_conversations', JSON.stringify(conversationData));
        } catch (error) {
            console.error('Error saving conversations:', error);
            this.showStorageError('conversations');
            // Try to save with reduced data if storage is full
            this.compactConversationHistory();
        }
    }

    loadConversations() {
        try {
            const saved = localStorage.getItem('prismAI_conversations');
            if (saved) {
                const conversationData = JSON.parse(saved);
                if (this.validateConversationData(conversationData)) {
                    this.conversations = conversationData.conversations || [];
                } else {
                    console.warn('Invalid conversation data found, resetting conversations');
                    this.conversations = [];
                    this.clearStorageData('conversations');
                }
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.conversations = [];
            this.showStorageError('conversations');
        }
    }
    
    validateConversationData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!Array.isArray(data.conversations)) return false;
        
        // Validate each conversation has required fields
        return data.conversations.every(conv => 
            conv.hasOwnProperty('text') && 
            conv.hasOwnProperty('sender') && 
            conv.hasOwnProperty('timestamp')
        );
    }
    
    compactConversationHistory() {
        try {
            // Keep only essential data and reduce to 25 messages
            const compactConversations = this.conversations.slice(-25).map(conv => ({
                text: conv.text,
                sender: conv.sender,
                timestamp: conv.timestamp
                // Remove imageData, products, outfits to save space
            }));
            
            const compactData = {
                conversations: compactConversations,
                lastSaved: new Date().toISOString(),
                compacted: true,
                version: '1.0'
            };
            
            localStorage.setItem('prismAI_conversations', JSON.stringify(compactData));
            this.conversations = compactConversations;
        } catch (error) {
            console.error('Error compacting conversation history:', error);
            // Last resort: clear all conversations
            this.conversations = [];
            localStorage.removeItem('prismAI_conversations');
        }
    }
    
    // Session and Storage Management
    saveSessionData() {
        try {
            const sessionData = {
                sessionId: this.generateSessionId(),
                startTime: new Date().toISOString(),
                userAgent: navigator.userAgent,
                lastActivity: new Date().toISOString()
            };
            sessionStorage.setItem('prismAI_session', JSON.stringify(sessionData));
        } catch (error) {
            console.error('Error saving session data:', error);
        }
    }
    
    loadSessionData() {
        try {
            const saved = sessionStorage.getItem('prismAI_session');
            if (saved) {
                const sessionData = JSON.parse(saved);
                this.sessionId = sessionData.sessionId;
                this.updateLastActivity();
            }
        } catch (error) {
            console.error('Error loading session data:', error);
        }
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    updateLastActivity() {
        try {
            const saved = sessionStorage.getItem('prismAI_session');
            if (saved) {
                const sessionData = JSON.parse(saved);
                sessionData.lastActivity = new Date().toISOString();
                sessionStorage.setItem('prismAI_session', JSON.stringify(sessionData));
            }
        } catch (error) {
            console.error('Error updating last activity:', error);
        }
    }
    
    showStorageError(type) {
        const errorMessages = {
            profile: 'Unable to save your profile. Your browser storage might be full.',
            conversations: 'Unable to save chat history. Some older messages may be lost.',
            general: 'Storage error occurred. Please try refreshing the page.'
        };
        
        console.warn(errorMessages[type] || errorMessages.general);
        // Could show a user-friendly notification here
    }
    
    clearStorageData(type) {
        try {
            switch (type) {
                case 'profile':
                    localStorage.removeItem('prismAI_profile');
                    break;
                case 'conversations':
                    localStorage.removeItem('prismAI_conversations');
                    break;
                case 'session':
                    sessionStorage.removeItem('prismAI_session');
                    break;
                case 'all':
                    localStorage.removeItem('prismAI_profile');
                    localStorage.removeItem('prismAI_conversations');
                    sessionStorage.removeItem('prismAI_session');
                    break;
            }
        } catch (error) {
            console.error('Error clearing storage data:', error);
        }
    }
    
    getStorageUsage() {
        try {
            let totalSize = 0;
            const storageData = {
                profile: localStorage.getItem('prismAI_profile'),
                conversations: localStorage.getItem('prismAI_conversations'),
                session: sessionStorage.getItem('prismAI_session')
            };
            
            Object.keys(storageData).forEach(key => {
                if (storageData[key]) {
                    totalSize += storageData[key].length;
                }
            });
            
            return {
                totalSize: totalSize,
                profileSize: storageData.profile ? storageData.profile.length : 0,
                conversationsSize: storageData.conversations ? storageData.conversations.length : 0,
                sessionSize: storageData.session ? storageData.session.length : 0,
                formattedSize: this.formatBytes(totalSize)
            };
        } catch (error) {
            console.error('Error calculating storage usage:', error);
            return { totalSize: 0, formattedSize: '0 B' };
        }
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    exportUserData() {
        try {
            const exportData = {
                profile: this.userProfile,
                conversations: this.conversations,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `prism-ai-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error exporting user data:', error);
        }
    }
    
    importUserData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (this.validateImportData(importData)) {
                        this.userProfile = importData.profile || {};
                        this.conversations = importData.conversations || [];
                        
                        this.saveUserProfile();
                        this.saveConversations();
                        
                        resolve('Data imported successfully');
                    } else {
                        reject('Invalid data format');
                    }
                } catch (error) {
                    reject('Error parsing import file: ' + error.message);
                }
            };
            reader.readAsText(file);
        });
    }
    
    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        if (data.profile && !this.validateProfileData(data.profile)) return false;
        if (data.conversations && !Array.isArray(data.conversations)) return false;
        return true;
    }

    loadChatHistory() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        // Clear existing messages except welcome message
        messagesContainer.innerHTML = '';
        
        // Load saved conversations
        this.conversations.forEach(conv => {
            this.addMessageToDOM(conv.text, conv.sender, conv.imageData, conv.products, conv.outfits);
        });
        
        // If no conversations, show welcome message
        if (this.conversations.length === 0) {
            messagesContainer.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Hello! I'm your personal Prism AI assistant. I'm here to help you with skincare recommendations, fashion advice, and style suggestions. Feel free to ask me anything or upload an image for analysis!</p>
                    </div>
                </div>
            `;
        }
    }

    addMessageToDOM(text, sender, imageData = null, products = null, outfits = null) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Add text content
        if (text) {
            const textP = document.createElement('p');
            textP.textContent = text;
            contentDiv.appendChild(textP);
        }
        
        // Add image if present
        if (imageData) {
            const img = document.createElement('img');
            img.src = imageData;
            img.style.maxWidth = '200px';
            img.style.borderRadius = '8px';
            img.style.marginTop = '0.5rem';
            contentDiv.appendChild(img);
        }
        
        // Add product suggestions
        if (products && products.length > 0) {
            const productsDiv = document.createElement('div');
            productsDiv.className = 'product-suggestions';
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <h4>${product.name}</h4>
                    <p>${product.reason}</p>
                    <span class="category">${product.category}</span>
                    <a href="${product.buyLink}" class="buy-btn" target="_blank">View Product</a>
                `;
                productsDiv.appendChild(productCard);
            });
            
            contentDiv.appendChild(productsDiv);
        }
        
        // Add outfit suggestions
        if (outfits && outfits.length > 0) {
            outfits.forEach(outfit => {
                const outfitP = document.createElement('p');
                outfitP.innerHTML = `<strong>Style Suggestion:</strong> ${outfit.text}`;
                if (outfit.buyLink) {
                    const outfitLink = document.createElement('a');
                    outfitLink.href = outfit.buyLink;
                    outfitLink.textContent = ' Shop Similar';
                    outfitLink.className = 'buy-btn';
                    outfitLink.target = '_blank';
                    outfitP.appendChild(outfitLink);
                }
                contentDiv.appendChild(outfitP);
            });
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize Prism AI when DOM is loaded
let prismAI;
document.addEventListener('DOMContentLoaded', function() {
    prismAI = new PrismAI();
    // Export for global access after initialization
    window.prismAI = prismAI;
});

// Export the simulateGeminiAPI function for easy access
window.simulateGeminiAPI = function(userMessage, userImageData = null) {
    if (prismAI) {
        return prismAI.simulateGeminiAPI(userMessage, userImageData);
    }
    return Promise.resolve({ text: 'Prism AI not initialized', products: [], outfits: [] });
};