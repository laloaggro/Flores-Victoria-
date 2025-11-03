/**
 * Lazy Images Component
 * 
 * Advanced lazy loading for images with:
 * - Intersection Observer API
 * - Blur-up effect (LQIP - Low Quality Image Placeholder)
 * - Progressive loading
 * - Fallback for older browsers
 * - Responsive images support
 * - Error handling with retry
 * 
 * Features:
 * - Automatic detection of images
 * - Multiple loading strategies
 * - Loading animation
 * - Fade-in effect
 * - WebP support with fallback
 * 
 * Usage:
 *   <img data-src="image.jpg" data-srcset="..." class="lazy" alt="...">
 *   
 *   LazyImages.init();
 */

class LazyImages {
  constructor(options = {}) {
    this.options = {
      selector: 'img.lazy, [data-lazy]',
      rootMargin: '50px',
      threshold: 0.01,
      enableBlurUp: true,
      fadeInDuration: 300,
      retryAttempts: 3,
      retryDelay: 1000,
      placeholderColor: '#f0f0f0',
      errorImage: '/images/placeholder-error.jpg',
      loadingClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',
    };
    
    Object.assign(this.options, options);
    
    this.observer = null;
    this.images = [];
    this.loadedCount = 0;
    this.errorCount = 0;
    this.supportsIntersectionObserver = 'IntersectionObserver' in window;
    this.supportsWebP = false;
  }
  
  /**
   * Initialize lazy loading
   */
  async init() {
    this.supportsWebP = await this.checkWebPSupport();
    this.images = document.querySelectorAll(this.options.selector);
    
    if (this.images.length === 0) {
      return;
    }
    
    console.log(`LazyImages: Found ${this.images.length} images to lazy load`);
    
    if (this.supportsIntersectionObserver) {
      this.setupIntersectionObserver();
    } else {
      this.loadAllImages();
    }
    
    this.setupEventListeners();
  }
  
  /**
   * Check WebP support
   */
  checkWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
  
  /**
   * Setup Intersection Observer
   */
  setupIntersectionObserver() {
    const config = {
      root: null,
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold,
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, config);
    
    this.images.forEach((img) => {
      this.observer.observe(img);
    });
  }
  
  /**
   * Load all images (fallback)
   */
  loadAllImages() {
    this.images.forEach((img) => {
      this.loadImage(img);
    });
  }
  
  /**
   * Load single image
   */
  async loadImage(img, retryCount = 0) {
    if (img.classList.contains(this.options.loadedClass)) {
      return;
    }
    
    img.classList.add(this.options.loadingClass);
    
    const src = this.getImageSrc(img);
    const srcset = img.dataset.srcset || '';
    
    if (!src) {
      console.warn('LazyImages: No data-src found', img);
      return;
    }
    
    try {
      // Create placeholder if blur-up enabled
      if (this.options.enableBlurUp && img.dataset.placeholder) {
        this.createBlurPlaceholder(img);
      }
      
      // Preload image
      await this.preloadImage(src, srcset);
      
      // Set image sources
      if (srcset) {
        img.srcset = srcset;
      }
      img.src = src;
      
      // Handle load success
      img.addEventListener('load', () => {
        this.onImageLoad(img);
      }, { once: true });
      
      // Handle load error
      img.addEventListener('error', () => {
        this.onImageError(img, retryCount);
      }, { once: true });
      
    } catch (error) {
      this.onImageError(img, retryCount);
    }
  }
  
  /**
   * Get image source (with WebP support)
   */
  getImageSrc(img) {
    const src = img.dataset.src;
    const webpSrc = img.dataset.srcWebp;
    
    if (this.supportsWebP && webpSrc) {
      return webpSrc;
    }
    
    return src;
  }
  
