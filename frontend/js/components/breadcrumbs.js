/**
 * ============================================================================
 * Breadcrumbs Component - Dynamic Navigation Breadcrumbs
 * ============================================================================
 *
 * Componente para generar breadcrumbs (migas de pan) dinámicos basados en
 * la ruta actual o configuración personalizada.
 *
 * @module BreadcrumbsComponent
 * @version 2.0.0
 *
 * Uso básico:
 *   BreadcrumbsComponent.mount(); // Auto-genera desde URL
 *
 * Uso personalizado:
 *   const customBreadcrumbs = [
 *     { name: 'Inicio', url: '/' },
 *     { name: 'Productos', url: '/pages/products.html' },
 *     { name: 'Rosas', url: '/pages/products.html?cat=rosas', active: true }
 *   ];
 *   BreadcrumbsComponent.mount('breadcrumbs-root', customBreadcrumbs);
 *
 * Características:
 *   - Generación automática desde URL
 *   - Mapeo de nombres amigables
 *   - Soporte para breadcrumbs personalizados
 *   - Schema.org structured data
 *   - Accesibilidad completa (ARIA)
 *   - Oculta automáticamente en página de inicio
 */

const BreadcrumbsComponent = {
  // ========================================
  // Configuración
  // ========================================

  config: {
    mountPoint: 'breadcrumbs-root',
    homeLabel: 'Inicio',
    homeUrl: '/',
    showOnHome: false, // No mostrar breadcrumbs en home
    enableStructuredData: true, // JSON-LD para SEO
    nameMap: {
      // Mapeo de rutas a nombres amigables
      pages: null, // Skip this folder
      products: 'Productos',
      catalog: 'Categorías',
      about: 'Nosotros',
      contact: 'Contacto',
      blog: 'Blog',
      gallery: 'Galería',
      faq: 'Preguntas Frecuentes',
      cart: 'Carrito',
      checkout: 'Finalizar Compra',
      wishlist: 'Lista de Deseos',
      orders: 'Mis Pedidos',
      profile: 'Mi Perfil',
      privacy: 'Política de Privacidad',
      terms: 'Términos y Condiciones',
      testimonials: 'Testimonios',
      sitemap: 'Mapa del Sitio',
    },
  },

  // ========================================
  // Generación de breadcrumbs
  // ========================================

  /**
   * Genera breadcrumbs automáticamente desde la URL actual
   * @returns {Array} Array de objetos breadcrumb
   */
  generateFromPath() {
    const path = window.location.pathname;
    const parts = path.split('/').filter((p) => p && p !== 'index.html');

    // Siempre empezar con home
    const breadcrumbs = [
      {
        name: this.config.homeLabel,
        url: this.config.homeUrl,
        active: false,
      },
    ];

    // Si estamos en home, retornar solo home
    if (parts.length === 0 || path === '/') {
      breadcrumbs[0].active = true;
      return breadcrumbs;
    }

    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath += `/${part}`;

      // Limpiar extensión .html y query params
      const cleanPart = part.replace('.html', '').split('?')[0];

      // Obtener nombre amigable del mapeo
      const name = this.config.nameMap[cleanPart];

      // Si el nombre es null, skip (ej: folder "pages")
      if (name === null) return;

      // Si no está en el mapeo, usar el nombre del path capitalizado
      const displayName =
        name || cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1);

      breadcrumbs.push({
        name: displayName,
        url: currentPath,
        active: index === parts.length - 1,
      });
    });

    return breadcrumbs;
  },

  /**
   * Valida un array de breadcrumbs personalizado
   * @param {Array} breadcrumbs - Array de breadcrumbs
   * @returns {boolean} true si es válido
   */
  validateBreadcrumbs(breadcrumbs) {
    if (!Array.isArray(breadcrumbs)) {
      console.error('❌ Breadcrumbs must be an array');
      return false;
    }

    return breadcrumbs.every((crumb, index) => {
      if (!crumb.name || !crumb.url) {
        console.error(`❌ Breadcrumb at index ${index} missing name or url`);
        return false;
      }
      return true;
    });
  },

  // ========================================
  // Renderizado
  // ========================================

  /**
   * Genera el HTML de un item de breadcrumb
   * @param {Object} crumb - Objeto breadcrumb
   * @param {number} index - Índice en el array
   * @param {boolean} isLast - Si es el último item
   * @returns {string} HTML del item
   */
  renderItem(crumb, index, isLast) {
    const escapedName = this.escapeHtml(crumb.name);

    if (isLast || crumb.active) {
      return `
        <li class="breadcrumb-item active" 
            aria-current="page">
          <span>${escapedName}</span>
        </li>
      `;
    }

    return `
      <li class="breadcrumb-item">
        <a href="${crumb.url}" 
           aria-label="Ir a ${escapedName}">
          ${escapedName}
        </a>
      </li>
    `;
  },

  /**
   * Genera el JSON-LD structured data para SEO
   * @param {Array} breadcrumbs - Array de breadcrumbs
   * @returns {string} Script tag con JSON-LD
   */
  generateStructuredData(breadcrumbs) {
    if (!this.config.enableStructuredData) return '';

    const itemListElements = breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${window.location.origin}${crumb.url}`,
    }));

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: itemListElements,
    };

    return `
      <script type="application/ld+json">
        ${JSON.stringify(structuredData, null, 2)}
      </script>
    `;
  },

  /**
   * Renderiza el HTML completo de breadcrumbs
   * @param {Array} customBreadcrumbs - Breadcrumbs personalizados (opcional)
   * @returns {string} HTML completo
   */
  render(customBreadcrumbs = null) {
    let breadcrumbs;

    // Usar breadcrumbs personalizados o generar automáticamente
    if (customBreadcrumbs) {
      if (!this.validateBreadcrumbs(customBreadcrumbs)) {
        return '';
      }
      breadcrumbs = customBreadcrumbs;
    } else {
      breadcrumbs = this.generateFromPath();
    }

    // No mostrar en home si está configurado así
    if (!this.config.showOnHome && breadcrumbs.length <= 1) {
      return '';
    }

    // Renderizar items
    const items = breadcrumbs
      .map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return this.renderItem(crumb, index, isLast);
      })
      .join('');

    // Generar structured data para SEO
    const structuredData = this.generateStructuredData(breadcrumbs);

    return `
      <nav aria-label="Migas de pan" 
           class="breadcrumbs-container"
           role="navigation">
        <div class="container">
          <ol class="breadcrumbs" 
              itemscope 
              itemtype="https://schema.org/BreadcrumbList">
            ${items}
          </ol>
        </div>
      </nav>
      ${structuredData}
    `;
  },

  // ========================================
  // Lifecycle methods
  // ========================================

  /**
   * Monta los breadcrumbs en el DOM
   * @param {string} elementId - ID del elemento contenedor
   * @param {Array} customBreadcrumbs - Breadcrumbs personalizados (opcional)
   */
  mount(elementId = this.config.mountPoint, customBreadcrumbs = null) {
    const element = document.getElementById(elementId);

    if (!element) {
      console.warn(`⚠️ Breadcrumbs: Mount point #${elementId} not found`);
      return;
    }

    const html = this.render(customBreadcrumbs);

    if (html) {
      element.innerHTML = html;
      console.log('✅ Breadcrumbs mounted successfully');
    } else {
      element.innerHTML = '';
    }
  },

  /**
   * Actualiza los breadcrumbs (útil para SPA)
   */
  update(customBreadcrumbs = null) {
    this.mount(this.config.mountPoint, customBreadcrumbs);
  },

  // ========================================
  // Utilidades
  // ========================================

  /**
   * Escapa HTML para prevenir XSS
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Obtiene los breadcrumbs actuales
   * @returns {Array} Array de breadcrumbs
   */
  getCurrent() {
    return this.generateFromPath();
  },

  /**
   * Limpia el contenedor de breadcrumbs
   */
  destroy() {
    const element = document.getElementById(this.config.mountPoint);
    if (element) {
      element.innerHTML = '';
    }
  },

  /**
   * Inicializa el componente si existe el mount point
   */
  init() {
    const element = document.getElementById(this.config.mountPoint);
    if (element) {
      this.mount();
    }
  },
};

// ========================================
// Auto-inicialización
// ========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    BreadcrumbsComponent.init();
  });
} else {
  BreadcrumbsComponent.init();
}

// ========================================
// Export para uso en módulos
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BreadcrumbsComponent;
}

if (typeof window !== 'undefined') {
  window.BreadcrumbsComponent = BreadcrumbsComponent;
}
