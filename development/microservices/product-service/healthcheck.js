const http = require('http');

// Opciones para la solicitud HTTP
const options = {
  host: 'localhost',
  port: 3002,
  path: '/health',
  timeout: 2000
};

// Crear solicitud HTTP para verificar el estado del servicio
const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0); // Saludable
  } else {
    process.exit(1); // No saludable
  }
});

// Manejar errores de timeout
request.on('error', (err) => {
  console.log('ERROR');
  process.exit(1);
});

// Establecer timeout
request.setTimeout(options.timeout, () => {
  console.log('TIMEOUT');
  request.destroy();
  process.exit(1);
});

// Enviar solicitud
request.end();