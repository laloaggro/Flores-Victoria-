/**
 * Gestor de productos para la tienda en línea
 * Maneja la lógica de negocio para productos
 */

class ProductManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentFilters = {};
    this.currentSort = 'name';
    this.currentPage = 1;
    this.itemsPerPage = 12;
  }

  /**
   * Cargar productos desde la API
   */
  async loadProducts() {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();

      if (response.ok) {
        this.products = data.products || data;
        this.applyFiltersAndSort();
        return this.products;
      } else {
        throw new Error(data.message || 'Error al cargar productos');
      }
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      throw error;
    }
  }

  /**
   * Aplicar filtros y ordenamiento a los productos
   */
  applyFiltersAndSort() {
    // Aplicar filtros
    this.filteredProducts = this.products.filter((product) => {
      // Filtro por categoría
      if (this.currentFilters.category && product.category !== this.currentFilters.category) {
        return false;
      }

      // Filtro por precio mínimo
      if (this.currentFilters.minPrice && product.price < this.currentFilters.minPrice) {
        return false;
      }

      // Filtro por precio máximo
      if (this.currentFilters.maxPrice && product.price > this.currentFilters.maxPrice) {
        return false;
      }

      // Filtro por búsqueda
      if (this.currentFilters.search) {
        const searchTerm = this.currentFilters.search.toLowerCase();
        const searchableText =
          `${product.name} ${product.description} ${product.category}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });

    // Aplicar ordenamiento
    this.sortProducts();
  }

  /**
   * Ordenar productos
   */
  sortProducts() {
    this.filteredProducts.sort((a, b) => {
      switch (this.currentSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
  }

  /**
   * Obtener productos paginados
   * @returns {Object} Objeto con productos paginados y metadatos
   */
  getPaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: this.filteredProducts.length,
      page: this.currentPage,
      pages: Math.ceil(this.filteredProducts.length / this.itemsPerPage),
    };
  }

  /**
   * Actualizar filtros
   * @param {Object} filters - Nuevos filtros
   */
  updateFilters(filters) {
    this.currentFilters = { ...this.currentFilters, ...filters };
    this.currentPage = 1; // Resetear a la primera página
    this.applyFiltersAndSort();
  }

  /**
   * Actualizar ordenamiento
   * @param {string} sort - Nuevo criterio de ordenamiento
   */
  updateSort(sort) {
    this.currentSort = sort;
    this.currentPage = 1; // Resetear a la primera página
    this.applyFiltersAndSort();
  }

  /**
   * Cambiar página
   * @param {number} page - Número de página
   */
  goToPage(page) {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Obtener producto por ID
   * @param {string} productId - ID del producto
   * @returns {Object|null} Producto encontrado o null
   */
  getProductById(productId) {
    return this.products.find((product) => product.id == productId) || null;
  }

  /**
   * Buscar productos por término
   * @param {string} term - Término de búsqueda
   */
  searchProducts(term) {
    this.updateFilters({ search: term });
  }

  /**
   * Limpiar todos los filtros
   */
  clearFilters() {
    this.currentFilters = {};
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }
}

// Crear instancia global
const productManager = new ProductManager();

// Exportar para uso como módulo
export default ProductManager;
export { ProductManager, productManager };
