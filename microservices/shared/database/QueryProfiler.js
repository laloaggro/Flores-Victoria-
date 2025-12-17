/**
 * @fileoverview Database Query Profiler
 * @description Profiler de queries con análisis y alertas
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  slowQueryThreshold: 100, // ms
  verySlowQueryThreshold: 1000, // ms
  criticalQueryThreshold: 5000, // ms
  enableExplainAnalyze: process.env.NODE_ENV !== 'production',
  maxQueryHistory: 1000,
  alertOnSlowQuery: true,
  logQueries: process.env.NODE_ENV !== 'production',
};

/**
 * Niveles de severidad
 */
const Severity = {
  OK: 'ok',
  SLOW: 'slow',
  VERY_SLOW: 'very_slow',
  CRITICAL: 'critical',
};

/**
 * Query Profiler
 */
class QueryProfiler {
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.queryHistory = [];
    this.slowQueries = [];
    this.stats = {
      totalQueries: 0,
      totalDuration: 0,
      slowQueries: 0,
      verySlowQueries: 0,
      criticalQueries: 0,
      avgDuration: 0,
      maxDuration: 0,
    };
    this.alertHandlers = [];
  }

  /**
   * Registra un handler de alertas
   * @param {Function} handler - Handler de alertas
   */
  onAlert(handler) {
    if (typeof handler === 'function') {
      this.alertHandlers.push(handler);
    }
  }

  /**
   * Perfila una query
   * @param {string} sql - SQL ejecutado
   * @param {Array} params - Parámetros
   * @param {number} duration - Duración en ms
   * @param {Object} metadata - Metadatos adicionales
   */
  profile(sql, params, duration, metadata = {}) {
    const queryInfo = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      sql: this._normalizeSql(sql),
      params: this._sanitizeParams(params),
      duration,
      timestamp: new Date().toISOString(),
      severity: this._calculateSeverity(duration),
      metadata: {
        ...metadata,
        source: metadata.source || this._getCallerInfo(),
      },
    };

    // Actualizar estadísticas
    this._updateStats(queryInfo);

    // Guardar en historial
    this._addToHistory(queryInfo);

    // Log si está habilitado
    if (this.config.logQueries) {
      this._logQuery(queryInfo);
    }

    // Alertar si es lenta
    if (this.config.alertOnSlowQuery && queryInfo.severity !== Severity.OK) {
      this._triggerAlert(queryInfo);
    }

    return queryInfo;
  }

  /**
   * Wrapper para ejecutar y perfilar query
   * @param {Function} queryFn - Función que ejecuta la query
   * @param {string} sql - SQL a ejecutar
   * @param {Array} params - Parámetros
   * @param {Object} metadata - Metadatos
   * @returns {Promise<*>}
   */
  async profileQuery(queryFn, sql, params, metadata = {}) {
    const startTime = process.hrtime.bigint();

    try {
      const result = await queryFn();
      const duration = Number(process.hrtime.bigint() - startTime) / 1e6; // ms

      const profile = this.profile(sql, params, duration, {
        ...metadata,
        success: true,
        rowCount: result?.rowCount || result?.length,
      });

      return { result, profile };
    } catch (error) {
      const duration = Number(process.hrtime.bigint() - startTime) / 1e6;

      this.profile(sql, params, duration, {
        ...metadata,
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Ejecuta EXPLAIN ANALYZE en PostgreSQL
   * @param {Object} client - Cliente de PostgreSQL
   * @param {string} sql - SQL a analizar
   * @param {Array} params - Parámetros
   * @returns {Promise<Object>}
   */
  async explainAnalyze(client, sql, params = []) {
    if (!this.config.enableExplainAnalyze) {
      return null;
    }

    try {
      const explainSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`;
      const result = await client.query(explainSql, params);
      const plan = result.rows[0]['QUERY PLAN'][0];

      return {
        executionTime: plan['Execution Time'],
        planningTime: plan['Planning Time'],
        plan: plan['Plan'],
        suggestions: this._analyzePlan(plan['Plan']),
      };
    } catch {
      return null;
    }
  }

  /**
   * Analiza un plan de ejecución y sugiere mejoras
   * @private
   */
  _analyzePlan(plan, suggestions = []) {
    if (!plan) return suggestions;

    // Detectar Seq Scan en tablas grandes
    if (plan['Node Type'] === 'Seq Scan' && plan['Actual Rows'] > 1000) {
      suggestions.push({
        type: 'missing_index',
        message: `Sequential scan on ${plan['Relation Name']} with ${plan['Actual Rows']} rows. Consider adding an index.`,
        table: plan['Relation Name'],
        severity: 'warning',
      });
    }

    // Detectar Sort con alto costo
    if (plan['Node Type'] === 'Sort' && plan['Sort Space Used'] > 1024) {
      suggestions.push({
        type: 'expensive_sort',
        message: `Large sort operation using ${plan['Sort Space Used']}kB. Consider adding an index for the ORDER BY clause.`,
        severity: 'warning',
      });
    }

    // Detectar Nested Loop con muchas iteraciones
    if (plan['Node Type'] === 'Nested Loop' && plan['Actual Loops'] > 100) {
      suggestions.push({
        type: 'nested_loop',
        message: `Nested loop with ${plan['Actual Loops']} iterations. Consider restructuring the query or adding indexes.`,
        severity: 'info',
      });
    }

    // Analizar planes hijos recursivamente
    if (plan['Plans']) {
      for (const childPlan of plan['Plans']) {
        this._analyzePlan(childPlan, suggestions);
      }
    }

    return suggestions;
  }

  /**
   * Calcula severidad basada en duración
   * @private
   */
  _calculateSeverity(duration) {
    if (duration >= this.config.criticalQueryThreshold) {
      return Severity.CRITICAL;
    }
    if (duration >= this.config.verySlowQueryThreshold) {
      return Severity.VERY_SLOW;
    }
    if (duration >= this.config.slowQueryThreshold) {
      return Severity.SLOW;
    }
    return Severity.OK;
  }

  /**
   * Actualiza estadísticas
   * @private
   */
  _updateStats(queryInfo) {
    this.stats.totalQueries++;
    this.stats.totalDuration += queryInfo.duration;
    this.stats.avgDuration = this.stats.totalDuration / this.stats.totalQueries;
    this.stats.maxDuration = Math.max(this.stats.maxDuration, queryInfo.duration);

    switch (queryInfo.severity) {
      case Severity.SLOW:
        this.stats.slowQueries++;
        break;
      case Severity.VERY_SLOW:
        this.stats.verySlowQueries++;
        break;
      case Severity.CRITICAL:
        this.stats.criticalQueries++;
        break;
    }
  }

  /**
   * Añade query al historial
   * @private
   */
  _addToHistory(queryInfo) {
    this.queryHistory.push(queryInfo);

    // Limitar tamaño del historial
    if (this.queryHistory.length > this.config.maxQueryHistory) {
      this.queryHistory.shift();
    }

    // Guardar queries lentas separadamente
    if (queryInfo.severity !== Severity.OK) {
      this.slowQueries.push(queryInfo);
      if (this.slowQueries.length > this.config.maxQueryHistory / 2) {
        this.slowQueries.shift();
      }
    }
  }

  /**
   * Log de query
   * @private
   */
  _logQuery(queryInfo) {
    const logFn =
      queryInfo.severity === Severity.OK
        ? console.debug
        : queryInfo.severity === Severity.CRITICAL
          ? console.error
          : console.warn;

    logFn(
      JSON.stringify({
        type: 'query_profile',
        id: queryInfo.id,
        duration: `${queryInfo.duration.toFixed(2)}ms`,
        severity: queryInfo.severity,
        sql: queryInfo.sql.slice(0, 200),
        timestamp: queryInfo.timestamp,
      })
    );
  }

  /**
   * Dispara alerta
   * @private
   */
  _triggerAlert(queryInfo) {
    for (const handler of this.alertHandlers) {
      try {
        handler(queryInfo);
      } catch (error) {
        console.error('[QueryProfiler] Alert handler error:', error);
      }
    }
  }

  /**
   * Normaliza SQL para comparación
   * @private
   */
  _normalizeSql(sql) {
    return sql.replace(/\s+/g, ' ').replace(/\$\d+/g, '?').trim();
  }

  /**
   * Sanitiza parámetros para logging
   * @private
   */
  _sanitizeParams(params) {
    if (!params) return [];
    return params.map((p) => {
      if (typeof p === 'string' && p.length > 100) {
        return `${p.slice(0, 100)}...`;
      }
      return p;
    });
  }

  /**
   * Obtiene información del caller
   * @private
   */
  _getCallerInfo() {
    const stack = new Error().stack?.split('\n');
    if (!stack || stack.length < 5) return 'unknown';

    // Buscar primera línea que no sea de este archivo
    for (let i = 3; i < stack.length; i++) {
      if (!stack[i].includes('QueryProfiler')) {
        const match = stack[i].match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/);
        if (match) {
          return `${match[1]} (${match[2]}:${match[3]})`;
        }
      }
    }

    return 'unknown';
  }

  /**
   * Obtiene resumen de queries lentas
   * @returns {Object}
   */
  getSlowQuerySummary() {
    const grouped = {};

    for (const query of this.slowQueries) {
      const key = query.sql;
      if (!grouped[key]) {
        grouped[key] = {
          sql: query.sql,
          count: 0,
          totalDuration: 0,
          avgDuration: 0,
          maxDuration: 0,
          samples: [],
        };
      }

      grouped[key].count++;
      grouped[key].totalDuration += query.duration;
      grouped[key].maxDuration = Math.max(grouped[key].maxDuration, query.duration);
      grouped[key].avgDuration = grouped[key].totalDuration / grouped[key].count;

      if (grouped[key].samples.length < 3) {
        grouped[key].samples.push(query);
      }
    }

    return Object.values(grouped).sort((a, b) => b.totalDuration - a.totalDuration);
  }

  /**
   * Obtiene estadísticas generales
   * @returns {Object}
   */
  getStats() {
    return {
      ...this.stats,
      slowQueryPercentage:
        this.stats.totalQueries > 0
          ? ((this.stats.slowQueries / this.stats.totalQueries) * 100).toFixed(2)
          : 0,
    };
  }

  /**
   * Reinicia estadísticas
   */
  reset() {
    this.queryHistory = [];
    this.slowQueries = [];
    this.stats = {
      totalQueries: 0,
      totalDuration: 0,
      slowQueries: 0,
      verySlowQueries: 0,
      criticalQueries: 0,
      avgDuration: 0,
      maxDuration: 0,
    };
  }
}

/**
 * Crea middleware Express para profiling automático
 */
const createProfilingMiddleware = (profiler) => {
  return (req, res, next) => {
    req.queryProfiler = profiler;
    req.profiledQueries = [];

    // Interceptar respuesta para añadir métricas
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (req.profiledQueries.length > 0) {
        res.setHeader('X-Query-Count', req.profiledQueries.length);
        res.setHeader(
          'X-Query-Time',
          req.profiledQueries.reduce((sum, q) => sum + q.duration, 0).toFixed(2)
        );
      }
      return originalJson(data);
    };

    next();
  };
};

// Instancia singleton
let defaultProfiler = null;

const getProfiler = (options) => {
  if (!defaultProfiler) {
    defaultProfiler = new QueryProfiler(options);
  }
  return defaultProfiler;
};

module.exports = {
  QueryProfiler,
  createProfilingMiddleware,
  getProfiler,
  Severity,
  DEFAULT_CONFIG,
};
