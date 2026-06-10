/* =====================================================
   Camera & Gear Repair — page interactions
   Ported from legacy/repair.js
   - 3D parallax tilt on hero camera (mouse-follow)
   - Live invalid-field feedback on blur
   (Form submit is handled globally by main.js: .js-demo-form)
   ===================================================== */
(function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    initCameraParallax();
    initFieldFeedback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ===== Camera 3D mouse-follow tilt ===== */
  function initCameraParallax() {
    if (prefersReducedMotion) return;
    var camera = document.querySelector('[data-camera]');
    if (!camera) return;
    var hero = camera.closest('.hero');
    if (!hero) return;

    var raf = null;

    function onMove(e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var rotY = (x - 0.5) * 14;
      var rotX = (0.5 - y) * 10;
      var tx = (x - 0.5) * 18;
      var ty = (y - 0.5) * 12;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        camera.style.transform =
          'perspective(1400px) translate3d(' + tx + 'px, ' + ty + 'px, 0) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      });
    }

    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      camera.style.transform = '';
    }

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
  }

  /* ===== Form — live invalid state on blur ===== */
  function initFieldFeedback() {
    var form = document.querySelector('.repair-form');
    if (!form) return;

    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.required && !input.value.trim()) {
          input.style.borderColor = '#d93025';
        } else {
          input.style.borderColor = '';
        }
      });
    });
  }
})();
