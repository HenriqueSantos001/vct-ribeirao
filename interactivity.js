(function () {
  'use strict';

  // ─── Helpers ──────────────────────────────────────────────
  function q(sel)  { return document.querySelector(sel); }
  function qa(sel) { return document.querySelectorAll(sel); }
  function dc(key) { return q('[data-content="' + key + '"]'); }

  // ─── Background YouTube player (blurred backdrop) ─────────
  var bgPlayer = null;
  var bgReady  = false;

  // ─── Controls start hidden via CSS (.hero-media2).
  //     The class "controls-visible" is added by JS after cover dismisses.
  var heroControls = document.querySelector('.hero-media2');

  // ─── YouTube Player (main player) ─────────────────────────
  var ytPlayer = null;
  var ytReady  = false;

  // Wait for the YT IFrame API to finish loading
  function initYouTube() {
    // ── Cover & warmup state machine ─────────────────────────
    //   cover-active    → cover visible, waiting for first PLAYING
    //   warmup-playing  → video playing, counting 3 s of real playback
    //   controls-ready  → cover gone, controls visible
    var coverEl      = document.getElementById('player-cover');
    var coverPhase   = 'cover-active';
    var WARMUP_MS    = 2000;          // real playback before cover fades
    var warmupElapsed   = 0;          // accumulated playback ms
    var warmupStartedAt = 0;          // Date.now() when segment began
    var warmupTimer     = null;

    function dismissCover() {
      if (coverPhase === 'controls-ready') return;
      coverPhase = 'controls-ready';
      if (warmupTimer) { clearTimeout(warmupTimer); warmupTimer = null; }
      if (coverEl) {
        coverEl.style.opacity = '0';
        setTimeout(function () {
          coverEl.style.display = 'none';
          if (heroControls) heroControls.classList.add('controls-visible');
        }, 700);
      }
    }

    // Resume / start the warmup countdown
    function warmupResume() {
      warmupStartedAt = Date.now();
      var remaining = WARMUP_MS - warmupElapsed;
      if (remaining <= 0) { dismissCover(); return; }
      warmupTimer = setTimeout(dismissCover, remaining);
    }

    // Pause the warmup countdown (buffering / unexpected pause)
    function warmupPause() {
      if (warmupTimer) { clearTimeout(warmupTimer); warmupTimer = null; }
      if (warmupStartedAt) {
        warmupElapsed += Date.now() - warmupStartedAt;
        warmupStartedAt = 0;
      }
    }

    // Fallback: dismiss cover after 20 s if PLAYING never fires
    var coverFallback = setTimeout(dismissCover, 20000);

    // ── Create background YouTube player (muted, no controls) ─
    bgPlayer = new YT.Player('yt-bg-player', {
      videoId: 'ESbObW2c5HY',
      playerVars: {
        autoplay: 0, mute: 1, controls: 0, modestbranding: 1,
        rel: 0, showinfo: 0, playsinline: 1, enablejsapi: 1,
        loop: 1, playlist: 'ESbObW2c5HY',
        origin: window.location.origin
      },
      events: {
        onReady: function () {
          bgReady = true;
          // Main player may already be playing (race condition) — sync immediately
          if (ytReady && ytPlayer) {
            try {
              var state = ytPlayer.getPlayerState();
              if (state === YT.PlayerState.PLAYING) {
                var t = ytPlayer.getCurrentTime();
                bgPlayer.seekTo(t, true);
                bgPlayer.playVideo();
              }
            } catch (_) {}
          }
        }
      }
    });

    // ── Style bg player iframe to fill container ─────────────
    var bgStyle = document.createElement('style');
    bgStyle.textContent = '#yt-bg-player-wrap iframe{width:100%!important;height:100%!important;position:absolute;top:0;left:0;border:0;pointer-events:none;}';
    document.head.appendChild(bgStyle);

    // ── Create main YouTube player ──────────────────────────
    ytPlayer = new YT.Player('yt-player', {
      videoId: 'ESbObW2c5HY',
      playerVars: {
        autoplay: 0,
        mute: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1,
        enablejsapi: 1,
        loop: 1,
        playlist: 'ESbObW2c5HY',
        origin: window.location.origin
      },
      events: {
        onReady: function () {
          ytReady = true;
          ytPlayer.playVideo();
          // Also start bg player in sync
          if (bgReady && bgPlayer) bgPlayer.playVideo();
        },
        onStateChange: function (e) {
          // ── Cover warmup state machine ────────────────────
          if (coverPhase !== 'controls-ready') {
            if (e.data === YT.PlayerState.PLAYING) {
              if (coverPhase === 'cover-active') {
                coverPhase = 'warmup-playing';
                clearTimeout(coverFallback);
              }
              warmupResume();
            } else if (coverPhase === 'warmup-playing') {
              warmupPause();
            }
          }

          // ── Sync background YouTube player with main ──────
          if (bgReady && bgPlayer) {
            if (e.data === YT.PlayerState.PLAYING) {
              // Sync time then play
              try {
                var t = ytPlayer.getCurrentTime();
                if (Math.abs(bgPlayer.getCurrentTime() - t) > 1) {
                  bgPlayer.seekTo(t, true);
                }
              } catch (_) {}
              bgPlayer.playVideo();
            } else if (e.data === YT.PlayerState.PAUSED) {
              bgPlayer.pauseVideo();
            } else if (e.data === YT.PlayerState.ENDED) {
              bgPlayer.pauseVideo();
            }
          }

          // Keep play/pause icon synced when state changes
          if (!playBtn) return;
          var svg = playBtn.querySelector('svg');
          if (!svg) return;
          if (e.data === YT.PlayerState.PLAYING) {
            playBtn.setAttribute('aria-label', 'Pausar');
            svg.setAttribute('data-icon', 'PauseMedium');
            svg.innerHTML = '<path fill="currentColor" fill-rule="evenodd" d="M4.5 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm10 0a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h4.5a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" clip-rule="evenodd"></path>';
          } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
            playBtn.setAttribute('aria-label', 'Assistir');
            svg.setAttribute('data-icon', 'PlayMedium');
            svg.innerHTML = '<path fill="currentColor" d="M5 2.7a1 1 0 0 1 1.48-.88l16.93 9.3a1 1 0 0 1 0 1.76l-16.93 9.3A1 1 0 0 1 5 21.31z"></path>';
          }
        }
      }
    });
  }

  // The API calls this global callback when ready
  if (typeof window.onYouTubeIframeAPIReady === 'undefined') {
    window.onYouTubeIframeAPIReady = initYouTube;
  } else {
    // API already loaded (unlikely with defer, but safe)
    var _origCb = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (_origCb) _origCb();
      initYouTube();
    };
  }

  // Style the YouTube iframe to fill its container
  var ytWrap = document.getElementById('yt-player-wrap');
  if (ytWrap) {
    var style = document.createElement('style');
    style.textContent = '#yt-player-wrap iframe,#yt-player-wrap video{width:100%!important;height:100%!important;position:absolute;top:0;left:0;border:0;}';
    document.head.appendChild(style);
  }

  // ─── Play / Pause ─────────────────────────────────────────
  var playBtn = q('button[aria-label="Assistir"]');
  if (playBtn) {
    playBtn.addEventListener('click', function () {
      if (!ytPlayer || !ytReady) return;
      var state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    });
  }

  // ─── Mute / Unmute ────────────────────────────────────────
  var muteBtn = q('button[aria-label="Sair do modo silencioso"]');
  if (muteBtn) {
    muteBtn.addEventListener('click', function () {
      if (!ytPlayer || !ytReady) return;
      var isMuted = ytPlayer.isMuted();
      if (isMuted) {
        ytPlayer.unMute();
        ytPlayer.setVolume(100);
      } else {
        ytPlayer.mute();
      }
      var nowMuted = !isMuted;
      muteBtn.setAttribute('aria-label', nowMuted ? 'Sair do modo silencioso' : 'Silenciar');
      var svg = muteBtn.querySelector('svg');
      if (svg) {
        svg.setAttribute('data-icon', nowMuted ? 'VolumeOffMedium' : 'VolumeMedium');
        if (nowMuted) {
          svg.innerHTML = '<path fill="currentColor" fill-rule="evenodd" d="M11 4a1 1 0 0 0-1.7-.7L4.58 8H1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3.59l4.7 4.7A1 1 0 0 0 11 20zM5.7 9.7 9 6.42V17.6l-3.3-3.3-.29-.29H2v-4h3.41zm9.6 0 2.29 2.3-2.3 2.3 1.42 1.4L19 13.42l2.3 2.3 1.4-1.42-2.28-2.3 2.3-2.3-1.42-1.4-2.3 2.28-2.3-2.3z" clip-rule="evenodd"></path>';
        } else {
          svg.innerHTML = '<path fill="currentColor" fill-rule="evenodd" d="M11 4a1 1 0 0 0-1.7-.7L4.58 8H1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3.59l4.7 4.7A1 1 0 0 0 11 20zM5.7 9.7 9 6.42V17.6l-3.3-3.3-.29-.29H2v-4h3.41zm10.8-2.2a8 8 0 0 1 0 9 1 1 0 1 1-1.7-1.06 6 6 0 0 0 0-6.88 1 1 0 1 1 1.7-1.06M19.1 4a12 12 0 0 1 0 16A1 1 0 0 1 17.6 18.5a10 10 0 0 0 0-13 1 1 0 1 1 1.5-1.5" clip-rule="evenodd"></path>';
        }
      }
    });
  }

  // ─── Fullscreen / Expandir ────────────────────────────────
  var expandBtn = q('button[aria-label="Expandir"]');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var container = document.getElementById('yt-player-wrap');
      if (!container) return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    });
    document.addEventListener('fullscreenchange', function () {
      var svg = expandBtn.querySelector('svg');
      if (!svg) return;
      if (document.fullscreenElement) {
        svg.setAttribute('data-icon', 'FullscreenExitMedium');
        svg.innerHTML = '<path fill="currentColor" fill-rule="evenodd" d="M24 8h-5V3h-2v5a2 2 0 0 0 2 2h5zM0 8h5V3h2v5a2 2 0 0 1-2 2H0zm7 8H5v5H3v-5a2 2 0 0 1 2-2h5v2zm10 0h2v5h2v-5a2 2 0 0 0-2-2h-5v2z" clip-rule="evenodd"></path>';
      } else {
        svg.setAttribute('data-icon', 'FullscreenEnterMedium');
        svg.innerHTML = '<path fill="currentColor" fill-rule="evenodd" d="M0 5c0-1.1.9-2 2-2h7v2H2v4H0zm22 0h-7V3h7a2 2 0 0 1 2 2v4h-2zM2 15v4h7v2H2a2 2 0 0 1-2-2v-4zm20 4v-4h2v4a2 2 0 0 1-2 2h-7v-2z" clip-rule="evenodd"></path>';
      }
    });
  }

  // ─── Replay ───────────────────────────────────────────────
  var replayBtn = q('button[aria-label="Reiniciar vídeo"]');
  if (replayBtn) {
    replayBtn.addEventListener('click', function () {
      if (!ytPlayer || !ytReady) return;
      ytPlayer.seekTo(0, true);
      ytPlayer.playVideo();
      // Also restart the background YouTube player
      if (bgReady && bgPlayer) {
        bgPlayer.seekTo(0, true);
        bgPlayer.playVideo();
      }
    });
  }

  // ─── Season Selector + Dynamic Episode Content ────────────
  var seasonSelect = dc('seasons');
  var episodeContainer = dc('episodes');

  function updateEpisodes(seasonId) {
    if (typeof SITE === 'undefined' || !episodeContainer) return;

    // Support per-season data: SITE.episodesBySeason = { 'temp-1': [...], 'temp-2': [...] }
    // Falls back to SITE.episodes (flat array) if per-season data is not defined
    var episodes = (SITE.episodesBySeason && SITE.episodesBySeason[seasonId]) || SITE.episodes;
    if (!episodes || !episodes.length) return;

    var cards = episodeContainer.querySelectorAll('.episode-card5');
    var count = Math.min(cards.length, episodes.length);

    for (var i = 0; i < count; i++) {
      var ep = episodes[i];
      var card = cards[i];
      card.style.display = '';

      var img = card.querySelector('.episode-card2');
      if (img && ep.image) img.src = ep.image;

      var durationSpan = card.querySelector('.meta-label0 .text-block0');
      if (durationSpan && ep.duration) durationSpan.textContent = ep.duration;

      var titleP = card.querySelector('.episode-card4 > p.text-block0');
      if (titleP) titleP.textContent = ep.number + '. ' + ep.title;

      var descP = card.querySelector('.episode-card0 .text-block0');
      if (descP && ep.description) descP.textContent = ep.description;
    }

    // Hide extra cards if season has fewer episodes
    for (var j = count; j < cards.length; j++) {
      cards[j].style.display = 'none';
    }

    // Scroll carousel back to start
    var scrollable = episodeContainer.querySelector('ul');
    if (scrollable) scrollable.scrollTo({ left: 0, behavior: 'smooth' });
  }

  if (seasonSelect) {
    seasonSelect.addEventListener('change', function () {
      var selectedId  = seasonSelect.value;
      updateEpisodes(selectedId);
    });
  }

  // ─── Carousel Navigation (Next + Previous) ───────────────
  function getScrollableList(btn) {
    // Walk up to the section container, then find the scrollable <ul>
    var section = btn.closest('[data-uia="episodes"], [data-uia="more-like-this"], [data-uia="trending-now"]');
    if (section) {
      return section.querySelector('ul');
    }
    // Fallback: traverse from carousel-nav sibling
    var navDiv = btn.closest('.carousel-nav0');
    if (navDiv) {
      var frame = navDiv.previousElementSibling || navDiv.parentElement;
      if (frame) {
        var ul = frame.querySelector('ul');
        if (ul) return ul;
      }
    }
    return null;
  }

  function getItemScrollWidth(ul) {
    var firstChild = ul.firstElementChild;
    if (!firstChild) return 300;
    var style = window.getComputedStyle(firstChild);
    return firstChild.offsetWidth + parseFloat(style.marginRight || 0) + parseFloat(style.marginLeft || 0);
  }

  qa('button[aria-label="Próximo"]').forEach(function (btn) {
    // Skip the episodes carousel button — episodes-carousel.js is its sole handler
    if (btn.hasAttribute('data-episodes-next')) return;
    btn.addEventListener('click', function () {
      var ul = getScrollableList(btn);
      if (ul) {
        ul.scrollBy({ left: getItemScrollWidth(ul), behavior: 'smooth' });
      }
    });
  });

  // Enable scrolling back via mouse wheel / touch (native scroll-snap applies)
  // Also add keyboard arrow support for carousels
  qa('.carousel-frame0').forEach(function (frame) {
    var ul = frame.querySelector('ul');
    if (!ul) return;
    ul.setAttribute('tabindex', '0');
    ul.style.outline = 'none';
    ul.addEventListener('keydown', function (e) {
      var step = getItemScrollWidth(ul);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        ul.scrollBy({ left: step, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        ul.scrollBy({ left: -step, behavior: 'smooth' });
      }
    });
  });

  // ─── Pre-qualification Modal ──────────────────────────────
  (function () {
    var WA_NUMBER = '5516991069776';
    var WA_MSG_1 = 'Já tenho um time e quero garantir vaga no campeonato.';
    var WA_MSG_2 = 'Quero participar, mas preciso de ajuda para encontrar ou montar um time.';

    function waLink(msg) {
      return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
    }

    var overlay   = document.getElementById('pq-overlay');
    var dialog    = document.getElementById('pq-dialog');
    var closeBtn  = document.getElementById('pq-close');
    var backdrop  = document.getElementById('pq-backdrop');
    var opt1      = document.getElementById('pq-opt1');
    var opt2      = document.getElementById('pq-opt2');

    if (!overlay || !dialog || !closeBtn || !backdrop || !opt1 || !opt2) return;

    var lastFocused  = null;
    var closeTimer   = null;   // tracks hide-after-close timeout

    // ── Open ──────────────────────────────────────────────────
    // Pattern: set display:flex first, force a reflow so the browser
    // registers the element as rendered, THEN add pq-open to trigger
    // CSS transitions from their declared initial values (opacity:0 etc.).
    // This prevents the parent-opacity compositing flash.
    function openModal() {
      // Cancel any in-flight close timer so display doesn't get set to none
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

      lastFocused = document.activeElement;
      overlay.removeAttribute('aria-hidden');
      overlay.style.display = 'flex';   // make visible in layout
      overlay.offsetHeight;             // force reflow (starts transitions from clean state)
      overlay.classList.add('pq-open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { dialog.focus(); }, 50);
    }

    // ── Close ─────────────────────────────────────────────────
    function closeModal() {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('pq-open');
      document.body.style.overflow = '';
      if (lastFocused) {
        try { lastFocused.focus(); } catch (_) {}
      }
      // Hide with display:none after all transitions finish (longest is 400ms)
      closeTimer = setTimeout(function () {
        closeTimer = null;
        overlay.style.display = 'none';
      }, 450);
    }

    // ── Focus trap ────────────────────────────────────────────
    function trapFocus(e) {
      if (!overlay.classList.contains('pq-open')) return;
      if (e.key !== 'Tab') return;
      var focusable = overlay.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }

    // ── Event listeners — close ───────────────────────────────
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
      trapFocus(e);
    });

    // ── Event listeners — options ─────────────────────────────
    opt1.addEventListener('click', function () {
      closeModal();
      window.open(waLink(WA_MSG_1), '_blank', 'noopener,noreferrer');
    });
    opt2.addEventListener('click', function () {
      closeModal();
      window.open(waLink(WA_MSG_2), '_blank', 'noopener,noreferrer');
    });

    // ── CTA interception (event delegation) ───────────────────
    // Selectors that should open the pre-qual modal instead of
    // navigating or submitting a form:
    //   [data-uia="join-now-btn"]       – "Acessar agora" buttons
    //   a[href="#login"]                – "WhatsApp" link in header
    //   a[href="#lodp-more-to-watch"]   – "Garanta sua vaga" nav link
    //   [data-uia="plan-content"] button – prize/plan selection buttons
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      // Use closest() so clicks on child elements (SVG, <span>, etc.) still match
      var isCTA = (
        t.closest('[data-uia="join-now-btn"]') ||
        t.closest('a[href="#login"]') ||
        t.closest('a[href="#lodp-more-to-watch"]') ||
        t.closest('[data-uia="link-banner-cta"]') ||
        (t.closest('[data-uia="plan-content"]') && t.closest('button'))
      );
      if (isCTA) {
        e.preventDefault();
        openModal();
      }
    });

  })();
  // ─── Fim Pre-qualification Modal ──────────────────────────

})();
