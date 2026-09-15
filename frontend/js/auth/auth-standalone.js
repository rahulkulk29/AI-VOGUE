// AI VOGUE - Authentication Handler (Fixed Version)
// This version works without module imports for better compatibility

// Wait for DOM and Appwrite SDK to be ready
document.addEventListener('DOMContentLoaded', async function () {
    // Wait for Appwrite SDK to load
    await waitForAppwrite();

    // Initialize authentication
    await checkAuthStatus();
    initializeAuthForms();

    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        if (error === 'google_login_failed') {
            showMessage('Google login failed or was cancelled.', 'error');
        } else {
            showMessage('Login failed: ' + error, 'error');
        }
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Fallback configuration
const FALLBACK_CONFIG = {
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: '68dd18860033ab7dffac',
    databaseId: '68dd21f50029362dfb7a',
    collections: {
        users: 'users',
        orders: 'orders',
        wishlist: 'wishlist',
        addresses: 'addresses',
        user_preferences: 'user_preferences',
        voguevision: 'voguevision',
        shirt: 'shirt',
        pant: 'pant',
        shoe: 'shoe'
    },
    bucketId: 'avatars'
};

// Wait for Appwrite SDK to be available
function waitForAppwrite() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds timeout

        const check = () => {
            if (window.authService && window.APPWRITE_CONFIG) {
                resolve();
            } else if (attempts < maxAttempts) {
                attempts++;
                // If not found after 0.5 second, try to inject script if not present
                if (attempts === 5 && !document.querySelector('script[src*="appwrite-config.js"]')) {
                    const script = document.createElement('script');
                    script.type = 'module';
                    script.src = '../js/appwrite-config.js';
                    document.head.appendChild(script);
                }
                setTimeout(check, 100);
            } else {
                console.warn('Appwrite config module failed to load. Initializing fallback...');
                initializeFallbackAuth();
                resolve();
            }
        };
        check();
    });
}

// Initialize Appwrite if module failed
function initializeFallbackAuth() {
    if (window.authService) return; // Already initialized

    if (typeof Appwrite === 'undefined') {
        console.error('Appwrite SDK not loaded');
        return;
    }

    console.log('Initializing fallback auth service...');
    const client = new Appwrite.Client();
    client.setEndpoint(FALLBACK_CONFIG.endpoint).setProject(FALLBACK_CONFIG.projectId);

    const account = new Appwrite.Account(client);
    const databases = new Appwrite.Databases(client);
    const storage = new Appwrite.Storage(client);

    // Mock authService interface
    window.authService = {
        isAuthenticated: async () => {
            try {
                await account.get();
                return true;
            } catch { return false; }
        },
        getCurrentUser: async () => {
            try {
                return await account.get();
            } catch { return null; }
        },
        login: async (email, password) => {
            return await account.createEmailPasswordSession(email, password);
        },
        register: async (email, password, name) => {
            const response = await account.create('unique()', email, password, name);
            await account.createEmailPasswordSession(email, password);

            // Create profile
            try {
                const [firstName, ...lastNameParts] = name.split(' ');
                const lastName = lastNameParts.join(' ');

                await databases.createDocument(
                    FALLBACK_CONFIG.databaseId,
                    FALLBACK_CONFIG.collections.users,
                    response.$id,
                    {
                        userId: response.$id,
                        firstName: firstName,
                        lastName: lastName || '',
                        email: email,
                        membershipTier: 'Silver',
                        rewardPoints: 0,
                        newsletter: true
                    }
                );
            } catch (err) {
                console.error('Failed to create profile document:', err);
            }

            return response;
        },
        loginWithGoogle: async () => {
            const origin = window.location.origin;
            const path = window.location.pathname;
            const basePath = path.substring(0, path.lastIndexOf('/'));

            // Handle file:// protocol
            const successUrl = origin === 'null' ? 'profile.html' : `${origin}${basePath}/profile.html`;
            const failureUrl = origin === 'null' ? 'login.html?error=google_login_failed' : `${origin}${basePath}/login.html?error=google_login_failed`;

            return await account.createOAuth2Session('google', successUrl, failureUrl);
        },
        logout: async () => {
            await account.deleteSession('current');
            window.location.href = 'index.html';
        },
        getUserProfile: async (userId) => {
            try {
                return await databases.getDocument(FALLBACK_CONFIG.databaseId, FALLBACK_CONFIG.collections.users, userId);
            } catch { return null; }
        },
        createUserProfile: async (userId, name, email) => {
            const [firstName, ...lastNameParts] = name.split(' ');
            const lastName = lastNameParts.join(' ');
            return await databases.createDocument(
                FALLBACK_CONFIG.databaseId,
                FALLBACK_CONFIG.collections.users,
                userId,
                {
                    userId: userId,
                    firstName: firstName,
                    lastName: lastName || '',
                    email: email,
                    membershipTier: 'Silver',
                    rewardPoints: 0,
                    newsletter: true,
                    avatar: 'https://placehold.co/160x160/png'
                }
            );
        },
        updateProfile: async (userId, data) => {
            return await databases.updateDocument(FALLBACK_CONFIG.databaseId, FALLBACK_CONFIG.collections.users, userId, data);
        },
        uploadAvatar: async (file) => {
            const response = await storage.createFile(FALLBACK_CONFIG.bucketId, 'unique()', file);
            return storage.getFileView(FALLBACK_CONFIG.bucketId, response.$id);
        }
    };

    window.APPWRITE_CONFIG = FALLBACK_CONFIG;
    window.databases = databases;
    window.storage = storage;
    window.account = account;
}

