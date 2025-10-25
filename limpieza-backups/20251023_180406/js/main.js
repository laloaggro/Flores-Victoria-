/**
 * FloresVictoriaApp - Sistema de gestión completo para el sitio web
 * Implementa patrones modernos de JavaScript, accesibilidad y rendimiento
 */
class FloresVictoriaApp {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('fv_cart')) || [];
    this.favorites = JSON.parse(localStorage.getItem('fv_favorites')) || [];
    this.searchHistory = JSON.parse(localStorage.getItem('fv_search_history')) || [];
    this.analytics = this.initAnalytics();
    this.performance = this.initPerformanceMonitoring();
    this.accessibility = this.initAccessibility();
    
    this.components = {
      navigation: null,
      search: null,
      cart: null,
      forms: null,
      modal: null,
      gallery: null,
      animations: null
    };

    this.init();
  }

  /**
   * Inicialización principal de la aplicación
   */
  init() {
    console.log('🌺 Flores Victoria - Iniciando aplicación...');
    
    // Configurar componentes base
    this.initNavigation();
    this.initSearch();
    this.initCart();
    this.initForms();
    this.initModal();
    this.initGallery();
    this.initAnimations();
    this.initScrollEffects();
    this.initLazyLoading();
    this.initServiceWorker();
    
    // Configurar eventos globales
    this.setupGlobalEvents();
    this.setupKeyboardNavigation();
    this.updateCartDisplay();
    
    console.log('✅ Aplicación inicializada correctamente');
  }

  /**
   * Sistema de navegación avanzado
   */
  initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('a[href^="#"]');

    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        const isActive = mainNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Accesibilidad
        menuToggle.setAttribute('aria-expanded', isActive);
        mainNav.setAttribute('aria-hidden', !isActive);
        
        // Prevenir scroll del body cuando el menú está abierto
        document.body.style.overflow = isActive ? 'hidden' : '';
        
        this.analytics.track('navigation_toggle', { action: isActive ? 'open' : 'close' });
      });
    }

    // Navegación suave con historial
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        this.smoothScrollTo(targetId);
        this.closeMenu();
      });
    });

    this.components.navigation = { menuToggle, mainNav, navLinks };
  }

  /**
   * Sistema de búsqueda inteligente
   */
  initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    const searchButton = document.querySelector('.search-button');

    if (searchInput) {
      let searchTimeout;
      
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        searchTimeout = setTimeout(() => {
          if (query.length >= 2) {
            this.performSearch(query);
          } else {
            this.clearSearchResults();
          }
        }, 300);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.performSearch(searchInput.value.trim());
        }
      });
    }

    this.components.search = { searchInput, searchResults, searchButton };
  }

  /**
   * Sistema de carrito de compras avanzado
   */
  initCart() {
    const cartButtons = document.querySelectorAll('.add-to-cart');
    const cartToggle = document.querySelector('.cart-toggle');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartClose = document.querySelector('.cart-close');

    cartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card, .collection-card');
        if (productCard) {
          const product = this.extractProductData(productCard);
          this.addToCart(product);
        }
      });
    });

    if (cartToggle && cartSidebar) {
      cartToggle.addEventListener('click', () => this.toggleCart());
    }

    if (cartClose) {
      cartClose.addEventListener('click', () => this.closeCart());
    }

    this.components.cart = { cartButtons, cartToggle, cartSidebar, cartClose };
  }

  /**
   * Sistema de formularios con validación avanzada
   */
  initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const formValidator = new FormValidator(form);
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (formValidator.validate()) {
          await this.submitForm(form);
        }
      });

      // Validación en tiempo real
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => formValidator.validateField(input));
        input.addEventListener('input', () => formValidator.clearFieldError(input));
      });
    });

    this.components.forms = { forms };
  }

  /**
   * Sistema de modal reutilizable
   */
  initModal() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal');
        this.openModal(modalId);
      });
    });

    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    this.components.modal = { modalTriggers };
  }

  /**
   * Galería de imágenes con lazy loading
   */
  initGallery() {
    const galleryImages = document.querySelectorAll('.gallery-image, .product-image');
    
    galleryImages.forEach(img => {
      img.addEventListener('click', () => {
        this.openImageModal(img.src, img.alt);
      });

      // Lazy loading con Intersection Observer
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
              }
            }
          });
        });

        if (img.dataset.src) {
          imageObserver.observe(img);
        }
      }
    });

    this.components.gallery = { galleryImages };
  }

  /**
   * Sistema de animaciones basado en scroll
   */
  initAnimations() {
    const animatedElements = document.querySelectorAll(
      '.collection-card, .feature-card, .testimonial-card, .fade-in, .slide-up'
    );

    // Configurar estilos iniciales
    animatedElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    // Intersection Observer para animaciones
    if ('IntersectionObserver' in window) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            animationObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      animatedElements.forEach(element => {
        animationObserver.observe(element);
      });
    }

    this.components.animations = { animatedElements };
  }

  /**
   * Efectos de scroll avanzados
   */
  initScrollEffects() {
    let ticking = false;

    const updateScrollEffects = () => {
      const scrollY = window.pageYOffset;
      const header = document.querySelector('.main-header');
      
      if (header) {
        if (scrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Parallax effect
      const parallaxElements = document.querySelectorAll('.parallax');
      parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${scrollY * speed}px)`;
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    });
  }

  /**
   * Lazy loading para imágenes y contenido
   */
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyElements = document.querySelectorAll('[data-src], [data-background]');
      
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            
            if (element.dataset.src) {
              element.src = element.dataset.src;
              element.removeAttribute('data-src');
            }
            
            if (element.dataset.background) {
              element.style.backgroundImage = `url(${element.dataset.background})`;
              element.removeAttribute('data-background');
            }
            
            element.classList.add('loaded');
            lazyObserver.unobserve(element);
          }
        });
      });

      lazyElements.forEach(element => lazyObserver.observe(element));
    }
  }

  /**
   * Service Worker para caching
   */
  initServiceWorker() {
    // Evitar caché agresiva durante desarrollo local
    const isLocalDev = ['localhost', '127.0.0.1'].includes(location.hostname);
    if ('serviceWorker' in navigator && !isLocalDev) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registrado:', registration);
        })
        .catch(error => {
          console.log('❌ Error al registrar Service Worker:', error);
        });
    } else if (isLocalDev) {
      console.info('ℹ️ SW deshabilitado en desarrollo local para evitar cachés obsoletos');
      // Intentar desregistrar cualquier SW previo en entorno local
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg) {
            reg.unregister().then(() => console.info('🧹 SW anterior desregistrado en entorno local'));
          }
        }).catch(() => {});
      }
    }
  }

  /**
   * Configurar eventos globales
   */
  setupGlobalEvents() {
    // Redimensionar ventana
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));

    // Cambio de visibilidad de página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.analytics.track('page_hidden');
      } else {
        this.analytics.track('page_visible');
      }
    });

    // Detectar conexión de red
    window.addEventListener('online', () => {
      this.showNotification('Conexión restaurada', 'success');
    });

    window.addEventListener('offline', () => {
      this.showNotification('Sin conexión a internet', 'warning');
    });
  }

  /**
   * Navegación por teclado para accesibilidad
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Tab trap para modales
      if (document.querySelector('.modal.active')) {
        this.handleModalTabTrap(e);
      }

      // Navegación rápida
      if (e.altKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            this.focusElement('main-nav');
            break;
          case '2':
            e.preventDefault();
            this.focusElement('main-content');
            break;
          case '3':
            e.preventDefault();
            this.focusElement('search-input');
            break;
          case 'c':
            e.preventDefault();
            this.toggleCart();
            break;
        }
      }
    });
  }

  /**
   * Métodos de utilidad y helpers
   */
  smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Actualizar URL sin recargar
      history.pushState(null, null, targetId);
      
      this.analytics.track('smooth_scroll', { target: targetId });
    }
  }

  closeMenu() {
    const mainNav = document.querySelector('.main-nav');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (mainNav && mainNav.classList.contains('active')) {
      mainNav.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  performSearch(query) {
    if (!query) return;
    
    // Guardar en historial
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      this.searchHistory = this.searchHistory.slice(0, 10);
      localStorage.setItem('fv_search_history', JSON.stringify(this.searchHistory));
    }

    // Simular búsqueda (en producción sería una llamada a API)
    const results = this.mockSearch(query);
    this.displaySearchResults(results);
    
    this.analytics.track('search', { query, results: results.length });
  }

  mockSearch(query) {
    const mockData = [
      { title: 'Ramos de Rosas', type: 'product', url: '/productos/ramos-rosas' },
      { title: 'Arreglos para Bodas', type: 'service', url: '/servicios/bodas' },
      { title: 'Flores de Temporada', type: 'category', url: '/categoria/temporada' }
    ];

    return mockData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  displaySearchResults(results) {
    const searchResults = document.querySelector('.search-results');
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML = '<p class="no-results">No se encontraron resultados</p>';
    } else {
      const resultsHTML = results.map(result => `
        <a href="${result.url}" class="search-result-item">
          <span class="result-title">${result.title}</span>
          <span class="result-type">${result.type}</span>
        </a>
      `).join('');
      
      searchResults.innerHTML = resultsHTML;
    }

    searchResults.style.display = 'block';
  }

  clearSearchResults() {
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
      searchResults.style.display = 'none';
      searchResults.innerHTML = '';
    }
  }

  extractProductData(productCard) {
    return {
      id: productCard.dataset.productId || Date.now(),
      name: productCard.querySelector('.product-title, .card-title')?.textContent || 'Producto',
      price: productCard.querySelector('.price')?.textContent || '0',
      image: productCard.querySelector('img')?.src || '',
      quantity: 1
    };
  }

  addToCart(product) {
    const existingProduct = this.cart.find(item => item.id === product.id);
    
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      this.cart.push({ ...product });
    }

    localStorage.setItem('fv_cart', JSON.stringify(this.cart));
    this.updateCartDisplay();
    this.showNotification(`${product.name} agregado al carrito`, 'success');
    
    this.analytics.track('add_to_cart', { 
      product_id: product.id, 
      product_name: product.name,
      price: product.price
    });
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    localStorage.setItem('fv_cart', JSON.stringify(this.cart));
    this.updateCartDisplay();
    this.showNotification('Producto eliminado del carrito', 'info');
  }

  updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.querySelector('.cart-total');
    
    if (cartCount) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }

    if (cartTotal) {
      const total = this.cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[^\d.-]/g, '')) || 0;
        return sum + (price * item.quantity);
      }, 0);
      cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    this.updateCartSidebar();
  }

  updateCartSidebar() {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    if (this.cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    } else {
      cartItems.innerHTML = this.cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <p class="cart-item-price">${item.price}</p>
            <div class="cart-item-quantity">
              <button class="quantity-btn minus" data-action="decrease">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-btn plus" data-action="increase">+</button>
            </div>
          </div>
          <button class="remove-item" data-product-id="${item.id}">&times;</button>
        </div>
      `).join('');

      // Agregar event listeners para los botones de cantidad
      this.setupCartItemListeners();
    }
  }

  setupCartItemListeners() {
    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('.cart-item').dataset.productId;
        const action = e.target.dataset.action;
        this.updateCartItemQuantity(productId, action);
      });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        this.removeFromCart(productId);
      });
    });
  }

  updateCartItemQuantity(productId, action) {
    const product = this.cart.find(item => item.id == productId);
    if (!product) return;

    if (action === 'increase') {
      product.quantity += 1;
    } else if (action === 'decrease' && product.quantity > 1) {
      product.quantity -= 1;
    }

    localStorage.setItem('fv_cart', JSON.stringify(this.cart));
    this.updateCartDisplay();
  }

  toggleCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    if (cartSidebar) {
      const isActive = cartSidebar.classList.toggle('active');
      document.body.style.overflow = isActive ? 'hidden' : '';
      
      if (isActive) {
        this.updateCartSidebar();
        cartSidebar.focus();
      }
    }
  }

  closeCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    if (cartSidebar) {
      cartSidebar.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  async submitForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Mostrar loading
    const submitButton = form.querySelector('[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;

    try {
      // Simular envío (en producción sería una llamada real a API)
      await this.delay(2000);
      
      this.showNotification('¡Mensaje enviado correctamente!', 'success');
      form.reset();
      
      this.analytics.track('form_submit', { 
        form_type: form.className,
        success: true
      });
      
    } catch (error) {
      this.showNotification('Error al enviar el mensaje. Inténtalo de nuevo.', 'error');
      this.analytics.track('form_submit', { 
        form_type: form.className,
        success: false,
        error: error.message
      });
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  openModal(modalId, content = null) {
    let modal = document.getElementById(modalId);
    
    if (!modal) {
      modal = this.createModal(modalId, content);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    this.analytics.track('modal_open', { modal_id: modalId });
  }

  closeModal() {
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      activeModal.classList.remove('active');
      document.body.style.overflow = '';
      this.analytics.track('modal_close', { modal_id: activeModal.id });
    }
  }

  createModal(modalId, content) {
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-overlay" data-close-modal></div>
      <div class="modal-content">
        <button class="modal-close" data-close-modal>&times;</button>
        <div class="modal-body">${content || ''}</div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners para cerrar
    modal.querySelectorAll('[data-close-modal]').forEach(element => {
      element.addEventListener('click', () => this.closeModal());
    });

    return modal;
  }

  openImageModal(src, alt) {
    const content = `
      <div class="image-modal-content">
        <img src="${src}" alt="${alt}" class="modal-image">
        <p class="image-caption">${alt}</p>
      </div>
    `;
    this.openModal('image-modal', content);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Auto-close después de 5 segundos
    setTimeout(() => {
      notification.remove();
    }, 5000);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });

    // Animación de entrada
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
  }

  handleResize() {
    // Recalcular animaciones si es necesario
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    // Lógica de redimensionamiento
  }

  handleModalTabTrap(e) {
    const modal = document.querySelector('.modal.active');
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  focusElement(elementId) {
    const element = document.getElementById(elementId) || document.querySelector(`.${elementId}`);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Sistemas de monitoreo y analytics
   */
  initAnalytics() {
    return {
      events: [],
      track: (event, data = {}) => {
        const eventData = {
          event,
          data,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        };
        
        this.analytics.events.push(eventData);
        console.log('📊 Analytics:', eventData);
        
        // En producción, enviar a servicio de analytics
        // this.sendToAnalytics(eventData);
      }
    };
  }

  initPerformanceMonitoring() {
    return {
      startTime: performance.now(),
      
      measureLCP: () => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('🎯 LCP:', lastEntry.startTime);
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
      },
      
      measureFID: () => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              console.log('⚡ FID:', entry.processingStart - entry.startTime);
            });
          });
          
          observer.observe({ entryTypes: ['first-input'] });
        }
      },
      
      measureCLS: () => {
        if ('PerformanceObserver' in window) {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            console.log('📐 CLS:', clsValue);
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });
        }
      }
    };
  }

  initAccessibility() {
    return {
      announceToScreenReader: (message) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      },
      
      checkColorContrast: () => {
        // Implementar verificación de contraste de colores
      },
      
      manageFocus: () => {
        // Gestión avanzada del foco
      }
    };
  }

  /**
   * Utilidades generales
   */
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  throttle(func, delay) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Validador de formularios avanzado
 */
