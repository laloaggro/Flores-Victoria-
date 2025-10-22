const { getDb } = require('../config/database');
const Contact = require('../models/Contact');

class ContactController {
  constructor() {
    this.contactModel = null;

    // Inicializar el modelo cuando la base de datos esté disponible
    setTimeout(() => {
      try {
        const db = getDb();
        this.contactModel = new Contact(db);

        // Verificar la configuración del transporte de correo
        this.contactModel.verifyTransporter();
      } catch (error) {
        console.error('Error inicializando el modelo de contacto:', error);
      }
    }, 1000);
  }

  // Crear un nuevo mensaje de contacto
  createContact = async (req, res) => {
    try {
      // Esperar a que el modelo se inicialice
      if (!this.contactModel) {
        // Reintentar inicialización
        const db = getDb();
        this.contactModel = new Contact(db);
      }

      const { name, email, subject, message } = req.body;

      // Validar campos requeridos
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          status: 'fail',
          message: 'Todos los campos son requeridos',
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Formato de email inválido',
        });
      }

      // Crear contacto
      const contactData = { name, email, subject, message };
      const result = await this.contactModel.sendContactMessage(contactData);

      if (!result.success) {
        return res.status(500).json({
          status: 'error',
          message: `Error enviando mensaje de contacto: ${result.error}`,
        });
      }

      res.status(201).json({
        status: 'success',
        message: 'Mensaje de contacto creado exitosamente',
        data: result,
      });
    } catch (error) {
      console.error('Error creando contacto:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  };

  // Obtener todos los mensajes de contacto
  getAllContacts = async (req, res) => {
    try {
      // Esperar a que el modelo se inicialice
      if (!this.contactModel) {
        // Reintentar inicialización
        const db = getDb();
        this.contactModel = new Contact(db);
      }

      const contacts = await this.contactModel.findAll();

      res.status(200).json({
        status: 'success',
        message: 'Mensajes de contacto obtenidos exitosamente',
        data: contacts,
      });
    } catch (error) {
      console.error('Error obteniendo contactos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  };

  // Obtener un mensaje de contacto por ID
  getContactById = async (req, res) => {
    try {
      // Esperar a que el modelo se inicialice
      if (!this.contactModel) {
        // Reintentar inicialización
        const db = getDb();
        this.contactModel = new Contact(db);
      }

      const { id } = req.params;

      // Validar ID
      if (!id) {
        return res.status(400).json({
          status: 'fail',
          message: 'ID es requerido',
        });
      }

      const contact = await this.contactModel.findById(id);

      if (!contact) {
        return res.status(404).json({
          status: 'fail',
          message: 'Mensaje de contacto no encontrado',
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Mensaje de contacto obtenido exitosamente',
        data: contact,
      });
    } catch (error) {
      console.error('Error obteniendo contacto:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  };

  // Actualizar un mensaje de contacto
  updateContact = async (req, res) => {
    try {
      // Esperar a que el modelo se inicialice
      if (!this.contactModel) {
        // Reintentar inicialización
        const db = getDb();
        this.contactModel = new Contact(db);
      }

      const { id } = req.params;
      const updateData = req.body;

      // Validar ID
      if (!id) {
        return res.status(400).json({
          status: 'fail',
          message: 'ID es requerido',
        });
      }

      const updated = await this.contactModel.update(id, updateData);

      if (!updated) {
        return res.status(404).json({
          status: 'fail',
          message: 'Mensaje de contacto no encontrado',
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Mensaje de contacto actualizado exitosamente',
      });
    } catch (error) {
      console.error('Error actualizando contacto:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  };

  // Eliminar un mensaje de contacto
  deleteContact = async (req, res) => {
    try {
      // Esperar a que el modelo se inicialice
      if (!this.contactModel) {
        // Reintentar inicialización
        const db = getDb();
        this.contactModel = new Contact(db);
      }

      const { id } = req.params;

      // Validar ID
      if (!id) {
        return res.status(400).json({
          status: 'fail',
          message: 'ID es requerido',
        });
      }

      const deleted = await this.contactModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message: 'Mensaje de contacto no encontrado',
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Mensaje de contacto eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error eliminando contacto:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  };
}

module.exports = ContactController;
