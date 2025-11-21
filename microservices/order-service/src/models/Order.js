/**
 * Modelo de pedido para el servicio de pedidos
 */
class Order {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crear un nuevo pedido
   * @param {object} orderData - Datos del pedido
   * @returns {object} Pedido creado
   */
  async create(orderData) {
    const { userId, items, total, shippingAddress, paymentMethod } = orderData;

    const query = `
      INSERT INTO orders (user_id, items, total, shipping_address, payment_method, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, items, total, shipping_address, payment_method, status, created_at
    `;

    const values = [
      userId,
      JSON.stringify(items),
      total,
      shippingAddress,
      paymentMethod,
      'pending',
    ];
    const result = await this.db.query(query, values);

    return result.rows[0];
  }

  /**
   * Obtener pedidos por ID de usuario
   * @param {number} userId - ID del usuario
   * @returns {array} Lista de pedidos
   */
  async findByUserId(userId) {
    const query = `
      SELECT id, user_id, items, total, shipping_address, payment_method, status, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const values = [userId];
    const result = await this.db.query(query, values);

    return result.rows.map((order) => ({
      ...order,
      items: JSON.parse(order.items),
    }));
  }

  /**
   * Obtener pedido por ID
   * @param {number} id - ID del pedido
   * @returns {object|null} Pedido encontrado o null
   */
  async findById(id) {
    const query = `
      SELECT id, user_id, items, total, shipping_address, payment_method, status, created_at
      FROM orders
      WHERE id = $1
    `;

    const values = [id];
    const result = await this.db.query(query, values);

    if (result.rows[0]) {
      return {
        ...result.rows[0],
        items: JSON.parse(result.rows[0].items),
      };
    }

    return null;
  }

  /**
   * Crear tablas si no existen
   */
  async createTables() {
    // Crear tabla de pedidos
    const orderTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await this.db.query(orderTableQuery);

    // Crear índices de rendimiento
    await this.createIndexes();
  }

  /**
   * Crear índices optimizados para rendimiento
   */
  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders (user_id, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders (user_id, status, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders (payment_method)',
    ];

    try {
      for (const indexQuery of indexes) {
        await this.db.query(indexQuery);
      }
    } catch (error) {
      // Los índices son opcionales, no lanzar error
      console.error('Error creando índices de órdenes:', error.message);
    }
  }
}

module.exports = Order;
