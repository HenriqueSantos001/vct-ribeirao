var CLOUDFLARE_STREAM_CUSTOMER_CODE = 'henwoji2e791u0w5';
var CLOUDFLARE_STREAM_VIDEO_ID = '0c5595f6a6651e483fe757969d226380';
var CLOUDFLARE_IMAGES_BASE_URL = 'https://cdn.santos-games.com/campeonatos/vct';

function cfImage(path) {
  return CLOUDFLARE_IMAGES_BASE_URL + '/' + path;
}

var CLOUDFLARE_ASSETS = {
  ogImage: cfImage('capa-og-image-op2-f5e2eb84.webp'),
  heroPoster: cfImage('capa01-ef93209a.avif'),
  logo: cfImage('sga-logo-2ad81630.avif'),
  cards: {
    card03: cfImage('card-03-9ee9fd3e.webp'),
    card05: cfImage('card-05-49e8e61c.webp'),
    card06: cfImage('card-06-960034e0.webp'),
    card09: cfImage('card-09-2b3b9ff9.webp'),
    card10: cfImage('card-10-553ba3f9.webp'),
    card11: cfImage('card-11-ce876ba1.webp'),
  },
};

var SITE = {

  // ─── METADADOS & SEO ──────────────────────────────────────
  meta: {
    lang:        'pt-BR',
    title:       'VCT RP 4ª Edição | SGA',
    description: 'Jogue presencialmente, com transmissão ao vivo e cobertura completa. Inscreva-se já para garantir seu lugar na competição mais emocionante do ano!',
    favicon:     '',
    ogImage:     CLOUDFLARE_ASSETS.ogImage,
    ogUrl:       'https://santos-games.com/vct-ribeirao/',
    ogType:      'website',
    themeColor:  '#000000',
  },

  // ─── LOGO ─────────────────────────────────────────────────
  logo: {
    src:    CLOUDFLARE_ASSETS.logo,
    alt:    'Santos Games Arena',
    width:  167,
    height: 45,
  },

  // ─── VÍDEO PRINCIPAL (HERO) ───────────────────────────────
  hero: {
    streamUid:        CLOUDFLARE_STREAM_VIDEO_ID,
    streamHlsUrl:     'https://customer-' + CLOUDFLARE_STREAM_CUSTOMER_CODE + '.cloudflarestream.com/' + CLOUDFLARE_STREAM_VIDEO_ID + '/manifest/video.m3u8',
    watchUrl:         'https://customer-' + CLOUDFLARE_STREAM_CUSTOMER_CODE + '.cloudflarestream.com/' + CLOUDFLARE_STREAM_VIDEO_ID + '/watch',
    posterImage:      CLOUDFLARE_ASSETS.heroPoster,
  },

  // ─── TEMPORADAS ───────────────────────────────────────────
  seasons: [
    { id: 'temp-1', label: 'Temporada 1' },
  ],

  episodesBySeason: {
    'temp-1': [
      { number: 1, title: '100% presencial', description: 'Aqui não é online. É competição real, frente a frente.', image: CLOUDFLARE_ASSETS.cards.card05 },
      { number: 2, title: 'Sua gameplay ao vivo', description: 'Transmissão com HUD profissional, narrador e entrevistas. Seu jogo vira espetáculo.', image: CLOUDFLARE_ASSETS.cards.card03 },
      { number: 3, title: 'Você vira conteúdo', description: 'Bastidores, entrevistas e momentos reais que ficam registrados dentro e fora do jogo.', image: CLOUDFLARE_ASSETS.cards.card09 },
      { number: 4, title: 'Ambiente de competição real', description: 'Times separados, comunicação segura e foco total. Aqui é competição de verdade.', image: CLOUDFLARE_ASSETS.cards.card06 },
      { number: 5, title: 'Mesmo setup pra todos', description: 'Mesma máquina, mesma performance. Aqui não é equipamento. É jogo.', image: CLOUDFLARE_ASSETS.cards.card10 },
      { number: 6, title: 'Experiência completa', description: 'Fotógrafo, videomaker e cobertura completa do campeonato do início ao fim.', image: CLOUDFLARE_ASSETS.cards.card11 },
    ],
  },

};
