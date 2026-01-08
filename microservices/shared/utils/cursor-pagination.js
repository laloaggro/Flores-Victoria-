/**
 * @fileoverview Cursor-based Pagination Utilities
 * @description Paginación eficiente basada en cursor para MongoDB y PostgreSQL
 * 
 * Ventajas sobre offset pagination:
 * - Rendimiento O(1) vs O(n) con offset
 * - Resultados consistentes con datos cambiantes
 * - Mejor para infinite scroll y lazy loading
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Codificar cursor (base64 del objeto)
 * @param {Object} data - Datos del cursor
 * @returns {string} Cursor codificado
 */
function encodeCursor(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

/**
 * Decodificar cursor
 * @param {string} cursor - Cursor codificado
 * @returns {Object|null} Datos del cursor o null si inválido
 */
function decodeCursor(cursor) {
  if (!cursor) return null;
  
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// MONGODB CURSOR PAGINATION
// ═══════════════════════════════════════════════════════════════

/**
 * Construir query MongoDB con cursor
 * 
 * @param {Object} options - Opciones de paginación
 * @param {string} [options.cursor] - Cursor de la página anterior
 * @param {number} [options.limit=20] - Límite de resultados
 * @param {string} [options.sortField='createdAt'] - Campo de ordenamiento
 * @param {number} [options.sortOrder=-1] - Orden (-1 desc, 1 asc)
 * @param {Object} [options.baseQuery={}] - Query base (filtros)
 * @returns {Object} { query, sort, limit }
 */
function buildMongoCursorQuery(options = {}) {
  const {
    cursor,
    limit = 20,
    sortField = 'createdAt',
    sortOrder = -1,
    baseQuery = {},
  } = options;

  const sort = { [sortField]: sortOrder, _id: sortOrder };
  const query = { ...baseQuery };

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const { value, id } = decoded;
      
      // Construir condición para continuar después del cursor
      // Usa comparación compuesta para manejar valores duplicados
      const operator = sortOrder === -1 ? '$lt' : '$gt';
      const orOperator = sortOrder === -1 ? '$lte' : '$gte';
      
      query.$or = [
        { [sortField]: { [operator]: value } },
        { 
          [sortField]: { [orOperator]: value },
          _id: { [operator]: id },
        },
      ];
    }
  }

  return { query, sort, limit: limit + 1 }; // +1 para detectar hasNext
}

/**
 * Procesar resultados MongoDB y generar cursores
 * 
 * @param {Array} items - Resultados de la query
 * @param {number} limit - Límite original
 * @param {string} sortField - Campo de ordenamiento
 * @returns {Object} { items, pagination }
 */
function processMongoCursorResults(items, limit, sortField = 'createdAt') {
  const hasNextPage = items.length > limit;
  
  // Remover el item extra si existe
  if (hasNextPage) {
    items = items.slice(0, limit);
  }

  // Generar cursores
  let nextCursor = null;
  let prevCursor = null;

  if (items.length > 0) {
    // Cursor para siguiente página
    if (hasNextPage) {
      const lastItem = items[items.length - 1];
      nextCursor = encodeCursor({
        value: lastItem[sortField],
        id: lastItem._id.toString(),
      });
    }

    // Cursor para página anterior (primer item)
    const firstItem = items[0];
    prevCursor = encodeCursor({
      value: firstItem[sortField],
      id: firstItem._id.toString(),
    });
  }

  return {
    items,
    pagination: {
      hasNextPage,
      hasPrevPage: !!prevCursor,
      nextCursor,
      prevCursor,
      count: items.length,
    },
  };
}

/**
 * Helper completo para paginación MongoDB
 * 
 * @example
 * const result = await paginateMongo(Order, {
 *   cursor: req.query.cursor,
 *   limit: 20,
 *   sortField: 'createdAt',
 *   sortOrder: -1,
 *   baseQuery: { userId: user.id },
 *   populate: ['items.product'],
 *   select: '-__v',
 * });
 */
