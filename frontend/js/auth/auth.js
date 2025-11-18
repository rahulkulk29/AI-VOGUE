// AI VOGUE - Authentication Handler

import { authService } from '../appwrite-config.js';
import { preferencesService } from '../services/preferences-service.js';

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthStatus();
    initializeAuthForms();
});

// Check authentication status
async function checkAuthStatus() {
    const isAuthenticated = await authService.isAuthenticated();
    
    // Update UI based on auth status
    const accountIcons = document.querySelectorAll('[aria-label="Account"]');
    accountIcons.forEach(icon => {
        if (isAuthenticated) {
            icon.href = 'profile.html';
            icon.onclick = null;
        } else {
            icon.href = 'login.html';
            icon.onclick = null;
        }
    });
    
    // If on profile page and not authenticated, redirect to login
    if (window.location.pathname.includes('profile.html') && !isAuthenticated) {
        window.location.href = 'login.html?redirect=profile';
    }
    
    return isAuthenticated;
}

// Initialize authentication forms
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    
    // Form toggle functionality
    if (toggleBtns.length > 0) {
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const formType = this.getAttribute('data-form');
                
                // Update active button
                toggleBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide forms
                if (formType === 'login') {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                } else {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                }
            });
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const showIcon = this.querySelector('.show-password');
            const hideIcon = this.querySelector('.hide-password');
            
            if (input.type === 'password') {
                input.type = 'text';
                showIcon.style.display = 'none';
                hideIcon.style.display = 'inline';
            } else {
                input.type = 'password';
                showIcon.style.display = 'inline';
                hideIcon.style.display = 'none';
            }
        });
    });
    
    // Password strength indicator
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', updatePasswordStrength);
    }
    
    // Social login buttons (placeholder functionality)
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList[1].replace('-btn', '');
            showMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'info');
        });
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.auth-submit');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing In...';
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validate inputs
        if (!email || !password) {
            throw new Error('Please fill in all fields');
        }
        
        // Attempt login
        await authService.login(email, password);
        
        showMessage('Login successful! Syncing preferences...', 'success');
        
        // Sync guest preferences if any
        await syncGuestPreferences();
        
        // Get redirect URL from query params or default to profile
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'profile';
        
        // Handle redirect properly (with or without .html extension)
        setTimeout(() => {
            if (redirect.includes('.html')) {
                window.location.href = redirect;
            } else {
                window.location.href = `${redirect}.html`;
            }
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message && error.message.includes('session is active')) {
            showMessage('Already logged in! Redirecting to profile...', 'success');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        } else if (error.message && error.message.includes('Network request failed')) {
            showMessage('Connection error. Please check your internet and try again.', 'error');
        } else {
            showMessage(error.message || 'Login failed. Please check your credentials.', 'error');
        }
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.auth-submit');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validation
        if (!firstName || !lastName || !email || !password) {
            throw new Error('Please fill in all required fields');
        }
        
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        if (!agreeTerms) {
            throw new Error('You must agree to the Terms of Service');
        }
        
        const fullName = `${firstName} ${lastName}`;
        
        // Attempt registration
        await authService.register(email, password, fullName);
        
        showMessage('Account created successfully! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        if (error.message && error.message.includes('already exists')) {
            showMessage('Account already exists! Please use the Sign In tab.', 'info');
            // Auto-switch to login tab
            setTimeout(() => {
                const loginTab = document.querySelector('[data-form="login"]');
                const emailField = document.getElementById('loginEmail');
                if (loginTab && emailField) {
                    loginTab.click();
                    emailField.value = email;
                    emailField.focus();
                }
            }, 2000);
        } else {
            showMessage(error.message || 'Registration failed. Please try again.', 'error');
        }
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Update password strength indicator
function updatePasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let label = 'Weak';
    let color = '#ff4444';
    
    // Check password strength
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 15;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 10;
    
    // Update label and color
    if (strength >= 75) {
        label = 'Strong';
        color = '#4caf50';
    } else if (strength >= 50) {
        label = 'Medium';
        color = '#ff9800';
    }
    
    // Update UI
    strengthBar.style.width = `${strength}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = `Password strength: ${label}`;
    strengthText.style.color = color;
}

// Sync guest preferences to database after login
async function syncGuestPreferences() {
    try {
        const guestPrefs = localStorage.getItem('prism_preferences_guest');
        if (guestPrefs) {
            console.log('📤 Syncing guest preferences to database...');
            const prefs = JSON.parse(guestPrefs);
            await preferencesService.savePreferences(prefs);
            localStorage.removeItem('prism_preferences_guest');
            console.log('✅ Guest preferences synced successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Error syncing preferences:', error);
        return false;
    }
}

// Show message notification
function showMessage(message, type = 'info') {
    // Remove existing message
    const existing = document.querySelector('.auth-message');
    if (existing) existing.remove();
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.textContent = message;
    
    // Insert at top of login container
    const container = document.querySelector('.login-card') || document.body;
    container.insertBefore(messageDiv, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Export functions
export { checkAuthStatus, handleLogin, handleRegister, showMessage };
