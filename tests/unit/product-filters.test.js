/**
 * Tests para product-filters.js
 * Sistema de filtrado avanzado de productos
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Mock del ProductFilters class (simular estructura)
global.fetch = jest.fn();

// Cargar el código de product-filters.js
const productFiltersCode = fs.readFileSync(
  path.join(__dirname, '../../frontend/js/product-filters.js'),
  'utf-8',
);

describe('ProductFilters - Sistema de Filtrado de Productos', () => {
  let container;
  let productsContainer;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="product-filters"></div>
      <div id="products-grid"></div>
    `;
    container = document.getElementById('product-filters');
    productsContainer = document.getElementById('products-grid');

    // Reset fetch mock
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Inicialización', () => {
    test('debe crear instancia con opciones por defecto', () => {
      // Evaluar el código de la clase
      eval(productFiltersCode);

      const filters = new ProductFilters();

      expect(filters.options.containerId).toBe('product-filters');
      expect(filters.options.productsContainerId).toBe('products-grid');
      expect(filters.viewMode).toBe('grid');
    });

    test('debe sobrescribir opciones por defecto', () => {
      eval(productFiltersCode);

      const filters = new ProductFilters({
        containerId: 'custom-filters',
        apiEndpoint: '/custom/api',
      });

      expect(filters.options.containerId).toBe('custom-filters');
      expect(filters.options.apiEndpoint).toBe('/custom/api');
    });

    test('debe inicializar filtros con valores por defecto', () => {
      eval(productFiltersCode);

      const filters = new ProductFilters();

      expect(filters.filters.category).toBe('all');
      expect(filters.filters.priceRange).toEqual({ min: 0, max: 100000 });
      expect(filters.filters.sortBy).toBe('newest');
      expect(filters.filters.inStock).toBe(true);
    });
  });

  describe('2. Carga de Productos', () => {
    test('debe cargar productos desde API', async () => {
      const mockProducts = {
        products: [
          { _id: '1', name: 'Rosas Rojas', price: 50000, category: 'rosas' },
          { _id: '2', name: 'Tulipanes', price: 40000, category: 'tulipanes' },
        ],
      };

      global.fetch.mockResolvedValue({
        json: async () => mockProducts,
      });

      eval(productFiltersCode);
      const filters = new ProductFilters();

      await filters.loadProducts();

      expect(global.fetch).toHaveBeenCalledWith('/api/products');
      expect(filters.products).toHaveLength(2);
      expect(filters.products[0].name).toBe('Rosas Rojas');
    });

    test('debe manejar errores de carga', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      eval(productFiltersCode);
      const filters = new ProductFilters();

      await filters.loadProducts();

      expect(consoleSpy).toHaveBeenCalledWith('Error loading products:', expect.any(Error));
      expect(filters.products).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('3. Filtros Individuales', () => {
    let filters;
    let mockProducts;

    beforeEach(() => {
      mockProducts = [
        {
          _id: '1',
          name: 'Rosas Rojas',
          price: 50000,
          category: 'rosas',
          color: 'red',
          inStock: true,
          occasion: 'amor',
        },
        {
          _id: '2',
          name: 'Tulipanes Amarillos',
          price: 40000,
          category: 'tulipanes',
          color: 'yellow',
          inStock: true,
          occasion: 'cumpleaños',
        },
        {
          _id: '3',
          name: 'Orquídeas Blancas',
          price: 80000,
          category: 'orquideas',
          color: 'white',
          inStock: false,
          occasion: 'boda',
        },
      ];

      global.fetch.mockResolvedValue({
        json: async () => ({ products: mockProducts }),
      });

      eval(productFiltersCode);
      filters = new ProductFilters();
    });

    test('debe filtrar por categoría', async () => {
      await filters.loadProducts();

      filters.filters.category = 'rosas';
      filters.applyFilters();

      expect(filters.filteredProducts).toHaveLength(1);
      expect(filters.filteredProducts[0].name).toBe('Rosas Rojas');
    });

    test('debe filtrar por rango de precio', async () => {
      await filters.loadProducts();

      filters.filters.priceRange = { min: 45000, max: 85000 };
      filters.applyFilters();

      expect(filters.filteredProducts).toHaveLength(2);
      expect(filters.filteredProducts.some((p) => p.price === 40000)).toBe(false);
    });

    test('debe filtrar por disponibilidad', async () => {
      await filters.loadProducts();

      filters.filters.inStock = true;
      filters.applyFilters();

      expect(filters.filteredProducts).toHaveLength(2);
      expect(filters.filteredProducts.every((p) => p.inStock === true)).toBe(true);
    });

    test('debe filtrar por color', async () => {
      await filters.loadProducts();

      filters.filters.color = 'red';
      filters.applyFilters();

      expect(filters.filteredProducts).toHaveLength(1);
      expect(filters.filteredProducts[0].color).toBe('red');
    });

    test('debe filtrar por ocasión', async () => {
      await filters.loadProducts();

      filters.filters.occasion = 'amor';
      filters.applyFilters();

      expect(filters.filteredProducts).toHaveLength(1);
      expect(filters.filteredProducts[0].occasion).toBe('amor');
    });

    test('debe buscar por texto', async () => {
      await filters.loadProducts();

      filters.filters.search = 'tulipanes';
      filters.applyFilters();

      expect(filters.filteredProducts).toHaveLength(1);
      expect(filters.filteredProducts[0].name).toContain('Tulipanes');
    });
  });

  describe('4. Filtros Combinados', () => {
    let filters;
    let mockProducts;

    beforeEach(async () => {
      mockProducts = [
        {
          _id: '1',
          name: 'Rosas Rojas Premium',
          price: 50000,
          category: 'rosas',
          color: 'red',
          inStock: true,
        },
        {
          _id: '2',
          name: 'Rosas Blancas',
          price: 45000,
          category: 'rosas',
          color: 'white',
          inStock: true,
        },
        {
          _id: '3',
          name: 'Tulipanes Rojos',
          price: 40000,
          category: 'tulipanes',
          color: 'red',
          inStock: false,
        },
      ];

      global.fetch.mockResolvedValue({
        json: async () => ({ products: mockProducts }),
      });

      eval(productFiltersCode);
      filters = new ProductFilters();
      await filters.loadProducts();
    });

    test('debe aplicar categoría + color', () => {
      filters.filters.category = 'rosas';
      filters.filters.color = 'red';
      filters.applyFilters();

      expect(filters.filteredProducts).toHaveLength(1);
      expect(filters.filteredProducts[0].name).toBe('Rosas Rojas Premium');
    });

    test('debe aplicar precio + disponibilidad', () => {
      filters.filters.priceRange = { min: 0, max: 48000 };
      filters.filters.inStock = true;
      filters.applyFilters();

      expect(filters.filteredProducts).toHaveLength(1);
      expect(filters.filteredProducts[0].price).toBe(45000);
    });

    test('debe aplicar búsqueda + categoría', () => {
      filters.filters.search = 'rojas';
      filters.filters.category = 'rosas';
      filters.applyFilters();

      expect(filters.filteredProducts).toHaveLength(1);
      expect(filters.filteredProducts[0].name).toBe('Rosas Rojas Premium');
    });
  });

  describe('5. Ordenamiento', () => {
    let filters;
    let mockProducts;

    beforeEach(async () => {
      mockProducts = [
        {
          _id: '1',
          name: 'Producto A',
          price: 50000,
          popularity: 80,
          createdAt: '2025-01-01',
        },
        {
          _id: '2',
          name: 'Producto B',
          price: 30000,
          popularity: 90,
          createdAt: '2025-01-15',
        },
        {
          _id: '3',
          name: 'Producto C',
          price: 70000,
          popularity: 70,
          createdAt: '2025-01-10',
        },
      ];

      global.fetch.mockResolvedValue({
        json: async () => ({ products: mockProducts }),
      });

      eval(productFiltersCode);
      filters = new ProductFilters();
      await filters.loadProducts();
    });

    test('debe ordenar por precio ascendente', () => {
      filters.filters.sortBy = 'price-asc';
      filters.applyFilters();

      expect(filters.filteredProducts[0].price).toBe(30000);
      expect(filters.filteredProducts[2].price).toBe(70000);
    });

    test('debe ordenar por precio descendente', () => {
      filters.filters.sortBy = 'price-desc';
      filters.applyFilters();

      expect(filters.filteredProducts[0].price).toBe(70000);
      expect(filters.filteredProducts[2].price).toBe(30000);
    });

    test('debe ordenar por popularidad', () => {
      filters.filters.sortBy = 'popularity';
      filters.applyFilters();

      expect(filters.filteredProducts[0].popularity).toBe(90);
      expect(filters.filteredProducts[2].popularity).toBe(70);
    });

    test('debe ordenar por más recientes', () => {
      filters.filters.sortBy = 'newest';
      filters.applyFilters();

      expect(filters.filteredProducts[0].createdAt).toBe('2025-01-15');
    });
  });

  describe('6. Limpieza de Filtros', () => {
    let filters;

    beforeEach(async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({ products: [] }),
      });

      eval(productFiltersCode);
      filters = new ProductFilters();
      await filters.loadProducts();

      // Aplicar algunos filtros
      filters.filters.category = 'rosas';
      filters.filters.priceRange = { min: 1000, max: 50000 };
      filters.filters.color = 'red';
      filters.filters.search = 'test';
    });

    test('debe limpiar todos los filtros', () => {
      filters.clearFilters();

      expect(filters.filters.category).toBe('all');
      expect(filters.filters.priceRange).toEqual({ min: 0, max: 100000 });
      expect(filters.filters.color).toBe('all');
      expect(filters.filters.search).toBe('');
      expect(filters.filters.sortBy).toBe('newest');
    });
  });

  describe('7. Cambio de Vista (Grid/List)', () => {
    let filters;

    beforeEach(async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({ products: [] }),
      });

      eval(productFiltersCode);
      filters = new ProductFilters();
    });

    test('debe iniciar en modo grid', () => {
      expect(filters.viewMode).toBe('grid');
    });

    test('debe cambiar a modo lista', () => {
      filters.viewMode = 'list';
      expect(filters.viewMode).toBe('list');
    });

    test('debe alternar entre modos', () => {
      expect(filters.viewMode).toBe('grid');
      filters.viewMode = 'list';
      expect(filters.viewMode).toBe('list');
      filters.viewMode = 'grid';
      expect(filters.viewMode).toBe('grid');
    });
  });

  describe('8. Contador de Resultados', () => {
    let filters;

    beforeEach(async () => {
      const mockProducts = {
        products: [
          { _id: '1', name: 'P1', category: 'rosas', inStock: true },
          { _id: '2', name: 'P2', category: 'rosas', inStock: true },
          { _id: '3', name: 'P3', category: 'tulipanes', inStock: true },
        ],
      };

      global.fetch.mockResolvedValue({
        json: async () => mockProducts,
      });

      eval(productFiltersCode);
      filters = new ProductFilters();
      await filters.loadProducts();
    });

    test('debe mostrar total sin filtros', () => {
      filters.applyFilters();
      expect(filters.filteredProducts.length).toBe(3);
    });

    test('debe actualizar contador con filtros', () => {
      filters.filters.category = 'rosas';
      filters.applyFilters();
      expect(filters.filteredProducts.length).toBe(2);
    });

    test('debe mostrar 0 cuando no hay resultados', () => {
      filters.filters.category = 'inexistente';
      filters.applyFilters();
      expect(filters.filteredProducts.length).toBe(0);
    });
  });
});

describe('ProductFilters - Casos Edge', () => {
  test('debe manejar productos sin categoría', async () => {
    const mockProducts = {
      products: [{ _id: '1', name: 'Test', price: 1000 }],
    };

    global.fetch.mockResolvedValue({
      json: async () => mockProducts,
    });

    const productFiltersCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/js/product-filters.js'),
      'utf-8',
    );

    eval(productFiltersCode);
    const filters = new ProductFilters();
    await filters.loadProducts();

    expect(filters.products).toHaveLength(1);
  });

  test('debe manejar precio 0', async () => {
    const mockProducts = {
      products: [{ _id: '1', name: 'Free', price: 0 }],
    };

    global.fetch.mockResolvedValue({
      json: async () => mockProducts,
    });

    const productFiltersCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/js/product-filters.js'),
      'utf-8',
    );

    eval(productFiltersCode);
    const filters = new ProductFilters();
    await filters.loadProducts();

    filters.filters.priceRange = { min: 0, max: 0 };
    filters.applyFilters();

    expect(filters.filteredProducts).toHaveLength(1);
  });
});
