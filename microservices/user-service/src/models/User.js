const logger = require('../logger');

class User {
  constructor(client) {
    this.client = client;
  }

  // Crear tabla de usuarios si no existe
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await this.client.query(query);
      logger.info({ service: 'user-service' }, 'Tabla de usuarios verificada/creada correctamente');
    } catch (error) {
      logger.error({ err: error, service: 'user-service' }, 'Error creando tabla de usuarios');
      throw error;
    }
  }

  // Crear un nuevo usuario
  async create(userData) {
    const { name, email, password, role = 'customer' } = userData;
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
    `;
    const values = [name, email, password, role];

    try {
      const result = await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error({ err: error, service: 'user-service' }, 'Error creando usuario');
      throw error;
    }
  }

  // Obtener todos los usuarios
  async findAll() {
    const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';

    try {
      const result = await this.client.query(query);
      return result.rows;
    } catch (error) {
      logger.error({ err: error, service: 'user-service' }, 'Error obteniendo usuarios');
      throw error;
    }
  }

  // Obtener un usuario por ID
  async findById(id) {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
    const values = [id];

    try {
      const result = await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error({ err: error, service: 'user-service' }, 'Error obteniendo usuario por ID');
      throw error;
    }
  }

  // Obtener un usuario por email
  async findByEmail(email) {
    const query = 'SELECT id, name, email, password, role, created_at FROM users WHERE email = $1';
    const values = [email];

    try {
      const result = await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error({ err: error, service: 'user-service' }, 'Error obteniendo usuario por email');
      throw error;
    }
  }

  // Actualizar un usuario
  async update(id, userData) {
    const { name, email, role } = userData;
    const query = `
      UPDATE users
      SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, email, role, updated_at
    `;
    const values = [name, email, role, id];

    try {
      const result = await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error({ err: error, service: 'user-service' }, 'Error actualizando usuario');
      throw error;
    }
  }

  // Eliminar un usuario
  async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, name, email';
    const values = [id];

    try {
      const result = await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error({ err: error, service: 'user-service' }, 'Error eliminando usuario');
      throw error;
    }
  }
}

module.exports = { User };