  /**
   * Preload image
   */
  preloadImage(src, srcset = '') {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      if (srcset) {
        image.srcset = srcset;
      }
      
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      
      image.src = src;
    });
  }
  
  /**
   * Create blur placeholder
   */
  createBlurPlaceholder(img) {
    const placeholder = img.dataset.placeholder;
    
    if (placeholder) {
      img.style.backgroundImage = `url(${placeholder})`;
      img.style.backgroundSize = 'cover';
      img.style.backgroundPosition = 'center';
      img.style.filter = 'blur(10px)';
      img.style.transform = 'scale(1.1)';
    } else {
      img.style.backgroundColor = this.options.placeholderColor;
    }
  }
  
  /**
   * Handle successful image load
   */
  onImageLoad(img) {
    img.classList.remove(this.options.loadingClass);
    img.classList.add(this.options.loadedClass);
    
    // Remove blur effect
    if (this.options.enableBlurUp) {
      img.style.filter = 'none';
      img.style.transform = 'scale(1)';
      img.style.backgroundImage = 'none';
    }
    
    // Fade in animation
    img.style.opacity = '0';
    img.style.transition = `opacity ${this.options.fadeInDuration}ms ease-in-out`;
    
    requestAnimationFrame(() => {
      img.style.opacity = '1';
    });
    
    this.loadedCount++;
    this.dispatchEvent('imageLoaded', { img, count: this.loadedCount });
    
    // Check if all images loaded
    if (this.loadedCount + this.errorCount === this.images.length) {
      this.dispatchEvent('allImagesLoaded', { 
        total: this.images.length, 
        loaded: this.loadedCount, 
        errors: this.errorCount 
      });
    }
  }
  
  /**
   * Handle image load error
   */
  onImageError(img, retryCount) {
    if (retryCount < this.options.retryAttempts) {
      console.log(`LazyImages: Retrying image ${retryCount + 1}/${this.options.retryAttempts}`);
      
      setTimeout(() => {
        this.loadImage(img, retryCount + 1);
      }, this.options.retryDelay);
      
      return;
    }
    
    console.error('LazyImages: Failed to load image', img.dataset.src);
    
    img.classList.remove(this.options.loadingClass);
    img.classList.add(this.options.errorClass);
    
    // Set error placeholder
    if (this.options.errorImage) {
      img.src = this.options.errorImage;
    }
    
    this.errorCount++;
    this.dispatchEvent('imageError', { img, count: this.errorCount });
    
    // Check if all images processed
    if (this.loadedCount + this.errorCount === this.images.length) {
      this.dispatchEvent('allImagesLoaded', { 
        total: this.images.length, 
        loaded: this.loadedCount, 
        errors: this.errorCount 
      });
    }
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Reload images on orientation change
    window.addEventListener('orientationchange', () => {
      this.refresh();
    });
    
    // Handle dynamically added images
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const newImages = node.querySelectorAll(this.options.selector);
            if (newImages.length > 0) {
              this.observeNewImages(newImages);
            }
          }
        });
      });
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
  
  /**
   * Observe new images
   */
  observeNewImages(images) {
    images.forEach((img) => {
      if (this.supportsIntersectionObserver) {
        this.observer.observe(img);
      } else {
        this.loadImage(img);
      }
    });
  }
  
  /**
   * Refresh/reload images
   */
  refresh() {
    this.images = document.querySelectorAll(this.options.selector);
    
    if (this.supportsIntersectionObserver && this.observer) {
      this.images.forEach((img) => {
        if (!img.classList.contains(this.options.loadedClass)) {
          this.observer.observe(img);
        }
      });
    }
  }
  
  /**
   * Force load all remaining images
   */
  loadAll() {
    this.images.forEach((img) => {
      if (!img.classList.contains(this.options.loadedClass)) {
        this.loadImage(img);
      }
    });
  }
  
  /**
   * Dispatch custom event
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(`lazyImages:${eventName}`, {
      detail,
      bubbles: true,
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      total: this.images.length,
      loaded: this.loadedCount,
      errors: this.errorCount,
      pending: this.images.length - this.loadedCount - this.errorCount,
      supportsWebP: this.supportsWebP,
      supportsIntersectionObserver: this.supportsIntersectionObserver,
    };
  }
  
  /**
   * Destroy instance
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.images = [];
    this.loadedCount = 0;
    this.errorCount = 0;
  }
}

// Create singleton instance
const lazyImagesInstance = new LazyImages();

// Static methods
LazyImages.init = (options) => {
  Object.assign(lazyImagesInstance.options, options);
  lazyImagesInstance.init();
};

LazyImages.refresh = () => lazyImagesInstance.refresh();
LazyImages.loadAll = () => lazyImagesInstance.loadAll();
LazyImages.getStats = () => lazyImagesInstance.getStats();
LazyImages.destroy = () => lazyImagesInstance.destroy();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  LazyImages.init();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyImages;
}

window.LazyImages = LazyImages;
