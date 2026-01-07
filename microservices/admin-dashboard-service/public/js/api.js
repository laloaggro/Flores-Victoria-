/**
 * Flores Victoria - API Client Module
 * Centralized API communication with mock fallback
 * Version: 2.1.0
 */

class ApiClient {
  constructor() {
    // Detect environment and set API base URL
    const isProduction = window.location.hostname.includes('railway.app');
    this.baseUrl = isProduction 
      ? 'https://api-gateway-production-b02f.up.railway.app/api'
      : '/api';
    this.localUrl = '/api'; // For local admin-dashboard endpoints
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.useMockFallback = true; // Enable mock data when API fails
    
    console.log('🔗 API Client initialized:', { isProduction, baseUrl: this.baseUrl, mockFallback: this.useMockFallback });
  }

  /**
   * Request genérico with mock fallback
   */
  async request(endpoint, options = {}) {
    // Use local URL for dashboard/admin endpoints, external for microservices
    // /stats is served locally by admin-dashboard-service
    const isLocalEndpoint = endpoint.startsWith('/dashboard') || 
                            endpoint.startsWith('/admin') || 
                            endpoint.startsWith('/auth') ||
                            endpoint.startsWith('/stats');
    const base = isLocalEndpoint ? this.localUrl : this.baseUrl;
    const url = `${base}${endpoint}`;
    const token = window.Auth?.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        window.Auth?.clearSession();
        window.location.href = '/?expired=true';
        throw new Error('Sesión expirada');
      }

