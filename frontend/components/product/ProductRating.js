// ProductRating.js - Componente web para sistema de valoraciones de productos

class ProductRating extends HTMLElement {
  constructor() {
    super();
    this.stars = 5;
    this.rating = 0;
    this.readonly = false;
  }

  static get observedAttributes() {
    return ['rating', 'readonly'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'rating') {
      this.rating = parseFloat(newValue) || 0;
    } else if (name === 'readonly') {
      this.readonly = newValue !== null;
    }

    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.rating = parseFloat(this.getAttribute('rating')) || 0;
    this.readonly = this.hasAttribute('readonly');
    this.render();
    if (!this.readonly) {
      this.setupEventListeners();
    }
  }

  render() {
    const fullStars = Math.floor(this.rating);
    const hasHalfStar = this.rating % 1 >= 0.5;
    const emptyStars = this.stars - fullStars - (hasHalfStar ? 1 : 0);

    const starsHTML = `
            ${'<i class="fas fa-star star-full"></i>'.repeat(fullStars)}
            ${hasHalfStar ? '<i class="fas fa-star-half-alt star-half"></i>' : ''}
            ${'<i class="far fa-star star-empty"></i>'.repeat(emptyStars)}
        `;

    this.innerHTML = `
            <div class="product-rating ${this.readonly ? 'readonly' : 'interactive'}">
                <div class="stars-container">
                    ${starsHTML}
                </div>
                <span class="rating-text">${this.rating.toFixed(1)}</span>
                ${!this.readonly ? '<span class="rating-label">Haz clic para calificar</span>' : ''}
            </div>
        `;
  }

  setupEventListeners() {
    const starsContainer = this.querySelector('.stars-container');
    if (!starsContainer) return;

    starsContainer.addEventListener('mouseover', (e) => {
      if (
        e.target.classList.contains('fa-star') ||
        e.target.classList.contains('fa-star-half-alt') ||
        e.target.classList.contains('fa-star-empty')
      ) {
        const starIndex = Array.from(starsContainer.children).indexOf(e.target.parentElement);
        this.highlightStars(starIndex + 1);
      }
    });

    starsContainer.addEventListener('mouseout', () => {
      this.render();
    });

    starsContainer.addEventListener('click', (e) => {
      if (
        e.target.classList.contains('fa-star') ||
        e.target.classList.contains('fa-star-half-alt') ||
        e.target.classList.contains('fa-star-empty')
      ) {
        const starIndex = Array.from(starsContainer.children).indexOf(e.target.parentElement);
        this.setRating(starIndex + 1);
      }
    });
  }

  highlightStars(count) {
    const starsContainer = this.querySelector('.stars-container');
    if (!starsContainer) return;

    Array.from(starsContainer.children).forEach((star, index) => {
      const starIcon = star.querySelector('i');
      if (index < count) {
        starIcon.className = 'fas fa-star star-full';
      } else {
        starIcon.className = 'far fa-star star-empty';
      }
    });
  }

  setRating(rating) {
    this.rating = rating;
    this.setAttribute('rating', rating);

    // Disparar evento de cambio de valoración
    this.dispatchEvent(
      new CustomEvent('ratingChange', {
        detail: { rating: this.rating },
        bubbles: true,
      })
    );

    this.render();
  }

  getRating() {
    return this.rating;
  }
}

// Registrar el componente
customElements.define('product-rating', ProductRating);

export default ProductRating;
