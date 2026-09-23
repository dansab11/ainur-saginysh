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

  // ---- Music link hint ----
  var musicToggle = document.getElementById('musicToggle');
  var musicHint = document.getElementById('musicHint');

  if (musicToggle && musicHint) {
    function hideMusicHint() {
      musicHint.classList.remove('show');
      try { localStorage.setItem('musicHintSeen', '1'); } catch (e) {}
    }

    musicToggle.addEventListener('click', hideMusicHint);

    var hintSeen = false;
    try { hintSeen = !!localStorage.getItem('musicHintSeen'); } catch (e) {}
    if (!hintSeen) {
      setTimeout(function () { musicHint.classList.add('show'); }, 1000);
      setTimeout(hideMusicHint, 7000);
    }
    document.addEventListener('click', function (e) {
      if (musicHint.classList.contains('show') && !musicToggle.contains(e.target)) {
        hideMusicHint();
      }
    });
  }

  // ---- Episode video modal ----
  var videoModal = document.getElementById('videoModal');
  var videoPlayer = videoModal ? document.getElementById('videoPlayer') : null;
  var videoModalTitle = videoModal ? document.getElementById('videoModalTitle') : null;
  var videoOpeners = document.querySelectorAll('[data-video]');

  function openVideo(src, title) {
    if (!videoModal || !videoPlayer) return;
    videoPlayer.setAttribute('src', src);
    videoPlayer.setAttribute('title', title || '');
    if (videoModalTitle) videoModalTitle.textContent = title || '';
    videoModal.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeVideo() {
    if (!videoModal || !videoPlayer) return;
    videoModal.classList.remove('open');
    document.body.classList.remove('modal-open');
    videoPlayer.setAttribute('src', ''); // stops playback once closed
  }

  videoOpeners.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openVideo(el.getAttribute('data-video'), el.getAttribute('data-title'));
    });
  });

  if (videoModal) {
    videoModal.querySelectorAll('[data-close-video]').forEach(function (el) {
      el.addEventListener('click', closeVideo);
    });
    videoModal.addEventListener('click', function (e) {
      if (e.target === videoModal) closeVideo();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && videoModal.classList.contains('open')) closeVideo();
    });
  }

  // ---- Live "together since" timer (from Dec 8, 2025) ----
  var tMonths = document.getElementById('tMonths');
  var tDays = document.getElementById('tDays');
  var tMinutes = document.getElementById('tMinutes');
  var tSeconds = document.getElementById('tSeconds');

  if (tMonths && tDays && tMinutes && tSeconds) {
    var startDate = new Date(2025, 11, 28, 0, 0, 0); // 28 Dec 2025

    function updateLoveTimer() {
      var now = new Date();
      var months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
      var anchor = new Date(startDate);
      anchor.setMonth(anchor.getMonth() + months);
      if (anchor > now) {
        months -= 1;
        anchor = new Date(startDate);
        anchor.setMonth(anchor.getMonth() + months);
      }
      var diffMs = now - anchor;
      if (diffMs < 0) diffMs = 0;
      var days = Math.floor(diffMs / 86400000);
      var remMs = diffMs - days * 86400000;
      var minutes = Math.floor(remMs / 60000);
      var seconds = Math.floor((remMs % 60000) / 1000);

      tMonths.textContent = String(months);
      tDays.textContent = String(days);
      tMinutes.textContent = String(minutes);
      tSeconds.textContent = String(seconds).padStart(2, '0');
    }

    updateLoveTimer();
    setInterval(updateLoveTimer, 1000);
  }

  // ---- Graceful fallback for not-yet-uploaded photos ----
  document.querySelectorAll('.polaroid-photo').forEach(function (img) {
    function showFallback() {
      var frame = img.closest('.frame');
      if (!frame) return;
      frame.classList.remove('photo');
      frame.innerHTML = '<span class="icon">🖼</span><span>фото скоро здесь</span>';
    }
    // If the image already failed before this script ran (common — images
    // start loading as soon as the browser parses the <img> tag, which is
    // well before this script executes at the end of the page), a plain
    // 'error' listener attached now would miss the event entirely. So check
    // the already-settled state first, and only listen for future failures.
    if (img.complete) {
      if (img.naturalWidth === 0) showFallback();
    } else {
      img.addEventListener('error', showFallback, { once: true });
    }
  });
});
