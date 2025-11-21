const logger = require('../logger');

module.exports = {
  connectRabbitMQ: async () => {
    logger.info({ service: 'review-service' }, 'RabbitMQ connection placeholder');
  },
};
