/**
 * Flores Victoria - Auth Compatibility Layer
 * Adapts window.auth (from /auth.js) to window.Auth interface
 * Resolves double authentication issue
 * Version: 2.0.0
 */

console.debug('[admin-panel] auth.js compatibility layer loaded');

// Wait for window.auth to be available
function initAuthCompat() {
  // If window.auth already exists (from /auth.js), create Auth adapter
  if (window.auth) {
    createAuthAdapter();
  } else {
    // Wait for auth to load
    setTimeout(initAuthCompat, 50);
  }
}

function createAuthAdapter() {
  /**
   * Auth compatibility class that wraps window.auth
   * Provides window.Auth interface expected by app.js and other modules
   */
  class AuthAdapter {
    constructor() {
      this._auth = window.auth;
      console.debug('[AuthAdapter] Created adapter for window.auth');
    }

    /**
     * Login user - delegates to window.auth
     */
    async login(username, password) {
      try {
        const result = await this._auth.login(username, password, true);
        return result;
      } catch (error) {
        throw error;
      }
    }

    /**
     * Logout user - delegates to window.auth
     */
    async logout() {
      this._auth.logout();
    }

    /**
     * Check if authenticated - delegates to window.auth
     */
    isAuthenticated() {
      return this._auth.isAuthenticated();
    }

    /**
     * Get current token
     */
    getToken() {
      return this._auth.getToken();
    }

    /**
     * Get current user - maps to getCurrentUser
     */
    getUser() {
      return this._auth.getCurrentUser();
    }

    /**
     * Verify token validity
     */
    async verifyToken() {
      try {
        // Check if token exists and is valid
        const token = this._auth.getToken();
        if (!token) return false;
        
        // Check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now();
      } catch {
        return false;
      }
    }

    /**
     * Clear session data
     */
    clearSession() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('refreshToken');
    }

    /**
     * Check if user has permission
     */
    hasPermission(permission) {
      return this._auth.hasPermission(permission);
    }

    /**
     * Check if user has role
     */
    hasRole(role) {
      return this._auth.hasRole(role);
    }

    /**
     * Check if user has any of specified roles
     */
    hasAnyRole(roles) {
      return this._auth.hasAnyRole(roles);
    }
  }

  // Create global Auth instance
  window.Auth = new AuthAdapter();
  
  console.log('✅ Auth compatibility layer initialized');
  
  // Dispatch event for modules waiting on Auth
  window.dispatchEvent(new CustomEvent('auth:ready'));
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthCompat);
} else {
  initAuthCompat();
}
