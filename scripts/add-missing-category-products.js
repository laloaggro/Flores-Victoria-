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

// Función para agregar productos a las categorías que no aparecen
function addMissingCategoryProducts() {
  // Definir productos para las categorías que no aparecen en el catálogo
  const missingCategoryProducts = [
    // Productos para Insumos
    {
      name: 'Fertilizante Floral Premium',
      description: 'Fertilizante líquido premium para flores, fórmula balanceada con microelementos esenciales. Presentación de 500ml.',
      price: 12500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    {
      name: 'Tierra Especial para Flores',
      description: 'Mezcla especial de tierra para flores con perlita, vermiculita y humus de lombriz. Bolsa de 5 litros.',
      price: 8900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    {
      name: 'Sustrato para Orquídeas Profesional',
      description: 'Sustrato profesional para orquídeas con corteza de pino, carbón y fibra de coco. Bolsa de 3 litros.',
      price: 15600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    {
      name: 'Abono Orgánico Universal',
      description: 'Abono orgánico universal para todo tipo de plantas y flores. Presentación de 1kg.',
      price: 7800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    {
      name: 'Vermiculita para Germinación',
      description: 'Vermiculita de grano fino para germinación de semillas y enraizamiento de esquejes. Bolsa de 2 litros.',
      price: 5600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    {
      name: 'Perlitas Expandidas',
      description: 'Perlitas expandidas para mejorar el drenaje del suelo. Bolsa de 5 litros.',
      price: 6200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    {
      name: 'Humus de Lombriz Premium',
      description: 'Humus de lombriz premium 100% natural, mejora la estructura del suelo y nutre las plantas. Bolsa de 2kg.',
      price: 9800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    {
      name: 'Control de plagas ecológico',
      description: 'Control ecológico de plagas para plantas y flores. Spray de 500ml con ingredientes naturales.',
      price: 11200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    {
      name: 'Nutriente Floral Fortalecedor',
      description: 'Nutriente floral fortalecedor con vitaminas y aminoácidos. Presentación de 250ml.',
      price: 13500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    {
      name: 'Compostador de Cocina',
      description: 'Compostador de cocina con filtro de carbón activado para interior. Capacidad de 3 litros.',
      price: 22900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos'
    },
    
    // Productos para Accesorios
    {
      name: 'Macetero Colgante Elegante',
      description: 'Macetero colgante elegante de cerámica con acabado mate. Diámetro de 15cm.',
      price: 16800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    },
    {
      name: 'Regadera de Cobre Decorativa',
      description: 'Regadera de cobre decorativa con boquilla fina para riego preciso. Capacidad de 1.5 litros.',
      price: 24500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    },
    {
      name: 'Soporte para Macetas Moderno',
      description: 'Soporte para macetas moderno de metal con diseño geométrico. Altura ajustable de 40-60cm.',
      price: 18900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    },
    {
      name: 'Juego de Macetas Cerámica',
      description: 'Juego de 3 macetas de cerámica en tonos tierra con diseños rústicos. Medidas: 12cm, 18cm y 25cm.',
      price: 29900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    },
    {
      name: 'Portamacetas de Madera Natural',
      description: 'Portamacetas de madera natural con acabado ecológico. Para maceta de hasta 20cm de diámetro.',
      price: 12600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    },
    {
      name: 'Decoración de Jardín Lumínica',
      description: 'Decoración de jardín luminica solar con forma de flor. Carga automática durante el día.',
      price: 15800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    },
    {
      name: 'Riego Automático Inteligente',
      description: 'Sistema de riego automático inteligente programable para 4 zonas. Incluye temporizador digital.',
      price: 45600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    },
    {
      name: 'Cortasetos Profesional',
      description: 'Cortasetos profesional eléctrico con cuchillas de acero templado. Potencia de 600W.',
      price: 32500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    },
    {
      name: 'Kit de Herramientas de Jardinería',
      description: 'Kit completo de herramientas de jardinería con 5 piezas en funda de cuero. Incluye pala, rastrillo, tijeras, etc.',
      price: 27800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    },
    {
      name: 'Lámpara de Crecimiento LED',
      description: 'Lámpara de crecimiento LED full spectrum para plantas de interior. Potencia de 30W con control de intensidad.',
      price: 21500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios'
    }
  ];

  // Preparar la declaración para insertar productos
  const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)');
  
  // Insertar cada producto
  missingCategoryProducts.forEach((product, index) => {
    stmt.run(product.name, product.description, product.price, product.image_url, product.category, function(err) {
      if (err) {
        console.error('Error al insertar producto:', err.message);
      } else {
        console.log(`Producto insertado: ${product.name} - $${product.price} - ${product.category}`);
      }
      
      // Cerrar la declaración después del último producto
      if (index === missingCategoryProducts.length - 1) {
        stmt.finalize((err) => {
          if (err) {
            console.error('Error al finalizar la declaración:', err.message);
          } else {
            console.log('Todos los productos de categorías faltantes han sido insertados');
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
addMissingCategoryProducts();