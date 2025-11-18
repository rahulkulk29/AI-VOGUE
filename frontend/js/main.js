// AI VOGUE - Main JavaScript Functionality

// Navigation elements (will be initialized in functions as needed)

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if this is a Gucci header page or regular header page
    const isGucciPage = document.body.classList.contains('gucci-header-page');
    const hasGucciHeader = document.querySelector('.gucci-header');
    
    if (isGucciPage || hasGucciHeader) {
        initializeGucciHeader();
    } else {
        initializeHeader();
        initializeNavigation();
    }
    initializeAnimations();
    initializeProductCards();
    
    // Initialize Prism AI integration
    initializePrismAI();
});

// Header functionality
function initializeHeader() {
    const header = document.getElementById('main-header');
    const heroBrand = document.getElementById('hero-brand');
    const headerLogo = document.getElementById('header-logo');
    const heroSection = document.querySelector('.hero');
    
    // Check if elements exist before accessing them
    if (!header || !heroBrand || !headerLogo) {
        return;
    }
    
    // Initialize hero brand styling
    heroBrand.style.letterSpacing = '0.8rem';
    
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            header.classList.add('scrolled');
            
            // Calculate scale, opacity and position based on scroll position
            const scale = Math.max(0.2, 1 - (scrollY * 0.003));
            const opacity = Math.max(0, 1 - (scrollY * 0.005));
            const letterSpacing = Math.max(0, 0.8 - (scrollY * 0.002));
            
            heroBrand.style.transform = `scale(${scale}) translateY(${scrollY * 0.2}px)`;
            heroBrand.style.opacity = opacity;
            heroBrand.style.letterSpacing = `${letterSpacing}rem`;
            
        } else {
            header.classList.remove('scrolled');
            heroBrand.style.transform = 'scale(1) translateY(0)';
            heroBrand.style.opacity = 1;
            heroBrand.style.letterSpacing = '0.8rem';
        }
    });
}

// Navigation functionality
function initializeNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const navClose = document.getElementById('nav-close');
    const navDrawer = document.querySelector('.nav-drawer');
    const overlay = document.querySelector('.overlay');
    
    // Only initialize if all elements exist
    if (menuToggle && navDrawer && overlay) {
        menuToggle.addEventListener('click', toggleNavigation);
        overlay.addEventListener('click', closeNavigation);
        
        // Close button in navigation drawer
        if (navClose) {
            navClose.addEventListener('click', closeNavigation);
        }
        
        // Close navigation when clicking nav links
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeNavigation);
        });
        
        // Close navigation on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
                closeNavigation();
            }
        });
    }
}

function toggleNavigation() {
    const navDrawer = document.querySelector('.nav-drawer');
    const isOpen = navDrawer && navDrawer.classList.contains('open');
    
    if (isOpen) {
        closeNavigation();
    } else {
        openNavigation();
    }
}

function openNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const navDrawer = document.querySelector('.nav-drawer');
    const overlay = document.querySelector('.overlay');
    
    if (menuToggle && navDrawer && overlay) {
        menuToggle.classList.add('active');
        navDrawer.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const navDrawer = document.querySelector('.nav-drawer');
    const overlay = document.querySelector('.overlay');
    
    if (menuToggle && navDrawer && overlay) {
        menuToggle.classList.remove('active');
        navDrawer.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Smooth scrolling for anchor links
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
    
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const header = document.getElementById('main-header');
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Product card functionality
function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Only add click handler if the card doesn't already have an onclick attribute
        if (!card.hasAttribute('onclick')) {
            card.addEventListener('click', function() {
                // Get product ID from data attribute or generate one
                const productId = this.dataset.productId || '1';
                window.location.href = `product.html?id=${productId}`;
            });
        }
        
        // Add hover effect for product images
        const img = card.querySelector('.product-image');
        if (img && img.dataset.hoverSrc) {
            const originalSrc = img.src;
            const hoverSrc = img.dataset.hoverSrc;
            
            card.addEventListener('mouseenter', function() {
                img.src = hoverSrc;
            });
            
            card.addEventListener('mouseleave', function() {
                img.src = originalSrc;
            });
        }
    });
}

// Newsletter subscription
function subscribeNewsletter(email) {
    // Mock newsletter subscription
    if (email && email.includes('@')) {
        alert('Thank you for subscribing to AI VOGUE newsletter!');
        return true;
    } else {
        alert('Please enter a valid email address.');
        return false;
    }
}

