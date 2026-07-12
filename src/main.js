import './style.css'

// Add scroll-based animations (fade-in)
document.addEventListener("DOMContentLoaded", () => {
  // U4: Add .js-loaded class to body
  document.body.classList.add('js-loaded');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // U4: Add .animated to elements when they enter the viewport
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply to sections and cards
  const animatedElements = document.querySelectorAll('.section, .card, .inner-box');
  
  animatedElements.forEach(el => {
    // U4: Removed inline opacity/transform logic
    observer.observe(el);
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      // Close mobile menu if it's open
      const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
      if (mobileMenuBtn && mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
        mobileMenuBtn.click();
      }

      const href = this.getAttribute('href');
      // B4: Handle logo link with just '#'
      if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // B3 & U5: Mobile Menu Logic
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
      
      if (!isExpanded) {
        // Opening menu
        document.body.classList.add('no-scroll');
        const backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        document.body.appendChild(backdrop);
        
        backdrop.addEventListener('click', () => {
          mobileMenuBtn.click();
        });
      } else {
        // Closing menu
        document.body.classList.remove('no-scroll');
        const backdrop = document.querySelector('.nav-backdrop');
        if (backdrop) backdrop.remove();
      }
    });
  }
});
