/**
 * Role Manager - Sistema de gestión de roles y permisos en el frontend
 * Flores Victoria - Sistema integral de roles
 */

class RoleManager {
  constructor() {
    this.roles = {
      CLIENTE: 'cliente',
      TRABAJADOR: 'trabajador',
      ADMIN: 'admin',
      OWNER: 'owner',
    };

    this.permissions = {
      // Permisos de cliente
      VIEW_PRODUCTS: 'view_products',
      ADD_TO_CART: 'add_to_cart',
      MAKE_PURCHASE: 'make_purchase',
      VIEW_OWN_ORDERS: 'view_own_orders',
      EDIT_OWN_PROFILE: 'edit_own_profile',
      CREATE_WISHLIST: 'create_wishlist',
      CONTACT_SUPPORT: 'contact_support',

      // Permisos de trabajador
      VIEW_ALL_ORDERS: 'view_all_orders',
      UPDATE_ORDER_STATUS: 'update_order_status',
      VIEW_INVENTORY: 'view_inventory',
      MANAGE_DELIVERIES: 'manage_deliveries',
      CUSTOMER_CHAT: 'customer_chat',
      BASIC_REPORTS: 'basic_reports',

      // Permisos de admin
      MANAGE_PRODUCTS: 'manage_products',
      MANAGE_USERS: 'manage_users',
      VIEW_FULL_REPORTS: 'view_full_reports',
      SYSTEM_CONFIGURATION: 'system_configuration',
      ACCESS_ADMIN_PANEL: 'access_admin_panel',
      SYSTEM_MONITORING: 'system_monitoring',

      // Permisos de owner
      CONFIGURE_ROLES: 'configure_roles',
      MANAGE_ADMINISTRATORS: 'manage_administrators',
      VIEW_FINANCIAL_METRICS: 'view_financial_metrics',
      ADVANCED_CONFIGURATION: 'advanced_configuration',
      BACKUP_RESTORE: 'backup_restore',
      SYSTEM_LOGS: 'system_logs',
    };

    this.roleHierarchy = {
      [this.roles.CLIENTE]: 0,
      [this.roles.TRABAJADOR]: 1,
      [this.roles.ADMIN]: 2,
      [this.roles.OWNER]: 3,
    };

    this.currentUser = null;
    this.userPermissions = [];

    this.init();
  }

  /**
   * Inicializar el manager de roles
   */
  init() {
    this.loadUserFromStorage();
    this.setupEventListeners();
    console.log('🔐 RoleManager inicializado');
  }

  /**
   * Cargar usuario desde localStorage
   */
  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.userPermissions = this.getAllPermissionsForRole(this.currentUser.role);
        console.log(`👤 Usuario cargado: ${this.currentUser.name} (${this.currentUser.role})`);
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      this.currentUser = null;
      this.userPermissions = [];
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Escuchar cambios en el usuario
    window.addEventListener('userChanged', (event) => {
      this.currentUser = event.detail;
      this.userPermissions = this.getAllPermissionsForRole(this.currentUser.role);
      this.updateUI();
    });

