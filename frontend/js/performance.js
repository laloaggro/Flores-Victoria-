// ⚡ Image Lazy Loading & Optimization

class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.01,
      loadingClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',
      placeholderColor: '#f0f0f0',
      ...options
    };

    this.observer = null;
    this.images = [];
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold
        }
      );
    } else {
      // Fallback para navegadores antiguos
      this.loadAllImages();
    }

    this.observe();
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src) return;

    img.classList.add(this.options.loadingClass);

    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = src;
      if (srcset) img.srcset = srcset;
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.loadedClass);
      
      // Dispatch custom event
      img.dispatchEvent(new CustomEvent('lazyloaded', {
        detail: { src }
      }));
    };

    tempImg.onerror = () => {
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.errorClass);
      img.alt = 'Error al cargar imagen';
      
      // Set fallback image
      img.src = this.getFallbackImage();
    };

    tempImg.src = src;
    if (srcset) tempImg.srcset = srcset;
  }

  getFallbackImage() {
    // SVG placeholder
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle'%3EImagen no disponible%3C/text%3E%3C/svg%3E`;
  }

  observe() {
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach(img => {
      // Set placeholder
      if (!img.src) {
        img.src = this.generatePlaceholder(img);
      }

      if (this.observer) {
        this.observer.observe(img);
      } else {
        this.loadImage(img);
      }

      this.images.push(img);
    });
  }

  generatePlaceholder(img) {
    const width = img.dataset.width || 400;
    const height = img.dataset.height || 300;
    const color = this.options.placeholderColor;

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='${color}' width='${width}' height='${height}'/%3E%3C/svg%3E`;
  }

  loadAllImages() {
    this.images.forEach(img => this.loadImage(img));
  }

  refresh() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images = [];
    this.observe();
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images = [];
  }
}

// 🎨 Responsive Images Helper
class ResponsiveImages {
  static generateSrcset(baseUrl, sizes = [320, 640, 960, 1280, 1920]) {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  }

  static generateSizes(breakpoints = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw'
  }) {
    return `
      (max-width: 768px) ${breakpoints.mobile},
      (max-width: 1024px) ${breakpoints.tablet},
      ${breakpoints.desktop}
    `.trim();
  }

  static optimizeImage(url, options = {}) {
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width);
    if (options.height) params.set('h', options.height);
    if (options.quality) params.set('q', options.quality);
    if (options.format) params.set('fm', options.format);
    if (options.fit) params.set('fit', options.fit);

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }
}

// 📦 Code Splitting Helper
class CodeSplitter {
  static async loadModule(moduleName) {
    try {
      const module = await import(`/js/modules/${moduleName}.js`);
      return module.default || module;
    } catch (error) {
      console.error(`Error loading module ${moduleName}:`, error);
      return null;
    }
  }

  static async loadCSS(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  static async loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
}

// 💾 Cache Manager
class CacheManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'app-cache';
    this.ttl = options.ttl || 3600000; // 1 hour default
    this.maxSize = options.maxSize || 50; // max items
  }

  set(key, value, customTTL) {
    try {
      const cache = this.getAll();
      const ttl = customTTL || this.ttl;
      
      cache[key] = {
        value,
        timestamp: Date.now(),
        expiry: Date.now() + ttl
      };

      // Limit cache size
      const keys = Object.keys(cache);
      if (keys.length > this.maxSize) {
        const oldest = keys.reduce((a, b) => 
          cache[a].timestamp < cache[b].timestamp ? a : b
        );
        delete cache[oldest];
      }

      localStorage.setItem(this.storageKey, JSON.stringify(cache));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  get(key) {
    try {
      const cache = this.getAll();
      const item = cache[key];

      if (!item) return null;

      if (Date.now() > item.expiry) {
        this.delete(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  delete(key) {
    try {
      const cache = this.getAll();
      delete cache[key];
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  cleanup() {
    const cache = this.getAll();
    const now = Date.now();
    let cleaned = false;

    Object.keys(cache).forEach(key => {
      if (now > cache[key].expiry) {
        delete cache[key];
        cleaned = true;
      }
    });

    if (cleaned) {
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
    }
  }
}

// 🚀 Performance Monitor
class PerformanceMonitor {
  static measurePageLoad() {
    if (!window.performance) return null;

    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    return {
      pageLoadTime,
      connectTime,
      renderTime,
      domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart
    };
  }

  static markMilestone(name) {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  }

  static measureBetween(startMark, endMark, measureName) {
    if (window.performance && window.performance.measure) {
      try {
        window.performance.measure(measureName, startMark, endMark);
        const measure = window.performance.getEntriesByName(measureName)[0];
        return measure ? measure.duration : null;
      } catch (error) {
        console.error('Performance measure error:', error);
        return null;
      }
    }
    return null;
  }

  static logMetrics() {
    const metrics = this.measurePageLoad();
    if (metrics) {
      console.log('📊 Performance Metrics:');
      console.table(metrics);
    }
  }
}

// Inyectar estilos para lazy loading
const lazyStyles = `
img[data-src] {
  background: #f0f0f0;
  min-height: 200px;
}

img.lazy-loading {
  filter: blur(5px);
  transition: filter 0.3s;
}

img.lazy-loaded {
  filter: blur(0);
  animation: fadeIn 0.5s ease-out;
}

img.lazy-error {
  opacity: 0.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
`;

if (!document.getElementById('lazy-loading-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'lazy-loading-styles';
  styleSheet.textContent = lazyStyles;
  document.head.appendChild(styleSheet);
}

// Auto-init lazy loading
const lazyLoader = new LazyImageLoader();

// Auto-cleanup cache on page load
const cache = new CacheManager();
cache.cleanup();

// Log performance metrics in development
if (window.location.hostname === 'localhost') {
  window.addEventListener('load', () => {
    setTimeout(() => PerformanceMonitor.logMetrics(), 100);
  });
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LazyImageLoader,
    ResponsiveImages,
    CodeSplitter,
    CacheManager,
    PerformanceMonitor
  };
}

// Make available globally
window.lazyLoader = lazyLoader;
window.ResponsiveImages = ResponsiveImages;
window.CodeSplitter = CodeSplitter;
window.cache = cache;
window.PerformanceMonitor = PerformanceMonitor;
