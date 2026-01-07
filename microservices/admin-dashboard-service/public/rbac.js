/**
 * RBAC Middleware - Role-Based Access Control
 * Protects pages and UI elements based on user roles and permissions
 * Version: 2.0.0 - Added compatibility with /js/rbac.js interface
 */

class RBACMiddleware {
    constructor(authSystem) {
        this.auth = authSystem;
        this.currentUser = null;
        this.permissions = [];
        this.initialized = false;
    }

    /**
     * Initialize RBAC system - call this after DOM is ready
     */
    init(user = null) {
        if (user) {
            this.currentUser = user;
            this.permissions = user.permissions || [];
        } else if (this.auth && this.auth.getCurrentUser) {
            this.currentUser = this.auth.getCurrentUser();
            this.permissions = this.currentUser?.permissions || [];
        }
        
        this.initialized = true;
        this.applyPermissions();
        console.log('✅ RBAC initialized for user:', this.currentUser?.name || 'anonymous');
    }

    /**
     * Apply permissions to page elements
     */
    applyPermissions() {
        const user = this.currentUser || (this.auth?.getCurrentUser ? this.auth.getCurrentUser() : null);
        
        if (!user) {
            return;
        }

        // Hide elements based on required permissions
        document.querySelectorAll('[data-requires-permission]').forEach(element => {
            const requiredPermission = element.getAttribute('data-requires-permission');
            
            if (!this.hasPermission(requiredPermission)) {
                element.style.display = 'none';
            }
        });

        // Hide elements based on required role
        document.querySelectorAll('[data-requires-role]').forEach(element => {
            const requiredRole = element.getAttribute('data-requires-role');
            
            if (!this.hasRole(requiredRole)) {
                element.style.display = 'none';
            }
        });

        // Disable buttons/inputs based on permissions
        document.querySelectorAll('[data-requires-write]').forEach(element => {
            if (!this.hasPermission('write')) {
                element.disabled = true;
                element.style.opacity = '0.5';
                element.style.cursor = 'not-allowed';
                element.title = 'No tienes permisos para realizar esta acción';
            }
        });

        // Add visual indicators for read-only mode
        if (!this.hasPermission('write')) {
            this.addReadOnlyBadge();
        }

        // Add role badge to user interface
        this.addRoleBadge();
    }

    /**
     * Check if user has specific permission
     * @param {string} permission
     * @returns {boolean}
     */
    hasPermission(permission) {
        if (this.auth?.hasPermission) {
            return this.auth.hasPermission(permission);
        }
        return this.permissions.includes(permission) || this.permissions.includes('admin');
    }

    /**
     * Check if user has specific role
     * @param {string} role
     * @returns {boolean}
     */
    hasRole(role) {
        if (this.auth?.hasRole) {
            return this.auth.hasRole(role);
        }
        return this.currentUser?.role === role;
    }

    /**
     * Check if user can access a module
     * @param {string} module
     * @returns {boolean}
     */
    canAccessModule(module) {
        // Map modules to required permissions
        const modulePermissions = {
            'dashboard': [],  // Everyone can access
            'products': ['read'],
            'orders': ['read'],
            'users': ['read', 'manage'],
            'reports': ['read'],
            'settings': ['admin'],
            'monitoring': ['read']
        };
        
        const required = modulePermissions[module] || [];
        if (required.length === 0) return true;
        
        return required.some(perm => this.hasPermission(perm));
    }

    /**
     * Add read-only badge to interface
     */
    addReadOnlyBadge() {
        // Check if badge already exists
        if (document.getElementById('rbac-readonly-badge')) return;
        
        const badge = document.createElement('div');
        badge.id = 'rbac-readonly-badge';
        badge.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #95a5a6, #7f8c8d);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        badge.innerHTML = '<i class="fas fa-eye"></i> Modo Solo Lectura';
        document.body.appendChild(badge);
    }

    /**
     * Add role badge to interface
     */
    addRoleBadge() {
        // Check if badge already exists
        if (document.getElementById('rbac-role-badge')) return;
        
        const user = this.currentUser || (this.auth?.getCurrentUser ? this.auth.getCurrentUser() : null);
        
        if (!user) {
            return;
        }

        const roleColors = {
            'admin': { bg: '#f39c12', text: 'ADMIN - Acceso Total' },
            'manager': { bg: '#3498db', text: 'MANAGER - Edición' },
            'viewer': { bg: '#95a5a6', text: 'VIEWER - Solo Lectura' }
        };

        const roleConfig = roleColors[user.role] || { bg: '#95a5a6', text: user.role.toUpperCase() };

        const badge = document.createElement('div');
        badge.id = 'rbac-role-badge';
        badge.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: ${roleConfig.bg};
            color: white;
            padding: 10px 18px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        badge.innerHTML = `<i class="fas fa-shield-alt"></i> ${roleConfig.text}`;
        document.body.appendChild(badge);
    }

    /**
     * Check if user can access a specific route/page
     * @param {string} route 
     * @param {Array<string>} allowedRoles 
     * @returns {boolean}
     */
    canAccessRoute(route, allowedRoles = []) {
        if (allowedRoles.length === 0) {
            return true;
        }

        return this.auth.hasAnyRole(allowedRoles);
    }

