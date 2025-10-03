document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link, .btn[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        }
    });
    
    // Form submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const company = document.getElementById('company').value;
            const message = document.getElementById('message').value;
            
            // Create mailto link
            const subject = encodeURIComponent(`Project Inquiry from ${name}${company ? ' (' + company + ')' : ''}`);
            const body = encodeURIComponent(`
Name: ${name}
Email: ${email}
${company ? 'Company: ' + company + '\n' : ''}
Message:
${message}

---
Sent from Lidodevelopment website
            `);
            
            const mailtoLink = `mailto:johan.lido@gmail.com?subject=${subject}&body=${body}`;
            window.location.href = mailtoLink;
            
            // Show success message
            showSuccessMessage();
        });
    }
    
    // Animate stats numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateStats() {
        statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent.replace(/,/g, ''));
            
            if (!isNaN(finalValue)) {
                let startValue = 0;
                const duration = 2000;
                const increment = Math.ceil(finalValue / (duration / 16));
                
                const counter = setInterval(() => {
                    startValue += increment;
                    
                    if (startValue >= finalValue) {
                        stat.textContent = finalValue.toLocaleString();
                        clearInterval(counter);
                    } else {
                        stat.textContent = startValue.toLocaleString();
                    }
                }, 16);
            }
        });
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('civisto-stats')) {
                    animateStats();
                } else {
                    entry.target.classList.add('animate');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.card, .process-step, .civisto-stats, .feature');
    
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// Success message function
function showSuccessMessage() {
    // Create success message element
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <div style="
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #2a9d8f;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1001;
            font-weight: 500;
        ">
            ✅ Thank you! Your message has been sent.
        </div>
    `;
    
    document.body.appendChild(successMessage);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
}