      // Handle non-OK responses
      if (!response.ok) {
        // Try mock fallback for external API errors (404, 500, etc)
        if (this.useMockFallback && !isLocalEndpoint) {
          const mockData = this.getMockData(endpoint);
          if (mockData) {
            console.warn(`📦 Using mock data for ${endpoint} (HTTP ${response.status})`);
            return mockData;
          }
        }
        
        // Try to get error message from response
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Response wasn't JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Network errors or fetch failures - try mock fallback
      if (this.useMockFallback && !isLocalEndpoint) {
        const mockData = this.getMockData(endpoint);
        if (mockData) {
          console.warn(`📦 Using mock data for ${endpoint} (${error.message})`);
          return mockData;
        }
      }
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Get mock data for an endpoint
   */
  getMockData(endpoint) {
    // Parse endpoint to get base route
    const route = endpoint.split('?')[0];
    
    const mockDatabase = {
      '/stats': {
        success: true,
        data: {
          ordersToday: 24,
          ordersTrend: '+12%',
          revenueToday: 45600,
          revenueTrend: '+8%',
          activeProducts: 156,
          productsTrend: '+3',
          newCustomers: 18,
          customersTrend: '+5%'
        }
      },
      '/stats/sales': {
        success: true,
        data: [
          { date: '2026-01-01', value: 12500 },
          { date: '2026-01-02', value: 18200 },
          { date: '2026-01-03', value: 15800 },
          { date: '2026-01-04', value: 22100 },
          { date: '2026-01-05', value: 19400 },
          { date: '2026-01-06', value: 28500 },
          { date: '2026-01-07', value: 31200 }
        ]
      },
      '/stats/top-products': {
        success: true,
        data: [
          { name: 'Ramo de Rosas Rojas', sales: 156, revenue: 139800 },
          { name: 'Arreglo Primaveral', sales: 98, revenue: 122500 },
          { name: 'Bouquet Mixto', sales: 87, revenue: 56550 },
          { name: 'Orquídea Elegante', sales: 76, revenue: 114000 },
          { name: 'Centro de Mesa', sales: 65, revenue: 97500 }
        ]
      },
      '/stats/by-category': {
        success: true,
        data: [
          { name: 'Ramos', value: 35, color: '#667eea' },
          { name: 'Arreglos', value: 25, color: '#764ba2' },
          { name: 'Bouquets', value: 20, color: '#f093fb' },
          { name: 'Plantas', value: 12, color: '#4facfe' },
          { name: 'Otros', value: 8, color: '#00f2fe' }
        ]
      },
      '/products': {
        success: true,
        data: {
          products: [
            // Productos reales del frontend de Flores Victoria
            { id: '1', name: 'Ramo de Rosas Rojas Premium', category: 'rosas', price: 45000, stock: 15, status: 'active', description: 'Clásico ramo de 12 rosas rojas con follaje fresco. Ideal para amor y romance.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PLT001.webp' },
            { id: '2', name: 'Tulipanes de Primavera', category: 'tulipanes', price: 35000, stock: 20, status: 'active', description: 'Colorido arreglo de 10 tulipanes mixtos importados de Holanda.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PLT002.webp' },
            { id: '3', name: 'Orquídea Phalaenopsis Elegante', category: 'orquideas', price: 75000, stock: 8, status: 'active', description: 'Elegante orquídea en maceta, ideal para regalo corporativo o decoración.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/EXO001.webp' },
            { id: '4', name: 'Girasoles Radiantes', category: 'girasoles', price: 38000, stock: 12, status: 'active', description: 'Arreglo de 8 girasoles con detalles verdes y flores de campo.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PLT003.webp' },
            { id: '5', name: 'Bouquet Deluxe Mixto', category: 'bouquets', price: 52000, stock: 10, status: 'active', description: 'Exquisito bouquet con rosas, lirios y flores de temporada.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/VAR004.webp' },
            { id: '6', name: 'Arreglo Floral Corporativo', category: 'corporativo', price: 68000, stock: 5, status: 'active', description: 'Arreglo elegante diseñado para oficinas y eventos de empresa.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/CRP001.webp' },
            { id: '7', name: 'Ramo de Lirios Blancos', category: 'lirios', price: 42000, stock: 18, status: 'active', description: 'Hermoso ramo de lirios blancos símbolo de pureza y elegancia.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PLT004.webp' },
            { id: '8', name: 'Corona Fúnebre Tradicional', category: 'condolencias', price: 95000, stock: 3, status: 'low_stock', description: 'Elegante corona de condolencias con rosas blancas y lirios.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/SYM001.webp' },
            { id: '9', name: 'Arreglo de Cumpleaños Festivo', category: 'cumpleanos', price: 48000, stock: 22, status: 'active', description: 'Alegre arreglo con flores coloridas y globo de cumpleaños.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/BDY001.webp' },
            { id: '10', name: 'Centro de Mesa Rústico', category: 'bodas', price: 55000, stock: 7, status: 'active', description: 'Arreglo rústico perfecto para bodas campestres.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/AML001.webp' },
            { id: '11', name: 'Rosas Rosadas en Caja', category: 'rosas', price: 58000, stock: 9, status: 'active', description: '12 rosas rosadas premium en elegante caja cuadrada negra.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/AML002.webp' },
            { id: '12', name: 'Arreglo Aniversario de Amor', category: 'aniversarios', price: 65000, stock: 6, status: 'active', description: 'Romántico arreglo con rosas rojas, lirios y detalles dorados.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/AML003.webp' },
            { id: '13', name: 'Alegría Vibrante', category: 'mixtos', price: 44000, stock: 25, status: 'active', description: 'Explosión de colores con flores de temporada vibrantes y alegres.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/VAR010.webp' },
            { id: '14', name: 'Corazón Enamorado Premium', category: 'amor', price: 72000, stock: 4, status: 'low_stock', description: 'Arreglo especial con forma de corazón, perfecto para declaraciones de amor.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/AML004.webp' },
            { id: '15', name: 'Dulce Compañía', category: 'amistad', price: 39000, stock: 30, status: 'active', description: 'Delicado arreglo pastel ideal para consentir a alguien especial.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/THX001.webp' },
            { id: '16', name: 'Dulce Cumpleaños', category: 'cumpleanos', price: 46000, stock: 15, status: 'active', description: 'Festivo arreglo de cumpleaños con flores alegres y detalles divertidos.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/BDY002.webp' },
            { id: '17', name: 'Elegancia Femenina Premium', category: 'bouquets', price: 54000, stock: 8, status: 'active', description: 'Sofisticado bouquet en tonos suaves ideal para celebrar a las mujeres.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PLT005.webp' },
            { id: '18', name: 'Orquídea Elegante Luxury', category: 'orquideas', price: 85000, stock: 3, status: 'low_stock', description: 'Orquídea de lujo en maceta decorativa con acabados elegantes.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/EXO002.webp' },
            { id: '19', name: 'Margaritas Frescas del Campo', category: 'margaritas', price: 32000, stock: 35, status: 'active', description: 'Ramo campestre con margaritas blancas y flores silvestres.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/VAR007.webp' },
            { id: '20', name: 'Hortensias Premium Azules', category: 'hortensias', price: 68000, stock: 5, status: 'active', description: 'Elegantes hortensias en tonos azules y morados, arreglo espectacular.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/VAR008.webp' },
            { id: '21', name: 'Arreglo Victoria Signature', category: 'mixtos', price: 51000, stock: 12, status: 'active', description: 'Combinación perfecta de rosas, lirios y flores de temporada.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/AML005.webp' },
            { id: '22', name: 'Ramo de Graduación Especial', category: 'graduacion', price: 47000, stock: 20, status: 'active', description: 'Arreglo especial para celebrar logros académicos con flores alegres.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/GRD001.webp' },
            { id: '25', name: 'Gerberas Multicolor', category: 'gerberas', price: 36000, stock: 28, status: 'active', description: 'Alegre ramo de gerberas en colores vibrantes, ideal para alegrar el día.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/VAR012.webp' },
            { id: '26', name: 'Claveles Tradicionales', category: 'claveles', price: 28000, stock: 40, status: 'active', description: 'Hermoso arreglo de claveles frescos en tonos rosados y blancos.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/VAR013.webp' },
            { id: '27', name: 'Arreglo de Recuperación', category: 'recuperacion', price: 43000, stock: 10, status: 'active', description: 'Arreglo especial para desear pronta recuperación con flores alegres.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/MIN001.webp' },
            { id: '28', name: 'Te Amo Mamá Especial', category: 'mama', price: 56000, stock: 15, status: 'active', description: 'Arreglo dedicado especialmente para mamá con las flores más hermosas.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/MAM028.webp' },
            { id: '30', name: 'Mini Jardín de Suculentas', category: 'suculentas', price: 34000, stock: 18, status: 'active', description: 'Encantador jardín de suculentas variadas en maceta decorativa.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/SUS001.webp' },
            { id: '60', name: 'Arreglo Premium Signature', category: 'premium', price: 89000, stock: 2, status: 'low_stock', description: 'Nuestro arreglo insignia con las mejores flores de la temporada.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/PRE060.webp' },
            { id: '125', name: 'Mega Ramo 100 Rosas', category: 'lujo', price: 295000, stock: 1, status: 'low_stock', description: 'Espectacular ramo de 100 rosas rojas. El regalo más impresionante.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/ROS125.webp' },
            { id: '170', name: 'Arreglo Presidencial', category: 'lujo', price: 380000, stock: 0, status: 'inactive', description: 'Monumental arreglo de piso con flores premium y follaje exótico.', image: 'https://frontend-v2-production-7508.up.railway.app/images/products/final/LUJ170.webp' }
          ],
          total: 175,
          page: 1,
          limit: 20
        }
      },
      '/orders': {
        success: true,
        data: {
          orders: [
            { id: 'ORD-1234', customer: { name: 'María García', email: 'maria@email.com' }, items: 2, total: 1789, status: 'pending', date: '2026-01-06T10:30:00' },
            { id: 'ORD-1233', customer: { name: 'Juan Pérez', email: 'juan@email.com' }, items: 1, total: 1250, status: 'shipped', date: '2026-01-06T09:15:00' },
            { id: 'ORD-1232', customer: { name: 'Ana López', email: 'ana@email.com' }, items: 3, total: 2650, status: 'delivered', date: '2026-01-05T16:45:00' },
            { id: 'ORD-1231', customer: { name: 'Carlos Ruiz', email: 'carlos@email.com' }, items: 1, total: 1800, status: 'processing', date: '2026-01-05T14:20:00' },
            { id: 'ORD-1230', customer: { name: 'Laura Martínez', email: 'laura@email.com' }, items: 2, total: 1449, status: 'delivered', date: '2026-01-05T11:00:00' }
          ],
          total: 1234,
          page: 1,
          limit: 20
        }
      },
      '/users': {
        success: true,
        data: {
          users: [
            { id: 1, name: 'Super Admin', email: 'superadmin@floresvictoria.com', role: 'superadmin', status: 'active', lastLogin: '2026-01-06T08:00:00' },
            { id: 2, name: 'Admin Principal', email: 'admin@floresvictoria.com', role: 'admin', status: 'active', lastLogin: '2026-01-06T07:30:00' },
            { id: 3, name: 'María Gerente', email: 'manager@floresvictoria.com', role: 'manager', status: 'active', lastLogin: '2026-01-05T18:00:00' },
            { id: 4, name: 'Juan Trabajador', email: 'worker@floresvictoria.com', role: 'worker', status: 'active', lastLogin: '2026-01-06T06:45:00' },
            { id: 5, name: 'Ana Visor', email: 'viewer@floresvictoria.com', role: 'viewer', status: 'inactive', lastLogin: '2026-01-01T10:00:00' }
          ],
          total: 15,
          page: 1,
          limit: 20
        }
      },
      '/dashboard/services': {
        success: true,
        data: [
          { name: 'api-gateway', status: 'healthy', uptime: '99.9%', responseTime: '45ms' },
          { name: 'auth-service', status: 'healthy', uptime: '99.8%', responseTime: '32ms' },
          { name: 'product-service', status: 'healthy', uptime: '99.7%', responseTime: '58ms' },
          { name: 'order-service', status: 'healthy', uptime: '99.5%', responseTime: '67ms' },
          { name: 'user-service', status: 'healthy', uptime: '99.9%', responseTime: '28ms' },
          { name: 'notification-service', status: 'warning', uptime: '98.2%', responseTime: '120ms' }
        ]
      }
    };

    return mockDatabase[route] || null;
  }

  // ==================== LOCAL STORAGE FOR MUTATIONS ====================
  
  getLocalData(collection) {
    const key = `fv_admin_${collection}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  setLocalData(collection, data) {
    const key = `fv_admin_${collection}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Handle mock mutations (create, update, delete) locally
   */
  handleMockMutation(method, endpoint, body = null) {
    const parts = endpoint.split('/').filter(Boolean);
    const collection = parts[0]; // 'products', 'orders', 'users'
    const id = parts[1];

    // Get existing data from local storage or mock
    let data = this.getLocalData(collection);
    if (!data) {
      const mockResponse = this.getMockData(`/${collection}`);
      data = mockResponse?.data?.[collection] || mockResponse?.data || [];
    }

    switch (method) {
      case 'POST': {
        // Create new item
        const newId = Date.now().toString();
        const newItem = { 
          id: newId, 
          ...body, 
          createdAt: new Date().toISOString() 
        };
        data.push(newItem);
        this.setLocalData(collection, data);
        console.log(`✅ Created ${collection} item:`, newItem);
        return { success: true, data: newItem };
      }

      case 'PUT':
      case 'PATCH': {
        // Update existing item
        const index = data.findIndex(item => item.id == id || item.id === id);
        if (index > -1) {
          data[index] = { ...data[index], ...body, updatedAt: new Date().toISOString() };
          this.setLocalData(collection, data);
          console.log(`✅ Updated ${collection} item:`, data[index]);
          return { success: true, data: data[index] };
        }
        return { success: false, message: 'Item not found' };
      }

      case 'DELETE': {
        // Delete item
        const deleteIndex = data.findIndex(item => item.id == id || item.id === id);
        if (deleteIndex > -1) {
          const deleted = data.splice(deleteIndex, 1)[0];
          this.setLocalData(collection, data);
          console.log(`✅ Deleted ${collection} item:`, deleted);
          return { success: true, data: deleted };
        }
        return { success: false, message: 'Item not found' };
      }

      default:
        return { success: false, message: 'Unknown method' };
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    // Check cache
    const cacheKey = endpoint;
    if (options.cache !== false) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    // Check local storage first for modified data
    const parts = endpoint.split('?')[0].split('/').filter(Boolean);
    const collection = parts[0];
    const localData = this.getLocalData(collection);
    
    if (localData && localData.length > 0) {
      console.log(`📦 Using local data for ${collection}`);
      return { success: true, data: { [collection]: localData }, total: localData.length };
    }

    const data = await this.request(endpoint, { method: 'GET', ...options });

    // Store in cache
    if (options.cache !== false) {
      this.setCache(cacheKey, data);
    }

    return data;
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    this.clearCache();
    
    try {
      return await this.request(endpoint, { method: 'POST', body, ...options });
    } catch (error) {
      // If API fails, handle locally
      if (this.useMockFallback) {
        console.warn(`📦 Handling POST locally for ${endpoint}`);
        return this.handleMockMutation('POST', endpoint, body);
      }
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    this.clearCache();
    
    try {
      return await this.request(endpoint, { method: 'PUT', body, ...options });
    } catch (error) {
      if (this.useMockFallback) {
        console.warn(`📦 Handling PUT locally for ${endpoint}`);
        return this.handleMockMutation('PUT', endpoint, body);
      }
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body, options = {}) {
    this.clearCache();
    
    try {
      return await this.request(endpoint, { method: 'PATCH', body, ...options });
    } catch (error) {
      if (this.useMockFallback) {
        console.warn(`📦 Handling PATCH locally for ${endpoint}`);
        return this.handleMockMutation('PATCH', endpoint, body);
      }
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    this.clearCache();
    
    try {
      return await this.request(endpoint, { method: 'DELETE', ...options });
    } catch (error) {
      if (this.useMockFallback) {
        console.warn(`📦 Handling DELETE locally for ${endpoint}`);
        return this.handleMockMutation('DELETE', endpoint);
      }
      throw error;
    }
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.cacheTimeout) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache() {
    this.cache.clear();
  }

  // ==================== API ESPECÍFICAS ====================

  // Dashboard
  async getDashboard() {
    return this.get('/dashboard');
  }

  async getDashboardSummary() {
    return this.get('/dashboard/summary');
  }

  async getServices() {
    return this.get('/dashboard/services');
  }

  async getServiceStatus(serviceName) {
    return this.get(`/dashboard/services/${serviceName}`);
  }

  async runHealthCheck() {
    return this.post('/dashboard/healthcheck');
  }

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/products${query ? '?' + query : ''}`);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(product) {
    return this.post('/products', product);
  }

  async updateProduct(id, product) {
    return this.put(`/products/${id}`, product);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  // Orders
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/orders${query ? '?' + query : ''}`);
  }

  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  async updateOrderStatus(id, status) {
    return this.patch(`/orders/${id}/status`, { status });
  }

  // Users
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/users${query ? '?' + query : ''}`);
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async createUser(user) {
    return this.post('/users', user);
  }

  async updateUser(id, user) {
    return this.put(`/users/${id}`, user);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  // Stats
  async getStats(period = '7d') {
    return this.get(`/stats?period=${period}`);
  }

  async getSalesByPeriod(period) {
    return this.get(`/stats/sales?period=${period}`);
  }

  async getTopProducts(limit = 5) {
    return this.get(`/stats/top-products?limit=${limit}`);
  }

  async getRevenueByCategory() {
    return this.get('/stats/by-category');
  }
}

// Instancia global
window.API = new ApiClient();
