/**
 * Utilidades para renderizar tarjetas de productos mejoradas
 * Incluye badges, quick actions, y efectos visuales
 */

/**
 * Formatea un precio en formato CLP
 */
function formatPrice(price) {
  if (typeof price !== 'number') {
    price = parseFloat(price) || 0;
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
}

/**
 * Calcula el descuento de un producto
 */
function calculateDiscount(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Genera los badges de un producto
 */
function generateBadges(product) {
  const badges = [];

  // Badge de destacado
  if (product.featured) {
    badges.push('<span class="badge badge-featured">⭐ Destacado</span>');
  }

  // Badge de descuento
  const discount = calculateDiscount(product.price, product.original_price);
  if (discount > 0) {
    badges.push(`<span class="badge badge-sale">-${discount}%</span>`);
  }

  // Badge de nuevo (productos creados en últimos 30 días)
  const createdAt = product.created_at ? new Date(product.created_at) : null;
  if (createdAt) {
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 30) {
      badges.push('<span class="badge badge-new">🆕 Nuevo</span>');
    }
  }

  // Badge de stock limitado
  if (product.stock > 0 && product.stock < 5) {
    badges.push(`<span class="badge badge-limited">⚠️ Solo ${product.stock} disponibles</span>`);
  }

  return badges.length > 0 ? `<div class="product-badges">${badges.join('')}</div>` : '';
}

/**
 * Genera las acciones rápidas (wishlist, quick view, compare)
 */
function generateQuickActions(productId) {
  return `
    <div class="product-quick-actions">
      <button class="btn-icon btn-wishlist" 
              data-product-id="${productId}" 
              title="Agregar a favoritos"
              aria-label="Agregar a favoritos">
        <i class="far fa-heart"></i>
      </button>
      <button class="btn-icon btn-quick-view" 
              data-product-id="${productId}" 
              title="Vista rápida"
              aria-label="Vista rápida">
        <i class="far fa-eye"></i>
      </button>
      <button class="btn-icon btn-compare" 
              data-product-id="${productId}" 
              title="Comparar producto"
              aria-label="Comparar producto">
        <i class="fas fa-layer-group"></i>
      </button>
      <button class="btn-icon btn-share" 
              data-product-id="${productId}" 
              title="Compartir"
              aria-label="Compartir producto">
        <i class="far fa-share-alt"></i>
      </button>
    </div>
  `;
}

/**
 * Genera las imágenes del producto con efecto hover
 */
function generateProductImages(product) {
  const mainImage = product.images?.[0] || '/images/placeholders/flower-placeholder.svg';
  const hoverImage = product.images?.[1] || mainImage;

  return `
    <div class="product-image-wrapper">
      <img 
        src="${mainImage}" 
        alt="${product.name}" 
        class="product-image-main"
        loading="lazy"
        onerror="this.src='/images/placeholders/flower-placeholder.svg'"
      />
      ${
        product.images?.length > 1
          ? `
        <img 
          src="${hoverImage}" 
          alt="${product.name}" 
          class="product-image-hover"
          loading="lazy"
          onerror="this.style.display='none'"
        />
      `
          : ''
      }
    </div>
  `;
}

/**
 * Genera los highlights del producto (flores principales)
 */
function generateHighlights(product) {
  if (!product.flowers || product.flowers.length === 0) return '';

  const flowerTags = product.flowers
    .slice(0, 3)
    .map((flower) => `<span class="flower-tag">🌸 ${flower}</span>`)
    .join('');

  return `<div class="product-highlights">${flowerTags}</div>`;
}

/**
 * Genera la sección de rating
 */
function generateRating(product) {
  if (!product.rating) return '';

  const stars = '⭐'.repeat(Math.round(product.rating));
  const reviewsText = product.reviews_count ? `(${product.reviews_count})` : '';

  return `
    <span class="product-rating">
      ${stars} ${product.rating} <small>${reviewsText}</small>
    </span>
  `;
}

/**
 * Genera la información de entrega
 */
function generateDeliveryInfo(product) {
  if (!product.delivery_time) return '';

  const isExpress =
    product.delivery_time.includes('2-4') || product.delivery_time.includes('express');

  return `
    <div class="product-delivery ${isExpress ? 'express' : ''}">
      <i class="fas fa-shipping-fast"></i>
      <span>${product.delivery_time}</span>
    </div>
  `;
}

/**
 * Genera la sección de precio
 */
function generatePriceSection(product) {
  const discount = calculateDiscount(product.price, product.original_price);

  return `
    <div class="product-price-section">
      ${
        product.original_price && discount > 0
          ? `
        <span class="price-original">${formatPrice(product.original_price)}</span>
      `
          : ''
      }
      <span class="price-current">${formatPrice(product.price)}</span>
      ${
        discount > 0
          ? `
        <span class="price-discount">-${discount}%</span>
      `
          : ''
      }
    </div>
  `;
}

/**
 * Genera el indicador de stock
 */
function generateStockIndicator(product) {
  if (product.stock === 0) {
    return '<div class="stock-indicator out-of-stock">❌ Agotado</div>';
  }

  if (product.stock < 5) {
    return `<div class="stock-indicator low-stock">⚠️ Solo ${product.stock} disponibles</div>`;
  }

  return '<div class="stock-indicator in-stock">✅ Disponible</div>';
}

/**
 * Renderiza una tarjeta de producto completa
 */
export function renderProductCard(product) {
  const categoryName = product.category?.replace(/_/g, ' ').toUpperCase() || 'FLORES';

  return `
    <div class="product-card" data-product-id="${product.id}">
      ${generateBadges(product)}
      ${generateQuickActions(product.id)}
      
      ${generateProductImages(product)}
      
      <div class="product-info">
        <div class="product-meta">
          <span class="product-category">${categoryName}</span>
          ${generateRating(product)}
        </div>
        
        <h3 class="product-title">${product.name}</h3>
        
        <p class="product-description">${product.description || ''}</p>
        
        ${generateHighlights(product)}
        ${generateDeliveryInfo(product)}
        ${generatePriceSection(product)}
        ${generateStockIndicator(product)}
        
        <button class="btn-add-cart" 
                data-product-id="${product.id}"
                ${product.stock === 0 ? 'disabled' : ''}>
          <i class="fas fa-shopping-cart"></i>
          ${product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  `;
}

/**
 * Renderiza un grid completo de productos
 */
export function renderProductsGrid(products) {
  if (!products || products.length === 0) {
    return `
      <div class="products-empty">
        <i class="fas fa-flower"></i>
        <h3>No se encontraron productos</h3>
        <p>Intenta ajustar los filtros o buscar algo diferente</p>
      </div>
    `;
  }

  return products.map((product) => renderProductCard(product)).join('');
}

/**
 * Muestra el estado de carga
 */
export function renderLoadingState() {
  return `
    <div class="products-loading">
      <div class="loading-spinner"></div>
    </div>
  `;
}

/**
 * Configura los event listeners para las acciones de las tarjetas
 */
export function setupCardEventListeners(container) {
  if (!container) return;

  // Botones de wishlist
  container.querySelectorAll('.btn-wishlist').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      toggleWishlist(productId, btn);
    });
  });

  // Botones de quick view
  container.querySelectorAll('.btn-quick-view').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      openQuickView(productId);
    });
  });

  // Botones de comparar
  container.querySelectorAll('.btn-compare').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      compareProduct(productId, btn);
    });
  });

  // Botones de compartir
  container.querySelectorAll('.btn-share').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      shareProduct(productId);
    });
  });

  // Botones de agregar al carrito
  container.querySelectorAll('.btn-add-cart').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      addToCart(productId, btn);
    });
  });
}