// Check authentication status
async function checkAuthStatus() {
    try {
        if (!window.authService) {
            console.warn('Auth service not available yet');
            return false;
        }

        const isAuthenticated = await window.authService.isAuthenticated();

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
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// Initialize authentication forms
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBtns = document.querySelectorAll('.toggle-btn');

    // Form toggle functionality
    if (toggleBtns.length > 0) {
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', function () {
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
        toggle.addEventListener('click', function () {
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

    // Google login button
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async function () {
            try {
                if (!window.authService) {
                    throw new Error('Authentication service not available. Please refresh the page.');
                }

                // Disable button to prevent multiple clicks
                this.disabled = true;
                this.style.opacity = '0.7';
                const originalText = this.innerHTML;
                this.innerHTML = '<span>Connecting...</span>';

                await window.authService.loginWithGoogle();

            } catch (error) {
                console.error('Google login error:', error);
                showMessage('Failed to initialize Google login. Please try again.', 'error');
                this.disabled = false;
                this.style.opacity = '1';
                this.innerHTML = originalText;
            }
        });
    }
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

        // Check if authService is available
        if (!window.authService) {
            throw new Error('Authentication service not available. Please refresh the page.');
        }

        // Attempt login
        await window.authService.login(email, password);

        showMessage('Login successful! Redirecting...', 'success');

        // Sync guest preferences if any
        await syncGuestPreferences();

        // Update global auth if available
        if (window.globalAuth) {
            await window.globalAuth.checkAuthStatus();
        }

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
        let errorMessage = 'Login failed. Please try again.';

        if (error.message && error.message.includes('session is active')) {
            showMessage('Already logged in! Redirecting to profile...', 'success');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
            return;
        } else if (error.message && error.message.includes('Network request failed')) {
            errorMessage = 'Connection error. Please check your internet and try again.';
        } else if (error.message && (error.message.includes('Invalid credentials') || error.message.includes('user') || error.message.includes('password'))) {
            errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        showMessage(errorMessage, 'error');

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

        // Check if authService is available
        if (!window.authService) {
            throw new Error('Authentication service not available. Please refresh the page.');
        }

        const fullName = `${firstName} ${lastName}`;

        // Attempt registration
        await window.authService.register(email, password, fullName);

        showMessage('Account created successfully! Redirecting...', 'success');

        // Update global auth if available
        if (window.globalAuth) {
            await window.globalAuth.checkAuthStatus();
        }

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
        if (guestPrefs && window.preferencesService) {
            console.log('📤 Syncing guest preferences to database...');
            const prefs = JSON.parse(guestPrefs);
            await window.preferencesService.savePreferences(prefs);
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

// Export functions for debugging
window.authDebug = {
    checkAuthStatus,
    handleLogin,
    handleRegister,
    showMessage
};

console.log('✅ Auth handler loaded successfully');
