/**
 * ============================================================================
 * Head Meta Component - Dynamic SEO & Meta Tags Manager
 * ============================================================================
 *
 * Sistema unificado para gestión de meta tags SEO, Open Graph, Twitter Cards,
 * y configuración de recursos (fonts, styles, PWA).
 *
 * @module HeadMetaComponent
 * @version 2.0.0
 *
 * Uso básico:
 *   HeadMetaComponent.inject({
 *     title: 'Contacto | Flores Victoria',
 *     description: 'Contáctanos para tu pedido',
 *     path: '/contacto'
 *   });
 *
 * Con imagen personalizada:
 *   HeadMetaComponent.updateMeta({
 *     image: '/images/products/ramo-rosas.jpg',
 *     keywords: 'ramo de rosas, flores rojas'
 *   });
 *
 * Características:
 *   - Meta tags SEO completos
 *   - Open Graph (Facebook)
 *   - Twitter Cards
 *   - PWA manifest
 *   - Canonical URLs
 *   - Preconnect/DNS-prefetch
 *   - Cache busting automático
 *   - Schema.org structured data
 */

// Logger condicional
const isDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.DEBUG === true);
const logger = {
  log: (...args) => isDev && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  debug: (...args) => isDev && console.debug(...args),
};

const HeadMetaComponent = {
  // ========================================
  // Configuración por defecto
  // ========================================

  config: {
    siteName: 'Flores Victoria',
    siteUrl: 'https://arreglosvictoria.com',
    defaultImage: '/images/og-image.jpg',
    themeColor: '#C2185B',
    author: 'Flores Victoria',
    twitterHandle: '@floresvictoria',
    locale: 'es_CL',
    fbAppId: '',
    version: '2.0.1',
    enableStructuredData: true,
  },

  // ========================================
  // Estado interno
  // ========================================

  state: {
    currentMeta: {},
    injectedElements: [],
    isInjected: false,
  },

  // ========================================
  // Generación de meta tags
  // ========================================

  /**
   * Genera meta tags completos basados en configuración
   * @param {Object} [pageConfig={}] - Configuración específica de la página
   * @returns {string} HTML de meta tags
   */
  generateMeta(pageConfig = {}) {
    const meta = { ...this.config, ...pageConfig };
    this.state.currentMeta = meta;

    const fullUrl = `${meta.siteUrl}${meta.path || ''}`;
    const imageUrl = meta.image
      ? meta.image.startsWith('http')
        ? meta.image
        : `${meta.siteUrl}${meta.image}`
      : `${meta.siteUrl}${meta.defaultImage}`;

    const cacheVersion = Date.now();

    return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="version" content="${meta.version}">
    
    <!-- SEO Basics -->
    <title>${this.escapeHtml(meta.title || meta.siteName)}</title>
    <meta name="description" content="${this.escapeHtml(meta.description || 'Flores y arreglos florales')}">
    <meta name="keywords" content="${this.escapeHtml(meta.keywords || 'flores, arreglos florales, bouquets, rosas, delivery')}">
    <meta name="author" content="${this.escapeHtml(meta.author)}">
    <meta name="robots" content="${meta.robots || 'index, follow'}">
    <meta name="theme-color" content="${meta.themeColor}">
    <meta name="language" content="Spanish">
    <link rel="canonical" href="${fullUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${meta.ogType || 'website'}">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:title" content="${this.escapeHtml(meta.title || meta.siteName)}">
    <meta property="og:description" content="${this.escapeHtml(meta.description || '')}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${meta.siteName}">
    <meta property="og:locale" content="${meta.locale}">
    ${meta.fbAppId ? `<meta property="fb:app_id" content="${meta.fbAppId}">` : ''}
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${fullUrl}">
    <meta name="twitter:title" content="${this.escapeHtml(meta.title || meta.siteName)}">
    <meta name="twitter:description" content="${this.escapeHtml(meta.description || '')}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:site" content="${meta.twitterHandle}">
    <meta name="twitter:creator" content="${meta.twitterHandle}">
    
    <!-- PWA & Icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    
    <!-- Preconnect & DNS Prefetch -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
    ${meta.apiUrl ? `<link rel="preconnect" href="${meta.apiUrl}">` : ''}
    
    <!-- Google Fonts -->
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer">
    
    <!-- Styles -->
    <link rel="preload" as="style" href="/css/base.css?v=${cacheVersion}">
    <link rel="preload" as="style" href="/css/style.css?v=${cacheVersion}">
    <link rel="stylesheet" href="/css/base.css?v=${cacheVersion}">
    <link rel="stylesheet" href="/css/style.css?v=${cacheVersion}">
    ${meta.customStyles ? meta.customStyles.map((s) => `<link rel="stylesheet" href="${s}?v=${cacheVersion}">`).join('\n    ') : ''}
    `;
  },

  /**
   * Genera structured data (Schema.org)
   * @param {Object} data - Datos estructurados
   * @returns {string} Script JSON-LD
   */
  generateStructuredData(data) {
    if (!this.config.enableStructuredData) return '';

    const schema = {
      '@context': 'https://schema.org',
      '@type': data.type || 'WebSite',
      name: data.name || this.config.siteName,
      url: data.url || this.config.siteUrl,
      ...data,
    };

    return `
    <script type="application/ld+json">
      ${JSON.stringify(schema, null, 2)}
    </script>
    `;
  },

  // ========================================
  // Métodos públicos
  // ========================================

  /**
   * Inyecta meta tags en el head
   * @param {Object} [pageConfig={}] - Configuración de la página
   */
  inject(pageConfig = {}) {
    if (this.state.isInjected) {
      logger.warn('Meta tags already injected. Use updateMeta() to update.');
      return;
    }

    const metaTags = this.generateMeta(pageConfig);
    document.head.insertAdjacentHTML('afterbegin', metaTags);

    // Inject structured data if provided
    if (pageConfig.structuredData) {
      const structuredData = this.generateStructuredData(pageConfig.structuredData);
      document.head.insertAdjacentHTML('beforeend', structuredData);
    }

    this.state.isInjected = true;
    logger.log('✅ Meta tags injected');
  },

  /**
   * Actualiza meta tags dinámicamente
   * @param {Object} updates - Valores a actualizar
   */
  updateMeta(updates) {
    const newMeta = { ...this.state.currentMeta, ...updates };

    // Update title
    if (updates.title) {
      document.title = this.escapeHtml(updates.title);
    }

    // Update description
    if (updates.description) {
      this.updateMetaTag('name', 'description', updates.description);
      this.updateMetaTag('property', 'og:description', updates.description);
      this.updateMetaTag('name', 'twitter:description', updates.description);
    }

    // Update image
    if (updates.image) {
      const imageUrl = updates.image.startsWith('http')
        ? updates.image
        : `${this.config.siteUrl}${updates.image}`;
      this.updateMetaTag('property', 'og:image', imageUrl);
      this.updateMetaTag('name', 'twitter:image', imageUrl);
    }

    // Update canonical
    if (updates.path) {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.href = `${this.config.siteUrl}${updates.path}`;
      }
    }

    this.state.currentMeta = newMeta;
  },

  /**
   * Actualiza un meta tag específico
   * @param {string} attr - Atributo (name o property)
   * @param {string} key - Valor del atributo
   * @param {string} content - Contenido
   */
  updateMetaTag(attr, key, content) {
    let tag = document.querySelector(`meta[${attr}="${key}"]`);
    if (tag) {
      tag.setAttribute('content', this.escapeHtml(content));
    } else {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      tag.setAttribute('content', this.escapeHtml(content));
      document.head.appendChild(tag);
    }
  },

  /**
   * Obtiene meta tag actual
   * @returns {Object} Configuración actual
   */
  getCurrentMeta() {
    return { ...this.state.currentMeta };
  },

  /**
   * Escapa HTML para prevenir XSS
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Destruye el componente
   */
  destroy() {
    this.state = {
      currentMeta: {},
      injectedElements: [],
      isInjected: false,
    };
    logger.log('🗑️ Head Meta component destroyed');
  },
};

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeadMetaComponent;
}
