/**
 * PurgeCSS Configuration
 * Elimina CSS no utilizado del bundle final
 *
 * Documentación: https://purgecss.com/configuration.html
 */

module.exports = {
  // Archivos a analizar para encontrar clases CSS utilizadas
  content: [
    './**/*.html',
    './js/**/*.js',
    './pages/**/*.html',
    // Incluir archivos de componentes
    './js/components/**/*.js',
  ],

  // Archivos CSS a purgar (archivos individuales, no main.css con @imports)
  css: [
    './css/base.css',
    './css/theme.css',
    './css/components.css',
    './css/design-system.css',
    './css/animations.css',
    './css/style.css',
    './css/lazy-loading.css',
    './css/mobile-responsive.css',
  ],

  // Directorio de salida
  output: './dist/css/',

  // Safelist: Clases que NO se deben eliminar
  safelist: {
    // Clases estándar que siempre se necesitan
    standard: [
      'html',
      'body',
      'active',
      'show',
      'hide',
      'fade',
      'open',
      'closed',
      'error',
      'success',
      'warning',
      'info',
    ],

    // Clases que contienen estos patrones (regex)
    greedy: [
      /^lazy-/, // lazy-loading, lazy-loaded, lazy-error
      /^toast-/, // toast-success, toast-error, etc.
      /^modal-/, // modal-open, modal-backdrop
      /^carousel-/, // carousel-item, carousel-control
      /^btn-/, // btn-primary, btn-secondary
      /^nav-/, // nav-link, nav-item
      /^card-/, // card-header, card-body
      /^form-/, // form-control, form-group
      /^alert-/, // alert-success, alert-danger
      /^badge-/, // badge-primary, badge-secondary
      /^swiper-/, // Swiper.js classes
      /^aos-/, // AOS animation classes
    ],

    // Deep: Clases en elementos hijos
    deep: [/dropdown/, /tooltip/, /popover/],

    // Keyframes de animaciones
    keyframes: true,

    // Fuentes
    fontFace: true,
  },

  // Variables CSS a mantener
  variables: true,

  // Keyframes a mantener
  keyframes: true,

  // Font-face a mantener
  fontFace: true,

  // Opciones adicionales
  defaultExtractor: (content) => {
    // Extractor personalizado para encontrar clases
    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
    const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];

    return broadMatches.concat(innerMatches);
  },

  // Eliminar comentarios del CSS resultante
  rejected: false,
  rejectedCss: false,

  // Verbose para debugging (cambiar a true si hay problemas)
  verbose: false,
};
