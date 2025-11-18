// AI VOGUE - Authentication Check for Profile Buttons
// This script ensures all profile buttons properly redirect with authentication

class AuthChecker {
    constructor() {
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupProfileButtons());
        } else {
            this.setupProfileButtons();
        }
    }

    setupProfileButtons() {
        // Find all profile buttons across different header types
        const profileButtons = document.querySelectorAll(
            '.account-link, .gucci-icon[aria-label="Account"], [onclick*="profile.html"]'
        );

        profileButtons.forEach(button => {
            // Remove existing onclick handlers
            button.removeAttribute('onclick');
            
            // Add new click handler with authentication check
            button.addEventListener('click', this.handleProfileClick.bind(this));
        });

        console.log(`AuthChecker: Found ${profileButtons.length} profile buttons`);
    }

    async handleProfileClick(e) {
        e.preventDefault();
        e.stopPropagation();

        try {
            // Show loading state
            this.showLoading(e.currentTarget);

            // Check if user is authenticated
            const isAuthenticated = await this.checkAuthentication();

            if (isAuthenticated) {
                // User is logged in, redirect to profile
                window.location.href = 'profile.html';
            } else {
                // User not logged in, redirect to login with return URL
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                window.location.href = `login.html?redirect=profile&from=${currentPage}`;
            }
        } catch (error) {
            console.error('Profile click error:', error);
            // Fallback: redirect to login
            window.location.href = 'login.html?redirect=profile';
        } finally {
            this.hideLoading(e.currentTarget);
        }
    }

    async checkAuthentication() {
        try {
            // Try to import authService if available
            if (typeof authService !== 'undefined') {
                return await authService.isAuthenticated();
            }

            // Fallback: check for session in localStorage
            const session = localStorage.getItem('appwrite-session');
            return !!session;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    showLoading(button) {
        button.style.opacity = '0.6';
        button.style.pointerEvents = 'none';
    }

    hideLoading(button) {
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
    }
}

// Initialize auth checker
new AuthChecker();

// Export for use in other scripts
window.AuthChecker = AuthChecker;
