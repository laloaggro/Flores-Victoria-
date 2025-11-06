// Cart functionality

// Get cart from localStorage
function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

// Update quantity
function updateQuantity(productId, change) {
  let cart = getCart();
  const item = cart.find((item) => item.id === productId);

  if (item) {
    item.quantity += change;

    if (item.quantity <= 0) {
      cart = cart.filter((item) => item.id !== productId);
    }

    saveCart(cart);
  }
}

// Remove item from cart
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  showNotification('Producto eliminado del carrito');
}

// Update cart count badge
function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartBadge = document.getElementById('cart-count');
  if (cartBadge) {
    cartBadge.textContent = totalItems;
  }
}

// Update wishlist count
function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const badge = document.getElementById('wishlist-count');
  if (badge) {
    badge.textContent = wishlist.length;
  }
}

// Render cart
function renderCart() {
  const cart = getCart();
  const emptyCart = document.getElementById('empty-cart');
  const cartContent = document.getElementById('cart-content');
  const cartItemsList = document.getElementById('cart-items-list');

  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    cartContent.style.display = 'none';
    return;
  }

  emptyCart.style.display = 'none';
  cartContent.style.display = 'grid';

  // Render items
  cartItemsList.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item" data-product-id="${item.id}">
            <img 
                src="${item.image || '/images/placeholder.jpg'}" 
                alt="${item.name}"
                class="cart-item-image"
                onerror="this.src='/images/placeholder.jpg'"
            >
            <div class="cart-item-details">
                <div>
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-category">${item.category || 'Flores'}</p>
                </div>
                <p class="cart-item-price">$${item.price.toLocaleString('es-CL')}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `
    )
    .join('');

  // Calculate totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  document.getElementById('total-items').textContent = totalItems;
  document.getElementById('subtotal').textContent = `$${subtotal.toLocaleString('es-CL')}`;
  document.getElementById('shipping').textContent =
    shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-CL')}`;
  document.getElementById('total').textContent = `$${total.toLocaleString('es-CL')}`;
}

// Proceed to checkout
function proceedToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showNotification('Tu carrito está vacío', 'warning');
    return;
  }

  showNotification('Redirigiendo a checkout...', 'success');
  setTimeout(() => {
    window.location.href = '/pages/checkout.html';
  }, 1000);
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Make functions global
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.proceedToCheckout = proceedToCheckout;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();
  updateWishlistCount();
});
