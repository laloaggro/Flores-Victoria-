/**
 * Header Component - Unified header for all pages
 * Usage: Include this script in your HTML and add <div id="header-root"></div>
 */

const HeaderComponent = {
  render() {
    const currentPath = window.location.pathname;
    const isActive = (path) => (currentPath.includes(path) ? 'active' : '');

    return `
    <header class="site-header">
        <div class="container">
            <nav class="main-nav">
                <div class="logo">
                    <a href="/index.html">
                        <span>Flores Victoria</span>
                    </a>
                </div>
                
                <button class="mobile-menu-toggle" aria-label="Abrir menú">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <ul class="nav-menu">
                    <li><a href="/index.html" class="${isActive('index.html') || currentPath === '/'}">Inicio</a></li>
                    <li><a href="/pages/products.html" class="${isActive('products')}">Productos</a></li>
                    <li><a href="/pages/gallery.html" class="${isActive('gallery')}">Galería</a></li>
                    <li><a href="/pages/about.html" class="${isActive('about')}">Nosotros</a></li>
                    <li><a href="/pages/blog.html" class="${isActive('blog')}">Blog</a></li>
                    <li><a href="/pages/contact.html" class="${isActive('contact')}">Contacto</a></li>
                </ul>
                
                <div class="nav-actions">
                    <button class="cart-toggle" aria-label="Carrito">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-count">0</span>
                    </button>
                    <button class="wishlist-toggle" aria-label="Favoritos">
                        <i class="fas fa-heart"></i>
                        <span class="wishlist-count">0</span>
                    </button>
                </div>
            </nav>
        </div>
    </header>
    `;
  },

  mount(elementId = 'header-root') {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = this.render();
      this.attachEventListeners();
    } else {
      console.warn(`Header mount point #${elementId} not found`);
    }
  },

  attachEventListeners() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
      });
    }
  },

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.mount());
    } else {
      this.mount();
    }
  },
};

HeaderComponent.init();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderComponent;
}
