/**
 * Performance Monitor Component
 * 
 * Monitors and reports Core Web Vitals and custom performance metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - Custom timing marks
 * 
 * Features:
 * - Real-time monitoring
 * - Analytics integration
 * - Performance budgets
 * - Console logging
 * - Visual indicators
 * 
 * Usage:
 *   PerformanceMonitor.init({
 *     enableConsole: true,
 *     enableAnalytics: true
 *   });
 */

class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableConsole: true,
      enableAnalytics: true,
      enableVisualIndicator: false,
      reportInterval: 30000,
      budgets: {
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
        FCP: 1800,
        TTFB: 600,
      },
    };
    
    Object.assign(this.options, options);
    
    this.metrics = {};
    this.marks = {};
    this.measures = {};
    this.reportTimer = null;
    this.supported = 'PerformanceObserver' in window;
  }
  
  /**
   * Initialize performance monitoring
   */
  init() {
    if (!this.supported) {
      console.warn('PerformanceMonitor: PerformanceObserver not supported');
      return;
    }
    
    console.log('PerformanceMonitor: Initializing...');
    
    this.observeCoreWebVitals();
    this.observeNavigationTiming();
    this.observeResourceTiming();
    this.setupPeriodicReporting();
    
    if (this.options.enableVisualIndicator) {
      this.createVisualIndicator();
    }
  }
  
  /**
   * Observe Core Web Vitals
   */
  observeCoreWebVitals() {
    // Largest Contentful Paint
    this.observeLCP();
    
    // First Input Delay
    this.observeFID();
    
    // Cumulative Layout Shift
    this.observeCLS();
    
    // First Contentful Paint
    this.observeFCP();
  }
  
  /**
   * Observe LCP
   */
  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
        this.reportMetric('LCP', this.metrics.LCP);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('PerformanceMonitor: LCP observation failed', error);
    }
  }
  
  /**
   * Observe FID
   */
  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.FID = entry.processingStart - entry.startTime;
          this.reportMetric('FID', this.metrics.FID);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('PerformanceMonitor: FID observation failed', error);
    }
  }
  
  /**
   * Observe CLS
   */
  observeCLS() {
    try {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.CLS = clsValue;
          }
        });
        
        this.reportMetric('CLS', this.metrics.CLS);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('PerformanceMonitor: CLS observation failed', error);
    }
  }
  
  /**
   * Observe FCP
   */
  observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = entry.startTime;
            this.reportMetric('FCP', this.metrics.FCP);
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('PerformanceMonitor: FCP observation failed', error);
    }
  }
  
  /**
   * Observe Navigation Timing
   */
  observeNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
          this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
          this.metrics.DOMContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          this.metrics.LoadComplete = navigation.loadEventEnd - navigation.loadEventStart;
          this.metrics.TotalLoadTime = navigation.loadEventEnd - navigation.fetchStart;
          
          this.reportMetric('TTFB', this.metrics.TTFB);
          this.reportMetric('DOMContentLoaded', this.metrics.DOMContentLoaded);
          this.reportMetric('LoadComplete', this.metrics.LoadComplete);
          this.reportMetric('TotalLoadTime', this.metrics.TotalLoadTime);
          
          this.logNavigationTiming(navigation);
        }
      }, 0);
    });
  }
  
  /**
   * Observe Resource Timing
   */
  observeResourceTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          const resourceType = this.getResourceType(entry.name);
          
          if (!this.metrics.resources) {
            this.metrics.resources = {};
          }
          
          if (!this.metrics.resources[resourceType]) {
            this.metrics.resources[resourceType] = {
              count: 0,
              totalSize: 0,
              totalDuration: 0,
            };
          }
          
          this.metrics.resources[resourceType].count++;
          this.metrics.resources[resourceType].totalSize += entry.transferSize || 0;
          this.metrics.resources[resourceType].totalDuration += entry.duration;
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('PerformanceMonitor: Resource timing observation failed', error);
    }
  }
  
  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'images';
    if (url.match(/\.(css)$/i)) return 'stylesheets';
    if (url.match(/\.(js)$/i)) return 'scripts';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'fonts';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'videos';
    return 'other';
  }
  
  /**
   * Report metric
   */
  reportMetric(name, value) {
    const budget = this.options.budgets[name];
    const exceeds = budget && value > budget;
    
    if (this.options.enableConsole) {
      const status = exceeds ? '❌' : '✅';
      const budgetText = budget ? ` (budget: ${budget}${name === 'CLS' ? '' : 'ms'})` : '';
      
      console.log(
        `${status} ${name}: ${name === 'CLS' ? value.toFixed(3) : Math.round(value)}${name === 'CLS' ? '' : 'ms'}${budgetText}`
      );
    }
    
    if (this.options.enableAnalytics) {
      this.sendToAnalytics(name, value, exceeds);
    }
    
    this.dispatchEvent('metricReported', { name, value, exceeds, budget });
  }
  
  /**
   * Log navigation timing breakdown
   */
  logNavigationTiming(navigation) {
    if (!this.options.enableConsole) return;
    
    console.group('📊 Navigation Timing Breakdown');
    console.log('DNS Lookup:', Math.round(navigation.domainLookupEnd - navigation.domainLookupStart), 'ms');
    console.log('TCP Connection:', Math.round(navigation.connectEnd - navigation.connectStart), 'ms');
    console.log('Request:', Math.round(navigation.responseStart - navigation.requestStart), 'ms');
    console.log('Response:', Math.round(navigation.responseEnd - navigation.responseStart), 'ms');
    console.log('DOM Processing:', Math.round(navigation.domComplete - navigation.domInteractive), 'ms');
    console.groupEnd();
  }
  
  /**
   * Send metrics to analytics
   */
  sendToAnalytics(name, value, exceeds) {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
        exceeds_budget: exceeds,
      });
    }
    
    // Custom analytics
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('Web Vitals', {
        metric: name,
        value: Math.round(value),
        exceeds_budget: exceeds,
      });
    }
  }
  
  /**
   * Create custom performance mark
   */
  mark(name) {
    try {
      performance.mark(name);
      this.marks[name] = performance.now();
      console.log(`⏱️ Mark: ${name} at ${Math.round(this.marks[name])}ms`);
    } catch (error) {
      console.warn('PerformanceMonitor: Failed to create mark', error);
    }
  }
  
  /**
   * Create custom performance measure
   */
  measure(name, startMark, endMark) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      
      this.measures[name] = measure.duration;
      console.log(`📏 Measure: ${name} = ${Math.round(measure.duration)}ms`);
      
      return measure.duration;
    } catch (error) {
      console.warn('PerformanceMonitor: Failed to create measure', error);
      return null;
    }
  }
  
  /**
   * Get all metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      marks: this.marks,
      measures: this.measures,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Setup periodic reporting
   */
  setupPeriodicReporting() {
    if (!this.options.reportInterval) return;
    
    this.reportTimer = setInterval(() => {
      this.generateReport();
    }, this.options.reportInterval);
  }
  
  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      metrics: this.metrics,
      resources: this.metrics.resources,
      memory: this.getMemoryInfo(),
      connection: this.getConnectionInfo(),
      timestamp: new Date().toISOString(),
    };
    
    console.group('📊 Performance Report');
    console.table(this.metrics);
    if (this.metrics.resources) {
      console.table(this.metrics.resources);
    }
    console.groupEnd();
    
    this.dispatchEvent('reportGenerated', report);
    
    return report;
  }
  
  /**
   * Get memory info
   */
  getMemoryInfo() {
    if (performance.memory) {
      return {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      };
    }
    return null;
  }
  
  /**
   * Get connection info
   */
  getConnectionInfo() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
      };
    }
    return null;
  }
  
  /**
   * Create visual indicator
   */
  createVisualIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'performance-indicator';
    indicator.innerHTML = `
      <div class="perf-badge">
        <span class="perf-label">Perf</span>
        <span class="perf-lcp">-</span>
        <span class="perf-fid">-</span>
        <span class="perf-cls">-</span>
      </div>
    `;
    
    document.body.appendChild(indicator);
    
    // Update indicator with metrics
    document.addEventListener('performanceMonitor:metricReported', (e) => {
      const { name, value } = e.detail;
      const element = indicator.querySelector(`.perf-${name.toLowerCase()}`);
      
      if (element) {
        element.textContent = name === 'CLS' ? value.toFixed(2) : Math.round(value);
        element.className = `perf-${name.toLowerCase()} ${this.getMetricStatus(name, value)}`;
      }
    });
  }
  
  /**
   * Get metric status (good/needs-improvement/poor)
   */
  getMetricStatus(name, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 600, poor: 1500 },
    };
    
    const threshold = thresholds[name];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
  
  /**
   * Dispatch custom event
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(`performanceMonitor:${eventName}`, {
      detail,
      bubbles: true,
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Destroy monitor
   */
  destroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }
    
    const indicator = document.querySelector('.performance-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
}

// Create singleton
const performanceMonitorInstance = new PerformanceMonitor();

// Static methods
PerformanceMonitor.init = (options) => {
  Object.assign(performanceMonitorInstance.options, options);
  performanceMonitorInstance.init();
};

PerformanceMonitor.mark = (name) => performanceMonitorInstance.mark(name);
PerformanceMonitor.measure = (name, start, end) => performanceMonitorInstance.measure(name, start, end);
PerformanceMonitor.getMetrics = () => performanceMonitorInstance.getMetrics();
PerformanceMonitor.generateReport = () => performanceMonitorInstance.generateReport();
PerformanceMonitor.destroy = () => performanceMonitorInstance.destroy();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  PerformanceMonitor.init();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}

window.PerformanceMonitor = PerformanceMonitor;
