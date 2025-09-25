// Migrado de componente web personalizado a módulo ES6
/**
 * Componente web personalizado para el encabezado del sitio
 * @class Header
 * @extends HTMLElement
 */
class Header extends HTMLElement {
  /**
     * Se ejecuta cuando el elemento se conecta al DOM
     * Renderiza el contenido del encabezado
     */
  connectedCallback() {
    // Verificar si Font Awesome ya está cargado
    const isFontAwesomeLoaded = document.querySelector('link[href*="font-awesome"]') || 
                                   document.querySelector('link[href*="fontawesome"]') ||
                                   document.querySelector('link[href*="cdnjs.cloudflare.com/ajax/libs/font-awesome"]');
        
    // Si Font Awesome no está cargado, cargarlo
    if (!isFontAwesomeLoaded) {
      const fontAwesomeLink = document.createElement('link');
      fontAwesomeLink.rel = 'stylesheet';
      fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      fontAwesomeLink.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
      fontAwesomeLink.crossOrigin = 'anonymous';
      fontAwesomeLink.referrerPolicy = 'no-referrer';
      document.head.appendChild(fontAwesomeLink);
    }
        
    this.innerHTML = this.render();
        
    // Configurar la interactividad después de renderizar
    setTimeout(() => {
      this.setupInteractivity();
    }, 0);
  }
    
  /**
   * Renderiza el contenido completo del header
   * @returns {string} HTML del header
   */
  render() {
    return `
      <header>
        <div class="navbar">
          ${this.renderLogo()}
          ${this.renderNavigation()}
          ${this.renderIcons()}
        </div>
      </header>
    `;
  }

  /**
   * Renderiza el logo del sitio
   * @returns {string} HTML del logo
   */
  renderLogo() {
    return `
      <div class="logo">
        <a href="/index.html" aria-label="Arreglos Florales Victoria - Inicio">
          <img src="/assets/images/logo.png" alt="Logo de Arreglos Florales Victoria" width="150" height="150">
        </a>
      </div>
    `;
  }

  /**
   * Renderiza la navegación principal
   * @returns {string} HTML de la navegación
   */
  renderNavigation() {
    return `
      <nav>
        <ul class="nav-links">
          <li><a href="/index.html" class="nav-link" data-page="home">Inicio</a></li>
          <li><a href="/pages/products.html" class="nav-link" data-page="products">Productos</a></li>
          <li><a href="/pages/about.html" class="nav-link" data-page="about">Nosotros</a></li>
          <li><a href="/pages/contact.html" class="nav-link" data-page="contact">Contacto</a></li>
        </ul>
      </nav>
    `;
  }

  /**
   * Renderiza los iconos de navegación
   * @returns {string} HTML de los iconos
   */
  renderIcons() {
    return `
      <div class="nav-icons">
        ${this.renderMobileToggle()}
        ${this.renderThemeToggle()}
        ${this.renderCartIcon()}
        ${this.renderUserMenu()}
        ${this.renderLoginLink()}
      </div>
    `;
  }

  /**
   * Renderiza el botón de menú móvil
   * @returns {string} HTML del botón de menú móvil
   */
  renderMobileToggle() {
    return `
      <button id="nav-toggle" class="nav-icon" aria-label="Menú" aria-expanded="false">
        <i class="fas fa-bars"></i>
      </button>
    `;
  }

  /**
   * Renderiza el botón de cambio de tema
   * @returns {string} HTML del botón de cambio de tema
   */
  renderThemeToggle() {
    return `
      <button id="theme-toggle" class="nav-icon" aria-label="Cambiar a modo oscuro">
        <i class="fas fa-moon"></i>
      </button>
    `;
  }

  /**
   * Renderiza el icono del carrito de compras
   * @returns {string} HTML del icono del carrito
   */
  renderCartIcon() {
    return `
      <button id="cart-icon" class="nav-icon" aria-label="Carrito de compras">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count">0</span>
      </button>
    `;
  }

  /**
   * Renderiza el menú de usuario
   * @returns {string} HTML del menú de usuario
   */
  renderUserMenu() {
    return `
      <div class="user-menu">
        <button class="user-info nav-icon" aria-haspopup="true" aria-expanded="false">
          <img id="userProfileImage" src="" alt="Foto de perfil" style="display: none; width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
          <i class="fas fa-user"></i>
        </button>
        <ul class="user-dropdown">
          <li><a href="/pages/profile.html"><i class="fas fa-user-circle"></i> Perfil</a></li>
          <li><a href="/pages/orders.html"><i class="fas fa-box"></i> Mis Pedidos</a></li>
          <li><a href="/pages/wishlist.html"><i class="fas fa-heart"></i> Lista de Deseos</a></li>
          <li><a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a></li>
        </ul>
      </div>
    `;
  }

  /**
   * Renderiza el enlace de inicio de sesión
   * @returns {string} HTML del enlace de inicio de sesión
   */
  renderLoginLink() {
    return `
      <a href="/pages/login.html" id="login-link" class="nav-icon" aria-label="Iniciar sesión" style="display: none;">
        <i class="fas fa-sign-in-alt"></i>
      </a>
    `;
  }
    
  /**
     * Configura la interactividad del header
     */
  setupInteractivity() {
    // Toggle de navegación para móviles
    const navToggle = this.querySelector('#nav-toggle');
    const navLinks = this.querySelector('.nav-links');
        
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('show');
      });
    }
        
    // Toggle de tema
    const themeToggle = this.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
                
        // Cambiar el icono y el aria-label
        const themeIcon = themeToggle.querySelector('i');
        if (themeIcon) {
          if (newTheme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
          } else {
            themeIcon.className = 'fas fa-moon';
            themeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
          }
        }
      });
    }
        
    // Carrito de compras
    const cartIcon = this.querySelector('#cart-icon');
    if (cartIcon) {
      cartIcon.addEventListener('click', () => {
        // Emitir evento personalizado para mostrar el carrito
        document.dispatchEvent(new CustomEvent('showCart'));
      });
    }
        
    // Dropdown de usuario
    const userInfo = this.querySelector('.user-info');
    const userDropdown = this.querySelector('.user-dropdown');
        
    if (userInfo && userDropdown) {
      userInfo.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = userInfo.getAttribute('aria-expanded') === 'true';
        userInfo.setAttribute('aria-expanded', !isExpanded);
        userDropdown.classList.toggle('show');
      });
            
      // Cerrar el dropdown al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!userInfo.contains(e.target)) {
          userInfo.setAttribute('aria-expanded', 'false');
          userDropdown.classList.remove('show');
        }
      });
            
      // Cerrar el dropdown al presionar Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          userInfo.setAttribute('aria-expanded', 'false');
          userDropdown.classList.remove('show');
        }
      });
    }
        
    // Configurar cierre de sesión
    const logoutLink = this.querySelector('#logout-link');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/pages/login.html';
      });
    }
  }
}

// Registrar el componente personalizado para que pueda ser usado en el HTML
if (!customElements.get('site-header')) {
  customElements.define('site-header', Header);
}
export default Header;