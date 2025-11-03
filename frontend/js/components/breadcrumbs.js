/**
 * Breadcrumbs Component
 * Navegación contextual para todas las páginas
 */

class Breadcrumbs {
  constructor(options = {}) {
    this.options = {
      container: '.breadcrumbs-container',
      homeLabel: 'Inicio',
      separator: '/',
      showHome: true,
      generateFromPath: true,
      ...options,
    };

    this.breadcrumbsData = this.getBreadcrumbsData();
    this.init();
  }

  init() {
    if (this.options.generateFromPath) {
      this.generateFromPath();
    }
    this.render();
  }

  getBreadcrumbsData() {
    // Mapeo de rutas a breadcrumbs
    const pathMap = {
      '/': [{ label: 'Inicio', url: '/' }],
      '/index.html': [{ label: 'Inicio', url: '/index.html' }],
      '/pages/products.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Productos', url: '/pages/products.html' },
      ],
      '/pages/about.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Nosotros', url: '/pages/about.html' },
      ],
      '/pages/contact.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Contacto', url: '/pages/contact.html' },
      ],
      '/pages/cart.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Carrito', url: '/pages/cart.html' },
      ],
      '/pages/checkout.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Carrito', url: '/pages/cart.html' },
        { label: 'Checkout', url: '/pages/checkout.html' },
      ],
      '/pages/wishlist.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Mi Lista', url: '/pages/wishlist.html' },
      ],
      '/pages/orders.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Mi Cuenta', url: '/pages/profile.html' },
        { label: 'Pedidos', url: '/pages/orders.html' },
      ],
      '/pages/profile.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Mi Cuenta', url: '/pages/profile.html' },
      ],
      '/pages/blog.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Blog', url: '/pages/blog.html' },
      ],
      '/pages/gallery.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Galería', url: '/pages/gallery.html' },
      ],
      '/pages/faq.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Preguntas Frecuentes', url: '/pages/faq.html' },
      ],
      '/pages/testimonials.html': [
        { label: 'Inicio', url: '/index.html' },
        { label: 'Testimonios', url: '/pages/testimonials.html' },
      ],
    };

    const currentPath = window.location.pathname;
    return pathMap[currentPath] || this.generateFromPath();
  }

  generateFromPath() {
    const path = window.location.pathname;
    const segments = path.split('/').filter((s) => s && s !== 'index.html');

    if (segments.length === 0) {
      return [{ label: this.options.homeLabel, url: '/' }];
    }

    const breadcrumbs = [];

    if (this.options.showHome) {
      breadcrumbs.push({ label: this.options.homeLabel, url: '/index.html' });
    }

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Limpiar nombre del segmento
      let label = segment
        .replace('.html', '')
        .replace(/-/g, ' ')
        .replace(/_/g, ' ');

      // Capitalizar
      label = label
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        url: isLast ? null : currentPath,
      });
    });

    return breadcrumbs;
  }

  render() {
    const container = document.querySelector(this.options.container);
    if (!container || this.breadcrumbsData.length <= 1) return;

    const nav = document.createElement('nav');
    nav.className = 'breadcrumbs';
    nav.setAttribute('aria-label', 'Breadcrumb');

    const ol = document.createElement('ol');
    ol.className = 'breadcrumbs-list';
    ol.setAttribute('itemscope', '');
    ol.setAttribute('itemtype', 'https://schema.org/BreadcrumbList');

    this.breadcrumbsData.forEach((crumb, index) => {
      const li = document.createElement('li');
      li.className = 'breadcrumb-item';
      li.setAttribute('itemprop', 'itemListElement');
      li.setAttribute('itemscope', '');
      li.setAttribute('itemtype', 'https://schema.org/ListItem');

      if (crumb.url && index < this.breadcrumbsData.length - 1) {
        const link = document.createElement('a');
        link.href = crumb.url;
        link.textContent = crumb.label;
        link.className = 'breadcrumb-link';
        link.setAttribute('itemprop', 'item');

        const span = document.createElement('span');
        span.setAttribute('itemprop', 'name');
        span.textContent = crumb.label;
        link.innerHTML = '';
        link.appendChild(span);

        li.appendChild(link);
      } else {
        const span = document.createElement('span');
        span.className = 'breadcrumb-current';
        span.setAttribute('itemprop', 'name');
        span.textContent = crumb.label;
        span.setAttribute('aria-current', 'page');
        li.appendChild(span);
      }

      const position = document.createElement('meta');
      position.setAttribute('itemprop', 'position');
      position.setAttribute('content', (index + 1).toString());
      li.appendChild(position);

      ol.appendChild(li);

      // Agregar separador
      if (index < this.breadcrumbsData.length - 1) {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.setAttribute('aria-hidden', 'true');
        separator.textContent = this.options.separator;
        ol.appendChild(separator);
      }
    });

    nav.appendChild(ol);
    container.appendChild(nav);
  }

  static autoInit() {
    const container = document.querySelector('.breadcrumbs-container');
    if (container) {
      new Breadcrumbs();
    }
  }
}

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
  Breadcrumbs.autoInit();
});

// Exportar para compatibilidad con módulos, pero también como global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Breadcrumbs;
}
