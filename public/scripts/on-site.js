/* =====================================================
   On-Site Services — page interactions
   - SVG map parallax tilt on mouse-move
   - Zone cards stagger reveal
   - Coverage zones background parallax
   ===================================================== */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initMapTilt();
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      initZonesReveal();
      initZonesParallax();
      initVanRoute();
    }
  });

  /* ===== Service van drives slowly along the coverage route ===== */
  function initVanRoute() {
    if (prefersReducedMotion) return;
    const van = document.querySelector('.map-van');
    const route = document.querySelector('#serviceRoute');
    if (!van || !route || !window.MotionPathPlugin) return;
    gsap.registerPlugin(MotionPathPlugin);
    // Start the drive after the route line finishes drawing (~3.4s in CSS)
    gsap.to(van, {
      duration: 9,
      repeat: -1,
      yoyo: true,            // glide back instead of snapping to the start
      ease: 'power1.inOut',
      delay: 3.4,
      motionPath: {
        path: route,
        align: route,
        alignOrigin: [0.5, 0.5],
        autoRotate: false,   // keep the van upright
      },
    });
  }

  /* ===== Map 3D tilt (mouse-follow) ===== */
  function initMapTilt() {
    if (prefersReducedMotion) return;
    const map = document.querySelector('[data-map]');
    if (!map) return;

    const hero = map.closest('.hero');
    let raf = null;

    const onMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * 10;
      const rotX = (0.5 - y) * 8;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        map.style.transform =
          `perspective(1500px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      map.style.transform = '';
    };

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
  }

  /* ===== Zones stagger reveal ===== */
  function initZonesReveal() {
    if (prefersReducedMotion) return;
    gsap.from('.zone', {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.zones__grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  /* ===== Coverage zones background parallax ===== */
  function initZonesParallax() {
    if (prefersReducedMotion) return;
    const bg = document.querySelector('.coverage-zones__parallax');
    if (!bg) return;
    gsap.to(bg, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.coverage-zones',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });
  }
})();
