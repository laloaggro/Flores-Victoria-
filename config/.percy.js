const percySnapshot = require('@percy/playwright');

// Configuración de Percy para el proyecto Flores Victoria
module.exports = {
  // Nombre del proyecto en Percy
  projectName: 'Flores Victoria',

  // Anchos de pantalla para capturas
  widths: [375, 768, 1280, 1920],

  // Altura mínima
  minHeight: 1024,

  // Configuración de captura
  percyCSS: `
    /* Ocultar elementos dinámicos */
    .loading-spinner,
    .skeleton-loader,
    .animation-element {
      display: none !important;
    }
  `,

  // Configuración de navegador
  discovery: {
    allowedHostnames: ['localhost', '127.0.0.1'],
    networkIdleTimeout: 750,
  },
};
