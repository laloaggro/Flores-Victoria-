const amqp = require('amqplib');

// Mock de amqplib
jest.mock('amqplib', () => {
  return {
    connect: jest.fn().mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue({
        assertQueue: jest.fn().mockResolvedValue(),
        sendToQueue: jest.fn(),
        consume: jest.fn((queue, callback) => {
          // Simular recepción de un mensaje
          setTimeout(() => {
            callback({
              content: Buffer.from(JSON.stringify({ test: 'message' })),
              ack: jest.fn()
            });
          }, 100);
        }),
        assertExchange: jest.fn().mockResolvedValue(),
        publish: jest.fn(),
        bindQueue: jest.fn(),
        prefetch: jest.fn(),
        ack: jest.fn(),
        nack: jest.fn()
      }),
      close: jest.fn()
    })
  };
});

const { sendMessage, consumeMessages, publishMessage, subscribeToExchange } = require('../../microservices/messaging-service/src/app');

describe('Messaging Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería enviar un mensaje a una cola', async () => {
    const queue = 'test-queue';
    const message = { test: 'data' };
    
    await sendMessage(queue, message);
    
    // Verificar que se haya llamado a los métodos correctos
    expect(amqp.connect().createChannel().assertQueue).toHaveBeenCalledWith(queue, { durable: true });
    expect(amqp.connect().createChannel().sendToQueue).toHaveBeenCalled();
  });

  test('debería consumir mensajes de una cola', async () => {
    const queue = 'test-queue';
    const callback = jest.fn();
    
    await consumeMessages(queue, callback);
    
    // Esperar a que se procese el mensaje
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verificar que se haya llamado al callback
    expect(callback).toHaveBeenCalledWith({ test: 'message' });
  });

  test('debería publicar un mensaje en un exchange', async () => {
    const exchange = 'test-exchange';
    const routingKey = 'test.key';
    const message = { test: 'data' };
    
    await publishMessage(exchange, routingKey, message);
    
    // Verificar que se haya llamado a los métodos correctos
    expect(amqp.connect().createChannel().assertExchange).toHaveBeenCalledWith(exchange, 'topic', { durable: true });
    expect(amqp.connect().createChannel().publish).toHaveBeenCalled();
  });

  test('debería suscribirse a un exchange', async () => {
    const exchange = 'test-exchange';
    const routingKey = 'test.key';
    const queue = 'test-queue';
    const callback = jest.fn();
    
    await subscribeToExchange(exchange, routingKey, queue, callback);
    
    // Esperar a que se procese el mensaje
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verificar que se haya llamado al callback
    expect(callback).toHaveBeenCalledWith({ test: 'message' });
  });
});