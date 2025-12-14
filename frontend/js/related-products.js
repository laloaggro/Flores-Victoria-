/**
 * Productos Relacionados - Flores Victoria
 * Muestra productos similares por categoría u ocasión
 */

const RelatedProducts = {
  // Caché de productos
  products: [],

  /**
   * Cargar productos
   */
  async loadProducts() {
    if (this.products.length > 0) return this.products;

    try {
      const response = await fetch('/public/assets/mock/products.json');
      this.products = await response.json();
      return this.products;
    } catch (error) {
      console.error('Error cargando productos:', error);
      return [];
    }
  },

  /**
   * Obtener productos relacionados
   */
  async getRelatedProducts(productId, limit = 4) {
    const products = await this.loadProducts();
    const currentProduct = products.find((p) => p.id == productId);

    if (!currentProduct) return [];

    // Filtrar por misma categoría, excluyendo el producto actual
    const sameCategory = products.filter(
      (p) => p.category === currentProduct.category && p.id !== currentProduct.id
    );

    // Si no hay suficientes, agregar de categorías similares
    let related = [...sameCategory];

    if (related.length < limit) {
      const otherProducts = products.filter(
        (p) => p.category !== currentProduct.category && p.id !== currentProduct.id
      );

      // Mezclar y agregar
      const shuffled = otherProducts.sort(() => Math.random() - 0.5);
      related = [...related, ...shuffled.slice(0, limit - related.length)];
    }

    // Limitar y mezclar resultado
    return related.sort(() => Math.random() - 0.5).slice(0, limit);
  },

  /**
   * Obtener productos por ocasión
   */
  async getProductsByOccasion(occasion, limit = 8) {
    const products = await this.loadProducts();

    // Mapeo de ocasiones a categorías
    const occasionCategories = {
      cumpleaños: ['cumpleaños', 'bouquets', 'rosas', 'girasoles'],
      bodas: ['bodas', 'rosas', 'orquideas', 'lirios'],
      aniversarios: ['aniversarios', 'rosas', 'orquideas'],
      condolencias: ['funebres', 'lirios'],
      amor: ['rosas', 'orquideas', 'tulipanes'],
      amistad: ['girasoles', 'tulipanes', 'bouquets'],
      corporativo: ['corporativos', 'orquideas'],
    };

    const categories = occasionCategories[occasion.toLowerCase()] || [];

    const filtered = products.filter((p) => categories.includes(p.category.toLowerCase()));

    return filtered.sort(() => Math.random() - 0.5).slice(0, limit);
  },

  /**
   * Formatear precio
   */
  formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  },

  /**
   * Renderizar sección de productos relacionados
   */
  async renderRelatedProducts(containerId, productId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const related = await this.getRelatedProducts(productId);

    if (related.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = `
      <style>
        .related-products {
          padding: 40px 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .related-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .related-header h3 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        
        .related-see-all {
          color: #C2185B;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        }
        
        .related-see-all:hover {
          text-decoration: underline;
        }
        
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        
        .related-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          transition: transform 0.3s, box-shadow 0.3s;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .related-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }
        
        .related-card-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          background: #f5f5f5;
        }
        
        .related-card-body {
          padding: 16px;
        }
        
        .related-card-category {
          display: inline-block;
          padding: 4px 10px;
          background: #fce4ec;
          color: #C2185B;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        
        .related-card-name {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 600;
          color: #333;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .related-card-price {
          font-size: 18px;
          font-weight: 700;
          color: #C2185B;
        }
        
        .related-card-btn {
          display: block;
          width: 100%;
          padding: 12px;
          margin-top: 12px;
          background: linear-gradient(135deg, #C2185B, #E91E63);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          transition: opacity 0.2s;
        }
        
        .related-card-btn:hover {
          opacity: 0.9;
        }
        
        @media (max-width: 640px) {
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          
          .related-card-image {
            height: 140px;
          }
          
          .related-card-body {
            padding: 12px;
          }
          
          .related-card-name {
            font-size: 13px;
          }
          
          .related-card-price {
            font-size: 16px;
          }
        }
      </style>
      
      <div class="related-products">
        <div class="related-header">
          <h3>💐 También te puede gustar</h3>
          <a href="/pages/products.html" class="related-see-all">Ver todo →</a>
        </div>
        
        <div class="related-grid">
          ${related
            .map(
              (product) => `
            <a href="/pages/product-detail.html?id=${product.id}" class="related-card">
              <img 
                src="${product.image_url}" 
                alt="${product.name}"
                class="related-card-image"
                loading="lazy"
                onerror="this.src='/public/assets/images/placeholder.webp'"
              >
              <div class="related-card-body">
                <span class="related-card-category">${product.category}</span>
                <h4 class="related-card-name">${product.name}</h4>
                <div class="related-card-price">${this.formatPrice(product.price)}</div>
                <span class="related-card-btn">Ver producto</span>
              </div>
            </a>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    // Track view en analytics
    if (window.AnalyticsService) {
      related.forEach((product) => {
        window.AnalyticsService.viewItem(product);
      });
    }
  },

  /**
   * Renderizar productos por ocasión
   */
  async renderOccasionProducts(containerId, occasion) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const products = await this.getProductsByOccasion(occasion);

    if (products.length === 0) {
      container.innerHTML = '<p>No hay productos para esta ocasión.</p>';
      return;
    }

    // Usar el mismo estilo que related products
    container.innerHTML = `
      <div class="related-products">
        <div class="related-header">
          <h3>🎉 Flores para ${occasion}</h3>
          <a href="/pages/products.html?occasion=${encodeURIComponent(occasion)}" class="related-see-all">Ver más →</a>
        </div>
        
        <div class="related-grid">
          ${products
            .map(
              (product) => `
            <a href="/pages/product-detail.html?id=${product.id}" class="related-card">
              <img 
                src="${product.image_url}" 
                alt="${product.name}"
                class="related-card-image"
                loading="lazy"
                onerror="this.src='/public/assets/images/placeholder.webp'"
              >
              <div class="related-card-body">
                <span class="related-card-category">${product.category}</span>
                <h4 class="related-card-name">${product.name}</h4>
                <div class="related-card-price">${this.formatPrice(product.price)}</div>
                <span class="related-card-btn">Ver producto</span>
              </div>
            </a>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  },
};

window.RelatedProducts = RelatedProducts;
