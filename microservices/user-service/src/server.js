const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/users');
const config = require('./config/index');

const app = express();
const PORT = parseInt(config.port, 10); // Asegurarse de que el puerto sea un número

// Middleware
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

// Conexión a la base de datos y arranque del servidor
console.log('Iniciando conexión a la base de datos...');
sequelize.connect()
  .then(() => {
    // Asegurarse de que siempre escuchamos en 0.0.0.0 independientemente de las variables de entorno
    // Usar un enfoque más explícito para evitar que Express interprete variables de entorno
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servicio de usuarios ejecutándose en el puerto ${PORT}`);
      console.log(`Conectado a la base de datos: ${config.database.name}`);
    });
    
    // Manejo de señales de cierre
    process.on('SIGTERM', () => {
      console.log('Recibida señal SIGTERM. Cerrando servidor...');
      server.close(() => {
        sequelize.client.end(() => {
          console.log('Conexión a base de datos cerrada');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('Recibida señal SIGINT. Cerrando servidor...');
      server.close(() => {
        sequelize.client.end(() => {
          console.log('Conexión a base de datos cerrada');
          process.exit(0);
        });
      });
    });
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  });

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});