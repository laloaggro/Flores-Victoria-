/**
 * Image Optimizer Utility
 * 
 * Mejora el rendimiento de carga de imágenes mediante:
 * - Lazy loading con Intersection Observer
 * - Soporte para WebP con fallback
 * - Placeholders blur-up
 * - Dimensiones responsivas
 * 
 * Uso:
 *   const optimizer = new ImageOptimizer();
 *   optimizer.init();
 */

class ImageOptimizer {
  constructor(options = {}) {
    this.options = {
      // Threshold para empezar a cargar (0 = inmediato, 1 = 100% visible)
      rootMargin: '50px 0px', // Precargar 50px antes de entrar en viewport
      threshold: 0.01,
      
      // Placeholders
      usePlaceholder: true,
      placeholderClass: 'img-loading',
      loadedClass: 'img-loaded',
      
      // WebP support
      supportsWebP: null,
      
      // Selectores
      selector: 'img[data-src], img[loading="lazy"]',
      ...options
    };
    
    this.observer = null;
    this.images = [];
  }
  
  /**
   * Inicializar optimizador
   */
  async init() {
    // Detectar soporte WebP
    this.options.supportsWebP = await this.checkWebPSupport();
    
    // Configurar Intersection Observer
    this.setupObserver();
    
    // Observar todas las imágenes
    this.observeImages();
    
    // Agregar estilos de placeholders
    this.injectStyles();
    
    console.log(`🖼️ ImageOptimizer inicializado (${this.images.length} imágenes)`);
  }
  
  /**
   * Detectar soporte para WebP
   */
  async checkWebPSupport() {
    if (this.options.supportsWebP !== null) {
      return this.options.supportsWebP;
    }
    
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = function() {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
  
  /**
   * Configurar Intersection Observer
   */
  setupObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: cargar todas las imágenes inmediatamente
      console.warn('⚠️ IntersectionObserver no soportado, cargando todas las imágenes');
      this.images.forEach(img => this.loadImage(img));
      return;
    }
    
    const options = {
      root: null,
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }
  
  /**
   * Observar imágenes lazy
   */
  observeImages() {
    this.images = Array.from(document.querySelectorAll(this.options.selector));
    
    this.images.forEach(img => {
      // Agregar clase de placeholder si está habilitada
      if (this.options.usePlaceholder) {
        img.classList.add(this.options.placeholderClass);
      }
      
      // Observar la imagen
      if (this.observer) {
        this.observer.observe(img);
      } else {
        // Fallback: cargar inmediatamente
        this.loadImage(img);
      }
    });
  }
  
  /**
   * Cargar imagen
   */
  loadImage(img) {
    // Si ya se cargó, ignorar
    if (img.classList.contains(this.options.loadedClass)) {
      return;
    }
    
    // Obtener URL de la imagen
    let src = img.dataset.src || img.src;
    
    // Si hay soporte WebP y existe versión WebP, usarla
    if (this.options.supportsWebP && img.dataset.srcWebp) {
      src = img.dataset.srcWebp;
    }
    
    // Precargar imagen
    const tempImg = new Image();
    
    tempImg.onload = () => {
      // Asignar src
      img.src = src;
      
      // Si tiene srcset, aplicarlo
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      
      // Remover placeholder y agregar clase de cargado
      img.classList.remove(this.options.placeholderClass);
      img.classList.add(this.options.loadedClass);
      
      // Disparar evento custom
      img.dispatchEvent(new CustomEvent('imageLoaded', { 
        detail: { src, webp: this.options.supportsWebP }
      }));
    };
    
    tempImg.onerror = () => {
      console.error(`❌ Error cargando imagen: ${src}`);
      img.classList.add('img-error');
    };
    
    tempImg.src = src;
  }
  
  /**
   * Inyectar estilos CSS para placeholders
   */
  injectStyles() {
    if (document.getElementById('image-optimizer-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'image-optimizer-styles';
    style.textContent = `
      /* Image Optimizer Styles */
      .img-loading {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        min-height: 200px;
      }
      
      .img-loaded {
        animation: fadeIn 0.3s ease-in;
      }
      
      .img-error {
        background: #f5f5f5;
        border: 2px dashed #ccc;
        position: relative;
      }
      
      .img-error::after {
        content: '⚠️ Error cargando imagen';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #999;
        font-size: 0.875rem;
      }
      
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      /* Reducir animaciones si usuario prefiere menos movimiento */
      @media (prefers-reduced-motion: reduce) {
        .img-loading {
          animation: none;
          background: #f0f0f0;
        }
        
        .img-loaded {
          animation: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Refrescar observer (útil para contenido dinámico)
   */
  refresh() {
    // Desconectar observer actual
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Re-observar imágenes
    this.observeImages();
  }
  
  /**
   * Destruir optimizer
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.images = [];
  }
}

// Auto-inicializar si DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.imageOptimizer = new ImageOptimizer();
    window.imageOptimizer.init();
  });
} else {
  window.imageOptimizer = new ImageOptimizer();
  window.imageOptimizer.init();
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageOptimizer;
}
