// AI VOGUE - Login Page JavaScript

// DOM Elements
const toggleButtons = document.querySelectorAll('.toggle-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const passwordToggles = document.querySelectorAll('.password-toggle');
const registerPassword = document.getElementById('registerPassword');
const confirmPassword = document.getElementById('confirmPassword');
const socialButtons = document.querySelectorAll('.social-btn');

// Initialize login functionality
function initLogin() {
    setupFormToggle();
    setupPasswordToggles();
    setupPasswordStrength();
    setupFormValidation();
    setupSocialLogin();
    setupFormSubmission();
}

// Setup form toggle between login and register
function setupFormToggle() {
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const formType = e.target.dataset.form;
            
            // Update toggle buttons
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // Show/hide forms
            if (formType === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
            
            // Reset forms
            loginForm.reset();
            registerForm.reset();
            clearAllErrors();
        });
    });
}

// Setup password visibility toggles
function setupPasswordToggles() {
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            
            const passwordInput = toggle.parentElement.querySelector('input');
            const showIcon = toggle.querySelector('.show-password');
            const hideIcon = toggle.querySelector('.hide-password');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                showIcon.style.display = 'none';
                hideIcon.style.display = 'inline';
            } else {
                passwordInput.type = 'password';
                showIcon.style.display = 'inline';
                hideIcon.style.display = 'none';
            }
        });
    });
}

// Setup password strength indicator
function setupPasswordStrength() {
    if (registerPassword) {
        registerPassword.addEventListener('input', (e) => {
            const password = e.target.value;
            const strengthBar = document.querySelector('.strength-fill');
            const strengthText = document.querySelector('.strength-text');
            
            const strength = calculatePasswordStrength(password);
            
            // Remove existing classes
            strengthBar.classList.remove('weak', 'fair', 'good', 'strong');
            
            if (password.length === 0) {
                strengthBar.style.width = '0';
                strengthText.textContent = 'Password strength';
                return;
            }
            
            switch (strength.level) {
                case 1:
                    strengthBar.classList.add('weak');
                    strengthText.textContent = 'Weak password';
                    break;
                case 2:
                    strengthBar.classList.add('fair');
                    strengthText.textContent = 'Fair password';
                    break;
                case 3:
                    strengthBar.classList.add('good');
                    strengthText.textContent = 'Good password';
                    break;
                case 4:
                    strengthBar.classList.add('strong');
                    strengthText.textContent = 'Strong password';
                    break;
            }
        });
    }
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[^\w\s]/.test(password)
    };
    
    // Count passed checks
    Object.values(checks).forEach(check => {
        if (check) score++;
    });
    
    // Determine strength level
    let level = 1;
    if (score >= 5) level = 4;
    else if (score >= 4) level = 3;
    else if (score >= 3) level = 2;
    
    return { level, score, checks };
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Password confirmation validation
    if (confirmPassword) {
        confirmPassword.addEventListener('input', validatePasswordMatch);
    }
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Clear existing errors
    clearFieldError(e);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Password validation for registration
    if (field.id === 'registerPassword' && value) {
        const strength = calculatePasswordStrength(value);
        if (strength.level < 2) {
            showFieldError(field, 'Password is too weak. Use at least 8 characters with mixed case, numbers, and symbols.');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    // Mark as valid
    field.classList.add('success');
    return true;
}

// Validate password match
function validatePasswordMatch() {
    const password = registerPassword.value;
    const confirm = confirmPassword.value;
    
    clearFieldError({ target: confirmPassword });
    
    if (confirm && password !== confirm) {
        showFieldError(confirmPassword, 'Passwords do not match');
        return false;
    }
    
    if (confirm && password === confirm) {
        confirmPassword.classList.add('success');
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    field.classList.remove('success');
    field.classList.add('error');
    
    // Remove existing error
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    field.parentElement.appendChild(errorElement);
}

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Clear all errors
function clearAllErrors() {
    const errorFields = document.querySelectorAll('.error');
    const errorMessages = document.querySelectorAll('.field-error');
    
    errorFields.forEach(field => {
        field.classList.remove('error', 'success');
    });
    
    errorMessages.forEach(message => {
        message.remove();
    });
}

// Setup social login
function setupSocialLogin() {
    socialButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const provider = button.classList.contains('google-btn') ? 'Google' :
                           button.classList.contains('apple-btn') ? 'Apple' :
                           button.classList.contains('facebook-btn') ? 'Facebook' : 'Unknown';
            
            // Show loading state
            button.classList.add('loading');
            button.disabled = true;
            
            // Simulate social login
            setTimeout(() => {
                button.classList.remove('loading');
                button.disabled = false;
                
                showNotification(`${provider} login would be implemented here`, 'info');
            }, 2000);
        });
    });
}

