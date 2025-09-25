// wishlist.js - Funcionalidad de lista de deseos

import { showNotification } from './utils.js';

// Función para obtener la lista de deseos del localStorage
function getWishlist() {
  const wishlist = localStorage.getItem('wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

// Función para guardar la lista de deseos en localStorage
function saveWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Función para agregar un producto a la lista de deseos
function addToWishlist(productId) {
  const wishlist = getWishlist();
    
  // Verificar si el producto ya está en la lista de deseos
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    saveWishlist(wishlist);
    showNotification('Producto agregado a la lista de deseos', 'success');
    updateWishlistIcon();
  } else {
    showNotification('El producto ya está en tu lista de deseos', 'info');
  }
}

// Función para eliminar un producto de la lista de deseos
function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(id => id !== productId);
  saveWishlist(wishlist);
  showNotification('Producto eliminado de la lista de deseos', 'info');
  updateWishlistIcon();
}

// Función para verificar si un producto está en la lista de deseos
function isInWishlist(productId) {
  const wishlist = getWishlist();
  return wishlist.includes(productId);
}

// Función para actualizar el ícono de la lista de deseos
function updateWishlistIcon() {
  const wishlist = getWishlist();
  const wishlistCount = document.getElementById('wishlistCount');
    
  if (wishlistCount) {
    wishlistCount.textContent = wishlist.length;
  }
}

// Función para cargar y mostrar la lista de deseos
function displayWishlist() {
  const wishlist = getWishlist();
  const container = document.getElementById('wishlistContainer');
    
  if (!container) return;
    
  if (wishlist.length === 0) {
    container.innerHTML = '<p class="no-products">Tu lista de deseos está vacía.</p>';
    return;
  }
    
  // Aquí se cargarían los productos desde la API
  // Por ahora, mostramos un mensaje de ejemplo
  container.innerHTML = `
        <div class="wishlist-items">
            <p>Tienes ${wishlist.length} productos en tu lista de deseos.</p>
            <button class="btn btn-primary" onclick="window.location.href='products.html'">
                Ver productos
            </button>
        </div>
    `;
}

// Función para inicializar la lista de deseos
function initWishlist() {
  updateWishlistIcon();
    
  // Manejar clics en botones de lista de deseos
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-wishlist') || 
            e.target.closest('.add-to-wishlist')) {
      const button = e.target.classList.contains('add-to-wishlist') ? 
        e.target : e.target.closest('.add-to-wishlist');
      const productId = button.getAttribute('data-product-id');
            
      if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        button.innerHTML = '<i class="far fa-heart"></i> Agregar a deseos';
        button.classList.remove('active');
      } else {
        addToWishlist(productId);
        button.innerHTML = '<i class="fas fa-heart"></i> En deseos';
        button.classList.add('active');
      }
    }
  });
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  initWishlist();
});

// Exportar funciones
export { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  isInWishlist, 
  displayWishlist 
};