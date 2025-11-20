/**
 * ============================================================================
 * Header Component - Unified Navigation Header
 * ============================================================================
 *
 * Componente de header unificado para todas las páginas del sitio.
 * Proporciona navegación consistente, menú móvil responsive y acciones de usuario.
 *
 * @module HeaderComponent
 * @version 2.0.0
 * @requires Font Awesome 6+ (para iconos)
 *
 * Uso:
 *   1. Agregar en HTML: <div id="header-root"></div>
 *   2. Incluir este script: <script src="/js/components/header-component.js"></script>
 *   3. El componente se auto-inicializa al cargar la página
 *
 * Características:
 *   - Navegación responsive con menú hamburguesa en móvil
 *   - Destacado automático de la página activa
 *   - Integración con carrito de compras y wishlist
 *   - Accesibilidad con ARIA labels
 *   - Auto-inicialización
 */

// Evitar redeclaración si ya está definido (ej. cargado por loader dinámico y por etiqueta <script>)
if (globalThis.HeaderComponent) {
  console.warn('⚠️ HeaderComponent ya está definido — se omite la redeclaración');
} else {
  const HeaderComponent = {
    // ========================================
    // Configuración
    // ========================================

    /**
     * Configuración del componente
     */
    config: {
      mountPoint: 'header-root',
      enableAutoInit: true,
      navItems: [
        { label: 'Inicio', path: '/index.html', page: 'home' },
        { label: 'Productos', path: '/pages/products.html', page: 'products' },
        { label: 'Galería', path: '/pages/gallery.html', page: 'gallery' },
        { label: 'Nosotros', path: '/pages/about.html', page: 'about' },
        { label: 'Blog', path: '/pages/blog.html', page: 'blog' },
        { label: 'Contacto', path: '/pages/contact.html', page: 'contact' },
      ],
    },

    // ========================================
    // Estado interno
    // ========================================

    state: {
      isMobileMenuOpen: false,
      cartCount: 0,
      wishlistCount: 0,
    },

    // ========================================
    // Métodos de utilidad
    // ========================================

    /**
     * Determina si una ruta está activa
     * @param {string} path - Ruta a verificar
     * @returns {string} Clase CSS 'active' o cadena vacía
     */
    isActive(path) {
      const currentPath = (globalThis.location && globalThis.location.pathname) || '';

      // Caso especial para home/index
      if (path === '/index.html' || path.includes('home')) {
        return currentPath === '/' || currentPath.includes('index.html') ? 'active' : '';
      }

      // Para otras páginas, verificar si la ruta actual incluye el identificador
      return currentPath.includes(path) ? 'active' : '';
    },

    /**
     * Genera el markup del logo
     * @returns {string} HTML del logo
     */
    renderLogo() {
      return `
      <div class="logo">
        <a href="/index.html" aria-label="Ir a inicio">
          <img src="/logo.svg" alt="Flores Victoria" width="40" height="40" loading="eager">
          <span class="logo-text">Flores Victoria</span>
        </a>
      </div>
    `;
    },

    /**
     * Genera el markup del menú de navegación
     * @returns {string} HTML del menú
     */
    renderNavMenu() {
      const navItems = this.config.navItems
        .map(
          (item) => `
      <li>
        <a href="${item.path}" 
           class="nav-link ${this.isActive(item.page)}" 
           data-page="${item.page}">
          ${item.label}
        </a>
      </li>
    `
        )
        .join('');

      return `
      <nav class="main-nav" role="navigation" aria-label="Navegación principal">
        <ul class="nav-menu">
          ${navItems}
        </ul>
      </nav>
    `;
    },

    /**
     * Genera el markup del botón de menú móvil
     * @returns {string} HTML del botón hamburguesa
     */
    renderMobileToggle() {
      return `
      <button class="mobile-menu-toggle" 
              aria-label="Abrir menú de navegación" 
              aria-expanded="false"
              aria-controls="nav-menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    `;
    },

    /**
     * Genera el markup de las acciones del header
     * @returns {string} HTML de las acciones (carrito, wishlist, etc.)
     */
    renderActions() {
      // Check if user is authenticated
      const isAuthenticated =
        globalThis.AuthService &&
        typeof globalThis.AuthService.isAuthenticated === 'function' &&
        globalThis.AuthService.isAuthenticated();
      const user =
        isAuthenticated && typeof globalThis.AuthService.getCurrentUser === 'function'
          ? globalThis.AuthService.getCurrentUser()
          : null;
      const userName = user ? user.name || (user.email || '').split('@')[0] : '';
      const isAdmin = user && Array.isArray(user.roles) && user.roles.includes('admin');

      return `
      <div class="header-actions">
        <button class="search-btn" 
                aria-label="Buscar productos" 
                title="Buscar (Ctrl+K)">
          <i class="fas fa-search" aria-hidden="true"></i>
        </button>
        
        <button class="theme-toggle" 
                aria-label="Cambiar tema de color">
          <span class="theme-icon">🌙</span>
        </button>
        
        <a href="/pages/wishlist.html" 
           class="wishlist-btn" 
           aria-label="Ver lista de deseos">
          <i class="fas fa-heart" aria-hidden="true"></i>
          <span class="wishlist-count">${this.state.wishlistCount}</span>
        </a>
        
        <button class="cart-toggle cart-btn" 
                aria-label="Ver carrito de compras">
          <i class="fas fa-shopping-cart" aria-hidden="true"></i>
          <span class="cart-count">${this.state.cartCount}</span>
        </button>
        
        <div class="user-menu">
          <button class="user-menu-toggle" aria-label="Menú de usuario">
            ${
              isAuthenticated
                ? `<span class="user-icon" title="${userName}">👤</span>`
                : '<i class="fas fa-user"></i>'
            }
          </button>
          <div class="user-dropdown">
                  ${
                    user && Array.isArray(user.roles) && user.roles.includes('worker')
                      ? `
                    <a href="/pages/worker/products.html" class="user-dropdown-item admin-panel-btn" style="background:#009688;color:#fff;font-weight:600;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                      <i class="fas fa-warehouse"></i>
                      <span>Panel de Productos y Stock</span>
                    </a>
                  `
                      : ''
                  }
            ${
              isAuthenticated
                ? `
              <div class="user-dropdown-header">
                <strong>${userName}</strong>
                <small style="color: #999;">${user.email}</small>
              </div>
              <div class="user-dropdown-divider"></div>
              <a href="/pages/account.html" class="user-dropdown-item">
                <i class="fas fa-user"></i>
                <span>Mi Cuenta</span>
              </a>
              <a href="/pages/wishlist.html" class="user-dropdown-item">
                <i class="fas fa-heart"></i>
                <span>Mi Lista de Deseos</span>
              </a>
              <a href="/pages/account.html#orders" class="user-dropdown-item">
                <i class="fas fa-box"></i>
                <span>Mis Pedidos</span>
              </a>
              <a href="/pages/account.html#addresses" class="user-dropdown-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>Mis Direcciones</span>
              </a>
              ${
                isAdmin
                  ? `
                <div class="user-dropdown-divider"></div>
                <div class="user-dropdown-divider"></div>
                <div style="padding:8px 0;">
                  <a href="/admin-site/owner-dashboard.html" class="user-dropdown-item admin-panel-btn" style="background:#C2185B;color:#fff;font-weight:600;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-tools"></i>
                    <span>Panel Principal Admin</span>
                  </a>
                  ${
                    user && Array.isArray(user.roles) && user.roles.includes('owner')
                      ? `
                    <a href="/pages/owner/dashboard.html" class="user-dropdown-item admin-panel-btn" style="background:#388E3C;color:#fff;font-weight:600;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                      <i class="fas fa-chart-line"></i>
                      <span>Dashboard Dueño</span>
                    </a>
                  `
                      : ''
                  }
                  ${
                    user && Array.isArray(user.roles) && user.roles.includes('worker')
                      ? `
                    <a href="/admin-site/worker-tools.html" class="user-dropdown-item admin-panel-btn" style="background:#1976D2;color:#fff;font-weight:600;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                      <i class="fas fa-user-cog"></i>
                      <span>Herramientas de Trabajador</span>
                    </a>
                    <a href="/pages/worker/dashboard.html" class="user-dropdown-item admin-panel-btn" style="background:#FBC02D;color:#222;font-weight:600;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                      <i class="fas fa-briefcase"></i>
                      <span>Dashboard Trabajador</span>
                    </a>
                  `
                      : ''
                  }
                  ${
                    user && Array.isArray(user.roles) && user.roles.includes('accounting')
                      ? `
                    <a href="/pages/accounting/dashboard.html" class="user-dropdown-item admin-panel-btn" style="background:#6D4C41;color:#fff;font-weight:600;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                      <i class="fas fa-file-invoice-dollar"></i>
                      <span>Dashboard Contabilidad</span>
                    </a>
                  `
                      : ''
                  }
                  <a href="/pages/dev/errors.html" class="user-dropdown-item admin-panel-btn" style="background:#D32F2F;color:#fff;font-weight:600;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-life-ring"></i>
                    <span>Ayuda & Errores</span>
                  </a>
                  <a href="/pages/owner/dashboard.html#reportes" class="user-dropdown-item admin-panel-btn" style="background:#0288D1;color:#fff;font-weight:600;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-chart-pie"></i>
                    <span>Reportes & Métricas</span>
                  </a>
                </div>
              `
                  : ''
              }
              <div class="user-dropdown-divider"></div>
              <a href="#" class="user-dropdown-item" onclick="event.preventDefault(); window.AuthService.logout();">
                <i class="fas fa-sign-out-alt"></i>
                <span>Cerrar Sesión</span>
              </a>
            `
                : `
              <a href="/pages/login.html" class="user-dropdown-item">
                <i class="fas fa-sign-in-alt"></i>
                <span>Iniciar Sesión</span>
              </a>
              <a href="/pages/register.html" class="user-dropdown-item">
                <i class="fas fa-user-plus"></i>
                <span>Crear Cuenta</span>
              </a>
            `
            }
          </div>
        </div>
      </div>
    `;
    },

    // ========================================
    // Render principal
    // ========================================

    /**
     * Genera el HTML completo del header
     * @returns {string} HTML del header completo
     */
    render() {
      return `
      <header class="header" role="banner">
        <div class="container">
          <div class="header-content">
            ${this.renderLogo()}
            ${this.renderNavMenu()}
            ${this.renderMobileToggle()}
            ${this.renderActions()}
          </div>
        </div>
      </header>
    `;
    },

    // ========================================
    // Event Listeners
    // ========================================

    /**
     * Maneja el toggle del menú móvil
     */
    handleMobileMenuToggle() {
      const toggle = document.querySelector('.mobile-menu-toggle');
      const menu = document.querySelector('.nav-menu');

      if (!toggle || !menu) return;

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;

        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        toggle.setAttribute('aria-expanded', this.state.isMobileMenuOpen);

        // Prevenir scroll del body cuando el menú está abierto
        document.body.style.overflow = this.state.isMobileMenuOpen ? 'hidden' : '';
      });

      // Cerrar menú al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (this.state.isMobileMenuOpen && !toggle.contains(e.target) && !menu.contains(e.target)) {
          toggle.click();
        }
      });
    },

    /**
     * Maneja el toggle del menú de usuario
     */
    handleUserMenuToggle() {
      const toggle = document.querySelector('.user-menu-toggle');
      const dropdown = document.querySelector('.user-dropdown');

      if (!toggle || !dropdown) return;

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      // Cerrar menú al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });
    },

    /**
     * Adjunta todos los event listeners necesarios
     */
    attachEventListeners() {
      this.handleMobileMenuToggle();
      this.handleUserMenuToggle();

      // Event listener para búsqueda
      const searchBtn = document.querySelector('.search-btn');
      if (searchBtn && typeof globalThis.toggleSearch === 'function') {
        searchBtn.addEventListener('click', globalThis.toggleSearch);
      }

      // Event listener para theme toggle
      const themeToggle = document.querySelector('.theme-toggle');
      if (themeToggle && typeof globalThis.toggleTheme === 'function') {
        themeToggle.addEventListener('click', globalThis.toggleTheme);
      }
    },

    // ========================================
    // Lifecycle methods
    // ========================================

    /**
     * Monta el componente en el DOM
     * @param {string} elementId - ID del elemento donde montar
     */
    mount(elementId = this.config.mountPoint) {
      const element = document.getElementById(elementId);

      if (!element) {
        console.warn(`⚠️ Header: Mount point #${elementId} not found`);
        return;
      }

      // Renderizar HTML
      element.innerHTML = this.render();

      // Adjuntar event listeners
      this.attachEventListeners();

      // Escuchar eventos de cart y wishlist
      this.listenToCartEvents();

      // Actualizar contadores si hay datos en localStorage
      this.updateCounters();

      console.log('✅ Header component mounted successfully');
    },

    /**
     * Actualiza los contadores de carrito y wishlist
     */
    updateCounters() {
      try {
        // Actualizar desde localStorage si existe
        const cartData =
          localStorage.getItem('flores_victoria_cart') || localStorage.getItem('cart');
        const wishlistData =
          localStorage.getItem('flores_victoria_wishlist') || localStorage.getItem('wishlist');

        if (cartData) {
          const cart = JSON.parse(cartData);
          this.state.cartCount = cart.length || 0;
          const cartCountEl = document.querySelector('.cart-count');
          if (cartCountEl) {
            cartCountEl.textContent = this.state.cartCount;
            cartCountEl.style.display = this.state.cartCount > 0 ? 'inline-block' : 'none';
          }
        }

        if (wishlistData) {
          const wishlist = JSON.parse(wishlistData);
          this.state.wishlistCount = wishlist.length || 0;
          const wishlistCountEl = document.querySelector('.wishlist-count');
          if (wishlistCountEl) {
            wishlistCountEl.textContent = this.state.wishlistCount;
            wishlistCountEl.style.display = this.state.wishlistCount > 0 ? 'inline-block' : 'none';
          }
        }
      } catch (error) {
        console.error('Error updating counters:', error);
      }
    },

    /**
     * Escucha eventos de actualización de cart y wishlist
     */
    listenToCartEvents() {
      // Evento de actualización del carrito
      globalThis.addEventListener('cartUpdated', (e) => {
        this.state.cartCount = e.detail?.count || 0;
        const cartCountEl = document.querySelector('.cart-count');
        if (cartCountEl) {
          cartCountEl.textContent = this.state.cartCount;
          cartCountEl.style.display = this.state.cartCount > 0 ? 'inline-block' : 'none';
        }
      });

      // Evento de actualización de wishlist
      globalThis.addEventListener('wishlistUpdated', (e) => {
        this.state.wishlistCount = e.detail?.count || 0;
        const wishlistCountEl = document.querySelector('.wishlist-count');
        if (wishlistCountEl) {
          wishlistCountEl.textContent = this.state.wishlistCount;
          wishlistCountEl.style.display = this.state.wishlistCount > 0 ? 'inline-block' : 'none';
        }
      });

      // Evento de cambio de autenticación - Recargar header
      globalThis.addEventListener('authChange', () => {
        this.mount(); // Recargar el header con el nuevo estado de auth
      });
    },

    /**
     * Inicializa el componente
     */
    init() {
      if (!this.config.enableAutoInit) return;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.mount());
      } else {
        this.mount();
      }
    },

    /**
     * Destruye el componente y limpia event listeners
     */
    destroy() {
      const mountPoint = document.getElementById(this.config.mountPoint);
      if (mountPoint) {
        mountPoint.innerHTML = '';
      }

      // Limpiar estado
      this.state = {
        isMobileMenuOpen: false,
        cartCount: 0,
        wishlistCount: 0,
      };
    },
  };

  // ========================================
  // Auto-inicialización
  // ========================================
  HeaderComponent.init();

  // ========================================
  // Export para uso en módulos
  // ========================================
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderComponent;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.HeaderComponent = HeaderComponent;
  }
} // end guard
