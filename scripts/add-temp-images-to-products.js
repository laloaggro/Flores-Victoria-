const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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

// Función para agregar imágenes temporales a la base de datos
function addTempImagesToProducts() {
  // Definir productos con las imágenes temporales
  const tempProducts = [
    {
      name: 'Bouquet De Rosa Blanca Con Tallos Y Elegantes Arreglos Florales',
      description: 'Hermoso bouquet de rosas blancas con tallos elegantes, perfecto para ocasiones especiales.',
      price: 15000,
      image_url: '/assets/images/products/Bouquet De Rosa Blanca Con Tallos Y Elegantes Arreglos Florales.webp',
      category: 'Ramos'
    },
    {
      name: 'Captura de Arreglo Floral',
      description: 'Arreglo floral completo con una selección variada de flores frescas.',
      price: 20000,
      image_url: '/assets/images/products/Captura desde 2025-08-27 20-11-50.png',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo Floral 1',
      description: 'Diseño clásico de arreglo floral con flores de temporada.',
      price: 18000,
      image_url: '/assets/images/products/flower_arrangement_1.jpg',
      category: 'Arreglos'
    },
    {
      name: 'Flores Variadas',
      description: 'Selección colorida de flores frescas para cualquier ocasión.',
      price: 12000,
      image_url: '/assets/images/products/images.jpeg',
      category: 'Ramos'
    },
    {
      name: 'Ramo 1',
      description: 'Ramo de flores frescas cuidadosamente seleccionadas.',
      price: 10000,
      image_url: '/assets/images/products/Ramo1.avif',
      category: 'Ramos'
    },
    {
      name: 'Ramo Romántico de Rosas Rosadas',
      description: 'Hermoso ramo romántico de rosas rosadas, ideal para expresar amor y cariño.',
      price: 16000,
      image_url: '/assets/images/products/romantico-ramo-rosas-rosadas_191095-83984.avif',
      category: 'Ramos'
    },
    {
      name: 'Arreglo Especial 1',
      description: 'Arreglo floral especial con una combinación única de flores y follajes.',
      price: 22000,
      image_url: '/assets/images/products/1.avif',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo Premium 2',
      description: 'Arreglo floral premium con flores de la más alta calidad.',
      price: 25000,
      image_url: '/assets/images/products/2.avif',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo Elegante 3',
      description: 'Arreglo floral elegante con diseño sofisticado y flores seleccionadas.',
      price: 19000,
      image_url: '/assets/images/products/3.avif',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo Clásico 4',
      description: 'Arreglo floral clásico con una combinación tradicional de flores.',
      price: 17000,
      image_url: '/assets/images/products/4.avif',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo Exótico 6',
      description: 'Arreglo floral exótico con flores poco comunes y diseño innovador.',
      price: 21000,
      image_url: '/assets/images/products/6.avif',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo Tropical 7',
      description: 'Arreglo floral tropical con flores vibrantes y follajes exuberantes.',
      price: 23000,
      image_url: '/assets/images/products/7.avif',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo Vibrante 8',
      description: 'Arreglo floral vibrante con una paleta de colores intensos y llamativos.',
      price: 24000,
      image_url: '/assets/images/products/8.avif',
      category: 'Arreglos'
    }
  ];

  // Preparar la declaración para insertar productos
  const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)');
  
  // Insertar cada producto
  tempProducts.forEach((product, index) => {
    stmt.run(product.name, product.description, product.price, product.image_url, product.category, function(err) {
      if (err) {
        console.error('Error al insertar producto:', err.message);
      } else {
        console.log(`Producto insertado: ${product.name} - $${product.price} - ${product.category} - ${product.image_url}`);
      }
      
      // Cerrar la declaración después del último producto
      if (index === tempProducts.length - 1) {
        stmt.finalize((err) => {
          if (err) {
            console.error('Error al finalizar la declaración:', err.message);
          } else {
            console.log('Todos los productos temporales han sido insertados');
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
  });
}

// Ejecutar la función
addTempImagesToProducts();