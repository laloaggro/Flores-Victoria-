const fs = require('fs');

const { Client } = require('pg');

const config = require('./index');

// Leer la contraseña desde el archivo secreto si no está en las variables de entorno
const getPassword = () => {
  // Primero intentamos obtener la contraseña de las variables de entorno
  if (process.env.POSTGRES_PASSWORD) {
    console.log('Usando contraseña desde variable de entorno POSTGRES_PASSWORD');
    return process.env.POSTGRES_PASSWORD;
  }

  if (process.env.DB_PASSWORD) {
    console.log('Usando contraseña desde variable de entorno DB_PASSWORD');
    return process.env.DB_PASSWORD;
  }

  // Si no está en variables de entorno, intentamos leer desde el archivo secreto
  try {
    console.log('Intentando leer contraseña desde archivo secreto: /run/secrets/postgres_password');
    const password = fs.readFileSync('/run/secrets/postgres_password', 'utf8').trim();
    console.log(
      'Contraseña leída correctamente desde archivo secreto:',
      password ? '****' : 'vacía'
    );
    return password;
  } catch (err) {
    console.warn('Advertencia: No se pudo leer el archivo de contraseña secreta:', err.message);
    return '';
  }
};

// Verificar que la configuración de la base de datos esté completa
if (!config.database.name) {
  throw new Error(
    'No se encontró POSTGRES_DB ni DB_NAME. La base de datos debe estar configurada.'
  );
}

if (!config.database.user) {
  throw new Error(
    'No se encontró POSTGRES_USER ni DB_USER. El usuario de base de datos debe estar configurado.'
  );
}

// Obtener la contraseña
const password = getPassword();

// Registrar información de conexión (sin mostrar la contraseña real por seguridad)
console.log(
  `Configuración de base de datos: host=${config.database.host}, port=${config.database.port}, database=${config.database.name}, user=${config.database.user}`
);

// Crear el cliente de base de datos
const client = new Client({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password,
});

module.exports = {
  client,
  connect: () => {
    console.log('Intentando conectar a la base de datos...');
    console.log(
      `Detalles de conexión: host=${config.database.host}, port=${config.database.port}, database=${config.database.name}, user=${config.database.user}`
    );
    return client
      .connect()
      .then(() => {
        console.log('Conexión a la base de datos establecida correctamente');
      })
      .catch((err) => {
        console.error('Error al conectar a la base de datos:', err.message);
        console.error('Código de error:', err.code);
        throw err;
      });
  },
};
