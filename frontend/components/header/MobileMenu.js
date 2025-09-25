// MobileMenu.js - Componente web para menú hamburguesa móvil

class MobileMenu extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
            <div class="mobile-menu">
                <button id="mobile-menu-toggle" class="mobile-menu-toggle" aria-label="Menú">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
                
                <div id="mobile-menu-overlay" class="mobile-menu-overlay">
                    <div class="mobile-menu-content">
                        <button id="mobile-menu-close" class="mobile-menu-close" aria-label="Cerrar menú">
                            <i class="fas fa-times"></i>
                        </button>
                        
                        <nav class="mobile-nav">
                            <ul class="mobile-nav-list">
                                <li><a href="../index.html" class="mobile-nav-link" data-page="home">Inicio</a></li>
                                <li><a href="./products.html" class="mobile-nav-link" data-page="products">Productos</a></li>
                                <li><a href="./about.html" class="mobile-nav-link" data-page="about">Nosotros</a></li>
                                <li><a href="./contact.html" class="mobile-nav-link" data-page="contact">Contacto</a></li>
                            </ul>
                        </nav>
                        
                        <div class="mobile-menu-footer">
                            <div class="mobile-user-actions">
                                <a href="./login.html" class="mobile-nav-link">
                                    <i class="fas fa-user"></i>
                                    Iniciar sesión
                                </a>
                                <a href="./cart.html" class="mobile-nav-link">
                                    <i class="fas fa-shopping-cart"></i>
                                    Carrito
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  setupEventListeners() {
    const menuToggle = this.querySelector('#mobile-menu-toggle');
    const menuClose = this.querySelector('#mobile-menu-close');
    const menuOverlay = this.querySelector('#mobile-menu-overlay');
    const mobileNavLinks = this.querySelectorAll('.mobile-nav-link');
        
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        this.toggleMenu();
      });
    }
        
    if (menuClose) {
      menuClose.addEventListener('click', () => {
        this.closeMenu();
      });
    }
        
    if (menuOverlay) {
      menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
          this.closeMenu();
        }
      });
    }
        
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    const menuOverlay = this.querySelector('#mobile-menu-overlay');
    const menuToggle = this.querySelector('#mobile-menu-toggle');
        
    if (this.isOpen) {
      if (menuOverlay) {
        menuOverlay.classList.add('active');
      }
      if (menuToggle) {
        menuToggle.classList.add('active');
      }
      document.body.classList.add('mobile-menu-open');
    } else {
      this.closeMenu();
    }
  }

  closeMenu() {
    this.isOpen = false;
    const menuOverlay = this.querySelector('#mobile-menu-overlay');
    const menuToggle = this.querySelector('#mobile-menu-toggle');
        
    if (menuOverlay) {
      menuOverlay.classList.remove('active');
    }
    if (menuToggle) {
      menuToggle.classList.remove('active');
    }
    document.body.classList.remove('mobile-menu-open');
  }
}

// Registrar el componente
customElements.define('mobile-menu', MobileMenu);

export default MobileMenu;