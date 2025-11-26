// Global Authentication Handler - Works on ALL Pages
// Import this script on every page to enable centralized auth

import { authService } from './appwrite-config.js?v=7';

// Global auth state
window.AIVOGUE_AUTH = {
    user: null,
    isAuthenticated: false,
    ready: false
};

// Initialize authentication on page load
(async function initGlobalAuth() {
    try {
        console.log('🔐 Initializing global authentication...');
        
        // Check authentication status
        const user = await authService.getCurrentUser();
        
        if (user) {
            window.AIVOGUE_AUTH.user = user;
            window.AIVOGUE_AUTH.isAuthenticated = true;
            console.log('✅ User authenticated:', user.email);
        } else {
            console.log('⚠️ Not authenticated - Guest mode');
        }
        
        // Update UI across the page
        updateAuthUI();
        
        // Mark auth as ready
        window.AIVOGUE_AUTH.ready = true;
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('auth-ready', { 
            detail: { user, isAuthenticated: !!user } 
        }));
        
    } catch (error) {
        console.error('❌ Auth initialization error:', error);
        window.AIVOGUE_AUTH.ready = true;
        window.AIVOGUE_AUTH.isAuthenticated = false;
    }
})();

// Update all auth-related UI elements
function updateAuthUI() {
    const isAuth = window.AIVOGUE_AUTH.isAuthenticated;
    const user = window.AIVOGUE_AUTH.user;
    
    // Update all account links/buttons
    const accountIcons = document.querySelectorAll('[aria-label*="Account"], .account-btn, .login-btn');
    accountIcons.forEach(element => {
        if (isAuth) {
            // Logged in: point to profile
            if (element.tagName === 'A') {
                element.href = 'profile.html';
            }
            element.setAttribute('title', `Hi, ${user.name || user.email}!`);
            
            // Change icon if it's an emoji or text
            if (element.textContent.includes('👤')) {
                element.textContent = '✅';
            }
        } else {
            // Not logged in: point to login
            if (element.tagName === 'A') {
                element.href = 'login.html';
            }
            element.setAttribute('title', 'Login / Sign Up');
        }
    });
    
    // Show/hide elements based on auth state
    const loginRequired = document.querySelectorAll('[data-auth-required="true"]');
    const guestOnly = document.querySelectorAll('[data-guest-only="true"]');
    
    loginRequired.forEach(el => {
        el.style.display = isAuth ? '' : 'none';
    });
    
    guestOnly.forEach(el => {
        el.style.display = isAuth ? 'none' : '';
    });
    
    // Add user name to welcome elements
    const welcomeElements = document.querySelectorAll('[data-user-name]');
    welcomeElements.forEach(el => {
        if (isAuth && user) {
            el.textContent = user.name || user.email.split('@')[0];
        }
    });
}

// Global logout function
window.logout = async function() {
    try {
        console.log('🚪 Logging out...');
        await authService.logout();
        
        // Clear auth state
        window.AIVOGUE_AUTH.user = null;
        window.AIVOGUE_AUTH.isAuthenticated = false;
        
        // Redirect to home or login
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
};

// Helper: Check if user is authenticated (for other scripts)
window.isUserLoggedIn = function() {
    return window.AIVOGUE_AUTH.isAuthenticated;
};

// Helper: Get current user (for other scripts)
window.getCurrentUser = function() {
    return window.AIVOGUE_AUTH.user;
};

// Helper: Wait for auth to be ready
window.waitForAuth = function() {
    return new Promise(resolve => {
        if (window.AIVOGUE_AUTH.ready) {
            resolve(window.AIVOGUE_AUTH);
        } else {
            window.addEventListener('auth-ready', () => {
                resolve(window.AIVOGUE_AUTH);
            }, { once: true });
        }
    });
};

console.log('✅ Global auth module loaded');
