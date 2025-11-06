/**
 * Breadcrumbs Component - Dynamic breadcrumb navigation
 */

const BreadcrumbsComponent = {
  /**
   * Generate breadcrumbs based on current path
   */
  generateFromPath() {
    const path = window.location.pathname;
    const parts = path.split('/').filter((p) => p && p !== 'index.html');

    const breadcrumbs = [{ name: 'Inicio', url: '/' }];

    let currentPath = '';
    parts.forEach((part, index) => {
      currentPath += `/${part}`;

      // Limpiar extensión .html
      const cleanPart = part.replace('.html', '');

      // Mapeo de nombres amigables
      const nameMap = {
        pages: null, // Skip this
        products: 'Productos',
        about: 'Nosotros',
        contact: 'Contacto',
        blog: 'Blog',
        gallery: 'Galería',
        faq: 'Preguntas Frecuentes',
        cart: 'Carrito',
        checkout: 'Checkout',
        wishlist: 'Favoritos',
        orders: 'Mis Pedidos',
        profile: 'Mi Perfil',
      };

      const name = nameMap[cleanPart];
      if (name) {
        breadcrumbs.push({
          name,
          url: currentPath,
          active: index === parts.length - 1,
        });
      }
    });

    return breadcrumbs;
  },

  /**
   * Render breadcrumbs HTML
   */
  render(customBreadcrumbs = null) {
    const breadcrumbs = customBreadcrumbs || this.generateFromPath();

    if (breadcrumbs.length <= 1) {
      return ''; // Don't show breadcrumbs on home page
    }

    const items = breadcrumbs
      .map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        if (isLast || crumb.active) {
          return `
          <li class="breadcrumb-item active" aria-current="page">
            <span>${crumb.name}</span>
          </li>
        `;
        }

        return `
        <li class="breadcrumb-item">
          <a href="${crumb.url}">${crumb.name}</a>
        </li>
      `;
      })
      .join('');

    return `
    <nav aria-label="breadcrumb" class="breadcrumbs-container">
      <div class="container">
        <ol class="breadcrumbs">
          ${items}
        </ol>
      </div>
    </nav>
    `;
  },

  /**
   * Mount breadcrumbs to DOM
   */
  mount(elementId = 'breadcrumbs-root', customBreadcrumbs = null) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = this.render(customBreadcrumbs);
    }
  },

  /**
   * Initialize
   */
  init(customBreadcrumbs = null) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () =>
        this.mount('breadcrumbs-root', customBreadcrumbs)
      );
    } else {
      this.mount('breadcrumbs-root', customBreadcrumbs);
    }
  },
};

// Auto-inicializar si existe el elemento
if (document.getElementById('breadcrumbs-root')) {
  BreadcrumbsComponent.init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BreadcrumbsComponent;
}
