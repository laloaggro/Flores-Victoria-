const express = require('express');
const { 
  ROLES, 
  PERMISSIONS, 
  getAllPermissionsForRole, 
  hasPermission,
  canAccessRoute,
  authAndAuthorize
} = require('../middleware/roles');

const router = express.Router();

/**
 * GET /api/roles - Obtener información sobre roles del sistema
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      roles: ROLES,
      permissions: PERMISSIONS,
      description: {
        [ROLES.CLIENTE]: 'Cliente del sistema con permisos básicos de compra',
        [ROLES.TRABAJADOR]: 'Empleado con permisos para gestionar pedidos y entregas',
        [ROLES.ADMIN]: 'Administrador con permisos completos de gestión',
        [ROLES.OWNER]: 'Propietario con acceso total al sistema'
      }
    }
  });
});

/**
 * GET /api/roles/permissions/:role - Obtener permisos de un rol específico
 */
router.get('/permissions/:role', (req, res) => {
  const { role } = req.params;
  
  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Rol inválido',
      validRoles: Object.values(ROLES)
    });
  }

  const permissions = getAllPermissionsForRole(role);
  
  res.json({
    success: true,
    data: {
      role,
      permissions,
      count: permissions.length
    }
  });
});

/**
 * POST /api/roles/check-permission - Verificar si un usuario tiene un permiso
 */
router.post('/check-permission', ...authAndAuthorize(), (req, res) => {
  const { permission, route } = req.body;
  const userRole = req.user.role;

  const result = {
    user: {
      id: req.user.id,
      role: userRole
    },
    checks: {}
  };

  // Verificar permiso específico si se proporciona
  if (permission) {
    result.checks.permission = {
      requested: permission,
      granted: hasPermission(userRole, permission)
    };
  }

  // Verificar acceso a ruta si se proporciona
  if (route) {
    result.checks.route = {
      requested: route,
      granted: canAccessRoute(userRole, route)
    };
  }

  res.json({
    success: true,
    data: result
  });
});

/**
 * GET /api/roles/my-permissions - Obtener permisos del usuario actual
 */
router.get('/my-permissions', ...authAndAuthorize(), (req, res) => {
  const userRole = req.user.role;
  const permissions = getAllPermissionsForRole(userRole);
  
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: userRole
      },
      permissions,
      permissionCount: permissions.length
    }
  });
});

/**
 * POST /api/roles/validate-access - Validar acceso a múltiples rutas/permisos
 */
router.post('/validate-access', ...authAndAuthorize(), (req, res) => {
  const { routes = [], permissions = [] } = req.body;
  const userRole = req.user.role;

  const validation = {
    user: {
      id: req.user.id,
      role: userRole
    },
    routes: {},
    permissions: {},
    summary: {
      routesChecked: routes.length,
      routesGranted: 0,
      permissionsChecked: permissions.length,
      permissionsGranted: 0
    }
  };

  // Validar rutas
  routes.forEach(route => {
    const granted = canAccessRoute(userRole, route);
    validation.routes[route] = granted;
    if (granted) validation.summary.routesGranted++;
  });

  // Validar permisos
  permissions.forEach(permission => {
    const granted = hasPermission(userRole, permission);
    validation.permissions[permission] = granted;
    if (granted) validation.summary.permissionsGranted++;
  });

  res.json({
    success: true,
    data: validation
  });
});

/**
 * GET /api/roles/hierarchy - Obtener jerarquía de roles
 */
router.get('/hierarchy', (req, res) => {
  const hierarchy = [
    { role: ROLES.CLIENTE, level: 0, description: 'Cliente básico' },
    { role: ROLES.TRABAJADOR, level: 1, description: 'Empleado operativo' },
    { role: ROLES.ADMIN, level: 2, description: 'Administrador del sistema' },
    { role: ROLES.OWNER, level: 3, description: 'Propietario del negocio' }
  ];

  res.json({
    success: true,
    data: {
      hierarchy,
      note: 'Cada nivel incluye permisos de niveles inferiores'
    }
  });
});

module.exports = router;