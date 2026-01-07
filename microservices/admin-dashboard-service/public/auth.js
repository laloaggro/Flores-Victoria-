/**
 * Authentication & Authorization System - SECURE VERSION
 * JWT-based authentication that uses the server API
 * NO credentials stored in client code
 * 
 * @version 2.0.0
 */

// API Base URL
const AUTH_API_BASE = '/api/auth';

/**
 * Secure Authentication System
 * All authentication is handled server-side
 */
class SecureAuthSystem {
    constructor() {
        this.tokenKey = 'authToken';
        this.userDataKey = 'userData';
        this.refreshTokenKey = 'refreshToken';
        this._loginInProgress = false;
    }

    /**
     * Authenticate user with username/email and password via API
     * @param {string} identifier - Username or email
     * @param {string} password 
     * @param {boolean} rememberMe 
     * @returns {Promise<Object>}
     */
    async login(identifier, password, rememberMe = false) {
        if (this._loginInProgress) {
            throw new Error('Login already in progress');
        }

        this._loginInProgress = true;

        try {
            const response = await fetch(`${AUTH_API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: identifier,
                    email: identifier,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error de autenticación');
            }

            if (!data.success || !data.token) {
                throw new Error(data.message || 'Credenciales inválidas');
            }

            // Store tokens in appropriate storage
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem(this.tokenKey, data.token);
            storage.setItem(this.userDataKey, JSON.stringify(data.user));

            // Dispatch login event
            window.dispatchEvent(new CustomEvent('auth:login', { detail: data.user }));

            return {
                success: true,
                token: data.token,
                user: data.user
            };
        } catch (error) {
            console.error('[Auth] Login error:', error.message);
            throw error;
        } finally {
            this._loginInProgress = false;
        }
    }

    /**
     * Logout current user via API
     */
    async logout() {
        try {
            const token = this.getToken();
            
            if (token) {
                // Notify server to invalidate token
                await fetch(`${AUTH_API_BASE}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(() => {
                    // Ignore errors during logout API call
                });
            }
        } finally {
            // Always clear local storage
            this.clearSession();
            
            // Dispatch logout event
            window.dispatchEvent(new CustomEvent('auth:logout'));
            
            // Redirect to login
            window.location.href = '/login.html';
        }
    }

