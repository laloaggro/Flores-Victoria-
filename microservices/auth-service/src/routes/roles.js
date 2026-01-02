/**
 * @fileoverview Rutas de gestión de roles y permisos
 * Solo accesibles por administradores
 */

const express = require('express');
const { asyncHandler } = require('@flores-victoria/shared/middleware/error-handler');
const { db } = require('../config/database');
const {
  ROLES,
  PERMISSIONS,
  normalizeRole,
  getPermissions,
  getRoleInfo,
  getValidRoles,
  isValidRole,
  canManageRole,
} = require('@flores-victoria/shared/config/roles');
const { createAuditService, AUDIT_EVENTS } = require('@flores-victoria/shared/services/auditService');

const router = express.Router();

// Inicializar servicio de auditoría
const auditService = createAuditService({ serviceName: 'auth-service' });

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE AUTORIZACIÓN (inline para auth-service)
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario sea administrador
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' },
    });
  }
  
  const userRole = normalizeRole(req.user.role);
  if (userRole !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Se requiere rol de administrador' },
    });
  }
  
  next();
};

/**
 * Verifica que el usuario sea manager o admin
 */
const requireManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' },
    });
  }
  
  const userRole = normalizeRole(req.user.role);
  if (userRole !== ROLES.ADMIN && userRole !== ROLES.MANAGER) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Se requiere rol de gerente o administrador' },
    });
  }
  
  next();
};

// ═══════════════════════════════════════════════════════════════
// ENDPOINTS DE ROLES
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Listar todos los roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 */
router.get(
  '/',
  requireManager,
  asyncHandler(async (req, res) => {
    const result = await db.query(`
      SELECT r.*, 
        (SELECT COUNT(*) FROM auth_users WHERE role = r.name) as user_count,
        (SELECT COUNT(*) FROM role_permissions WHERE role_id = r.id) as permission_count
      FROM roles r
      WHERE r.is_active = true
      ORDER BY r.hierarchy_level ASC
    `);

    res.json({
      success: true,
      data: result.rows.map(role => ({
        ...role,
        user_count: parseInt(role.user_count, 10),
        permission_count: parseInt(role.permission_count, 10),
      })),
    });
  })
);

/**
 * @swagger
 * /roles/{name}:
 *   get:
 *     summary: Obtener un rol específico con sus permisos
 *     tags: [Roles]
 */
