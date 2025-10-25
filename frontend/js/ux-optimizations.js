/**
 * 🎨 FLORES VICTORIA - OPTIMIZACIONES UX
 * ======================================
 * Sistema de lazy loading, animaciones al scroll y mejoras de rendimiento
 */

class UXEnhancements {
  constructor() {
    this.init();
  }

  init() {
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.setupLazyLoading();
    this.setupScrollAnimations();
    this.setupSmoothScroll();
    this.setupAccessibilityEnhancements();
    this.setupPerformanceOptimizations();
  }

  /**
   * Lazy Loading de imágenes con Intersection Observer
   */
  setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Cargar la imagen
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            
            // Agregar clase cuando se cargue
            img.addEventListener('load', () => {
              img.classList.add('loaded');
            });
            
            // Dejar de observar
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback para navegadores sin soporte
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        img.classList.add('loaded');
      });
    }
  }

  /**
   * Animaciones al hacer scroll
   */
  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            
            // Opcional: dejar de observar después de animar
            // animationObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
      });

      animatedElements.forEach(el => animationObserver.observe(el));
    } else {
      // Mostrar inmediatamente si no hay soporte
      animatedElements.forEach(el => {
        el.style.opacity = '1';
      });
    }
  }

  /**
   * Smooth scroll para enlaces internos
   */
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        
        // Ignorar enlaces vacíos
        if (href === '#' || href === '#!') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Actualizar URL sin saltar
          if (history.pushState) {
            history.pushState(null, null, href);
          }
          
          // Foco para accesibilidad
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /**
   * Mejoras de accesibilidad
   */
  setupAccessibilityEnhancements() {
    // Navegación por teclado mejorada
    this.setupKeyboardNavigation();
    
    // Skip to main content
    this.createSkipLink();
    
    // Anunciar cambios dinámicos
    this.setupLiveRegions();
    
    // Mejorar foco visible
    this.enhanceFocusVisibility();
  }

  setupKeyboardNavigation() {
    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Cerrar carrito
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar && cartSidebar.classList.contains('active')) {
          cartSidebar.classList.remove('active');
        }
        
        // Cerrar user dropdown
        const userDropdown = document.querySelector('.user-dropdown');
        if (userDropdown && userDropdown.classList.contains('active')) {
          userDropdown.classList.remove('active');
        }
      }
    });

    // Tab trapping en modales
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!activeModal) return;
      
      const focusableElements = activeModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    });
  }

  createSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Saltar al contenido principal';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--primary);
      color: white;
      padding: 8px 16px;
      text-decoration: none;
      z-index: 10000;
      border-radius: 0 0 4px 0;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Asegurar que el main tenga el ID correcto
    const main = document.querySelector('main') || document.querySelector('.hero').parentElement;
    if (main && !main.id) {
      main.id = 'main-content';
      main.setAttribute('tabindex', '-1');
    }
  }

  setupLiveRegions() {
    // Crear región live para anuncios
    if (!document.getElementById('aria-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);
    }
  }

  enhanceFocusVisibility() {
    // Detectar si el usuario está usando teclado
    let usingKeyboard = false;
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        usingKeyboard = true;
        document.body.classList.add('keyboard-nav');
      }
    });
    
    document.addEventListener('mousedown', () => {
      usingKeyboard = false;
      document.body.classList.remove('keyboard-nav');
    });
  }

  /**
   * Optimizaciones de rendimiento
   */
  setupPerformanceOptimizations() {
    // Preload de páginas importantes al hacer hover
    this.setupLinkPrefetch();
    
    // Debounce de eventos costosos
    this.setupDebouncedEvents();
    
    // Optimizar animaciones del carrito
    this.setupCartAnimations();
  }

  setupLinkPrefetch() {
    const importantLinks = document.querySelectorAll('a[href^="/pages/"]');
    
    importantLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const url = link.href;
        
        // Crear prefetch si no existe
        if (!document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = url;
          document.head.appendChild(prefetchLink);
        }
      }, { once: true });
    });
  }

  setupDebouncedEvents() {
    // Debounce para resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        window.dispatchEvent(new Event('debouncedResize'));
      }, 250);
    });
    
    // Debounce para scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        window.dispatchEvent(new Event('debouncedScroll'));
      }, 100);
    }, { passive: true });
  }

  setupCartAnimations() {
    // Animar contador del carrito al actualizar
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          const cartCount = document.querySelector('.cart-count');
          if (cartCount) {
            cartCount.classList.add('updated');
            setTimeout(() => {
              cartCount.classList.remove('updated');
            }, 600);
          }
        }
      });
    });
    
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      observer.observe(cartCount, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Utilidad: Anunciar mensaje a screen readers
   */
  announce(message, priority = 'polite') {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 3000);
    }
  }
}

// Inicializar automáticamente
const uxEnhancements = new UXEnhancements();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UXEnhancements;
}
