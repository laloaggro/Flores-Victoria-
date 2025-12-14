/**
 * Sistema de Reseñas con Estrellas - Flores Victoria
 * Rating visual + Schema.org AggregateRating
 */

/* eslint-disable no-console */

const ReviewsSystem = {
  // Reseñas de ejemplo (en producción vendrían de la API)
  sampleReviews: [
    {
      id: 1,
      name: 'María García',
      rating: 5,
      comment: 'Hermosas flores, llegaron frescas y a tiempo. ¡Excelente servicio!',
      date: '2025-12-10',
      verified: true,
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      rating: 5,
      comment: 'Mi esposa quedó encantada con el arreglo de rosas. Muy recomendado.',
      date: '2025-12-08',
      verified: true,
    },
    {
      id: 3,
      name: 'Ana Martínez',
      rating: 4,
      comment: 'Buena calidad, aunque el envío tardó un poco más de lo esperado.',
      date: '2025-12-05',
      verified: true,
    },
    {
      id: 4,
      name: 'Luis Hernández',
      rating: 5,
      comment: 'Pedí flores para el funeral de mi abuela, muy respetuosos y profesionales.',
      date: '2025-12-01',
      verified: true,
    },
    {
      id: 5,
      name: 'Patricia López',
      rating: 5,
      comment: 'Las orquídeas más bonitas que he comprado. Duran muchísimo.',
      date: '2025-11-28',
      verified: true,
    },
    {
      id: 6,
      name: 'Roberto Sánchez',
      rating: 4,
      comment: 'Buen servicio al cliente, resolvieron mi duda rápidamente.',
      date: '2025-11-25',
      verified: false,
    },
    {
      id: 7,
      name: 'Carmen Díaz',
      rating: 5,
      comment: 'Segunda vez que compro, siempre excelente calidad.',
      date: '2025-11-20',
      verified: true,
    },
    {
      id: 8,
      name: 'Fernando Torres',
      rating: 5,
      comment: 'El bouquet de novia quedó espectacular. ¡Gracias!',
      date: '2025-11-15',
      verified: true,
    },
  ],

  /**
   * Generar HTML de estrellas
   */
  generateStars(rating, size = 'md') {
    const sizes = { sm: '14px', md: '18px', lg: '24px' };
    const starSize = sizes[size] || sizes.md;

    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += `<span style="color: #FFB800; font-size: ${starSize};">★</span>`;
      } else if (i - 0.5 <= rating) {
        stars += `<span style="color: #FFB800; font-size: ${starSize};">☆</span>`;
      } else {
        stars += `<span style="color: #DDD; font-size: ${starSize};">★</span>`;
      }
    }
    return stars;
  },

  /**
   * Calcular estadísticas de reseñas
   */
  calculateStats(reviews) {
    if (!reviews || reviews.length === 0) {
      return { average: 0, total: 0, distribution: {} };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => distribution[r.rating]++);

    return { average, total, distribution };
  },

  /**
   * Generar Schema.org para producto con reseñas
   */
  generateProductSchema(product, reviews) {
    const stats = this.calculateStats(reviews);

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: `https://flores-victoria.com${product.image_url}`,
      sku: `FV-${product.id}`,
      brand: {
        '@type': 'Brand',
        name: 'Flores Victoria',
      },
      offers: {
        '@type': 'Offer',
        url: `https://flores-victoria.com/pages/product-detail.html?id=${product.id}`,
        priceCurrency: 'COP',
        price: product.price / 100,
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'Flores Victoria',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: stats.average,
        reviewCount: stats.total,
        bestRating: '5',
        worstRating: '1',
      },
      review: reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: r.name,
        },
        datePublished: r.date,
        reviewBody: r.comment,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: '5',
          worstRating: '1',
        },
      })),
    };
  },

  /**
   * Renderizar widget de rating compacto
   */
  renderRatingBadge(containerId, rating, reviewCount) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="rating-badge" style="display: flex; align-items: center; gap: 6px;">
        ${this.generateStars(rating, 'sm')}
        <span style="font-size: 14px; color: #666;">(${reviewCount})</span>
      </div>
    `;
  },

  /**
   * Renderizar sección completa de reseñas
   */
  renderReviewsSection(containerId, reviews = this.sampleReviews) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = this.calculateStats(reviews);

    container.innerHTML = `
      <style>
        .reviews-section {
          padding: 24px 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .reviews-header {
          display: flex;
          gap: 32px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .reviews-summary {
          text-align: center;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 12px;
          min-width: 150px;
        }
        
        .reviews-average {
          font-size: 48px;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }
        
        .reviews-stars {
          margin: 8px 0;
        }
        
        .reviews-count {
          font-size: 14px;
          color: #666;
        }
        
        .reviews-distribution {
          flex: 1;
          min-width: 200px;
        }
        
        .rating-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .rating-bar-label {
          width: 60px;
          font-size: 14px;
          color: #666;
        }
        
        .rating-bar-track {
          flex: 1;
          height: 8px;
          background: #eee;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .rating-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #FFB800, #FFC107);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .rating-bar-count {
          width: 30px;
          font-size: 14px;
          color: #999;
          text-align: right;
        }
        
        .reviews-list {
          display: grid;
          gap: 16px;
        }
        
        .review-card {
          padding: 20px;
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          transition: box-shadow 0.3s;
        }
        
        .review-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .review-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .review-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #C2185B, #E91E63);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
        }
        
        .review-name {
          font-weight: 600;
          color: #333;
        }
        
        .review-verified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #4CAF50;
        }
        
        .review-date {
          font-size: 13px;
          color: #999;
        }
        
        .review-rating {
          margin-bottom: 8px;
        }
        
        .review-comment {
          color: #555;
          line-height: 1.6;
        }
        
        .write-review-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #C2185B, #E91E63);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .write-review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(194, 24, 91, 0.4);
        }
      </style>
      
      <div class="reviews-section">
        <h3 style="font-size: 24px; margin-bottom: 20px;">⭐ Reseñas de Clientes</h3>
        
        <div class="reviews-header">
          <div class="reviews-summary">
            <div class="reviews-average">${stats.average}</div>
            <div class="reviews-stars">${this.generateStars(parseFloat(stats.average), 'md')}</div>
            <div class="reviews-count">${stats.total} reseñas</div>
          </div>
          
          <div class="reviews-distribution">
            ${[5, 4, 3, 2, 1]
              .map((rating) => {
                const count = stats.distribution[rating];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return `
                <div class="rating-bar">
                  <span class="rating-bar-label">${rating} ★</span>
                  <div class="rating-bar-track">
                    <div class="rating-bar-fill" style="width: ${percentage}%;"></div>
                  </div>
                  <span class="rating-bar-count">${count}</span>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>
        
        <div class="reviews-list">
          ${reviews
            .slice(0, 5)
            .map(
              (review) => `
            <div class="review-card">
              <div class="review-header">
                <div class="review-author">
                  <div class="review-avatar">${review.name.charAt(0)}</div>
                  <div>
                    <div class="review-name">
                      ${review.name}
                      ${review.verified ? '<span class="review-verified">✓ Compra verificada</span>' : ''}
                    </div>
                    <div class="review-date">${new Date(review.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>
                <div class="review-rating">${this.generateStars(review.rating, 'sm')}</div>
              </div>
              <p class="review-comment">${review.comment}</p>
            </div>
          `
            )
            .join('')}
        </div>
        
        <button class="write-review-btn" onclick="ReviewsSystem.openReviewModal()">
          ✍️ Escribir una reseña
        </button>
      </div>
    `;
  },

  /**
   * Abrir modal para escribir reseña
   */
  openReviewModal() {
    // Por ahora mostrar alerta, en producción sería un modal real
    alert(
      'Función próximamente disponible.\n\nPara dejar una reseña, contáctanos después de tu compra.'
    );
  },

  /**
   * Agregar Schema.org al head
   */
  injectSchema(product, reviews) {
    const schema = this.generateProductSchema(product, reviews);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  },

  /**
   * Inicializar en página de producto
   */
  initProductPage(product) {
    // Generar reseñas simuladas para el producto
    const productReviews = this.sampleReviews.slice(0, 3 + Math.floor(Math.random() * 5));

    // Renderizar sección de reseñas si existe el contenedor
    this.renderReviewsSection('product-reviews', productReviews);

    // Inyectar Schema.org
    this.injectSchema(product, productReviews);

    console.log('⭐ Reviews System inicializado para producto:', product.name);
  },
};

window.ReviewsSystem = ReviewsSystem;
