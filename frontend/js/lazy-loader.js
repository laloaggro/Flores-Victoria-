/**
 * Aggressive Lazy Loading System
 * Carga diferida inteligente para mejorar FCP
 */

class LazyLoader {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    // Solo procesar si hay soporte para IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      this.loadAllImages();
      return;
    }

    const options = {
      root: null,
      rootMargin: '50px', // Cargar 50px antes de que sea visible
      threshold: 0.01,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.observeImages();
  }

  observeImages() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach((img) => this.observer.observe(img));
  }

  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      delete img.dataset.srcset;
    }
    img.classList.add('loaded');
  }

  loadAllImages() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach((img) => this.loadImage(img));
  }
}

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LazyLoader());
} else {
  new LazyLoader();
}

// Optimización adicional: Prefetch en hover
document.addEventListener(
  'mouseover',
  (e) => {
    const link = e.target.closest('a[href]');
    if (link && link.href && link.origin === location.origin) {
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = link.href;
      document.head.appendChild(prefetchLink);
    }
  },
  { passive: true, capture: true }
);
