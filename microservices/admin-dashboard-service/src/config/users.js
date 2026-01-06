/**
 * Sistema de gestión de usuarios con bcrypt
 * Reemplaza las contraseñas hardcodeadas por un sistema seguro
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

// Roles del sistema (5 niveles)
const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  WORKER: 'worker',
  VIEWER: 'viewer',
};

// Permisos por rol (granular)
const ROLE_PERMISSIONS = {
  superadmin: [
    'read', 'write', 'delete',
    'manage_users', 'manage_roles', 'manage_settings', 'manage_system',
    'manage_products', 'manage_orders', 'manage_inventory', 'manage_customers',
    'view_reports', 'export_data', 'view_analytics', 'manage_promotions',
    'manage_notifications', 'view_logs', 'manage_backups',
  ],
  admin: [
    'read', 'write', 'delete',
    'manage_users', 'manage_settings',
    'manage_products', 'manage_orders', 'manage_inventory', 'manage_customers',
    'view_reports', 'export_data', 'view_analytics', 'manage_promotions',
  ],
  manager: [
    'read', 'write',
    'manage_products', 'manage_orders', 'manage_inventory',
    'view_reports', 'view_analytics',
  ],
  worker: [
    'read', 'write',
    'manage_orders', 'manage_inventory',
    'view_reports',
  ],
  viewer: ['read', 'view_reports'],
};

// Almacén de usuarios (en memoria - en producción usar base de datos)
let users = [];

/**
 * Hash de contraseña con bcrypt
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Comparar contraseña con hash
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Inicializar usuarios del sistema
 * Incluye usuarios de ejemplo para cada rol (desarrollo)
 * En producción, las contraseñas deben venir de variables de entorno
 */
async function initializeUsers() {
  // Contraseñas de desarrollo (CAMBIAR EN PRODUCCIÓN)
  const devPassword = 'demo123';
  
  // Contraseñas desde variables de entorno (producción)
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || devPassword;
  const adminPassword = process.env.ADMIN_PASSWORD || devPassword;
  const managerPassword = process.env.MANAGER_PASSWORD || devPassword;
  const workerPassword = process.env.WORKER_PASSWORD || devPassword;
  const viewerPassword = process.env.VIEWER_PASSWORD || devPassword;

  // Advertencia si se usan contraseñas de desarrollo
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  Usando contraseñas de desarrollo. Configurar variables de entorno en producción.');
  }

  users = [
    // === SUPERADMIN ===
    {
      id: 1,
      username: 'superadmin',
      name: 'Super Administrador',
      email: 'super@floresvictoria.com',
      role: ROLES.SUPERADMIN,
      permissions: ROLE_PERMISSIONS.superadmin,
      passwordHash: await hashPassword(superadminPassword),
      phone: '+52 555 000 0001',
      avatar: '/assets/avatars/superadmin.png',
      active: true,
      createdAt: new Date().toISOString(),
    },
    // === ADMIN ===
    {
      id: 2,
      username: 'admin',
      name: 'Victoria Flores',
      email: 'admin@floresvictoria.com',
      role: ROLES.ADMIN,
      permissions: ROLE_PERMISSIONS.admin,
      passwordHash: await hashPassword(adminPassword),
      phone: '+52 555 123 4567',
      avatar: '/assets/avatars/admin.png',
      active: true,
      createdAt: new Date().toISOString(),
    },
    // === MANAGER ===
    {
      id: 3,
      username: 'manager',
      name: 'Roberto Martínez',
      email: 'manager@floresvictoria.com',
      role: ROLES.MANAGER,
      permissions: ROLE_PERMISSIONS.manager,
      passwordHash: await hashPassword(managerPassword),
      phone: '+52 555 234 5678',
      avatar: '/assets/avatars/manager.png',
      active: true,
      createdAt: new Date().toISOString(),
    },
    // === WORKER ===
    {
      id: 4,
      username: 'worker',
      name: 'María García',
      email: 'worker@floresvictoria.com',
      role: ROLES.WORKER,
      permissions: ROLE_PERMISSIONS.worker,
      passwordHash: await hashPassword(workerPassword),
      phone: '+52 555 345 6789',
      avatar: '/assets/avatars/worker.png',
      active: true,
      createdAt: new Date().toISOString(),
    },
    // === VIEWER ===
    {
      id: 5,
      username: 'viewer',
      name: 'Carlos López',
      email: 'viewer@floresvictoria.com',
      role: ROLES.VIEWER,
      permissions: ROLE_PERMISSIONS.viewer,
      passwordHash: await hashPassword(viewerPassword),
      phone: '+52 555 456 7890',
      avatar: '/assets/avatars/viewer.png',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  console.log('✅ Usuarios inicializados:', users.map(u => `${u.username} (${u.role})`).join(', '));
  return users;
}

/**
 * Obtener todos los usuarios (sin passwordHash)
 */
async function getUsers() {
  return users.map(({ passwordHash: _hash, ...user }) => user);
}

/**
 * Buscar usuario por username o email
 */
async function findUser(identifier) {
  return users.find((u) => u.username === identifier || u.email === identifier);
}

/**
 * Buscar usuario por ID
 */
async function findUserById(id) {
  return users.find((u) => u.id === id);
}

/**
 * Validar credenciales de usuario
 * @returns Usuario sin passwordHash si es válido, null si no
 */
async function validateCredentials(identifier, password) {
  const user = await findUser(identifier);
  if (!user) return null;

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) return null;

  // Retornar usuario sin el hash
  // eslint-disable-next-line no-unused-vars
  const { passwordHash: _hash, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  hashPassword,
  comparePassword,
  initializeUsers,
  getUsers,
  findUser,
  findUserById,
  validateCredentials,
};
