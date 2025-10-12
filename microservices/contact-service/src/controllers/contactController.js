const Contact = require('../models/Contact');
const { getDb } = require('../config/database');
const { AppError } = require('../shared/middlewares/errorHandler');

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
  createContact = async (req, res, next) => {
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
        return next(new AppError('Todos los campos son requeridos', 400));
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return next(new AppError('Formato de email inválido', 400));
      }

      // Crear contacto
      const result = await this.contactModel.sendContactMessage({
        name,
        email,
        subject,
        message
      });

      res.status(201).json({
        status: 'success',
        message: 'Mensaje de contacto enviado exitosamente',
        data: result
      });
    } catch (error) {
      next(new AppError('Error enviando mensaje de contacto', 500));
    }
  }

  // Obtener todos los mensajes de contacto
  getAllContacts = async (req, res, next) => {
    try {
      // Esperar a que el modelo se inicialice
      if (!this.contactModel) {
        // Reintentar inicialización
        const db = getDb();
        this.contactModel = new Contact(db);
      }
      
      const contacts = await this.contactModel.getAllContacts();
      
      res.status(200).json({
        status: 'success',
        data: {
          contacts
        }
      });
    } catch (error) {
      next(new AppError('Error obteniendo mensajes de contacto', 500));
    }
  }

  // Obtener un mensaje de contacto por ID
  getContactById = async (req, res, next) => {
    try {
      // Esperar a que el modelo se inicialice
      if (!this.contactModel) {
        // Reintentar inicialización
        const db = getDb();
        this.contactModel = new Contact(db);
      }
      
      const { id } = req.params;
      const contact = await this.contactModel.getContactById(id);
      
      if (!contact) {
        return next(new AppError('Mensaje de contacto no encontrado', 404));
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          contact
        }
      });
    } catch (error) {
      next(new AppError('Error obteniendo mensaje de contacto', 500));
    }
  }

  // Actualizar un mensaje de contacto
  updateContact = async (req, res, next) => {
    try {
      // Esperar a que el modelo se inicialice
      if (!this.contactModel) {
        // Reintentar inicialización
        const db = getDb();
        this.contactModel = new Contact(db);
      }
      
      const { id } = req.params;
      const updateData = req.body;
      
      const contact = await this.contactModel.updateContact(id, updateData);
      
      if (!contact) {
        return next(new AppError('Mensaje de contacto no encontrado', 404));
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Mensaje de contacto actualizado exitosamente',
        data: {
          contact
        }
      });
    } catch (error) {
      next(new AppError('Error actualizando mensaje de contacto', 500));
    }
  }

  // Eliminar un mensaje de contacto
  deleteContact = async (req, res, next) => {
    try {
      // Esperar a que el modelo se inicialice
      if (!this.contactModel) {
        // Reintentar inicialización
        const db = getDb();
        this.contactModel = new Contact(db);
      }
      
      const { id } = req.params;
      const result = await this.contactModel.deleteContact(id);
      
      if (result.deletedCount === 0) {
        return next(new AppError('Mensaje de contacto no encontrado', 404));
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Mensaje de contacto eliminado exitosamente'
      });
    } catch (error) {
      next(new AppError('Error eliminando mensaje de contacto', 500));
    }
  }
}

module.exports = ContactController;