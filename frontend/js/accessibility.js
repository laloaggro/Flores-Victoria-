/**
 * Accessibility Enhancements
 * Script para mejorar la accesibilidad del sitio
 */

(function() {
    'use strict';
    
    // 1. Skip to Main Content
    function addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Saltar al contenido principal';
        skipLink.setAttribute('accesskey', 's');
        
        const style = document.createElement('style');
        style.textContent = `
            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: #2d5016;
                color: white;
                padding: 8px 16px;
                text-decoration: none;
                z-index: 100;
                border-radius: 0 0 4px 0;
            }
            .skip-link:focus {
                top: 0;
            }
        `;
        
        document.head.appendChild(style);
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Ensure main content has id
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
            main.setAttribute('tabindex', '-1');
        }
    }
    
    // 2. Keyboard Navigation Enhancement
    function enhanceKeyboardNav() {
        // Add visible focus indicator
        const style = document.createElement('style');
        style.textContent = `
            *:focus-visible {
                outline: 3px solid #2d5016 !important;
                outline-offset: 2px !important;
            }
            
            a:focus-visible,
            button:focus-visible {
                box-shadow: 0 0 0 3px rgba(45, 80, 22, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
        
        // Trap focus in modals
        document.addEventListener('keydown', function(e) {
            const modal = document.querySelector('[role="dialog"][aria-hidden="false"]');
            if (modal && e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(
                    'a[href], button:not([disabled]), textarea, input, select'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });
    }
    
    // 3. ARIA Labels Enhancement
    function enhanceAriaLabels() {
        // Add aria-label to images without alt
        document.querySelectorAll('img:not([alt])').forEach(img => {
            img.setAttribute('alt', '');
            img.setAttribute('role', 'presentation');
        });
        
        // Add aria-label to external links
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            const currentLabel = link.getAttribute('aria-label') || link.textContent.trim();
            link.setAttribute('aria-label', `${currentLabel} (abre en nueva pestaña)`);
        });
        
        // Add role to navigation
        document.querySelectorAll('nav:not([role])').forEach(nav => {
            nav.setAttribute('role', 'navigation');
        });
    }
    
    // 4. Form Accessibility
    function enhanceFormAccessibility() {
        document.querySelectorAll('form').forEach(form => {
            // Add labels to inputs without them
            form.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
                if (!input.id) {
                    input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
                }
                
                const label = form.querySelector(`label[for="${input.id}"]`);
                if (!label && !input.getAttribute('aria-label')) {
                    const placeholder = input.getAttribute('placeholder');
                    if (placeholder) {
                        input.setAttribute('aria-label', placeholder);
                    }
                }
                
                // Add aria-required to required inputs
                if (input.hasAttribute('required') && !input.hasAttribute('aria-required')) {
                    input.setAttribute('aria-required', 'true');
                }
            });
            
            // Add aria-invalid for validation
            form.addEventListener('submit', function(e) {
                form.querySelectorAll('input, textarea, select').forEach(input => {
                    if (!input.checkValidity()) {
                        input.setAttribute('aria-invalid', 'true');
                    } else {
                        input.removeAttribute('aria-invalid');
                    }
                });
            });
        });
    }
    
    // 5. Announce Dynamic Content
    function createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0,0,0,0);
                white-space: nowrap;
                border: 0;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(liveRegion);
        
        // Global function to announce messages
        window.announceToScreenReader = function(message) {
            const region = document.getElementById('live-region');
            if (region) {
                region.textContent = message;
                setTimeout(() => region.textContent = '', 1000);
            }
        };
    }
    
    // 6. Color Contrast Checker (Development Only)
    function checkColorContrast() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('%c🎨 Accessibility: Color Contrast Check', 'color: #2d5016; font-weight: bold;');
            console.log('Verifica que los colores tengan un ratio de contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande');
            console.log('Herramienta recomendada: https://webaim.org/resources/contrastchecker/');
        }
    }
    
    // 7. Heading Hierarchy Checker
    function checkHeadingHierarchy() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        let issues = [];
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (index === 0 && level !== 1) {
                issues.push(`⚠️ Primera cabecera debería ser H1, encontrado ${heading.tagName}`);
            }
            
            if (level - previousLevel > 1) {
                issues.push(`⚠️ Salto de nivel de ${previousLevel} a ${level} en "${heading.textContent.trim()}"`);
            }
            
            previousLevel = level;
        });
        
        if (issues.length > 0 && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            console.warn('%c🔍 Accessibility: Heading Hierarchy Issues', 'color: orange; font-weight: bold;');
            issues.forEach(issue => console.warn(issue));
        }
    }
    
    // 8. Landmark Regions
    function addLandmarkRoles() {
        // Add main landmark if not present
        const main = document.querySelector('main');
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
        }
        
        // Add complementary to aside
        document.querySelectorAll('aside:not([role])').forEach(aside => {
            aside.setAttribute('role', 'complementary');
        });
        
        // Add contentinfo to footer
        const footer = document.querySelector('footer');
        if (footer && !footer.getAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
        }
    }
    
    // 9. Keyboard Shortcuts Info
    function addKeyboardShortcutsInfo() {
        window.showKeyboardShortcuts = function() {
            alert(`
Atajos de Teclado:
━━━━━━━━━━━━━━━━
Tab: Navegar hacia adelante
Shift + Tab: Navegar hacia atrás
Enter/Space: Activar enlaces/botones
Esc: Cerrar modales
S: Saltar al contenido (AccessKey)
/: Abrir búsqueda (cuando esté disponible)
            `.trim());
        };
        
        // Show on Ctrl+/ or Cmd+/
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                window.showKeyboardShortcuts();
            }
        });
    }
    
    // 10. Initialize all enhancements
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        addSkipLink();
        enhanceKeyboardNav();
        enhanceAriaLabels();
        enhanceFormAccessibility();
        createLiveRegion();
        checkColorContrast();
        checkHeadingHierarchy();
        addLandmarkRoles();
        addKeyboardShortcutsInfo();
        
        console.log('%c✅ Accessibility enhancements loaded', 'color: #2d5016; font-weight: bold;');
    }
    
    // Start
    init();
    
})();
