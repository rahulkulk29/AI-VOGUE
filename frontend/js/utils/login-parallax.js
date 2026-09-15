// AI VOGUE - Login Page Parallax Effects

document.addEventListener('DOMContentLoaded', function() {
    initializeParallax();
});

function initializeParallax() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const floatingShapes = document.querySelectorAll('.shape');
    const loginCard = document.querySelector('.login-card');
    
    // Mouse move parallax effect
    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        // Parallax layers movement
        parallaxLayers.forEach((layer, index) => {
            const speed = (index + 1) * 10;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            layer.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        // Floating shapes movement
        floatingShapes.forEach((shape, index) => {
            const speed = (index + 1) * 15;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        // Card tilt effect
        if (loginCard) {
            const cardRect = loginCard.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            const angleX = (e.clientY - cardCenterY) / 40;
            const angleY = (cardCenterX - e.clientX) / 40;
            
            loginCard.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        }
    });
    
    // Reset card tilt on mouse leave
    if (loginCard) {
        loginCard.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    }
    
    // Scroll parallax effect
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const scrolled = window.pageYOffset;
                
                parallaxLayers.forEach((layer, index) => {
                    const speed = (index + 1) * 0.3;
                    layer.style.transform = `translateY(${scrolled * speed}px)`;
                });
                
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Input focus animations
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="date"]');
    
    inputs.forEach(input => {
        // Focus effect
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        // Blur effect
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.style.transform = 'translateY(0)';
            }
        });
        
        // Floating label effect
        if (input.value) {
            input.parentElement.classList.add('has-value');
        }
        
        input.addEventListener('input', function() {
            if (this.value) {
                this.parentElement.classList.add('has-value');
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
    });
    
    // Button ripple effect
    const buttons = document.querySelectorAll('.auth-submit, .social-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Form toggle animation
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const formType = this.getAttribute('data-form');
            
            // Update active state
            toggleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Animate form transition
            if (formType === 'login') {
                registerForm.style.animation = 'slideOutRight 0.4s ease forwards';
                setTimeout(() => {
                    registerForm.style.display = 'none';
                    loginForm.style.display = 'block';
                    loginForm.style.animation = 'slideInLeft 0.4s ease forwards';
                }, 400);
            } else {
                loginForm.style.animation = 'slideOutLeft 0.4s ease forwards';
                setTimeout(() => {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                    registerForm.style.animation = 'slideInRight 0.4s ease forwards';
                }, 400);
            }
        });
    });
}

// Add ripple animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-effect 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-effect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(30px);
        }
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutLeft {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-30px);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);
