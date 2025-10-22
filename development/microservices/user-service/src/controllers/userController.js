const User = require('../models/User');

/**
 * Controlador de usuarios
 */
class UserController {
  constructor(db) {
    this.userModel = new User(db);
  }

  /**
   * Obtener perfil de usuario
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await this.userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'Usuario no encontrado',
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * Actualizar perfil de usuario
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const userData = req.body;

      // Validar datos requeridos
      if (!userData.name || !userData.email) {
        return res.status(400).json({
          status: 'fail',
          message: 'Nombre y email son requeridos',
        });
      }

      const user = await this.userModel.update(userId, userData);

      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'Usuario no encontrado',
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Perfil actualizado exitosamente',
        data: {
          user,
        },
      });
    } catch (error) {
      console.error('Error actualizando perfil de usuario:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  }
}

module.exports = UserController;
