// ProductReviews.js - Componente web para reseñas de productos

class ProductReviews extends HTMLElement {
  constructor() {
    super();
    this.productId = null;
    this.reviews = [];
  }

  static get observedAttributes() {
    return ['product-id'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'product-id' && newValue !== oldValue) {
      this.productId = newValue;
      this.fetchReviews();
    }
  }

  connectedCallback() {
    this.productId = this.getAttribute('product-id');
    this.render();
    if (this.productId) {
      this.fetchReviews();
    }
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
            <div class="product-reviews">
                <div class="reviews-header">
                    <h3>Reseñas de Clientes</h3>
                    <button id="add-review-btn" class="btn btn-secondary">Escribir Reseña</button>
                </div>
                
                <div id="reviews-list" class="reviews-list">
                    <p class="no-reviews">Cargando reseñas...</p>
                </div>
                
                <div id="add-review-form" class="add-review-form" style="display: none;">
                    <h4>Escribir una Reseña</h4>
                    <form id="review-form">
                        <div class="form-group">
                            <label for="review-rating">Calificación</label>
                            <div class="rating-input">
                                <input type="radio" id="star5" name="rating" value="5" required>
                                <label for="star5" title="5 estrellas">★</label>
                                <input type="radio" id="star4" name="rating" value="4">
                                <label for="star4" title="4 estrellas">★</label>
                                <input type="radio" id="star3" name="rating" value="3">
                                <label for="star3" title="3 estrellas">★</label>
                                <input type="radio" id="star2" name="rating" value="2">
                                <label for="star2" title="2 estrellas">★</label>
                                <input type="radio" id="star1" name="rating" value="1">
                                <label for="star1" title="1 estrella">★</label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="review-comment">Comentario</label>
                            <textarea id="review-comment" name="comment" rows="4" placeholder="Comparte tu experiencia con este producto..." required></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" id="cancel-review" class="btn btn-outline">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Enviar Reseña</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
  }

  setupEventListeners() {
    const addReviewBtn = this.querySelector('#add-review-btn');
    const cancelReviewBtn = this.querySelector('#cancel-review');
    const reviewForm = this.querySelector('#review-form');
        
    if (addReviewBtn) {
      addReviewBtn.addEventListener('click', () => {
        this.showReviewForm();
      });
    }
        
    if (cancelReviewBtn) {
      cancelReviewBtn.addEventListener('click', () => {
        this.hideReviewForm();
      });
    }
        
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitReview();
      });
    }
  }

  async fetchReviews() {
    if (!this.productId) return;
        
    try {
      const response = await fetch(`/api/reviews/product/${this.productId}`);
      const data = await response.json();
            
      if (response.ok) {
        this.reviews = data.reviews || [];
        this.displayReviews();
      } else {
        this.displayError('Error al cargar las reseñas');
      }
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      this.displayError('Error de conexión al cargar las reseñas');
    }
  }

  displayReviews() {
    const reviewsList = this.querySelector('#reviews-list');
    if (!reviewsList) return;
        
    if (this.reviews.length === 0) {
      reviewsList.innerHTML = '<p class="no-reviews">No hay reseñas para este producto aún. ¡Sé el primero en escribir una!</p>';
      return;
    }
        
    const reviewsHTML = this.reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">
                        <span class="author-name">${review.user_name || 'Cliente'}</span>
                        <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="review-rating">
                        ${this.renderStars(review.rating)}
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.comment || ''}</p>
                </div>
            </div>
        `).join('');
        
    reviewsList.innerHTML = reviewsHTML;
  }

  renderStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsHTML += '<i class="fas fa-star star-full"></i>';
      } else {
        starsHTML += '<i class="far fa-star star-empty"></i>';
      }
    }
    return starsHTML;
  }

  displayError(message) {
    const reviewsList = this.querySelector('#reviews-list');
    if (reviewsList) {
      reviewsList.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }

  showReviewForm() {
    const addReviewForm = this.querySelector('#add-review-form');
    const addReviewBtn = this.querySelector('#add-review-btn');
        
    if (addReviewForm) {
      addReviewForm.style.display = 'block';
    }
        
    if (addReviewBtn) {
      addReviewBtn.style.display = 'none';
    }
  }

  hideReviewForm() {
    const addReviewForm = this.querySelector('#add-review-form');
    const addReviewBtn = this.querySelector('#add-review-btn');
    const reviewForm = this.querySelector('#review-form');
        
    if (addReviewForm) {
      addReviewForm.style.display = 'none';
    }
        
    if (addReviewBtn) {
      addReviewBtn.style.display = 'block';
    }
        
    // Limpiar formulario
    if (reviewForm) {
      reviewForm.reset();
    }
  }

  async submitReview() {
    if (!this.productId) return;
        
    const rating = this.querySelector('input[name="rating"]:checked');
    const comment = this.querySelector('#review-comment');
        
    if (!rating || !comment) return;
        
    const reviewData = {
      product_id: this.productId,
      rating: parseInt(rating.value),
      comment: comment.value
    };
        
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // En un entorno real, aquí se añadiría el token de autenticación
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
            
      const data = await response.json();
            
      if (response.ok) {
        // Actualizar lista de reseñas
        this.fetchReviews();
        this.hideReviewForm();
                
        // Mostrar mensaje de éxito
        this.showNotification('Reseña enviada exitosamente', 'success');
      } else {
        this.showNotification(data.error || 'Error al enviar la reseña', 'error');
      }
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      this.showNotification('Error de conexión al enviar la reseña', 'error');
    }
  }

  showNotification(message, type) {
    // Crear notificación si no existe
    if (!document.querySelector('#review-notification')) {
      const notification = document.createElement('div');
      notification.id = 'review-notification';
      notification.className = `notification notification-${type}`;
      notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 4px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                ${type === 'success' ? 'background-color: #4CAF50;' : ''}
                ${type === 'error' ? 'background-color: #F44336;' : ''}
            `;
      document.body.appendChild(notification);
    }
        
    const notification = document.querySelector('#review-notification');
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.style.display = 'block';
        
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
}

// Registrar el componente
customElements.define('product-reviews', ProductReviews);

export default ProductReviews;