    /**
     * Clear all session data
     */
    clearSession() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userDataKey);
        localStorage.removeItem(this.refreshTokenKey);
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(this.userDataKey);
        sessionStorage.removeItem(this.refreshTokenKey);
    }

    /**
     * Verify current token with server
     * @returns {Promise<boolean>}
     */
    async verifyToken() {
        const token = this.getToken();
        
        if (!token) {
            return false;
        }

        try {
            const response = await fetch(`${AUTH_API_BASE}/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                this.clearSession();
                return false;
            }

            const data = await response.json();
            
            // Update user data if returned
            if (data.user) {
                const storage = localStorage.getItem(this.tokenKey) ? localStorage : sessionStorage;
                storage.setItem(this.userDataKey, JSON.stringify(data.user));
            }

            return data.valid === true;
        } catch (error) {
            console.error('[Auth] Token verification failed:', error.message);
            return false;
        }
    }

    /**
     * Check if user is authenticated (local check + optional server verify)
     * @param {boolean} serverVerify - Whether to verify with server
     * @returns {boolean|Promise<boolean>}
     */
    isAuthenticated(serverVerify = false) {
        const token = this.getToken();
        
        if (!token) {
            return serverVerify ? Promise.resolve(false) : false;
        }

        try {
            // Decode and check expiration locally first
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Check if token is expired (handle both seconds and milliseconds)
            const expTime = payload.exp > 9999999999 ? payload.exp : payload.exp * 1000;
            
            if (expTime < Date.now()) {
                this.clearSession();
                return serverVerify ? Promise.resolve(false) : false;
            }

            // If server verification requested, do it async
            if (serverVerify) {
                return this.verifyToken();
            }

            return true;
        } catch (e) {
            console.error('[Auth] Invalid token format:', e.message);
            this.clearSession();
            return serverVerify ? Promise.resolve(false) : false;
        }
    }

    /**
     * Get current authentication token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    }

    /**
     * Get current user data
     * @returns {Object|null}
     */
    getCurrentUser() {
        const userData = localStorage.getItem(this.userDataKey) || sessionStorage.getItem(this.userDataKey);
        
        if (!userData) {
            return null;
        }
        
        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('[Auth] Invalid user data in storage');
            return null;
        }
    }

    /**
     * Refresh current user data from server
     * @returns {Promise<Object|null>}
     */
    async refreshUserData() {
        const token = this.getToken();
        
        if (!token) {
            return null;
        }

        try {
            const response = await fetch(`${AUTH_API_BASE}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            
            if (data.user) {
                const storage = localStorage.getItem(this.tokenKey) ? localStorage : sessionStorage;
                storage.setItem(this.userDataKey, JSON.stringify(data.user));
                return data.user;
            }

            return null;
        } catch (error) {
            console.error('[Auth] Failed to refresh user data:', error.message);
            return null;
        }
    }

    /**
     * Check if user has specific permission
     * @param {string} permission 
     * @returns {boolean}
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        
        if (!user || !user.permissions) {
            return false;
        }
        
        // Superadmin and admin have all permissions
        if (user.role === 'superadmin' || user.role === 'admin') {
            return true;
        }
        
        return user.permissions.includes(permission);
    }

    /**
     * Check if user has specific role
     * @param {string} role 
     * @returns {boolean}
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        
        if (!user) {
            return false;
        }
        
        // Superadmin has access to all roles
        if (user.role === 'superadmin') {
            return true;
        }
        
        return user.role === role;
    }

    /**
     * Check if user has any of the specified roles
     * @param {Array<string>} roles 
     * @returns {boolean}
     */
    hasAnyRole(roles) {
        const user = this.getCurrentUser();
        
        if (!user) {
            return false;
        }
        
        // Superadmin has access to all roles
        if (user.role === 'superadmin') {
            return true;
        }
        
        return roles.includes(user.role);
    }

    /**
     * Protect page - redirect to login if not authenticated
     * @param {Array<string>} requiredRoles - Optional roles required
     * @param {boolean} serverVerify - Whether to verify with server
     */
    async protectPage(requiredRoles = [], serverVerify = false) {
        const isAuth = serverVerify 
            ? await this.isAuthenticated(true) 
            : this.isAuthenticated();
        
        if (!isAuth) {
            // Store intended destination
            sessionStorage.setItem('auth:redirect', window.location.pathname);
            window.location.href = '/login.html';
            return false;
        }
        
        if (requiredRoles.length > 0 && !this.hasAnyRole(requiredRoles)) {
            this.showAccessDenied();
            return false;
        }

        return true;
    }

    /**
     * Show access denied message
     */
    showAccessDenied() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: 'Inter', 'Segoe UI', sans-serif; background: var(--bg-primary, #f8f9fa);">
                <div style="text-align: center; padding: 2rem; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <i class="fas fa-shield-alt" style="font-size: 64px; color: #dc3545; margin-bottom: 20px;"></i>
                    <h1 style="color: #333; margin-bottom: 10px; font-weight: 600;">Acceso Denegado</h1>
                    <p style="color: #666; margin-bottom: 30px;">No tienes permisos para acceder a esta página</p>
                    <button onclick="window.location.href='/'" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; transition: transform 0.2s;">
                        <i class="fas fa-home" style="margin-right: 8px;"></i>
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Add authorization header to fetch requests
     * @param {Object} options 
     * @returns {Object}
     */
    addAuthHeader(options = {}) {
        const token = this.getToken();
        
        if (!token) {
            return options;
        }
        
        return {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        };
    }

    /**
     * Create authenticated fetch wrapper
     * @param {string} url 
     * @param {Object} options 
     * @returns {Promise<Response>}
     */
    async authFetch(url, options = {}) {
        const authOptions = this.addAuthHeader(options);
        
        const response = await fetch(url, authOptions);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            // Token might be expired or invalid
            const shouldLogout = await this.handleUnauthorized();
            if (shouldLogout) {
                return response;
            }
        }
        
        return response;
    }

    /**
     * Handle 401 Unauthorized response
     * @returns {Promise<boolean>} - true if should logout
     */
    async handleUnauthorized() {
        // Try to verify token first
        const isValid = await this.verifyToken();
        
        if (!isValid) {
            // Show notification before logout
            if (typeof showToast === 'function') {
                showToast('Tu sesión ha expirado. Por favor inicia sesión de nuevo.', 'warning');
            }
            
            setTimeout(() => {
                this.logout();
            }, 2000);
            
            return true;
        }
        
        return false;
    }

    /**
     * Change user password
     * @param {string} currentPassword 
     * @param {string} newPassword 
     * @returns {Promise<Object>}
     */
    async changePassword(currentPassword, newPassword) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${AUTH_API_BASE}/change-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cambiar contraseña');
        }

        return data;
    }
}

// Export singleton instance
const auth = new SecureAuthSystem();

// Make it globally available
if (typeof window !== 'undefined') {
    window.auth = auth;
    
    console.log('🔐 Secure Auth System initialized (server-side validation)');
}
