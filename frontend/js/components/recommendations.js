// Componente de Recomendaciones de Productos

class ProductRecommendations {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.userId = this.getUserId(); // En una implementación real, obtendrías esto del sistema de autenticación
    this.recommendations = [];
    this.init();
  }

  getUserId() {
    // En una implementación real, esto vendría del sistema de autenticación
    // Por ahora, usamos un ID de usuario de ejemplo
    return 'user-123';
  }

  async init() {
    if (this.container) {
      await this.loadRecommendations();
      this.render();
    }
  }

  async loadRecommendations() {
    try {
      // En una implementación real, esto haría una llamada al API
      // Por ahora, simulamos datos de recomendaciones
      
      // Simular una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Datos de ejemplo
      this.recommendations = [
        {
          id: 'rec-1',
          name: 'Ramo de Rosas Rojas',
          price: 29.99,
          imageUrl: '/assets/images/rosas-rojas.jpg',
          category: 'flores'
        },
        {
          id: 'rec-2',
          name: 'Arreglo de Tulipanes',
          price: 35.50,
          imageUrl: '/assets/images/tulipanes.jpg',
          category: 'arreglos'
        },
        {
          id: 'rec-3',
          name: 'Orquídea en Maceta',
          price: 42.00,
          imageUrl: '/assets/images/orquidea.jpg',
          category: 'plantas'
        }
      ];
      
      console.log('Recomendaciones cargadas:', this.recommendations);
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
      // Mostrar recomendaciones por defecto en caso de error
      this.recommendations = this.getDefaultRecommendations();
    }
  }

  getDefaultRecommendations() {
    return [
      {
        id: 'def-1',
        name: 'Ramo de Girasoles',
        price: 24.99,
        imageUrl: '/assets/images/girasoles.jpg',
        category: 'flores'
      },
      {
        id: 'def-2',
        name: 'Arreglo de Lirios',
        price: 38.75,
        imageUrl: '/assets/images/lirios.jpg',
        category: 'arreglos'
      }
    ];
  }

  render() {
    if (!this.container) return;
    
    if (this.recommendations.length === 0) {
      this.container.innerHTML = '<p class="no-recommendations">No hay recomendaciones disponibles en este momento.</p>';
      return;
    }
    
    const recommendationsHTML = `
      <div class="recommendations-section">
        <h2 class="section-title">Recomendaciones para ti</h2>
        <div class="recommendations-grid">
          ${this.recommendations.map(product => this.renderProductCard(product)).join('')}
        </div>
      </div>
    `;
    
    this.container.innerHTML = recommendationsHTML;
    
    // Añadir animaciones a las tarjetas
    const cards = this.container.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('animate-on-scroll');
    });
    
    // Inicializar animaciones
    if (window.uiAnimations) {
      window.uiAnimations.initScrollAnimations();
    }
  }

  renderProductCard(product) {
    return `
      <div class="product-card recommendation-card fade-in" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${product.category}</p>
          <div class="product-price">$${product.price.toFixed(2)}</div>
          <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
            <i class="fas fa-shopping-cart"></i> Agregar al carrito
          </button>
        </div>
      </div>
    `;
  }

  // Registrar visualización de producto para mejorar recomendaciones
  recordProductView(productId) {
    // En una implementación real, esto enviaría datos al backend
    console.log(`Producto ${productId} visto por el usuario`);
    
    // Simular llamada al API para registrar la visualización
    // fetch('/api/v1/products/recommendations/view', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     userId: this.userId,
    //     productId: productId
    //   })
    // });
  }

  // Registrar compra de producto para mejorar recomendaciones
  recordProductPurchase(productId) {
    // En una implementación real, esto enviaría datos al backend
    console.log(`Producto ${productId} comprado por el usuario`);
    
    // Simular llamada al API para registrar la compra
    // fetch('/api/v1/products/recommendations/purchase', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     userId: this.userId,
    //     productId: productId
    //   })
    // });
  }
}

// Inicializar recomendaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Buscar contenedores de recomendaciones en la página
  const recommendationContainers = document.querySelectorAll('[data-component="recommendations"]');
  recommendationContainers.forEach(container => {
    new ProductRecommendations(container.id);
  });
});

// Exportar para uso en módulos ES6
// NOTA: No usamos export porque este archivo se carga directamente en el HTML
// como un script normal, no como un módulo ES6.