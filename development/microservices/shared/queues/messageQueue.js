const redis = require('redis');

/**
 * Sistema de colas de mensajes con Redis
 */
class MessageQueue {
  constructor(redisConfig) {
    this.redisClient = redis.createClient({
      host: redisConfig.host,
      port: redisConfig.port
    });
    
    this.redisClient.on('error', (err) => {
      console.error('Error de conexión a Redis (colas):', err);
    });
    
    this.redisClient.connect().then(() => {
      console.log('Conexión a Redis (colas) establecida correctamente');
    }).catch((err) => {
      console.error('Error conectando a Redis (colas):', err);
    });
  }

  /**
   * Publicar un mensaje en una cola
   * @param {string} queueName - Nombre de la cola
   * @param {object} message - Mensaje a publicar
   */
  async publish(queueName, message) {
    try {
      const messageString = JSON.stringify(message);
      await this.redisClient.lPush(queueName, messageString);
      console.log(`Mensaje publicado en cola ${queueName}:`, message);
    } catch (error) {
      console.error(`Error publicando mensaje en cola ${queueName}:`, error);
    }
  }

  /**
   * Suscribirse a una cola y procesar mensajes
   * @param {string} queueName - Nombre de la cola
   * @param {function} handler - Función para procesar mensajes
   */
  async subscribe(queueName, handler) {
    try {
      // Procesar mensajes en un bucle
      setInterval(async () => {
        try {
          const message = await this.redisClient.rPop(queueName);
          if (message) {
            const parsedMessage = JSON.parse(message);
            await handler(parsedMessage);
          }
        } catch (error) {
          console.error(`Error procesando mensaje de cola ${queueName}:`, error);
        }
      }, 1000); // Verificar cada segundo
    } catch (error) {
      console.error(`Error suscribiéndose a cola ${queueName}:`, error);
    }
  }

  /**
   * Obtener el tamaño de una cola
   * @param {string} queueName - Nombre de la cola
   * @returns {number} Tamaño de la cola
   */
  async getQueueLength(queueName) {
    try {
      return await this.redisClient.lLen(queueName);
    } catch (error) {
      console.error(`Error obteniendo tamaño de cola ${queueName}:`, error);
      return 0;
    }
  }

  /**
   * Cerrar conexión a Redis
   */
  async close() {
    try {
      await this.redisClient.quit();
      console.log('Conexión a Redis (colas) cerrada');
    } catch (error) {
      console.error('Error cerrando conexión a Redis (colas):', error);
    }
  }
}

module.exports = MessageQueue;