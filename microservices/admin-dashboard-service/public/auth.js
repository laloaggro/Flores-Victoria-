/**
 * Authentication & Authorization System
 * JWT-based authentication with role-based access control (RBAC)
 */

// Demo users database (in production, this would be in a secure backend)
const DEMO_USERS = {
    'admin': {
        password: 'admin123',
        role: 'admin',
        name: 'Administrador',
        email: 'admin@floresvictoria.com',
        permissions: ['read', 'write', 'delete', 'manage', 'admin']
    },
    'manager': {
        password: 'manager123',
        role: 'manager',
        name: 'Manager',
        email: 'manager@floresvictoria.com',
        permissions: ['read', 'write', 'manage']
    },
    'viewer': {
        password: 'viewer123',
        role: 'viewer',
        name: 'Visualizador',
        email: 'viewer@floresvictoria.com',
        permissions: ['read']
    }
};

// Authentication class
class AuthSystem {
    constructor() {
        this.tokenKey = 'authToken';
        this.userDataKey = 'userData';
        this.refreshTokenKey = 'refreshToken';
    }

    /**
     * Authenticate user with username and password
     * @param {string} username 
     * @param {string} password 
     * @param {boolean} rememberMe 
     * @returns {Promise<Object>}
     */
    async login(username, password, rememberMe = false) {
        return new Promise((resolve, reject) => {
            // Simulate API call delay
            setTimeout(() => {
                const user = DEMO_USERS[username];
                
                if (!user || user.password !== password) {
                    reject(new Error('Usuario o contraseña incorrectos'));
                    return;
                }
                
                // Generate tokens
                const expiresIn = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
                const token = this.generateToken(username, user, expiresIn);
                const refreshToken = this.generateRefreshToken(username);
                
                // Store tokens
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem(this.tokenKey, token);
                storage.setItem(this.refreshTokenKey, refreshToken);
                storage.setItem(this.userDataKey, JSON.stringify({
                    username: username,
                    role: user.role,
                    name: user.name,
                    email: user.email,
                    permissions: user.permissions
                }));
                
                resolve({
                    success: true,
                    token: token,
                    user: {
                        username: username,
                        role: user.role,
                        name: user.name,
                        email: user.email,
                        permissions: user.permissions
                    }
                });
            }, 800);
        });
    }

    /**
     * Logout current user
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userDataKey);
        localStorage.removeItem(this.refreshTokenKey);
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(this.userDataKey);
        sessionStorage.removeItem(this.refreshTokenKey);
        
        window.location.href = '/login.html';
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = this.getToken();
        
        if (!token) {
            return false;
        }
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Check if token is expired
            if (payload.exp < Date.now()) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (e) {
            console.error('Invalid token:', e);
            this.logout();
            return false;
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
            console.error('Invalid user data:', e);
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
        
        return roles.includes(user.role);
    }

    /**
     * Generate JWT token (mock implementation)
     * @param {string} username 
     * @param {Object} user 
     * @param {number} expiresIn 
     * @returns {string}
     */
    generateToken(username, user, expiresIn) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            username: username,
            role: user.role,
            name: user.name,
            email: user.email,
            permissions: user.permissions,
            iat: Date.now(),
            exp: Date.now() + expiresIn
        }));
        const signature = btoa('mock-signature');
        
        return `${header}.${payload}.${signature}`;
    }

    /**
     * Generate refresh token
     * @param {string} username 
     * @returns {string}
     */
    generateRefreshToken(username) {
        return btoa(JSON.stringify({
            username: username,
            iat: Date.now(),
            exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        }));
    }

    /**
     * Protect page - redirect to login if not authenticated
     * @param {Array<string>} requiredRoles - Optional roles required
     */
    protectPage(requiredRoles = []) {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }
        
        if (requiredRoles.length > 0 && !this.hasAnyRole(requiredRoles)) {
            this.showAccessDenied();
            return;
        }
    }

    /**
     * Show access denied message
     */
    showAccessDenied() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: 'Segoe UI', sans-serif;">
                <i class="fas fa-ban" style="font-size: 80px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h1 style="color: #333; margin-bottom: 10px;">Acceso Denegado</h1>
                <p style="color: #666; margin-bottom: 30px;">No tienes permisos para acceder a esta página</p>
                <button onclick="window.location.href='/'" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                    Volver al Dashboard
                </button>
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
}

// Export singleton instance
const auth = new AuthSystem();

// Make it globally available
if (typeof window !== 'undefined') {
    window.auth = auth;
}
