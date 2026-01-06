/**
 * Flores Victoria - Role-Based Access Control System
 * Professional RBAC with granular permissions
 * Version: 2.0.0
 */

// Definición de roles del sistema
const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  WORKER: 'worker',
  VIEWER: 'viewer'
};

// Definición de permisos granulares
const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_ANALYTICS: 'dashboard:analytics',
  
  // Productos
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_DELETE: 'products:delete',
  PRODUCTS_EXPORT: 'products:export',
  
  // Pedidos
  ORDERS_VIEW: 'orders:view',
  ORDERS_CREATE: 'orders:create',
  ORDERS_EDIT: 'orders:edit',
  ORDERS_CANCEL: 'orders:cancel',
  ORDERS_REFUND: 'orders:refund',
  ORDERS_EXPORT: 'orders:export',
  
  // Usuarios
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage_roles',
  
  // Inventario
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_RESTOCK: 'inventory:restock',
  
  // Reportes
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_FINANCIAL: 'reports:financial',
  
  // Monitoreo (Sistema)
  MONITORING_VIEW: 'monitoring:view',
  MONITORING_SERVICES: 'monitoring:services',
  MONITORING_LOGS: 'monitoring:logs',
  
  // Configuración
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_GENERAL: 'settings:general',
  SETTINGS_SECURITY: 'settings:security',
  SETTINGS_INTEGRATIONS: 'settings:integrations',
  SETTINGS_BACKUP: 'settings:backup'
};

// Mapeo de permisos por rol
const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: Object.values(PERMISSIONS), // Todos los permisos
  
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_ANALYTICS,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_EXPORT,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_EDIT,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.ORDERS_REFUND,
    PERMISSIONS.ORDERS_EXPORT,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_RESTOCK,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_FINANCIAL,
    PERMISSIONS.MONITORING_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_GENERAL
  ],
  
  [ROLES.MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_ANALYTICS,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_EXPORT,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_EDIT,
    PERMISSIONS.ORDERS_EXPORT,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_RESTOCK,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT
  ],
  
  [ROLES.WORKER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_EDIT,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST
  ],
  
  [ROLES.VIEWER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW
  ]
};

// Metadatos de roles para UI
const ROLE_METADATA = {
  [ROLES.SUPERADMIN]: {
    label: 'Super Administrador',
    description: 'Acceso total al sistema',
    color: '#C2185B',
    icon: 'fa-crown',
    level: 100
  },
  [ROLES.ADMIN]: {
    label: 'Administrador',
    description: 'Gestión completa del negocio',
    color: '#7c3aed',
    icon: 'fa-user-shield',
    level: 80
  },
  [ROLES.MANAGER]: {
    label: 'Gerente',
    description: 'Supervisión de operaciones',
    color: '#2563eb',
    icon: 'fa-user-tie',
    level: 60
  },
  [ROLES.WORKER]: {
    label: 'Empleado',
    description: 'Operaciones diarias',
    color: '#059669',
    icon: 'fa-user',
    level: 40
  },
  [ROLES.VIEWER]: {
    label: 'Observador',
    description: 'Solo lectura',
    color: '#6b7280',
    icon: 'fa-eye',
    level: 20
  }
};

// Módulos del sistema con sus permisos requeridos
const SYSTEM_MODULES = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fa-chart-line',
    path: '/',
    permissions: [PERMISSIONS.DASHBOARD_VIEW]
  },
  products: {
    id: 'products',
    label: 'Productos',
    icon: 'fa-box',
    path: '/products',
    permissions: [PERMISSIONS.PRODUCTS_VIEW]
  },
  orders: {
    id: 'orders',
    label: 'Pedidos',
    icon: 'fa-shopping-cart',
    path: '/orders',
    permissions: [PERMISSIONS.ORDERS_VIEW],
    badge: 'pendingOrders'
  },
  users: {
    id: 'users',
    label: 'Usuarios',
    icon: 'fa-users',
    path: '/users',
    permissions: [PERMISSIONS.USERS_VIEW]
  },
  inventory: {
    id: 'inventory',
    label: 'Inventario',
    icon: 'fa-warehouse',
    path: '/inventory',
    permissions: [PERMISSIONS.INVENTORY_VIEW]
  },
  reports: {
    id: 'reports',
    label: 'Reportes',
    icon: 'fa-chart-bar',
    path: '/reports',
    permissions: [PERMISSIONS.REPORTS_VIEW]
  },
  monitoring: {
    id: 'monitoring',
    label: 'Monitoreo',
    icon: 'fa-server',
    path: '/monitoring',
    permissions: [PERMISSIONS.MONITORING_VIEW]
  },
  settings: {
    id: 'settings',
    label: 'Configuración',
    icon: 'fa-cog',
    path: '/settings',
    permissions: [PERMISSIONS.SETTINGS_VIEW]
  }
};

/**
 * Clase principal RBAC
 */
class RBACSystem {
  constructor() {
    this.currentUser = null;
    this.permissions = [];
    this.initialized = false;
  }

