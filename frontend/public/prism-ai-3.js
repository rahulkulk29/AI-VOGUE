// Prism AI 3.0 - Main JavaScript Module
// Handles quiz flow, chat interface, and API communication

import { AppwriteService } from './appwrite-config-v3.js';

// ============================================
// QUIZ MANAGER
// ============================================

class QuizManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.userData = {
            skinType: '',
            skinConcerns: [],
            hairType: '',
            hairThickness: '',
            scalpType: '',
            hairConcerns: [],
            clothingStyles: [],
            skincareBudget: { min: 200, max: 1000 },
            haircareBudget: { min: 200, max: 800 },
            fashionBudget: { min: 500, max: 3000 }
        };

        this.init();
    }

    init() {
        // Modal controls
        document.getElementById('start-quiz-btn').addEventListener('click', () => this.openQuiz());
        document.getElementById('close-quiz').addEventListener('click', () => this.closeQuiz());

        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => this.previousStep());
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());

        // Single-select options (skin type, hair type, etc.)
        this.setupSingleSelect('skin-type-options', 'skinType');
        this.setupSingleSelect('hair-type-options', 'hairType');
        this.setupSingleSelect('hair-thickness-options', 'hairThickness');
        this.setupSingleSelect('scalp-type-options', 'scalpType');

        // Multi-select chips
        this.setupMultiSelect('skin-concerns', 'skinConcerns');
        this.setupMultiSelect('hair-concerns', 'hairConcerns');
        this.setupMultiSelect('clothing-styles', 'clothingStyles');

        // Budget inputs
        this.setupBudgetInputs();

        // Close modal on outside click
        document.getElementById('quiz-modal').addEventListener('click', (e) => {
            if (e.target.id === 'quiz-modal') {
                this.closeQuiz();
            }
        });
    }

    setupSingleSelect(containerId, dataKey) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const options = container.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected from all options in this container
                options.forEach(opt => opt.classList.remove('selected'));
                // Add selected to clicked option
                option.classList.add('selected');
                // Update data
                this.userData[dataKey] = option.dataset.value;
            });
        });
    }

    setupMultiSelect(containerId, dataKey) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const chips = container.querySelectorAll('.chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('selected');

                const value = chip.dataset.value;
                const index = this.userData[dataKey].indexOf(value);

                if (index > -1) {
                    // Remove from array
                    this.userData[dataKey].splice(index, 1);
                } else {
                    // Add to array
                    this.userData[dataKey].push(value);
                }
            });
        });
    }

    setupBudgetInputs() {
        const budgetFields = [
            { min: 'skincare-min', max: 'skincare-max', key: 'skincareBudget' },
            { min: 'haircare-min', max: 'haircare-max', key: 'haircareBudget' },
            { min: 'fashion-min', max: 'fashion-max', key: 'fashionBudget' }
        ];

        budgetFields.forEach(field => {
            const minInput = document.getElementById(field.min);
            const maxInput = document.getElementById(field.max);

            minInput.addEventListener('input', () => {
                this.userData[field.key].min = parseInt(minInput.value) || 0;
            });

            maxInput.addEventListener('input', () => {
                this.userData[field.key].max = parseInt(maxInput.value) || 0;
            });
        });
    }

    openQuiz() {
        document.getElementById('quiz-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeQuiz() {
        document.getElementById('quiz-modal').classList.remove('active');
        document.body.style.overflow = '';
    }

    nextStep() {
        // Validate current step
        if (!this.validateStep(this.currentStep)) {
            alert('Please complete all required fields before continuing.');
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStep();
        } else {
            // Last step - save and close
            this.saveProfile();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStep();
        }
    }

    validateStep(step) {
        switch (step) {
            case 1:
                return this.userData.skinType !== '';
            case 2:
                return this.userData.hairType !== '' &&
                    this.userData.hairThickness !== '' &&
                    this.userData.scalpType !== '';
            case 3:
                return this.userData.clothingStyles.length > 0;
            case 4:
                return true; // Budget has default values
            case 5:
                return true; // Summary step
            default:
                return true;
        }
    }

    updateStep() {
        // Update progress
        const progress = (this.currentStep / this.totalSteps) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `Step ${this.currentStep} of ${this.totalSteps}`;

        // Show current step
        document.querySelectorAll('.quiz-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Update navigation buttons
        document.getElementById('prev-btn').disabled = this.currentStep === 1;

        const nextBtn = document.getElementById('next-btn');
        if (this.currentStep === this.totalSteps) {
            nextBtn.textContent = 'Save & Start Chatting';
            nextBtn.classList.add('primary');
        } else {
            nextBtn.textContent = 'Next';
        }

        // If on summary step, populate summary
        if (this.currentStep === 5) {
            this.populateSummary();
        }
    }

    populateSummary() {
        const summaryGrid = document.getElementById('summary-grid');

        const summaryHTML = `
            <div class="summary-item">
                <div class="summary-label">Skin Type</div>
                <div class="summary-value">${this.capitalize(this.userData.skinType)}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Skin Concerns</div>
                <div class="summary-value">${this.formatArray(this.userData.skinConcerns)}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Hair Type</div>
                <div class="summary-value">${this.capitalize(this.userData.hairType)} • ${this.capitalize(this.userData.hairThickness)} Thickness</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Scalp Type</div>
                <div class="summary-value">${this.capitalize(this.userData.scalpType)}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Hair Concerns</div>
                <div class="summary-value">${this.formatArray(this.userData.hairConcerns)}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Style Preferences</div>
                <div class="summary-value">${this.formatArray(this.userData.clothingStyles)}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Skincare Budget</div>
                <div class="summary-value">₹${this.userData.skincareBudget.min} - ₹${this.userData.skincareBudget.max}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Haircare Budget</div>
                <div class="summary-value">₹${this.userData.haircareBudget.min} - ₹${this.userData.haircareBudget.max}</div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Fashion Budget</div>
                <div class="summary-value">₹${this.userData.fashionBudget.min} - ₹${this.userData.fashionBudget.max}</div>
            </div>
        `;

        summaryGrid.innerHTML = summaryHTML;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
    }

    formatArray(arr) {
        if (arr.length === 0) return 'None selected';
        return arr.map(item => this.capitalize(item)).join(', ');
    }

    async saveProfile() {
        try {
            // Show loading state
            const nextBtn = document.getElementById('next-btn');
            nextBtn.disabled = true;
            nextBtn.textContent = 'Saving...';

            // Save to Appwrite
            const userId = await AppwriteService.saveProfile(this.userData);

            // Store userId in localStorage
            localStorage.setItem('prism-ai-user-id', userId);

            // Close modal and show chat
            this.closeQuiz();
            document.getElementById('chat-section').classList.add('active');

            // Scroll to chat
            document.getElementById('chat-section').scrollIntoView({ behavior: 'smooth' });

            // Success message
            console.log('Profile saved successfully!', userId);

        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save your profile. Please try again.');

            // Reset button
            const nextBtn = document.getElementById('next-btn');
            nextBtn.disabled = false;
            nextBtn.textContent = 'Save & Start Chatting';
        }
    }
}

// ============================================
// CHAT MANAGER
// ============================================

class ChatManager {
    constructor() {
        this.messagesContainer = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.typingIndicator = document.getElementById('typing-indicator');

        // TODO: Update this to your backend API endpoint
        this.apiEndpoint = 'http://localhost:3000/api/chat';

        this.init();
    }

    init() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const message = this.userInput.value.trim();

        if (!message) return;

        // Clear input
        this.userInput.value = '';

        // Add user message to chat
        this.addUserMessage(message);

        // Show typing indicator
        this.showTyping();

        try {
            // Get user ID
            const userId = localStorage.getItem('prism-ai-user-id') || 'guest';

            // Call backend API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();

            // Hide typing indicator
            this.hideTyping();

            // Add AI response
            this.addAIMessage(data.advice, data.products);

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTyping();
            this.addAIMessage('Sorry, I encountered an error. Please make sure the backend server is running and configured correctly.', []);
        }
    }

    addUserMessage(text) {
        const messageHTML = `
            <div class="message user-message">
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div class="message-content">
                    <p>${this.escapeHTML(text)}</p>
                </div>
            </div>
        `;

        // Insert before typing indicator
        this.typingIndicator.insertAdjacentHTML('beforebegin', messageHTML);
        this.scrollToBottom();
    }

    addAIMessage(text, products = []) {
        const productsHTML = products.length > 0 ? this.generateProductCards(products) : '';

        const messageHTML = `
            <div class="message">
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                </div>
                <div class="message-content">
                    <p>${this.escapeHTML(text)}</p>
                    ${productsHTML}
                </div>
            </div>
        `;

        // Insert before typing indicator
        this.typingIndicator.insertAdjacentHTML('beforebegin', messageHTML);
        this.scrollToBottom();
    }

    generateProductCards(products) {
        if (!products || products.length === 0) return '';

        const cardsHTML = products.map(product => `
            <div class="product-card">
                <div class="product-info-wrapper">
                    <div class="product-title">${this.escapeHTML(product.title)}</div>
                    <div class="product-meta">
                        <span class="product-price">${this.escapeHTML(product.price)}</span>
                        <span class="product-store">${this.escapeHTML(product.store)}</span>
                    </div>
                    <a href="${this.escapeHTML(product.url)}" target="_blank" rel="noopener noreferrer" class="product-btn">
                        View Product
                    </a>
                </div>
            </div>
        `).join('');

        return `<div class="product-cards">${cardsHTML}</div>`;
    }

    showTyping() {
        this.typingIndicator.classList.add('active');
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingIndicator.classList.remove('active');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// FADE-IN ANIMATIONS
// ============================================

function setupFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(el => observer.observe(el));
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize quiz manager
    const quizManager = new QuizManager();

    // Initialize chat manager
    const chatManager = new ChatManager();

    // Setup fade-in animations
    setupFadeInAnimations();

    console.log('Prism AI 3.0 initialized successfully!');
});
