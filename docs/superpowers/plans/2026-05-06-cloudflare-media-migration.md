# Cloudflare Media Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar vídeo e imagens do site para Cloudflare Stream e Cloudflare R2/CDN, removendo a dependência do YouTube.

**Architecture:** Centralizar URLs públicas em `siteContent.js`, ajustar o carregador para consumir esses valores e trocar a integração do player por um embed Cloudflare Stream controlado em `interactivity.js`. Atualizar `index.html` apenas nos pontos que ainda dependem de markup inicial hardcoded.

**Tech Stack:** HTML estático, JavaScript vanilla, Cloudflare Stream embed, Cloudflare R2/CDN

---

### Task 1: Centralizar URLs Cloudflare

**Files:**
- Modify: `siteContent.js`

- [ ] **Step 1: Mapear a base pública e os assets finais**

Adicionar constantes/ajudantes para compor:

```js
var CLOUDFLARE_IMAGES_BASE_URL = 'https://cdn.santos-games.com/campeonatos/vct';
```

e um mapa com `capa01-ef93209a.avif`, `sga-logo-2ad81630.avif`, `capa-og-image-op2-f5e2eb84.webp`, `card-03-9ee9fd3e.webp`, `card-05-49e8e61c.webp`, `card-06-960034e0.webp`, `card-09-2b3b9ff9.webp`, `card-10-553ba3f9.webp`, `card-11-ce876ba1.webp`.

- [ ] **Step 2: Trocar o conteúdo de `SITE.hero`, `SITE.logo` e `SITE.meta`**

Usar URLs Cloudflare completas para `hero.streamUrl`, `hero.posterImage`, `logo.src`, `meta.ogImage` e `meta.ogUrl`.

- [ ] **Step 3: Trocar os cards para imagens do R2**

Atualizar `episodesBySeason.temp-1` para apontar aos arquivos finais públicos.

### Task 2: Ajustar markup e carregamento inicial

**Files:**
- Modify: `index.html`
- Modify: `contentLoader.js`

- [ ] **Step 1: Atualizar metas e assets hardcoded**

Trocar `og:image`, `twitter:image`, poster inicial e logos estáticos que ainda usam `images/...`.

- [ ] **Step 2: Garantir que `contentLoader.js` consuma o novo shape**

Ler `SITE.hero.posterImage`, `SITE.logo.src` e `SITE.meta.ogImage` sem depender do formato antigo baseado em YouTube.

### Task 3: Substituir YouTube por Cloudflare Stream

**Files:**
- Modify: `index.html`
- Modify: `interactivity.js`

- [ ] **Step 1: Trocar o embed no HTML**

Substituir os containers/scripts do YouTube por um `iframe` do Stream com autoplay muted, loop e inline playback.

- [ ] **Step 2: Reescrever o controle JS**

Remover toda a lógica da YouTube API e adaptar os botões para controlar o `iframe` do Stream via `postMessage`.

- [ ] **Step 3: Manter resiliência**

Se o player não responder, os controles não devem lançar exceções nem quebrar a página.

### Task 4: Verificação

**Files:**
- Modify: none

- [ ] **Step 1: Buscar referências restantes ao YouTube**

Run: `rg -n "youtube|youtu|YT\\.Player|iframe_api" index.html interactivity.js siteContent.js contentLoader.js`
Expected: sem ocorrências ativas da integração antiga.

- [ ] **Step 2: Buscar referências locais remanescentes**

Run: `rg -n "images/(capa01|sga-logo|opengraph|carrossel/card_03|carrossel/card_05|carrossel/card_06|carrossel/card_09|carrossel/card_10|carrossel/card_11)" index.html siteContent.js`
Expected: sem ocorrências para os assets migrados.
