// Efectos visuales específicos para páginas

class PageEffects {
  constructor() {
    this.init();
  }

  init() {
    // Inicializar efectos cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
      this.initHomePageEffects();
      this.initProductPageEffects();
      this.initContactPageEffects();
      this.addGlobalEffects();
    });
  }

  // Efectos específicos para la página de inicio
  initHomePageEffects() {
    // Efecto de partículas de fondo
    this.createParticleBackground();
    
    // Efecto de escritura en el encabezado principal
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      const originalText = heroTitle.textContent;
      heroTitle.textContent = '';
      heroTitle.classList.add('typewriter');
      
      // Usar el efecto de escritura si está disponible
      if (window.uiAnimations && window.uiAnimations.typewriterEffect) {
        setTimeout(() => {
          window.uiAnimations.typewriterEffect(heroTitle, originalText, 100);
        }, 500);
      }
    }
    
    // Efecto de parallax en la sección hero
    this.initParallaxEffect();
  }

  // Efectos específicos para la página de productos
  initProductPageEffects() {
    // Añadir efectos hover a las tarjetas de productos
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('glow');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('glow');
      });
    });
  }

  // Efectos específicos para la página de contacto
  initContactPageEffects() {
    // Añadir efectos a los campos del formulario
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
      });
    });
  }

  // Efectos globales para todas las páginas
  addGlobalEffects() {
    // Añadir efecto de desplazamiento suave para enlaces internos
    this.initSmoothScrolling();
    
    // Añadir efecto de carga progresiva a imágenes
    this.initProgressiveImageLoading();
    
    // Añadir efecto de botón pulsante a elementos importantes
    this.initPulseEffects();
  }

  // Crear fondo de partículas animadas
  createParticleBackground() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles-background';
    
    // Crear 30 partículas
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Tamaño aleatorio
      const size = Math.random() * 10 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Posición aleatoria
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Color aleatorio con transparencia
      const colors = ['rgba(255, 107, 107, 0.5)', 'rgba(78, 205, 196, 0.5)', 'rgba(69, 183, 209, 0.5)'];
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Animación aleatoria
      particle.style.animationDuration = `${Math.random() * 10 + 15}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      particleContainer.appendChild(particle);
    }
    
    document.body.appendChild(particleContainer);
  }

  // Inicializar efecto de parallax
  initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    window.addEventListener('scroll', () => {
      const scrollPosition = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;
        const yPos = -(scrollPosition * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // Inicializar desplazamiento suave
  initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Ajustar por el header
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Inicializar carga progresiva de imágenes
  initProgressiveImageLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          
          if (src) {
            // Añadir clase de carga
            img.classList.add('progressive-load');
            
            // Cargar imagen
            const newImg = new Image();
            newImg.onload = () => {
              img.src = src;
              img.classList.remove('progressive-load');
              img.classList.add('loaded');
            };
            newImg.src = src;
            
            observer.unobserve(img);
          }
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }

  // Inicializar efectos de pulso
  initPulseEffects() {
    const pulseElements = document.querySelectorAll('.pulse-effect');
    pulseElements.forEach(element => {
      // Añadir clase de pulso con retraso aleatorio
      const delay = Math.random() * 2;
      element.style.animationDelay = `${delay}s`;
      element.classList.add('pulse');
    });
  }
}

// Inicializar efectos de página
window.pageEffects = new PageEffects();

// Exportar para uso en módulos ES6
// NOTA: No usamos export porque este archivo se carga directamente en el HTML
// como un script normal, no como un módulo ES6.