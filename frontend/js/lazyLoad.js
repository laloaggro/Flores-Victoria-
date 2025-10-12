// Sistema de Carga Perezosa para Imágenes
// Implementa carga perezosa para mejorar el rendimiento del frontend

class LazyLoader {
  constructor() {
    this.imageObserver = null;
    this.init();
  }

  init() {
    // Verificar si el Intersection Observer está disponible
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px' // Cargar 50px antes de que sea visible
      });
    }
  }

  // Observar una imagen para carga perezosa
  observeImage(img) {
    if (this.imageObserver) {
      this.imageObserver.observe(img);
    } else {
      // Fallback para navegadores que no soportan IntersectionObserver
      this.loadImage(img);
    }
  }

  // Cargar una imagen
  loadImage(img) {
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');
    
    if (!src) return;
    
    // Añadir clases para efectos de carga
    img.classList.add('lazy-loading');
    
    // Crear una imagen temporal para precargar
    const tempImage = new Image();
    
    tempImage.onload = () => {
      // Asignar las fuentes a la imagen real
      img.src = src;
      if (srcset) {
        img.srcset = srcset;
      }
      
      // Marcar como cargada
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
    };
    
    tempImage.onerror = () => {
      // Manejar errores de carga
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      img.src = '/assets/images/placeholder-error.jpg'; // Imagen de placeholder para errores
    };
    
    // Iniciar la precarga
    tempImage.src = src;
  }

  // Cargar todas las imágenes observadas
  loadAll() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => this.observeImage(img));
  }
}

// Inicializar el cargador perezoso cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.lazyLoader = new LazyLoader();
  window.lazyLoader.loadAll();
});

// Exportar la clase para uso en módulos ES6
// NOTA: No usamos export porque este archivo se carga directamente en el HTML
// como un script normal, no como un módulo ES6.