async function paginateMongo(Model, options = {}) {
  const {
    cursor,
    limit = 20,
    sortField = 'createdAt',
    sortOrder = -1,
    baseQuery = {},
    populate = [],
    select = '',
    lean = true,
  } = options;

  const { query, sort, limit: queryLimit } = buildMongoCursorQuery({
    cursor,
    limit,
    sortField,
    sortOrder,
    baseQuery,
  });

  let queryBuilder = Model.find(query)
    .sort(sort)
    .limit(queryLimit);

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  for (const pop of populate) {
    queryBuilder = queryBuilder.populate(pop);
  }

  if (lean) {
    queryBuilder = queryBuilder.lean();
  }

  const items = await queryBuilder;
  
  return processMongoCursorResults(items, limit, sortField);
}

// ═══════════════════════════════════════════════════════════════
// POSTGRESQL CURSOR PAGINATION
// ═══════════════════════════════════════════════════════════════

/**
 * Construir query SQL con cursor
 * 
 * @param {Object} options - Opciones de paginación
 * @param {string} [options.cursor] - Cursor de la página anterior
 * @param {number} [options.limit=20] - Límite de resultados
 * @param {string} [options.sortField='created_at'] - Campo de ordenamiento
 * @param {string} [options.sortOrder='DESC'] - Orden (DESC/ASC)
 * @param {string} [options.table] - Nombre de la tabla
 * @param {Object} [options.where={}] - Condiciones WHERE
 * @returns {Object} { sql, params, limit }
 */
