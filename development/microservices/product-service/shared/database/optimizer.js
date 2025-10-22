/**
 * Utilidades para optimización de consultas a bases de datos
 */
class DatabaseOptimizer {
  /**
   * Crear consulta con paginación
   * @param {string} baseQuery - Consulta base
   * @param {object} params - Parámetros de paginación
   * @returns {object} Consulta con paginación y parámetros
   */
  static paginateQuery(baseQuery, params = {}) {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    // Agregar cláusula LIMIT y OFFSET
    const paginatedQuery = `${baseQuery} LIMIT $${Object.keys(params).length + 1} OFFSET $${Object.keys(params).length + 2}`;
    const paginatedParams = [...Object.values(params), limit, offset];

    return {
      query: paginatedQuery,
      params: paginatedParams,
      page,
      limit,
      offset,
    };
  }

  /**
   * Crear consulta con ordenamiento
   * @param {string} baseQuery - Consulta base
   * @param {string} orderBy - Campo de ordenamiento
   * @param {string} direction - Dirección (ASC o DESC)
   * @returns {string} Consulta con ordenamiento
   */
  static orderByQuery(baseQuery, orderBy, direction = 'ASC') {
    // Validar dirección
    const validDirection = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Agregar cláusula ORDER BY
    return `${baseQuery} ORDER BY ${orderBy} ${validDirection}`;
  }

  /**
   * Crear consulta con filtros
   * @param {string} baseQuery - Consulta base
   * @param {object} filters - Filtros
   * @param {array} validFields - Campos válidos para filtrar
   * @returns {object} Consulta con filtros y parámetros
   */
  static filterQuery(baseQuery, filters = {}, validFields = []) {
    const whereConditions = [];
    const filterParams = [];
    let paramIndex = 1;

    // Iterar sobre filtros
    for (const field in filters) {
      // Verificar que el campo sea válido
      if (validFields.includes(field)) {
        const value = filters[field];

        // Manejar diferentes tipos de filtros
        if (typeof value === 'string' && value.includes('%')) {
          // Filtro LIKE
          whereConditions.push(`${field} LIKE $${paramIndex}`);
          filterParams.push(value);
        } else if (Array.isArray(value)) {
          // Filtro IN
          const placeholders = value.map((_, index) => `$${paramIndex + index}`).join(', ');
          whereConditions.push(`${field} IN (${placeholders})`);
          filterParams.push(...value);
          paramIndex += value.length - 1;
        } else {
          // Filtro de igualdad
          whereConditions.push(`${field} = $${paramIndex}`);
          filterParams.push(value);
        }

        paramIndex++;
      }
    }

    // Agregar cláusula WHERE si hay condiciones
    if (whereConditions.length > 0) {
      const whereClause = whereConditions.join(' AND ');
      baseQuery = `${baseQuery} WHERE ${whereClause}`;
    }

    return {
      query: baseQuery,
      params: filterParams,
    };
  }

  /**
   * Crear índice para optimizar consultas
   * @param {object} db - Conexión a base de datos
   * @param {string} tableName - Nombre de la tabla
   * @param {string|array} columns - Columna(s) para el índice
   * @param {string} indexName - Nombre del índice (opcional)
   */
  static async createIndex(db, tableName, columns, indexName = null) {
    try {
      // Convertir columnas a array si es string
      const columnsArray = Array.isArray(columns) ? columns : [columns];

      // Generar nombre de índice si no se proporciona
      const finalIndexName = indexName || `${tableName}_${columnsArray.join('_')}_idx`;

      // Crear consulta para índice
      const columnsList = columnsArray.join(', ');
      const query = `CREATE INDEX IF NOT EXISTS ${finalIndexName} ON ${tableName} (${columnsList})`;

      // Ejecutar consulta
      await db.query(query);
      console.log(`Índice ${finalIndexName} creado en tabla ${tableName}`);
    } catch (error) {
      console.error(`Error creando índice en tabla ${tableName}:`, error);
    }
  }

  /**
   * Analizar rendimiento de consulta
   * @param {object} db - Conexión a base de datos
   * @param {string} query - Consulta a analizar
   * @param {array} params - Parámetros de la consulta
   * @returns {object} Resultados del análisis
   */
  static async analyzeQuery(db, query, params = []) {
    try {
      // Ejecutar EXPLAIN para analizar consulta
      const explainQuery = `EXPLAIN ANALYZE ${query}`;
      const result = await db.query(explainQuery, params);

      return {
        query,
        explain: result.rows,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error analizando consulta:', error);
      return {
        query,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = DatabaseOptimizer;
