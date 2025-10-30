/**
 * Utilidades compartidas para Health Checks
 * Soporta liveness y readiness checks con verificación de dependencias
 */

/**
 * Verifica la conexión a MongoDB
 * @param {Object} mongoose - Instancia de mongoose
 * @returns {Promise<Object>} { status, latency, error }
 */
async function checkDatabase(mongoose) {
  const start = Date.now();
  try {
    if (!mongoose || !mongoose.connection) {
      return { status: 'unavailable', error: 'No mongoose instance' };
    }

    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    if (state === 1) {
      // Ping rápido para verificar latencia
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        state: states[state],
        latency: Date.now() - start,
      };
    }

    return {
      status: 'unhealthy',
      state: states[state] || 'unknown',
      error: 'Database not connected',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      latency: Date.now() - start,
    };
  }
}

/**
 * Verifica la conexión a Redis
 * @param {Object} redisClient - Cliente de Redis
 * @returns {Promise<Object>} { status, latency, error }
 */
async function checkRedis(redisClient) {
  const start = Date.now();
  try {
    if (!redisClient) {
      return { status: 'unavailable', error: 'No Redis client' };
    }

    // Intentar PING
    const reply = await new Promise((resolve, reject) => {
      redisClient.ping((err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    if (reply === 'PONG') {
      return {
        status: 'healthy',
        latency: Date.now() - start,
      };
    }

    return {
      status: 'unhealthy',
      error: 'Unexpected response',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      latency: Date.now() - start,
    };
  }
}

/**
 * Verifica un servicio HTTP externo
 * @param {string} url - URL del servicio
 * @param {number} timeout - Timeout en ms (default: 3000)
 * @returns {Promise<Object>} { status, latency, statusCode, error }
 */
async function checkHttp(url, timeout = 3000) {
  const start = Date.now();
  try {
    const https = url.startsWith('https') ? require('https') : require('http');
    const urlObj = new URL(url);

    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        req.destroy();
        reject(new Error('Timeout'));
      }, timeout);

      const req = https.get(
        {
          hostname: urlObj.hostname,
          port: urlObj.port,
          path: urlObj.pathname + urlObj.search,
          timeout,
        },
        (res) => {
          clearTimeout(timer);
          res.resume(); // consume response
          const latency = Date.now() - start;

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: 'healthy', statusCode: res.statusCode, latency });
          } else {
            resolve({
              status: 'unhealthy',
              statusCode: res.statusCode,
              latency,
              error: `HTTP ${res.statusCode}`,
            });
          }
        }
      );

      req.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      latency: Date.now() - start,
    };
  }
}

/**
 * Información de memoria
 * @returns {Object} { used, total, percentage }
 */
function getMemoryInfo() {
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    rss: Math.round(usage.rss / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024),
  };
}

/**
 * Crea respuesta de liveness (básico: ¿está vivo el proceso?)
 * @param {string} serviceName - Nombre del servicio
 * @param {Object} extraData - Datos adicionales opcionales
 * @returns {Object} Respuesta liveness
 */
function createLivenessResponse(serviceName, extraData = {}) {
  return {
    status: 'healthy',
    service: serviceName,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    ...extraData,
  };
}

/**
 * Crea respuesta de readiness (¿puede recibir tráfico?)
 * @param {string} serviceName - Nombre del servicio
 * @param {Object} checks - Resultado de checks de dependencias
 * @returns {Object} Respuesta readiness con status general
 */
function createReadinessResponse(serviceName, checks = {}) {
  const allHealthy = Object.values(checks).every(
    (check) => check.status === 'healthy' || check.status === 'ok'
  );

  return {
    status: allHealthy ? 'ready' : 'not_ready',
    service: serviceName,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks,
    memory: getMemoryInfo(),
  };
}

module.exports = {
  checkDatabase,
  checkRedis,
  checkHttp,
  getMemoryInfo,
  createLivenessResponse,
  createReadinessResponse,
};
