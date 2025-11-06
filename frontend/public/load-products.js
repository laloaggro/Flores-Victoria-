// Script para cargar productos en la página de productos
// Este archivo está en public/ para que no sea procesado por Vite

(async function loadProducts() {
  // console.log('🌸 Iniciando carga de productos...');
  
  let allProducts = [];
  let filteredProducts = [];
  
  // Estado de filtros
  const filters = {
    search: '',
    occasion: '',
    category: '',
    priceRange: null,
    color: '',
    expressDelivery: false
  };
  
  try {
    const response = await fetch('/assets/mock/products.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    allProducts = await response.json();
    filteredProducts = [...allProducts];
    // console.log(`📦 ${allProducts.length} productos recibidos del servidor`);
    
    renderProducts(filteredProducts);
    initializeFilters();
    
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    showError();
  }
  
  function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (!grid) {
      console.error('❌ No se encontró el elemento #productsGrid');
      return;
    }
    
    // Limpiar
    grid.innerHTML = '';
    
    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p style="color: #666; font-size: 1.1rem;">
            <i class="fas fa-search" style="font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.3;"></i>
            No se encontraron productos con los filtros seleccionados.<br>
            <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #C2185B; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Limpiar filtros
            </button>
          </p>
        </div>
      `;
      return;
    }
    
    // Renderizar productos
    products.forEach((product, index) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.setAttribute('data-product-id', product.id);
      card.setAttribute('data-category', product.category || '');
      
      // Generar URLs WebP y fallback
      const imageUrl = product.image_url;
      const webpUrl = imageUrl.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      const hasDifferentWebp = webpUrl !== imageUrl;
      
      card.innerHTML = `
        <div class="product-image">
          ${hasDifferentWebp ? `
            <picture>
              <source srcset="${webpUrl}" type="image/webp">
              <img src="${imageUrl}" 
                   alt="${product.name}" 
                   loading="${index < 8 ? 'eager' : 'lazy'}"
                   onerror="this.src='/assets/images/placeholder.svg'">
            </picture>
          ` : `
            <img src="${imageUrl}" 
                 alt="${product.name}" 
                 loading="${index < 8 ? 'eager' : 'lazy'}"
                 onerror="this.src='/assets/images/placeholder.svg'">
          `}
          ${product.category ? `<span class="product-badge">${getCategoryLabel(product.category)}</span>` : ''}
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <span class="product-price">$${product.price.toLocaleString('es-CL')}</span>
            <button class="btn-add-cart" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Agregar
            </button>
          </div>
        </div>
      `;
      
      grid.appendChild(card);
    });
    
    // console.log(`✅ ${products.length} productos renderizados exitosamente`);
    
    // Actualizar contador
    updateResultsInfo(products.length);
  }
  
  function initializeFilters() {
    // Búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value.toLowerCase();
        applyFilters();
      });
    }
    
    // Filtro de ocasión
    const occasionFilter = document.getElementById('occasion-filter');
    if (occasionFilter) {
      occasionFilter.addEventListener('change', (e) => {
        filters.occasion = e.target.value;
        applyFilters();
      });
    }
    
    // Filtro de categoría
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        filters.category = e.target.value;
        applyFilters();
      });
    }
    
    // Filtros de precio
    const priceChips = document.querySelectorAll('.price-chips button');
    priceChips.forEach(chip => {
      chip.addEventListener('click', () => {
        // Toggle active
        const wasActive = chip.classList.contains('active');
        priceChips.forEach(c => c.classList.remove('active'));
        
        if (!wasActive) {
          chip.classList.add('active');
          const range = chip.dataset.range.split('-');
          filters.priceRange = {
            min: parseInt(range[0]),
            max: parseInt(range[1])
          };
        } else {
          filters.priceRange = null;
        }
        
        applyFilters();
      });
    });
    
    // Filtros de color
    const colorChips = document.querySelectorAll('.color-chip');
    colorChips.forEach(chip => {
      chip.addEventListener('click', () => {
        // Toggle active
        const wasActive = chip.classList.contains('active');
        colorChips.forEach(c => c.classList.remove('active'));
        
        if (!wasActive) {
          chip.classList.add('active');
          filters.color = chip.dataset.color;
        } else {
          filters.color = '';
        }
        
        applyFilters();
      });
    });
    
    // Entrega express
    const expressDelivery = document.getElementById('express-delivery');
    if (expressDelivery) {
      expressDelivery.addEventListener('change', (e) => {
        filters.expressDelivery = e.target.checked;
        applyFilters();
      });
    }
    
    // Agregar event listeners a los botones de agregar al carrito
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add-cart')) {
        const button = e.target.closest('.btn-add-cart');
        const productId = parseInt(button.dataset.productId);
        addToCart(productId);
      }
    });
  }
  
  function applyFilters() {
    filteredProducts = allProducts.filter(product => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchTerm = filters.search;
        const matchName = product.name.toLowerCase().includes(searchTerm);
        const matchDescription = product.description?.toLowerCase().includes(searchTerm);
        const matchCategory = product.category?.toLowerCase().includes(searchTerm);
        
        if (!matchName && !matchDescription && !matchCategory) {
          return false;
        }
      }
      
      // Filtro de ocasión (mapear a categorías)
      if (filters.occasion) {
        const occasionMap = {
          'bodas': ['bodas'],
          'aniversario': ['aniversarios', 'amor'],
          'condolencias': ['funebres'],
          'cumpleanos': ['cumpleaños'],
          'amor': ['amor', 'rosas'],
          'graduacion': ['graduaciones'],
          'corporativo': ['corporativos'],
          'dia_madre': ['mama']
        };
        
        const validCategories = occasionMap[filters.occasion] || [];
        if (!validCategories.includes(product.category)) {
          return false;
        }
      }
      
      // Filtro de categoría
      if (filters.category) {
        const categoryMap = {
          'ramos': ['rosas', 'tulipanes', 'lirios', 'girasoles'],
          'premium': ['premium', 'orquideas'],
          'plantas': ['suculentas', 'orquideas'],
          'temporada': ['mixtos']
        };
        
        const validCategories = categoryMap[filters.category] || [];
        if (!validCategories.includes(product.category)) {
          return false;
        }
      }
      
      // Filtro de precio
      if (filters.priceRange) {
        if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
          return false;
        }
      }
      
      // Filtro de color (basado en el nombre del producto)
      if (filters.color) {
        const colorKeywords = {
          'rojo': ['rojo', 'rojas', 'passion', 'amor'],
          'rosa': ['rosa', 'rosada', 'rosadas'],
          'blanco': ['blanco', 'blanca', 'blancas', 'pureza'],
          'amarillo': ['amarillo', 'girasol', 'girasoles'],
          'morado': ['morado', 'lila', 'orquidea', 'hortensias'],
          'azul': ['azul', 'hortensias'],
          'multicolor': ['multicolor', 'mixto', 'colorida', 'vibrante']
        };
        
        const keywords = colorKeywords[filters.color] || [];
        const productText = `${product.name} ${product.description}`.toLowerCase();
        const matchesColor = keywords.some(keyword => productText.includes(keyword));
        
        if (!matchesColor) {
          return false;
        }
      }
      
      return true;
    });
    
    renderProducts(filteredProducts);
    updateActiveFilters();
  }
  
  function updateResultsInfo(count) {
    const resultsInfo = document.getElementById('resultsInfo');
    if (resultsInfo) {
      resultsInfo.textContent = `Mostrando ${count} producto${count !== 1 ? 's' : ''}`;
    }
  }
  
  function updateActiveFilters() {
    const container = document.getElementById('active-filters');
    if (!container) return;
    
    const activeFilters = [];
    
    if (filters.search) {
      activeFilters.push({ type: 'search', label: `Búsqueda: "${filters.search}"` });
    }
    if (filters.occasion) {
      activeFilters.push({ type: 'occasion', label: `Ocasión: ${getOccasionLabel(filters.occasion)}` });
    }
    if (filters.category) {
      activeFilters.push({ type: 'category', label: `Categoría: ${getCategoryFilterLabel(filters.category)}` });
    }
    if (filters.priceRange) {
      activeFilters.push({ 
        type: 'price', 
        label: `Precio: $${filters.priceRange.min.toLocaleString()} - $${filters.priceRange.max.toLocaleString()}` 
      });
    }
    if (filters.color) {
      activeFilters.push({ type: 'color', label: `Color: ${filters.color}` });
    }
    if (filters.expressDelivery) {
      activeFilters.push({ type: 'delivery', label: 'Entrega express' });
    }
    
    if (activeFilters.length === 0) {
      container.style.display = 'none';
      return;
    }
    
    container.style.display = 'flex';
    container.innerHTML = `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <strong style="margin-right: 0.5rem;">Filtros activos:</strong>
        ${activeFilters.map(filter => `
          <span class="filter-tag" data-filter-type="${filter.type}">
            ${filter.label}
            <button onclick="removeFilter('${filter.type}')" style="margin-left: 0.5rem; background: none; border: none; cursor: pointer; color: inherit;">×</button>
          </span>
        `).join('')}
        <button onclick="clearAllFilters()" style="padding: 0.25rem 0.75rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
          Limpiar todo
        </button>
      </div>
    `;
  }
  
  function getCategoryLabel(category) {
    const labels = {
      'rosas': '🌹 Rosas',
      'tulipanes': '🌷 Tulipanes',
      'orquideas': '🌺 Orquídeas',
      'girasoles': '🌻 Girasoles',
      'bouquets': '💐 Bouquets',
      'corporativos': '🏢 Corporativo',
      'lirios': '🌺 Lirios',
      'funebres': '🕊️ Condolencias',
      'cumpleaños': '🎂 Cumpleaños',
      'bodas': '💍 Bodas',
      'aniversarios': '💐 Aniversarios',
      'amor': '❤️ Amor',
      'mixtos': '🎨 Mixtos',
      'graduaciones': '🎓 Graduación',
      'mama': '👩 Mamá',
      'suculentas': '🌱 Suculentas',
      'premium': '⭐ Premium'
    };
    return labels[category] || category;
  }
  
  function getOccasionLabel(occasion) {
    const labels = {
      'bodas': 'Bodas',
      'aniversario': 'Aniversarios',
      'condolencias': 'Condolencias',
      'cumpleanos': 'Cumpleaños',
      'amor': 'Amor & Romance',
      'graduacion': 'Graduaciones',
      'corporativo': 'Corporativo',
      'nacimiento': 'Nacimiento',
      'dia_madre': 'Día de la Madre'
    };
    return labels[occasion] || occasion;
  }
  
  function getCategoryFilterLabel(category) {
    const labels = {
      'ramos': 'Ramos',
      'premium': 'Premium',
      'plantas': 'Plantas',
      'temporada': 'Temporada'
    };
    return labels[category] || category;
  }
  
  function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Obtener carrito actual
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url,
        quantity: 1
      });
    }
    
    // Guardar carrito
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar contador del carrito
    updateCartCount();
    
    // Mostrar notificación
    showNotification(`✅ ${product.name} agregado al carrito`);
  }
  
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
      el.textContent = totalItems;
    });
  }
  
  function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  function showError() {
    const grid = document.getElementById('productsGrid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p style="color: #721c24; background: #f8d7da; padding: 1rem; border-radius: 8px; margin: 0;">
            <strong>Error cargando productos</strong><br>
            Por favor recarga la página o intenta más tarde.
          </p>
        </div>
      `;
    }
  }
  
  // Funciones globales para los filtros
  window.removeFilter = function(type) {
    switch(type) {
      case 'search':
        filters.search = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        break;
      case 'occasion':
        filters.occasion = '';
        const occasionFilter = document.getElementById('occasion-filter');
        if (occasionFilter) occasionFilter.value = '';
        break;
      case 'category':
        filters.category = '';
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) categoryFilter.value = '';
        break;
      case 'price':
        filters.priceRange = null;
        document.querySelectorAll('.price-chips button').forEach(c => c.classList.remove('active'));
        break;
      case 'color':
        filters.color = '';
        document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
        break;
      case 'delivery':
        filters.expressDelivery = false;
        const expressDelivery = document.getElementById('express-delivery');
        if (expressDelivery) expressDelivery.checked = false;
        break;
    }
    applyFilters();
  };
  
  window.clearAllFilters = function() {
    filters.search = '';
    filters.occasion = '';
    filters.category = '';
    filters.priceRange = null;
    filters.color = '';
    filters.expressDelivery = false;
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    const occasionFilter = document.getElementById('occasion-filter');
    if (occasionFilter) occasionFilter.value = '';
    
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) categoryFilter.value = '';
    
    const expressDelivery = document.getElementById('express-delivery');
    if (expressDelivery) expressDelivery.checked = false;
    
    document.querySelectorAll('.price-chips button').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
    
    applyFilters();
  };
  
  // Inicializar contador del carrito al cargar
  updateCartCount();
  
})();
