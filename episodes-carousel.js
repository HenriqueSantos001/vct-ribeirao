/*
 * ============================================================
 *  EPISODES CAROUSEL — episodes-carousel.js
 * ============================================================
 *  Lógica funcional isolada para a seção #episodes.
 *  Dependências: SITE (siteContent.js) deve estar carregado antes.
 *  Não depende de nenhum bundle ou SDK externo.
 * ============================================================
 */
(function () {
  'use strict';

  // ─── Bail out if the section doesn't exist ────────────────
  var section = document.querySelector('[data-episodes-module]');
  if (!section) return;

  // ─── Inject left-arrow positioning + dynamic mask classes ─
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@media all and (min-width:960px){' +
      '[data-episodes-prev-wrap]{left:-2rem !important;}' +
    '}' +
    '[data-episodes-frame].carousel-mask-start{' +
      'mask:linear-gradient(to left,transparent,black 10%);' +
      '-webkit-mask:linear-gradient(to left,transparent,black 10%);' +
    '}' +
    '[data-episodes-frame].carousel-mask-middle{' +
      'mask:linear-gradient(to left,transparent,black 10%,black 90%,transparent);' +
      '-webkit-mask:linear-gradient(to left,transparent,black 10%,black 90%,transparent);' +
    '}' +
    '[data-episodes-frame].carousel-mask-end{' +
      'mask:linear-gradient(to right,transparent,black 10%);' +
      '-webkit-mask:linear-gradient(to right,transparent,black 10%);' +
    '}' +
    /* === Season select: compact pill with visible caret === */
    /* 1. Outer container: remove forced 100% width */
    '[data-episodes-module] [data-fc-form-control-container]{' +
      'width:auto !important;' +
    '}' +
    /* 2. Wrapper: compact size + white text + pointer */
    '[data-episodes-module] [data-fc-form-control-wrapper]{' +
      'width:auto !important;' +
      'min-width:0 !important;' +
      'color:rgba(255,255,255,0.9) !important;' +
      'cursor:pointer;' +
    '}' +
    /* 3. Select: compact, white text, pointer, no stretch */
    '[data-episodes-module] [data-fc-form-control-wrapper]>select{' +
      'width:auto !important;' +
      'min-width:0 !important;' +
      'cursor:pointer !important;' +
      'opacity:1 !important;' +
      'color:rgba(255,255,255,0.9) !important;' +
    '}' +
    '[data-episodes-module] [data-fc-form-control-wrapper]>select:hover{' +
      'color:rgb(255,255,255) !important;' +
    '}' +
    /* 4. Caret triangle via ::after — above the select (z-index:1),
          clicks still reach the select (pointer-events:none)        */
    '[data-episodes-module] [data-fc-form-control-wrapper]::after{' +
      'content:"";' +
      'position:absolute;' +
      'right:0.75rem;' +
      'top:50%;' +
      'transform:translateY(-50%);' +
      'width:0;' +
      'height:0;' +
      'border-left:4px solid transparent;' +
      'border-right:4px solid transparent;' +
      'border-top:5px solid rgba(255,255,255,0.8);' +
      'pointer-events:none;' +
      'z-index:1;' +
    '}' +
    /* 5. Chrome keeps its pill bg/border (z-index:-1 behind select) */
    '[data-episodes-module] [data-fc-form-control-chrome]{' +
      'color:rgba(255,255,255,0.9) !important;' +
    '}';
  document.head.appendChild(styleEl);

  // ─── DOM references (stable data-attribute selectors) ─────
  var select   = section.querySelector('[data-episodes-select]');
  var frame    = section.querySelector('[data-episodes-frame]');
  var track    = section.querySelector('[data-episodes-track]');
  var btnNext  = section.querySelector('[data-episodes-next]');
  var btnPrev  = section.querySelector('[data-episodes-prev]');
  var prevWrap = section.querySelector('[data-episodes-prev-wrap]');
  var nextWrap = btnNext ? btnNext.closest('.carousel-nav0') : null;

  if (!track || !select) return;

  // ─── Rescue emotion <style> blocks from inside the track ──
  // The original HTML has CSS-in-JS <style data-emotion> tags embedded
  // inside the <ul>. Clearing innerHTML would destroy them and lose all
  // card styling. Move them to <head> so they persist across re-renders.
  (function rescueStyles() {
    var styles = track.querySelectorAll('style[data-emotion]');
    for (var i = 0; i < styles.length; i++) {
      document.head.appendChild(styles[i]);
    }
  })();

  // ─── Helpers ──────────────────────────────────────────────

  /** Resolve episode list for a given season id */
  function getEpisodesForSeason(seasonId) {
    if (typeof SITE === 'undefined') return [];
    if (SITE.episodesBySeason && SITE.episodesBySeason[seasonId]) {
      return SITE.episodesBySeason[seasonId];
    }
    return SITE.episodes || [];
  }

  /** Build the inner HTML for a single card (preserves original markup) */
  function renderCard(ep) {
    var mediaHTML;
    if (ep.video) {
      // Future: render <video> element with same aspect ratio
      var posterSrc = ep.poster || ep.image || '';
      mediaHTML =
        '<video class="default-ltr-iqcdef-cache-16mbbb episode-card2" ' +
          'preload="metadata" muted playsinline' +
          (posterSrc ? ' poster="' + escAttr(posterSrc) + '"' : '') +
        '>' +
          '<source src="' + escAttr(ep.video) + '" type="video/mp4">' +
        '</video>';
    } else {
      mediaHTML =
        '<img aria-hidden="true" ' +
          'src="' + escAttr(ep.image || '') + '" alt="" ' +
          'class="default-ltr-iqcdef-cache-16mbbb episode-card2" loading="lazy" />';
    }

    return (
      '<div class="default-ltr-iqcdef-cache-bjn8wh episode-card3">' +
        mediaHTML +
        '<span class="default-ltr-iqcdef-cache-14zcc0n episode-card1">' +
          '<span class="default-ltr-iqcdef-cache-kp1wj0 meta-label0">' +
            '<span class=" default-ltr-iqcdef-cache-em62jx text-block0">' + escHTML(ep.duration || '') + '</span>' +
          '</span>' +
        '</span>' +
      '</div>' +
      '<div class="default-ltr-iqcdef-cache-1eiiwc6 episode-card4">' +
        '<p class=" default-ltr-iqcdef-cache-h0dgui text-block0">' +
          escHTML(ep.number + '. ' + ep.title) +
        '</p>' +
        '<div class="default-ltr-iqcdef-cache-1e4sizb episode-card0">' +
          '<p class=" default-ltr-iqcdef-cache-1exssxy text-block0">' +
            escHTML(ep.description || '') +
          '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function escHTML(s) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  function escAttr(s) {
    return escHTML(s).replace(/"/g, '&quot;');
  }

  // ─── Render episodes into the track ───────────────────────

  function renderEpisodes(seasonId) {
    var episodes = getEpisodesForSeason(seasonId);
    track.innerHTML = '';

    episodes.forEach(function (ep) {
      var li = document.createElement('li');
      li.className = 'default-ltr-iqcdef-cache-8dqysa episode-card5';
      li.innerHTML = renderCard(ep);
      track.appendChild(li);
    });

    // Reset scroll
    track.scrollLeft = 0;
    updateNavButtons();
  }

  // ─── Navigation logic ─────────────────────────────────────

  function getScrollStep() {
    var firstCard = track.querySelector('.episode-card5');
    if (!firstCard) return 300;
    var style = window.getComputedStyle(firstCard);
    var marginRight = parseFloat(style.marginRight) || 0;
    return firstCard.offsetWidth + marginRight;
  }

  function scrollBy(direction) {
    var step = getScrollStep();
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  // ─── Navigation animation state ───────────────────────────
  // Tracks whether each nav wrapper is currently visible so we don't
  // re-trigger the same animation on every scroll event.
  var navVisible = { prev: false, next: true };
  var navTimers  = { prev: null,  next: null  };

  /**
   * Animate a nav wrapper in or out.
   * @param {Element} wrap      – the .carousel-nav0 div wrapping the button
   * @param {boolean} show      – true = slide in, false = slide out
   * @param {string}  offScreen – translateX value for the hidden position
   *                              e.g. 'translateX(-100%)' for left side
   *                                   'translateX(100%)'  for right side
   */
  function animateNav(wrap, show, offScreen) {
    if (!wrap) return;
    var key = (wrap === prevWrap) ? 'prev' : 'next';
    if (navVisible[key] === show) return;   // already in target state
    navVisible[key] = show;

    // Cancel any pending hide timer (handles rapid direction changes)
    if (navTimers[key]) { clearTimeout(navTimers[key]); navTimers[key] = null; }

    var btn = wrap.querySelector('button');

    if (show) {
      // 1. Snap to off-screen position instantly (no transition)
      wrap.style.transition       = 'none';
      wrap.style.webkitTransition = 'none';
      wrap.style.transform        = offScreen;
      wrap.style.webkitTransform  = offScreen;
      if (btn) btn.style.opacity  = '0';
      // 2. Make the element visible (off-screen, so no flash)
      wrap.style.display = '';
      // 3. Two frames later: restore transitions and animate to final position
      //    (double-rAF ensures the browser has painted the "start" state)
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          wrap.style.transition       = '';   // let CSS class transition take over
          wrap.style.webkitTransition = '';
          wrap.style.transform        = 'translateX(0)';
          wrap.style.webkitTransform  = 'translateX(0)';
          if (btn) btn.style.opacity  = '1';
        });
      });
    } else {
      // 1. Restore transition (CSS class), animate to off-screen
      wrap.style.transition       = '';
      wrap.style.webkitTransition = '';
      wrap.style.transform        = offScreen;
      wrap.style.webkitTransform  = offScreen;
      if (btn) btn.style.opacity  = '0';
      // 2. After the 400 ms transition completes, set display:none
      navTimers[key] = setTimeout(function () {
        if (!navVisible[key]) wrap.style.display = 'none';
      }, 420);
    }
  }

  function updateNavButtons() {
    var scrollLeft = track.scrollLeft;
    var maxScroll  = track.scrollWidth - track.clientWidth;

    var atStart = scrollLeft <= 2;
    var atEnd   = scrollLeft >= maxScroll - 2;

    // Smooth animated show/hide for both nav wrappers
    animateNav(prevWrap, !atStart, 'translateX(-100%)');
    animateNav(nextWrap, !atEnd,   'translateX(100%)');

    // Dynamic mask: reflect which edges have hidden content
    if (frame) {
      frame.classList.remove('carousel-mask-start', 'carousel-mask-middle', 'carousel-mask-end');
      if (atStart) {
        frame.classList.add('carousel-mask-start');
      } else if (atEnd) {
        frame.classList.add('carousel-mask-end');
      } else {
        frame.classList.add('carousel-mask-middle');
      }
    }
  }

  // ─── Event listeners ─────────────────────────────────────

  if (btnNext) {
    btnNext.addEventListener('click', function () { scrollBy(1); });
  }
  if (btnPrev) {
    btnPrev.addEventListener('click', function () { scrollBy(-1); });
  }

  // Update button visibility on scroll
  track.addEventListener('scroll', updateNavButtons);

  // Recalculate on resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateNavButtons, 100);
  });

  // ─── Select change → swap content ────────────────────────

  select.addEventListener('change', function () {
    renderEpisodes(select.value);
  });

  // ─── Initial render ──────────────────────────────────────
  // Use the currently selected season value
  renderEpisodes(select.value);

})();
