/**
 * Loading Progress Indicator Component
 * 
 * Global progress bar for page loads, AJAX requests, and async operations:
 * - Top bar progress indicator
 * - Automatic detection of navigation
 * - Manual control for custom operations
 * - Smooth animations
 * 
 * Features:
 * - YouTube-style progress bar
 * - Auto-increment simulation
 * - Multiple concurrent operations support
 * - Configurable speed and color
 * - Dark mode support
 * 
 * Usage:
 *   LoadingProgress.start();
 *   // ... async operation
 *   LoadingProgress.done();
 * 
 *   // Or auto-detect:
 *   LoadingProgress.init({ autoDetect: true });
 */

class LoadingProgress {
  constructor(options = {}) {
    this.options = {
      color: '#2d5016',
      height: '3px',
      speed: 300,
      trickleSpeed: 200,
      minimum: 0.08,
      easing: 'ease',
      autoDetect: true,
      showSpinner: false,
    };
    
    Object.assign(this.options, options);
    
    this.status = null;
    this.bar = null;
    this.spinner = null;
    this.activeRequests = 0;
  }
  
  /**
   * Initialize progress bar
   */
  init() {
    this.render();
    
    if (this.options.autoDetect) {
      this.setupAutoDetection();
    }
  }
  
  /**
   * Render progress bar HTML
   */
  render() {
    if (this.bar) return;
    
    const container = document.createElement('div');
    container.className = 'loading-progress';
    container.innerHTML = `
      <div class="loading-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
        <div class="loading-progress-peg"></div>
      </div>
      ${this.options.showSpinner ? '<div class="loading-progress-spinner"></div>' : ''}
    `;
    
    this.bar = container.querySelector('.loading-progress-bar');
    this.spinner = container.querySelector('.loading-progress-spinner');
    
    // Apply custom styles
    this.bar.style.background = this.options.color;
    this.bar.style.height = this.options.height;
    
    document.body.appendChild(container);
  }
  
  /**
   * Setup automatic detection for navigation and AJAX
   */
  setupAutoDetection() {
    // Detect page navigation
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState;
      window.history.pushState = (...args) => {
        this.start();
        originalPushState.apply(window.history, args);
        setTimeout(() => this.done(), 300);
      };
    }
    
    // Detect fetch requests
    if (window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        this.start();
        try {
          const response = await originalFetch(...args);
          this.done();
          return response;
        } catch (error) {
          this.done();
          throw error;
        }
      };
    }
    
    // Detect XMLHttpRequest
    if (window.XMLHttpRequest) {
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;
      
      XMLHttpRequest.prototype.open = function (...args) {
        this._progressTracked = true;
        return originalOpen.apply(this, args);
      };
      
      XMLHttpRequest.prototype.send = function (...args) {
        if (this._progressTracked) {
          LoadingProgress.start();
          
          this.addEventListener('loadend', () => {
            LoadingProgress.done();
          });
        }
        
        return originalSend.apply(this, args);
      };
    }
  }
  
  /**
   * Start progress
   */
  start() {
    if (!this.status) {
      this.set(0);
    }
    
    this.activeRequests++;
    
    const work = () => {
      setTimeout(() => {
        if (!this.status) return;
        this.trickle();
        work();
      }, this.options.trickleSpeed);
    };
    
    if (this.activeRequests === 1) {
      work();
    }
    
    return this;
  }
  
  /**
   * Complete progress
   */
  done(force = false) {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    
    if (force || this.activeRequests === 0) {
      this.activeRequests = 0;
      this.inc(0.3 + 0.5 * Math.random());
      this.set(1);
    }
    
    return this;
  }
  
  /**
   * Increment progress
   */
  inc(amount) {
    let n = this.status;
    
    if (!n) {
      return this.start();
    }
    
    if (n >= 1) {
      return this;
    }
    
    if (typeof amount !== 'number') {
      if (n >= 0 && n < 0.2) amount = 0.1;
      else if (n >= 0.2 && n < 0.5) amount = 0.04;
      else if (n >= 0.5 && n < 0.8) amount = 0.02;
      else if (n >= 0.8 && n < 0.99) amount = 0.005;
      else amount = 0;
    }
    
    n = Math.min(n + amount, 0.994);
    return this.set(n);
  }
  
  /**
   * Trickle progress
   */
  trickle() {
    return this.inc();
  }
  
  /**
   * Set progress to specific value (0-1)
   */
  set(n) {
    const started = this.isStarted();
    
    n = Math.min(1, Math.max(this.options.minimum, n));
    this.status = n === 1 ? null : n;
    
    const progress = this.render();
    const bar = this.bar;
    const speed = this.options.speed;
    const ease = this.options.easing;
    
    bar.offsetWidth; // Force repaint
    
    this.queue((next) => {
      // Set transition
      bar.style.transition = `all ${speed}ms ${ease}`;
      
      // Set width
      bar.style.transform = `translate3d(${(-1 + n) * 100}%, 0, 0)`;
      
      if (n === 1) {
        // Fade out
        setTimeout(() => {
          bar.style.transition = 'none';
          bar.style.opacity = '1';
          bar.offsetWidth;
          
          setTimeout(() => {
            bar.style.transform = 'translate3d(-100%, 0, 0)';
            bar.style.transition = `all ${speed}ms ${ease}`;
            bar.style.opacity = '0';
            
            setTimeout(() => {
              this.remove();
              next();
            }, speed);
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });
    
    return this;
  }
  
  /**
   * Check if progress has started
   */
  isStarted() {
    return typeof this.status === 'number';
  }
  
  /**
   * Remove progress bar
   */
  remove() {
    const container = document.querySelector('.loading-progress');
    if (container) {
      container.remove();
    }
    this.bar = null;
    this.spinner = null;
  }
  
  /**
   * Queue function
   */
  queue = (() => {
    const pending = [];
    
    function next() {
      const fn = pending.shift();
      if (fn) {
        fn(next);
      }
    }
    
    return (fn) => {
      pending.push(fn);
      if (pending.length === 1) next();
    };
  })();
  
  /**
   * Promise wrapper
   */
  promise(promise) {
    this.start();
    
    return promise
      .then((result) => {
        this.done();
        return result;
      })
      .catch((error) => {
        this.done();
        throw error;
      });
  }
  
  /**
   * Async function wrapper
   */
  async wrap(fn) {
    this.start();
    try {
      const result = await fn();
      this.done();
      return result;
    } catch (error) {
      this.done();
      throw error;
    }
  }
}

// Create singleton instance
const loadingProgressInstance = new LoadingProgress();

// Static methods for global use
LoadingProgress.init = (options) => {
  loadingProgressInstance.options = Object.assign(loadingProgressInstance.options, options);
  loadingProgressInstance.init();
};

LoadingProgress.start = () => loadingProgressInstance.start();
LoadingProgress.done = (force) => loadingProgressInstance.done(force);
LoadingProgress.inc = (amount) => loadingProgressInstance.inc(amount);
LoadingProgress.set = (n) => loadingProgressInstance.set(n);
LoadingProgress.isStarted = () => loadingProgressInstance.isStarted();
LoadingProgress.remove = () => loadingProgressInstance.remove();
LoadingProgress.promise = (promise) => loadingProgressInstance.promise(promise);
LoadingProgress.wrap = (fn) => loadingProgressInstance.wrap(fn);

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  LoadingProgress.init({
    autoDetect: true,
    color: getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#2d5016',
  });
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingProgress;
}

// Make available globally
window.LoadingProgress = LoadingProgress;
