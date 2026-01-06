/**
 * Flores Victoria - Admin Dashboard Pages
 * Dynamic page content and CRUD operations
 * Version: 2.0.0
 */

// ==================== PRODUCTS PAGE ====================

const ProductsPage = {
  products: [],
  filters: { category: '', search: '', status: 'all' },
  pagination: { page: 1, limit: 12, total: 0 },

  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p class="text-muted">Administra el catálogo de flores y arreglos</p>
        </div>
        <div class="page-actions" data-permission="products:create">
          <button class="btn btn-primary" id="add-product-btn">
            <i class="fas fa-plus"></i>
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar card">
        <div class="filters-row">
          <div class="search-input" style="flex: 2;">
            <i class="fas fa-search"></i>
            <input type="text" id="product-search" placeholder="Buscar productos..." class="form-input">
          </div>
          <select id="product-category" class="form-select">
            <option value="">Todas las categorías</option>
            <option value="rosas">🌹 Rosas</option>
            <option value="tulipanes">🌷 Tulipanes</option>
            <option value="girasoles">🌻 Girasoles</option>
            <option value="orquideas">🌺 Orquídeas</option>
            <option value="lirios">🌺 Lirios</option>
            <option value="bouquets">💐 Bouquets</option>
            <option value="cumpleanos">🎂 Cumpleaños</option>
            <option value="amor">❤️ Amor</option>
            <option value="aniversarios">💐 Aniversarios</option>
            <option value="bodas">💍 Bodas</option>
            <option value="graduacion">🎓 Graduación</option>
            <option value="condolencias">🕊️ Condolencias</option>
            <option value="corporativo">🏢 Corporativo</option>
            <option value="mama">👩 Mamá</option>
            <option value="mixtos">🎨 Mixtos</option>
            <option value="suculentas">🌱 Suculentas</option>
            <option value="premium">⭐ Premium</option>
            <option value="lujo">💎 Lujo</option>
          </select>
          <select id="product-status" class="form-select">
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="low_stock">Stock bajo</option>
          </select>
          <button class="btn btn-outline" id="export-products" data-permission="products:export">
            <i class="fas fa-download"></i>
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid" id="products-grid">
        <!-- Loading skeleton -->
        ${this.renderSkeleton()}
      </div>

      <!-- Pagination -->
      <div class="pagination" id="products-pagination"></div>
    `;

    // Initialize
    this.setupEventListeners();
    await this.loadProducts();
    window.RBAC.applyPermissions();
  },

  renderSkeleton() {
    return Array(8).fill('').map(() => `
      <div class="card product-card skeleton">
        <div class="skeleton-image" style="height: 200px;"></div>
        <div class="card-body">
          <div class="skeleton-text" style="width: 80%;"></div>
          <div class="skeleton-text" style="width: 60%;"></div>
          <div class="skeleton-text" style="width: 40%;"></div>
        </div>
      </div>
    `).join('');
  },

  setupEventListeners() {
    // Search
    document.getElementById('product-search')?.addEventListener('input', 
      this.debounce(() => this.loadProducts(), 300)
    );

    // Filters
    document.getElementById('product-category')?.addEventListener('change', () => this.loadProducts());
    document.getElementById('product-status')?.addEventListener('change', () => this.loadProducts());

    // Add product
    document.getElementById('add-product-btn')?.addEventListener('click', () => this.showProductModal());

    // Export
    document.getElementById('export-products')?.addEventListener('click', () => this.exportProducts());
  },

  async loadProducts() {
    const search = document.getElementById('product-search')?.value || '';
    const category = document.getElementById('product-category')?.value || '';
    const status = document.getElementById('product-status')?.value || 'all';

    try {
      // Try to fetch from real API first
      const response = await window.API.getProducts({ search, category, status, page: this.pagination.page });
      
      // Handle different response structures
      if (response?.data?.products) {
        this.products = response.data.products;
        this.pagination.total = response.total || response.data.products.length;
      } else if (response?.products) {
        this.products = response.products;
        this.pagination.total = response.total || response.products.length;
      } else if (Array.isArray(response?.data)) {
        this.products = response.data;
        this.pagination.total = response.data.length;
      } else {
        // Fallback to mock data
        this.products = this.getMockProducts();
        this.pagination.total = this.products.length;
      }
    } catch (error) {
      console.warn('Using mock products data:', error.message);
      this.products = this.getMockProducts();
      this.pagination.total = this.products.length;
    }

    // Apply local filters
    if (search) {
      this.products = this.products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      this.products = this.products.filter(p => p.category === category);
    }
    if (status !== 'all') {
      this.products = this.products.filter(p => p.status === status);
    }

    this.renderProducts();
  },

  getMockProducts() {
    return [
      // Productos reales del frontend Flores Victoria
      { id: '1', name: 'Ramo de Rosas Rojas Premium', price: 45000, category: 'rosas', stock: 15, status: 'active', description: 'Clásico ramo de 12 rosas rojas con follaje fresco.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PLT001.webp' },
      { id: '2', name: 'Tulipanes de Primavera', price: 35000, category: 'tulipanes', stock: 20, status: 'active', description: 'Colorido arreglo de 10 tulipanes mixtos importados de Holanda.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PLT002.webp' },
      { id: '3', name: 'Orquídea Phalaenopsis Elegante', price: 75000, category: 'orquideas', stock: 8, status: 'active', description: 'Elegante orquídea en maceta para regalo corporativo.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/EXO001.webp' },
      { id: '4', name: 'Girasoles Radiantes', price: 38000, category: 'girasoles', stock: 12, status: 'active', description: 'Arreglo de 8 girasoles con detalles verdes.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PLT003.webp' },
      { id: '5', name: 'Bouquet Deluxe Mixto', price: 52000, category: 'bouquets', stock: 10, status: 'active', description: 'Exquisito bouquet con rosas, lirios y flores de temporada.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/VAR004.webp' },
      { id: '6', name: 'Arreglo Floral Corporativo', price: 68000, category: 'corporativo', stock: 5, status: 'active', description: 'Arreglo elegante para oficinas y eventos.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/CRP001.webp' },
      { id: '7', name: 'Ramo de Lirios Blancos', price: 42000, category: 'lirios', stock: 18, status: 'active', description: 'Hermoso ramo de lirios blancos.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PLT004.webp' },
      { id: '8', name: 'Corona Fúnebre Tradicional', price: 95000, category: 'condolencias', stock: 3, status: 'low_stock', description: 'Elegante corona con rosas blancas y lirios.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/SYM001.webp' },
      { id: '9', name: 'Arreglo de Cumpleaños Festivo', price: 48000, category: 'cumpleanos', stock: 22, status: 'active', description: 'Alegre arreglo con flores coloridas y globo.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/BDY001.webp' },
      { id: '10', name: 'Centro de Mesa Rústico', price: 55000, category: 'bodas', stock: 7, status: 'active', description: 'Arreglo rústico para bodas campestres.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/AML001.webp' },
      { id: '11', name: 'Rosas Rosadas en Caja', price: 58000, category: 'rosas', stock: 9, status: 'active', description: '12 rosas rosadas en caja elegante.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/AML002.webp' },
      { id: '12', name: 'Arreglo Aniversario de Amor', price: 65000, category: 'aniversarios', stock: 6, status: 'active', description: 'Romántico arreglo con rosas y lirios.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/AML003.webp' },
      { id: '15', name: 'Dulce Compañía', price: 39000, category: 'amistad', stock: 30, status: 'active', description: 'Delicado arreglo pastel.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/THX001.webp' },
      { id: '22', name: 'Ramo de Graduación Especial', price: 47000, category: 'graduacion', stock: 20, status: 'active', description: 'Arreglo para celebrar logros académicos.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/GRD001.webp' },
      { id: '28', name: 'Te Amo Mamá Especial', price: 56000, category: 'mama', stock: 15, status: 'active', description: 'Arreglo dedicado a mamá.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/MAM028.webp' },
      { id: '30', name: 'Mini Jardín de Suculentas', price: 34000, category: 'suculentas', stock: 18, status: 'active', description: 'Jardín de suculentas en maceta.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/SUS001.webp' },
      { id: '60', name: 'Arreglo Premium Signature', price: 89000, category: 'premium', stock: 2, status: 'low_stock', description: 'Nuestro arreglo insignia.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PRE060.webp' },
      { id: '125', name: 'Mega Ramo 100 Rosas', price: 295000, category: 'lujo', stock: 1, status: 'low_stock', description: 'Espectacular ramo de 100 rosas.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/ROS125.webp' },
    ];
  },

  renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (this.products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <i class="fas fa-box-open" style="font-size: 48px; color: var(--text-muted);"></i>
          <h3>No se encontraron productos</h3>
          <p>Intenta con otros filtros o agrega un nuevo producto</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.products.map(product => `
      <div class="card product-card" data-id="${product.id}">
        <div class="product-image">
          <img src="${product.image || 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=300'}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=300'">
          <div class="product-badges">
            ${product.stock <= 5 && product.stock > 0 ? '<span class="badge badge-warning">Stock bajo</span>' : ''}
            ${product.stock === 0 ? '<span class="badge badge-danger">Agotado</span>' : ''}
            ${product.status === 'inactive' ? '<span class="badge badge-secondary">Inactivo</span>' : ''}
          </div>
          <div class="product-actions">
            <button class="btn btn-sm btn-light" onclick="ProductsPage.viewProduct('${product.id}')" title="Ver">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-light" onclick="ProductsPage.editProduct('${product.id}')" title="Editar" data-permission="products:edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-light btn-danger" onclick="ProductsPage.deleteProduct('${product.id}')" title="Eliminar" data-permission="products:delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          <span class="badge badge-outline">${product.category}</span>
          <h4 class="product-name">${product.name}</h4>
          <div class="product-meta">
            <span class="product-price">${window.Format.currency(product.price)}</span>
            <span class="product-stock ${product.stock <= 5 ? 'low' : ''}">
              <i class="fas fa-boxes"></i> ${product.stock} en stock
            </span>
          </div>
        </div>
      </div>
    `).join('');

    window.RBAC.applyPermissions();
  },

  async showProductModal(product = null) {
    const isEdit = !!product;
    const categories = [
      { value: 'rosas', label: '🌹 Rosas' },
      { value: 'tulipanes', label: '🌷 Tulipanes' },
      { value: 'girasoles', label: '🌻 Girasoles' },
      { value: 'orquideas', label: '🌺 Orquídeas' },
      { value: 'lirios', label: '🌺 Lirios' },
      { value: 'bouquets', label: '💐 Bouquets' },
      { value: 'cumpleanos', label: '🎂 Cumpleaños' },
      { value: 'amor', label: '❤️ Amor' },
      { value: 'aniversarios', label: '💐 Aniversarios' },
      { value: 'bodas', label: '💍 Bodas' },
      { value: 'graduacion', label: '🎓 Graduación' },
      { value: 'condolencias', label: '🕊️ Condolencias' },
      { value: 'corporativo', label: '🏢 Corporativo' },
      { value: 'mama', label: '👩 Mamá' },
      { value: 'mixtos', label: '🎨 Mixtos' },
      { value: 'suculentas', label: '🌱 Suculentas' },
      { value: 'premium', label: '⭐ Premium' },
      { value: 'lujo', label: '💎 Lujo' }
    ];

    const content = `
      <form id="product-form" class="form-grid">
        <!-- AI Generation Section -->
        ${!isEdit ? `
        <div class="form-group full-width ai-generation-section">
          <label class="form-label">
            <i class="fas fa-magic"></i> Generar con IA (HuggingFace)
          </label>
          <div class="ai-input-row" style="display: flex; gap: 0.5rem;">
            <input type="text" id="ai-prompt" class="form-input" placeholder="Ej: Ramo de 24 rosas rojas para aniversario con follaje y lazo dorado..." style="flex: 1;">
            <button type="button" id="generate-ai-btn" class="btn btn-outline btn-ai">
              <i class="fas fa-robot"></i>
              <span>Generar</span>
            </button>
          </div>
          <small class="text-muted">Describe el producto y la IA generará nombre, descripción y precio sugerido</small>
        </div>
        ` : ''}
        
        <div class="form-group full-width">
          <label class="form-label">Nombre del producto *</label>
          <input type="text" name="name" class="form-input" value="${product?.name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Categoría *</label>
          <select name="category" class="form-select" required>
            ${categories.map(cat => `<option value="${cat.value}" ${product?.category === cat.value ? 'selected' : ''}>${cat.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Precio (CLP) *</label>
          <input type="number" name="price" class="form-input" value="${product?.price || ''}" min="0" step="1000" required>
        </div>
        <div class="form-group">
          <label class="form-label">Stock *</label>
          <input type="number" name="stock" class="form-input" value="${product?.stock || 0}" min="0" required>
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select name="status" class="form-select">
            <option value="active" ${product?.status === 'active' ? 'selected' : ''}>Activo</option>
            <option value="inactive" ${product?.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label class="form-label">Descripción</label>
          <textarea name="description" class="form-textarea" rows="3">${product?.description || ''}</textarea>
        </div>
        <div class="form-group full-width">
          <label class="form-label">URL de imagen</label>
          <input type="url" name="image" class="form-input" value="${product?.image || ''}" placeholder="https://...">
        </div>
      </form>
    `;

    const result = await window.Modal.show({
      title: isEdit ? '<i class="fas fa-edit"></i> Editar Producto' : '<i class="fas fa-plus-circle"></i> Nuevo Producto',
      content,
      size: 'lg',
      buttons: [
        { text: 'Cancelar', variant: 'secondary', action: 'close' },
        { text: isEdit ? 'Guardar Cambios' : 'Crear Producto', variant: 'primary', action: 'confirm' }
      ]
    });

    // Setup AI generation button after modal opens
    setTimeout(() => {
      document.getElementById('generate-ai-btn')?.addEventListener('click', async () => {
        const prompt = document.getElementById('ai-prompt')?.value;
        if (!prompt || prompt.length < 10) {
          window.Toast.warning('Por favor, describe el producto con más detalle');
          return;
        }
        await this.generateProductWithAI(prompt);
      });
    }, 100);

    if (result === 'confirm') {
      const form = document.getElementById('product-form');
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Ensure numeric fields
      data.price = parseFloat(data.price) || 0;
      data.stock = parseInt(data.stock) || 0;
      
      try {
        if (isEdit) {
          await window.API.put(`/products/${product.id}`, data);
          window.Toast.success('Producto actualizado exitosamente');
        } else {
          data.image = data.image || 'https://frontend-v2-production-7508.up.railway.app/images/products/final/VAR004.webp';
          await window.API.post('/products', data);
          window.Toast.success('Producto creado exitosamente');
        }
        await this.loadProducts();
      } catch (error) {
        window.Toast.error(error.message || 'Error al guardar producto');
      }
    }
  },

  /**
   * Generate product details using HuggingFace AI
   */
  async generateProductWithAI(prompt) {
    const btn = document.getElementById('generate-ai-btn');
    const originalText = btn.innerHTML;
    
    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
      btn.disabled = true;
      
      // Use HuggingFace Inference API
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, use environment variable for API key
          'Authorization': 'Bearer hf_demo'
        },
        body: JSON.stringify({
          inputs: `Eres un experto florista de la tienda "Flores Victoria". Genera los detalles de un producto floral basado en esta descripción: "${prompt}". 
          
Responde SOLO en formato JSON con esta estructura exacta:
{
  "name": "Nombre del arreglo (máximo 40 caracteres)",
  "description": "Descripción atractiva del producto (máximo 150 caracteres)",
  "category": "categoria (una de: rosas, tulipanes, girasoles, orquideas, lirios, bouquets, cumpleanos, amor, aniversarios, bodas, graduacion, condolencias, corporativo, mama, mixtos, suculentas, premium, lujo)",
  "price": numero_en_pesos_chilenos_sin_decimales (entre 25000 y 200000)
}`,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        // Fallback to local AI generation
        const generated = this.generateProductLocally(prompt);
        this.fillProductForm(generated);
        window.Toast.success('Producto generado (modo local)');
        return;
      }

      const data = await response.json();
      const text = data[0]?.generated_text || '';
      
      // Try to parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generated = JSON.parse(jsonMatch[0]);
        this.fillProductForm(generated);
        window.Toast.success('¡Producto generado con IA!');
      } else {
        throw new Error('No se pudo parsear respuesta');
      }
      
    } catch (error) {
      console.warn('HuggingFace API error, using local generation:', error);
      // Fallback to intelligent local generation
      const generated = this.generateProductLocally(prompt);
      this.fillProductForm(generated);
      window.Toast.success('Producto generado (modo offline)');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  /**
   * Local product generation based on keywords
   */
  generateProductLocally(prompt) {
    const lower = prompt.toLowerCase();
    
    // Detect category from keywords
    let category = 'mixtos';
    let basePrice = 45000;
    
    if (lower.includes('rosa')) { category = 'rosas'; basePrice = 50000; }
    else if (lower.includes('tulipan')) { category = 'tulipanes'; basePrice = 35000; }
    else if (lower.includes('girasol')) { category = 'girasoles'; basePrice = 38000; }
    else if (lower.includes('orquidea')) { category = 'orquideas'; basePrice = 75000; }
    else if (lower.includes('lirio')) { category = 'lirios'; basePrice = 42000; }
    else if (lower.includes('bouquet') || lower.includes('ramo')) { category = 'bouquets'; basePrice = 52000; }
    else if (lower.includes('cumple')) { category = 'cumpleanos'; basePrice = 48000; }
    else if (lower.includes('amor') || lower.includes('corazon')) { category = 'amor'; basePrice = 65000; }
    else if (lower.includes('aniversario')) { category = 'aniversarios'; basePrice = 68000; }
    else if (lower.includes('boda') || lower.includes('nupcial')) { category = 'bodas'; basePrice = 85000; }
    else if (lower.includes('graduacion')) { category = 'graduacion'; basePrice = 52000; }
    else if (lower.includes('condolencia') || lower.includes('funebre')) { category = 'condolencias'; basePrice = 95000; }
    else if (lower.includes('corporativo') || lower.includes('oficina')) { category = 'corporativo'; basePrice = 68000; }
    else if (lower.includes('mama') || lower.includes('madre')) { category = 'mama'; basePrice = 56000; }
    else if (lower.includes('suculenta')) { category = 'suculentas'; basePrice = 34000; }
    else if (lower.includes('premium') || lower.includes('lujo') || lower.includes('deluxe')) { category = 'premium'; basePrice = 95000; }
    
    // Adjust price based on modifiers
    if (lower.includes('grande') || lower.includes('xl') || lower.includes('100')) basePrice *= 1.5;
    if (lower.includes('pequeño') || lower.includes('mini')) basePrice *= 0.7;
    if (lower.includes('premium') || lower.includes('deluxe')) basePrice *= 1.3;
    
    // Generate name from prompt
    const words = prompt.split(' ').slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const name = words.join(' ').substring(0, 40);
    
    return {
      name: name || 'Arreglo Especial Victoria',
      description: prompt.length > 150 ? prompt.substring(0, 147) + '...' : prompt,
      category,
      price: Math.round(basePrice / 1000) * 1000
    };
  },

  /**
   * Fill the product form with generated data
   */
  fillProductForm(data) {
    const form = document.getElementById('product-form');
    if (!form) return;
    
    if (data.name) form.querySelector('[name="name"]').value = data.name;
    if (data.description) form.querySelector('[name="description"]').value = data.description;
    if (data.category) form.querySelector('[name="category"]').value = data.category;
    if (data.price) form.querySelector('[name="price"]').value = data.price;
  },

  viewProduct(id) {
    const product = this.products.find(p => p.id == id || p.id === id);
    if (!product) return;

    window.Modal.show({
      title: product.name,
      content: `
        <div class="product-detail">
          <img src="${product.image}" alt="${product.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: var(--radius);">
          <div class="product-info" style="margin-top: 16px;">
            <p><strong>Categoría:</strong> ${product.category}</p>
            <p><strong>Precio:</strong> ${window.Format.currency(product.price)}</p>
            <p><strong>Stock:</strong> ${product.stock} unidades</p>
            <p><strong>Estado:</strong> <span class="badge badge-${product.status === 'active' ? 'success' : 'secondary'}">${product.status}</span></p>
          </div>
        </div>
      `,
      buttons: [{ text: 'Cerrar', variant: 'secondary', action: 'close' }]
    });
  },

  editProduct(id) {
    const product = this.products.find(p => p.id == id || p.id === id);
    if (product) this.showProductModal(product);
  },

  async deleteProduct(id) {
    const product = this.products.find(p => p.id == id || p.id === id);
    if (!product) return;

    const confirmed = await window.Modal.confirm(
      `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      { title: 'Eliminar Producto', confirmText: 'Sí, eliminar', danger: true }
    );

    if (confirmed) {
      try {
        await window.API.delete(`/products/${id}`);
        window.Toast.success('Producto eliminado exitosamente');
        await this.loadProducts();
      } catch (error) {
        window.Toast.error(error.message || 'Error al eliminar');
      }
    }
  },

  exportProducts() {
    const csv = [
      ['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado'].join(','),
      ...this.products.map(p => [p.id, `"${p.name}"`, p.category, p.price, p.stock, p.status].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.Toast.success('Productos exportados');
  },

  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }
};

// ==================== ORDERS PAGE ====================

const OrdersPage = {
  orders: [],
  filters: { status: 'all', search: '', dateRange: '7d' },

  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Gestión de Pedidos</h2>
          <p class="text-muted">Administra y da seguimiento a los pedidos</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline" id="refresh-orders">
            <i class="fas fa-sync-alt"></i>
            <span>Actualizar</span>
          </button>
          <button class="btn btn-outline" id="export-orders" data-permission="orders:export">
            <i class="fas fa-download"></i>
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--warning-light); color: var(--warning);">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" id="pending-count">-</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--info-light); color: var(--info);">
            <i class="fas fa-truck"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" id="shipping-count">-</span>
            <span class="stat-label">En camino</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--success-light); color: var(--success);">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" id="completed-count">-</span>
            <span class="stat-label">Completados</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--danger-light); color: var(--danger);">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" id="cancelled-count">-</span>
            <span class="stat-label">Cancelados</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar card">
        <div class="filters-row">
          <div class="search-input" style="flex: 2;">
            <i class="fas fa-search"></i>
            <input type="text" id="order-search" placeholder="Buscar por # de orden o cliente..." class="form-input">
          </div>
          <select id="order-status" class="form-select">
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="preparing">Preparando</option>
            <option value="shipping">En camino</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select id="order-date" class="form-select">
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="all">Todo el tiempo</option>
          </select>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="card">
        <div class="table-container">
          <table class="table" id="orders-table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="orders-tbody">
              <tr><td colspan="7" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" id="orders-pagination"></div>
    `;

    this.setupEventListeners();
    await this.loadOrders();
    window.RBAC.applyPermissions();
  },

  setupEventListeners() {
    document.getElementById('order-search')?.addEventListener('input',
      this.debounce(() => this.loadOrders(), 300)
    );
    document.getElementById('order-status')?.addEventListener('change', () => this.loadOrders());
    document.getElementById('order-date')?.addEventListener('change', () => this.loadOrders());
    document.getElementById('refresh-orders')?.addEventListener('click', () => {
      window.Toast.info('Actualizando pedidos...');
      this.loadOrders();
    });
    document.getElementById('export-orders')?.addEventListener('click', () => this.exportOrders());
  },

  async loadOrders() {
    try {
      const response = await window.API.getOrders(this.filters);
      // Handle different response structures
      if (response?.data?.orders) {
        this.orders = response.data.orders;
      } else if (response?.orders) {
        this.orders = response.orders;
      } else if (Array.isArray(response?.data)) {
        this.orders = response.data;
      } else {
        this.orders = this.getMockOrders();
      }
    } catch (error) {
      console.warn('Using mock orders:', error.message);
      this.orders = this.getMockOrders();
    }

    this.renderOrders();
    this.updateStats();
  },

  getMockOrders() {
    const statuses = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];
    const names = ['Ana García', 'Carlos López', 'María Rodríguez', 'Juan Martínez', 'Laura Sánchez'];
    const products = ['Ramo de Rosas', 'Arreglo Primaveral', 'Orquídea Elegante', 'Centro de Mesa'];

    return Array(15).fill(null).map((_, i) => ({
      id: `ORD-${String(1000 + i).padStart(6, '0')}`,
      customer: {
        name: names[i % names.length],
        email: `cliente${i}@email.com`,
        phone: `+52 555 ${String(Math.random()).slice(2, 5)} ${String(Math.random()).slice(2, 6)}`
      },
      items: [
        { name: products[i % products.length], quantity: Math.floor(Math.random() * 3) + 1, price: Math.floor(Math.random() * 1000) + 500 }
      ],
      total: Math.floor(Math.random() * 3000) + 500,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      shippingAddress: {
        street: `Calle ${i + 1} #${100 + i}`,
        city: 'Ciudad de México',
        state: 'CDMX'
      }
    }));
  },

  renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    const statusConfig = {
      pending: { label: 'Pendiente', class: 'warning', icon: 'clock' },
      confirmed: { label: 'Confirmado', class: 'info', icon: 'check' },
      preparing: { label: 'Preparando', class: 'info', icon: 'box' },
      shipping: { label: 'En camino', class: 'primary', icon: 'truck' },
      delivered: { label: 'Entregado', class: 'success', icon: 'check-circle' },
      cancelled: { label: 'Cancelado', class: 'danger', icon: 'times-circle' }
    };

    if (this.orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No se encontraron pedidos</td></tr>`;
      return;
    }

    tbody.innerHTML = this.orders.map(order => {
      const status = statusConfig[order.status] || statusConfig.pending;
      return `
        <tr data-id="${order.id}">
          <td>
            <strong class="order-id">${order.id}</strong>
          </td>
          <td>
            <div class="customer-info">
              <span class="customer-name">${order.customer?.name || 'Cliente'}</span>
              <span class="customer-email">${order.customer?.email || ''}</span>
            </div>
          </td>
          <td>
            <span class="items-count">${order.items?.length || 0} producto(s)</span>
          </td>
          <td>
            <strong>${window.Format.currency(order.total)}</strong>
          </td>
          <td>
            <span class="badge badge-${status.class}">
              <i class="fas fa-${status.icon}"></i>
              ${status.label}
            </span>
          </td>
          <td>
            <span title="${new Date(order.createdAt).toLocaleString()}">${window.Format.relative(order.createdAt)}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-sm btn-ghost" onclick="OrdersPage.viewOrder('${order.id}')" title="Ver detalles">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-ghost" onclick="OrdersPage.changeStatus('${order.id}')" title="Cambiar estado" data-permission="orders:edit">
                <i class="fas fa-exchange-alt"></i>
              </button>
              <button class="btn btn-sm btn-ghost" onclick="OrdersPage.printOrder('${order.id}')" title="Imprimir">
                <i class="fas fa-print"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    window.RBAC.applyPermissions();
  },

  updateStats() {
    const counts = {
      pending: 0, shipping: 0, completed: 0, cancelled: 0
    };

    this.orders.forEach(order => {
      if (order.status === 'pending' || order.status === 'confirmed') counts.pending++;
      else if (order.status === 'shipping' || order.status === 'preparing') counts.shipping++;
      else if (order.status === 'delivered') counts.completed++;
      else if (order.status === 'cancelled') counts.cancelled++;
    });

    document.getElementById('pending-count').textContent = counts.pending;
    document.getElementById('shipping-count').textContent = counts.shipping;
    document.getElementById('completed-count').textContent = counts.completed;
    document.getElementById('cancelled-count').textContent = counts.cancelled;
  },

  async viewOrder(id) {
    const order = this.orders.find(o => o.id === id);
    if (!order) return;

    const statusConfig = {
      pending: { label: 'Pendiente', class: 'warning' },
      confirmed: { label: 'Confirmado', class: 'info' },
      preparing: { label: 'Preparando', class: 'info' },
      shipping: { label: 'En camino', class: 'primary' },
      delivered: { label: 'Entregado', class: 'success' },
      cancelled: { label: 'Cancelado', class: 'danger' }
    };

    const status = statusConfig[order.status];

    await window.Modal.show({
      title: `Pedido ${order.id}`,
      content: `
        <div class="order-detail">
          <div class="order-header">
            <span class="badge badge-${status.class}">${status.label}</span>
            <span class="order-date">${window.Format.dateTime(order.createdAt)}</span>
          </div>

          <div class="order-section">
            <h4><i class="fas fa-user"></i> Cliente</h4>
            <p><strong>${order.customer?.name}</strong></p>
            <p>${order.customer?.email}</p>
            <p>${order.customer?.phone}</p>
          </div>

          <div class="order-section">
            <h4><i class="fas fa-map-marker-alt"></i> Dirección de envío</h4>
            <p>${order.shippingAddress?.street}</p>
            <p>${order.shippingAddress?.city}, ${order.shippingAddress?.state}</p>
          </div>

          <div class="order-section">
            <h4><i class="fas fa-shopping-bag"></i> Productos</h4>
            <table class="mini-table">
              ${order.items?.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>x${item.quantity}</td>
                  <td>${window.Format.currency(item.price * item.quantity)}</td>
                </tr>
              `).join('') || '<tr><td colspan="3">Sin productos</td></tr>'}
            </table>
          </div>

          <div class="order-total">
            <span>Total:</span>
            <strong>${window.Format.currency(order.total)}</strong>
          </div>
        </div>
      `,
      size: 'md',
      buttons: [
        { text: 'Cerrar', variant: 'secondary', action: 'close' },
        { text: 'Cambiar Estado', variant: 'primary', action: 'change-status' }
      ]
    }).then(action => {
      if (action === 'change-status') this.changeStatus(id);
    });
  },

  async changeStatus(id) {
    const order = this.orders.find(o => o.id === id);
    if (!order) return;

    const statuses = [
      { value: 'pending', label: 'Pendiente' },
      { value: 'confirmed', label: 'Confirmado' },
      { value: 'preparing', label: 'Preparando' },
      { value: 'shipping', label: 'En camino' },
      { value: 'delivered', label: 'Entregado' },
      { value: 'cancelled', label: 'Cancelado' }
    ];

    const content = `
      <form id="status-form">
        <div class="form-group">
          <label class="form-label">Nuevo estado</label>
          <select name="status" class="form-select">
            ${statuses.map(s => `<option value="${s.value}" ${order.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nota (opcional)</label>
          <textarea name="note" class="form-textarea" rows="2" placeholder="Añade una nota sobre este cambio..."></textarea>
        </div>
      </form>
    `;

    const result = await window.Modal.show({
      title: `Cambiar estado de ${order.id}`,
      content,
      buttons: [
        { text: 'Cancelar', variant: 'secondary', action: 'close' },
        { text: 'Actualizar', variant: 'primary', action: 'confirm' }
      ]
    });

    if (result === 'confirm') {
      const form = document.getElementById('status-form');
      const newStatus = form.querySelector('[name="status"]').value;
      
      try {
        await window.API.put(`/orders/${id}/status`, { status: newStatus });
        order.status = newStatus;
        this.renderOrders();
        this.updateStats();
        window.Toast.success('Estado actualizado');
      } catch (error) {
        // Mock update for demo
        order.status = newStatus;
        this.renderOrders();
        this.updateStats();
        window.Toast.success('Estado actualizado');
      }
    }
  },

  printOrder(id) {
    window.Toast.info('Preparando impresión...');
    // In a real app, this would open a print-friendly view
    setTimeout(() => window.Toast.success('Orden lista para imprimir'), 500);
  },

  exportOrders() {
    const csv = [
      ['ID', 'Cliente', 'Email', 'Total', 'Estado', 'Fecha'].join(','),
      ...this.orders.map(o => [
        o.id,
        `"${o.customer?.name || ''}"`,
        o.customer?.email || '',
        o.total,
        o.status,
        new Date(o.createdAt).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.Toast.success('Pedidos exportados');
  },

  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }
};

// ==================== USERS PAGE ====================

const UsersPage = {
  users: [],

  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p class="text-muted">Administra usuarios y permisos del sistema</p>
        </div>
        <div class="page-actions" data-permission="users:create">
          <button class="btn btn-primary" id="add-user-btn">
            <i class="fas fa-user-plus"></i>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar card">
        <div class="filters-row">
          <div class="search-input" style="flex: 2;">
            <i class="fas fa-search"></i>
            <input type="text" id="user-search" placeholder="Buscar usuarios..." class="form-input">
          </div>
          <select id="user-role" class="form-select">
            <option value="">Todos los roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="worker">Worker</option>
            <option value="viewer">Viewer</option>
          </select>
          <select id="user-status" class="form-select">
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card">
        <div class="table-container">
          <table class="table" id="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="users-tbody">
              <tr><td colspan="6" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.setupEventListeners();
    await this.loadUsers();
    window.RBAC.applyPermissions();
  },

  setupEventListeners() {
    document.getElementById('user-search')?.addEventListener('input',
      this.debounce(() => this.filterUsers(), 300)
    );
    document.getElementById('user-role')?.addEventListener('change', () => this.filterUsers());
    document.getElementById('user-status')?.addEventListener('change', () => this.filterUsers());
    document.getElementById('add-user-btn')?.addEventListener('click', () => this.showUserModal());
  },

  async loadUsers() {
    try {
      const response = await window.API.getUsers();
      // Handle different response structures
      if (response?.data?.users) {
        this.users = response.data.users;
      } else if (response?.users) {
        this.users = response.users;
      } else if (Array.isArray(response?.data)) {
        this.users = response.data;
      } else {
        this.users = this.getMockUsers();
      }
    } catch (error) {
      console.warn('Using mock users:', error.message);
      this.users = this.getMockUsers();
    }

    this.renderUsers();
  },

  getMockUsers() {
    return [
      { id: 1, username: 'superadmin', name: 'Super Administrador', email: 'super@floresvictoria.com', role: 'superadmin', active: true, lastLogin: new Date().toISOString() },
      { id: 2, username: 'admin', name: 'Victoria Flores', email: 'admin@floresvictoria.com', role: 'admin', active: true, lastLogin: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, username: 'manager', name: 'Roberto Martínez', email: 'manager@floresvictoria.com', role: 'manager', active: true, lastLogin: new Date(Date.now() - 172800000).toISOString() },
      { id: 4, username: 'worker', name: 'María García', email: 'worker@floresvictoria.com', role: 'worker', active: true, lastLogin: new Date(Date.now() - 3600000).toISOString() },
      { id: 5, username: 'viewer', name: 'Carlos López', email: 'viewer@floresvictoria.com', role: 'viewer', active: true, lastLogin: new Date(Date.now() - 604800000).toISOString() },
    ];
  },

  renderUsers(users = this.users) {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    const roleConfig = {
      superadmin: { label: 'Superadmin', class: 'danger', icon: 'crown' },
      admin: { label: 'Admin', class: 'warning', icon: 'shield-alt' },
      manager: { label: 'Manager', class: 'info', icon: 'user-tie' },
      worker: { label: 'Worker', class: 'success', icon: 'user-cog' },
      viewer: { label: 'Viewer', class: 'secondary', icon: 'eye' }
    };

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No se encontraron usuarios</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(user => {
      const role = roleConfig[user.role] || roleConfig.viewer;
      return `
        <tr data-id="${user.id}">
          <td>
            <div class="user-cell">
              <div class="user-avatar">${user.name?.charAt(0) || 'U'}</div>
              <div class="user-info">
                <strong>${user.name}</strong>
                <span class="text-muted">@${user.username}</span>
              </div>
            </div>
          </td>
          <td>${user.email}</td>
          <td>
            <span class="badge badge-${role.class}">
              <i class="fas fa-${role.icon}"></i>
              ${role.label}
            </span>
          </td>
          <td>
            <span class="status-dot ${user.active ? 'active' : 'inactive'}"></span>
            ${user.active ? 'Activo' : 'Inactivo'}
          </td>
          <td>
            <span title="${new Date(user.lastLogin).toLocaleString()}">${window.Format.relative(user.lastLogin)}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-sm btn-ghost" onclick="UsersPage.editUser(${user.id})" title="Editar" data-permission="users:edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-ghost" onclick="UsersPage.toggleStatus(${user.id})" title="${user.active ? 'Desactivar' : 'Activar'}" data-permission="users:edit">
                <i class="fas fa-${user.active ? 'ban' : 'check'}"></i>
              </button>
              <button class="btn btn-sm btn-ghost btn-danger" onclick="UsersPage.deleteUser(${user.id})" title="Eliminar" data-permission="users:delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    window.RBAC.applyPermissions();
  },

  filterUsers() {
    const search = document.getElementById('user-search')?.value.toLowerCase() || '';
    const role = document.getElementById('user-role')?.value || '';
    const status = document.getElementById('user-status')?.value || '';

    const filtered = this.users.filter(user => {
      const matchSearch = !search || 
        user.name.toLowerCase().includes(search) || 
        user.email.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search);
      const matchRole = !role || user.role === role;
      const matchStatus = !status || (status === 'active' && user.active) || (status === 'inactive' && !user.active);
      return matchSearch && matchRole && matchStatus;
    });

    this.renderUsers(filtered);
  },

  async showUserModal(user = null) {
    const isEdit = !!user;
    const roles = ['superadmin', 'admin', 'manager', 'worker', 'viewer'];

    const content = `
      <form id="user-form" class="form-grid">
        <div class="form-group">
          <label class="form-label">Nombre completo *</label>
          <input type="text" name="name" class="form-input" value="${user?.name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Usuario *</label>
          <input type="text" name="username" class="form-input" value="${user?.username || ''}" required ${isEdit ? 'disabled' : ''}>
        </div>
        <div class="form-group full-width">
          <label class="form-label">Email *</label>
          <input type="email" name="email" class="form-input" value="${user?.email || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Rol *</label>
          <select name="role" class="form-select" required>
            ${roles.map(r => `<option value="${r}" ${user?.role === r ? 'selected' : ''}>${r.charAt(0).toUpperCase() + r.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${isEdit ? 'Nueva contraseña' : 'Contraseña *'}</label>
          <input type="password" name="password" class="form-input" ${isEdit ? '' : 'required'} placeholder="${isEdit ? 'Dejar vacío para mantener' : '••••••••'}">
        </div>
        <div class="form-group full-width">
          <label class="form-checkbox">
            <input type="checkbox" name="active" ${user?.active !== false ? 'checked' : ''}>
            <span>Usuario activo</span>
          </label>
        </div>
      </form>
    `;

    const result = await window.Modal.show({
      title: isEdit ? 'Editar Usuario' : 'Nuevo Usuario',
      content,
      size: 'md',
      buttons: [
        { text: 'Cancelar', variant: 'secondary', action: 'close' },
        { text: isEdit ? 'Guardar Cambios' : 'Crear Usuario', variant: 'primary', action: 'confirm' }
      ]
    });

    if (result === 'confirm') {
      const form = document.getElementById('user-form');
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        username: formData.get('username'),
        email: formData.get('email'),
        role: formData.get('role'),
        password: formData.get('password'),
        active: form.querySelector('[name="active"]').checked
      };

      try {
        if (isEdit) {
          await window.API.put(`/users/${user.id}`, data);
          window.Toast.success('Usuario actualizado exitosamente');
        } else {
          await window.API.post('/users', data);
          window.Toast.success('Usuario creado exitosamente');
        }
        await this.loadUsers();
      } catch (error) {
        window.Toast.error(error.message || 'Error al guardar usuario');
      }
    }
  },

  editUser(id) {
    const user = this.users.find(u => u.id == id || u.id === id);
    if (user) this.showUserModal(user);
  },

  async toggleStatus(id) {
    const user = this.users.find(u => u.id == id || u.id === id);
    if (!user) return;

    const action = user.active ? 'desactivar' : 'activar';
    const confirmed = await window.Modal.confirm(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} a "${user.name}"?`,
      { title: `${action.charAt(0).toUpperCase() + action.slice(1)} Usuario` }
    );

    if (confirmed) {
      try {
        await window.API.patch(`/users/${user.id}`, { active: !user.active });
        user.active = !user.active;
        this.renderUsers();
        window.Toast.success(`Usuario ${user.active ? 'activado' : 'desactivado'} exitosamente`);
      } catch (error) {
        window.Toast.error(error.message || 'Error al cambiar estado');
      }
    }
  },

  async deleteUser(id) {
    const user = this.users.find(u => u.id == id || u.id === id);
    if (!user) return;

    const confirmed = await window.Modal.confirm(
      `¿Eliminar a "${user.name}"? Esta acción no se puede deshacer.`,
      { title: 'Eliminar Usuario', confirmText: 'Sí, eliminar', danger: true }
    );

    if (confirmed) {
      try {
        await window.API.delete(`/users/${id}`);
        window.Toast.success('Usuario eliminado exitosamente');
        await this.loadUsers();
      } catch (error) {
        window.Toast.error(error.message || 'Error al eliminar');
      }
    }
  },

  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }
};

// ==================== ANALYTICS PAGE ====================

const AnalyticsPage = {
  charts: {},

  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Analytics</h2>
          <p class="text-muted">Métricas y análisis del negocio</p>
        </div>
        <div class="page-actions">
          <select id="analytics-period" class="form-select">
            <option value="7d">Últimos 7 días</option>
            <option value="30d" selected>Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Ingresos Totales</span>
            <span class="stat-change positive">+12.5%</span>
          </div>
          <div class="stat-value" id="total-revenue">$0</div>
          <div class="stat-chart" id="revenue-sparkline"></div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Pedidos</span>
            <span class="stat-change positive">+8.3%</span>
          </div>
          <div class="stat-value" id="total-orders">0</div>
          <div class="stat-chart" id="orders-sparkline"></div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Ticket Promedio</span>
            <span class="stat-change negative">-2.1%</span>
          </div>
          <div class="stat-value" id="avg-ticket">$0</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Tasa de Conversión</span>
            <span class="stat-change positive">+1.2%</span>
          </div>
          <div class="stat-value" id="conversion-rate">0%</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        <div class="card">
          <div class="card-header">
            <h3><i class="fas fa-chart-line"></i> Ventas por Período</h3>
          </div>
          <div class="card-body">
            <canvas id="sales-chart" height="300"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3><i class="fas fa-chart-pie"></i> Ventas por Categoría</h3>
          </div>
          <div class="card-body">
            <canvas id="categories-chart" height="300"></canvas>
          </div>
        </div>
      </div>

      <!-- Second Row -->
      <div class="charts-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        <div class="card">
          <div class="card-header">
            <h3><i class="fas fa-trophy"></i> Top Productos</h3>
          </div>
          <div class="card-body">
            <div id="top-products-list" class="top-list"></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3><i class="fas fa-map-marker-alt"></i> Ventas por Región</h3>
          </div>
          <div class="card-body">
            <canvas id="regions-chart" height="250"></canvas>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    await this.loadAnalytics();
  },

  setupEventListeners() {
    document.getElementById('analytics-period')?.addEventListener('change', () => this.loadAnalytics());
  },

  async loadAnalytics() {
    const period = document.getElementById('analytics-period')?.value || '30d';

    // Load mock data (replace with real API calls)
    const data = this.getMockAnalytics(period);

    // Update KPIs
    document.getElementById('total-revenue').textContent = window.Format.currency(data.revenue);
    document.getElementById('total-orders').textContent = window.Format.number(data.orders);
    document.getElementById('avg-ticket').textContent = window.Format.currency(data.avgTicket);
    document.getElementById('conversion-rate').textContent = window.Format.percentage(data.conversionRate);

    // Render charts
    this.renderSalesChart(data.salesByDay);
    this.renderCategoriesChart(data.byCategory);
    this.renderTopProducts(data.topProducts);
    this.renderRegionsChart(data.byRegion);
  },

  getMockAnalytics(period) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    
    return {
      revenue: Math.floor(Math.random() * 500000) + 100000,
      orders: Math.floor(Math.random() * 500) + 100,
      avgTicket: Math.floor(Math.random() * 1000) + 500,
      conversionRate: Math.random() * 5 + 2,
      salesByDay: Array(Math.min(days, 30)).fill(0).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000),
        sales: Math.floor(Math.random() * 20000) + 5000,
        orders: Math.floor(Math.random() * 20) + 5
      })),
      byCategory: [
        { name: 'Ramos', value: 45 },
        { name: 'Arreglos', value: 30 },
        { name: 'Plantas', value: 15 },
        { name: 'Accesorios', value: 10 }
      ],
      topProducts: [
        { name: 'Ramo de Rosas Rojas', sales: 156, revenue: 132600 },
        { name: 'Arreglo Primaveral', sales: 98, revenue: 117600 },
        { name: 'Orquídea Elegante', sales: 87, revenue: 82650 },
        { name: 'Centro de Mesa', sales: 65, revenue: 97500 },
        { name: 'Tulipanes Holandeses', sales: 54, revenue: 40500 }
      ],
      byRegion: [
        { name: 'CDMX', value: 40 },
        { name: 'Estado de México', value: 25 },
        { name: 'Guadalajara', value: 15 },
        { name: 'Monterrey', value: 12 },
        { name: 'Otros', value: 8 }
      ]
    };
  },

  renderSalesChart(data) {
    const ctx = document.getElementById('sales-chart')?.getContext('2d');
    if (!ctx) return;

    if (this.charts.sales) this.charts.sales.destroy();

    this.charts.sales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })),
        datasets: [{
          label: 'Ventas',
          data: data.map(d => d.sales),
          borderColor: '#C2185B',
          backgroundColor: 'rgba(194, 24, 91, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => window.Format.currency(value)
            }
          }
        }
      }
    });
  },

  renderCategoriesChart(data) {
    const ctx = document.getElementById('categories-chart')?.getContext('2d');
    if (!ctx) return;

    if (this.charts.categories) this.charts.categories.destroy();

    this.charts.categories = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: ['#C2185B', '#667eea', '#10b981', '#f59e0b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  },

  renderTopProducts(data) {
    const container = document.getElementById('top-products-list');
    if (!container) return;

    container.innerHTML = data.map((product, i) => `
      <div class="top-item">
        <span class="top-rank">${i + 1}</span>
        <div class="top-info">
          <span class="top-name">${product.name}</span>
          <span class="top-meta">${product.sales} ventas</span>
        </div>
        <span class="top-value">${window.Format.currency(product.revenue)}</span>
      </div>
    `).join('');
  },

  renderRegionsChart(data) {
    const ctx = document.getElementById('regions-chart')?.getContext('2d');
    if (!ctx) return;

    if (this.charts.regions) this.charts.regions.destroy();

    this.charts.regions = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          label: 'Ventas %',
          data: data.map(d => d.value),
          backgroundColor: '#667eea'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
};

// ==================== REPORTS PAGE ====================

const ReportsPage = {
  reports: [],
  
  // Cargar reportes desde localStorage
  loadReports() {
    const stored = localStorage.getItem('fv_admin_reports');
    if (stored) {
      this.reports = JSON.parse(stored);
    } else {
      // Reportes de ejemplo iniciales
      this.reports = [
        { id: '1', name: 'Ventas Diciembre 2025', type: 'sales', typeName: 'Ventas', period: '01-31 Dic', date: '2025-12-31', format: 'xlsx' },
        { id: '2', name: 'Inventario Q4', type: 'products', typeName: 'Productos', period: 'Q4 2025', date: '2025-12-15', format: 'pdf' },
        { id: '3', name: 'Clientes Nuevos', type: 'customers', typeName: 'Clientes', period: 'Nov 2025', date: '2025-12-01', format: 'csv' },
      ];
      this.saveReports();
    }
  },
  
  // Guardar reportes en localStorage
  saveReports() {
    localStorage.setItem('fv_admin_reports', JSON.stringify(this.reports));
  },
  
  // Agregar nuevo reporte
  addReport(report) {
    this.reports.unshift(report); // Agregar al inicio
    if (this.reports.length > 20) this.reports.pop(); // Mantener máximo 20
    this.saveReports();
    this.updateRecentReportsTable();
  },

  async render(container) {
    this.loadReports();
    
    container.innerHTML = `
      <div class="page-header animate-fade-in">
        <div>
          <h2>Reportes</h2>
          <p class="text-muted">Genera y descarga reportes del negocio</p>
        </div>
      </div>

      <!-- Quick Reports -->
      <div class="reports-grid animate-fade-in-up">
        ${this.renderReportCard('sales', 'Ventas del Período', 'Resumen de ventas por fecha', 'chart-line', 'success')}
        ${this.renderReportCard('products', 'Productos', 'Inventario y movimientos', 'box', 'info')}
        ${this.renderReportCard('customers', 'Clientes', 'Base de clientes y compras', 'users', 'primary')}
        ${this.renderReportCard('orders', 'Pedidos', 'Historial de pedidos', 'shopping-cart', 'warning')}
        ${this.renderReportCard('financial', 'Financiero', 'Ingresos y gastos', 'dollar-sign', 'success')}
        ${this.renderReportCard('performance', 'Rendimiento', 'KPIs y métricas', 'tachometer-alt', 'danger')}
      </div>

      <!-- Recent Reports -->
      <div class="card mt-lg animate-fade-in-up stagger-2">
        <div class="card-header">
          <h3><i class="fas fa-history"></i> Reportes Recientes</h3>
        </div>
        <div class="card-body">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Reporte</th>
                  <th>Tipo</th>
                  <th>Período</th>
                  <th>Generado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="recent-reports">
                ${this.renderRecentReports()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Report Generator Modal placeholder -->
      <div id="report-modal"></div>
    `;

    this.setupEventListeners();
    window.RBAC.applyPermissions();
  },

  renderReportCard(type, title, description, icon, color) {
    return `
      <div class="report-card card animate-scale-in" onclick="ReportsPage.generateReport('${type}')">
        <div class="report-icon" style="background: var(--${color}-light); color: var(--${color});">
          <i class="fas fa-${icon}"></i>
        </div>
        <div class="report-info">
          <h4>${title}</h4>
          <p>${description}</p>
        </div>
        <div class="report-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    `;
  },

  renderRecentReports() {
    if (this.reports.length === 0) {
      return `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <i class="fas fa-file-alt" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
            No hay reportes generados aún
          </td>
        </tr>
      `;
    }
    
    return this.reports.map(report => `
      <tr data-report-id="${report.id}">
        <td>
          <div class="report-name">
            <i class="fas fa-file-${report.format === 'xlsx' ? 'excel' : report.format === 'pdf' ? 'pdf' : 'csv'}" 
               style="color: ${report.format === 'xlsx' ? '#217346' : report.format === 'pdf' ? '#dc3545' : '#6c757d'}"></i>
            <span>${report.name}</span>
          </div>
        </td>
        <td><span class="badge badge-outline">${report.typeName}</span></td>
        <td>${report.period}</td>
        <td>${window.Format.date(report.date)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-ghost" onclick="ReportsPage.downloadReport('${report.id}')" title="Descargar">
              <i class="fas fa-download"></i>
            </button>
            <button class="btn btn-sm btn-ghost" onclick="ReportsPage.viewReport('${report.id}')" title="Ver">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-ghost btn-danger" onclick="ReportsPage.deleteReport('${report.id}')" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },
  
  // Actualizar tabla de reportes recientes
  updateRecentReportsTable() {
    const tbody = document.getElementById('recent-reports');
    if (tbody) {
      tbody.innerHTML = this.renderRecentReports();
    }
  },

  setupEventListeners() {
    // Report cards are handled with onclick
  },

  async generateReport(type) {
    const typeConfig = {
      sales: { title: 'Reporte de Ventas', icon: 'chart-line' },
      products: { title: 'Reporte de Productos', icon: 'box' },
      customers: { title: 'Reporte de Clientes', icon: 'users' },
      orders: { title: 'Reporte de Pedidos', icon: 'shopping-cart' },
      financial: { title: 'Reporte Financiero', icon: 'dollar-sign' },
      performance: { title: 'Reporte de Rendimiento', icon: 'tachometer-alt' }
    };

    const config = typeConfig[type];

    const content = `
      <form id="report-form">
        <div class="form-group">
          <label class="form-label">Período</label>
          <select name="period" class="form-select">
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="7d" selected>Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        <div id="custom-dates" class="form-grid hidden" style="grid-template-columns: 1fr 1fr; margin-top: 12px;">
          <div class="form-group">
            <label class="form-label">Fecha inicio</label>
            <input type="date" name="startDate" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Fecha fin</label>
            <input type="date" name="endDate" class="form-input">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Formato de exportación</label>
          <div class="format-options" style="display: flex; gap: 12px;">
            <label class="format-option">
              <input type="radio" name="format" value="xlsx" checked>
              <span class="format-box">
                <i class="fas fa-file-excel" style="color: #217346;"></i>
                <span>Excel</span>
              </span>
            </label>
            <label class="format-option">
              <input type="radio" name="format" value="pdf">
              <span class="format-box">
                <i class="fas fa-file-pdf" style="color: #dc3545;"></i>
                <span>PDF</span>
              </span>
            </label>
            <label class="format-option">
              <input type="radio" name="format" value="csv">
              <span class="format-box">
                <i class="fas fa-file-csv" style="color: #6c757d;"></i>
                <span>CSV</span>
              </span>
            </label>
          </div>
        </div>
      </form>
    `;

    const result = await window.Modal.show({
      title: `<i class="fas fa-${config.icon}"></i> ${config.title}`,
      content,
      size: 'md',
      buttons: [
        { text: 'Cancelar', variant: 'secondary', action: 'close' },
        { text: 'Generar Reporte', variant: 'primary', action: 'confirm' }
      ]
    });

    if (result === 'confirm') {
      const form = document.getElementById('report-form');
      const formData = new FormData(form);
      const period = formData.get('period');
      const format = formData.get('format');
      
      window.Toast.info('Generando reporte...');
      
      // Generar nombre del período
      const periodLabels = {
        'today': 'Hoy',
        'yesterday': 'Ayer',
        '7d': 'Últimos 7 días',
        '30d': 'Últimos 30 días',
        'month': 'Este mes',
        'quarter': 'Este trimestre',
        'year': 'Este año',
        'custom': 'Personalizado'
      };
      
      // Simular generación de reporte
      setTimeout(() => {
        const newReport = {
          id: Date.now().toString(),
          name: `${config.title} - ${periodLabels[period]}`,
          type: type,
          typeName: config.title.replace('Reporte de ', ''),
          period: periodLabels[period],
          date: new Date().toISOString(),
          format: format
        };
        
        // Agregar a la lista
        this.addReport(newReport);
        
        // Generar descarga simulada
        this.downloadReport(newReport.id);
        
        window.Toast.success(`${config.title} generado exitosamente`);
      }, 1500);
    }

    // Setup custom date toggle
    setTimeout(() => {
      document.querySelector('[name="period"]')?.addEventListener('change', (e) => {
        document.getElementById('custom-dates')?.classList.toggle('hidden', e.target.value !== 'custom');
      });
    }, 100);
  },
  
  // Descargar reporte
  downloadReport(id) {
    const report = this.reports.find(r => r.id === id);
    if (!report) return;
    
    // Generar contenido del reporte según tipo
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (report.format === 'csv') {
      content = this.generateCSVContent(report);
      filename = `${report.name.replace(/\s+/g, '_')}.csv`;
      mimeType = 'text/csv';
    } else if (report.format === 'xlsx') {
      // Para Excel, generamos CSV pero con nombre xlsx (simplificado)
      content = this.generateCSVContent(report);
      filename = `${report.name.replace(/\s+/g, '_')}.csv`;
      mimeType = 'text/csv';
      window.Toast.info('Exportado como CSV (compatibilidad Excel)');
    } else if (report.format === 'pdf') {
      // Para PDF, generamos texto formateado
      content = this.generateTextContent(report);
      filename = `${report.name.replace(/\s+/g, '_')}.txt`;
      mimeType = 'text/plain';
      window.Toast.info('Exportado como TXT (vista previa)');
    }
    
    // Crear y descargar archivo
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  // Generar contenido CSV
  generateCSVContent(report) {
    const headers = ['Fecha', 'Descripción', 'Valor', 'Estado'];
    const rows = [];
    
    // Generar datos de ejemplo según el tipo
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      if (report.type === 'sales') {
        rows.push([date.toLocaleDateString('es-CL'), `Venta #${1000 + i}`, `$${(Math.random() * 100000 + 20000).toFixed(0)}`, 'Completada']);
      } else if (report.type === 'products') {
        rows.push([date.toLocaleDateString('es-CL'), `Producto ${i + 1}`, `${Math.floor(Math.random() * 50)} unidades`, 'En stock']);
      } else if (report.type === 'customers') {
        rows.push([date.toLocaleDateString('es-CL'), `Cliente ${i + 1}`, `${Math.floor(Math.random() * 10)} compras`, 'Activo']);
      } else if (report.type === 'orders') {
        rows.push([date.toLocaleDateString('es-CL'), `Pedido ORD-${2000 + i}`, `$${(Math.random() * 80000 + 15000).toFixed(0)}`, ['Pendiente', 'Enviado', 'Entregado'][i % 3]]);
      } else if (report.type === 'financial') {
        rows.push([date.toLocaleDateString('es-CL'), i % 2 === 0 ? 'Ingreso' : 'Gasto', `$${(Math.random() * 50000 + 5000).toFixed(0)}`, 'Registrado']);
      } else {
        rows.push([date.toLocaleDateString('es-CL'), `Métrica ${i + 1}`, `${(Math.random() * 100).toFixed(1)}%`, 'Calculado']);
      }
    }
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  },
  
  // Generar contenido texto
  generateTextContent(report) {
    let content = `═══════════════════════════════════════════\n`;
    content += `  FLORES VICTORIA - ${report.name.toUpperCase()}\n`;
    content += `═══════════════════════════════════════════\n\n`;
    content += `Fecha de generación: ${new Date().toLocaleString('es-CL')}\n`;
    content += `Período: ${report.period}\n`;
    content += `Tipo: ${report.typeName}\n\n`;
    content += `───────────────────────────────────────────\n`;
    content += `  RESUMEN\n`;
    content += `───────────────────────────────────────────\n\n`;
    
    if (report.type === 'sales') {
      content += `Total Ventas: $1,250,000 CLP\n`;
      content += `Número de Transacciones: 156\n`;
      content += `Ticket Promedio: $8,012 CLP\n`;
      content += `Crecimiento vs período anterior: +12.5%\n`;
    } else if (report.type === 'products') {
      content += `Total Productos: 175\n`;
      content += `En Stock: 168\n`;
      content += `Stock Bajo: 5\n`;
      content += `Agotados: 2\n`;
      content += `Valor del Inventario: $4,500,000 CLP\n`;
    } else if (report.type === 'customers') {
      content += `Total Clientes: 1,234\n`;
      content += `Nuevos este período: 89\n`;
      content += `Clientes Recurrentes: 456\n`;
      content += `Tasa de Retención: 78%\n`;
    } else if (report.type === 'orders') {
      content += `Total Pedidos: 234\n`;
      content += `Pendientes: 12\n`;
      content += `En Proceso: 8\n`;
      content += `Enviados: 15\n`;
      content += `Entregados: 199\n`;
    } else if (report.type === 'financial') {
      content += `Ingresos Totales: $2,500,000 CLP\n`;
      content += `Gastos Operativos: $850,000 CLP\n`;
      content += `Utilidad Bruta: $1,650,000 CLP\n`;
      content += `Margen: 66%\n`;
    } else {
      content += `Tasa de Conversión: 3.5%\n`;
      content += `Tiempo Promedio en Sitio: 4:32 min\n`;
      content += `Páginas por Sesión: 5.2\n`;
      content += `Satisfacción del Cliente: 4.7/5\n`;
    }
    
    content += `\n═══════════════════════════════════════════\n`;
    content += `  Generado por Flores Victoria Admin v2.0\n`;
    content += `═══════════════════════════════════════════\n`;
    
    return content;
  },
  
  // Ver reporte
  viewReport(id) {
    const report = this.reports.find(r => r.id === id);
    if (!report) return;
    
    const content = this.generateTextContent(report);
    
    window.Modal.show({
      title: `<i class="fas fa-file-alt"></i> ${report.name}`,
      content: `<pre style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius); font-size: 0.85rem; overflow: auto; max-height: 400px; white-space: pre-wrap;">${content}</pre>`,
      size: 'lg',
      buttons: [
        { text: 'Cerrar', variant: 'secondary', action: 'close' },
        { text: 'Descargar', variant: 'primary', action: 'download' }
      ]
    }).then(action => {
      if (action === 'download') {
        this.downloadReport(id);
      }
    });
  },
  
  // Eliminar reporte
  async deleteReport(id) {
    const report = this.reports.find(r => r.id === id);
    if (!report) return;
    
    const confirmed = await window.Modal.confirm(
      `¿Eliminar el reporte "${report.name}"?`,
      { title: 'Eliminar Reporte', confirmText: 'Eliminar', dangerous: true }
    );
    
    if (confirmed) {
      this.reports = this.reports.filter(r => r.id !== id);
      this.saveReports();
      this.updateRecentReportsTable();
      window.Toast.success('Reporte eliminado');
    }
  }
};

// ==================== INVENTORY PAGE ====================

const InventoryPage = {
  items: [],

  async render(container) {
    container.innerHTML = `
      <div class="page-header animate-fade-in">
        <div>
          <h2>Control de Inventario</h2>
          <p class="text-muted">Gestiona el stock y movimientos</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline" id="add-movement-btn" data-permission="inventory:edit">
            <i class="fas fa-exchange-alt"></i>
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      <!-- Inventory Stats -->
      <div class="stats-row animate-fade-in-up">
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--info-light); color: var(--info);">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" id="total-items">156</span>
            <span class="stat-label">Total Productos</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--warning-light); color: var(--warning);">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" id="low-stock">12</span>
            <span class="stat-label">Stock Bajo</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--danger-light); color: var(--danger);">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" id="out-of-stock">3</span>
            <span class="stat-label">Agotados</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--success-light); color: var(--success);">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" id="inventory-value">$85,000</span>
            <span class="stat-label">Valor Total</span>
          </div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="card animate-fade-in-up stagger-2">
        <div class="card-header">
          <h3><i class="fas fa-warehouse"></i> Stock Actual</h3>
          <div class="card-actions">
            <select id="stock-filter" class="form-select">
              <option value="all">Todos</option>
              <option value="low">Stock bajo</option>
              <option value="out">Agotados</option>
              <option value="ok">Normal</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                  <th>Último Mov.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="inventory-tbody">
                ${this.renderMockInventory()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    window.RBAC.applyPermissions();
  },

  renderMockInventory() {
    const items = [
      { id: 1, name: 'Ramo de Rosas Rojas', sku: 'RRR-001', stock: 15, minStock: 10, lastMove: '2026-01-05' },
      { id: 2, name: 'Arreglo Primaveral', sku: 'APR-001', stock: 8, minStock: 5, lastMove: '2026-01-04' },
      { id: 3, name: 'Orquídea Elegante', sku: 'OEL-001', stock: 3, minStock: 5, lastMove: '2026-01-03' },
      { id: 4, name: 'Tulipanes Holandeses', sku: 'THO-001', stock: 20, minStock: 8, lastMove: '2026-01-06' },
      { id: 5, name: 'Centro de Mesa Romántico', sku: 'CMR-001', stock: 0, minStock: 3, lastMove: '2025-12-28' },
      { id: 6, name: 'Girasoles Alegres', sku: 'GAL-001', stock: 12, minStock: 6, lastMove: '2026-01-05' },
    ];

    return items.map(item => {
      const status = item.stock === 0 ? 'out' : item.stock <= item.minStock ? 'low' : 'ok';
      const statusConfig = {
        out: { label: 'Agotado', class: 'danger' },
        low: { label: 'Bajo', class: 'warning' },
        ok: { label: 'Normal', class: 'success' }
      };

      return `
        <tr data-id="${item.id}">
          <td><strong>${item.name}</strong></td>
          <td><code>${item.sku}</code></td>
          <td><strong class="${status === 'out' ? 'text-danger' : status === 'low' ? 'text-warning' : ''}">${item.stock}</strong></td>
          <td>${item.minStock}</td>
          <td><span class="badge badge-${statusConfig[status].class}">${statusConfig[status].label}</span></td>
          <td>${window.Format.relative(item.lastMove)}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-sm btn-ghost" onclick="InventoryPage.addStock(${item.id})" title="Agregar stock" data-permission="inventory:edit">
                <i class="fas fa-plus"></i>
              </button>
              <button class="btn btn-sm btn-ghost" onclick="InventoryPage.removeStock(${item.id})" title="Restar stock" data-permission="inventory:edit">
                <i class="fas fa-minus"></i>
              </button>
              <button class="btn btn-sm btn-ghost" onclick="InventoryPage.viewHistory(${item.id})" title="Ver historial">
                <i class="fas fa-history"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  setupEventListeners() {
    document.getElementById('stock-filter')?.addEventListener('change', () => this.filterInventory());
    document.getElementById('add-movement-btn')?.addEventListener('click', () => this.showMovementModal());
  },

  filterInventory() {
    // Filter implementation
    window.Toast.info('Filtrando inventario...');
  },

  async addStock(id) {
    const result = await window.Modal.prompt('¿Cuántas unidades agregar?', { inputType: 'number', defaultValue: '1' });
    if (result) {
      window.Toast.success(`Se agregaron ${result} unidades`);
    }
  },

  async removeStock(id) {
    const result = await window.Modal.prompt('¿Cuántas unidades restar?', { inputType: 'number', defaultValue: '1' });
    if (result) {
      window.Toast.success(`Se restaron ${result} unidades`);
    }
  },

  viewHistory(id) {
    window.Toast.info('Cargando historial de movimientos...');
  },

  showMovementModal() {
    window.Toast.info('Abriendo formulario de movimiento...');
  }
};

// ==================== SETTINGS PAGE ====================

const SettingsPage = {
  async render(container) {
    container.innerHTML = `
      <div class="page-header animate-fade-in">
        <div>
          <h2>Configuración</h2>
          <p class="text-muted">Ajustes del sistema y preferencias</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- General Settings -->
        <div class="card animate-fade-in-up">
          <div class="card-header">
            <h3><i class="fas fa-store"></i> Información del Negocio</h3>
          </div>
          <div class="card-body">
            <form class="settings-form">
              <div class="form-group">
                <label class="form-label">Nombre del negocio</label>
                <input type="text" class="form-input" value="Flores Victoria">
              </div>
              <div class="form-group">
                <label class="form-label">Email de contacto</label>
                <input type="email" class="form-input" value="contacto@floresvictoria.com">
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" class="form-input" value="+52 555 123 4567">
              </div>
              <div class="form-group">
                <label class="form-label">Dirección</label>
                <textarea class="form-textarea" rows="2">Av. Flores 123, Col. Centro, CDMX</textarea>
              </div>
              <button type="button" class="btn btn-primary" onclick="window.Toast.success('Cambios guardados')">
                <i class="fas fa-save"></i> Guardar Cambios
              </button>
            </form>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="card animate-fade-in-up stagger-1">
          <div class="card-header">
            <h3><i class="fas fa-bell"></i> Notificaciones</h3>
          </div>
          <div class="card-body">
            <div class="settings-list">
              <label class="settings-item">
                <div class="settings-item-info">
                  <span class="settings-item-title">Nuevos pedidos</span>
                  <span class="settings-item-desc">Recibir notificaciones de nuevos pedidos</span>
                </div>
                <input type="checkbox" class="toggle" checked>
              </label>
              <label class="settings-item">
                <div class="settings-item-info">
                  <span class="settings-item-title">Stock bajo</span>
                  <span class="settings-item-desc">Alertas cuando un producto tenga stock bajo</span>
                </div>
                <input type="checkbox" class="toggle" checked>
              </label>
              <label class="settings-item">
                <div class="settings-item-info">
                  <span class="settings-item-title">Reseñas nuevas</span>
                  <span class="settings-item-desc">Notificar cuando clientes dejen reseñas</span>
                </div>
                <input type="checkbox" class="toggle">
              </label>
              <label class="settings-item">
                <div class="settings-item-info">
                  <span class="settings-item-title">Resumen diario</span>
                  <span class="settings-item-desc">Recibir resumen de actividad diaria por email</span>
                </div>
                <input type="checkbox" class="toggle" checked>
              </label>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="card animate-fade-in-up stagger-2">
          <div class="card-header">
            <h3><i class="fas fa-shield-alt"></i> Seguridad</h3>
          </div>
          <div class="card-body">
            <div class="settings-list">
              <div class="settings-item">
                <div class="settings-item-info">
                  <span class="settings-item-title">Cambiar contraseña</span>
                  <span class="settings-item-desc">Última actualización: hace 30 días</span>
                </div>
                <button class="btn btn-outline btn-sm" onclick="window.Toast.info('Abriendo cambio de contraseña...')">
                  Cambiar
                </button>
              </div>
              <label class="settings-item">
                <div class="settings-item-info">
                  <span class="settings-item-title">Autenticación 2FA</span>
                  <span class="settings-item-desc">Añade una capa extra de seguridad</span>
                </div>
                <input type="checkbox" class="toggle">
              </label>
              <div class="settings-item">
                <div class="settings-item-info">
                  <span class="settings-item-title">Sesiones activas</span>
                  <span class="settings-item-desc">2 dispositivos conectados</span>
                </div>
                <button class="btn btn-outline btn-sm" onclick="window.Toast.info('Mostrando sesiones...')">
                  Ver
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div class="card animate-fade-in-up stagger-3">
          <div class="card-header">
            <h3><i class="fas fa-palette"></i> Apariencia</h3>
          </div>
          <div class="card-body">
            <div class="settings-list">
              <div class="settings-item">
                <div class="settings-item-info">
                  <span class="settings-item-title">Tema</span>
                  <span class="settings-item-desc">Selecciona el modo de color</span>
                </div>
                <div class="theme-toggle-settings">
                  <button data-theme-toggle="light" class="active">
                    <i class="fas fa-sun"></i> Claro
                  </button>
                  <button data-theme-toggle="dark">
                    <i class="fas fa-moon"></i> Oscuro
                  </button>
                </div>
              </div>
              <label class="settings-item">
                <div class="settings-item-info">
                  <span class="settings-item-title">Sidebar compacto</span>
                  <span class="settings-item-desc">Reducir ancho del menú lateral</span>
                </div>
                <input type="checkbox" class="toggle" id="compact-sidebar">
              </label>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    window.RBAC.applyPermissions();
  },

  setupEventListeners() {
    // Compact sidebar toggle
    document.getElementById('compact-sidebar')?.addEventListener('change', (e) => {
      document.getElementById('sidebar')?.classList.toggle('collapsed', e.target.checked);
    });

    // Theme toggle in settings
    document.querySelectorAll('.theme-toggle-settings button').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.themeToggle;
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('fv_admin_theme', theme);
        document.querySelectorAll('.theme-toggle-settings button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.Toast.success(`Tema ${theme === 'light' ? 'claro' : 'oscuro'} activado`);
      });
    });

    // Set active theme button
    const currentTheme = document.documentElement.dataset.theme || 'light';
    document.querySelector(`.theme-toggle-settings [data-theme-toggle="${currentTheme}"]`)?.classList.add('active');
  }
};

// ==================== MAKE PAGES GLOBAL ====================
window.ProductsPage = ProductsPage;
window.OrdersPage = OrdersPage;
window.UsersPage = UsersPage;
window.AnalyticsPage = AnalyticsPage;
window.ReportsPage = ReportsPage;
window.InventoryPage = InventoryPage;
window.SettingsPage = SettingsPage;
