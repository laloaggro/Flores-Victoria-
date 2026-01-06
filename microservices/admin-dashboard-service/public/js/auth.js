/**
 * Flores Victoria - Authentication Module
 * Secure JWT-based authentication
 * Version: 2.0.0
 */

class AuthService {
  constructor() {
    this.tokenKey = 'fv_admin_token';
    this.userKey = 'fv_admin_user';
    this.baseUrl = '/api/auth';
    this.refreshInterval = null;
  }

  /**
   * Login con credenciales
   */
  async login(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error de autenticación');
      }

      if (data.success && data.token) {
        this.setToken(data.token);
        this.setUser(data.user);
        this.startTokenRefresh();
        return { success: true, user: data.user };
      }

      throw new Error(data.message || 'Credenciales inválidas');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearSession();
      window.location.href = '/';
    }
  }

  /**
   * Verificar token actual
   */
  async verifyToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        this.clearSession();
        return false;
      }

      const data = await response.json();
      if (data.user) {
        this.setUser(data.user);
      }
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearSession();
        }
        return null;
      }

      const data = await response.json();
      if (data.user) {
        this.setUser(data.user);
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword, newPassword) {
    const token = this.getToken();
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${this.baseUrl}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al cambiar contraseña');
    }

    return data;
  }

  /**
   * Obtener headers de autorización
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    // Verificar si el token ha expirado (decodificación simple)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Obtener token almacenado
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Guardar token
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Obtener usuario almacenado
   */
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Guardar usuario
   */
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Limpiar sesión
   */
  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.stopTokenRefresh();
  }

  /**
   * Iniciar refresh automático del token
   */
  startTokenRefresh() {
    this.stopTokenRefresh();
    // Verificar token cada 5 minutos
    this.refreshInterval = setInterval(() => {
      this.verifyToken();
    }, 5 * 60 * 1000);
  }

  /**
   * Detener refresh automático
   */
  stopTokenRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

// Instancia global
window.Auth = new AuthService();

export { AuthService };
