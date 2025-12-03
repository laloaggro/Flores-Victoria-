/**
 * Scroll Reveal Animation Handler
 * Adds 'revealed' class to elements with .reveal, .reveal-left, .reveal-right, etc.
 * when they enter the viewport
 */

(function () {
  'use strict';

  // Configuración del IntersectionObserver
  const observerOptions = {
    root: null, // viewport
    rootMargin: '50px 0px 50px 0px', // trigger 50px antes de entrar Y después de salir
    threshold: [0, 0.1, 0.5], // múltiples thresholds para mejor detección
  };

  // Callback cuando elementos entran/salen del viewport
  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      // Activar tan pronto como cualquier parte del elemento sea visible
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        // Elemento visible, agregar clase 'revealed'
        entry.target.classList.add('revealed');

        // Forzar reflow para asegurar que la animación se aplique inmediatamente
        entry.target.offsetHeight;

        // Dejar de observar después de revelar (animación única)
        // Esto mejora el rendimiento en scroll rápido
        observer.unobserve(entry.target);
      }
    });
  };

  // Crear el observer
  const revealObserver = new IntersectionObserver(observerCallback, observerOptions);

  // Inicializar cuando el DOM esté listo
  function initScrollReveal() {
    // Seleccionar todos los elementos con clases de reveal
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children > *'
    );

    // Observar cada elemento
    revealElements.forEach((element, index) => {
      // Para stagger-children, agregar delay progresivo más corto
      if (element.parentElement && element.parentElement.classList.contains('stagger-children')) {
        // Delay reducido de 150ms a 80ms para scroll rápido
        element.style.transitionDelay = `${index * 0.08}s`;
      }

      revealObserver.observe(element);
    });

    console.log(`[Scroll Reveal] Observando ${revealElements.length} elementos`);
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    // DOM ya está listo
    initScrollReveal();
  }

  // Fallback para navegadores sin IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    console.warn(
      '[Scroll Reveal] IntersectionObserver no soportado. Mostrando todos los elementos.'
    );
    // Revelar todo inmediatamente
    document.addEventListener('DOMContentLoaded', () => {
      const revealElements = document.querySelectorAll(
        '.reveal, .reveal-left, .reveal-right, .reveal-scale'
      );
      revealElements.forEach((el) => el.classList.add('revealed'));
    });
  }
})();
