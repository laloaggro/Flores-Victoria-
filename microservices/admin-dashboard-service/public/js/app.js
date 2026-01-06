/**
 * Flores Victoria - Main Application
 * Dashboard initialization and page routing
 * Version: 2.0.0
 */

class AdminApp {
  constructor() {
    this.currentPage = 'dashboard';
    this.initialized = false;
    this.charts = {};
  }

  /**
   * Initialize application
   */
  async init() {
    console.log('🌸 Flores Victoria Admin Dashboard v2.0.0');

    // Check authentication
    const isAuth = await this.checkAuth();

    if (isAuth) {
      await this.initializeApp();
    } else {
      this.showLogin();
    }

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth() {
    if (!window.Auth.isAuthenticated()) {
      return false;
    }

    try {
      const isValid = await window.Auth.verifyToken();
      return isValid;
    } catch {
      return false;
    }
  }

  /**
   * Initialize authenticated app
   */
  async initializeApp() {
    const user = window.Auth.getUser();
    
    if (!user) {
      this.showLogin();
      return;
    }

    // Initialize RBAC
    window.RBAC.init(user);

    // Update UI with user info
    this.updateUserInfo(user);

    // Show app, hide login
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');

    // Load initial data
    await this.loadDashboardData();

    // Handle initial route
    this.handleRoute();

    this.initialized = true;
    console.log('✅ App initialized for:', user.name);
  }

  /**
   * Show login view
   */
  showLogin() {
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('hidden');
  }

  /**
   * Update user info in sidebar
   */
  updateUserInfo(user) {
    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    
    if (avatarEl) {
      avatarEl.textContent = user.name?.charAt(0).toUpperCase() || 'U';
    }
    
    if (nameEl) {
      nameEl.textContent = user.name || 'Usuario';
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Login form
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Toggle password visibility
    document.getElementById('toggle-password')?.addEventListener('click', () => {
      const input = document.getElementById('login-password');
      const icon = document.querySelector('#toggle-password i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });

    // Demo user buttons (for testing)
    document.querySelectorAll('.demo-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.user;
        document.getElementById('login-username').value = username;
        document.getElementById('login-password').value = 'demo123';
        // Visual feedback
        btn.style.background = 'var(--primary-light)';
        setTimeout(() => btn.style.background = '', 300);
      });
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleLogout();
    });

    // Sidebar toggle
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
    });

    // Mobile menu
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.add('mobile-open');
      document.getElementById('sidebar-overlay').classList.add('active');
    });

    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('mobile-open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const module = item.dataset.module;
        if (module) {
          this.navigateTo(module);
        }
      });
    });

    // Hash change for routing
    window.addEventListener('hashchange', () => this.handleRoute());

    // Refresh services
    document.getElementById('refresh-services')?.addEventListener('click', () => {
      this.loadServicesStatus();
    });

    // Global search
    document.getElementById('global-search')?.addEventListener('input', 
      this.debounce((e) => this.handleSearch(e.target.value), 300)
    );
  }

  /**
   * Handle login
   */
  async handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const submitBtn = document.querySelector('#login-form button[type="submit"]');

    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';

    try {
      await window.Auth.login(username, password);
      await this.initializeApp();
      window.Toast.success('¡Bienvenido de vuelta!');
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    }
  }

  /**
   * Handle logout
   */
  async handleLogout() {
    const confirmed = await window.Modal.confirm(
      '¿Estás seguro que deseas cerrar sesión?',
      { title: 'Cerrar Sesión', confirmText: 'Sí, cerrar sesión' }
    );

    if (confirmed) {
      await window.Auth.logout();
    }
  }

  /**
   * Navigate to module
   */
  navigateTo(module) {
    window.location.hash = module;
  }

  /**
   * Handle route changes
   */
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const module = hash.split('/')[0];

    // Check permission
    if (!window.RBAC.canAccessModule(module) && module !== 'dashboard') {
      window.Toast.error('No tienes permisos para acceder a esta sección');
      window.location.hash = 'dashboard';
      return;
    }

    this.showPage(module);
  }

  /**
   * Show page
   */
  showPage(module) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.module === module);
    });

    // Update page title
    const titles = {
      dashboard: 'Dashboard',
      orders: 'Pedidos',
      products: 'Productos',
      inventory: 'Inventario',
      users: 'Usuarios',
      customers: 'Clientes',
      reports: 'Reportes',
      analytics: 'Analytics',
      monitoring: 'Monitoreo',
      settings: 'Configuración'
    };

    document.getElementById('page-title').textContent = titles[module] || 'Dashboard';

    // Show page module
    document.querySelectorAll('.page-module').forEach(page => {
      page.classList.toggle('active', page.id === `${module}-page`);
    });

    // Close mobile menu
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebar-overlay').classList.remove('active');

    this.currentPage = module;

    // Load page content if needed
    this.loadPageContent(module);
  }

  /**
   * Load page content
   */
  async loadPageContent(module) {
    const pageEl = document.getElementById(`${module}-page`);
    
    if (!pageEl) return;
    
    // Reset loaded state if switching pages
    if (pageEl.dataset.loaded === 'true' && module !== 'dashboard') {
      return; // Already loaded
    }

    switch (module) {
      case 'products':
        if (window.ProductsPage) {
          await window.ProductsPage.render(pageEl);
          pageEl.dataset.loaded = 'true';
        }
        break;
      case 'orders':
        if (window.OrdersPage) {
          await window.OrdersPage.render(pageEl);
          pageEl.dataset.loaded = 'true';
        }
        break;
      case 'users':
        if (window.UsersPage) {
          await window.UsersPage.render(pageEl);
          pageEl.dataset.loaded = 'true';
        }
        break;
      case 'analytics':
        if (window.AnalyticsPage) {
          await window.AnalyticsPage.render(pageEl);
          pageEl.dataset.loaded = 'true';
        }
        break;
      case 'reports':
        if (window.ReportsPage) {
          await window.ReportsPage.render(pageEl);
          pageEl.dataset.loaded = 'true';
        }
        break;
      case 'inventory':
        if (window.InventoryPage) {
          await window.InventoryPage.render(pageEl);
          pageEl.dataset.loaded = 'true';
        }
        break;
      case 'settings':
        if (window.SettingsPage) {
          await window.SettingsPage.render(pageEl);
          pageEl.dataset.loaded = 'true';
        }
        break;
      case 'monitoring':
        await this.loadMonitoringPage(pageEl);
        pageEl.dataset.loaded = 'true';
        break;
      default:
        // Show placeholder for unimplemented pages
        if (!pageEl.dataset.loaded) {
          pageEl.innerHTML = `
            <div class="empty-state" style="padding: 80px 20px;">
              <i class="fas fa-tools" style="font-size: 64px; color: var(--text-muted); margin-bottom: 20px;"></i>
              <h3>Página en desarrollo</h3>
              <p class="text-muted">Esta sección estará disponible próximamente.</p>
            </div>
          `;
          pageEl.dataset.loaded = 'true';
        }
    }
  }

  /**
   * Load dashboard data
   */
  async loadDashboardData() {
    try {
      // Load stats
      const stats = await window.API.getStats();
      this.updateStats(stats);

      // Load recent activity
      this.loadRecentActivity();

      // Load recent orders
      this.loadRecentOrders();

      // Load services status (for admins)
      if (window.RBAC.hasPermission('monitoring:view')) {
        await this.loadServicesStatus();
      }

      // Initialize charts
      this.initCharts();
    } catch (error) {
      console.error('Error loading dashboard:', error);
      window.Toast.error('Error cargando datos del dashboard');
    }
  }

  /**
   * Update stats cards
   */
  updateStats(stats) {
    const data = stats?.data || stats || {};
    
    document.getElementById('stat-orders').textContent = data.ordersToday || 24;
    document.getElementById('stat-revenue').textContent = window.Format.currency(data.revenueToday || 45600);
    document.getElementById('stat-products').textContent = data.activeProducts || 156;
    document.getElementById('stat-customers').textContent = data.newCustomers || 18;
  }

  /**
   * Load recent activity
   */
  loadRecentActivity() {
    const activities = [
      { type: 'order', title: 'Nuevo pedido #1234', time: 'Hace 5 min', icon: 'order' },
      { type: 'user', title: 'Cliente registrado', time: 'Hace 15 min', icon: 'user' },
      { type: 'product', title: 'Stock actualizado', time: 'Hace 30 min', icon: 'product' },
      { type: 'order', title: 'Pedido #1233 enviado', time: 'Hace 1 hora', icon: 'order' },
      { type: 'alert', title: 'Stock bajo: Rosas Rojas', time: 'Hace 2 horas', icon: 'alert' }
    ];

    const container = document.getElementById('activity-list');
    if (!container) return;

    container.innerHTML = activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon ${a.icon}">
          <i class="fas ${this.getActivityIcon(a.type)}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${a.title}</div>
          <div class="activity-time">${a.time}</div>
        </div>
      </div>
    `).join('');
  }

  getActivityIcon(type) {
    const icons = {
      order: 'fa-shopping-cart',
      user: 'fa-user',
      product: 'fa-box',
      alert: 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-info-circle';
  }

  /**
   * Load recent orders
   */
  loadRecentOrders() {
    const orders = [
      { id: '1234', customer: 'María García', items: 'Ramo de Rosas (2)', total: 890, status: 'pending', date: '2026-01-06' },
      { id: '1233', customer: 'Juan Pérez', items: 'Arreglo Especial', total: 1250, status: 'shipped', date: '2026-01-06' },
      { id: '1232', customer: 'Ana López', items: 'Bouquet Mixto', total: 650, status: 'delivered', date: '2026-01-05' },
      { id: '1231', customer: 'Carlos Ruiz', items: 'Centro de Mesa', total: 1800, status: 'processing', date: '2026-01-05' }
    ];

    const statusMap = {
      pending: { label: 'Pendiente', class: 'badge-warning' },
      processing: { label: 'Procesando', class: 'badge-info' },
      shipped: { label: 'Enviado', class: 'badge-primary' },
      delivered: { label: 'Entregado', class: 'badge-success' },
      cancelled: { label: 'Cancelado', class: 'badge-danger' }
    };

    const container = document.getElementById('recent-orders-table');
    if (!container) return;

    container.innerHTML = orders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${o.customer}</td>
        <td>${o.items}</td>
        <td>${window.Format.currency(o.total)}</td>
        <td><span class="badge ${statusMap[o.status].class}">${statusMap[o.status].label}</span></td>
        <td>${window.Format.date(o.date)}</td>
        <td>
          <button class="btn btn-ghost btn-sm" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Load services status
   */
  async loadServicesStatus() {
    const container = document.getElementById('services-grid');
    if (!container) return;

    try {
      const data = await window.API.getDashboard();
      const services = data.services || [];

      container.innerHTML = services.map(s => `
        <div class="stat-card" style="cursor: pointer;" onclick="window.location.hash='monitoring'">
          <div class="stat-icon ${s.status === 'healthy' ? 'success' : s.status === 'degraded' ? 'warning' : 'danger'}">
            <i class="fas ${s.status === 'healthy' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">${s.name}</div>
            <div class="stat-change ${s.status === 'healthy' ? 'positive' : ''}">
              ${s.status === 'healthy' ? 'Operativo' : s.status === 'degraded' ? 'Degradado' : 'Caído'}
              ${s.responseTime ? ` • ${s.responseTime}ms` : ''}
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 24px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 8px;"></i>
          <p>Error cargando servicios</p>
        </div>
      `;
    }
  }

  /**
   * Initialize charts
   */
  initCharts() {
    const ctx = document.getElementById('sales-chart')?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.charts.sales) {
      this.charts.sales.destroy();
    }

    const isDark = document.documentElement.dataset.theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    this.charts.sales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Ventas',
          data: [12500, 19200, 15800, 24500, 18300, 32100, 28700],
          borderColor: '#C2185B',
          backgroundColor: 'rgba(194, 24, 91, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => window.Format.currency(context.raw)
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (value) => window.Format.currency(value)
            }
          }
        }
      }
    });
  }

  /**
   * Load monitoring page
   */
  async loadMonitoringPage(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Estado de Microservicios</h3>
          <button class="btn btn-primary btn-sm" onclick="App.loadServicesHealth()">
            <i class="fas fa-sync-alt"></i>
            Actualizar
          </button>
        </div>
        <div class="card-body" id="monitoring-services">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando servicios...</span>
          </div>
        </div>
      </div>
    `;

    await this.loadServicesHealth();
  }

  async loadServicesHealth() {
    const container = document.getElementById('monitoring-services');
    if (!container) return;

    try {
      const data = await window.API.getDashboard();
      const services = data.services || [];

      container.innerHTML = `
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
          ${services.map(s => `
            <div class="stat-card">
              <div class="stat-icon ${s.status === 'healthy' ? 'success' : s.status === 'degraded' ? 'warning' : 'danger'}">
                <i class="fas ${s.status === 'healthy' ? 'fa-check-circle' : s.status === 'degraded' ? 'fa-exclamation-circle' : 'fa-times-circle'}"></i>
              </div>
              <div class="stat-content" style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong>${s.name}</strong>
                  <span class="badge ${s.status === 'healthy' ? 'badge-success' : s.status === 'degraded' ? 'badge-warning' : 'badge-danger'}">
                    ${s.status}
                  </span>
                </div>
                <div class="text-muted" style="font-size: 0.8rem; margin-top: 4px;">
                  ${s.url || 'No URL'}
                </div>
                ${s.responseTime ? `<div style="font-size: 0.75rem; margin-top: 4px;">Respuesta: ${s.responseTime}ms</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 16px;"></i>
          <p>Error cargando estado de servicios</p>
          <button class="btn btn-primary mt-md" onclick="App.loadServicesHealth()">Reintentar</button>
        </div>
      `;
    }
  }

  /**
   * Handle global search
   */
  async handleSearch(query) {
    const searchInput = document.getElementById('global-search');
    const searchBar = searchInput?.closest('.search-bar');
    
    // Remove existing dropdown
    const existingDropdown = document.querySelector('.search-results-dropdown');
    if (existingDropdown) existingDropdown.remove();
    
    if (!query || query.length < 2) return;
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'search-results-dropdown';
    dropdown.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Buscando...</div>';
    searchBar?.appendChild(dropdown);
    
    try {
      // Search in different categories
      const results = await this.performSearch(query);
      
      if (results.length === 0) {
        dropdown.innerHTML = `
          <div class="search-empty">
            <i class="fas fa-search"></i>
            <p>No se encontraron resultados para "${query}"</p>
          </div>
        `;
        return;
      }
      
      dropdown.innerHTML = results.map(section => `
        <div class="search-section">
          <div class="search-section-title">
            <i class="fas fa-${section.icon}"></i>
            ${section.title}
          </div>
          ${section.items.map(item => `
            <a href="#${section.type}/${item.id}" class="search-result-item" onclick="App.onSearchResultClick('${section.type}', '${item.id}')">
              <span class="search-result-name">${this.highlightMatch(item.name, query)}</span>
              <span class="search-result-meta">${item.meta || ''}</span>
            </a>
          `).join('')}
        </div>
      `).join('');
      
    } catch (error) {
      console.error('Search error:', error);
      dropdown.innerHTML = `<div class="search-error">Error al buscar</div>`;
    }
    
    // Close dropdown on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!searchBar?.contains(e.target)) {
          dropdown.remove();
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 100);
  }
  
  async performSearch(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    // Search Products (from mock data or API)
    if (window.ProductsPage?.products?.length) {
      const products = window.ProductsPage.products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      
      if (products.length) {
        results.push({
          type: 'products',
          title: 'Productos',
          icon: 'box',
          items: products.map(p => ({
            id: p.id,
            name: p.name,
            meta: window.Format.currency(p.price)
          }))
        });
      }
    }
    
    // Search Orders
    if (window.OrdersPage?.orders?.length) {
      const orders = window.OrdersPage.orders.filter(o => 
        o.id.toLowerCase().includes(lowerQuery) ||
        o.customer?.name?.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      
      if (orders.length) {
        results.push({
          type: 'orders',
          title: 'Pedidos',
          icon: 'shopping-cart',
          items: orders.map(o => ({
            id: o.id,
            name: o.id,
            meta: o.customer?.name || ''
          }))
        });
      }
    }
    
    // Search Users
    if (window.UsersPage?.users?.length) {
      const users = window.UsersPage.users.filter(u => 
        u.name.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      
      if (users.length) {
        results.push({
          type: 'users',
          title: 'Usuarios',
          icon: 'users',
          items: users.map(u => ({
            id: u.id,
            name: u.name,
            meta: u.role
          }))
        });
      }
    }
    
    return results;
  }
  
  highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  onSearchResultClick(type, id) {
    document.querySelector('.search-results-dropdown')?.remove();
    document.getElementById('global-search').value = '';
    
    // Navigate to the item
    window.location.hash = type;
    
    // Highlight item after page loads
    setTimeout(() => {
      const row = document.querySelector(`[data-id="${id}"]`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('highlight');
        setTimeout(() => row.classList.remove('highlight'), 2000);
      }
    }, 300);
  }

  /**
   * Debounce utility
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Placeholder page loaders
  async loadOrdersPage(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Gestión de Pedidos</h3>
          <button class="btn btn-primary" data-permission="orders:create">
            <i class="fas fa-plus"></i> Nuevo Pedido
          </button>
        </div>
        <div class="card-body">
          <p class="text-muted">Módulo de pedidos en desarrollo...</p>
        </div>
      </div>
    `;
  }

  async loadProductsPage(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Catálogo de Productos</h3>
          <button class="btn btn-primary" data-permission="products:create">
            <i class="fas fa-plus"></i> Nuevo Producto
          </button>
        </div>
        <div class="card-body">
          <p class="text-muted">Módulo de productos en desarrollo...</p>
        </div>
      </div>
    `;
  }
}

// CSS for page modules
const appStyles = document.createElement('style');
appStyles.textContent = `
  .page-module {
    display: none;
  }
  
  .page-module.active {
    display: block;
  }
`;
document.head.appendChild(appStyles);

// Initialize app
const App = new AdminApp();
document.addEventListener('DOMContentLoaded', () => App.init());

// Expose to window for debugging
window.App = App;
