import './style.css'
import frameworkFacts from './data/framework-facts.json'

// Data-Fact Auto-Binding Helper
function syncFrameworkFacts() {
  const allFacts = {
    ...frameworkFacts.L1_evergreen,
    ...frameworkFacts.L2_annual,
    ...frameworkFacts.L3_quarterly
  };

  document.querySelectorAll('[data-fact]').forEach(el => {
    const key = el.getAttribute('data-fact');
    if (allFacts[key] && allFacts[key].val) {
      // Preserve inner HTML structure if jargon/formatting present, else update text
      if (!el.firstElementChild) {
        el.textContent = allFacts[key].val;
      }
      el.setAttribute('data-last-verified', allFacts[key].last_verified || '2026-Q3');
    }
  });
}

// Add scroll-based animations (fade-in)
function init() {
  // U4: Add .js-loaded class to body
  document.body.classList.add('js-loaded');
  syncFrameworkFacts();

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
      
      let target = null;
      try {
        target = document.querySelector(href);
      } catch (err) {
        // Ignore invalid query selectors
      }
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
        // Transfer focus for keyboard accessibility (skip link)
        if (target.getAttribute('tabindex') === '-1') {
          target.focus({ preventScroll: true });
        }
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

  // Dynamic high-quality viewport-aware tooltips
  const jargonElements = document.querySelectorAll('.jargon');
  if (jargonElements.length > 0) {
    // Create shared tooltip bubble element
    const bubble = document.createElement('div');
    bubble.className = 'tooltip-bubble';
    bubble.id = 'jargon-tooltip';
    bubble.setAttribute('role', 'tooltip');
    document.body.appendChild(bubble);

    function showTooltip(el) {
      const tipText = el.getAttribute('data-tip');
      if (!tipText) return;

      bubble.textContent = tipText;
      bubble.classList.add('visible');

      // Measure dimensions
      const elRect = el.getBoundingClientRect();
      const bubbleRect = bubble.getBoundingClientRect();

      // Horizontal positioning (centered by default)
      let left = elRect.left + (elRect.width - bubbleRect.width) / 2;
      
      // Keep tooltip within screen boundaries (with a 12px margin)
      const margin = 12;
      const minLeft = margin;
      const maxLeft = window.innerWidth - bubbleRect.width - margin;

      if (left < minLeft) {
        left = minLeft;
      } else if (left > maxLeft) {
        left = maxLeft;
      }

      // Vertical positioning (above the element by default)
      let top = elRect.top - bubbleRect.height - 8;
      
      // Fallback: if it overflows the top of the viewport, show it below
      let positionBelow = false;
      if (top < margin) {
        top = elRect.bottom + 8;
        positionBelow = true;
      }

      // Apply coordinates
      bubble.style.left = `${left}px`;
      bubble.style.top = `${top}px`;

      // Position the arrow pointing exactly to the jargon element
      const jargonCenter = elRect.left + elRect.width / 2;
      const arrowLeft = jargonCenter - left;
      bubble.style.setProperty('--arrow-left', `${arrowLeft}px`);
      
      if (positionBelow) {
        bubble.classList.add('below');
      } else {
        bubble.classList.remove('below');
      }
    }

    function hideTooltip() {
      bubble.classList.remove('visible');
    }

    jargonElements.forEach(el => {
      // Event listeners
      el.addEventListener('mouseenter', () => showTooltip(el));
      el.addEventListener('focus', () => {
        showTooltip(el);
        el.setAttribute('aria-describedby', 'jargon-tooltip');
      });
      
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('blur', () => {
        hideTooltip();
        el.removeAttribute('aria-describedby');
      });
    });

    // Also close on scroll/resize
    window.addEventListener('scroll', hideTooltip, { passive: true });
    window.addEventListener('resize', hideTooltip, { passive: true });
  }
}

// Safe initialization: handle both DOMContentLoaded and already-loaded states
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
