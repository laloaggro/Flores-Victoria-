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

// Función para obtener detalles de productos desde la API
async function fetchProductDetails(productIds) {
  try {
    const API_BASE_URL = 'http://localhost:3000/api';
    const productPromises = productIds.map(id => 
      fetch(`${API_BASE_URL}/products/${id}`).then(res => res.json())
    );
    const products = await Promise.all(productPromises);
    return products.filter(product => product && !product.error);
  } catch (error) {
    console.error('Error fetching product details:', error);
    return [];
  }
}

// Función mejorada para cargar y mostrar la lista de deseos
async function displayWishlist() {
  const wishlist = getWishlist();
  const container = document.getElementById('wishlistContainer');
    
  if (!container) return;
    
  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="empty-wishlist">
        <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px; margin: 2rem 0;">
          <div style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;">
            <i class="far fa-heart"></i>
          </div>
          <h3 style="color: #333; margin-bottom: 1rem;">Tu lista de deseos está vacía</h3>
          <p style="color: #666; margin-bottom: 2rem;">Explora nuestros hermosos arreglos florales y guarda tus favoritos</p>
          <a href="/pages/products.html" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
            <i class="fas fa-search"></i> Explorar Productos
          </a>
        </div>
      </div>
    `;
    return;
  }
    
  // Mostrar loading
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2d5016; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    </div>
  `;
  
  try {
    const products = await fetchProductDetails(wishlist);
    
    if (products.length === 0) {
      container.innerHTML = '<p class="no-products">Error al cargar los productos de tu lista de deseos.</p>';
      return;
    }
    
    // Calcular valor total
    const totalValue = products.reduce((sum, product) => sum + (product.price || 0), 0);
    
    container.innerHTML = `
      <div class="wishlist-header" style="text-align: center; margin-bottom: 2rem;">
        <h2 style="color: #333; margin-bottom: 1rem;">Mi Lista de Deseos</h2>
        <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem;">
          <div style="background: white; padding: 1rem 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <span style="font-size: 2rem; font-weight: 700; color: #2d5016; display: block;">${products.length}</span>
            <span style="font-size: 0.9rem; color: #666;">Productos</span>
          </div>
          <div style="background: white; padding: 1rem 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <span style="font-size: 2rem; font-weight: 700; color: #2d5016; display: block;">$${totalValue.toLocaleString('es-CL')}</span>
            <span style="font-size: 0.9rem; color: #666;">Valor Total</span>
          </div>
        </div>
      </div>
      
      <div class="wishlist-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
        ${products.map(product => `
          <div class="wishlist-card" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative;" data-product-id="${product._id}">
            <div style="position: relative; height: 250px; overflow: hidden;">
              <img src="${product.images && product.images[0] ? product.images[0] : '/images/placeholder.jpg'}" 
                   alt="${product.name}" 
                   style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;"
                   loading="lazy">
              <button onclick="removeFromWishlist('${product._id}'); displayWishlist();" 
                      style="position: absolute; top: 1rem; right: 1rem; background: rgba(220, 53, 69, 0.9); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;"
                      title="Eliminar de favoritos">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div style="padding: 1.5rem;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; color: #333; margin-bottom: 0.5rem; line-height: 1.3;">${product.name}</h3>
              <div style="font-size: 1.4rem; font-weight: 600; color: #2d5016; margin-bottom: 1rem;">$${(product.price || 0).toLocaleString('es-CL')}</div>
              <p style="color: #666; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem;">${product.description || 'Hermoso arreglo floral para cualquier ocasión especial.'}</p>
              <div style="display: flex; gap: 0.5rem;">
                <button onclick="addToCart('${product._id}')" 
                        style="flex: 1; background: #2d5016; color: white; border: none; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                  <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                </button>
                <button onclick="window.location.href='/pages/product-detail.html?id=${product._id}'" 
                        style="background: #6c757d; color: white; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;"
                        title="Ver detalles">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align: center; margin-top: 2rem;">
        <button onclick="clearWishlist(); displayWishlist();" 
                style="background: #dc3545; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease; margin-right: 1rem;">
          <i class="fas fa-trash"></i> Limpiar Lista
        </button>
        <a href="/pages/products.html" 
           style="background: #2d5016; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-plus"></i> Agregar Más Productos
        </a>
      </div>
    `;
  } catch (error) {
    console.error('Error displaying wishlist:', error);
    container.innerHTML = '<p class="no-products">Error al cargar la lista de deseos.</p>';
  }
}

// Función para limpiar toda la lista de deseos
function clearWishlist() {
  if (confirm('¿Estás seguro de que quieres eliminar todos los productos de tu lista de deseos?')) {
    localStorage.removeItem('wishlist');
    updateWishlistIcon();
    showNotification('Lista de deseos limpia', 'info');
  }
}

// Función mejorada para agregar al carrito
function addToCart(productId) {
  // Aquí iría la lógica real para agregar al carrito
  showNotification('Producto agregado al carrito', 'success');
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