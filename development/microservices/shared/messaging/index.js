const amqp = require('amqplib');
const winston = require('winston');

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.url = process.env.RABBITMQ_URL || 'amqp://localhost';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      winston.info('Conectado al broker de mensajes RabbitMQ');
      return this.channel;
    } catch (error) {
      winston.error('Error al conectar con RabbitMQ:', error);
      throw error;
    }
  }

  async createQueue(queueName) {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel.assertQueue(queueName, { durable: true });
  }

  async sendMessage(queueName, message) {
    if (!this.channel) {
      await this.connect();
    }

    await this.createQueue(queueName);

    const sent = this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    if (sent) {
      winston.info(`Mensaje enviado a la cola ${queueName}`);
    } else {
      winston.warn(`No se pudo enviar el mensaje a la cola ${queueName}`);
    }

    return sent;
  }

  async consumeMessages(queueName, callback) {
    if (!this.channel) {
      await this.connect();
    }

    await this.createQueue(queueName);

    this.channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const message = JSON.parse(msg.content.toString());
          await callback(message);
          this.channel.ack(msg);
        } catch (error) {
          winston.error('Error al procesar el mensaje:', error);
          this.channel.nack(msg);
        }
      }
    });
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }

    if (this.connection) {
      await this.connection.close();
    }
  }
}

module.exports = new MessageBroker();
