/* ========================================
   OPTIMIZADOR DE IMÁGENES AUTOMÁTICO v3.0
   - Conversión automática a WebP
   - Redimensionamiento responsivo
   - Compresión inteligente
   - Lazy Loading avanzado
   ======================================== */

class ImageOptimizer {
    constructor(options = {}) {
        this.options = {
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
            formats: ['webp', 'jpg'],
            responsiveBreakpoints: [320, 480, 768, 1024, 1200],
            ...options
        };
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.supportsWebP = false;
        
        this.detectWebPSupport();
    }

    async detectWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                this.supportsWebP = (webP.height === 2);
                resolve(this.supportsWebP);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    async optimizeImage(file) {
        if (!file || !file.type.startsWith('image/')) {
            throw new Error('Archivo no válido');
        }

        const img = await this.loadImage(file);
        const optimizedImages = {};

        // Generar versiones responsivas
        for (const width of this.options.responsiveBreakpoints) {
            if (width <= img.naturalWidth) {
                const canvas = this.resizeImage(img, width);
                
                // Generar en diferentes formatos
                if (this.supportsWebP) {
                    optimizedImages[`${width}w.webp`] = canvas.toDataURL('image/webp', this.options.quality);
                }
                optimizedImages[`${width}w.jpg`] = canvas.toDataURL('image/jpeg', this.options.quality);
            }
        }

        return optimizedImages;
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    resizeImage(img, targetWidth) {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        const targetHeight = targetWidth * aspectRatio;

        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;

        this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        return this.canvas;
    }

    generateResponsiveHTML(imageName, alt = '', className = '') {
        const baseName = imageName.replace(/\.[^/.]+$/, '');
        
        let srcset = [];
        let webpSrcset = [];

        this.options.responsiveBreakpoints.forEach(width => {
            srcset.push(`/images/${baseName}-${width}w.jpg ${width}w`);
            if (this.supportsWebP) {
                webpSrcset.push(`/images/${baseName}-${width}w.webp ${width}w`);
            }
        });

        const sizes = `
            (max-width: 320px) 320px,
            (max-width: 480px) 480px,
            (max-width: 768px) 768px,
            (max-width: 1024px) 1024px,
            1200px
        `;

        let html = '';
        
        if (this.supportsWebP) {
            html += `
                <picture>
                    <source srcset="${webpSrcset.join(', ')}" sizes="${sizes}" type="image/webp">
                    <source srcset="${srcset.join(', ')}" sizes="${sizes}" type="image/jpeg">
                    <img src="/images/${baseName}-768w.jpg" alt="${alt}" class="${className}" loading="lazy">
                </picture>
            `;
        } else {
            html += `
                <img 
                    srcset="${srcset.join(', ')}" 
                    sizes="${sizes}"
                    src="/images/${baseName}-768w.jpg" 
                    alt="${alt}" 
                    class="${className}" 
                    loading="lazy"
                >
            `;
        }

        return html.trim();
    }
}

// Lazy Loading avanzado con placeholder
class AdvancedLazyLoader {
    constructor() {
        this.observer = null;
        this.images = new Map();
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    rootMargin: '100px',
                    threshold: 0.1
                }
            );

            this.setupImages();
        } else {
            // Fallback para navegadores sin soporte
            this.loadAllImages();
        }
    }

    setupImages() {
        const images = document.querySelectorAll('img[data-src], img[data-srcset]');
        
        images.forEach(img => {
            this.createPlaceholder(img);
            this.observer.observe(img);
        });
    }

    createPlaceholder(img) {
        const width = img.getAttribute('width') || 300;
        const height = img.getAttribute('height') || 200;
        
        // SVG placeholder con el color principal del sitio
        const placeholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif'%3ECargando...%3C/text%3E%3C/svg%3E`;
        
        img.src = placeholder;
        img.classList.add('lazy-loading');
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    async loadImage(img) {
        try {
            const src = img.dataset.src || img.dataset.srcset;
            
            // Precargar la imagen
            const tempImg = new Image();
            await new Promise((resolve, reject) => {
                tempImg.onload = resolve;
                tempImg.onerror = reject;
                tempImg.src = src;
            });

            // Aplicar la imagen real
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
            }

            // Animación de aparición
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');

        } catch (error) {
            console.error('Error cargando imagen:', error);
            img.classList.add('lazy-error');
        }
    }

    loadAllImages() {
        const images = document.querySelectorAll('img[data-src], img[data-srcset]');
        images.forEach(img => this.loadImage(img));
    }
}

// Aplicar lazy loading nativo a todas las imágenes
function applyNativeLazyLoading() {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
    });
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedLazyLoader();
    applyNativeLazyLoading();
});

// Compatibilidad con versión anterior
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImageOptimizer, AdvancedLazyLoader };
}
        
        // Si la imagen está cargada, obtener dimensiones naturales
        if (img.complete && img.naturalWidth) {
            if (!img.width) img.width = img.naturalWidth;
            if (!img.height) img.height = img.naturalHeight;
        } else {
            // Esperar a que cargue
            img.addEventListener('load', function() {
                if (!img.width) img.setAttribute('width', img.naturalWidth);
                if (!img.height) img.setAttribute('height', img.naturalHeight);
            }, { once: true });
        }
    }
    
    /**
     * Optimiza todas las imágenes de la página
     */
    function optimizeImages() {
        const images = document.querySelectorAll('img:not([data-optimized])');
        let optimizedCount = 0;
        
        images.forEach(img => {
            // Excluir logos y imágenes críticas (eager loading)
            if (img.loading === 'eager' || img.closest('.logo') || img.closest('.header')) {
                img.setAttribute('data-optimized', 'true');
                return;
            }
            
            setupLazyLoading(img);
            ensureDimensions(img);
            
            // Marcar como optimizada
            img.setAttribute('data-optimized', 'true');
            optimizedCount++;
        });
        
        if (optimizedCount > 0) {
            console.log(`✓ ${optimizedCount} imágenes optimizadas con lazy loading`);
        }
    }
    
    /**
     * Observa el DOM para nuevas imágenes añadidas dinámicamente
     */
    function observeNewImages() {
        if (!window.MutationObserver) {
            return;
        }
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'IMG') {
                            if (!node.hasAttribute('data-optimized')) {
                                setupLazyLoading(node);
                                ensureDimensions(node);
                                node.setAttribute('data-optimized', 'true');
                            }
                        } else {
                            // Buscar imágenes dentro del nodo añadido
                            const images = node.querySelectorAll('img:not([data-optimized])');
                            images.forEach(img => {
                                setupLazyLoading(img);
                                ensureDimensions(img);
                                img.setAttribute('data-optimized', 'true');
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Inicializa el optimizador de imágenes
     */
    function init() {
        // Optimizar imágenes existentes
        optimizeImages();
        
        // Observar nuevas imágenes
        observeNewImages();
        
        console.log('✓ Image Optimizer inicializado');
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exponer funciones globalmente
    window.ImageOptimizer = {
        optimize: optimizeImages,
        setupLazyLoading,
        ensureDimensions
    };
})();

/**
 * CSS para imágenes auto-dimensionadas
 * Añadir al CSS principal:
 * 
 * .img-auto-size {
 *   aspect-ratio: 16 / 9;
 *   object-fit: cover;
 *   width: 100%;
 *   height: auto;
 * }
 */
