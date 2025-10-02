/**
 * Funcionalidades específicas para la página de productos
 */

import '../../components/product/Products.js';

const currentFilters = {};
let currentSort = 'name';
let currentPage = 1; // Asegurarse de que currentPage esté definida en el ámbito global
const itemsPerPage = 12;

// Funciones para mostrar y ocultar indicadores de carga
function showLoading() {
  const productsContainer = document.getElementById('products-container');
  if (productsContainer) {
    productsContainer.innerHTML = '<div class="loading">Cargando productos...</div>';
  }
}

function hideLoading() {
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) {
    loadingElement.remove();
  }
}

// Función para mostrar mensajes de error
/*
function showErrorMessage(message) {
  const productsContainer = document.getElementById('products-container');
  if (productsContainer) {
    productsContainer.innerHTML = `<div class="error-message">${message}</div>`;
  }
}
*/

/**
 * Inicializar la página de productos
 */
function initializeProductsPage() {
  console.log('🚀 Inicializando página de productos...');
    
  // Inicializar componentes
  initializeProductFilters();
  initializeProductSearch();
  initializeProductSort();
    
  // Cargar productos iniciales
  loadProducts();
    
  console.log('✅ Página de productos inicializada correctamente');
}

/**
 * Inicializar los filtros de productos
 */
function initializeProductFilters() {
  // Esta función se implementará cuando se cargue el componente de filtros
  console.log('🔧 Filtros de productos listos para inicializar');
}

/**
 * Inicializar la búsqueda de productos
 */
function initializeProductSearch() {
  // Esta función se implementará cuando se cargue el componente de búsqueda
  console.log('🔍 Búsqueda de productos lista para inicializar');
}

/**
 * Inicializar el ordenamiento de productos
 */
function initializeProductSort() {
  const sortSelect = document.getElementById('sort-products');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      loadProducts();
    });
  }
}

/**
 * Carga los productos desde la API
 */
async function loadProducts(page = 1, limit = 12, filters = {}) {
  try {
    showLoading();
        
    // Construir la URL de la API con los parámetros
    const params = new URLSearchParams({
      page: page,
      limit: limit,
      ...filters
    });
        
    // Usar la URL relativa para que el proxy de Vite la redirija al API Gateway
    const response = await fetch(`/api/products?${params}`);
        
    if (!response.ok) {
      throw new Error(`Error al cargar productos: ${response.status} ${response.statusText}`);
    }
        
    const data = await response.json();
    renderProducts(data.products);
    updatePagination(data.pagination);
        
    hideLoading();
  } catch (error) {
    console.error('❌ Error al cargar productos:', error);
    hideLoading();
    showErrorMessage('Error al cargar los productos. Por favor, intenta nuevamente.');
  }
}

/**
 * Renderizar productos en la página
 * @param {Array} products - Array de productos a renderizar
 */
function renderProducts(products) {
  const container = document.getElementById('products-grid');
  if (!container) return;
    
  if (products.length === 0) {
    container.innerHTML = `
            <div class="no-products">
                <p>No se encontraron productos que coincidan con los criterios de búsqueda.</p>
            </div>
        `;
    return;
  }
    
  container.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image || '/assets/images/placeholder.svg'}" 
                     alt="${product.name}" 
                     loading="lazy">
                <button class="add-to-wishlist" data-product-id="${product.id}">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-price">
                    $${product.price ? product.price.toLocaleString() : '0'}
                </div>
                <button class="add-to-cart btn btn-primary" data-product-id="${product.id}">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `).join('');
    
  // Añadir event listeners a los botones
  attachProductEventListeners();
}

/**
 * Renderizar controles de paginación
 * @param {number} total - Total de productos
 * @param {number} currentPage - Página actual
 * @param {number} totalPages - Total de páginas
 */
function renderPagination(total, currentPage, totalPages) {
  const container = document.getElementById('pagination');
  if (!container) return;
    
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
    
  let paginationHTML = `
        <button class="pagination-prev btn" ${currentPage === 1 ? 'disabled' : ''} 
                data-page="${currentPage - 1}">
            Anterior
        </button>
    `;
    
  // Mostrar máximo 5 páginas alrededor de la página actual
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
    
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
            <button class="pagination-page btn ${i === currentPage ? 'active' : ''}" 
                    data-page="${i}">
                ${i}
            </button>
        `;
  }
    
  paginationHTML += `
        <button class="pagination-next btn" ${currentPage === totalPages ? 'disabled' : ''} 
                data-page="${currentPage + 1}">
            Siguiente
        </button>
    `;
    
  container.innerHTML = paginationHTML;
    
  // Añadir event listeners a los botones de paginación
  attachPaginationEventListeners();
}

