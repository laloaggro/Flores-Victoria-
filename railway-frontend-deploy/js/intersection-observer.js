/**
 * Intersection Observer para animaciones progresivas
 * Reemplaza dependencia de clases .reveal con animaciones basadas en viewport
 */

// Configuración del observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

// Callback cuando elementos entran al viewport
const observerCallback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-visible');
      // Opcional: dejar de observar después de animar
      observer.unobserve(entry.target);
    }
  });
};

// Crear observer
const observer = new IntersectionObserver(observerCallback, observerOptions);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Observar elementos con clase .animate-on-scroll
  const animatedElements = document.querySelectorAll('.animate-on-scroll, .card-3d, .product-card');

  animatedElements.forEach((el) => {
    // Agregar clase inicial
    el.classList.add('fade-in-ready');
    // Comenzar a observar
    observer.observe(el);
  });
});

// CSS classes que se necesitan (agregar a style.css)
/*
.fade-in-ready {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-in-visible {
  opacity: 1;
  transform: translateY(0);
}
*/
