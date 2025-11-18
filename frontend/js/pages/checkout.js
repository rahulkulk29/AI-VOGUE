// AI VOGUE - Checkout Page JavaScript

// DOM Elements
const shippingOptions = document.querySelectorAll('input[name="shipping"]');
const paymentMethods = document.querySelectorAll('input[name="payment"]');
const cardForm = document.getElementById('cardForm');
const sameAsShippingCheckbox = document.getElementById('sameAsShipping');
const qtyButtons = document.querySelectorAll('.qty-btn');
const promoCodeInput = document.getElementById('promoCode');
const applyPromoButton = document.querySelector('.apply-promo');
const completeOrderButton = document.querySelector('.complete-order');
const checkoutForm = document.querySelector('.checkout-form');

// Price elements
const shippingCostElement = document.getElementById('shippingCost');
const finalTotalElement = document.getElementById('finalTotal');

// Order data
let orderData = {
    subtotal: 2499.00,
    tax: 199.92,
    shipping: 0,
    discount: 0,
    quantity: 1
};

// Shipping costs
const shippingCosts = {
    standard: 0,
    express: 25.00,
    overnight: 50.00
};

// Promo codes
const promoCodes = {
    'WELCOME10': 0.10,
    'LUXURY15': 0.15,
    'VOGUE20': 0.20,
    'FIRST25': 0.25
};

// Initialize checkout functionality
function initCheckout() {
    setupShippingOptions();
    setupPaymentMethods();
    setupQuantityControls();
    setupPromoCode();
    setupFormValidation();
    setupCardNumberFormatting();
    updateOrderTotal();
}

// Setup shipping options
function setupShippingOptions() {
    shippingOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            const shippingType = e.target.value;
            orderData.shipping = shippingCosts[shippingType];
            updateOrderTotal();
        });
    });
}

// Setup payment methods
function setupPaymentMethods() {
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            const paymentType = e.target.value;
            
            if (paymentType === 'card') {
                cardForm.style.display = 'block';
                cardForm.style.animation = 'fadeIn 0.3s ease-in-out';
            } else {
                cardForm.style.display = 'none';
            }
        });
    });
}

// Setup quantity controls
function setupQuantityControls() {
    qtyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const qtyValue = e.target.parentElement.querySelector('.qty-value');
            let currentQty = parseInt(qtyValue.textContent);
            
            if (action === 'increase') {
                currentQty++;
            } else if (action === 'decrease' && currentQty > 1) {
                currentQty--;
            }
            
            qtyValue.textContent = currentQty;
            orderData.quantity = currentQty;
            orderData.subtotal = 2499.00 * currentQty;
            orderData.tax = orderData.subtotal * 0.08; // 8% tax
            
            updateOrderTotal();
        });
    });
}

// Setup promo code functionality
function setupPromoCode() {
    applyPromoButton.addEventListener('click', applyPromoCode);
    
    promoCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyPromoCode();
        }
    });
}

// Apply promo code
function applyPromoCode() {
    const code = promoCodeInput.value.trim().toUpperCase();
    
    if (promoCodes[code]) {
        const discountPercent = promoCodes[code];
        orderData.discount = orderData.subtotal * discountPercent;
        
        // Show success message
        showNotification(`Promo code "${code}" applied! ${(discountPercent * 100)}% discount`, 'success');
        
        // Disable promo input
        promoCodeInput.disabled = true;
        applyPromoButton.disabled = true;
        applyPromoButton.textContent = 'Applied';
        
        updateOrderTotal();
    } else if (code) {
        showNotification('Invalid promo code', 'error');
        promoCodeInput.classList.add('error');
        setTimeout(() => {
            promoCodeInput.classList.remove('error');
        }, 3000);
    }
}

// Update order total
function updateOrderTotal() {
    const subtotalAfterDiscount = orderData.subtotal - orderData.discount;
    const total = subtotalAfterDiscount + orderData.tax + orderData.shipping;
    
    // Update shipping cost display
    if (orderData.shipping === 0) {
        shippingCostElement.textContent = 'Free';
    } else {
        shippingCostElement.textContent = `$${orderData.shipping.toFixed(2)}`;
    }
    
    // Update final total
    finalTotalElement.textContent = `$${total.toFixed(2)}`;
    
    // Update subtotal if discount applied
    const subtotalElement = document.querySelector('.total-row:first-child span:last-child');
    if (orderData.discount > 0) {
        subtotalElement.innerHTML = `
            <span style="text-decoration: line-through; color: var(--color-gray-medium);">$${orderData.subtotal.toFixed(2)}</span>
            <span style="color: var(--color-gold); margin-left: 0.5rem;">$${subtotalAfterDiscount.toFixed(2)}</span>
        `;
    } else {
        subtotalElement.textContent = `$${orderData.subtotal.toFixed(2)}`;
    }
    
    // Update tax
    const taxElement = document.querySelector('.total-row:nth-child(3) span:last-child');
    taxElement.textContent = `$${orderData.tax.toFixed(2)}`;
}

// Setup form validation
function setupFormValidation() {
    const form = document.querySelector('.checkout-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    completeOrderButton.addEventListener('click', handleOrderSubmission);
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    field.classList.remove('error');
    
    // Basic validation
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
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--color-red)';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '0.25rem';
    
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

// Setup card number formatting
function setupCardNumberFormatting() {
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
    
    if (cvvInput) {
        cvvInput.addEventListener('input', formatCVV);
    }
}

// Format card number
function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
}

// Format expiry date
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

// Format CVV
function formatCVV(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substring(0, 4);
}

// Handle order submission
function handleOrderSubmission(e) {
    e.preventDefault();
    
    // Validate all required fields
    const form = document.querySelector('.checkout-form');
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }
    
    // Show loading state
    completeOrderButton.disabled = true;
    completeOrderButton.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
            <span style="animation: spin 1s linear infinite;">⏳</span>
            Processing...
        </span>
    `;
    
    // Simulate order processing
    setTimeout(() => {
        showOrderConfirmation();
    }, 3000);
}

// Show order confirmation
function showOrderConfirmation() {
    const confirmationHTML = `
        <div class="order-confirmation" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
        ">
            <div style="
                background-color: var(--color-white);
                padding: 3rem;
                border-radius: 16px;
                text-align: center;
                max-width: 500px;
                margin: 2rem;
                box-shadow: var(--shadow-heavy);
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
                <h2 style="color: var(--color-dark-green); margin-bottom: 1rem;">Order Confirmed!</h2>
                <p style="color: var(--color-gray-medium); margin-bottom: 2rem;">Thank you for your purchase. You will receive a confirmation email shortly.</p>
                <p style="font-weight: 600; color: var(--color-dark-green); margin-bottom: 2rem;">Order #: AV-${Date.now()}</p>
                <button onclick="window.location.href='index.html'" class="btn btn-primary">Continue Shopping</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
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
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
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
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
    .error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
} else {
    initCheckout();
}