function buildPostgresCursorQuery(options = {}) {
  const {
    cursor,
    limit = 20,
    sortField = 'created_at',
    sortOrder = 'DESC',
    table,
    where = {},
  } = options;

  const params = [];
  const conditions = [];
  let paramIndex = 1;

  // Agregar condiciones WHERE base
  for (const [field, value] of Object.entries(where)) {
    if (value !== undefined && value !== null) {
      conditions.push(`${field} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  // Agregar condición del cursor
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const { value, id } = decoded;
      const operator = sortOrder.toUpperCase() === 'DESC' ? '<' : '>';
      
      conditions.push(`(
        ${sortField} ${operator} $${paramIndex} OR
        (${sortField} = $${paramIndex} AND id ${operator} $${paramIndex + 1})
      )`);
      params.push(value, id);
      paramIndex += 2;
    }
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  const sql = `
    SELECT * FROM ${table}
    ${whereClause}
    ORDER BY ${sortField} ${sortOrder}, id ${sortOrder}
    LIMIT $${paramIndex}
  `;
  
  params.push(limit + 1); // +1 para detectar hasNext

  return { sql, params, limit };
}

/**
 * Procesar resultados PostgreSQL y generar cursores
 * 
 * @param {Array} rows - Resultados de la query
 * @param {number} limit - Límite original
 * @param {string} sortField - Campo de ordenamiento
 * @returns {Object} { items, pagination }
 */
function processPostgresCursorResults(rows, limit, sortField = 'created_at') {
  const hasNextPage = rows.length > limit;
  
  if (hasNextPage) {
    rows = rows.slice(0, limit);
  }

  let nextCursor = null;
  let prevCursor = null;

  if (rows.length > 0) {
    if (hasNextPage) {
      const lastItem = rows[rows.length - 1];
      nextCursor = encodeCursor({
        value: lastItem[sortField],
        id: lastItem.id,
      });
    }

    const firstItem = rows[0];
    prevCursor = encodeCursor({
      value: firstItem[sortField],
      id: firstItem.id,
    });
  }

  return {
    items: rows,
    pagination: {
      hasNextPage,
      hasPrevPage: !!prevCursor,
      nextCursor,
      prevCursor,
      count: rows.length,
    },
  };
}

/**
 * Helper completo para paginación PostgreSQL
 * 
 * @example
 * const result = await paginatePostgres(pool, {
 *   table: 'orders',
 *   cursor: req.query.cursor,
 *   limit: 20,
 *   sortField: 'created_at',
 *   sortOrder: 'DESC',
 *   where: { user_id: userId },
 * });
 */
async function paginatePostgres(pool, options = {}) {
  const {
    table,
    cursor,
    limit = 20,
    sortField = 'created_at',
    sortOrder = 'DESC',
    where = {},
  } = options;

  const { sql, params } = buildPostgresCursorQuery({
    cursor,
    limit,
    sortField,
    sortOrder,
    table,
    where,
  });

  const { rows } = await pool.query(sql, params);
  
  return processPostgresCursorResults(rows, limit, sortField);
}

// ═══════════════════════════════════════════════════════════════
// EXPRESS MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Middleware para parsear parámetros de paginación
 */
function parsePaginationParams(options = {}) {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultSortField = 'createdAt',
    defaultSortOrder = -1,
  } = options;

  return (req, res, next) => {
    const {
      cursor,
      limit: limitParam,
      sort: sortParam,
      order: orderParam,
    } = req.query;

    // Parsear y validar limit
    let limit = parseInt(limitParam, 10) || defaultLimit;
    limit = Math.min(Math.max(limit, 1), maxLimit);

    // Parsear sort field
    const sortField = sortParam || defaultSortField;

    // Parsear sort order
    let sortOrder = defaultSortOrder;
    if (orderParam) {
      const orderLower = orderParam.toLowerCase();
      if (orderLower === 'asc' || orderLower === '1') {
        sortOrder = 1;
      } else if (orderLower === 'desc' || orderLower === '-1') {
        sortOrder = -1;
      }
    }

    // Adjuntar al request
    req.pagination = {
      cursor: cursor || null,
      limit,
      sortField,
      sortOrder,
    };

    next();
  };
}

/**
 * Helper para formatear respuesta paginada
 */
function formatPaginatedResponse(result, options = {}) {
  const { includeMetadata = true } = options;

  const response = {
    data: result.items,
    pagination: {
      hasNextPage: result.pagination.hasNextPage,
      hasPrevPage: result.pagination.hasPrevPage,
      count: result.pagination.count,
    },
  };

  // Solo incluir cursors si existen
  if (result.pagination.nextCursor) {
    response.pagination.nextCursor = result.pagination.nextCursor;
  }
  if (result.pagination.prevCursor) {
    response.pagination.prevCursor = result.pagination.prevCursor;
  }

  if (includeMetadata) {
    response.meta = {
      timestamp: new Date().toISOString(),
    };
  }

  return response;
}

// ═══════════════════════════════════════════════════════════════
// OFFSET PAGINATION (FALLBACK)
// ═══════════════════════════════════════════════════════════════

/**
 * Convertir offset pagination a cursor (para migración gradual)
 * Útil cuando el frontend aún usa page/limit
 */
function offsetToCursorCompat(req, res, next) {
  const { page, limit } = req.query;
  
  // Si ya tiene cursor, no hacer nada
  if (req.query.cursor) {
    return next();
  }

  // Si tiene page, calcular offset y advertir
  if (page) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    
    // Añadir header de deprecación
    res.setHeader('X-Pagination-Warning', 'Offset pagination is deprecated. Use cursor-based pagination.');
    res.setHeader('X-Pagination-Offset', (pageNum - 1) * limitNum);
    
    // Convertir a skip (offset) - funciona pero es menos eficiente
    req.query._offset = (pageNum - 1) * limitNum;
  }
  
  next();
}

module.exports = {
  // Utilidades base
  encodeCursor,
  decodeCursor,
  
  // MongoDB
  buildMongoCursorQuery,
  processMongoCursorResults,
  paginateMongo,
  
  // PostgreSQL
  buildPostgresCursorQuery,
  processPostgresCursorResults,
  paginatePostgres,
  
  // Middleware y helpers
  parsePaginationParams,
  formatPaginatedResponse,
  offsetToCursorCompat,
};
