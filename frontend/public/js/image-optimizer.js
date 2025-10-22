/**
 * Image Optimizer - Flores Victoria v2.0
 * Añade lazy loading y optimizaciones automáticas a las imágenes
 */

(function() {
    'use strict';
    
    /**
     * Configuración por defecto
     */
    const config = {
        rootMargin: '50px', // Cargar imágenes 50px antes de que entren en viewport
        threshold: 0.01,     // Detectar cuando el 1% de la imagen es visible
        placeholderColor: '#f0f0f0'
    };
    
    /**
     * Añade lazy loading a una imagen
     * @param {HTMLImageElement} img - Elemento de imagen
     */
    function setupLazyLoading(img) {
        // Si ya tiene loading="lazy" native, no hacer nada
        if (img.loading === 'lazy') {
            return;
        }
        
        // Añadir loading lazy nativo (soportado en navegadores modernos)
        img.loading = 'lazy';
        
        // Añadir decoding async para mejor rendimiento
        img.decoding = 'async';
        
        // Si no tiene dimensiones, intentar inferirlas o añadir aspect-ratio
        if (!img.width && !img.height) {
            // Añadir clase para aspect-ratio genérico
            img.classList.add('img-auto-size');
        }
    }
    
    /**
     * Añade dimensiones explícitas si faltan
     * @param {HTMLImageElement} img - Elemento de imagen
     */
    function ensureDimensions(img) {
        // Si ya tiene width y height, no hacer nada
        if (img.width && img.height) {
            return;
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
