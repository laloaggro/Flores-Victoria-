const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Función para registrar mensajes en el archivo de logs
function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    // Escribir en el archivo de logs si existe
    try {
        fs.appendFileSync(path.join(__dirname, '../server.log'), logEntry);
    } catch (err) {
        // Si no se puede escribir en el archivo, mostrar en consola
        console.log(logEntry);
    }
    console.log(message); // También mostrar en consola
}

// Crear transporter para enviar correos
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USERNAME || 'arreglosvictoriafloreria@gmail.com',
        pass: process.env.SMTP_PASSWORD
    }
});

// Verificar la configuración del transporter
transporter.verify((error, success) => {
    if (error) {
        logMessage(`Error en la configuración del transporte de correo: ${error}`);
    } else {
        logMessage('Servidor de correo configurado correctamente');
    }
});

router.post('/', async (req, res) => {
    logMessage('Iniciando procesamiento de formulario de contacto');
    
    // Obtener los datos del cuerpo de la solicitud
    const { name, email, subject, message } = req.body;
    
    logMessage(`Datos recibidos - Nombre: ${name}, Email: ${email}, Asunto: ${subject}, Mensaje: ${message}`);
    
    // Validar los datos
    if (!name || !email || !subject || !message) {
        logMessage('Error: Faltan campos requeridos');
        return res.status(400).json({ 
            message: 'Faltan campos requeridos',
            status: 'error'
        });
    }
    
    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        logMessage('Error: Formato de correo electrónico inválido');
        return res.status(400).json({ 
            message: 'Formato de correo electrónico inválido',
            status: 'error'
        });
    }
    
    try {
        // Configurar opciones del correo
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME || 'Arreglos Victoria Florería'}" <${process.env.MAIL_FROM_ADDRESS || 'arreglosvictoriafloreria@gmail.com'}>`,
            to: process.env.MAIL_TO_ADDRESS || 'arreglosvictoriafloreria@gmail.com',
            subject: `Mensaje de contacto: ${subject}`,
            html: `
            <html>
            <head>
                <title>Nuevo mensaje de contacto</title>
            </head>
            <body>
                <h2>Nuevo mensaje de contacto desde la web</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${subject}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>Este mensaje fue enviado desde el formulario de contacto de la web de Arreglos Victoria Florería</small></p>
            </body>
            </html>
            `
        };
        
        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        logMessage(`Correo enviado correctamente: ${info.messageId}`);
        
        // Responder con éxito
        res.status(200).json({
            message: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.',
            status: 'success'
        });
    } catch (error) {
        logMessage(`Error enviando correo: ${error.message}`);
        console.error('Error detallado:', error);
        
        res.status(500).json({
            message: 'Error al procesar el formulario. Por favor, inténtalo de nuevo más tarde.',
            status: 'error',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;