    /**
     * Protect a function with permission check
     * @param {Function} fn 
     * @param {string} requiredPermission 
     * @returns {Function}
     */
    protectFunction(fn, requiredPermission) {
        return (...args) => {
            if (!this.auth.hasPermission(requiredPermission)) {
                this.showPermissionDenied();
                return null;
            }
            return fn(...args);
        };
    }

    /**
     * Show permission denied message
     */
    showPermissionDenied() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <i class="fas fa-ban" style="font-size: 60px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h2 style="color: #333; margin-bottom: 10px;">Permiso Denegado</h2>
                <p style="color: #666; margin-bottom: 30px;">No tienes permisos suficientes para realizar esta acción</p>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 30px; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600;">
                    Entendido
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Remove modal on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 5000);
    }

    /**
     * Get user role label with icon
     * @returns {string}
     */
    getRoleLabel() {
        const user = this.auth.getCurrentUser();
        
        if (!user) {
            return '';
        }

        const roleIcons = {
            'admin': '<i class="fas fa-crown" style="color: #f39c12;"></i> Administrador',
            'manager': '<i class="fas fa-user-tie" style="color: #3498db;"></i> Manager',
            'viewer': '<i class="fas fa-eye" style="color: #95a5a6;"></i> Visualizador'
        };

        return roleIcons[user.role] || user.role;
    }

    /**
     * Create permission-aware button
     * @param {Object} options 
     * @returns {HTMLElement}
     */
    createButton(options) {
        const {
            text,
            icon = '',
            onClick,
            requiredPermission = null,
            requiredRole = null,
            className = 'btn'
        } = options;

        const button = document.createElement('button');
        button.className = className;
        button.innerHTML = icon ? `<i class="${icon}"></i> ${text}` : text;

        // Check permissions
        if (requiredPermission && !this.auth.hasPermission(requiredPermission)) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'No tienes permisos para esta acción';
            return button;
        }

        if (requiredRole && !this.auth.hasRole(requiredRole)) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = `Requiere rol: ${requiredRole}`;
            return button;
        }

        button.addEventListener('click', onClick);

        return button;
    }

    /**
     * Add audit log entry
     * @param {string} action 
     * @param {string} resource 
     * @param {Object} details 
     */
    async logAction(action, resource, details = {}) {
        const user = this.auth.getCurrentUser();
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            user: user ? user.username : 'anonymous',
            role: user ? user.role : 'unknown',
            action: action,
            resource: resource,
            details: details
        };

        console.log('📝 Audit Log:', logEntry);

        // In production, send to audit API
        try {
            await fetch('http://localhost:5050/audit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.auth.addAuthHeader().headers
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.error('Failed to send audit log:', error);
        }
    }
}

// Create RBAC middleware instance (defer auth binding until auth is available)
let rbac;

function initRBAC() {
    if (typeof auth !== 'undefined') {
        rbac = new RBACMiddleware(auth);
        
        // Make it globally available
        if (typeof window !== 'undefined') {
            window.rbac = rbac;
        }
        
        console.log('✅ RBAC middleware created');
    } else {
        // Wait for auth to be available
        setTimeout(initRBAC, 50);
    }
}

// Initialize when script loads
initRBAC();

// Utility functions for common RBAC patterns - also provides /js/rbac.js compatible interface
const RBAC = {
    /**
     * Initialize RBAC with user (for /js/app.js compatibility)
     */
    init: (user) => {
        if (rbac) {
            rbac.init(user);
        }
    },

    /**
     * Apply permissions to page elements
     */
    applyPermissions: () => {
        if (rbac) {
            rbac.applyPermissions();
        }
    },

    /**
     * Check if user has permission
     */
    hasPermission: (permission) => {
        if (rbac) {
            return rbac.hasPermission(permission);
        }
        return auth?.hasPermission?.(permission) || false;
    },

    /**
     * Check if user has role
     */
    hasRole: (role) => {
        if (rbac) {
            return rbac.hasRole(role);
        }
        return auth?.hasRole?.(role) || false;
    },

    /**
     * Check if user can access module
     */
    canAccessModule: (module) => {
        if (rbac) {
            return rbac.canAccessModule(module);
        }
        return true;
    },

    /**
     * Require admin role
     */
    requireAdmin: () => {
        if (!RBAC.hasRole('admin')) {
            rbac?.showPermissionDenied?.();
            return false;
        }
        return true;
    },

    /**
     * Require write permission
     */
    requireWrite: () => {
        if (!RBAC.hasPermission('write')) {
            rbac?.showPermissionDenied?.();
            return false;
        }
        return true;
    },

    /**
     * Require delete permission
     */
    requireDelete: () => {
        if (!RBAC.hasPermission('delete')) {
            rbac?.showPermissionDenied?.();
            return false;
        }
        return true;
    },

    /**
     * Check if user can manage (write or admin)
     */
    canManage: () => {
        return RBAC.hasPermission('write') || RBAC.hasPermission('admin');
    }
};

// Make RBAC utilities globally available
if (typeof window !== 'undefined') {
    window.RBAC = RBAC;
}

// Auto-init RBAC when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (rbac && typeof auth !== 'undefined' && auth.isAuthenticated()) {
        rbac.init();
    }
});
