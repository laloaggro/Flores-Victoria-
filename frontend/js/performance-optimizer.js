/* ========================================
   OPTIMIZACIONES DE RENDIMIENTO
   - Lazy Loading de imágenes
   - Optimización de carga de recursos
   - Minimización de CSS crítico
   ======================================== */

// Lazy Loading Mejorado para Imágenes
class LazyImageLoader {
    constructor() {
        this.images = [];
        this.imageObserver = null;
        this.init();
    }

    init() {
        // Configurar Intersection Observer
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            this.observeImages();
        } else {
            // Fallback para navegadores sin soporte
            this.loadAllImages();
        }
    }

    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    loadImage(img) {
        // Cargar imagen principal
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }

        // Cargar imagen de alta calidad si existe
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
        }

        // Agregar clase de cargado
        img.classList.add('loaded');
    }

    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }
}

// Preloader de recursos críticos
class ResourcePreloader {
    constructor() {
        this.criticalResources = [
            '/css/design-system.css',
            '/css/base.css',
            '/images/logo.svg'
        ];
        this.preloadCriticalResources();
    }

    preloadCriticalResources() {
        this.criticalResources.forEach(resource => {
            if (resource.endsWith('.css')) {
                this.preloadCSS(resource);
            } else if (resource.endsWith('.js')) {
                this.preloadJS(resource);
            } else {
                this.preloadImage(resource);
            }
        });
    }

    preloadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        link.onload = () => {
            link.rel = 'stylesheet';
        };
        document.head.appendChild(link);
    }

    preloadJS(src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = src;
        document.head.appendChild(link);
    }

    preloadImage(src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    }
}

// Optimizador de CSS crítico
class CriticalCSSOptimizer {
    constructor() {
        this.nonCriticalCSS = [
            '/css/animations.css',
            '/css/print.css'
        ];
        this.deferNonCriticalCSS();
    }

    deferNonCriticalCSS() {
        this.nonCriticalCSS.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            link.onload = () => {
                link.rel = 'stylesheet';
            };
            
            // Fallback para navegadores sin soporte
            const noscript = document.createElement('noscript');
            const fallbackLink = document.createElement('link');
            fallbackLink.rel = 'stylesheet';
            fallbackLink.href = href;
            noscript.appendChild(fallbackLink);
            
            document.head.appendChild(link);
            document.head.appendChild(noscript);
        });
    }
}

// Monitor de rendimiento
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.initializeMetrics();
    }

    initializeMetrics() {
        // Web Vitals básicas
        if ('PerformanceObserver' in window) {
            this.observeLCP();
            this.observeFID();
            this.observeCLS();
        }

        // Métricas de carga
        window.addEventListener('load', () => {
            this.measureLoadTime();
        });
    }

    observeLCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.startTime;
            this.reportMetric('LCP', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    observeFID() {
        const observer = new PerformanceObserver((list) => {
            const firstInput = list.getEntries()[0];
            this.metrics.fid = firstInput.processingStart - firstInput.startTime;
            this.reportMetric('FID', this.metrics.fid);
        });
        observer.observe({ entryTypes: ['first-input'] });
    }

    observeCLS() {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.metrics.cls = clsValue;
            this.reportMetric('CLS', clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
    }

    measureLoadTime() {
        const navigation = performance.getEntriesByType('navigation')[0];
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        
        this.reportMetric('Load Time', this.metrics.loadTime);
        this.reportMetric('DOM Content Loaded', this.metrics.domContentLoaded);
    }

    reportMetric(name, value) {
        if (window.gtag) {
            window.gtag('event', 'performance_metric', {
                'metric_name': name,
                'metric_value': value
            });
        }
        
        // Log para desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log(`${name}: ${value.toFixed(2)}ms`);
        }
    }

    getMetrics() {
        return this.metrics;
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    new LazyImageLoader();
    new ResourcePreloader();
    new CriticalCSSOptimizer();
    new PerformanceMonitor();
});

// Optimización de scroll suave
const smoothScrollPolyfill = () => {
    if (!('scrollBehavior' in document.documentElement.style)) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
        script.onload = () => {
            window.__forceSmoothScrollPolyfill__ = true;
            window.smoothscroll.polyfill();
        };
        document.head.appendChild(script);
    }
};

smoothScrollPolyfill();

export { LazyImageLoader, ResourcePreloader, CriticalCSSOptimizer, PerformanceMonitor };