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
  { oldPath: './assets/images/products/', newPath: '/assets/images/products/' },
  { oldPath: '/assets/images/products/', newPath: '/assets/images/products/' }
];

updates.forEach(update => {
  const sql = `UPDATE products SET image_url = REPLACE(image_url, '${update.oldPath}', '${update.newPath}') WHERE image_url LIKE '${update.oldPath}%'`;
  
  db.run(sql, function(err) {
    if (err) {
      console.error('Error al actualizar las rutas de imágenes:', err.message);
    } else {
      console.log(`Rutas actualizadas: ${this.changes} productos modificados`);
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