/**
 * @fileoverview Feature Flags Service
 * @description Sistema de feature flags con rollout gradual
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const crypto = require('crypto');

/**
 * Tipos de rollout
 */
const RolloutType = {
  ALL: 'all', // Todos los usuarios
  NONE: 'none', // Nadie
  PERCENTAGE: 'percentage', // Porcentaje de usuarios
  USER_LIST: 'user_list', // Lista específica de usuarios
  USER_ATTRIBUTE: 'user_attribute', // Basado en atributo del usuario
  GRADUAL: 'gradual', // Rollout gradual por tiempo
};

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  defaultEnabled: false,
  cacheEnabled: true,
  cacheTTL: 60000, // 1 minuto
  refreshInterval: 300000, // 5 minutos
};

/**
 * Feature Flag individual
 */
class FeatureFlag {
  constructor(config) {
    this.name = config.name;
    this.description = config.description || '';
    this.enabled = config.enabled ?? true;
    this.rolloutType = config.rolloutType || RolloutType.ALL;
    this.rolloutConfig = config.rolloutConfig || {};
    this.createdAt = config.createdAt || new Date().toISOString();
    this.updatedAt = config.updatedAt || new Date().toISOString();
    this.metadata = config.metadata || {};
  }

  /**
   * Evalúa si el flag está activo para un usuario
   * @param {Object} context - Contexto del usuario
   * @returns {boolean}
   */
  evaluate(context = {}) {
    if (!this.enabled) {
      return false;
    }

    switch (this.rolloutType) {
      case RolloutType.ALL:
        return true;

      case RolloutType.NONE:
        return false;

      case RolloutType.PERCENTAGE:
        return this._evaluatePercentage(context);

      case RolloutType.USER_LIST:
        return this._evaluateUserList(context);

      case RolloutType.USER_ATTRIBUTE:
        return this._evaluateUserAttribute(context);

      case RolloutType.GRADUAL:
        return this._evaluateGradual(context);

      default:
        return false;
    }
  }

  /**
   * Evalúa por porcentaje (determinístico basado en userId)
   * @private
   */
  _evaluatePercentage(context) {
    const percentage = this.rolloutConfig.percentage || 0;
    if (percentage <= 0) return false;
    if (percentage >= 100) return true;

    // Usar hash del userId para consistencia
    const identifier = context.userId || context.sessionId || context.ip || crypto.randomUUID();
    const hash = crypto.createHash('md5').update(`${this.name}:${identifier}`).digest('hex');
    const bucket = parseInt(hash.slice(0, 8), 16) % 100;

    return bucket < percentage;
  }

  /**
   * Evalúa por lista de usuarios
   * @private
   */
  _evaluateUserList(context) {
    const allowedUsers = this.rolloutConfig.users || [];
    return allowedUsers.includes(context.userId);
  }

  /**
   * Evalúa por atributo del usuario
   * @private
   */
  _evaluateUserAttribute(context) {
    const { attribute, operator, value } = this.rolloutConfig;
    const userValue = context[attribute];

    if (userValue === undefined) return false;

    switch (operator) {
      case 'equals':
        return userValue === value;
      case 'not_equals':
        return userValue !== value;
      case 'contains':
        return String(userValue).includes(value);
      case 'in':
        return Array.isArray(value) && value.includes(userValue);
      case 'greater_than':
        return userValue > value;
      case 'less_than':
        return userValue < value;
      default:
        return false;
    }
  }

  /**
   * Evalúa rollout gradual por tiempo
   * @private
   */
  _evaluateGradual(context) {
    const { startDate, endDate, startPercentage = 0, endPercentage = 100 } = this.rolloutConfig;

    const now = Date.now();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now < start) return false;
    if (now >= end) return this._evaluatePercentage({ ...context, percentage: endPercentage });

    // Calcular porcentaje actual basado en tiempo
    const progress = (now - start) / (end - start);
    const currentPercentage = startPercentage + (endPercentage - startPercentage) * progress;

    return this._evaluatePercentage({
      ...context,
      rolloutConfig: { percentage: currentPercentage },
    });
  }
}

/**
 * Feature Flags Service
 */
class FeatureFlagsService {
  constructor(store, options = {}) {
    this.store = store || new MemoryStore();
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.cache = new Map();
    this.listeners = new Map();

    if (this.config.refreshInterval) {
      this._startRefreshInterval();
    }
  }

  /**
   * Registra un feature flag
   * @param {string} name - Nombre del flag
   * @param {Object} config - Configuración
   */
  async register(name, config = {}) {
    const flag = new FeatureFlag({ name, ...config });
    await this.store.set(`flag:${name}`, flag);
    this._clearCache(name);
    console.info(`[FeatureFlags] Registered flag: ${name}`);
    return flag;
  }

