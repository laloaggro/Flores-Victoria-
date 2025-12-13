const logger = require('../logger.simple');

module.exports = {
  connectRabbitMQ: async () => {
    logger.info({ service: 'review-service' }, 'RabbitMQ connection placeholder');
  },
};
