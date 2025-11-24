/**
 * ============================================================================
 * Product Recommendations Component v1.0.0 - Flores Victoria
 * ============================================================================
 *
 * Sistema de recomendaciones de productos basado en:
 * - Misma categoría
 * - Rango de precio similar (±30%)
 * - Productos destacados y más vendidos
 *
 * ⚠️  IMPORTANTE: Requiere CSS externo
 * ============================================================================
 * Este componente requiere el archivo CSS externo:
 *   /css/components/product-recommendations.css
 *
 * Asegúrate de incluir en tu HTML ANTES de este script:
 *   <link rel="stylesheet" href="/css/components/product-recommendations.css">
 *   <script src="/js/components/product-recommendations.js"></script>
 *
 * @author Flores Victoria Team
 * @version 1.0.0
 * @date 2025-11-12
 *
 * @example
 * const recommender = new ProductRecommendations(productsData);
 * const related = recommender.getRelatedProducts(product, 4);
 * recommender.renderRecommendations(containerId, product, 4);
 */

(function () {
  'use strict';
  // Logger condicional
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.DEBUG === true);
  const logger = {
    log: (...args) => isDev && console.log(...args),
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
  };

  class ProductRecommendations {
    constructor(products, config = {}) {
      this.products = products || [];
      this.config = {
        priceRangePercent: 0.3, // ±30% del precio
        minRecommendations: 3,
        maxRecommendations: 8,
        preferFeatured: true,
        preferBestsellers: true,
        ...config,
      };
    }

    /**
     * Obtiene productos relacionados basados en un producto dado
     * @param {Object} product - Producto de referencia
     * @param {number} limit - Cantidad máxima de recomendaciones
     * @returns {Array} - Array de productos relacionados
     */
    getRelatedProducts(product, limit = 4) {
      if (!product) return [];

      const related = this.products
        .filter((p) => {
          // Excluir el producto actual
          if (p.id === product.id) return false;

          // Productos no disponibles
          if (p.status !== 'available') return false;

          // Misma categoría tiene prioridad
          if (p.category === product.category) return true;

          // Mismo tipo de producto
          if (p.type === product.type) return true;

          return false;
        })
        .map((p) => {
          // Calcular score de similitud
          let score = 0;

          // Misma categoría (+50 puntos)
          if (p.category === product.category) score += 50;

          // Mismo tipo (+30 puntos)
          if (p.type === product.type) score += 30;

          // Mismo color (+20 puntos)
          if (p.color === product.color) score += 20;

          // Precio similar (±30%)
          const priceMin = product.price * (1 - this.config.priceRangePercent);
          const priceMax = product.price * (1 + this.config.priceRangePercent);
          if (p.price >= priceMin && p.price <= priceMax) {
            score += 40;
          }

          // Productos destacados (+15 puntos)
          if (this.config.preferFeatured && p.featured) score += 15;

          // Más vendidos (+10 puntos)
          if (this.config.preferBestsellers && p.bestseller) score += 10;

          // Nuevos (+5 puntos)
          if (p.new) score += 5;

          return { ...p, recommendationScore: score };
        })
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);

      return related;
    }

    /**
     * Obtiene productos populares (más vendidos y destacados)
     * @param {number} limit - Cantidad máxima
     * @returns {Array} - Array de productos populares
     */
    getPopularProducts(limit = 6) {
      return this.products
        .filter((p) => p.status === 'available')
        .map((p) => {
          let score = 0;
          if (p.bestseller) score += 30;
          if (p.featured) score += 20;
          if (p.new) score += 10;
          return { ...p, popularityScore: score };
        })
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, limit);
    }

    /**
     * Renderiza las recomendaciones en un contenedor HTML
     * @param {string} containerId - ID del contenedor
     * @param {Object} product - Producto de referencia
     * @param {number} limit - Cantidad de recomendaciones
     */
    renderRecommendations(containerId, product, limit = 4) {
      const container = document.getElementById(containerId);
      if (!container) {
        logger.warn(`[ProductRecommendations] Contenedor ${containerId} no encontrado`);
        return;
      }

      const related = this.getRelatedProducts(product, limit);

      if (related.length === 0) {
        container.innerHTML = '';
        return;
      }

      container.innerHTML = `
        <div class="recommendations-section">
          <h3 class="recommendations-title">
            <i class="fas fa-heart"></i> También te puede gustar
          </h3>
          <div class="recommendations-grid">
            ${related.map((p) => this.createProductCard(p)).join('')}
          </div>
        </div>
      `;

      // Inicializar lazy loading para las imágenes
      this.initLazyLoading(container);
    }

    /**
     * Crea el HTML de una tarjeta de producto
     * @param {Object} product - Producto
     * @returns {string} - HTML de la tarjeta
     */
    createProductCard(product) {
      const imageId = `${product.id}`.toUpperCase();
      const imagePath = `/images/products/watermarked/${imageId}-watermarked.webp`;
      const placeholderPath = `/images/placeholder.svg`;
      const discount = product.original_price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0;

      return `
        <div class="recommendation-card" data-product-id="${product.id}">
          <div class="recommendation-image">
            <img 
              class="lazy-image"
              data-src="${imagePath}"
              src="${placeholderPath}"
              alt=""
              width="250"
              height="250"
              loading="lazy"
              onerror="this.src='/images/placeholder.svg';"
            />
            ${discount > 0 ? `<div class="recommendation-badge discount">-${discount}%</div>` : ''}
            ${product.featured ? '<div class="recommendation-badge featured">Destacado</div>' : ''}
            ${product.new ? '<div class="recommendation-badge new">Nuevo</div>' : ''}
            ${product.bestseller ? '<div class="recommendation-badge bestseller">Más Vendido</div>' : ''}
          </div>
          <div class="recommendation-content">
            <h4 class="recommendation-name">${this.escapeHtml(product.name)}</h4>
            <p class="recommendation-description">${this.escapeHtml(product.description)}</p>
            <div class="recommendation-footer">
              <div class="recommendation-price">
                ${
                  product.original_price
                    ? `<span class="price-original">$${this.formatPrice(product.original_price)}</span>`
                    : ''
                }
                <span class="price-current">$${this.formatPrice(product.price)}</span>
              </div>
              <button class="btn-add-recommendation" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Inicializa lazy loading para las imágenes del contenedor
     * @param {HTMLElement} container - Contenedor con imágenes
     */
    initLazyLoading(container) {
      if (!('IntersectionObserver' in window)) {
        // Fallback: cargar todas las imágenes
        container.querySelectorAll('.lazy-image').forEach((img) => {
          if (img.dataset.src) img.src = img.dataset.src;
        });
        return;
      }

      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          });
        },
        { rootMargin: '50px' }
      );

      container.querySelectorAll('.lazy-image').forEach((img) => {
        imageObserver.observe(img);
      });
    }

    /**
     * Escapa HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} - Texto escapado
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Formatea precio con separador de miles
     * @param {number} price - Precio
     * @returns {string} - Precio formateado
     */
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }

  // Exportar globalmente
  window.ProductRecommendations = ProductRecommendations;

  logger.log('✅ ProductRecommendations v1.0.0 - Cargado correctamente');
})();