  /**
   * Verifica si un flag está activo
   * @param {string} name - Nombre del flag
   * @param {Object} context - Contexto del usuario
   * @returns {Promise<boolean>}
   */
  async isEnabled(name, context = {}) {
    // Buscar en cache
    const cacheKey = this._getCacheKey(name, context);
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTTL) {
        return cached.value;
      }
    }

    // Obtener flag
    const flagData = await this.store.get(`flag:${name}`);
    if (!flagData) {
      return this.config.defaultEnabled;
    }

    const flag = new FeatureFlag(flagData);
    const result = flag.evaluate(context);

    // Guardar en cache
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, { value: result, timestamp: Date.now() });
    }

    return result;
  }

  /**
   * Obtiene múltiples flags a la vez
   * @param {string[]} names - Nombres de flags
   * @param {Object} context - Contexto
   * @returns {Promise<Object>}
   */
  async getFlags(names, context = {}) {
    const results = {};
    await Promise.all(
      names.map(async (name) => {
        results[name] = await this.isEnabled(name, context);
      })
    );
    return results;
  }

  /**
   * Actualiza un flag
   * @param {string} name - Nombre del flag
   * @param {Object} updates - Actualizaciones
   */
  async update(name, updates) {
    const existing = await this.store.get(`flag:${name}`);
    if (!existing) {
      throw new Error(`Flag ${name} not found`);
    }

    const updated = new FeatureFlag({
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    await this.store.set(`flag:${name}`, updated);
    this._clearCache(name);
    this._notifyListeners(name, updated);

    console.info(`[FeatureFlags] Updated flag: ${name}`);
    return updated;
  }

  /**
   * Habilita un flag
   * @param {string} name - Nombre del flag
   */
  async enable(name) {
    return this.update(name, { enabled: true });
  }

  /**
   * Deshabilita un flag
   * @param {string} name - Nombre del flag
   */
  async disable(name) {
    return this.update(name, { enabled: false });
  }

  /**
   * Configura rollout por porcentaje
   * @param {string} name - Nombre del flag
   * @param {number} percentage - Porcentaje (0-100)
   */
  async setPercentage(name, percentage) {
    return this.update(name, {
      rolloutType: RolloutType.PERCENTAGE,
      rolloutConfig: { percentage: Math.min(100, Math.max(0, percentage)) },
    });
  }

  /**
   * Configura rollout gradual
   * @param {string} name - Nombre del flag
   * @param {Object} gradualConfig - Configuración de rollout gradual
   */
  async setGradualRollout(name, gradualConfig) {
    return this.update(name, {
      rolloutType: RolloutType.GRADUAL,
      rolloutConfig: gradualConfig,
    });
  }

  /**
   * Elimina un flag
   * @param {string} name - Nombre del flag
   */
  async delete(name) {
    await this.store.delete(`flag:${name}`);
    this._clearCache(name);
    console.info(`[FeatureFlags] Deleted flag: ${name}`);
  }

  /**
   * Lista todos los flags
   * @returns {Promise<Array>}
   */
  async list() {
    const keys = await this.store.keys('flag:*');
    const flags = [];

    for (const key of keys) {
      const flag = await this.store.get(key);
      if (flag) flags.push(flag);
    }

    return flags;
  }

  /**
   * Suscribe a cambios de un flag
   * @param {string} name - Nombre del flag
   * @param {Function} callback - Callback
   */
  subscribe(name, callback) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, new Set());
    }
    this.listeners.get(name).add(callback);

    return () => this.listeners.get(name)?.delete(callback);
  }

  /**
   * Middleware Express
   */
  middleware() {
    return async (req, res, next) => {
      req.featureFlags = {
        isEnabled: (name) =>
          this.isEnabled(name, {
            userId: req.user?.id,
            sessionId: req.sessionID,
            ip: req.ip,
            ...req.user,
          }),
        getFlags: (names) =>
          this.getFlags(names, {
            userId: req.user?.id,
            sessionId: req.sessionID,
            ip: req.ip,
            ...req.user,
          }),
      };
      next();
    };
  }

  /**
   * Genera cache key
   * @private
   */
  _getCacheKey(name, context) {
    const contextKey = context.userId || context.sessionId || 'anonymous';
    return `${name}:${contextKey}`;
  }

  /**
   * Limpia cache de un flag
   * @private
   */
  _clearCache(name) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${name}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Notifica a listeners
   * @private
   */
  _notifyListeners(name, flag) {
    const callbacks = this.listeners.get(name);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(flag);
        } catch (error) {
          console.error('[FeatureFlags] Listener error:', error);
        }
      }
    }
  }

  /**
   * Inicia intervalo de refresh
   * @private
   */
  _startRefreshInterval() {
    this._refreshTimer = setInterval(() => {
      this.cache.clear();
    }, this.config.refreshInterval);
  }

  /**
   * Detiene el servicio
   */
  stop() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
    }
  }
}

/**
 * Memory Store (para desarrollo)
 */
class MemoryStore {
  constructor() {
    this.data = new Map();
  }

  async set(key, value) {
    this.data.set(key, value);
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async delete(key) {
    this.data.delete(key);
  }

  async keys(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return [...this.data.keys()].filter((k) => regex.test(k));
  }
}

module.exports = {
  FeatureFlagsService,
  FeatureFlag,
  MemoryStore,
  RolloutType,
  DEFAULT_CONFIG,
};
