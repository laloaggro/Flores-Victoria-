const { Client } = require('pg');
const config = require('./index');

class Database {
  constructor() {
    this.client = new Client({
      connectionString: config.database.url,
    });
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Conexión a la base de datos establecida correctamente');
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      throw error;
    }
  }

  async query(text, params) {
    try {
      const result = await this.client.query(text, params);
      return result;
    } catch (error) {
      console.error('Error en la consulta a la base de datos:', error);
      throw error;
    }
  }

  async close() {
    try {
      await this.client.end();
      console.log('Conexión a la base de datos cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar la conexión a la base de datos:', error);
      throw error;
    }
  }
}

module.exports = new Database();