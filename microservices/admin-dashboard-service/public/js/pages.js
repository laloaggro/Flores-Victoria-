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
            <option value="ramos">Ramos</option>
            <option value="arreglos">Arreglos</option>
            <option value="plantas">Plantas</option>
            <option value="accesorios">Accesorios</option>
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
      
      if (response?.products) {
        this.products = response.products;
        this.pagination.total = response.total || response.products.length;
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

    this.renderProducts();
  },

  getMockProducts() {
    return [
      { id: '1', name: 'Ramo de Rosas Rojas', price: 850, category: 'ramos', stock: 15, status: 'active', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300' },
      { id: '2', name: 'Arreglo Primaveral', price: 1200, category: 'arreglos', stock: 8, status: 'active', image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=300' },
      { id: '3', name: 'Orquídea Elegante', price: 950, category: 'plantas', stock: 5, status: 'active', image: 'https://images.unsplash.com/photo-1566873535350-a3f5c6a3d5de?w=300' },
      { id: '4', name: 'Tulipanes Holandeses', price: 750, category: 'ramos', stock: 20, status: 'active', image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=300' },
      { id: '5', name: 'Centro de Mesa Romántico', price: 1500, category: 'arreglos', stock: 3, status: 'low_stock', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=300' },
      { id: '6', name: 'Girasoles Alegres', price: 650, category: 'ramos', stock: 12, status: 'active', image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=300' },
      { id: '7', name: 'Suculentas Decorativas', price: 450, category: 'plantas', stock: 25, status: 'active', image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=300' },
      { id: '8', name: 'Caja de Flores Premium', price: 2000, category: 'arreglos', stock: 0, status: 'inactive', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300' },
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
          <img src="${product.image || '/assets/placeholder-product.png'}" alt="${product.name}" loading="lazy">
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
    const categories = ['ramos', 'arreglos', 'plantas', 'accesorios'];

    const content = `
      <form id="product-form" class="form-grid">
        <div class="form-group full-width">
          <label class="form-label">Nombre del producto *</label>
          <input type="text" name="name" class="form-input" value="${product?.name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Categoría *</label>
          <select name="category" class="form-select" required>
            ${categories.map(cat => `<option value="${cat}" ${product?.category === cat ? 'selected' : ''}>${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Precio (MXN) *</label>
          <input type="number" name="price" class="form-input" value="${product?.price || ''}" min="0" step="0.01" required>
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
      title: isEdit ? 'Editar Producto' : 'Nuevo Producto',
      content,
      size: 'lg',
      buttons: [
        { text: 'Cancelar', variant: 'secondary', action: 'close' },
        { text: isEdit ? 'Guardar Cambios' : 'Crear Producto', variant: 'primary', action: 'confirm' }
      ]
    });

    if (result === 'confirm') {
      const form = document.getElementById('product-form');
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      try {
        if (isEdit) {
          await window.API.put(`/products/${product.id}`, data);
          window.Toast.success('Producto actualizado');
        } else {
          await window.API.post('/products', data);
          window.Toast.success('Producto creado');
        }
        await this.loadProducts();
      } catch (error) {
        window.Toast.error(error.message || 'Error al guardar producto');
      }
    }
  },

  viewProduct(id) {
    const product = this.products.find(p => p.id === id);
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
    const product = this.products.find(p => p.id === id);
    if (product) this.showProductModal(product);
  },

  async deleteProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    const confirmed = await window.Modal.confirm(
      `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      { title: 'Eliminar Producto', confirmText: 'Sí, eliminar', danger: true }
    );

    if (confirmed) {
      try {
        await window.API.delete(`/products/${id}`);
        window.Toast.success('Producto eliminado');
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
      if (response?.orders) {
        this.orders = response.orders;
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
      if (response?.users) {
        this.users = response.users;
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
        } else {
          await window.API.post('/users', data);
        }
        window.Toast.success(isEdit ? 'Usuario actualizado' : 'Usuario creado');
        await this.loadUsers();
      } catch (error) {
        // Mock update
        if (isEdit) {
          Object.assign(user, data);
        } else {
          this.users.push({ id: Date.now(), ...data, lastLogin: null });
        }
        this.renderUsers();
        window.Toast.success(isEdit ? 'Usuario actualizado' : 'Usuario creado');
      }
    }
  },

  editUser(id) {
    const user = this.users.find(u => u.id === id);
    if (user) this.showUserModal(user);
  },

  async toggleStatus(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    const action = user.active ? 'desactivar' : 'activar';
    const confirmed = await window.Modal.confirm(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} a "${user.name}"?`,
      { title: `${action.charAt(0).toUpperCase() + action.slice(1)} Usuario` }
    );

    if (confirmed) {
      user.active = !user.active;
      this.renderUsers();
      window.Toast.success(`Usuario ${user.active ? 'activado' : 'desactivado'}`);
    }
  },

  async deleteUser(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    const confirmed = await window.Modal.confirm(
      `¿Eliminar a "${user.name}"? Esta acción no se puede deshacer.`,
      { title: 'Eliminar Usuario', confirmText: 'Sí, eliminar', danger: true }
    );

    if (confirmed) {
      this.users = this.users.filter(u => u.id !== id);
      this.renderUsers();
      window.Toast.success('Usuario eliminado');
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

// ==================== MAKE PAGES GLOBAL ====================
window.ProductsPage = ProductsPage;
window.OrdersPage = OrdersPage;
window.UsersPage = UsersPage;
window.AnalyticsPage = AnalyticsPage;