class FormValidator {
  constructor(form) {
    this.form = form;
    this.rules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[1-9][\d]{0,15}$/,
      name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/
    };
  }

  validate() {
    let isValid = true;
    const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;

    // Limpiar errores previos
    this.clearFieldError(field);

    // Validar campo requerido
    if (field.hasAttribute('required') && !value) {
      this.showFieldError(field, 'Este campo es obligatorio');
      return false;
    }

    // Validaciones específicas por tipo
    if (value) {
      if (type === 'email' && !this.rules.email.test(value)) {
        this.showFieldError(field, 'Ingresa un email válido');
        return false;
      }

      if (name === 'phone' && !this.rules.phone.test(value)) {
        this.showFieldError(field, 'Ingresa un teléfono válido');
        return false;
      }

      if (name === 'name' && !this.rules.name.test(value)) {
        this.showFieldError(field, 'Ingresa un nombre válido');
        return false;
      }

      if (field.minLength && value.length < field.minLength) {
        this.showFieldError(field, `Mínimo ${field.minLength} caracteres`);
        return false;
      }
    }

    return true;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'field-error';
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.floresVictoriaApp = new FloresVictoriaApp();
});

// Hacer disponibles algunas funciones globalmente para compatibilidad
window.FloresVictoria = {
  app: null,
  init: () => {
    if (!window.FloresVictoria.app) {
      window.FloresVictoria.app = new FloresVictoriaApp();
    }
    return window.FloresVictoria.app;
  }
};
