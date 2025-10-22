const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');

const config = require('../config');

/**
 * Modelo de contacto para el servicio de contacto
 */
class Contact {
  constructor(db) {
    this.collection = db.collection('contacts');
    // Configurar transporte de correo solo si las variables de entorno están definidas
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true' || false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      console.warn(
        'Credenciales de correo electrónico no configuradas. Las funciones de correo estarán deshabilitadas.'
      );
      this.transporter = null;
    }
  }

  /**
   * Enviar mensaje de contacto y guardarlo en la base de datos
   * @param {object} contactData - Datos del contacto
   * @returns {object} Resultado del envío y almacenamiento
   */
  async sendContactMessage(contactData) {
    const { name, email, subject, message } = contactData;

    // Guardar en la base de datos primero
    const contact = {
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
    };

    const result = await this.collection.insertOne(contact);

    // Intentar enviar correo solo si el transporte está configurado
    if (this.transporter) {
      try {
        // Verificar la conexión del transporte
        await this.transporter.verify();

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
          `,
        };

        // Enviar correo
        const info = await this.transporter.sendMail(mailOptions);

        // Actualizar el registro con el ID del mensaje
        await this.collection.updateOne(
          { _id: result.insertedId },
          { $set: { messageId: info.messageId } }
        );

        return {
          success: true,
          id: result.insertedId,
          messageId: info.messageId,
        };
      } catch (error) {
        console.error('Error enviando correo de contacto:', error);
        // Aunque el correo falle, el contacto se guardó en la base de datos
        return {
          success: true,
          id: result.insertedId,
          messageId: null,
          warning: `Mensaje guardado pero no se pudo enviar el correo: ${error.message}`,
        };
      }
    } else {
      // Sin configuración de correo, solo guardamos en la base de datos
      return {
        success: true,
        id: result.insertedId,
        messageId: null,
        warning: 'Mensaje guardado pero el servicio de correo no está configurado',
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
