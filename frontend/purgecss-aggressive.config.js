module.exports = {
  content: ['./**/*.html', './js/**/*.js', './pages/**/*.html', './js/components/**/*.js'],

  css: ['./css/style.css'],

  output: './dist/css/',

  safelist: {
    standard: [
      'html',
      'body',
      'active',
      'show',
      'hide',
      'fade',
      'open',
      'closed',
      'visible',
      'invisible',
      'disabled',
      'enabled',
      'selected',
      'focus',
    ],
    greedy: [/^swiper-/, /^aos-/, /^fa-/, /^btn/, /^nav/, /^card/, /^form/, /^alert/],
    keyframes: true,
    fontFace: true,
  },

  defaultExtractor: (content) => {
    const matches = content.match(/[\w-/:]+(?<!:)/g) || [];
    return matches;
  },

  // Modo agresivo
  rejected: true,
  variables: false,
};
