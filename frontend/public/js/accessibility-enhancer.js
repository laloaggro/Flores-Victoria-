/**
 * Accessibility Enhancer - Flores Victoria v2.0
 * Mejora la accesibilidad del sitio automáticamente
 */

(function() {
    'use strict';
    
    /**
     * Añade navegación por teclado a elementos interactivos
     */
    function enhanceKeyboardNavigation() {
        // Asegurar que todos los elementos focusables tengan outline visible
        const focusableElements = document.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(el => {
            el.addEventListener('focus', function() {
                this.classList.add('keyboard-focus');
            });
            
            el.addEventListener('blur', function() {
                this.classList.remove('keyboard-focus');
            });
        });
    }
    
    /**
     * Añade aria-labels faltantes a botones con iconos
     */
    function addMissingAriaLabels() {
        let addedCount = 0;
        
        // Botones sin aria-label o texto visible
        const buttons = document.querySelectorAll('button:not([aria-label]):not([title])');
        buttons.forEach(btn => {
            const hasText = btn.textContent.trim().length > 0;
            const hasIcon = btn.querySelector('i, svg, img');
            
            if (!hasText && hasIcon) {
                // Inferir label del nombre de clase del icono
                const icon = btn.querySelector('i[class*="fa-"]');
                if (icon) {
                    const iconClass = Array.from(icon.classList).find(c => c.startsWith('fa-'));
                    if (iconClass) {
                        const label = iconClass.replace('fa-', '').replace(/-/g, ' ');
                        btn.setAttribute('aria-label', label);
                        btn.setAttribute('title', label);
                        addedCount++;
                    }
                }
            }
        });
        
        // Enlaces sin texto visible
        const links = document.querySelectorAll('a:not([aria-label])');
        links.forEach(link => {
            const hasText = link.textContent.trim().length > 0;
            const hasIcon = link.querySelector('i, svg, img');
            
            if (!hasText && hasIcon) {
                const icon = link.querySelector('i[class*="fa-"]');
                if (icon) {
                    const iconClass = Array.from(icon.classList).find(c => c.startsWith('fa-'));
                    if (iconClass) {
                        const label = iconClass.replace('fa-', '').replace(/-/g, ' ');
                        link.setAttribute('aria-label', label);
                        link.setAttribute('title', label);
                        addedCount++;
                    }
                }
            }
        });
        
        if (addedCount > 0) {
            console.log(`✓ ${addedCount} aria-labels añadidos automáticamente`);
        }
    }
    
    /**
     * Mejora la accesibilidad de imágenes
     */
    function enhanceImageAccessibility() {
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            // Si la imagen es decorativa (en background o sin contenido importante)
            if (img.hasAttribute('aria-hidden') || img.classList.contains('decorative')) {
                img.setAttribute('alt', '');
                img.setAttribute('role', 'presentation');
            } else {
                // Intentar inferir alt del nombre de archivo
                const src = img.getAttribute('src') || '';
                const filename = src.split('/').pop().split('.')[0];
                const alt = filename.replace(/[-_]/g, ' ');
                img.setAttribute('alt', alt);
                console.warn(`Imagen sin alt añadido automáticamente: "${alt}". Por favor, revisa y mejora.`);
            }
        });
    }
    
    /**
     * Añade roles ARIA faltantes
     */
    function addMissingRoles() {
        // Navegación principal
        const navs = document.querySelectorAll('nav:not([role])');
        navs.forEach(nav => {
            nav.setAttribute('role', 'navigation');
        });
        
        // Formularios de búsqueda
        const searchForms = document.querySelectorAll('form[action*="search"]:not([role])');
        searchForms.forEach(form => {
            form.setAttribute('role', 'search');
        });
        
        // Regiones principales
        const main = document.querySelector('main:not([role])');
        if (main) {
            main.setAttribute('role', 'main');
        }
    }
    
    /**
     * Mejora contraste de texto (advertencias en consola)
     */
    function checkContrast() {
        // Esta función solo advierte, no modifica estilos
        const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');
        let lowContrastCount = 0;
        
        textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            const bgColor = style.backgroundColor;
            
            // Advertencia simple (en producción usar algoritmo WCAG completo)
            if (color === bgColor) {
                console.warn('Posible problema de contraste:', el);
                lowContrastCount++;
            }
        });
        
        if (lowContrastCount > 0) {
            console.warn(`⚠ ${lowContrastCount} elementos pueden tener problemas de contraste`);
        }
    }
    
    /**
     * Añade skip link para navegación por teclado
     */
    function addSkipLink() {
        // Verificar si ya existe
        if (document.querySelector('.skip-link')) {
            return;
        }
        
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Saltar al contenido principal';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--primary, #2E7D32);
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            z-index: 100000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', function() {
            this.style.top = '0';
        });
        
        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Asegurar que el main tenga id
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
        }
    }
    
    /**
     * Mejora formularios
     */
    function enhanceForms() {
        // Asociar labels con inputs
        const inputs = document.querySelectorAll('input:not([id]):not([aria-label])');
        inputs.forEach((input, index) => {
            const label = input.closest('label') || 
                         input.parentElement.querySelector('label');
            
            if (label && !input.id) {
                const id = `input-${Date.now()}-${index}`;
                input.id = id;
                label.setAttribute('for', id);
            }
        });
        
        // Añadir aria-required a campos obligatorios
        const requiredInputs = document.querySelectorAll('input[required]:not([aria-required])');
        requiredInputs.forEach(input => {
            input.setAttribute('aria-required', 'true');
        });
    }
    
    /**
     * Inicializa todas las mejoras de accesibilidad
     */
    function init() {
        addSkipLink();
        enhanceKeyboardNavigation();
        addMissingAriaLabels();
        enhanceImageAccessibility();
        addMissingRoles();
        enhanceForms();
        checkContrast();
        
        console.log('✓ Accessibility Enhancer inicializado');
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exponer funciones globalmente
    window.AccessibilityEnhancer = {
        init,
        enhanceKeyboardNavigation,
        addMissingAriaLabels,
        enhanceImageAccessibility,
        addMissingRoles,
        enhanceForms,
        checkContrast
    };
})();

/**
 * CSS adicional para navegación por teclado (añadir al CSS principal):
 * 
 * .keyboard-focus {
 *   outline: 3px solid var(--primary) !important;
 *   outline-offset: 2px !important;
 * }
 * 
 * @media (prefers-reduced-motion: reduce) {
 *   .skip-link {
 *     transition: none !important;
 *   }
 * }
 */
