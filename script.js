// Compatibility ring animation on load (hero is always in view on load)
document.addEventListener('DOMContentLoaded', function () {
  // ---- Mobile nav toggle ----
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.textContent = isOpen ? '✕' : '☰';
    });
    siteNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        siteNav.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
      });
    });
  }

  var heroSub = document.querySelector('.hero-sub');
  if (heroSub) {
    setTimeout(function () { heroSub.classList.add('ring-inview'); }, 150);
  }

  // ---- Map modal ----
  var overlay = document.getElementById('mapModal');
  var kzmap = overlay ? overlay.querySelector('.kzmap') : null;
  var openers = document.querySelectorAll('[data-open-map]');
  var closers = overlay ? overlay.querySelectorAll('[data-close-map]') : [];

  function openMap(e) {
    if (e) e.preventDefault();
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.classList.add('modal-open');
    if (kzmap) {
      kzmap.classList.remove('in-view');
      // force reflow so the draw-in animation replays each time the modal opens
      void kzmap.offsetWidth;
      requestAnimationFrame(function () {
        kzmap.classList.add('in-view');
      });
    }
  }

  function closeMap() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  openers.forEach(function (el) { el.addEventListener('click', openMap); });
  closers.forEach(function (el) { el.addEventListener('click', closeMap); });

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeMap();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeMap();
    });
  }
});
