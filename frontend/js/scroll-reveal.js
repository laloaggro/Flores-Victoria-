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
    rootMargin: '0px 0px -100px 0px', // trigger 100px antes del bottom
    threshold: 0.15, // 15% visible para activar
  };

  // Callback cuando elementos entran/salen del viewport
  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Elemento visible, agregar clase 'revealed'
        entry.target.classList.add('revealed');

        // Opcional: dejar de observar después de revelar (animación única)
        // Comentar esta línea si quieres que las animaciones se repitan al hacer scroll
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
      // Para stagger-children, agregar delay progresivo
      if (element.parentElement && element.parentElement.classList.contains('stagger-children')) {
        element.style.transitionDelay = `${index * 0.15}s`;
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
