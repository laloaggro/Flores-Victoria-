/**
 * @fileoverview Cache Warming Service
 * @description Pre-carga datos frecuentes en Redis al iniciar
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  warmupOnStart: true,
  batchSize: 50,
  concurrency: 3,
  defaultTTL: 3600, // 1 hora
  logProgress: true,
};

/**
 * Cache Warmer Service
 */
class CacheWarmer {
  constructor(cacheClient, options = {}) {
    this.cache = cacheClient;
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.warmupTasks = new Map();
    this.stats = {
      tasksRegistered: 0,
      itemsWarmed: 0,
      errors: 0,
      lastWarmup: null,
      duration: 0,
    };
  }

  /**
   * Registra una tarea de warmup
   * @param {string} name - Nombre de la tarea
   * @param {Object} task - Configuración de la tarea
   */
  registerTask(name, task) {
    if (!task.fetcher || typeof task.fetcher !== 'function') {
      throw new Error('Task must have a fetcher function');
    }

    this.warmupTasks.set(name, {
      name,
      fetcher: task.fetcher,
      keyGenerator: task.keyGenerator || ((item) => `${name}:${item.id}`),
      ttl: task.ttl || this.config.defaultTTL,
      priority: task.priority || 0,
      enabled: task.enabled !== false,
      transformer: task.transformer || ((item) => item),
      condition: task.condition || (() => true),
    });

    this.stats.tasksRegistered++;
    console.info(`[CacheWarmer] Registered task: ${name}`);
  }

  /**
   * Ejecuta el warmup de todas las tareas
   * @returns {Promise<Object>} Resultado del warmup
   */
  async warmup() {
    const startTime = Date.now();
    console.info('[CacheWarmer] Starting cache warmup...');

    const results = {
      successful: [],
      failed: [],
      skipped: [],
    };

    // Ordenar por prioridad
    const sortedTasks = [...this.warmupTasks.values()].sort((a, b) => b.priority - a.priority);

    // Ejecutar en lotes según concurrencia
    const batches = this._chunkArray(sortedTasks, this.config.concurrency);

    for (const batch of batches) {
      const batchResults = await Promise.allSettled(batch.map((task) => this._executeTask(task)));

      batchResults.forEach((result, index) => {
        const task = batch[index];
        if (result.status === 'fulfilled') {
          results.successful.push({
            name: task.name,
            itemsWarmed: result.value.count,
          });
        } else {
          results.failed.push({
            name: task.name,
            error: result.reason?.message,
          });
          this.stats.errors++;
        }
      });
    }

    const duration = Date.now() - startTime;
    this.stats.lastWarmup = new Date().toISOString();
    this.stats.duration = duration;

    console.info(`[CacheWarmer] Warmup completed in ${duration}ms`, {
      successful: results.successful.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
    });

    return results;
  }

  /**
   * Ejecuta una tarea individual
   * @private
   */
  async _executeTask(task) {
    if (!task.enabled) {
      return { count: 0, skipped: true };
    }

    if (!task.condition()) {
      console.info(`[CacheWarmer] Skipping ${task.name}: condition not met`);
      return { count: 0, skipped: true };
    }

    console.info(`[CacheWarmer] Warming: ${task.name}`);
    let warmedCount = 0;

    try {
      // Obtener datos
      const items = await task.fetcher();

      if (!Array.isArray(items)) {
        throw new Error('Fetcher must return an array');
      }

      // Procesar en lotes
      const batches = this._chunkArray(items, this.config.batchSize);

      for (const batch of batches) {
        await Promise.all(
          batch.map(async (item) => {
            try {
              const key = task.keyGenerator(item);
              const value = task.transformer(item);
              await this.cache.set(key, JSON.stringify(value), 'EX', task.ttl);
              warmedCount++;
              this.stats.itemsWarmed++;
            } catch (error) {
              console.error(`[CacheWarmer] Error caching item:`, error.message);
            }
          })
        );

        if (this.config.logProgress) {
          console.info(`[CacheWarmer] ${task.name}: ${warmedCount}/${items.length} items warmed`);
        }
      }

      return { count: warmedCount };
    } catch (error) {
      console.error(`[CacheWarmer] Task ${task.name} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Warm específico para un item
   * @param {string} taskName - Nombre de la tarea
   * @param {Object} item - Item a cachear
   */
  async warmItem(taskName, item) {
    const task = this.warmupTasks.get(taskName);
    if (!task) {
      throw new Error(`Task ${taskName} not found`);
    }

    const key = task.keyGenerator(item);
    const value = task.transformer(item);
    await this.cache.set(key, JSON.stringify(value), 'EX', task.ttl);
    console.info(`[CacheWarmer] Warmed single item: ${key}`);
  }

  /**
   * Invalida cache de una tarea
   * @param {string} taskName - Nombre de la tarea
   * @param {string} [pattern] - Patrón de keys a invalidar
   */
  async invalidate(taskName, pattern) {
    const keyPattern = pattern || `${taskName}:*`;
    const keys = await this.cache.keys(keyPattern);

    if (keys.length > 0) {
      await this.cache.del(...keys);
      console.info(`[CacheWarmer] Invalidated ${keys.length} keys for ${taskName}`);
    }

    return keys.length;
  }

  /**
   * Obtiene estadísticas
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Helper para dividir array en chunks
   * @private
   */
  _chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Factory para crear CacheWarmer con tareas comunes de e-commerce
 * @param {Object} cache - Cliente de cache
 * @param {Object} repositories - Repositorios de datos
 */
const createEcommerceCacheWarmer = (cache, repositories) => {
  const warmer = new CacheWarmer(cache);

  // Productos populares
  if (repositories.products) {
    warmer.registerTask('popular-products', {
      priority: 10,
      ttl: 1800, // 30 min
      fetcher: async () => {
        return repositories.products.findPopular({ limit: 100 });
      },
      keyGenerator: (product) => `product:${product.id}`,
    });
  }

  // Categorías
  if (repositories.categories) {
    warmer.registerTask('categories', {
      priority: 9,
      ttl: 3600, // 1 hora
      fetcher: async () => {
        return repositories.categories.findAll();
      },
      keyGenerator: (cat) => `category:${cat.id}`,
    });
  }

  // Configuraciones
  if (repositories.settings) {
    warmer.registerTask('settings', {
      priority: 8,
      ttl: 7200, // 2 horas
      fetcher: async () => {
        const settings = await repositories.settings.getAll();
        return [settings]; // Wrap en array
      },
      keyGenerator: () => 'app:settings',
    });
  }

  // Banners activos
  if (repositories.banners) {
    warmer.registerTask('banners', {
      priority: 7,
      ttl: 1800,
      fetcher: async () => {
        return repositories.banners.findActive();
      },
      keyGenerator: (banner) => `banner:${banner.id}`,
    });
  }

  return warmer;
};

module.exports = {
  CacheWarmer,
  createEcommerceCacheWarmer,
  DEFAULT_CONFIG,
};