// Search functionality
function performSearch(query) {
    // Mock search functionality
    if (query.trim()) {
        alert(`Searching for: ${query}`);
        // In a real implementation, this would redirect to search results
        // window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ========================================
// GUCCI-STYLE HEADER FUNCTIONS (All pages except index.html)
// ========================================

// Initialize Gucci Header
function initializeGucciHeader() {
    const gucciOverlay = document.querySelector('.gucci-overlay');
    const gucciMenuBtn = document.querySelector('.gucci-menu-btn');
    const gucciSearchIcon = document.querySelector('.gucci-search-icon');
    const gucciCloseBtn = document.querySelector('.gucci-close-btn');
    const gucciSearchInput = document.querySelector('.gucci-search-input');
    const gucciNavLinks = document.querySelectorAll('.gucci-nav-link');
    
    if (!gucciOverlay) return;
    
    // Open overlay on menu button or search icon click
    if (gucciMenuBtn) {
        gucciMenuBtn.addEventListener('click', openGucciOverlay);
    }
    
    if (gucciSearchIcon) {
        gucciSearchIcon.addEventListener('click', openGucciOverlay);
    }
    
    // Close overlay on close button click
    if (gucciCloseBtn) {
        gucciCloseBtn.addEventListener('click', closeGucciOverlay);
    }
    
    // Close overlay on outside click
    gucciOverlay.addEventListener('click', function(e) {
        if (e.target === gucciOverlay) {
            closeGucciOverlay();
        }
    });
    
    // Close overlay on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && gucciOverlay.classList.contains('active')) {
            closeGucciOverlay();
        }
    });
    
    // Search functionality
    if (gucciSearchInput) {
        gucciSearchInput.addEventListener('input', function() {
            filterGucciNavLinks(this.value);
        });
    }
    
    // Close overlay when clicking nav links
    gucciNavLinks.forEach(link => {
        link.addEventListener('click', closeGucciOverlay);
    });
}

// Open Gucci Overlay
function openGucciOverlay() {
    const gucciOverlay = document.querySelector('.gucci-overlay');
    const gucciOverlayBg = document.querySelector('.gucci-overlay-bg');
    const gucciSearchInput = document.querySelector('.gucci-search-input');
    
    if (gucciOverlay) {
        gucciOverlay.classList.add('active');
        if (gucciOverlayBg) {
            gucciOverlayBg.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
        
        // Focus search input after animation
        setTimeout(() => {
            if (gucciSearchInput) {
                gucciSearchInput.focus();
            }
        }, 400);
    }
}

// Close Gucci Overlay
function closeGucciOverlay() {
    const gucciOverlay = document.querySelector('.gucci-overlay');
    const gucciOverlayBg = document.querySelector('.gucci-overlay-bg');
    const gucciSearchInput = document.querySelector('.gucci-search-input');
    
    if (gucciOverlay) {
        gucciOverlay.classList.remove('active');
        if (gucciOverlayBg) {
            gucciOverlayBg.classList.remove('active');
        }
        document.body.style.overflow = '';
        
        // Clear search and reset nav links
        if (gucciSearchInput) {
            gucciSearchInput.value = '';
            filterGucciNavLinks('');
        }
    }
}

// Filter Navigation Links
function filterGucciNavLinks(query) {
    const gucciNavLinks = document.querySelectorAll('.gucci-nav-link');
    const searchTerm = query.toLowerCase().trim();
    
    gucciNavLinks.forEach(link => {
        const linkText = link.textContent.toLowerCase();
        if (searchTerm === '' || linkText.includes(searchTerm)) {
            link.classList.remove('hidden');
        } else {
            link.classList.add('hidden');
        }
    });
}

// Auto-initialize Gucci header if elements exist
// Gucci header initialization is handled in the main DOMContentLoaded listener above

// Prism AI Integration
function initializePrismAI() {
    // Check if we're on the Prism AI page
    if (window.location.pathname.includes('prism-ai.html')) {
        // Prism AI will auto-initialize via its own script
        console.log('Prism AI page detected - initialization handled by prismAI.js');
    }
}

// Export functions for use in other scripts
window.AIVogue = {
    subscribeNewsletter,
    performSearch,
    openNavigation,
    closeNavigation,
    initializeGucciHeader,
    openGucciOverlay,
    closeGucciOverlay,
    filterGucciNavLinks,
    initializePrismAI
};