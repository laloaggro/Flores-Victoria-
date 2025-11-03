// Script para cargar productos en la página de productos
// Este archivo está en public/ para que no sea procesado por Vite

(async function loadProducts() {
  console.log('🌸 Iniciando carga de productos...');
  
  try {
    const response = await fetch('/assets/mock/products.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const products = await response.json();
    console.log(`📦 ${products.length} productos recibidos del servidor`);
    
    const grid = document.getElementById('productsGrid');
    
    if (!grid) {
      console.error('❌ No se encontró el elemento #productsGrid');
      return;
    }
    
    // Limpiar skeleton loaders
    grid.innerHTML = '';
    
    // Renderizar productos
    products.forEach((product, index) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.setAttribute('data-product-id', product.id);
      
      card.innerHTML = `
        <div class="product-image">
          <img src="${product.image_url}" 
               alt="${product.name}" 
               loading="${index < 4 ? 'eager' : 'lazy'}"
               onerror="this.src='/assets/images/placeholder.svg'">
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
    
    console.log(`✅ ${products.length} productos renderizados exitosamente`);
    
    // Actualizar contador de resultados si existe
    const resultsInfo = document.getElementById('resultsInfo');
    if (resultsInfo) {
      resultsInfo.textContent = `Mostrando ${products.length} productos`;
    }
    
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    
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
})();
