
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Verificar datos del usuario
db.get('SELECT * FROM users WHERE email = ?', ['laloaggro@gmail.com'], (err, row) => {
  if (err) {
    console.error('Error al obtener usuario:', err.message);
  } else {
    console.log('Datos del usuario:', row);
  }
});

// Verificar registros de inicio de sesión
db.all('SELECT * FROM login_logs ORDER BY login_time DESC LIMIT 5', (err, rows) => {
  if (err) {
    console.error('Error al obtener registros de login:', err.message);
  } else {
    console.log('Registros de inicio de sesión (últimos 5):', rows);
  }
  
  // Cerrar la conexión
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar la base de datos:', err.message);
    } else {
      console.log('Base de datos cerrada correctamente');
    }
  });
});

