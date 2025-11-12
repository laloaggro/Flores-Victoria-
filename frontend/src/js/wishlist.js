// Wishlist functionality

// Get wishlist from localStorage
function getWishlist() {
  const wishlist = localStorage.getItem('wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

// Update wishlist count badge
function updateWishlistCount() {
  const wishlist = getWishlist();
  const badge = document.getElementById('wishlist-count');
  if (badge) {
    badge.textContent = wishlist.length;
  }
}

// Remove item from wishlist
function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter((item) => item.id !== productId);
  saveWishlist(wishlist);
  renderWishlist();
}

// Add to cart from wishlist
function addToCart(product) {
  // Get cart from localStorage
  let cart = localStorage.getItem('cart');
  cart = cart ? JSON.parse(cart) : [];

  // Check if product already in cart
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  // Update cart count
  const cartBadge = document.getElementById('cart-count');
  if (cartBadge) {
    cartBadge.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Show notification
  alert(`${product.name} agregado al carrito ✅`);
}

// Render wishlist items
function renderWishlist() {
  const wishlist = getWishlist();
  const emptyState = document.getElementById('empty-wishlist');
  const itemsContainer = document.getElementById('wishlist-items');

  if (wishlist.length === 0) {
    emptyState.style.display = 'block';
    itemsContainer.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  itemsContainer.style.display = 'grid';

  itemsContainer.innerHTML = wishlist
    .map(
      (product) => `
        <div class="wishlist-item" data-product-id="${product.id}">
            <div class="remove-icon" onclick="removeFromWishlist(${product.id})">
                ×
            </div>
            <img 
                src="${product.image || '/images/placeholder.jpg'}" 
                alt="${product.name}"
                class="wishlist-item-image"
                onerror="this.src='/images/placeholder.jpg'"
            >
            <div class="wishlist-item-content">
                <h3 class="wishlist-item-title">${product.name}</h3>
                <p class="wishlist-item-price">$${product.price.toLocaleString('es-CL')}</p>
                <div class="wishlist-item-actions">
                    <button 
                        class="btn btn-primary" 
                        onclick='addToCart(${JSON.stringify(product).replace(/'/g, '&apos;')})'
                    >
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join('');
}

// Initialize wishlist count on page load
document.addEventListener('DOMContentLoaded', () => {
  updateWishlistCount();
  renderWishlist();

  // Update cart count
  const cart = localStorage.getItem('cart');
  if (cart) {
    const cartItems = JSON.parse(cart);
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
      cartBadge.textContent = cartItems.reduce((total, item) => total + item.quantity, 0);
    }
  }
});

// Make functions globally available
window.removeFromWishlist = removeFromWishlist;
window.addToCart = addToCart;
