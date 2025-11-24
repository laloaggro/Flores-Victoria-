/**
 * Image Optimizer Utility - Flores Victoria
 * Proporciona funciones para cargar imágenes optimizadas con WebP/AVIF fallback
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * Detecta soporte de formatos modernos de imagen
   */
  const imageSupport = {
    webp: false,
    avif: false,
  };

  // Detectar soporte WebP
  const webpTest = new Image();
  webpTest.onload = webpTest.onerror = function () {
    imageSupport.webp = webpTest.height === 2;
  };
  webpTest.src =
    'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

  /**
   * Convierte una URL de imagen a formato optimizado si está disponible
   * @param {string} imageUrl - URL de imagen original
   * @returns {string} - URL optimizada o original
   */
  function getOptimizedImageUrl(imageUrl) {
    if (!imageUrl) return imageUrl;

    // Si ya es WebP/AVIF, retornar tal cual
    if (imageUrl.endsWith('.webp') || imageUrl.endsWith('.avif')) {
      return imageUrl;
    }

    // Intentar versión WebP si hay soporte
    if (imageSupport.webp) {
      return imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    return imageUrl;
  }

  /**
   * Crea un elemento <picture> con fallbacks para mejor compatibilidad
   * @param {Object} options - Opciones de imagen
   * @param {string} options.src - URL de imagen original
   * @param {string} options.alt - Texto alternativo
   * @param {string} options.className - Clases CSS
   * @param {string} options.loading - lazy | eager
   * @returns {HTMLPictureElement}
   */
  function createPictureElement(options) {
    const { src, alt = '', className = '', loading = 'lazy', width, height } = options;

    const picture = document.createElement('picture');

    // Source para WebP (si existe)
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const webpSource = document.createElement('source');
    webpSource.type = 'image/webp';
    webpSource.srcset = webpSrc;
    picture.appendChild(webpSource);

    // Fallback img
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = loading;
    if (className) img.className = className;
    if (width) img.width = width;
    if (height) img.height = height;

    picture.appendChild(img);

    return picture;
  }

  /**
   * Reemplaza todas las imágenes en un contenedor con versiones optimizadas
   * @param {HTMLElement} container - Contenedor de imágenes
   */
  function optimizeImagesInContainer(container) {
    const images = container.querySelectorAll('img[data-optimize="true"]');

    images.forEach((img) => {
      const optimizedUrl = getOptimizedImageUrl(img.src);
      if (optimizedUrl !== img.src) {
        img.src = optimizedUrl;
      }
    });
  }

  /**
   * Precarga una imagen crítica
   * @param {string} imageUrl - URL de imagen
   * @param {string} type - image/webp | image/jpeg
   */
  function preloadImage(imageUrl, type = 'image/webp') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    link.type = type;
    document.head.appendChild(link);
  }

  // Exportar utilidades globalmente
  window.ImageOptimizer = {
    getOptimizedImageUrl,
    createPictureElement,
    optimizeImagesInContainer,
    preloadImage,
    support: imageSupport,
  };

  // Auto-optimizar imágenes marcadas al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImagesInContainer(document.body);
    });
  } else {
    optimizeImagesInContainer(document.body);
  }
})();
