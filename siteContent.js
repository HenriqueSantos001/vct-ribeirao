
var SITE = {

  // ─── METADADOS & SEO ──────────────────────────────────────
  meta: {
    lang:        'pt-BR',
    title:       'VCT RP 4ª Edição | SGA',
    description: 'Jogue presencialmente, com transmissão ao vivo e cobertura completa. Inscreva-se já para garantir seu lugar na competição mais emocionante do ano!',
    favicon:     '',  // Ex: 'assets/favicon.ico'
    ogImage:     '',  // Imagem para compartilhamento social (1200x630 recomendado)
    ogUrl:       '',  // URL canônica do site
    ogType:      'website',
    themeColor:  '#000000',
  },

  // ─── LOGO ─────────────────────────────────────────────────
  // Para trocar o logo basta colocar a URL de uma imagem/SVG.
  // Se preenchido, substitui o SVG embutido no header.
  logo: {
    src:    '',  // Ex: 'assets/logo.svg' ou 'https://meucdn.com/logo.png'
    alt:    'Logo da empresa',
    width:  167,
    height: 45,
  },

  // ─── VÍDEO PRINCIPAL (HERO) ───────────────────────────────
  hero: {
    videoId:     'Bx-OCsSuDa4',  // YouTube video ID (old mp4 URL removed)
    posterImage: 'images/capa01.png',
  },


  // ─── TEMPORADAS ───────────────────────────────────────────
  seasons: [
    { id: 'temp-1', label: 'Temporada 1' },
  ],

episodesBySeason: {
  'temp-1': [
    { number: 1, title: '100% presencial', description: 'Aqui não é online. É competição real, frente a frente.', image: 'images/carrossel/card_05.png' },

    { number: 2, title: 'Sua gameplay ao vivo', description: 'Transmissão com HUD profissional, narrador e entrevistas. Seu jogo vira espetáculo.', image: 'images/carrossel/card_03.png' },

    { number: 3, title: 'Você vira conteúdo', description: 'Bastidores, entrevistas e momentos reais que ficam registrados dentro e fora do jogo.', image: 'images/carrossel/card_09.png' },

    { number: 4, title: 'Ambiente de competição real', description: 'Times separados, comunicação segura e foco total. Aqui é competição de verdade.', image: 'images/carrossel/card_06.png' },

    { number: 5, title: 'Mesmo setup pra todos', description: 'Mesma máquina, mesma performance. Aqui não é equipamento. É jogo.', image: 'images/carrossel/card_10.png' },

    { number: 6, title: 'Experiência completa', description: 'Fotógrafo, videomaker e cobertura completa do campeonato do início ao fim.', image: 'images/carrossel/card_11.png' },
  ],
},

};
