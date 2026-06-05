/* =====================================================
   Camera & Gear Repair — page interactions
   - 3D parallax tilt on hero camera (mouse-follow)
   - Form validation feedback
   - Timeline scroll progression
   ===================================================== */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initCameraParallax();
    initFormValidation();
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      initTimelineScroll();
    }
  });

  /* ===== Camera 3D mouse-follow tilt ===== */
  function initCameraParallax() {
    if (prefersReducedMotion) return;
    const camera = document.querySelector('[data-camera]');
    if (!camera) return;

    const hero = camera.closest('.hero');
    let raf = null;

    const onMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * 14;
      const rotX = (0.5 - y) * 10;
      const tx = (x - 0.5) * 18;
      const ty = (y - 0.5) * 12;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        camera.style.transform =
          `perspective(1400px) translate3d(${tx}px, ${ty}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      camera.style.transform = '';
    };

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
  }

  /* ===== Timeline reveal — dots light up sequentially ===== */
  function initTimelineScroll() {
    if (prefersReducedMotion) return;
    const items = document.querySelectorAll('.timeline__item');
    items.forEach((item, i) => {
      gsap.from(item, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: 'power3.out',
        delay: i * 0.08,
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  /* ===== Form — basic client-side validation feedback ===== */
  function initFormValidation() {
    const form = document.querySelector('.repair-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      // Let the form actually submit if action is configured.
      // Show inline message if Formspree placeholder is unconfigured.
      const action = form.getAttribute('action') || '';
      if (action.includes('REPLACE_WITH_FORMSPREE_ID')) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Form not yet connected — see README';
        btn.disabled = true;
        btn.style.opacity = '0.7';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.opacity = '';
        }, 3000);
      }
    });

    // Live invalid state on blur
    form.querySelectorAll('.field__input').forEach(input => {
      input.addEventListener('blur', () => {
        if (input.required && !input.value.trim()) {
          input.style.borderColor = '#d93025';
        } else {
          input.style.borderColor = '';
        }
      });
    });
  }
})();
