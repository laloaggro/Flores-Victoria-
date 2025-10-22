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
  }
}

module.exports = Order;