/**
 * Toggle wishlist
 */
function toggleWishlist(productId, button) {
  const isActive = button.classList.contains('active');

  if (isActive) {
    button.classList.remove('active');
    button.querySelector('i').className = 'far fa-heart';
    showToast('Eliminado de favoritos', 'info');
  } else {
    button.classList.add('active');
    button.querySelector('i').className = 'fas fa-heart';
    showToast('Agregado a favoritos ❤️', 'success');
  }

  // Aquí se haría la llamada a la API para guardar en favoritos
  console.log('Toggle wishlist:', productId);
}

/**
 * Abrir Quick View modal
 */
function openQuickView(productId) {
  // Disparar evento personalizado para que el componente principal lo maneje
  window.dispatchEvent(new CustomEvent('open-quick-view', { detail: { productId } }));
}

/**
 * Comparar producto
 */
function compareProduct(productId, button) {
  // Obtener producto completo del evento
  window.dispatchEvent(new CustomEvent('toggle-compare', { detail: { productId } }));

  // Toggle visual del botón
  const isActive = button.classList.contains('active');
  if (isActive) {
    button.classList.remove('active');
    showToast('Producto eliminado de comparación', 'info');
  } else {
    button.classList.add('active');
    showToast('Producto agregado a comparación 📊', 'success');
  }
}

/**
 * Compartir producto
 */
async function shareProduct(productId) {
  const url = `${window.location.origin}/products/${productId}`;
  const title = 'Mira este hermoso arreglo floral';

  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      showToast('Compartido exitosamente', 'success');
    } catch (err) {
      if (err.name !== 'AbortError') {
        copyToClipboard(url);
      }
    }
  } else {
    copyToClipboard(url);
  }
}

/**
 * Copiar al portapapeles
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Link copiado al portapapeles', 'success');
  });
}

/**
 * Agregar al carrito
 */
function addToCart(productId, button) {
  button.disabled = true;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';

  // Simular llamada a API
  setTimeout(() => {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-check"></i> Agregado';

    setTimeout(() => {
      button.innerHTML = '<i class="fas fa-shopping-cart"></i> Agregar al carrito';
    }, 2000);

    showToast('Producto agregado al carrito 🛒', 'success');

    // Aquí se haría la llamada real a la API del carrito
    console.log('Add to cart:', productId);
  }, 500);
}

/**
 * Muestra un toast notification
 */
function showToast(message, type = 'info') {
  // Crear toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Añadir estilos de animación
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
