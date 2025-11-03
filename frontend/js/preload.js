/**
 * Preload Critical Resources
 * Mejora el FCP precargando recursos críticos de forma inteligente
 */

(function () {
  'use strict';

  // Preload critical images
  const criticalImages = ['/logo.svg', '/images/logo.svg'];

  // Preload with fetchpriority high
  criticalImages.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchpriority = 'high';
    document.head.appendChild(link);
  });

  // Prefetch next-page resources on idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const prefetchUrls = [
        '/pages/products.html',
        '/css/products-page.css',
        '/js/pages/products-page.js',
      ];

      prefetchUrls.forEach((url) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    });
  }

  // Early hints for fonts
  const fontPreconnects = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com',
  ];

  fontPreconnects.forEach((origin) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Resource hints for API
  const apiHint = document.createElement('link');
  apiHint.rel = 'dns-prefetch';
  apiHint.href = 'http://localhost:3000';
  document.head.appendChild(apiHint);
})();
