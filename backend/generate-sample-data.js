const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const https = require('https');

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

// Crear tabla de productos si no existe
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Error al crear la tabla de productos:', err.message);
    process.exit(1);
  } else {
    console.log('Tabla de productos verificada o creada');
    
    // Crear la tabla de usuarios si no existe
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT,
      google_id TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error al crear la tabla de usuarios:', err.message);
        process.exit(1);
      } else {
        console.log('Tabla de usuarios verificada o creada');
        
        // Limpiar datos existentes
        db.run('DELETE FROM products', (err) => {
          if (err) {
            console.error('Error al limpiar la tabla de productos:', err.message);
            process.exit(1);
          } else {
            console.log('Datos anteriores eliminados');
            generateSampleData();
          }
        });
      }
    });
  }
});

// Función para descargar una imagen y guardarla localmente
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const imagePath = path.join(__dirname, '..', 'frontend', 'assets', 'images', 'products', filename);
    
    const file = fs.createWriteStream(imagePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Imagen descargada: ${filename}`);
          resolve(`/assets/images/products/${filename}`);
        });
      } else {
        // Si hay un error, crear una imagen de marcador de posición
        file.close();
        fs.unlink(imagePath, () => {}); // Eliminar archivo incompleto
        console.log(`Error al descargar ${filename}, creando imagen de marcador de posición`);
        createPlaceholderImage(imagePath, filename)
          .then(localPath => resolve(localPath))
          .catch(err => reject(err));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(imagePath, () => {}); // Eliminar archivo incompleto
      console.log(`Error de red al descargar ${filename}, creando imagen de marcador de posición`);
      createPlaceholderImage(imagePath, filename)
        .then(localPath => resolve(localPath))
        .catch(err => reject(err));
    });
  });
}

// Función para crear una imagen de marcador de posición
function createPlaceholderImage(imagePath, filename) {
  return new Promise((resolve) => {
    // Crear una imagen de marcador de posición simple con texto
    const placeholderContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#4CAF50"/>
  <text x="150" y="150" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">
    Imagen no disponible
  </text>
</svg>`;
    
    fs.writeFileSync(imagePath, placeholderContent);
    console.log(`Imagen de marcador de posición creada: ${filename}`);
    resolve(`/assets/images/products/${filename}`);
  });
}

// Función para generar datos de ejemplo
async function generateSampleData() {
  const categories = ['Arreglos', 'Condolencias', 'Coronas', 'Ramos', 'Jardinería'];
  const adjectives = ['Hermoso', 'Precioso', 'Magnífico', 'Exótico', 'Elegante', 'Espléndido', 'Maravilloso', 'Sublime', 'Encantador', 'Espectacular'];
  const nouns = ['Ramo', 'Bouquet', 'Corona', 'Arreglo', 'Centro', 'Cesta', 'Mesa', 'Jardín', 'Rosal', 'Girasol'];
  const descriptions = [
    'Composición floral con las mejores flores de la temporada',
    'Diseño único con flores frescas de temporada',
    'Arreglo floral especial para ocasiones memorables',
    'Selección premium de flores cuidadosamente combinadas',
    'Creación artística con flores de la más alta calidad',
    'Diseño exclusivo elaborado con materiales naturales',
    'Combinación perfecta de colores y texturas florales',
    'Arreglo elaborado con técnicas tradicionales y modernas',
    'Pieza floral que combina elegancia y frescura',
    'Creación personalizada según tus preferencias'
  ];
  
  // URLs de imágenes verificadas que funcionan
  const imageUrls = [
    'https://images.unsplash.com/photo-1593617133396-03503508724d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1490112167366-98580e1f53d5?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548772562-0bf1973fb041?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510951300960-009537c6cf20?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
  ];
  
  // Array de imágenes de ejemplo (ahora apuntan a rutas locales)
  const sampleImages = [
    '/assets/images/placeholder.svg',
    '/assets/images/placeholder.svg',
    '/assets/images/placeholder.svg',
    '/assets/images/placeholder.svg',
    '/assets/images/placeholder.svg'
  ];
  
  // Generar 20 productos de ejemplo (5 imágenes x 4 productos por imagen)
  const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)');
  
  try {
    // Descargar imágenes y generar productos
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const filename = `product_${i + 1}.jpg`;
      
      // Descargar imagen o crear marcador de posición
      const localImagePath = await downloadImage(imageUrl, filename);
      
      // Generar 4 productos por imagen
      for (let j = 1; j <= 4; j++) {
        const productIndex = i * 4 + j;
        const category = categories[Math.floor(Math.random() * categories.length)];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const name = `${adjective} ${noun} ${productIndex}`;
        
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        const price = Math.floor(Math.random() * 20000) + 5000; // Precio entre 5.000 y 25.000 CLP
        
        stmt.run(name, description, price, localImagePath, category, function(err) {
          if (err) {
            console.error('Error al insertar producto:', err.message);
          } else {
            console.log(`Producto insertado: ${name} - $${price} - ${category} - ${localImagePath}`);
          }
          
          // Cerrar la declaración después del último producto
          if (productIndex === 20) {
            stmt.finalize((err) => {
              if (err) {
                console.error('Error al finalizar la declaración:', err.message);
              } else {
                console.log('Todos los productos han sido insertados');
                db.close((err) => {
                  if (err) {
                    console.error('Error al cerrar la base de datos:', err.message);
                  } else {
                    console.log('Base de datos cerrada correctamente');
                  }
                  process.exit(0);
                });
              }
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Error al generar datos:', error.message);
    process.exit(1);
  }
}