router.get(
  '/:name',
  requireManager,
  asyncHandler(async (req, res) => {
    const { name } = req.params;

    const roleResult = await db.query(
      'SELECT * FROM roles WHERE name = $1 AND is_active = true',
      [name]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rol no encontrado' },
      });
    }

    const role = roleResult.rows[0];

    // Obtener permisos del rol
    const permissionsResult = await db.query(`
      SELECT p.name, p.display_name, p.description, p.resource, p.action
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.resource, p.action
    `, [role.id]);

    // Obtener usuarios con este rol
    const usersResult = await db.query(`
      SELECT id, username, email, created_at
      FROM auth_users
      WHERE role = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [name]);

    res.json({
      success: true,
      data: {
        ...role,
        permissions: permissionsResult.rows,
        recent_users: usersResult.rows,
        total_users: await db.query(
          'SELECT COUNT(*) FROM auth_users WHERE role = $1',
          [name]
        ).then(r => parseInt(r.rows[0].count, 10)),
      },
    });
  })
);

// ═══════════════════════════════════════════════════════════════
// ENDPOINTS DE PERMISOS
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /roles/permissions/all:
 *   get:
 *     summary: Listar todos los permisos disponibles
 *     tags: [Roles]
 */
router.get(
  '/permissions/all',
  requireManager,
  asyncHandler(async (req, res) => {
    const result = await db.query(`
      SELECT p.*, 
        ARRAY_AGG(DISTINCT r.name) as assigned_roles
      FROM permissions p
      LEFT JOIN role_permissions rp ON p.id = rp.permission_id
      LEFT JOIN roles r ON rp.role_id = r.id
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY p.resource, p.action
    `);

    // Agrupar por recurso
    const grouped = result.rows.reduce((acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        permissions: result.rows,
        grouped: grouped,
        total: result.rows.length,
      },
    });
  })
);

// ═══════════════════════════════════════════════════════════════
// GESTIÓN DE ROLES DE USUARIOS
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /roles/users:
 *   get:
 *     summary: Listar usuarios con sus roles
 *     tags: [Roles]
 */
router.get(
  '/users',
  requireManager,
  asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (role) {
      whereClause += ` AND u.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (u.username ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM auth_users u ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const result = await db.query(`
      SELECT u.id, u.username, u.email, u.role, u.created_at, u.updated_at,
        r.display_name as role_display_name, r.color as role_color
      FROM auth_users u
      LEFT JOIN roles r ON u.role = r.name
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    res.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

/**
 * @swagger
 * /roles/users/{userId}:
 *   patch:
 *     summary: Cambiar rol de un usuario
 *     tags: [Roles]
 */
router.patch(
  '/users/:userId',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = req.user.userId || req.user.id;

    // Validar rol
    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'INVALID_ROLE', 
          message: `Rol inválido. Roles válidos: ${getValidRoles().join(', ')}` 
        },
      });
    }

    // No permitir modificar el propio rol
    if (userId.toString() === adminId.toString()) {
      return res.status(400).json({
        success: false,
        error: { code: 'SELF_MODIFICATION', message: 'No puedes modificar tu propio rol' },
      });
    }

    // Obtener usuario objetivo
    const userResult = await db.query(
      'SELECT id, username, email, role FROM auth_users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' },
      });
    }

    const targetUser = userResult.rows[0];
    const adminRole = normalizeRole(req.user.role);

    // Verificar que puede gestionar el rol actual del usuario
    if (!canManageRole(adminRole, targetUser.role)) {
      return res.status(403).json({
        success: false,
        error: { 
          code: 'CANNOT_MANAGE', 
          message: 'No tienes permiso para modificar usuarios con este rol' 
        },
      });
    }

    // Verificar que puede asignar el nuevo rol
    if (!canManageRole(adminRole, role) && role !== ROLES.CUSTOMER) {
      return res.status(403).json({
        success: false,
        error: { 
          code: 'CANNOT_ASSIGN', 
          message: 'No tienes permiso para asignar este rol' 
        },
      });
    }

    // Actualizar rol
    const normalizedRole = normalizeRole(role);
    await db.query(
      'UPDATE auth_users SET role = $1, updated_at = NOW() WHERE id = $2',
      [normalizedRole, userId]
    );

    // Log de auditoría
    console.log(`[ROLES] Admin ${adminId} changed role of user ${userId} from ${targetUser.role} to ${normalizedRole}`);
    
    // Audit trail del cambio de rol
    auditService.logRoleChange(
      adminId,
      req.user.email || req.user.username,
      userId,
      targetUser.role,
      normalizedRole,
      { targetEmail: targetUser.email, targetUsername: targetUser.username }
    );

    res.json({
      success: true,
      message: `Rol actualizado a ${getRoleInfo(normalizedRole).name}`,
      data: {
        userId: parseInt(userId, 10),
        previousRole: targetUser.role,
        newRole: normalizedRole,
        roleInfo: getRoleInfo(normalizedRole),
      },
    });
  })
);

// ═══════════════════════════════════════════════════════════════
// ESTADÍSTICAS
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /roles/stats:
 *   get:
 *     summary: Estadísticas de roles
 *     tags: [Roles]
 */
router.get(
  '/stats',
  requireManager,
  asyncHandler(async (req, res) => {
    const roleStats = await db.query(`
      SELECT 
        r.name,
        r.display_name,
        r.color,
        COUNT(u.id) as user_count
      FROM roles r
      LEFT JOIN auth_users u ON u.role = r.name
      WHERE r.is_active = true
      GROUP BY r.id, r.name, r.display_name, r.color
      ORDER BY r.hierarchy_level
    `);

    const totalUsers = await db.query('SELECT COUNT(*) FROM auth_users');
    const recentChanges = await db.query(`
      SELECT id, username, email, role, updated_at
      FROM auth_users
      WHERE updated_at > NOW() - INTERVAL '7 days'
      ORDER BY updated_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        roles: roleStats.rows.map(r => ({
          ...r,
          user_count: parseInt(r.user_count, 10),
        })),
        total_users: parseInt(totalUsers.rows[0].count, 10),
        recent_role_changes: recentChanges.rows,
      },
    });
  })
);

// ═══════════════════════════════════════════════════════════════
// ENDPOINTS PÚBLICOS (info de roles disponibles)
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /roles/info:
 *   get:
 *     summary: Información pública de roles (para UI)
 *     tags: [Roles]
 */
router.get(
  '/info',
  asyncHandler(async (req, res) => {
    const roles = getValidRoles().map(role => ({
      name: role,
      ...getRoleInfo(role),
    }));

    res.json({
      success: true,
      data: roles,
    });
  })
);

/**
 * @swagger
 * /roles/my-permissions:
 *   get:
 *     summary: Obtener permisos del usuario actual
 *     tags: [Roles]
 */
router.get(
  '/my-permissions',
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' },
      });
    }

    const userRole = normalizeRole(req.user.role);
    const permissions = getPermissions(userRole);
    const roleInfo = getRoleInfo(userRole);

    res.json({
      success: true,
      data: {
        role: userRole,
        roleInfo,
        permissions,
        permissionCount: permissions.length,
      },
    });
  })
);

module.exports = router;