    // Escuchar cambios en localStorage
    window.addEventListener('storage', (event) => {
      if (event.key === 'user') {
        this.loadUserFromStorage();
        this.updateUI();
      }
    });
  }

  /**
   * Obtener todos los permisos para un rol (incluyendo jerarquía)
   */
  getAllPermissionsForRole(role) {
    if (!role || !this.roleHierarchy.hasOwnProperty(role)) {
      return [];
    }

    const userLevel = this.roleHierarchy[role];
    const permissionsByRole = {
      [this.roles.CLIENTE]: [
        this.permissions.VIEW_PRODUCTS,
        this.permissions.ADD_TO_CART,
        this.permissions.MAKE_PURCHASE,
        this.permissions.VIEW_OWN_ORDERS,
        this.permissions.EDIT_OWN_PROFILE,
        this.permissions.CREATE_WISHLIST,
        this.permissions.CONTACT_SUPPORT,
      ],
      [this.roles.TRABAJADOR]: [
        this.permissions.VIEW_ALL_ORDERS,
        this.permissions.UPDATE_ORDER_STATUS,
        this.permissions.VIEW_INVENTORY,
        this.permissions.MANAGE_DELIVERIES,
        this.permissions.CUSTOMER_CHAT,
        this.permissions.BASIC_REPORTS,
      ],
      [this.roles.ADMIN]: [
        this.permissions.MANAGE_PRODUCTS,
        this.permissions.MANAGE_USERS,
        this.permissions.VIEW_FULL_REPORTS,
        this.permissions.SYSTEM_CONFIGURATION,
        this.permissions.ACCESS_ADMIN_PANEL,
        this.permissions.SYSTEM_MONITORING,
      ],
      [this.roles.OWNER]: [
        this.permissions.CONFIGURE_ROLES,
        this.permissions.MANAGE_ADMINISTRATORS,
        this.permissions.VIEW_FINANCIAL_METRICS,
        this.permissions.ADVANCED_CONFIGURATION,
        this.permissions.BACKUP_RESTORE,
        this.permissions.SYSTEM_LOGS,
      ],
    };

    let allPermissions = [];

    // Agregar permisos de todos los roles de nivel igual o inferior
    for (const [roleKey, level] of Object.entries(this.roleHierarchy)) {
      if (level <= userLevel && permissionsByRole[roleKey]) {
        allPermissions = [...allPermissions, ...permissionsByRole[roleKey]];
      }
    }

    return [...new Set(allPermissions)]; // Eliminar duplicados
  }

  /**
   * Verificar si el usuario actual tiene un permiso
   */
  hasPermission(permission) {
    return this.userPermissions.includes(permission);
  }

  /**
   * Verificar si el usuario actual tiene un rol mínimo
   */
  hasRole(minimumRole) {
    if (!this.currentUser || !this.currentUser.role) {
      return false;
    }

    const userLevel = this.roleHierarchy[this.currentUser.role];
    const requiredLevel = this.roleHierarchy[minimumRole];

    return userLevel >= requiredLevel;
  }

  /**
   * Verificar si el usuario puede acceder a una ruta
   */
  canAccessRoute(route) {
    if (!this.currentUser) {
      // Rutas públicas que no requieren autenticación
      const publicRoutes = ['/', '/pages/info/', '/pages/legal/', '/pages/auth/', '/index.html'];

      return publicRoutes.some((publicRoute) => route.startsWith(publicRoute));
    }

    const userRole = this.currentUser.role;

    const routePermissions = {
      // Rutas de cliente
      '/pages/shop/': [
        this.roles.CLIENTE,
        this.roles.TRABAJADOR,
        this.roles.ADMIN,
        this.roles.OWNER,
      ],
      '/pages/user/': [
        this.roles.CLIENTE,
        this.roles.TRABAJADOR,
        this.roles.ADMIN,
        this.roles.OWNER,
      ],
      '/pages/wishlist/': [
        this.roles.CLIENTE,
        this.roles.TRABAJADOR,
        this.roles.ADMIN,
        this.roles.OWNER,
      ],

      // Rutas de trabajador
      '/admin-site/worker-tools.html': [this.roles.TRABAJADOR, this.roles.ADMIN, this.roles.OWNER],
      '/pages/worker/': [this.roles.TRABAJADOR, this.roles.ADMIN, this.roles.OWNER],

      // Rutas de admin
      '/pages/admin/': [this.roles.ADMIN, this.roles.OWNER],
      '/admin-panel/': [this.roles.ADMIN, this.roles.OWNER],
      '/admin-site/': [this.roles.ADMIN, this.roles.OWNER],

      // Rutas de owner
      '/admin-site/owner-dashboard.html': [this.roles.OWNER],
      '/pages/owner/': [this.roles.OWNER],
    };

    // Verificar rutas específicas
    for (const [routePattern, allowedRoles] of Object.entries(routePermissions)) {
      if (route.startsWith(routePattern)) {
        return allowedRoles.includes(userRole);
      }
    }

    return true; // Por defecto, permitir acceso (rutas no restringidas)
  }

  /**
   * Obtener información del usuario actual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Obtener rol del usuario actual
   */
  getCurrentRole() {
    return this.currentUser ? this.currentUser.role : null;
  }

  /**
   * Obtener permisos del usuario actual
   */
  getCurrentPermissions() {
    return this.userPermissions;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return !!(token && this.currentUser);
  }

  /**
   * Actualizar la UI basada en roles y permisos
   */
  updateUI() {
    if (!this.currentUser) {
      this.hideAllRoleSpecificElements();
      return;
    }

    const userRole = this.currentUser.role;

    // Mostrar/ocultar elementos basados en roles
    this.toggleElementsByRole('cliente-only', userRole === this.roles.CLIENTE);
    this.toggleElementsByRole('trabajador-only', this.hasRole(this.roles.TRABAJADOR));
    this.toggleElementsByRole('admin-only', this.hasRole(this.roles.ADMIN));
    this.toggleElementsByRole('owner-only', userRole === this.roles.OWNER);

    // Mostrar/ocultar elementos basados en permisos
    Object.values(this.permissions).forEach((permission) => {
      this.toggleElementsByPermission(permission, this.hasPermission(permission));
    });

    // Emitir evento de actualización de UI
    window.dispatchEvent(
      new CustomEvent('roleUIUpdated', {
        detail: {
          user: this.currentUser,
          permissions: this.userPermissions,
        },
      })
    );
  }

  /**
   * Alternar visibilidad de elementos por rol
   */
  toggleElementsByRole(className, show) {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach((element) => {
      element.style.display = show ? '' : 'none';
    });
  }

  /**
   * Alternar visibilidad de elementos por permiso
   */
  toggleElementsByPermission(permission, hasPermission) {
    const elements = document.querySelectorAll(`[data-permission="${permission}"]`);
    elements.forEach((element) => {
      element.style.display = hasPermission ? '' : 'none';
    });
  }

  /**
   * Ocultar todos los elementos específicos de roles
   */
  hideAllRoleSpecificElements() {
    const roleClasses = ['cliente-only', 'trabajador-only', 'admin-only', 'owner-only'];
    roleClasses.forEach((className) => {
      this.toggleElementsByRole(className, false);
    });

    Object.values(this.permissions).forEach((permission) => {
      this.toggleElementsByPermission(permission, false);
    });
  }

  /**
   * Generar menú basado en rol
   */
  generateRoleBasedMenu() {
    if (!this.currentUser) {
      return [];
    }

    const baseMenu = [{ text: 'Inicio', href: '/', permission: null }];

    // Menú para clientes
    if (this.hasRole(this.roles.CLIENTE)) {
      baseMenu.push(
        {
          text: 'Productos',
          href: '/pages/shop/products.html',
          permission: this.permissions.VIEW_PRODUCTS,
        },
        {
          text: 'Mi Perfil',
          href: '/pages/user/profile.html',
          permission: this.permissions.EDIT_OWN_PROFILE,
        },
        {
          text: 'Mis Pedidos',
          href: '/pages/user/orders.html',
          permission: this.permissions.VIEW_OWN_ORDERS,
        },
        {
          text: 'Lista de Deseos',
          href: '/pages/wishlist/wishlist.html',
          permission: this.permissions.CREATE_WISHLIST,
        }
      );
    }

    // Menú para trabajadores
    if (this.hasRole(this.roles.TRABAJADOR)) {
      baseMenu.push(
        {
          text: 'Gestión de Pedidos',
          href: '/admin-site/worker-tools.html',
          permission: this.permissions.VIEW_ALL_ORDERS,
        },
        {
          text: 'Inventario',
          href: '/pages/worker/inventory.html',
          permission: this.permissions.VIEW_INVENTORY,
        }
      );
    }

    // Menú para administradores
    if (this.hasRole(this.roles.ADMIN)) {
      baseMenu.push(
        {
          text: 'Panel de Admin',
          href: '/pages/admin/dashboard.html',
          permission: this.permissions.ACCESS_ADMIN_PANEL,
        },
        {
          text: 'Gestión de Productos',
          href: '/pages/admin/products.html',
          permission: this.permissions.MANAGE_PRODUCTS,
        },
        {
          text: 'Gestión de Usuarios',
          href: '/pages/admin/users.html',
          permission: this.permissions.MANAGE_USERS,
        }
      );
    }

    // Menú para propietarios
    if (this.hasRole(this.roles.OWNER)) {
      baseMenu.push(
        {
          text: 'Dashboard Propietario',
          href: '/admin-site/owner-dashboard.html',
          permission: this.permissions.VIEW_FINANCIAL_METRICS,
        },
        {
          text: 'Configuración Avanzada',
          href: '/pages/owner/settings.html',
          permission: this.permissions.ADVANCED_CONFIGURATION,
        }
      );
    }

    // Filtrar menú por permisos
    return baseMenu.filter((item) => !item.permission || this.hasPermission(item.permission));
  }

  /**
   * Redirigir si no tiene permisos
   */
  redirectIfUnauthorized(requiredRole = null, requiredPermission = null) {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/auth/login.html';
      return true;
    }

    if (requiredRole && !this.hasRole(requiredRole)) {
      this.showUnauthorizedMessage(`Se requiere rol ${requiredRole} o superior`);
      window.location.href = '/';
      return true;
    }

    if (requiredPermission && !this.hasPermission(requiredPermission)) {
      this.showUnauthorizedMessage(`No tienes permiso para realizar esta acción`);
      window.location.href = '/';
      return true;
    }

    return false;
  }

  /**
   * Mostrar mensaje de no autorizado
   */
  showUnauthorizedMessage(message) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = 'role-unauthorized-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
      </div>
    `;

    // Estilos
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    document.body.appendChild(notification);

    // Remover después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Instancia global
const roleManager = new RoleManager();

// Exportar para uso en módulos
export default roleManager;

// También hacer disponible globalmente
window.roleManager = roleManager;