  /**
   * Inicializar con usuario actual
   */
  init(user) {
    if (!user) {
      console.warn('RBAC: No user provided');
      return false;
    }

    this.currentUser = user;
    this.permissions = ROLE_PERMISSIONS[user.role] || [];
    this.initialized = true;
    
    // Aplicar permisos al DOM
    this.applyPermissions();
    
    console.log(`RBAC: Initialized for ${user.name} (${user.role}) with ${this.permissions.length} permissions`);
    return true;
  }

  /**
   * Verificar si tiene un permiso específico
   */
  hasPermission(permission) {
    if (!this.initialized) return false;
    
    // Superadmin tiene todos los permisos
    if (this.currentUser.role === ROLES.SUPERADMIN) return true;
    
    return this.permissions.includes(permission);
  }

  /**
   * Verificar si tiene alguno de los permisos
   */
  hasAnyPermission(permissions) {
    return permissions.some(p => this.hasPermission(p));
  }

  /**
   * Verificar si tiene todos los permisos
   */
  hasAllPermissions(permissions) {
    return permissions.every(p => this.hasPermission(p));
  }

  /**
   * Verificar si tiene un rol específico o superior
   */
  hasRole(role) {
    if (!this.initialized) return false;
    
    const currentLevel = ROLE_METADATA[this.currentUser.role]?.level || 0;
    const requiredLevel = ROLE_METADATA[role]?.level || 0;
    
    return currentLevel >= requiredLevel;
  }

  /**
   * Obtener módulos accesibles para el usuario actual
   */
  getAccessibleModules() {
    if (!this.initialized) return [];
    
    return Object.values(SYSTEM_MODULES).filter(module => 
      this.hasAnyPermission(module.permissions)
    );
  }

  /**
   * Verificar acceso a un módulo
   */
  canAccessModule(moduleId) {
    const module = SYSTEM_MODULES[moduleId];
    if (!module) return false;
    
    return this.hasAnyPermission(module.permissions);
  }

  /**
   * Aplicar permisos a elementos del DOM
   */
  applyPermissions() {
    // Ocultar elementos que requieren permisos específicos
    document.querySelectorAll('[data-permission]').forEach(el => {
      const permission = el.dataset.permission;
      if (!this.hasPermission(permission)) {
        el.style.display = 'none';
      }
    });

    // Ocultar elementos que requieren roles específicos
    document.querySelectorAll('[data-role]').forEach(el => {
      const role = el.dataset.role;
      if (!this.hasRole(role)) {
        el.style.display = 'none';
      }
    });

    // Deshabilitar elementos que requieren escritura
    document.querySelectorAll('[data-requires-write]').forEach(el => {
      const module = el.dataset.requiresWrite;
      const writePermission = `${module}:edit`;
      
      if (!this.hasPermission(writePermission)) {
        el.disabled = true;
        el.classList.add('disabled');
        el.title = 'No tienes permisos para esta acción';
      }
    });

    // Mostrar indicador de solo lectura si aplica
    if (!this.hasPermission(PERMISSIONS.PRODUCTS_EDIT) && 
        !this.hasPermission(PERMISSIONS.ORDERS_EDIT)) {
      this.showReadOnlyBadge();
    }

    // Mostrar badge de rol
    this.showRoleBadge();
  }

  /**
   * Mostrar badge de solo lectura
   */
  showReadOnlyBadge() {
    const existingBadge = document.getElementById('readonly-badge');
    if (existingBadge) return;

    const badge = document.createElement('div');
    badge.id = 'readonly-badge';
    badge.className = 'readonly-badge';
    badge.innerHTML = '<i class="fas fa-eye"></i> Modo Solo Lectura';
    document.body.appendChild(badge);
  }

  /**
   * Mostrar badge de rol en la UI
   */
  showRoleBadge() {
    const roleInfo = document.querySelector('.sidebar-user-role');
    if (!roleInfo || !this.currentUser) return;

    const metadata = ROLE_METADATA[this.currentUser.role];
    if (metadata) {
      roleInfo.innerHTML = `
        <i class="fas ${metadata.icon}" style="color: ${metadata.color}"></i>
        <span>${metadata.label}</span>
      `;
    }
  }

  /**
   * Obtener información del rol actual
   */
  getRoleInfo() {
    if (!this.currentUser) return null;
    return {
      ...ROLE_METADATA[this.currentUser.role],
      role: this.currentUser.role,
      permissions: this.permissions
    };
  }
}

// Instancia global
window.RBAC = new RBACSystem();
window.ROLES = ROLES;
window.PERMISSIONS = PERMISSIONS;
window.SYSTEM_MODULES = SYSTEM_MODULES;

// CSS para badges
const rbacStyles = document.createElement('style');
rbacStyles.textContent = `
  .readonly-badge {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #6b7280, #4b5563);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 600;
    font-size: 13px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    pointer-events: none;
  }

  [data-permission].hidden,
  [data-role].hidden {
    display: none !important;
  }
`;
document.head.appendChild(rbacStyles);

export { RBACSystem, ROLES, PERMISSIONS, ROLE_PERMISSIONS, ROLE_METADATA, SYSTEM_MODULES };
