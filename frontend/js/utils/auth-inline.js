/**
 * AuthService Loader - Carga robusta con validación
 */

(function() {
  'use strict';

  console.log('🔄 Cargando AuthService...');

  // Si ya existe y es válido, no hacer nada
  if (window.AuthService && typeof window.AuthService.login === 'function') {
    console.log('✅ AuthService ya estaba cargado y es válido');
    return;
  }

  /**
   * Sistema de Autenticación
   * Maneja login, registro, sesiones y tokens
   */
  class AuthService {
    constructor() {
      this.API_BASE = 'http://localhost:3000/api/auth';
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
        console.error('Error parsing user data:', error);
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
        console.error('Error validating token:', error);
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

      window.dispatchEvent(new CustomEvent('authChange', { 
        detail: { user, authenticated: true } 
      }));
    }

    clearSession() {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.REFRESH_KEY);

      window.dispatchEvent(new CustomEvent('authChange', { 
        detail: { user: null, authenticated: false } 
      }));
    }

    async login(email, password, remember = false) {
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

        this.saveSession(data.token, data.refreshToken, data.user);
        return { success: true, user: data.user };
      } catch (error) {
        console.error('Login error:', error);
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
        console.error('Register error:', error);
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
              'Authorization': `Bearer ${token}`,
            },
          }).catch(() => {});
        }
      } finally {
        this.clearSession();
        window.location.href = '/index.html';
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
        console.error('Forgot password error:', error);
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
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
      }
    }
  }

  // Crear instancia y exportar
  const authService = new AuthService();
  window.AuthService = authService;

  // Validar que se cargó correctamente
  console.log('✅ AuthService inline cargado y validado');
  console.log('   - isAuthenticated:', typeof authService.isAuthenticated);
  console.log('   - login:', typeof authService.login);
  console.log('   - register:', typeof authService.register);
  console.log('   - logout:', typeof authService.logout);

})();
