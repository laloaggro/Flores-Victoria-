const amqp = require('amqplib');
const express = require('express');
const { createLogger } = require('./logger');

const logger = createLogger('messaging-service');
const app = express();

// Middleware
app.use(express.json());

// Variables para la conexión a RabbitMQ
let channel;
let connection;

// Conexión a RabbitMQ
async function connectRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    logger.info('Conectado a RabbitMQ');
    
    // Manejar cierre de conexión
    process.on('exit', () => {
      if (connection) {
        connection.close();
      }
    });
  } catch (error) {
    logger.error('Error al conectar a RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000); // Reintentar en 5 segundos
  }
}

// Función para enviar mensajes
async function sendMessage(queue, message) {
  try {
    if (!channel) {
      throw new Error('Canal de RabbitMQ no disponible');
    }
    
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });
    logger.info(`Mensaje enviado a la cola ${queue}`, { message });
  } catch (error) {
    logger.error('Error al enviar mensaje:', error);
    throw error;
  }
}

// Función para consumir mensajes
async function consumeMessages(queue, callback) {
  try {
    if (!channel) {
      throw new Error('Canal de RabbitMQ no disponible');
    }
    
    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1); // Procesar un mensaje a la vez
    
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const message = JSON.parse(msg.content.toString());
          logger.info(`Mensaje recibido de la cola ${queue}`, { message });
          
          // Procesar el mensaje
          await callback(message);
          
          // Confirmar el procesamiento del mensaje
          channel.ack(msg);
        } catch (error) {
          logger.error('Error al procesar mensaje:', error);
          // Rechazar el mensaje y devolverlo a la cola
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    logger.error('Error al consumir mensajes:', error);
    throw error;
  }
}

// Función para publicar mensajes en un exchange
async function publishMessage(exchange, routingKey, message) {
  try {
    if (!channel) {
      throw new Error('Canal de RabbitMQ no disponible');
    }
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
    logger.info(`Mensaje publicado en exchange ${exchange} con routing key ${routingKey}`, { message });
  } catch (error) {
    logger.error('Error al publicar mensaje:', error);
    throw error;
  }
}

// Función para suscribirse a un exchange
async function subscribeToExchange(exchange, routingKey, queue, callback) {
  try {
    if (!channel) {
      throw new Error('Canal de RabbitMQ no disponible');
    }
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    const q = await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(q.queue, exchange, routingKey);
    
    channel.consume(q.queue, async (msg) => {
      if (msg !== null) {
        try {
          const message = JSON.parse(msg.content.toString());
          logger.info(`Mensaje recibido del exchange ${exchange} con routing key ${routingKey}`, { message });
          
          // Procesar el mensaje
          await callback(message);
          
          // Confirmar el procesamiento del mensaje
          channel.ack(msg);
        } catch (error) {
          logger.error('Error al procesar mensaje del exchange:', error);
          // Rechazar el mensaje y devolverlo a la cola
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    logger.error('Error al suscribirse al exchange:', error);
    throw error;
  }
}

// Conectar a RabbitMQ
connectRabbitMQ();

// Rutas de la API
app.post('/send', async (req, res) => {
  try {
    const { queue, message } = req.body;
    await sendMessage(queue, message);
    res.status(200).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    logger.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/publish', async (req, res) => {
  try {
    const { exchange, routingKey, message } = req.body;
    await publishMessage(exchange, routingKey, message);
    res.status(200).json({ message: 'Mensaje publicado correctamente' });
  } catch (error) {
    logger.error('Error al publicar mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/health', (req, res) => {
  const status = channel ? 'OK' : 'Not connected to RabbitMQ';
  res.status(200).json({ status, service: 'messaging-service' });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de mensajería ejecutándose en el puerto ${PORT}`);
});

// Exportar funciones para uso externo
module.exports = {
  sendMessage,
  consumeMessages,
  publishMessage,
  subscribeToExchange,
  getChannel: () => channel
};