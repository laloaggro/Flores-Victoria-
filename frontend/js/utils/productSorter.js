/**
 * Sistema de ordenamiento de productos
 * Permite ordenar por precio, popularidad, novedad, rating
 */

export class ProductSorter {
  constructor(options = {}) {
    this.currentSort = options.defaultSort || 'featured';
    this.sortDirection = options.defaultDirection || 'desc';
    this.onSortChange = options.onSortChange;
    this.container = null;
  }
  
  /**
   * Inicializa el selector de ordenamiento
   */
  init(containerId = 'product-sort-controls') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('ProductSorter: container no encontrado');
      return;
    }
    
    this.render();
    this.setupEventListeners();
    
    console.log('🔢 Product Sorter inicializado');
  }
  
  /**
   * Renderiza los controles de ordenamiento
   */
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="sort-controls">
        <label class="sort-label">
          <i class="fas fa-sort"></i>
          Ordenar por:
        </label>
        <select id="sort-select" class="sort-select">
          <option value="featured">⭐ Destacados</option>
          <option value="price-asc">💰 Precio: Menor a Mayor</option>
          <option value="price-desc">💰 Precio: Mayor a Menor</option>
          <option value="newest">🆕 Más Nuevos</option>
          <option value="popular">🔥 Más Populares</option>
          <option value="rating">⭐ Mejor Calificados</option>
          <option value="name-asc">🔤 Nombre: A-Z</option>
          <option value="name-desc">🔤 Nombre: Z-A</option>
        </select>
      </div>
    `;
    
    // Establecer valor actual
    const select = this.container.querySelector('#sort-select');
    if (select) {
      select.value = this.currentSort;
    }
  }
  
  /**
   * Configura event listeners
   */
  setupEventListeners() {
    const select = this.container?.querySelector('#sort-select');
    if (!select) return;
    
    select.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.triggerSortChange();
    });
  }
  
  /**
   * Ordena un array de productos
   */
  sortProducts(products) {
    if (!products || !Array.isArray(products)) return [];
    
    const sorted = [...products]; // Clonar para no mutar original
    
    switch (this.currentSort) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      
      case 'price-desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
      
      case 'popular':
        return sorted.sort((a, b) => {
          const popularityA = (a.sales_count || 0) + (a.views || 0);
          const popularityB = (b.sales_count || 0) + (b.views || 0);
          return popularityB - popularityA;
        });
      
      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          if (ratingB !== ratingA) {
            return ratingB - ratingA;
          }
          // Si tienen mismo rating, ordenar por cantidad de reviews
          return (b.reviews_count || 0) - (a.reviews_count || 0);
        });
      
      case 'name-asc':
        return sorted.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB, 'es');
        });
      
      case 'name-desc':
        return sorted.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameB.localeCompare(nameA, 'es');
        });
      
      case 'featured':
      default:
        // Destacados primero, luego por precio descendente
        return sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (b.price || 0) - (a.price || 0);
        });
    }
  }
  
  /**
   * Dispara el callback de cambio de ordenamiento
   */
  triggerSortChange() {
    console.log(`🔢 Ordenamiento cambiado a: ${this.currentSort}`);
    
    if (this.onSortChange) {
      this.onSortChange(this.currentSort);
    }
  }
  
  /**
   * Obtiene el ordenamiento actual
   */
  getCurrentSort() {
    return this.currentSort;
  }
  
  /**
   * Establece un ordenamiento programáticamente
   */
  setSort(sortType) {
    if (this.currentSort === sortType) return;
    
    this.currentSort = sortType;
    
    // Actualizar UI
    const select = this.container?.querySelector('#sort-select');
    if (select) {
      select.value = sortType;
    }
    
    this.triggerSortChange();
  }
  
  /**
   * Obtiene estadísticas de ordenamiento
   */
  getSortStats(products) {
    if (!products || !Array.isArray(products)) return {};
    
    const stats = {
      total: products.length,
      minPrice: Math.min(...products.map((p) => p.price || Infinity)),
      maxPrice: Math.max(...products.map((p) => p.price || 0)),
      avgPrice: products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length,
      featured: products.filter((p) => p.featured).length,
      withRating: products.filter((p) => p.rating > 0).length,
    };
    
    return stats;
  }
}

// Estilos para los controles de ordenamiento
const injectStyles = () => {
  if (document.getElementById('product-sorter-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'product-sorter-styles';
  style.textContent = `
    .sort-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }
    
    .sort-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #2d5016;
      white-space: nowrap;
      margin: 0;
    }
    
    .sort-label i {
      font-size: 1.125rem;
    }
    
    .sort-select {
      flex: 1;
      max-width: 300px;
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      color: #333;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .sort-select:hover {
      border-color: #2d5016;
    }
    
    .sort-select:focus {
      outline: none;
      border-color: #2d5016;
      box-shadow: 0 0 0 3px rgba(45, 80, 22, 0.1);
    }
    
    @media (max-width: 768px) {
      .sort-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }
      
      .sort-select {
        max-width: 100%;
      }
    }
  `;
  
  document.head.appendChild(style);
};

// Inyectar estilos cuando se cargue el módulo
if (typeof document !== 'undefined') {
  injectStyles();
}