// Setup form submission
function setupFormSubmission() {
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
}

// Handle login submission
function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe');
    
    // Validate form
    if (!validateForm(loginForm)) {
        showNotification('Please fix the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = loginForm.querySelector('.auth-submit');
    setButtonLoading(submitButton, 'Signing In...');
    
    // Simulate login API call
    setTimeout(() => {
        // Mock successful login
        if (email && password) {
            showNotification('Login successful! Redirecting...', 'success');
            
            // Store user session (mock)
            if (rememberMe) {
                localStorage.setItem('ai_vogue_remember', 'true');
            }
            localStorage.setItem('ai_vogue_user', JSON.stringify({
                email: email,
                name: email.split('@')[0],
                loginTime: new Date().toISOString()
            }));
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            resetButtonLoading(submitButton, 'Sign In');
            showNotification('Invalid email or password', 'error');
        }
    }, 2000);
}

// Handle register submission
function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPass = formData.get('confirmPassword');
    const agreeTerms = formData.get('agreeTerms');
    
    // Validate form
    if (!validateForm(registerForm)) {
        showNotification('Please fix the errors in the form', 'error');
        return;
    }
    
    // Check password match
    if (password !== confirmPass) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Check terms agreement
    if (!agreeTerms) {
        showNotification('Please agree to the Terms of Service', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = registerForm.querySelector('.auth-submit');
    setButtonLoading(submitButton, 'Creating Account...');
    
    // Simulate registration API call
    setTimeout(() => {
        // Mock successful registration
        showNotification('Account created successfully! Please check your email for verification.', 'success');
        
        // Store user session (mock)
        localStorage.setItem('ai_vogue_user', JSON.stringify({
            email: email,
            name: `${firstName} ${lastName}`,
            firstName: firstName,
            lastName: lastName,
            registrationTime: new Date().toISOString()
        }));
        
        // Switch to login form after delay
        setTimeout(() => {
            toggleButtons[0].click(); // Switch to login
            showNotification('Welcome to AI VOGUE! You can now sign in.', 'success');
        }, 2000);
        
        resetButtonLoading(submitButton, 'Create Account');
    }, 3000);
}

// Validate entire form
function validateForm(form) {
    const requiredFields = form.querySelectorAll('input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Set button loading state
function setButtonLoading(button, text) {
    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
            <span style="animation: spin 1s linear infinite;">⏳</span>
            ${text}
        </span>
    `;
}

// Reset button loading state
function resetButtonLoading(button, text) {
    button.disabled = false;
    button.classList.remove('loading');
    button.textContent = text;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: var(--color-white);
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
        box-shadow: var(--shadow-heavy);
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = 'var(--color-dark-green)';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = 'var(--color-gray-dark)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Check for existing user session
function checkUserSession() {
    const user = localStorage.getItem('ai_vogue_user');
    if (user) {
        const userData = JSON.parse(user);
        showNotification(`Welcome back, ${userData.name}!`, 'info');
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initLogin();
        checkUserSession();
    });
} else {
    initLogin();
    checkUserSession();
}