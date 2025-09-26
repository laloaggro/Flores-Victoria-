const bcrypt = require('bcryptjs');

/**
 * Modelo de usuario para el servicio de autenticación
 */
class User {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crear un nuevo usuario
   * @param {object} userData - Datos del usuario
   * @returns {object} Usuario creado
   */
  create(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password, provider, providerId, role } = userData;
      
      // Encriptar contraseña solo si no es autenticación social
      if (password && !provider) {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
          if (err) {
            reject(err);
            return;
          }
          
          const query = `
            INSERT INTO users (username, email, password, provider, provider_id, role)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          this.db.run(query, [username, email, hashedPassword, provider || null, providerId || null, role || 'user'], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                id: this.lastID,
                username,
                email,
                provider: provider || null,
                provider_id: providerId || null,
                role: role || 'user',
                created_at: new Date().toISOString()
              });
            }
          });
        });
      } else {
        // Para autenticación social, no encriptamos contraseña
        const query = `
          INSERT INTO users (username, email, password, provider, provider_id, role)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        this.db.run(query, [username, email, null, provider || null, providerId || null, role || 'user'], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              username,
              email,
              provider: provider || null,
              provider_id: providerId || null,
              role: role || 'user',
              created_at: new Date().toISOString()
            });
          }
        });
      }
    });
  }

  /**
   * Buscar usuario por email
   * @param {string} email - Email del usuario
   * @returns {object|null} Usuario encontrado o null
   */
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      this.db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Buscar usuario por ID de proveedor social
   * @param {string} provider - Proveedor (google, facebook, etc.)
   * @param {string} providerId - ID del usuario en el proveedor
   * @returns {object|null} Usuario encontrado o null
   */
  findByProviderId(provider, providerId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE provider = ? AND provider_id = ?';
      this.db.get(query, [provider, providerId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Buscar usuario por ID
   * @param {number} id - ID del usuario
   * @returns {object|null} Usuario encontrado o null
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, username, email, provider, provider_id, created_at FROM users WHERE id = ?';
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Actualizar información del usuario
   * @param {number} id - ID del usuario
   * @param {object} userData - Datos a actualizar
   * @returns {object} Usuario actualizado
   */
  update(id, userData) {
    return new Promise((resolve, reject) => {
      const { username, email } = userData;
      const query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
      this.db.run(query, [username, email, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            username,
            email
          });
        }
      });
    });
  }

  /**
   * Eliminar usuario
   * @param {number} id - ID del usuario
   * @returns {object} Resultado de la eliminación
   */
  delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';
      this.db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }
}

module.exports = User;