/**
 * Hero Carousel Component
 * Carousel moderno para la sección hero con auto-play y controles
 */

class HeroCarousel {
  constructor(selector, options = {}) {
    this.carousel = document.querySelector(selector);
    if (!this.carousel) return;

    this.options = {
      autoPlay: true,
      autoPlayInterval: 5000,
      pauseOnHover: true,
      showIndicators: true,
      showControls: true,
      transitionDuration: 600,
      ...options,
    };

    this.currentSlide = 0;
    this.slides = [];
    this.autoPlayTimer = null;
    this.isTransitioning = false;

    this.init();
  }

  init() {
    this.slides = Array.from(this.carousel.querySelectorAll('.hero-slide'));
    if (this.slides.length <= 1) return;

    this.createControls();
    this.createIndicators();
    this.setupEventListeners();
    this.showSlide(0);

    if (this.options.autoPlay) {
      this.startAutoPlay();
    }
  }

  createControls() {
    if (!this.options.showControls) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'hero-control hero-control-prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.setAttribute('aria-label', 'Slide anterior');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'hero-control hero-control-next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.setAttribute('aria-label', 'Slide siguiente');

    this.carousel.appendChild(prevBtn);
    this.carousel.appendChild(nextBtn);

    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
  }

  createIndicators() {
    if (!this.options.showIndicators) return;

    const indicators = document.createElement('div');
    indicators.className = 'hero-indicators';
    indicators.setAttribute('role', 'tablist');

    this.slides.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.className = 'hero-indicator';
      indicator.setAttribute('role', 'tab');
      indicator.setAttribute('aria-label', `Ir a slide ${index + 1}`);
      indicator.dataset.index = index;
      indicators.appendChild(indicator);
    });

    this.carousel.appendChild(indicators);
    this.indicators = Array.from(indicators.querySelectorAll('.hero-indicator'));
  }

  setupEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    if (this.indicators) {
      this.indicators.forEach((indicator) => {
        indicator.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          this.goToSlide(index);
        });
      });
    }

    if (this.options.pauseOnHover) {
      this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.carousel.addEventListener('mouseleave', () => {
        if (this.options.autoPlay) this.startAutoPlay();
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.carousel.matches(':hover')) return;
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Touch/swipe support
    this.setupTouchEvents();
  }

  setupTouchEvents() {
    let touchStartX = 0;
    let touchEndX = 0;

    this.carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    this.carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    });
  }

  handleSwipe(startX, endX) {
    const threshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }

  showSlide(index) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Update slides
    this.slides.forEach((slide, i) => {
      slide.classList.remove('active', 'slide-out-left', 'slide-out-right');
      slide.setAttribute('aria-hidden', 'true');

      if (i === index) {
        slide.classList.add('active');
        slide.setAttribute('aria-hidden', 'false');
      }
    });

    // Update indicators
    if (this.indicators) {
      this.indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
        indicator.setAttribute('aria-selected', i === index);
      });
    }

    this.currentSlide = index;

    setTimeout(() => {
      this.isTransitioning = false;
    }, this.options.transitionDuration);
  }

  next() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prev() {
    const prevIndex =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  goToSlide(index) {
    if (index === this.currentSlide || this.isTransitioning) return;
    this.showSlide(index);
    this.resetAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.options.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resetAutoPlay() {
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }
  }

  destroy() {
    this.stopAutoPlay();
    if (this.prevBtn) this.prevBtn.remove();
    if (this.nextBtn) this.nextBtn.remove();
    if (this.indicators) {
      this.indicators.forEach((ind) => ind.remove());
    }
  }
}

// Auto-inicializar si existe el elemento
document.addEventListener('DOMContentLoaded', () => {
  const heroCarousel = document.querySelector('.hero-carousel');
  if (heroCarousel) {
    window.heroCarouselInstance = new HeroCarousel('.hero-carousel', {
      autoPlay: true,
      autoPlayInterval: 5000,
      pauseOnHover: true,
    });
  }
});

export default HeroCarousel;
