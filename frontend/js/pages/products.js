// products.js - Funcionalidades específicas para la página de productos

console.log('Products page script loaded');

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencia al componente de productos
    const productsComponent = document.querySelector('products-component');
    
    if (!productsComponent) {
        console.warn('Products component not found');
        return;
    }
    
    // Buscador
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim().toLowerCase();
            console.log('Searching for:', searchTerm);
            
            // Llamar al método de búsqueda del componente
            if (productsComponent.searchProducts) {
                productsComponent.searchProducts(searchTerm);
            }
        });
    }
    
    // Filtro por categoría
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const category = e.target.value;
            console.log('Filtering by category:', category);
            
            // Llamar al método de filtro del componente
            if (productsComponent.filterByCategory) {
                productsComponent.filterByCategory(category);
            }
        });
    }
    
    // Filtro por precio
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', (e) => {
            const priceRange = e.target.value;
            console.log('Filtering by price:', priceRange);
            
            // Aplicar filtro de precio
            if (priceRange === 'all') {
                // Restaurar todos los productos
                if (productsComponent.filterByPrice) {
                    productsComponent.filterByPrice(null);
                }
            } else {
                const [min, max] = priceRange.split('-').map(Number);
                if (productsComponent.filterByPrice) {
                    productsComponent.filterByPrice({ min, max });
                }
            }
        });
    }
    
    // Botón limpiar filtros
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            console.log('Clearing all filters');
            
            // Limpiar inputs
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = 'all';
            if (priceFilter) priceFilter.value = 'all';
            
            // Resetear filtros en el componente
            if (productsComponent.clearFilters) {
                productsComponent.clearFilters();
            } else if (productsComponent.loadProducts) {
                productsComponent.loadProducts();
            }
        });
    }
    
    console.log('Product filters initialized successfully');
});
