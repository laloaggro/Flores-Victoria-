// Logger condicional
const isDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.DEBUG === true);
const logger = {
  log: (...args) => isDev && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
};

/**
 * Sistema de Autenticación
 * Maneja login, registro, sesiones y tokens
 */

class AuthService {
  constructor() {
    // Detectar entorno por hostname
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isRailway = hostname.includes('.railway.app') || hostname.includes('arreglosvictoria');
    
    // Configurar URL de API según entorno
    if (isLocalhost) {
      this.API_BASE = '/api/auth'; // Proxy de Vite
    } else if (isRailway) {
      this.API_BASE = 'https://api-gateway-production-b02f.up.railway.app/api/auth';
    } else {
      this.API_BASE = '/api/auth'; // Fallback con proxy
    }
    
    this.TOKEN_KEY = 'flores-victoria-token';
    this.USER_KEY = 'flores-victoria-user';
    this.REFRESH_KEY = 'flores-victoria-refresh';
    
    logger.log(`🔐 AuthService API: ${this.API_BASE}`);
  }

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      logger.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (!token || !user) {
      return false;
    }

    // Verificar si el token ha expirado
    try {
      const payload = this.parseJwt(token);
      const now = Date.now() / 1000;

      if (payload.exp && payload.exp < now) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Obtener token de acceso
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  /**
   * Guardar datos de sesión
   */
  saveSession(token, refreshToken, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    if (refreshToken) {
      localStorage.setItem(this.REFRESH_KEY, refreshToken);
    }

    // Emitir evento personalizado
    globalThis.dispatchEvent(
      new CustomEvent('authChange', {
        detail: { user, authenticated: true },
      })
    );
  }

  /**
   * Limpiar sesión
   */
  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_KEY);

    // Emitir evento personalizado
    globalThis.dispatchEvent(
      new CustomEvent('authChange', {
        detail: { user: null, authenticated: false },
      })
    );
  }

  /**
   * Login con email y contraseña
   */
  async login(email, password, _remember = false) {
    try {
      const response = await fetch(`${this.API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar sesión
      this.saveSession(data.token, data.refreshToken, data.user);

      return { success: true, user: data.user };
    } catch (error) {
      logger.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Registro de nuevo usuario
   */
  async register(name, email, password) {
    try {
      const response = await fetch(`${this.API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      // Auto-login después del registro
      if (data.token) {
        this.saveSession(data.token, data.refreshToken, data.user);
      }

      return { success: true, user: data.user };
    } catch (error) {
      logger.error('Register error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      const token = this.getToken();

      if (token) {
        // Intentar notificar al servidor (opcional)
        await fetch(`${this.API_BASE}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignorar errores del servidor en logout
        });
      }
    } finally {
      // Siempre limpiar sesión local
      this.clearSession();

      // Redirigir a home
      globalThis.location.href = '/index.html';
    }
  }

  /**
   * Recuperar contraseña
   */
  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.API_BASE}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar correo de recuperación');
      }

      return { success: true, message: data.message };
    } catch (error) {
      logger.error('Forgot password error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Resetear contraseña
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${this.API_BASE}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al resetear contraseña');
      }

      return { success: true, message: data.message };
    } catch (error) {
      logger.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(updates) {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${this.API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      // Actualizar usuario en localStorage
      const currentUser = this.getCurrentUser();
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));

      // Emitir evento
      window.dispatchEvent(
        new CustomEvent('authChange', {
          detail: { user: updatedUser, authenticated: true },
        })
      );

      return { success: true, user: updatedUser };
    } catch (error) {
      logger.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${this.API_BASE}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña');
      }

      return { success: true, message: data.message };
    } catch (error) {
      logger.error('Change password error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Parsear JWT (solo para lectura del payload)
   */
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      logger.error('Error parsing JWT:', error);
      return null;
    }
  }

  /**
   * Hacer petición autenticada
   */
  async authenticatedFetch(url, options = {}) {
    const token = this.getToken();

    if (!token) {
      throw new Error('No autenticado');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    // Si recibimos 401, el token expiró
    if (response.status === 401) {
      this.logout();
      throw new Error('Sesión expirada');
    }

    return response;
  }
}

// Exportar instancia singleton
const authService = new AuthService();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.AuthService = authService;
  logger.log('✅ AuthService cargado:', {
    tipo: typeof authService,
    metodos: Object.getOwnPropertyNames(Object.getPrototypeOf(authService)),
    isAuthenticated: typeof authService.isAuthenticated,
    login: typeof authService.login,
    instancia: authService,
  });
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = authService;
}
