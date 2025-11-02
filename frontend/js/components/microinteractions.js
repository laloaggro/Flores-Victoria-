/**
 * 🎯 FLORES VICTORIA - MICROINTERACCIONES CONTROLLER
 * ==================================================
 * Sistema JavaScript para activar efectos UI avanzados
 * Incluye: Ripple, Card 3D, Magnetic buttons, Parallax, Scroll reveals
 */

class MicroInteractions {
  constructor() {
    this.init();
  }

  init() {
    this.initRippleEffect();
    this.initCard3D();
    this.initMagneticButtons();
    this.initParallax();
    this.initScrollReveal();
    this.initCountUp();
    this.initFloatingLabels();
    console.log('✨ Microinteractions initialized');
  }

  /**
   * RIPPLE EFFECT (Material Design)
   * Efecto de ondas al hacer click en botones
   */
  initRippleEffect() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.ripple');
      if (!target) return;

      const ripple = document.createElement('span');
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        top: ${y}px;
        left: ${x}px;
        transform: scale(0);
        animation: rippleAnim 0.6s ease-out;
        pointer-events: none;
      `;

      target.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });

    // Añadir keyframes dinámicamente
    if (!document.querySelector('#ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes rippleAnim {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * CARD 3D TILT EFFECT
   * Efecto de inclinación 3D al mover el mouse sobre cards
   */
  initCard3D() {
    const cards = document.querySelectorAll('.card-tilt');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // -10 a 10 grados
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale3d(1.05, 1.05, 1.05)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  /**
   * MAGNETIC BUTTONS
   * Botones que siguen el cursor con efecto magnético
   */
  initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-magnetic');

    buttons.forEach((button) => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Limitar el movimiento
        const moveX = x * 0.3;
        const moveY = y * 0.3;

        button.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0) scale(1)';
      });
    });
  }

  /**
   * PARALLAX EFFECT
   * Efecto parallax en hero section
   */
  initParallax() {
    const parallaxElements = document.querySelectorAll('.hero-parallax-bg');

    if (parallaxElements.length === 0) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach((element) => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    };

    // Usar throttle para mejor performance
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * SCROLL REVEAL ANIMATIONS
   * Animaciones al hacer scroll y elementos entran en viewport
   */
  initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    );

    if (revealElements.length === 0) return;

    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Opcional: dejar de observar después de revelar
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach((el) => observer.observe(el));
  }

  /**
   * COUNT UP ANIMATION
   * Contador animado para números
   */
  initCountUp() {
    const counters = document.querySelectorAll('.count-up');

    if (counters.length === 0) return;

    const animateCounter = (counter) => {
      const target = parseInt(counter.dataset.target || counter.textContent);
      const duration = parseInt(counter.dataset.duration || 2000);
      const start = 0;
      const increment = target / (duration / 16); // ~60fps

      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current).toLocaleString();
        }
      }, 16);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /**
   * FLOATING LABELS
   * Mejorar inputs con labels flotantes
   */
  initFloatingLabels() {
    const inputs = document.querySelectorAll('.input-float input, .input-float textarea');

    inputs.forEach((input) => {
      // Agregar placeholder invisible para detectar :not(:placeholder-shown)
      if (!input.placeholder) {
        input.placeholder = ' ';
      }

      // Manejar autofill
      input.addEventListener('animationstart', (e) => {
        if (e.animationName === 'onAutoFillStart') {
          input.classList.add('has-value');
        }
      });
    });

    // Añadir estilos para detectar autofill
    if (!document.querySelector('#autofill-detection')) {
      const style = document.createElement('style');
      style.id = 'autofill-detection';
      style.textContent = `
        @keyframes onAutoFillStart {
          from { /*dummy*/ }
          to { /*dummy*/ }
        }
        input:-webkit-autofill {
          animation-name: onAutoFillStart;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * SMOOTH SCROLL TO ANCHOR
   * Scroll suave a anclas con offset
   */
  static smoothScrollToAnchor(selector, offset = 80) {
    document.querySelectorAll(selector).forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;

        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  }

  /**
   * ADD STAGGER ANIMATION TO CHILDREN
   * Añadir animación en cascada a elementos hijos
   */
  static addStaggerAnimation(parentSelector, childSelector = '> *', delay = 100) {
    const parent = document.querySelector(parentSelector);
    if (!parent) return;

    const children = parent.querySelectorAll(childSelector);
    children.forEach((child, index) => {
      child.classList.add('stagger-item');
      child.style.animationDelay = `${index * delay}ms`;
    });
  }

  /**
   * LAZY LOAD IMAGES WITH BLUR-UP
   * Carga lazy con efecto blur-up
   */
  static initLazyLoadBlur() {
    const images = document.querySelectorAll('img[data-src]');

    if (images.length === 0 || !('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;

          if (src) {
            // Crear imagen temporal para precargar
            const tempImg = new Image();
            tempImg.onload = () => {
              img.src = src;
              img.classList.add('loaded');
              img.removeAttribute('data-src');
            };
            tempImg.src = src;
          }

          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => {
      // Añadir estilo blur inicial si no existe
      if (!img.classList.contains('blur-up')) {
        img.classList.add('blur-up');
      }
      imageObserver.observe(img);
    });

    // Añadir estilos para blur-up
    if (!document.querySelector('#blur-up-styles')) {
      const style = document.createElement('style');
      style.id = 'blur-up-styles';
      style.textContent = `
        .blur-up {
          filter: blur(5px);
          transition: filter 0.3s ease;
        }
        .blur-up.loaded {
          filter: blur(0);
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.microInteractions = new MicroInteractions();
    // Inicializar scroll suave en todos los enlaces con ancla
    MicroInteractions.smoothScrollToAnchor('a[href^="#"]');
  });
} else {
  window.microInteractions = new MicroInteractions();
  MicroInteractions.smoothScrollToAnchor('a[href^="#"]');
}

// Exportar para uso modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MicroInteractions;
}
