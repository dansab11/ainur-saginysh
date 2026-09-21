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

  // ---- Background music ----
  var musicToggle = document.getElementById('musicToggle');
  var musicHint = document.getElementById('musicHint');
  var bgMusic = document.getElementById('bgMusic');

  if (musicToggle && bgMusic) {
    var musicIcon = musicToggle.querySelector('.music-icon');

    function setMusicUI(isPlaying) {
      musicToggle.classList.toggle('playing', isPlaying);
      musicToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      musicToggle.setAttribute('aria-label', isPlaying ? 'Выключить музыку' : 'Включить фоновую музыку');
      if (musicIcon) musicIcon.textContent = isPlaying ? '♫' : '♪';
    }

    function hideHint() {
      if (musicHint) musicHint.classList.remove('show');
    }

    function playMusic() {
      var p = bgMusic.play();
      if (p && p.then) {
        p.then(function () {
          setMusicUI(true);
          try { localStorage.setItem('musicPlaying', '1'); } catch (e) {}
        }).catch(function () {
          setMusicUI(false);
        });
      } else {
        setMusicUI(true);
      }
    }

    function pauseMusic() {
      bgMusic.pause();
      setMusicUI(false);
      try { localStorage.setItem('musicPlaying', '0'); } catch (e) {}
    }

    musicToggle.addEventListener('click', function () {
      hideHint();
      try { localStorage.setItem('musicHintSeen', '1'); } catch (e) {}
      if (bgMusic.paused) { playMusic(); } else { pauseMusic(); }
    });

    // Best-effort: resume playback state when navigating between pages.
    // Browsers require a user gesture for audio, so this may silently
    // stay paused until the visitor clicks the button again — that's fine.
    var wasPlaying = false;
    try { wasPlaying = localStorage.getItem('musicPlaying') === '1'; } catch (e) {}
    if (wasPlaying) {
      var savedTime = 0;
      try { savedTime = parseFloat(localStorage.getItem('musicTime') || '0') || 0; } catch (e) {}
      bgMusic.currentTime = savedTime;
      playMusic();
    }

    bgMusic.addEventListener('timeupdate', function () {
      try { localStorage.setItem('musicTime', String(bgMusic.currentTime)); } catch (e) {}
    });

    // First-visit hint bubble, shown once
    var hintSeen = false;
    try { hintSeen = !!localStorage.getItem('musicHintSeen'); } catch (e) {}
    if (musicHint && !hintSeen) {
      setTimeout(function () { musicHint.classList.add('show'); }, 1000);
      setTimeout(function () {
        hideHint();
        try { localStorage.setItem('musicHintSeen', '1'); } catch (e) {}
      }, 7000);
    }
    document.addEventListener('click', function (e) {
      if (musicHint && musicHint.classList.contains('show') && !musicToggle.contains(e.target)) {
        hideHint();
        try { localStorage.setItem('musicHintSeen', '1'); } catch (e) {}
      }
    });
  }
});
