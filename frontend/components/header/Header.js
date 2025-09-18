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
                        <a href="index.html" aria-label="Arreglos Florales Victoria - Inicio">
                            <img src="/assets/images/logo.png" alt="Logo de Arreglos Florales Victoria" width="150" height="150">
                        </a>
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
                        
                        <a href="/pages/login.html" id="login-link" class="nav-icon" aria-label="Iniciar sesión">
                            <i class="fas fa-sign-in-alt"></i>
                        </a>
                    </div>
                </div>
            </header>
        `;
        
    // Configurar la interactividad después de renderizar
    setTimeout(() => {
      this.setupInteractivity();
    }, 0);
  }
    
  /**
     * Verifica y corrige la consistencia del estado del menú de usuario
     */
  checkUserMenuState() {
    const userInfo = this.querySelector('.user-info');
    const userDropdown = this.querySelector('.user-dropdown');
    
    if (userInfo && userDropdown) {
      const isExpanded = userDropdown.classList.contains('show');
      userInfo.setAttribute('aria-expanded', isExpanded.toString());
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
        
    // Dropdown de usuario
    const userInfo = this.querySelector('.user-info');
    const userDropdown = this.querySelector('.user-dropdown');
    const loginLink = this.querySelector('#login-link');
        
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
        
    // Mostrar el menú de usuario o el enlace de login según corresponda
    if (isAuthenticated) {
      if (userInfo) userInfo.style.display = 'flex';
      if (loginLink) loginLink.style.display = 'none';
    } else {
      if (userInfo) userInfo.style.display = 'none';
      if (loginLink) loginLink.style.display = 'flex';
    }
        
    // Asegurar que el enlace de login funcione correctamente
    if (loginLink) {
      loginLink.addEventListener('click', function(e) {
        // Prevenir el comportamiento predeterminado y redirigir manualmente
        e.preventDefault();
        window.location.href = '/pages/login.html';
      });
    }
        
    if (userInfo && userDropdown) {
      // Asegurarnos de que el dropdown esté oculto inicialmente
      userDropdown.classList.remove('show');
      
      // Asegurarnos de que el atributo aria-expanded esté correctamente inicializado
      userInfo.setAttribute('aria-expanded', 'false');
      
      userInfo.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault(); // Prevenir comportamiento predeterminado
        
        const isExpanded = userInfo.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;
        
        // Actualizar el atributo aria-expanded con el nuevo estado
        userInfo.setAttribute('aria-expanded', newState.toString());
        
        // Alternar la clase 'show' en el dropdown
        if (isExpanded) {
          userDropdown.classList.remove('show');
        } else {
          userDropdown.classList.add('show');
        }
        
        console.log('User menu clicked. Expanded:', newState);
      });
            
      // Cerrar el dropdown al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!userInfo.contains(e.target) && userDropdown.classList.contains('show')) {
          userInfo.setAttribute('aria-expanded', 'false');
          userDropdown.classList.remove('show');
        }
      });
            
      // Cerrar el dropdown al presionar Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && userDropdown.classList.contains('show')) {
          userInfo.setAttribute('aria-expanded', 'false');
          userDropdown.classList.remove('show');
        }
      });
      
      // Asegurarnos de que el estado se mantenga consistente si la ventana cambia de tamaño
      window.addEventListener('resize', () => {
        if (userDropdown.classList.contains('show')) {
          userInfo.setAttribute('aria-expanded', 'true');
        } else {
          userInfo.setAttribute('aria-expanded', 'false');
        }
      });
    } else {
      // Si no se encuentran los elementos, mostrar un mensaje de error
      console.warn('No se pudieron encontrar los elementos del menú de usuario');
    }
    
    // Verificar el estado inicial del menú de usuario
    setTimeout(() => {
      this.checkUserMenuState();
    }, 0);
    
    // Configurar cierre de sesión
    const logoutLink = this.querySelector('#logout-link');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/index.html';
      });
    }
  }
}

// Registrar el componente personalizado para que pueda ser usado en el HTML
customElements.define('site-header', Header);

export default Header;