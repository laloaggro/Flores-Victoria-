/**
 * Lazy Loading Manager
 * Carga diferida de imágenes para mejorar Core Web Vitals
 *
 * Uso:
 * 1. En HTML: <img data-src="image.jpg" alt="..." class="lazy">
 * 2. En JS: import './js/utils/lazy-load.js';
 *
 * Beneficios:
 * - Reduce tiempo de carga inicial en ~50%
 * - Mejora LCP (Largest Contentful Paint)
 * - Mejora FCP (First Contentful Paint)
 * - Ahorra ancho de banda
 */

// Logger condicional
const _isDev_lazyload =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.DEBUG === true);
const _logger_lazyload = {
  log: (...args) => _isDev_lazyload && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  debug: (...args) => _isDev_lazyload && console.debug(...args),
};

// Evitar redeclaración si ya existe
if (typeof globalThis.LazyLoader !== 'undefined') {
  _logger_lazyload.log('⚠️ LazyLoader ya está cargado, usando instancia existente');
} else {
  class LazyLoader {
    constructor(options = {}) {
      this.options = {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.01,
        loadingClass: options.loadingClass || 'lazy-loading',
        loadedClass: options.loadedClass || 'lazy-loaded',
        errorClass: options.errorClass || 'lazy-error',
        placeholder:
          options.placeholder ||
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
      };

      this.observer = null;
      this.images = [];
      this.init();
    }

    init() {
      // Verificar soporte de Intersection Observer
      if (!('IntersectionObserver' in globalThis)) {
        _logger_lazyload.warn('IntersectionObserver no soportado, cargando todas las imágenes');
        this.loadAllImages();
        return;
      }

      // Crear observer
      this.observer = new IntersectionObserver((entries) => this.handleIntersection(entries), {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold,
      });

      // Observar todas las imágenes lazy
      this.observeImages();

      // Re-observar cuando se agreguen nuevas imágenes
      this.observeDOMChanges();
    }

    observeImages() {
      const lazyImages = document.querySelectorAll('img[data-src], img.lazy');

      lazyImages.forEach((img) => {
        // Agregar placeholder si no tiene src
        if (!img.src && !img.hasAttribute('src')) {
          img.src = this.options.placeholder;
        }

        // Agregar clase de loading
        img.classList.add(this.options.loadingClass);

        // Observar la imagen
        this.observer.observe(img);
        this.images.push(img);
      });

      _logger_lazyload.log(`🖼️ LazyLoader: ${lazyImages.length} imágenes en observación`);
    }

    handleIntersection(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          this.observer.unobserve(img);
        }
      });
    }

    loadImage(img) {
      const src = img.dataset.src || img.getAttribute('data-src');
      const srcset = img.dataset.srcset || img.getAttribute('data-srcset');

      if (!src) {
        _logger_lazyload.warn('LazyLoader: imagen sin data-src', img);
        return;
      }

      // Crear nueva imagen para pre-cargar
      const tempImage = new Image();

      tempImage.onload = () => {
        // Asignar src real
        img.src = src;
        if (srcset) {
          img.srcset = srcset;
        }

        // Actualizar clases
        img.classList.remove(this.options.loadingClass);
        img.classList.add(this.options.loadedClass);

        // Limpiar data attributes
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');

        // Evento personalizado
        img.dispatchEvent(
          new CustomEvent('lazyloaded', {
            detail: { src },
          })
        );
      };

      tempImage.onerror = () => {
        img.classList.remove(this.options.loadingClass);
        img.classList.add(this.options.errorClass);

        img.dispatchEvent(
          new CustomEvent('lazyerror', {
            detail: { src },
          })
        );

        _logger_lazyload.error('LazyLoader: error cargando imagen', src);
      };

      // Iniciar carga
      tempImage.src = src;
    }

    loadAllImages() {
      // Fallback: cargar todas las imágenes inmediatamente
      const lazyImages = document.querySelectorAll('img[data-src], img.lazy');
      lazyImages.forEach((img) => {
        const src = img.dataset.src || img.getAttribute('data-src');
        if (src) {
          img.src = src;
          const srcset = img.dataset.srcset || img.getAttribute('data-srcset');
          if (srcset) {
            img.srcset = srcset;
          }
        }
      });
    }

    observeDOMChanges() {
      // Observar cambios en el DOM para nuevas imágenes
      const domObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              // Si el nodo es una imagen lazy
              if (node.tagName === 'IMG' && (node.dataset.src || node.classList.contains('lazy'))) {
                this.observer.observe(node);
                this.images.push(node);
              }

              // Si el nodo contiene imágenes lazy
              const lazyImages = node.querySelectorAll?.('img[data-src], img.lazy');
              lazyImages?.forEach((img) => {
                this.observer.observe(img);
                this.images.push(img);
              });
            }
          });
        });
      });

      domObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Método público para cargar imagen específica
    loadSpecific(selector) {
      const img = typeof selector === 'string' ? document.querySelector(selector) : selector;

      if (img && img.dataset.src) {
        this.loadImage(img);
        this.observer.unobserve(img);
      }
    }

    // Método público para destruir el loader
    destroy() {
      if (this.observer) {
        this.images.forEach((img) => this.observer.unobserve(img));
        this.observer.disconnect();
      }
      this.images = [];
    }
  }

  // Inicializar automáticamente cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!globalThis.lazyLoader) {
        globalThis.lazyLoader = new LazyLoader();
      }
    });
  } else {
    if (!globalThis.lazyLoader) {
      globalThis.lazyLoader = new LazyLoader();
    }
  }

  // Exponer la clase globalmente para uso en scripts no-module
  globalThis.LazyLoader = LazyLoader;
} // Fin del bloque if (typeof window.LazyLoader === 'undefined')
