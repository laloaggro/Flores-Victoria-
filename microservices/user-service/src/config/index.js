module.exports = {
  port: process.env.PORT || 3003,
  database: {
    url: process.env.DATABASE_URL || 'postgresql://flores_user:flores_password@postgres:5432/flores_db',
    name: 'flores_db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key'
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@rabbitmq:5672'
  }
};