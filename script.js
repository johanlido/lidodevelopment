// MOBILE NAVIGATION
const navToggle = document.getElementById('mobileNavToggle');
const nav = document.getElementById('mainNav');

navToggle.addEventListener('click', function () {
    nav.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile nav when clicking nav links
document.querySelectorAll('.nav-links a, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
        nav.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// HEADER SCROLL EFFECT
let lastScroll = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// FORM VALIDATION AND SUBMISSION
const form = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Reset errors
    document.querySelectorAll('.error-message').forEach(msg => msg.classList.remove('show'));
    document.querySelectorAll('input, textarea, select').forEach(field => field.classList.remove('error'));

    let isValid = true;

    // Validate name
    const name = document.getElementById('name');
    if (!name.value.trim()) {
        showError('name', 'nameError');
        isValid = false;
    }

    // Validate email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value)) {
        showError('email', 'emailError');
        isValid = false;
    }

    // Validate message
    const message = document.getElementById('message');
    if (!message.value.trim() || message.value.trim().length < 10) {
        showError('message', 'messageError');
        document.getElementById('messageError').textContent = 'Please provide at least 10 characters';
        isValid = false;
    }

    if (isValid) {
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.querySelector('span:first-child').textContent = 'Sending...';

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            form.reset();
            successMessage.classList.add('show');
            submitBtn.disabled = false;
            submitBtn.querySelector('span:first-child').textContent = 'Send Message';

            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);
        }, 1000);
    }
});

function showError(fieldId, errorId) {
    document.getElementById(fieldId).classList.add('error');
    document.getElementById(errorId).classList.add('show');
}

// Clear errors on input
document.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('input', function() {
        this.classList.remove('error');
        const errorMsg = this.parentElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.classList.remove('show');
        }
    });
});

// Prevent resize flickering on mobile
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
            navToggle.classList.remove('active');
        }
    }, 250);
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('lidodevelopment website loaded successfully');
});