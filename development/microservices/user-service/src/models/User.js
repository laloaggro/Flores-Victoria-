/**
 * Modelo de usuario para el servicio de usuarios
 */
class User {
  constructor(db) {
    this.db = db;
  }

  /**
   * Obtener perfil de usuario por ID
   * @param {number} id - ID del usuario
   * @returns {object|null} Perfil de usuario o null
   */
  async findById(id) {
    const query = `
      SELECT id, name, email, created_at
      FROM users
      WHERE id = $1
    `;

    const values = [id];
    const result = await this.db.query(query, values);

    return result.rows[0] || null;
  }

  /**
   * Actualizar perfil de usuario
   * @param {number} id - ID del usuario
   * @param {object} userData - Datos a actualizar
   * @returns {object|null} Usuario actualizado o null
   */
  async update(id, userData) {
    const { name, email } = userData;

    const query = `
      UPDATE users
      SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, created_at
    `;

    const values = [name, email, id];
    const result = await this.db.query(query, values);

    return result.rows[0] || null;
  }

  /**
   * Crear tabla de usuarios si no existe
   */
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await this.db.query(query);
  }
}

module.exports = User;
