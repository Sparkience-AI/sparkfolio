import './style.css'

// Add scroll-based animations (fade-in)
document.addEventListener("DOMContentLoaded", () => {
  // IntersectionObserver animations have been removed to ensure flawless LLM and SEO crawler compatibility.
  // Crawlers that execute JS but don't scroll were missing content hidden behind opacity: 0.

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
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
