// Configuración del servicio de usuarios
const config = {
  port: process.env.PORT || 3003,
  database: {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    name: process.env.POSTGRES_DB || process.env.DB_NAME || 'flores_db',
    user: process.env.POSTGRES_USER || process.env.DB_USER || 'flores_user',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana
  },
  // Configuración de caché
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true' || true,
    ttl: process.env.CACHE_TTL || 300, // 5 minutos en segundos
  },
  // Configuración de timeouts
  timeouts: {
    request: parseInt(process.env.REQUEST_TIMEOUT) || 30000, // 30 segundos
    connection: parseInt(process.env.CONNECTION_TIMEOUT) || 10000, // 10 segundos
  },
  // Configuración de salud del servicio
  health: {
    checkDatabase: process.env.HEALTH_CHECK_DB === 'true' || true,
    checkInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 segundos
  }
};

// Mostrar variables de entorno relevantes para depuración
console.log('Variables de entorno relevantes:');
console.log('- PORT:', process.env.PORT || 'no definido (usando valor por defecto: 3003)');
console.log('- DB_HOST:', process.env.DB_HOST || 'no definido (usando valor por defecto: postgres)');
console.log('- DB_PORT:', process.env.DB_PORT || 'no definido (usando valor por defecto: 5432)');
console.log('- POSTGRES_DB:', process.env.POSTGRES_DB || 'no definido');
console.log('- DB_NAME:', process.env.DB_NAME || 'no definido');
console.log('- POSTGRES_USER:', process.env.POSTGRES_USER || 'no definido');
console.log('- DB_USER:', process.env.DB_USER || 'no definido');
console.log('- POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? 'definido' : 'no definido');
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? 'definido' : 'no definido');

// Validación de configuración crítica
if (!config.database.name) {
  console.error('Error E001: No se encontró POSTGRES_DB ni DB_NAME. La base de datos debe estar configurada.');
  process.exit(1);
}

if (!config.database.user) {
  console.error('Error E002: No se encontró POSTGRES_USER ni DB_USER. El usuario de base de datos debe estar configurado.');
  process.exit(1);
}

// La contraseña se validará cuando se intente conectar a la base de datos

module.exports = config;