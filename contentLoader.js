/*
 * ============================================================
 *  CARREGADOR DE CONTEÚDO — contentLoader.js
 * ============================================================
 *  Este script lê o objeto SITE (definido em siteContent.js)
 *  e injeta automaticamente todo o conteúdo no HTML.
 *  NÃO edite este arquivo — edite somente siteContent.js.
 * ============================================================
 */
(function () {
  'use strict';

  if (typeof SITE === 'undefined') return;

  // ─── Helpers ──────────────────────────────────────────────
  function q(selector) { return document.querySelector(selector); }
  function qa(selector) { return document.querySelectorAll(selector); }
  function dc(key) { return q('[data-content="' + key + '"]'); }

  // ─── 1. META / SEO ───────────────────────────────────────
  var m = SITE.meta;
  if (m) {
    if (m.lang)        document.documentElement.lang = m.lang;
    if (m.title)       document.title = m.title;
    if (m.description) {
      var descTag = q('meta[name="description"]');
      if (descTag) descTag.setAttribute('content', m.description);
    }
    if (m.themeColor) {
      var tc = q('meta[name="theme-color"]');
      if (!tc) { tc = document.createElement('meta'); tc.name = 'theme-color'; document.head.appendChild(tc); }
      tc.setAttribute('content', m.themeColor);
    }
    if (m.favicon) {
      var fi = q('link[rel="icon"]');
      if (!fi) { fi = document.createElement('link'); fi.rel = 'icon'; document.head.appendChild(fi); }
      fi.href = m.favicon;
    }
    // Open Graph
    var ogTags = { 'og:title': m.title, 'og:description': m.description, 'og:image': m.ogImage, 'og:url': m.ogUrl, 'og:type': m.ogType };
    for (var prop in ogTags) {
      if (!ogTags[prop]) continue;
      var og = q('meta[property="' + prop + '"]');
      if (!og) { og = document.createElement('meta'); og.setAttribute('property', prop); document.head.appendChild(og); }
      og.setAttribute('content', ogTags[prop]);
    }
  }

  // ─── 2. LOGO ─────────────────────────────────────────────
  if (SITE.logo && SITE.logo.src) {
    qa('a.app-logo').forEach(function (link) {
      var svg = link.querySelector('svg');
      if (svg) svg.remove();
      var existing = link.querySelector('img.site-logo');
      if (!existing) {
        var img = document.createElement('img');
        img.className = 'site-logo';
        img.src = SITE.logo.src;
        img.alt = SITE.logo.alt || '';
        img.width = SITE.logo.width || 167;
        img.height = SITE.logo.height || 45;
        img.style.display = 'block';
        link.prepend(img);
      }
    });
  }

  // ─── 3. HERO VIDEO + POSTER ──────────────────────────────
  var heroVideo = dc('hero-video');
  if (heroVideo && SITE.hero) {
    if (SITE.hero.videoSrc) {
      var heroSource = heroVideo.querySelector('source');
      if (heroSource) { heroSource.src = SITE.hero.videoSrc; }
      else { heroVideo.src = SITE.hero.videoSrc; }
      heroVideo.load();
      heroVideo.play().catch(function () {});
    }
  }
  var heroPoster = dc('hero-poster');
  if (heroPoster && SITE.hero && SITE.hero.posterImage) {
    heroPoster.src = SITE.hero.posterImage;
    heroPoster.srcset = SITE.hero.posterImage;
  }
  // player-poster removed — YouTube embed replaces it

  // ─── 4. TEXTOS PRINCIPAIS ────────────────────────────────
  var t = SITE.texts;
  if (t) {
    var mainTitle = dc('main-title');
    if (mainTitle && t.mainTitle) mainTitle.textContent = t.mainTitle;

    var visTitle = dc('visible-title');
    if (visTitle && t.mainTitle) visTitle.textContent = t.mainTitle;

    var subtitle = dc('subtitle');
    if (subtitle && t.subtitle) subtitle.textContent = t.subtitle;

    var desc = dc('description');
    if (desc && t.description) desc.textContent = t.description;

    // CTA buttons
    if (t.ctaButton) {
      qa('[data-uia="join-now-btn"]').forEach(function (btn) {
        btn.textContent = t.ctaButton;
      });
    }

    // Email placeholder
    if (t.ctaPlaceholder) {
      qa('input[name="email"]').forEach(function (input) {
        input.placeholder = t.ctaPlaceholder;
      });
    }
  }

  // ─── 5. FEATURE IMAGE ────────────────────────────────────
  var featureImg = dc('feature-image');
  if (featureImg && SITE.featureImage) {
    if (SITE.featureImage.src) featureImg.src = SITE.featureImage.src;
    if (SITE.featureImage.alt) featureImg.alt = SITE.featureImage.alt;
    // Also update the title label next to it
    var titleLabel = featureImg.parentElement && featureImg.parentElement.querySelector('.title-label0');
    if (titleLabel && t && t.mainTitle) titleLabel.textContent = t.mainTitle;
  }

  // ─── 5b. PLAYER POSTER (skip — now using YouTube embed) ──
  // The player-poster img was removed; nothing to update.

  // ─── 6. PLAYER THUMBNAIL ─────────────────────────────────
  var playerThumb = dc('player-thumbnail');
  if (playerThumb && SITE.playerThumbnail) {
    if (SITE.playerThumbnail.src) playerThumb.src = SITE.playerThumbnail.src;
    if (SITE.playerThumbnail.alt) playerThumb.alt = SITE.playerThumbnail.alt;
    var plLabel = playerThumb.parentElement && playerThumb.parentElement.querySelector('.title-label0');
    if (plLabel && t && t.mainTitle) plLabel.textContent = t.mainTitle;
  }

  // ─── 7. TEMPORADAS (SELECT) ──────────────────────────────
  var seasonSel = dc('seasons');
  if (seasonSel && SITE.seasons && SITE.seasons.length) {
    seasonSel.innerHTML = '';
    SITE.seasons.forEach(function (s, i) {
      var opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.label;
      if (i === 0) opt.selected = true;
      seasonSel.appendChild(opt);
    });
    seasonSel.removeAttribute('aria-disabled');
  }

  // ─── 8. EPISÓDIOS ────────────────────────────────────────
  var episodeContainer = dc('episodes');
  if (episodeContainer && SITE.episodes && SITE.episodes.length) {
    var cards = episodeContainer.querySelectorAll('.episode-card5');
    var count = Math.min(cards.length, SITE.episodes.length);
    for (var i = 0; i < count; i++) {
      var ep = SITE.episodes[i];
      var card = cards[i];

      // Image
      var img = card.querySelector('.episode-card2');
      if (img && ep.image) img.src = ep.image;

      // Duration
      var durationSpan = card.querySelector('.meta-label0 .text-block0');
      if (durationSpan && ep.duration) durationSpan.textContent = ep.duration;

      // Title (e.g. "1. Piloto")
      var titleP = card.querySelector('.episode-card4 > p.text-block0');
      if (titleP) titleP.textContent = ep.number + '. ' + ep.title;

      // Description
      var descP = card.querySelector('.episode-card0 .text-block0');
      if (descP && ep.description) descP.textContent = ep.description;
    }
  }

  // ─── 9. CARROSSEL "TALVEZ VOCÊ TAMBÉM GOSTE" ─────────────
  var recSection = q('[data-uia="more-like-this"]');
  if (recSection && SITE.recommendations && SITE.recommendations.length) {
    var recItems = recSection.querySelectorAll('.tab-nav4');
    var recCount = Math.min(recItems.length, SITE.recommendations.length);
    for (var r = 0; r < recCount; r++) {
      var rec = SITE.recommendations[r];
      var item = recItems[r];
      var link = item.querySelector('.tab-nav3');
      if (link) link.setAttribute('aria-label', 'Go to ' + rec.title);
      var poster = item.querySelector('.tab-nav2');
      if (poster && rec.image) poster.style.backgroundImage = 'url(' + rec.image + ')';
      // Update text node (title shown after the poster span)
      var titleDiv = item.querySelector('.tab-nav1');
      if (titleDiv) {
        var textNodes = [];
        titleDiv.childNodes.forEach(function (n) { if (n.nodeType === 3 && n.textContent.trim()) textNodes.push(n); });
        if (textNodes.length > 0) textNodes[0].textContent = rec.title;
      }
    }
  }

  // ─── 10. CARROSSEL "EM ALTA" ─────────────────────────────
  var trendSection = q('[data-uia="trending-now"]');
  if (trendSection && SITE.trending && SITE.trending.length) {
    var trendItems = trendSection.querySelectorAll('.tab-nav4');
    var trendCount = Math.min(trendItems.length, SITE.trending.length);
    for (var tr = 0; tr < trendCount; tr++) {
      var trend = SITE.trending[tr];
      var tItem = trendItems[tr];
      var tLink = tItem.querySelector('.tab-nav3');
      if (tLink) tLink.setAttribute('aria-label', 'Go to ' + trend.title);
      var tPoster = tItem.querySelector('.tab-nav2');
      if (tPoster && trend.image) tPoster.style.backgroundImage = 'url(' + trend.image + ')';
      var tTitleDiv = tItem.querySelector('.tab-nav1');
      if (tTitleDiv) {
        var tTextNodes = [];
        tTitleDiv.childNodes.forEach(function (n) { if (n.nodeType === 3 && n.textContent.trim()) tTextNodes.push(n); });
        if (tTextNodes.length > 0) tTextNodes[0].textContent = trend.title;
      }
    }
  }

  // ─── 11. DETALHES ────────────────────────────────────────
  var detailsContainer = dc('details');
  if (detailsContainer && SITE.details) {
    var cells = detailsContainer.querySelectorAll('.info-cell0');
    cells.forEach(function (cell) {
      var sections = cell.querySelectorAll('div');
      sections.forEach(function (sec) {
        var h4 = sec.querySelector('h4');
        var span = sec.querySelector('span');
        if (!h4 || !span) return;
        var label = h4.textContent.trim();
        if (label === 'Assista offline' && SITE.details.download)   span.textContent = SITE.details.download;
        if (label === 'Gêneros' && SITE.details.genres)             span.textContent = SITE.details.genres;
        if (label.indexOf('Esta') === 0 && SITE.details.tags)       span.textContent = SITE.details.tags;
        if (label === 'Áudio' && SITE.details.audio)                span.textContent = SITE.details.audio;
        if (label === 'Legendas' && SITE.details.subtitles)         span.textContent = SITE.details.subtitles;
        if (label === 'Elenco' && SITE.details.cast)                span.textContent = SITE.details.cast;
      });
    });
  }

  // ─── 12. PLANOS ──────────────────────────────────────────
  var plansTitle = dc('plans-title');
  if (plansTitle && SITE.plansTitle) plansTitle.textContent = SITE.plansTitle;

  // ─── 13. RODAPÉ ──────────────────────────────────────────
  var footerPhone = dc('footer-phone');
  if (footerPhone && SITE.footer && SITE.footer.phone) {
    var phoneSpan = footerPhone.querySelector('span');
    if (phoneSpan) {
      phoneSpan.innerHTML = 'Dúvidas? Chame no WhatsApp <a href="tel:' +
        SITE.footer.phone.replace(/[^0-9+\-]/g, '') + '">' + SITE.footer.phone + '</a>';
    }
  }

  var footerLinks = dc('footer-links');
  if (footerLinks && SITE.footer && SITE.footer.links && SITE.footer.links.length) {
    var existingItems = footerLinks.querySelectorAll('li');
    var linkCount = Math.min(existingItems.length, SITE.footer.links.length);
    for (var fl = 0; fl < linkCount; fl++) {
      var a = existingItems[fl].querySelector('a');
      if (a) {
        a.textContent = SITE.footer.links[fl].label;
        a.href = SITE.footer.links[fl].href;
      }
    }
  }

})();
