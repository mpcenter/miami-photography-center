/* =====================================================
   Miami Photography Center — Interactions
   - Scrollytelling (sticky pinned story)
   - Parallax (hero visual + coverage bg)
   - 3D tilt hover on service cards
   - Entry animations
   - Mobile nav toggle
   ===================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initEntryAnims();
    init3DTilt();
    initParallax();
    initDemoForms();
    initGsapFeatures();
  });

  /* GSAP-dependent features. If the vendor scripts haven't executed yet
     (slow network), retry once on window load so animations never
     silently disappear. */
  let gsapInitDone = false;
  function initGsapFeatures() {
    if (gsapInitDone) return;
    if (!(window.gsap && window.ScrollTrigger)) {
      window.addEventListener('load', initGsapFeatures, { once: true });
      return;
    }
    gsapInitDone = true;
    gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initStoryScrollytelling();
    initCoverageParallax();
    initHeroParallax();
    initCounters();
    initMarqueeDrift();
  }

  /* ===== LENIS SMOOTH SCROLL (synced with ScrollTrigger) ===== */
  function initLenis() {
    if (prefersReducedMotion || !window.Lenis) return;
    const lenis = new Lenis({ lerp: 0.12, autoRaf: false });
    document.documentElement.classList.add('lenis-on');

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Anchor links route through Lenis so smooth scroll stays consistent
    document.querySelectorAll('a[href*="#"]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;
      const pathPart = href.slice(0, hashIndex);
      if (pathPart && pathPart !== window.location.pathname) return;
      const hash = href.slice(hashIndex);
      if (hash.length < 2) return;
      a.addEventListener('click', (e) => {
        const target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -90 });
      });
    });
  }

  /* ===== STAT COUNTERS (count up on enter) ===== */
  function initCounters() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('.stats__num[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (Number.isNaN(end)) return;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
      });
    });
  }

  /* ===== BRANDS MARQUEE — GSAP-driven, subtle scroll-velocity speed-up =====
     The old version rewrote the CSS `animation-duration` on every scroll
     frame. Changing a running animation's duration remaps its keyframe
     timeline, so the strip jumped on every scroll tick. GSAP `timeScale`
     changes playback speed seamlessly (no position jump), so we drive the
     loop with GSAP and only nudge timeScale with scroll velocity. */
  function initMarqueeDrift() {
    const tracks = document.querySelectorAll('.brands__track');
    if (!tracks.length) return;

    tracks.forEach((track) => {
      track.style.animation = 'none'; // hand control to GSAP (CSS marquee is the no-JS fallback)
      const loop = gsap.to(track, {
        xPercent: -50,        // content is duplicated, so -50% is one seamless cycle
        repeat: -1,
        duration: 36,
        ease: 'none',
      });

      if (prefersReducedMotion) { loop.progress(0).pause(); return; }

      let slowDown;
      ScrollTrigger.create({
        trigger: track.closest('.brands') || track,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          // Speed up subtly with scroll velocity (1×–4×); timeScale never jumps position.
          loop.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 700, 3));
          clearTimeout(slowDown);
          slowDown = setTimeout(() => {
            gsap.to(loop, { timeScale: 1, duration: 0.8, ease: 'power2.out', overwrite: true });
          }, 140);
        },
      });
    });
  }

  /* ===== DEMO FORMS (preview build — backend wired at launch) =====
     Any <form class="js-demo-form"> shows an inline success state on
     submit instead of posting. data-success holds the message. */
  function initDemoForms() {
    document.querySelectorAll('form.js-demo-form').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const msg = form.dataset.success || 'Request received. We will contact you within one business day.';
        let note = form.querySelector('.form__success');
        if (!note) {
          note = document.createElement('p');
          note.className = 'form__success';
          note.setAttribute('role', 'status');
          note.style.cssText = 'color:#1d7a3a;font-weight:600;font-size:15px;margin-top:8px;';
          form.appendChild(note);
        }
        note.textContent = '✓ ' + msg;
        form.querySelectorAll('button[type="submit"]').forEach((b) => { b.disabled = true; b.style.opacity = '0.6'; });
      });
    });
  }

  /* ===== NAV ===== */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const burger = nav.querySelector('.nav__burger');
    const menu = nav.querySelector('.nav__menu');

    // Background opacity on scroll
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 30) nav.style.background = 'rgba(29, 29, 31, 0.86)';
      else nav.style.background = 'rgba(29, 29, 31, 0.72)';
    }, { passive: true });

    // Mobile overlay menu
    if (burger && menu) {
      const setOpen = (open) => {
        nav.classList.toggle('nav--open', open);
        burger.setAttribute('aria-expanded', String(open));
      };
      burger.addEventListener('click', () => {
        setOpen(!nav.classList.contains('nav--open'));
      });
      menu.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => setOpen(false));
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
          setOpen(false);
          burger.focus();
        }
      });
      document.addEventListener('click', (e) => {
        if (nav.classList.contains('nav--open') && !nav.contains(e.target)) setOpen(false);
      });
    }
  }

  /* ===== ENTRY ANIMATIONS (IntersectionObserver) ===== */
  function initEntryAnims() {
    const els = document.querySelectorAll('[data-anim]');
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      els.forEach(el => el.classList.add('is-in'));
      return;
    }
    // threshold must stay near 0: tall blocks never reach higher ratios
    // (viewport/height < threshold) and would stay invisible forever.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          // Slight stagger when multiple come into view at once
          setTimeout(() => e.target.classList.add('is-in'), i * 60);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => {
      // Anything already on screen (deep links, restored scroll) shows now
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* ===== 3D TILT ON SERVICE CARDS ===== */
  function init3DTilt() {
    if (prefersReducedMotion) return;
    const cards = document.querySelectorAll('[data-tilt]');
    const MAX_TILT = 8; // degrees

    cards.forEach(card => {
      let rect = null;
      let raf = null;

      const update = (mx, my) => {
        if (!rect) return;
        const x = (mx - rect.left) / rect.width;
        const y = (my - rect.top) / rect.height;
        const rotY = (x - 0.5) * (MAX_TILT * 2);
        const rotX = (0.5 - y) * (MAX_TILT * 2);
        card.style.transform = `perspective(1500px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
      };

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
      });
      card.addEventListener('mousemove', (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => update(e.clientX, e.clientY));
      });
      card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = 'perspective(1500px) rotateX(0) rotateY(0) translateZ(0)';
        rect = null;
      });
    });
  }

  /* ===== HERO PARALLAX (GSAP) =====
     Note: parallax on .hero__visual was removed — it fought the CSS
     heroFloat animation on the same transform property and caused
     a visible jump on scroll. Only the iridescent ring keeps a soft
     scroll-linked motion, on its own transform layer. */
  function initHeroParallax() {
    if (prefersReducedMotion) return;
    const ring = document.querySelector('.hero__ring');
    if (!ring) return;
    gsap.to(ring, {
      yPercent: -12,
      scale: 1.1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  /* ===== STORY — PINNED SCROLLYTELLING ===== */
  function initStoryScrollytelling() {
    const story = document.querySelector('.story');
    const scenes = document.querySelectorAll('.story__scene');
    const stepEl = document.getElementById('storyStep');
    const titleEl = document.querySelector('.story__title');
    const copyEl = document.getElementById('storyCopy');
    const image = document.getElementById('storyImage');

    if (!story || scenes.length === 0) return;

    // Camera image sources per scene
    const sceneImages = [
      'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?w=1600&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=1600&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&q=85&auto=format&fit=crop'
    ];

    let currentScene = -1;

    const setScene = (i) => {
      if (i === currentScene || i < 0 || i >= scenes.length) return;
      currentScene = i;
      const data = scenes[i].dataset;

      // Animate text out → swap → animate in
      gsap.timeline()
        .to([stepEl, titleEl, copyEl], {
          opacity: 0, y: 14, duration: 0.25, ease: 'power2.out'
        })
        .add(() => {
          stepEl.textContent = String(i + 1).padStart(2, '0');
          titleEl.innerHTML = data.title;
          copyEl.textContent = data.copy;
          if (image && sceneImages[i]) image.src = sceneImages[i];
        })
        .to([stepEl, titleEl, copyEl], {
          opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06
        });

      // Subtle image kenburns
      if (image && !prefersReducedMotion) {
        gsap.fromTo(image,
          { scale: 1.08, filter: 'brightness(0.96)' },
          { scale: 1, filter: 'brightness(1)', duration: 1.4, ease: 'power2.out' });
      }
    };

    // ScrollTrigger per scene
    scenes.forEach((scene, i) => {
      ScrollTrigger.create({
        trigger: scene,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => setScene(i),
        onEnterBack: () => setScene(i)
      });
    });

    // Initial state
    setScene(0);
  }

  /* ===== COVERAGE PARALLAX BG ===== */
  function initCoverageParallax() {
    if (prefersReducedMotion) return;
    const bg = document.querySelector('[data-parallax-bg]');
    if (!bg) return;
    gsap.to(bg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.coverage',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });
  }

  /* ===== Light parallax helper for elements with [data-parallax="<speed>"] ===== */
  function initParallax() {
    if (prefersReducedMotion) return;
    const els = document.querySelectorAll('[data-parallax]');
    if (els.length === 0) return;

    const onScroll = () => {
      els.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed * -1;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { onScroll(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    onScroll();
  }
})();
