const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a la base de datos
const db = new sqlite3.Database(path.join(__dirname, 'products.db'), (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Verificar el número de productos
db.serialize(() => {
  db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
    if (err) {
      console.error('Error al contar productos:', err.message);
    } else {
      console.log(`Número total de productos: ${row.count}`);
    }
  });

  // Mostrar los primeros 5 productos como ejemplo
  db.all(`SELECT * FROM products LIMIT 5`, (err, rows) => {
    if (err) {
      console.error('Error al obtener productos:', err.message);
    } else {
      console.log('\nPrimeros 5 productos:');
      console.log('====================');
      rows.forEach((row) => {
        console.log(`ID: ${row.id}`);
        console.log(`Nombre: ${row.name}`);
        console.log(`Descripción: ${row.description}`);
        console.log(`Precio: $${row.price}`);
        console.log(`Categoría: ${row.category}`);
        console.log(`URL de imagen: ${row.image_url}`);
        console.log('------------------------');
      });
    }
  });
});

// Cerrar la conexión
db.close((err) => {
  if (err) {
    console.error('Error al cerrar la conexión:', err.message);
  } else {
    console.log('Conexión a la base de datos cerrada');
  }
});