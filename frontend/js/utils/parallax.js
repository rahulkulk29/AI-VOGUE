// AI VOGUE - Parallax and Scroll Effects

// Parallax elements
let parallaxElements = [];
let ticking = false;

// Initialize parallax effects
document.addEventListener('DOMContentLoaded', function() {
    initializeParallax();
    window.addEventListener('scroll', requestParallaxUpdate);
    window.addEventListener('resize', debounce(initializeParallax, 250));
});

function initializeParallax() {
    // Clear existing parallax elements
    parallaxElements = [];
    
    // Find all parallax elements
    const elements = document.querySelectorAll('[data-parallax]');
    
    elements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const direction = element.dataset.parallaxDirection || 'vertical';
        
        parallaxElements.push({
            element: element,
            speed: speed,
            direction: direction,
            offset: element.getBoundingClientRect().top + window.pageYOffset
        });
    });
}

function requestParallaxUpdate() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

function updateParallax() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    parallaxElements.forEach(item => {
        const { element, speed, direction, offset } = item;
        const elementTop = offset - scrollTop;
        const elementBottom = elementTop + element.offsetHeight;
        
        // Only apply parallax if element is in viewport
        if (elementBottom >= 0 && elementTop <= windowHeight) {
            const yPos = -(scrollTop - offset) * speed;
            
            if (direction === 'vertical') {
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            } else if (direction === 'horizontal') {
                element.style.transform = `translate3d(${yPos}px, 0, 0)`;
            }
        }
    });
    
    ticking = false;
}

// Hero video parallax effect
function initializeHeroParallax() {
    const heroVideo = document.querySelector('.hero-video');
    const heroContent = document.querySelector('.hero-content');
    
    if (heroVideo || heroContent) {
        window.addEventListener('scroll', throttle(function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            if (heroVideo) {
                heroVideo.style.transform = `translate3d(0, ${rate}px, 0)`;
            }
            
            if (heroContent) {
                const contentRate = scrolled * -0.3;
                heroContent.style.transform = `translate3d(0, ${contentRate}px, 0)`;
            }
        }, 10));
    }
}

// Smooth reveal animations
function initializeRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Add stagger effect for child elements
                const children = entry.target.querySelectorAll('.reveal-child');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('revealed');
                    }, index * 100);
                });
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
}

// Mouse parallax effect for hero section
function initializeMouseParallax() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        hero.addEventListener('mousemove', function(e) {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const xPos = (clientX / innerWidth - 0.5) * 20;
            const yPos = (clientY / innerHeight - 0.5) * 20;
            
            heroContent.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        });
        
        hero.addEventListener('mouseleave', function() {
            heroContent.style.transform = 'translate3d(0, 0, 0)';
        });
    }
}

// Scroll-triggered animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const animationObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationType = entry.target.dataset.animation || 'fadeInUp';
                entry.target.classList.add('animated', animationType);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    animatedElements.forEach(el => animationObserver.observe(el));
}

// Text reveal animation
function initializeTextReveal() {
    const textElements = document.querySelectorAll('.text-reveal');
    
    textElements.forEach(element => {
        const text = element.textContent;
        const words = text.split(' ');
        
        element.innerHTML = words.map(word => 
            `<span class="word"><span class="word-inner">${word}</span></span>`
        ).join(' ');
        
        const wordElements = element.querySelectorAll('.word-inner');
        
        const textObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    wordElements.forEach((word, index) => {
                        setTimeout(() => {
                            word.style.transform = 'translateY(0)';
                            word.style.opacity = '1';
                        }, index * 50);
                    });
                }
            });
        }, { threshold: 0.5 });
        
        textObserver.observe(element);
    });
}

// Initialize all scroll effects
document.addEventListener('DOMContentLoaded', function() {
    initializeHeroParallax();
    initializeRevealAnimations();
    initializeMouseParallax();
    initializeScrollAnimations();
    initializeTextReveal();
});

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