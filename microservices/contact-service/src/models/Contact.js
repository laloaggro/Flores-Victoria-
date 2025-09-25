const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const config = require('../config');

/**
 * Modelo de contacto para el servicio de contacto
 */
class Contact {
  constructor(db) {
    this.collection = db.collection('contacts');
    // Configurar transporte de correo
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      } : undefined
    });
  }

  /**
   * Enviar mensaje de contacto y guardarlo en la base de datos
   * @param {object} contactData - Datos del contacto
   * @returns {object} Resultado del envío y almacenamiento
   */
  async sendContactMessage(contactData) {
    const { name, email, subject, message } = contactData;
    
    // Configurar opciones del correo
    const mailOptions = {
      from: process.env.EMAIL_USER || 'no-reply@arreglosvictoria.cl',
      to: 'contacto@arreglosvictoria.cl', // Dirección de destino
      replyTo: email,
      subject: `Mensaje de contacto: ${subject}`,
      text: `
        Nuevo mensaje de contacto:
        
        Nombre: ${name}
        Email: ${email}
        Asunto: ${subject}
        
        Mensaje:
        ${message}
      `,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <h3>Mensaje:</h3>
        <p>${message}</p>
      `
    };
    
    // Enviar correo
    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      // Guardar en la base de datos
      const contact = {
        name,
        email,
        subject,
        message,
        createdAt: new Date(),
        messageId: info.messageId
      };
      
      const result = await this.collection.insertOne(contact);
      
      return {
        success: true,
        id: result.insertedId,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error enviando correo de contacto:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar configuración del transporte de correo
   * @returns {boolean} Si la verificación fue exitosa
   */
  async verifyTransporter() {
    try {
      await this.transporter.verify();
      console.log('Servidor de correo verificado correctamente');
      return true;
    } catch (error) {
      console.error('Error verificando servidor de correo:', error);
      return false;
    }
  }

  // Obtener todos los mensajes de contacto
  async findAll() {
    const contacts = await this.collection.find({}).sort({ createdAt: -1 }).toArray();
    return contacts;
  }

  // Obtener un mensaje de contacto por ID
  async findById(id) {
    try {
      const contact = await this.collection.findOne({ _id: new ObjectId(id) });
      return contact;
    } catch (error) {
      console.error('Error buscando contacto por ID:', error);
      return null;
    }
  }

  // Actualizar un mensaje de contacto
  async update(id, updateData) {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error actualizando contacto:', error);
      return false;
    }
  }

  // Eliminar un mensaje de contacto
  async delete(id) {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error eliminando contacto:', error);
      return false;
    }
  }
}

module.exports = Contact;