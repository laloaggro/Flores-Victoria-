/**
 * Component Loader - Flores Victoria v2.0
 * Carga componentes HTML reutilizables (header/footer) dinámicamente
 */

(function() {
    'use strict';
    
    /**
     * Carga un componente HTML en el elemento especificado
     * @param {string} componentName - Nombre del componente (ej: 'header', 'footer')
     * @param {string} targetSelector - Selector CSS del contenedor
     */
    async function loadComponent(componentName, targetSelector) {
        try {
            const response = await fetch(`/components/${componentName}.html`);
            
            if (!response.ok) {
                console.warn(`No se pudo cargar el componente ${componentName}: ${response.status}`);
                return;
            }
            
            const html = await response.text();
            const target = document.querySelector(targetSelector);
            
            if (target) {
                target.innerHTML = html;
                console.log(`✓ Componente ${componentName} cargado correctamente`);
                
                // Emitir evento personalizado para que otros scripts sepan que el componente está listo
                document.dispatchEvent(new CustomEvent(`component:${componentName}:loaded`));
            } else {
                console.warn(`No se encontró el selector ${targetSelector} para el componente ${componentName}`);
            }
        } catch (error) {
            console.error(`Error al cargar el componente ${componentName}:`, error);
        }
    }
    
    /**
     * Inicializa la carga de componentes al cargar el DOM
     */
    function init() {
        // Verificar si existen los marcadores de posición
        const headerPlaceholder = document.querySelector('[data-component="header"]');
        const footerPlaceholder = document.querySelector('[data-component="footer"]');
        
        // Cargar header si existe el marcador
        if (headerPlaceholder) {
            loadComponent('header', '[data-component="header"]');
        }
        
        // Cargar footer si existe el marcador
        if (footerPlaceholder) {
            loadComponent('footer', '[data-component="footer"]');
        }
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exponer función globalmente para uso manual si es necesario
    window.loadComponent = loadComponent;
})();
