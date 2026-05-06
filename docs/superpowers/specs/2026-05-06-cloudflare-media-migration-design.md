# Cloudflare Media Migration Design

## Objective

Migrar o site para servir o vídeo principal via Cloudflare Stream e as imagens via Cloudflare R2/CDN, removendo a dependência atual de YouTube e reduzindo referências diretas a assets locais.

## Inputs Confirmed

- Stream video ID: `0c5595f6a6651e483fe757969d226380`
- Stream playback URL: `https://customer-henwoji2e791u0w5.cloudflarestream.com/0c5595f6a6651e483fe757969d226380/watch`
- Public images base URL: `https://cdn.santos-games.com/campeonatos/vct`
- Regra aprovada: cada asset local deve apontar para o arquivo final equivalente no R2 usando o nome/hash público.

## Current State

- `interactivity.js` instancia dois players do YouTube e sincroniza player principal + fundo.
- `siteContent.js` mantém `videoId` de YouTube e paths locais para poster, logo e cards.
- `index.html` ainda contém metas OG/Twitter e imagens estáticas apontando para arquivos locais.

## Target Design

### Video

- Substituir o player do YouTube por embed nativo de Cloudflare Stream usando `iframe`.
- Remover carregamento da YouTube IFrame API e toda a lógica de sincronização entre players.
- Manter os controles existentes de play/pause, mute, fullscreen e replay com base no `iframe` do Stream via `postMessage`, desde que o embed suporte os comandos necessários.
- Remover o vídeo de fundo separado; o player principal passa a ser a única mídia de vídeo.

### Images

- Centralizar a origem pública de imagens em `siteContent.js`.
- Criar um mapa de assets Cloudflare para poster, logo, og image e cards.
- Montar URLs completas a partir da base `https://cdn.santos-games.com/campeonatos/vct`.
- Trocar referências estáticas em HTML apenas onde o carregamento inicial ainda depende de valores hardcoded.

### SEO / Social

- Atualizar `og:image` e `twitter:image` para a URL pública do R2.
- Preservar `og:url` atual.

## File Responsibilities

- `siteContent.js`: configuração da base Cloudflare, mapa dos assets públicos e URLs consumidas pelo loader.
- `contentLoader.js`: preencher o DOM com URLs finais vindas de `SITE`.
- `interactivity.js`: controle do player Cloudflare Stream e controles da UI.
- `index.html`: markup inicial e metas estáticas que precisam sair do modo YouTube/local.

## Error Handling

- Se o `iframe` do Stream não estiver presente, os controles não devem disparar erro.
- Se algum asset não for definido no mapa, o site continua usando o valor existente no DOM.

## Testing Strategy

- Verificar que nenhum script do YouTube permanece no HTML.
- Verificar que `SITE` resolve URLs Cloudflare para capa, logo, OG e cards.
- Verificar que o player embutido responde aos controles principais sem quebrar o layout.
