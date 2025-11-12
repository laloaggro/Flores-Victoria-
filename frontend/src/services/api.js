/**
 * API Client - Cliente HTTP centralizado para microservices
 * Maneja: autenticación, errores, loading states, retry logic
 */

import axios from 'axios';

// Configuración de bases URL por ambiente
const API_BASES = {
  development: {
    cart: 'http://localhost:3001',
    product: 'http://localhost:3002',
    auth: 'http://localhost:3003',
    user: 'http://localhost:3004',
    order: 'http://localhost:3005',
  },
  production: {
    cart: 'https://api.flores-victoria.com/cart',
    product: 'https://api.flores-victoria.com/product',
    auth: 'https://api.flores-victoria.com/auth',
    user: 'https://api.flores-victoria.com/user',
    order: 'https://api.flores-victoria.com/order',
  },
};

const ENV = process.env.NODE_ENV || 'development';
const API_TIMEOUT = 10000; // 10 segundos

/**
 * Crear instancia de axios para un servicio específico
 */
const createServiceClient = (serviceName) => {
  const baseURL = API_BASES[ENV][serviceName];

  const client = axios.create({
    baseURL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Agregar token JWT
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Manejo de errores global
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // Server respondió con error
        const { status, data } = error.response;

        switch (status) {
          case 401:
            // Token inválido o expirado
            localStorage.removeItem('token');
            window.location.href = '/login';
            break;

          case 403:
            // No autorizado
            console.error('Access forbidden:', data.message);
            break;

          case 429:
            // Rate limit excedido
            console.warn('Too many requests, please slow down');
            break;

          case 500:
          case 502:
          case 503:
          case 504:
            // Errores de servidor
            console.error('Server error:', data.message);
            break;

          default:
            console.error('API Error:', data.message);
        }
      } else if (error.request) {
        // Request hecho pero no hubo respuesta
        console.error('Network error: No response from server');
      } else {
        // Error en setup del request
        console.error('Request setup error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Crear clientes para cada servicio
const clients = {
  cart: createServiceClient('cart'),
  product: createServiceClient('product'),
  auth: createServiceClient('auth'),
  user: createServiceClient('user'),
  order: createServiceClient('order'),
};

/**
 * API Service - Métodos de alto nivel
 */
class APIService {
  // ============================================
  // AUTH SERVICE
  // ============================================

  static async login(email, password) {
    const response = await clients.auth.post('/api/auth/login', {
      email,
      password,
    });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  }

  static async register(userData) {
    const response = await clients.auth.post('/api/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  }

  static logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  static async refreshToken() {
    const response = await clients.auth.post('/api/auth/refresh');
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  }

  // ============================================
  // PRODUCT SERVICE
  // ============================================

  static async getProducts(params = {}) {
    const response = await clients.product.get('/api/products', { params });
    return response.data;
  }

  static async getProduct(id) {
    const response = await clients.product.get(`/api/products/${id}`);
    return response.data;
  }

  static async createProduct(productData) {
    const response = await clients.product.post('/api/products', productData);
    return response.data;
  }

  static async updateProduct(id, productData) {
    const response = await clients.product.put(`/api/products/${id}`, productData);
    return response.data;
  }

  static async deleteProduct(id) {
    const response = await clients.product.delete(`/api/products/${id}`);
    return response.data;
  }

  // ============================================
  // CART SERVICE
  // ============================================

  static async getCart() {
    const response = await clients.cart.get('/api/cart');
    return response.data;
  }

  static async addToCart(productId, quantity = 1) {
    const response = await clients.cart.post('/api/cart/items', {
      productId,
      quantity,
    });
    return response.data;
  }

  static async updateCartItem(itemId, quantity) {
    const response = await clients.cart.put(`/api/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  }

  static async removeFromCart(itemId) {
    const response = await clients.cart.delete(`/api/cart/items/${itemId}`);
    return response.data;
  }

  static async clearCart() {
    const response = await clients.cart.delete('/api/cart');
    return response.data;
  }

  // ============================================
  // ORDER SERVICE
  // ============================================

  static async getOrders(params = {}) {
    const response = await clients.order.get('/api/orders', { params });
    return response.data;
  }

  static async getOrder(id) {
    const response = await clients.order.get(`/api/orders/${id}`);
    return response.data;
  }

  static async createOrder(orderData) {
    const response = await clients.order.post('/api/orders', orderData);
    return response.data;
  }

  static async updateOrderStatus(id, status) {
    const response = await clients.order.patch(`/api/orders/${id}/status`, {
      status,
    });
    return response.data;
  }

  static async cancelOrder(id) {
    const response = await clients.order.post(`/api/orders/${id}/cancel`);
    return response.data;
  }

  // ============================================
  // USER SERVICE
  // ============================================

  static async getProfile() {
    const response = await clients.user.get('/api/users/profile');
    return response.data;
  }

  static async updateProfile(userData) {
    const response = await clients.user.put('/api/users/profile', userData);
    return response.data;
  }

  static async changePassword(oldPassword, newPassword) {
    const response = await clients.user.post('/api/users/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  }

  static async getAddresses() {
    const response = await clients.user.get('/api/users/addresses');
    return response.data;
  }

  static async addAddress(addressData) {
    const response = await clients.user.post('/api/users/addresses', addressData);
    return response.data;
  }

  static async updateAddress(id, addressData) {
    const response = await clients.user.put(`/api/users/addresses/${id}`, addressData);
    return response.data;
  }

  static async deleteAddress(id) {
    const response = await clients.user.delete(`/api/users/addresses/${id}`);
    return response.data;
  }

  // ============================================
  // HEALTH CHECKS
  // ============================================

  static async checkHealth() {
    const services = ['cart', 'product', 'auth', 'user', 'order'];
    const results = {};

    await Promise.all(
      services.map(async (service) => {
        try {
          const response = await clients[service].get('/health', {
            timeout: 3000,
          });
          results[service] = {
            status: 'healthy',
            data: response.data,
          };
        } catch (error) {
          results[service] = {
            status: 'unhealthy',
            error: error.message,
          };
        }
      })
    );

    return results;
  }
}

export default APIService;
export { clients };
