// Efectos visuales y animaciones para el frontend

class UIAnimations {
  constructor() {
    this.init();
  }

  init() {
    // Inicializar efectos cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
      this.initScrollAnimations();
      this.initHoverEffects();
      this.initPageTransitions();
    });
  }

  // Animaciones al hacer scroll
  initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observar elementos animables
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => observer.observe(el));
  }

  // Efectos de hover mejorados
  initHoverEffects() {
    const cards = document.querySelectorAll('.product-card, .service-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('hovered');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
      });
    });
  }

  // Transiciones de página
  initPageTransitions() {
    const links = document.querySelectorAll('a[href]:not([target="_blank"])');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        // Excluir enlaces externos y anclas
        const href = link.getAttribute('href');
        if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) {
          return;
        }

        e.preventDefault();
        
        // Añadir clase de transición
        document.body.classList.add('page-transition');
        
        // Navegar después de la animación
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
  }

  // Mostrar notificación
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Cerrar notificación automáticamente
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('fade-in');
        notification.classList.add('fade-out');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
    
    // Cerrar con botón
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('fade-in');
      notification.classList.add('fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
  }

  // Mostrar spinner de carga
  showLoadingSpinner(container) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('aria-label', 'Cargando...');
    container.appendChild(spinner);
    return spinner;
  }

  // Ocultar spinner de carga
  hideLoadingSpinner(spinner) {
    if (spinner && spinner.parentNode) {
      spinner.parentNode.removeChild(spinner);
    }
  }

  // Efecto de escritura para textos
  typewriterEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    };
    
    type();
  }
}

// Inicializar animaciones
window.uiAnimations = new UIAnimations();

// Exportar para uso en módulos ES6
// NOTA: No usamos export porque este archivo se carga directamente en el HTML
// como un script normal, no como un módulo ES6.