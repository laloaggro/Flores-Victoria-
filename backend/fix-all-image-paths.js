const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a la base de datos
const dbPath = path.join(__dirname, 'products.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
    process.exit(1);
  } else {
    console.log('Conectado a la base de datos de productos');
  }
});

// Actualizar las rutas de las imágenes para que sean relativas al directorio raíz
const updates = [
  // Corregir rutas que empiezan con './'
  { 
    sql: `UPDATE products SET image_url = SUBSTR(image_url, 2) WHERE image_url LIKE './assets/images/%'`,
    description: 'Corrigiendo rutas que empiezan con ./'
  },
  
  // Corregir rutas que no empiezan con '/'
  {
    sql: `UPDATE products SET image_url = '/' || image_url WHERE image_url LIKE 'assets/images/%'`,
    description: 'Agregando / al inicio de rutas que lo necesitan'
  },
  
  // Corregir rutas que tienen caracteres extraños
  {
    sql: `UPDATE products SET image_url = '/assets/images/products/' || SUBSTR(image_url, INSTR(image_url, 'products/') + 9) WHERE image_url LIKE '%products/%' AND image_url NOT LIKE '/assets/images/products/%'`,
    description: 'Corrigiendo rutas de productos'
  }
];

updates.forEach(update => {
  db.run(update.sql, function(err) {
    if (err) {
      console.error('Error al actualizar las rutas de imágenes:', err.message);
    } else {
      console.log(`${update.description}: ${this.changes} productos modificados`);
    }
  });
});

// Cerrar la base de datos
db.close((err) => {
  if (err) {
    console.error('Error al cerrar la base de datos:', err.message);
  } else {
    console.log('Base de datos cerrada correctamente');
  }
  process.exit(0);
});