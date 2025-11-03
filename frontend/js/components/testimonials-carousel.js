/**
 * Testimonials Carousel Component
 * Displays customer testimonials in an auto-playing carousel
 */

class TestimonialsCarousel {
  constructor(options = {}) {
    this.options = {
      container: '.testimonials-carousel',
      autoPlay: true,
      interval: 5000,
      pauseOnHover: true,
      showIndicators: true,
      showControls: true,
      itemsPerView: 3,
      gap: 24,
      responsive: {
        768: { itemsPerView: 2 },
        480: { itemsPerView: 1 },
      },
      ...options,
    };

    this.currentIndex = 0;
    this.testimonials = [];
    this.autoPlayInterval = null;
    this.container = null;
    this.track = null;
    this.isPaused = false;
  }

  async init() {
    this.container = document.querySelector(this.options.container);
    if (!this.container) {
      console.warn('Testimonials carousel container not found');
      return;
    }

    await this.loadTestimonials();
    this.render();
    this.attachEventListeners();
    
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }

    // Handle responsive changes
    window.addEventListener('resize', () => this.handleResize());
  }

  async loadTestimonials() {
    try {
      // Try to fetch from API
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        this.testimonials = data.testimonials || data;
      } else {
        // Fallback to demo data
        this.testimonials = this.getDemoTestimonials();
      }
    } catch (error) {
      console.warn('Error loading testimonials, using demo data:', error);
      this.testimonials = this.getDemoTestimonials();
    }
  }

  getDemoTestimonials() {
    return [
      {
        id: 1,
        name: 'María González',
        role: 'Cliente Frecuente',
        avatar: '/images/avatars/avatar1.jpg',
        rating: 5,
        text: 'Excelente servicio y las flores siempre llegan frescas y hermosas. El arreglo para el cumpleaños de mi madre fue perfecto.',
        date: '2024-10-15',
      },
      {
        id: 2,
        name: 'Carlos Ramírez',
        role: 'Comprador Verificado',
        avatar: '/images/avatars/avatar2.jpg',
        rating: 5,
        text: 'La mejor florería de la ciudad. Siempre encuentro lo que busco y el personal es muy atento. Recomendado 100%.',
        date: '2024-10-12',
      },
      {
        id: 3,
        name: 'Ana Martínez',
        role: 'Cliente Premium',
        avatar: '/images/avatars/avatar3.jpg',
        rating: 4,
        text: 'Hermosos arreglos florales y entrega puntual. Los recomiendo para cualquier ocasión especial.',
        date: '2024-10-08',
      },
      {
        id: 4,
        name: 'Luis Fernández',
        role: 'Cliente Satisfecho',
        avatar: '/images/avatars/avatar4.jpg',
        rating: 5,
        text: 'Increíble calidad y atención al cliente. Las flores duraron más de una semana. Definitivamente volveré a comprar.',
        date: '2024-10-05',
      },
      {
        id: 5,
        name: 'Patricia López',
        role: 'Comprador Verificado',
        avatar: '/images/avatars/avatar5.jpg',
        rating: 5,
        text: 'El mejor servicio de entrega de flores que he usado. Siempre llegan a tiempo y en perfecto estado.',
        date: '2024-10-01',
      },
      {
        id: 6,
        name: 'Roberto Sánchez',
        role: 'Cliente Frecuente',
        avatar: '/images/avatars/avatar6.jpg',
        rating: 4,
        text: 'Gran variedad de flores y excelente presentación. El personal siempre me ayuda a elegir el arreglo perfecto.',
        date: '2024-09-28',
      },
    ];
  }

  render() {
    const itemsPerView = this.getItemsPerView();
    
    this.container.innerHTML = `
      <div class="testimonials-header">
        <h2>Lo Que Dicen Nuestros Clientes</h2>
        <p>Miles de clientes satisfechos confían en nosotros</p>
      </div>
      
      <div class="testimonials-wrapper">
        ${this.options.showControls ? `
          <button class="testimonial-control prev" aria-label="Anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
        ` : ''}
        
        <div class="testimonials-track-container">
          <div class="testimonials-track" style="gap: ${this.options.gap}px;">
            ${this.testimonials.map(testimonial => this.renderTestimonial(testimonial)).join('')}
          </div>
        </div>
        
        ${this.options.showControls ? `
          <button class="testimonial-control next" aria-label="Siguiente">
            <i class="fas fa-chevron-right"></i>
          </button>
        ` : ''}
      </div>
      
      ${this.options.showIndicators ? this.renderIndicators() : ''}
      
      <div class="testimonials-stats">
        <div class="stat">
          <div class="stat-number">${this.testimonials.length}+</div>
          <div class="stat-label">Reseñas</div>
        </div>
        <div class="stat">
          <div class="stat-number">${this.getAverageRating()}</div>
          <div class="stat-label">Calificación Promedio</div>
        </div>
        <div class="stat">
          <div class="stat-number">98%</div>
          <div class="stat-label">Satisfacción</div>
        </div>
      </div>
    `;

    this.track = this.container.querySelector('.testimonials-track');
    this.updateTrackPosition();
  }

  renderTestimonial(testimonial) {
    const stars = this.renderStars(testimonial.rating);
    const initials = this.getInitials(testimonial.name);

    return `
      <div class="testimonial-card">
        <div class="testimonial-header">
          <div class="testimonial-avatar">
            ${testimonial.avatar 
              ? `<img src="${testimonial.avatar}" alt="${testimonial.name}" loading="lazy">` 
              : `<div class="avatar-placeholder">${initials}</div>`
            }
          </div>
          <div class="testimonial-author">
            <h4>${testimonial.name}</h4>
            <p class="testimonial-role">${testimonial.role}</p>
          </div>
        </div>
        
        <div class="testimonial-rating">
          ${stars}
        </div>
        
        <p class="testimonial-text">${testimonial.text}</p>
        
        <div class="testimonial-footer">
          <span class="testimonial-date">
            <i class="far fa-calendar"></i>
            ${this.formatDate(testimonial.date)}
          </span>
          <span class="testimonial-verified">
            <i class="fas fa-check-circle"></i>
            Compra Verificada
          </span>
        </div>
      </div>
    `;
  }

  renderStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('<i class="fas fa-star"></i>');
      } else if (i - 0.5 <= rating) {
        stars.push('<i class="fas fa-star-half-alt"></i>');
      } else {
        stars.push('<i class="far fa-star"></i>');
      }
    }
    return stars.join('');
  }

  renderIndicators() {
    const itemsPerView = this.getItemsPerView();
    const totalSlides = Math.ceil(this.testimonials.length / itemsPerView);
    const indicators = [];

    for (let i = 0; i < totalSlides; i++) {
      indicators.push(`
        <button 
          class="testimonial-indicator ${i === 0 ? 'active' : ''}" 
          data-index="${i}"
          aria-label="Ir a diapositiva ${i + 1}"
        ></button>
      `);
    }

    return `<div class="testimonials-indicators">${indicators.join('')}</div>`;
  }

  attachEventListeners() {
    // Previous/Next buttons
    const prevBtn = this.container.querySelector('.testimonial-control.prev');
    const nextBtn = this.container.querySelector('.testimonial-control.next');

    prevBtn?.addEventListener('click', () => this.prev());
    nextBtn?.addEventListener('click', () => this.next());

    // Indicators
    const indicators = this.container.querySelectorAll('.testimonial-indicator');
    indicators.forEach((indicator) => {
      indicator.addEventListener('click', () => {
        const index = parseInt(indicator.dataset.index);
        this.goToSlide(index);
      });
    });

    // Pause on hover
    if (this.options.pauseOnHover) {
      const wrapper = this.container.querySelector('.testimonials-wrapper');
      wrapper?.addEventListener('mouseenter', () => this.pause());
      wrapper?.addEventListener('mouseleave', () => this.resume());
    }

    // Touch/Swipe support
    this.setupTouchEvents();

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isInView()) return;

      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }

  setupTouchEvents() {
    let startX = 0;
    let isDragging = false;

    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.pause();
    });

    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });

    this.track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;

      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }

      this.resume();
    });
  }

  next() {
    const itemsPerView = this.getItemsPerView();
    const maxIndex = Math.ceil(this.testimonials.length / itemsPerView) - 1;
    this.currentIndex = (this.currentIndex + 1) % (maxIndex + 1);
    this.updateTrackPosition();
    this.updateIndicators();
  }

  prev() {
    const itemsPerView = this.getItemsPerView();
    const maxIndex = Math.ceil(this.testimonials.length / itemsPerView) - 1;
    this.currentIndex = this.currentIndex === 0 ? maxIndex : this.currentIndex - 1;
    this.updateTrackPosition();
    this.updateIndicators();
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateTrackPosition();
    this.updateIndicators();
  }

  updateTrackPosition() {
    if (!this.track) return;

    const itemsPerView = this.getItemsPerView();
    const cardWidth = (this.track.parentElement.offsetWidth - (this.options.gap * (itemsPerView - 1))) / itemsPerView;
    const offset = -(this.currentIndex * (cardWidth + this.options.gap) * itemsPerView);

    this.track.style.transform = `translateX(${offset}px)`;
  }

  updateIndicators() {
    const indicators = this.container.querySelectorAll('.testimonial-indicator');
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentIndex);
    });
  }

  startAutoPlay() {
    if (this.autoPlayInterval) return;

    this.autoPlayInterval = setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, this.options.interval);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  handleResize() {
    this.updateTrackPosition();
  }

  getItemsPerView() {
    const width = window.innerWidth;
    
    for (const [breakpoint, config] of Object.entries(this.options.responsive)) {
      if (width <= parseInt(breakpoint)) {
        return config.itemsPerView;
      }
    }
    
    return this.options.itemsPerView;
  }

  getAverageRating() {
    if (this.testimonials.length === 0) return '0.0';
    
    const sum = this.testimonials.reduce((acc, t) => acc + t.rating, 0);
    const avg = sum / this.testimonials.length;
    return avg.toFixed(1);
  }

  getInitials(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  isInView() {
    if (!this.container) return false;
    
    const rect = this.container.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  destroy() {
    this.stopAutoPlay();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.testimonials-carousel');
  if (container) {
    window.testimonialsCarousel = new TestimonialsCarousel();
    window.testimonialsCarousel.init();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestimonialsCarousel;
}
