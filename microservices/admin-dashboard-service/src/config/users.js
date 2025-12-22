/**
 * Sistema de gestión de usuarios con bcrypt
 * Reemplaza las contraseñas hardcodeadas por un sistema seguro
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

// Roles del sistema
const ROLES = {
  ADMIN: 'admin',
  WORKER: 'worker',
  VIEWER: 'viewer',
};

// Permisos por rol
const ROLE_PERMISSIONS = {
  admin: [
    'read',
    'write',
    'delete',
    'manage_users',
    'manage_settings',
    'manage_products',
    'manage_orders',
    'manage_inventory',
    'view_reports',
    'export_data',
  ],
  worker: ['read', 'write', 'manage_products', 'manage_orders', 'manage_inventory', 'view_reports'],
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
 * En producción, las contraseñas deben venir de variables de entorno
 */
async function initializeUsers() {
  const adminPassword = process.env.ADMIN_PASSWORD || 'dev_admin_temp_123';
  const workerPassword = process.env.WORKER_MARIA_PASSWORD || 'dev_worker_temp_123';
  const viewerPassword = process.env.VIEWER_CARLOS_PASSWORD || 'dev_viewer_temp_123';

  // Advertencia si se usan contraseñas de desarrollo
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  ADMIN_PASSWORD no configurada. Usando contraseña temporal de desarrollo.');
  }

  users = [
    {
      id: 1,
      username: 'admin',
      name: 'Administrador',
      email: 'admin@floresvictoria.com',
      role: ROLES.ADMIN,
      permissions: ROLE_PERMISSIONS.admin,
      passwordHash: await hashPassword(adminPassword),
      phone: '+52 555 123 4567',
      avatar: '/assets/avatars/admin.png',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      username: 'maria',
      name: 'María García',
      email: 'maria@floresvictoria.com',
      role: ROLES.WORKER,
      permissions: ROLE_PERMISSIONS.worker,
      passwordHash: await hashPassword(workerPassword),
      phone: '+52 555 234 5678',
      avatar: '/assets/avatars/maria.png',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      username: 'carlos',
      name: 'Carlos López',
      email: 'carlos@floresvictoria.com',
      role: ROLES.VIEWER,
      permissions: ROLE_PERMISSIONS.viewer,
      passwordHash: await hashPassword(viewerPassword),
      phone: '+52 555 345 6789',
      avatar: '/assets/avatars/carlos.png',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

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
