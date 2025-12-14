/**
 * AuthService Loader - Carga robusta con validación
 */

(function () {
  'use strict';

  // Logger condicional
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.DEBUG === true);
  const logger = {
    log: (...args) => isDev && console.log(...args),
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
  };

  logger.log('🔄 Cargando AuthService...');

  // Si ya existe y es válido, no hacer nada
  if (globalThis.AuthService && typeof globalThis.AuthService.login === 'function') {
    logger.log('✅ AuthService ya estaba cargado y es válido');
    return;
  }

  /**
   * Sistema de Autenticación
   * Maneja login, registro, sesiones y tokens
   */
  class AuthService {
    constructor() {
      // En desarrollo usamos proxy relativo para evitar CORS (Vite server proxy).
      // Detectar entorno local por hostname para soportar cualquier puerto dev.
      const hostname =
        typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.hostname
          ? globalThis.location.hostname
          : '';
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
      this.API_BASE = isLocalhost ? '/api/auth' : 'http://localhost:3000/api/auth';
      this.TOKEN_KEY = 'flores-victoria-token';
      this.USER_KEY = 'flores-victoria-user';
      this.REFRESH_KEY = 'flores-victoria-refresh';
    }

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

    isAuthenticated() {
      const token = this.getToken();
      const user = this.getCurrentUser();

      if (!token || !user) {
        return false;
      }

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

    getToken() {
      return localStorage.getItem(this.TOKEN_KEY);
    }

    getRefreshToken() {
      return localStorage.getItem(this.REFRESH_KEY);
    }

    saveSession(token, refreshToken, user) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));

      if (refreshToken) {
        localStorage.setItem(this.REFRESH_KEY, refreshToken);
      }

      globalThis.dispatchEvent(
        new CustomEvent('authChange', {
          detail: { user, authenticated: true },
        })
      );
    }

    clearSession() {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.REFRESH_KEY);

      globalThis.dispatchEvent(
        new CustomEvent('authChange', {
          detail: { user: null, authenticated: false },
        })
      );
    }

    async login(email, password, _remember = false) {
      try {
        const response = await fetch(`${this.API_BASE}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        // Leer cuerpo aunque la respuesta sea 4xx/5xx para propagar el mensaje del backend
        const text = await response.text();
        let data = null;
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (err) {
            // no es JSON, conservar texto
          }
        }

        if (!response.ok) {
          // Intentar extraer un mensaje útil del body
          const serverMsg =
            (data && (data.message || data.error)) ||
            text ||
            `HTTP error! status: ${response.status}`;
          throw new Error(serverMsg);
        }

        if (!text) {
          throw new Error('Respuesta vacía del servidor');
        }

        // data ya debe contener el JSON parseado
        this.saveSession(
          data.accessToken || data.token || '',
          data.refreshToken,
          data.user || data
        );
        return { success: true, user: data.user || data };
      } catch (error) {
        logger.error('Login error:', error);
        return { success: false, error: error.message };
      }
    }

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

        if (data.token) {
          this.saveSession(data.token, data.refreshToken, data.user);
        }

        return { success: true, user: data.user };
      } catch (error) {
        logger.error('Register error:', error);
        return { success: false, error: error.message };
      }
    }

    async logout() {
      try {
        const token = this.getToken();

        if (token) {
          await fetch(`${this.API_BASE}/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => {});
        }
      } finally {
        this.clearSession();
        globalThis.location.href = '/index.html';
      }
    }

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
  }

  // Crear instancia y exportar
  const authService = new AuthService();
  globalThis.AuthService = authService;

  // Validar que se cargó correctamente
  logger.log('✅ AuthService inline cargado y validado');
  logger.log('   - isAuthenticated:', typeof authService.isAuthenticated);
  logger.log('   - login:', typeof authService.login);
  logger.log('   - register:', typeof authService.register);
  logger.log('   - logout:', typeof authService.logout);
})();
