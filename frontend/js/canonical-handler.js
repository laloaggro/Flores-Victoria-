/**
 * Canonical URL Handler
 * Genera y añade canonical tags dinámicamente para páginas con query parameters
 *
 * @version 1.0.0
 * @date 2025-11-24
 */

const BASE_URL = 'https://flores-victoria.com';

/**
 * Establece canonical URL para la página actual
 * @param {string} path - Path relativo (ej: '/pages/catalog.html')
 * @param {Object} params - Query params a incluir en canonical (opcional)
 * @example
 * setCanonical('/pages/product-detail.html', { id: '123' });
 */
export function setCanonical(path, params = {}) {
  // Remover canonical existente si hay
  const existing = document.querySelector('link[rel="canonical"]');
  if (existing) {
    existing.remove();
  }

  // Construir URL
  let canonicalURL = `${BASE_URL}${path}`;

  // Agregar params si existen
  const paramString = new URLSearchParams(params).toString();
  if (paramString) {
    canonicalURL += `?${paramString}`;
  }

  // Crear e inyectar tag
  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = canonicalURL;
  document.head.appendChild(link);

  if (window.DEBUG || window.location.hostname === 'localhost') {
    
  }
}

/**
 * Auto-establece canonical basado en URL actual
 * Ignora la mayoría de query params (utm_*, fbclid, gclid, etc.)
 * Solo preserva params de navegación importantes (id, category, page)
 */
export function autoSetCanonical() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  // Lista blanca de params a preservar en canonical
  // Tracking params (utm_*, fbclid, gclid, etc.) se ignoran automáticamente
  const preserveParams = ['id', 'category', 'page'];
  const cleanParams = {};

  preserveParams.forEach((key) => {
    if (params.has(key)) {
      cleanParams[key] = params.get(key);
    }
  });

  setCanonical(path, cleanParams);
}

/**
 * Configura canonical para página de producto (preserva ID)
 * @param {string} productId - ID del producto
 */
export function setProductCanonical(productId) {
  if (!productId) {
    console.warn('⚠️ No product ID provided for canonical URL');
    return;
  }
  setCanonical('/pages/product-detail.html', { id: productId });
}

/**
 * Configura canonical para página de productos (preserva categoría si existe)
 * @param {string} category - Categoría de productos (opcional)
 */
export function setProductsCanonical(category = null) {
  const params = category ? { category } : {};
  setCanonical('/pages/products.html', params);
}

/**
 * Configura canonical para página de catálogo (preserva categoría)
 * @param {string} category - Categoría del catálogo (opcional)
 */
export function setCatalogCanonical(category = null) {
  const params = category ? { category } : {};
  setCanonical('/pages/catalog.html', params);
}

/**
 * Verifica si la página actual tiene canonical tag
 * @returns {boolean}
 */
export function hasCanonical() {
  return !!document.querySelector('link[rel="canonical"]');
}

/**
 * Obtiene la URL canonical actual
 * @returns {string|null}
 */
export function getCanonical() {
  const link = document.querySelector('link[rel="canonical"]');
  return link ? link.href : null;
}

// Auto-ejecución solo para páginas que lo necesiten
// No ejecutar si ya existe canonical en HTML estático
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCanonical);
} else {
  initCanonical();
}

function initCanonical() {
  // No sobreescribir si ya existe canonical estático
  if (hasCanonical()) {
    if (window.DEBUG || window.location.hostname === 'localhost') {
      
    }
    return;
  }

  // Detectar tipo de página y configurar canonical apropiado
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  if (path.includes('product-detail')) {
    // Página de producto - preservar ID
    const productId = params.get('id');
    if (productId) {
      setProductCanonical(productId);
    }
  } else if (path.includes('catalog')) {
    // Catálogo - preservar category, ignorar sort/filters
    const category = params.get('category');
    setCatalogCanonical(category);
  } else {
    // Otras páginas - usar auto-detección
    autoSetCanonical();
  }
}

// Exportar funciones
export default {
  setCanonical,
  autoSetCanonical,
  setProductCanonical,
  setCatalogCanonical,
  hasCanonical,
  getCanonical,
};
