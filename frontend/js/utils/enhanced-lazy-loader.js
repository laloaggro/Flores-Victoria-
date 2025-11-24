/**
 * Enhanced Lazy Loading para Flores Victoria
 * Implementa lazy loading inteligente con Intersection Observer
 * y fallback para navegadores sin soporte nativo
 */

class EnhancedLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      enableNativeLazy: options.enableNativeLazy !== false,
      placeholderClass: options.placeholderClass || 'lazy-placeholder',
      loadedClass: options.loadedClass || 'lazy-loaded',
      errorClass: options.errorClass || 'lazy-error',
    };

    this.observer = null;
    this.supportsNativeLazy = 'loading' in HTMLImageElement.prototype;
    
    this.init();
  }

  init() {
    // Si el navegador soporta loading="lazy" nativo, úsalo
    if (this.supportsNativeLazy && this.options.enableNativeLazy) {
      console.log('✅ Usando lazy loading nativo del navegador');
      this.setupNativeLazy();
      return;
    }

    // Fallback: Intersection Observer para navegadores antiguos
    if ('IntersectionObserver' in window) {
      console.log('✅ Usando Intersection Observer para lazy loading');
      this.setupIntersectionObserver();
    } else {
      console.warn('⚠️ Navegador sin soporte lazy loading, cargando todas las imágenes');
      this.loadAllImages();
    }
  }

  setupNativeLazy() {
    // El navegador maneja el lazy loading automáticamente
    // Solo necesitamos mejorar la experiencia con placeholders
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    lazyImages.forEach(img => {
      if (!img.complete) {
        img.classList.add(this.options.placeholderClass);
      }

      img.addEventListener('load', () => {
        img.classList.remove(this.options.placeholderClass);
        img.classList.add(this.options.loadedClass);
      });

      img.addEventListener('error', () => {
        img.classList.add(this.options.errorClass);
      });
    });
  }

  setupIntersectionObserver() {
    const observerConfig = {
      root: null,
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, observerConfig);

    // Observar todas las imágenes lazy
    this.observeImages();
  }

  observeImages() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
    
    lazyImages.forEach(img => {
      img.classList.add(this.options.placeholderClass);
      this.observer.observe(img);
    });
  }

  loadImage(img) {
    // Cargar imagen desde data-src si existe
    const src = img.dataset.src || img.src;
    const srcset = img.dataset.srcset;

    img.classList.add('lazy-loading');

    if (srcset) {
      img.srcset = srcset;
    }

    if (src && src !== img.src) {
      img.src = src;
    }

    img.addEventListener('load', () => {
      img.classList.remove(this.options.placeholderClass);
      img.classList.remove('lazy-loading');
      img.classList.add(this.options.loadedClass);
      delete img.dataset.src;
      delete img.dataset.srcset;
    }, { once: true });

    img.addEventListener('error', () => {
      img.classList.remove('lazy-loading');
      img.classList.add(this.options.errorClass);
      console.error('Error cargando imagen lazy:', src);
    }, { once: true });
  }

  loadAllImages() {
    // Fallback: cargar todas las imágenes inmediatamente
    const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
    
    lazyImages.forEach(img => {
      this.loadImage(img);
    });
  }

  // Método público para agregar nuevas imágenes dinámicamente
  observe(images) {
    if (!this.observer) return;

    const imageArray = Array.isArray(images) ? images : [images];
    
    imageArray.forEach(img => {
      if (img.tagName === 'IMG') {
        img.classList.add(this.options.placeholderClass);
        this.observer.observe(img);
      }
    });
  }

  // Desconectar observer
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// CSS para placeholders (se inyecta si no existe)
const injectLazyStyles = () => {
  if (document.getElementById('lazy-loader-styles')) return;

  const style = document.createElement('style');
  style.id = 'lazy-loader-styles';
  style.textContent = `
    .lazy-placeholder {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: lazy-loading 1.5s infinite;
      min-height: 200px;
    }

    .lazy-loading {
      opacity: 0.6;
      transition: opacity 0.3s ease;
    }

    .lazy-loaded {
      animation: lazy-fade-in 0.5s ease;
    }

    .lazy-error {
      background: #f8d7da;
      border: 2px dashed #dc3545;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lazy-error::after {
      content: '⚠️ Error cargando imagen';
      color: #721c24;
      font-size: 0.9rem;
      padding: 1rem;
    }

    @keyframes lazy-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @keyframes lazy-fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Reducir animaciones si el usuario prefiere menos movimiento */
    @media (prefers-reduced-motion: reduce) {
      .lazy-placeholder {
        animation: none;
        background: #f0f0f0;
      }
      
      .lazy-loaded {
        animation: none;
      }
    }
  `;
  
  document.head.appendChild(style);
};

// Auto-inicializar si el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectLazyStyles();
    window.lazyLoader = new EnhancedLazyLoader();
  });
} else {
  injectLazyStyles();
  window.lazyLoader = new EnhancedLazyLoader();
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedLazyLoader;
}
