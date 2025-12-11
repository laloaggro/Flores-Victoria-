/**
 * Configuración del Promotion Service
 * Versión simplificada
 */

require('dotenv').config();

const config = {
  port: process.env.PROMOTION_SERVICE_PORT || 3019,
  
  mongodb: {
    uri: process.env.MONGODB_URI || 
         process.env.PROMOTION_SERVICE_MONGODB_URI || 
         'mongodb://localhost:27017/flores_victoria',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = config;
