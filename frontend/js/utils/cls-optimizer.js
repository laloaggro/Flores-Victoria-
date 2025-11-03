/**
 * CLS (Cumulative Layout Shift) Optimizer
 * 
 * Reduce el Layout Shift reservando espacio para:
 * - Imágenes antes de cargar
 * - Elementos dinámicos
 * - Fonts con font-display: swap
 * 
 * Meta: CLS < 0.1 (actualmente 0.154)
 */

class CLSOptimizer {
  constructor() {
    this.shifts = [];
    this.clsValue = 0;
  }
  
  /**
   * Inicializar optimizador
   */
  init() {
    this.fixImageDimensions();
    this.observeLayoutShifts();
    this.optimizeFonts();
    this.reserveDynamicSpace();
    
    console.log('📐 CLS Optimizer inicializado');
  }
  
  /**
   * Agregar dimensiones explícitas a imágenes sin ellas
   */
  fixImageDimensions() {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    let fixed = 0;
    
    images.forEach(img => {
      // Si la imagen ya tiene aspect-ratio en CSS, skip
      const computedStyle = window.getComputedStyle(img);
      if (computedStyle.aspectRatio && computedStyle.aspectRatio !== 'auto') {
        return;
      }
      
      // Intentar obtener dimensiones del data-attribute
      const width = img.dataset.width;
      const height = img.dataset.height;
      
      if (width && height) {
        img.setAttribute('width', width);
        img.setAttribute('height', height);
        fixed++;
      } else {
        // Aplicar aspect-ratio CSS por defecto para productos
        if (img.closest('.product-card') || img.classList.contains('product-image')) {
          img.style.aspectRatio = '1 / 1';
          fixed++;
        } else if (img.closest('.hero')) {
          img.style.aspectRatio = '16 / 9';
          fixed++;
        }
      }
    });
    
    if (fixed > 0) {
      console.log(`✅ Dimensiones fijadas en ${fixed} imágenes`);
    }
  }
  
  /**
   * Observar Layout Shifts
   */
  observeLayoutShifts() {
    if (!('PerformanceObserver' in window)) {
      return;
    }
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            this.shifts.push(entry);
            this.clsValue += entry.value;
            
            // Log shifts problemáticos
            if (entry.value > 0.01) {
              console.warn(`⚠️ Layout Shift detectado: ${entry.value.toFixed(4)}`, {
                sources: entry.sources,
                value: entry.value,
              });
            }
          }
        }
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('⚠️ No se pudo observar layout shifts:', e);
    }
  }
  
  /**
   * Optimizar carga de fuentes
   */
  optimizeFonts() {
    // Agregar font-display: swap a fuentes de Google
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
      if (!link.href.includes('display=')) {
        link.href += '&display=swap';
      }
    });
  }
  
  /**
   * Reservar espacio para elementos dinámicos
   */
  reserveDynamicSpace() {
    // Mini-cart badge
    const miniCart = document.querySelector('.mini-cart');
    if (miniCart && !miniCart.style.minHeight) {
      miniCart.style.minHeight = '40px';
    }
    
    // Notification containers
    const notifications = document.querySelectorAll('.social-proof-container, .notification-container');
    notifications.forEach(container => {
      if (!container.style.minHeight) {
        container.style.minHeight = '80px';
      }
    });
    
    // Product grid placeholders
    const productGrid = document.querySelector('.products-grid, #products-container');
    if (productGrid && productGrid.children.length === 0) {
      // Reservar espacio para 12 productos (grid de 4 columnas)
      productGrid.style.minHeight = '800px';
    }
  }
  
  /**
   * Obtener CLS actual
   */
  getCLS() {
    return {
      value: this.clsValue,
      shifts: this.shifts.length,
      rating: this.clsValue < 0.1 ? 'good' : this.clsValue < 0.25 ? 'needs improvement' : 'poor',
    };
  }
  
  /**
   * Reportar CLS
   */
  report() {
    const cls = this.getCLS();
    console.log(`📊 CLS Report:`, {
      value: cls.value.toFixed(4),
      shifts: cls.shifts,
      rating: cls.rating,
      budget: 0.1,
      status: cls.value < 0.1 ? '✅ PASS' : '❌ FAIL',
    });
    
    return cls;
  }
}

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.clsOptimizer = new CLSOptimizer();
    window.clsOptimizer.init();
    
    // Reportar CLS después de 5 segundos (tiempo suficiente para cargas dinámicas)
    setTimeout(() => {
      if (window.clsOptimizer) {
        window.clsOptimizer.report();
      }
    }, 5000);
  });
} else {
  window.clsOptimizer = new CLSOptimizer();
  window.clsOptimizer.init();
  
  setTimeout(() => {
    if (window.clsOptimizer) {
      window.clsOptimizer.report();
    }
  }, 5000);
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CLSOptimizer;
}
