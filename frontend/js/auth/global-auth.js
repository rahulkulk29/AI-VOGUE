// AI VOGUE - Global Authentication State Manager
// Centralized authentication across all pages

import { authService } from '../appwrite-config.js';

class GlobalAuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authListeners = [];
        this.init();
    }

    async init() {
        // Check authentication status on page load
        await this.checkAuthStatus();

        // Update UI across all pages
        this.updateAllProfileIcons();

        // Listen for storage changes (for cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'auth_state_changed') {
                this.checkAuthStatus();
            }
        });
    }

    async checkAuthStatus() {
        try {
            this.currentUser = await authService.getCurrentUser();
            this.isAuthenticated = !!this.currentUser;

            // Store auth state in localStorage for cross-tab sync
            localStorage.setItem('user_authenticated', this.isAuthenticated ? 'true' : 'false');
            if (this.currentUser) {
                localStorage.setItem('user_data', JSON.stringify({
                    name: this.currentUser.name,
                    email: this.currentUser.email,
                    id: this.currentUser.$id
                }));
            } else {
                localStorage.removeItem('user_data');
            }

            // Notify all listeners
            this.notifyListeners();

            return this.isAuthenticated;
        } catch (error) {
            console.error('Auth check error:', error);
            this.isAuthenticated = false;
            this.currentUser = null;
            return false;
        }
    }

    async login(email, password) {
        try {
            await authService.login(email, password);
            await this.checkAuthStatus();

            // Notify other tabs
            localStorage.setItem('auth_state_changed', Date.now().toString());

            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await authService.logout();
            this.isAuthenticated = false;
            this.currentUser = null;

            // Clear localStorage
            localStorage.removeItem('user_authenticated');
            localStorage.removeItem('user_data');

            // Notify other tabs
            localStorage.setItem('auth_state_changed', Date.now().toString());

            // Redirect to home
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // Subscribe to auth state changes
    onAuthStateChange(callback) {
        this.authListeners.push(callback);
        // Immediately call with current state
        callback(this.isAuthenticated, this.currentUser);
    }

    // Notify all listeners
    notifyListeners() {
        this.authListeners.forEach(callback => {
            callback(this.isAuthenticated, this.currentUser);
        });
    }

    // Get user's initials for profile icon
    getUserInitials() {
        if (!this.currentUser || !this.currentUser.name) {
            return '?';
        }

        const names = this.currentUser.name.trim().split(' ');
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }

        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }

    // Update all profile icons across the page
    updateAllProfileIcons() {
        // Find all account/profile buttons
        const profileButtons = document.querySelectorAll(
            '.account-link, .gucci-icon[aria-label="Account"], [aria-label="Account"], .profile-icon'
        );

        profileButtons.forEach(button => {
            this.updateProfileIcon(button);
        });
    }

    // Update a single profile icon
    updateProfileIcon(button) {
        if (!button) return;

        if (this.isAuthenticated && this.currentUser) {
            // User is logged in - show initials
            const initials = this.getUserInitials();

            // Create or update initials element
            let initialsEl = button.querySelector('.user-initials');
            if (!initialsEl) {
                initialsEl = document.createElement('div');
                initialsEl.className = 'user-initials';

                // Clear existing content (SVG icons)
                const svg = button.querySelector('svg');
                if (svg) svg.style.display = 'none';

                button.appendChild(initialsEl);
            }

            initialsEl.textContent = initials;
            initialsEl.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #91855A 0%, #6B6340 100%);
                color: white;
                font-weight: 600;
                font-size: 14px;
                font-family: var(--font-sans, 'Inter', sans-serif);
                cursor: pointer;
                transition: all 0.3s ease;
            `;

            // Add hover effect
            button.addEventListener('mouseenter', () => {
                initialsEl.style.transform = 'scale(1.1)';
                initialsEl.style.boxShadow = '0 4px 12px rgba(145, 133, 90, 0.3)';
            });

            button.addEventListener('mouseleave', () => {
                initialsEl.style.transform = 'scale(1)';
                initialsEl.style.boxShadow = 'none';
            });

            // Set click handler to go to profile
            button.onclick = (e) => {
                e.preventDefault();
                window.location.href = 'profile.html';
            };

        } else {
            // User is not logged in - show default icon
            const initialsEl = button.querySelector('.user-initials');
            if (initialsEl) {
                initialsEl.remove();
            }

            const svg = button.querySelector('svg');
            if (svg) svg.style.display = 'block';

            // Set click handler to go to login
            button.onclick = (e) => {
                e.preventDefault();
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                window.location.href = `login.html?redirect=${currentPage}`;
            };
        }
    }

    // Add logout button to profile dropdown (if exists)
    addLogoutButton() {
        if (!this.isAuthenticated) return;

        // This can be customized based on your UI
        const profileButtons = document.querySelectorAll('.account-link, .gucci-icon[aria-label="Account"]');

        profileButtons.forEach(button => {
            // Add title attribute
            button.title = `Logged in as ${this.currentUser.name}`;

            // You can add a dropdown menu here if needed
            // For now, clicking goes to profile page where logout button exists
        });
    }
}

// Create global instance
const globalAuth = new GlobalAuthManager();

// Export for use in other scripts
export { globalAuth };

// Attach to window for non-module scripts
if (typeof window !== 'undefined') {
    window.globalAuth = globalAuth;
}