/**
 * Añadir event listeners a los botones de productos
 */
function attachProductEventListeners() {
  // Botones de agregar al carrito
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.dataset.productId;
      addToCart(productId);
    });
  });
    
  // Botones de agregar a lista de deseos
  document.querySelectorAll('.add-to-wishlist').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.dataset.productId;
      addToWishlist(productId);
    });
  });
}

/**
 * Añadir event listeners a los controles de paginación
 */
function attachPaginationEventListeners() {
  document.querySelectorAll('.pagination-page, .pagination-prev, .pagination-next')
    .forEach(button => {
      button.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        if (!isNaN(page)) {
          currentPage = page;
          loadProducts();
        }
      });
    });
}

/**
 * Agregar producto al carrito
 * @param {string} productId - ID del producto
 */
async function addToCart(productId) {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });
        
    const data = await response.json();
        
    if (response.ok) {
      // Actualizar contador del carrito
      updateCartCounter();
            
      // Mostrar notificación
      if (window.notifications) {
        window.notifications.showSuccess('Producto agregado al carrito');
      }
    } else {
      throw new Error(data.message || 'Error al agregar producto al carrito');
    }
  } catch (error) {
    console.error('❌ Error al agregar al carrito:', error);
    if (window.notifications) {
      window.notifications.showError('Error al agregar producto al carrito');
    }
  }
}

/**
 * Agregar producto a la lista de deseos
 * @param {string} productId - ID del producto
 */
async function addToWishlist(productId) {
  try {
    const response = await fetch('/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });
        
    const data = await response.json();
        
    if (response.ok) {
      // Mostrar notificación
      if (window.notifications) {
        window.notifications.showSuccess('Producto agregado a la lista de deseos');
      }
    } else {
      throw new Error(data.message || 'Error al agregar a la lista de deseos');
    }
  } catch (error) {
    console.error('❌ Error al agregar a la lista de deseos:', error);
    if (window.notifications) {
      window.notifications.showError('Error al agregar a la lista de deseos');
    }
  }
}

/**
 * Actualizar la paginación de productos
 * @param {Object} pagination - Información de paginación
 */
function updatePagination(pagination) {
  const paginationContainer = document.querySelector('.pagination');
  if (!paginationContainer) return;

  // Limpiar el contenedor de paginación
  paginationContainer.innerHTML = '';

  // Crear elementos de paginación
  const { currentPage, totalPages } = pagination;

  // Botón anterior
  if (currentPage > 1) {
    const prevButton = document.createElement('a');
    prevButton.href = '#';
    prevButton.className = 'pagination-link';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.currentPage = currentPage - 1;
      loadProducts();
    });
    paginationContainer.appendChild(prevButton);
  }

  // Páginas
  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement('a');
    pageLink.href = '#';
    pageLink.className = `pagination-link ${i === currentPage ? 'active' : ''}`;
    pageLink.textContent = i;
    pageLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.currentPage = i;
      loadProducts();
    });
    paginationContainer.appendChild(pageLink);
  }

  // Botón siguiente
  if (currentPage < totalPages) {
    const nextButton = document.createElement('a');
    nextButton.href = '#';
    nextButton.className = 'pagination-link';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.currentPage = currentPage + 1;
      loadProducts();
    });
    paginationContainer.appendChild(nextButton);
  }
}

/**
 * Actualizar el contador del carrito
 */
function updateCartCounter() {
  // Esta función se implementará cuando se cargue el componente del carrito
  console.log('🛒 Contador del carrito actualizado');
}

/**
 * Mostrar indicador de carga
 */
function showLoadingIndicator() {
  const container = document.getElementById('products-grid');
  if (container) {
    container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Cargando productos...</p>
            </div>
        `;
  }
}

/**
 * Ocultar indicador de carga
 */
function hideLoadingIndicator() {
  // La carga se oculta automáticamente cuando se renderizan los productos
}

/**
 * Mostrar mensaje de error
 * @param {string} message - Mensaje de error
 */
function showErrorMessage(message) {
  const container = document.getElementById('products-grid');
  if (container) {
    container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button class="btn btn-primary" onclick="loadProducts()">Reintentar</button>
            </div>
        `;
  }
}

// Inicializar cuando el DOM esté cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProductsPage);
} else {
  initializeProductsPage();
}

// Exportar funciones para uso global
export { 
  initializeProductsPage,
  loadProducts,
  currentFilters,
  currentSort,
  currentPage
};