/**
 * Flores Victoria - API Client Module
 * Centralized API communication
 * Version: 2.0.0
 */

class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Request genérico
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
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
    this.clearCache(); // Invalidate cache on mutations
    return this.request(endpoint, { method: 'POST', body, ...options });
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    this.clearCache();
    return this.request(endpoint, { method: 'PUT', body, ...options });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body, options = {}) {
    this.clearCache();
    return this.request(endpoint, { method: 'PATCH', body, ...options });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    this.clearCache();
    return this.request(endpoint, { method: 'DELETE', ...options });
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
