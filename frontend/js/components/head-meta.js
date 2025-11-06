/**
 * Head Meta Component - Unified meta tags for all pages
 * Dynamically generates meta tags based on page configuration
 */

const HeadMetaComponent = {
  /**
   * Default configuration
   */
  defaults: {
    siteName: 'Flores Victoria',
    siteUrl: 'https://arreglosvictoria.com',
    defaultImage: '/images/og-image.jpg',
    themeColor: '#C2185B',
    author: 'Flores Victoria',
    twitterHandle: '@floresvictoria',
  },

  /**
   * Generate meta tags based on page config
   * @param {Object} config - Page-specific configuration
   */
  generateMeta(config = {}) {
    const meta = { ...this.defaults, ...config };
    const fullUrl = `${meta.siteUrl}${meta.path || ''}`;

    return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="version" content="2.0.1">
    <title>${meta.title || meta.siteName}</title>
    <meta name="description" content="${meta.description || ''}">
    <meta name="keywords" content="${meta.keywords || 'flores, arreglos florales, bouquets, rosas'}">
    <meta name="author" content="${meta.author}">
    <meta name="robots" content="${meta.robots || 'index, follow'}">
    <meta name="theme-color" content="${meta.themeColor}">
    <link rel="canonical" href="${fullUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:title" content="${meta.title || meta.siteName}">
    <meta property="og:description" content="${meta.description || ''}">
    <meta property="og:image" content="${meta.siteUrl}${meta.image || meta.defaultImage}">
    <meta property="og:site_name" content="${meta.siteName}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${fullUrl}">
    <meta property="twitter:title" content="${meta.title || meta.siteName}">
    <meta property="twitter:description" content="${meta.description || ''}">
    <meta property="twitter:image" content="${meta.siteUrl}${meta.image || meta.defaultImage}">
    <meta property="twitter:site" content="${meta.twitterHandle}">
    
    <!-- PWA -->
    <link rel="icon" href="/favicon.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    
    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Styles -->
    <link rel="preload" as="style" href="/css/base.css">
    <link rel="preload" as="style" href="/css/style.css">
    <link rel="stylesheet" href="/css/base.css?v=20250124">
    <link rel="stylesheet" href="/css/style.css?v=20250124">
    `;
  },

  /**
   * Inject meta tags into head
   */
  inject(config) {
    const metaTags = this.generateMeta(config);
    document.head.insertAdjacentHTML('afterbegin', metaTags);
  },
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeadMetaComponent;
}
