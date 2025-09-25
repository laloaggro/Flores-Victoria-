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
      fontAwesomeLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontAwesomeLink);
    }
        
    this.innerHTML = `
            <header>
                <div class="navbar">
                    <div class="logo">
                        <a href="/index.html" aria-label="Arreglos Florales Victoria - Inicio">
                            <img src="/assets/images/logo.png" alt="Logo de Arreglos Florales Victoria">
                        </a>
                        <span>Arreglos Florales Victoria</span>
                    </div>
                    
                    <nav>
                        <ul class="nav-links">
                            <li><a href="/index.html" class="nav-link" data-page="home">Inicio</a></li>
                            <li><a href="/pages/products.html" class="nav-link" data-page="products">Productos</a></li>
                            <li><a href="/pages/about.html" class="nav-link" data-page="about">Nosotros</a></li>
                            <li><a href="/pages/contact.html" class="nav-link" data-page="contact">Contacto</a></li>
                        </ul>
                    </nav>
                    
                    <div class="nav-icons">
                        <button id="nav-toggle" class="nav-icon" aria-label="Menú" aria-expanded="false">
                            <i class="fas fa-bars"></i>
                        </button>
                        
                        <button id="theme-toggle" class="nav-icon" aria-label="Cambiar a modo oscuro">
                            <i class="fas fa-moon"></i>
                        </button>
                        
                        <button id="cart-icon" class="nav-icon" aria-label="Carrito de compras">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count">0</span>
                        </button>
                        
                        <div class="user-menu">
                            <button class="user-menu-toggle nav-icon" aria-label="Menú de usuario" aria-haspopup="true" aria-expanded="false">
                                <span class="user-icon">👤</span>
                            </button>
                            <div class="user-dropdown">
                                <a href="/pages/login.html">Iniciar sesión</a>
                                <a href="/pages/register.html">Registrarse</a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;
        
    // Configurar la interactividad después de renderizar
    this.setupInteractivity();
    
    // Verificar el estado de autenticación después de renderizar
    setTimeout(() => {
      this.setupUserMenu();
    }, 100);
  }
    
  /**
     * Verifica y corrige la consistencia del estado del menú de usuario
     */
  checkUserMenuState() {
    const userMenuToggle = this.querySelector('.user-menu-toggle');
    const userDropdown = this.querySelector('.user-dropdown');
    
    if (userMenuToggle && userDropdown) {
      const isExpanded = userDropdown.classList.contains('show');
      userMenuToggle.setAttribute('aria-expanded', isExpanded.toString());
    }
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
        
    // Configurar menú de usuario
    this.setupUserMenu();
  }
  
  /**
   * Configura el menú de usuario
   */
  setupUserMenu() {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    let isAuthenticated = false;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        isAuthenticated = payload.exp > currentTime;
      } catch (e) {
        isAuthenticated = false;
      }
    }
    
    const userMenuToggle = this.querySelector('.user-menu-toggle');
    const userDropdown = this.querySelector('.user-dropdown');
    
    if (userMenuToggle && userDropdown) {
      // Configurar el menú de usuario según el estado de autenticación
      if (isAuthenticated) {
        this.updateUserMenuForAuthenticatedUser(token);
      } else {
        this.updateUserMenuForGuestUser();
      }
      
      // Configurar eventos del menú de usuario
      this.setupUserMenuEvents();
    }
  }
  
  /**
   * Actualiza el menú de usuario para un usuario autenticado
   * @param {string} token - Token JWT del usuario
   */
  updateUserMenuForAuthenticatedUser(token) {
    const userMenuToggle = this.querySelector('.user-menu-toggle');
    const userDropdown = this.querySelector('.user-dropdown');
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = {
        name: payload.name || payload.username || 'Usuario',
        email: payload.email || '',
        role: payload.role || 'user'
      };
      
      // Actualizar el contenido del botón de menú de usuario
      userMenuToggle.innerHTML = `
        <div class="user-avatar">
          <span class="user-initials">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
        </div>
        <span class="user-name-desktop">${user.name || 'Usuario'}</span>
      `;
      
      // Actualizar el contenido del dropdown
      userDropdown.innerHTML = `
        <div class="user-info-dropdown">
          <div class="user-avatar-large">
            <span class="user-initials-large">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div class="user-details">
            <span class="user-name">${user.name || 'Usuario'}</span>
            <span class="user-email">${user.email || ''}</span>
          </div>
        </div>
        <div class="dropdown-divider"></div>
        <a href="/pages/profile.html" role="menuitem">
          <i class="fas fa-user-circle"></i>
          <span>Mi perfil</span>
        </a>
        <a href="/pages/orders.html" role="menuitem">
          <i class="fas fa-box"></i>
          <span>Mis pedidos</span>
        </a>
        ${user.role === 'admin' ? `
          <div class="dropdown-divider"></div>
          <a href="/pages/admin.html" role="menuitem">
            <i class="fas fa-cog"></i>
            <span>Panel de administración</span>
          </a>
        ` : ''}
        <div class="dropdown-divider"></div>
        <button id="logout-btn" class="logout-btn" role="menuitem">
          <i class="fas fa-sign-out-alt"></i>
          <span>Cerrar sesión</span>
        </button>
      `;
      
      // Configurar el cierre de sesión
      const logoutBtn = userDropdown.querySelector('#logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('token');
          window.location.href = '/index.html';
        });
      }
    } catch (e) {
      console.error('Error al actualizar el menú de usuario:', e);
      this.updateUserMenuForGuestUser();
    }
  }
  
  /**
   * Actualiza el menú de usuario para un usuario invitado
   */
  updateUserMenuForGuestUser() {
    const userMenuToggle = this.querySelector('.user-menu-toggle');
    const userDropdown = this.querySelector('.user-dropdown');
    
    userMenuToggle.innerHTML = '<span class="user-icon">👤</span>';
    userDropdown.innerHTML = `
      <a href="/pages/login.html">Iniciar sesión</a>
      <a href="/pages/register.html">Registrarse</a>
    `;
  }
  
  /**
   * Configura los eventos del menú de usuario
   */
  setupUserMenuEvents() {
    const userMenuToggle = this.querySelector('.user-menu-toggle');
    const userDropdown = this.querySelector('.user-dropdown');
    
    if (userMenuToggle && userDropdown) {
      // Manejar clic en el botón de menú de usuario
      userMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        userDropdown.classList.toggle('show');
      });
      
      // Cerrar dropdown al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('show');
        }
      });
      
      // Cerrar dropdown al presionar Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          userDropdown.classList.remove('show');
        }
      });
      
      // Escuchar cambios en el estado de autenticación
      document.addEventListener('authStatusChanged', () => {
        this.setupUserMenu();
      });
    }
  }
}

// Registrar el componente personalizado para que pueda ser usado en el HTML
customElements.define('site-header', Header);

export default Header;