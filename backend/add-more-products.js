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

// Función para agregar más productos a la base de datos
function addMoreProducts() {
  // Definir productos adicionales para equilibrar las categorías
  const additionalProducts = [
    // Productos para Coronas (necesitamos más)
    {
      name: 'Corona de Flores Elegante',
      description: 'Corona de flores elegante con rosas y follaje fresco, ideal para ocasiones solemnes.',
      price: 25000,
      image_url: '/assets/images/products/4.avif',
      category: 'Coronas'
    },
    {
      name: 'Corona Clásica Blanca',
      description: 'Corona clásica blanca con lirios y gerberas, símbolo de paz y respeto.',
      price: 28000,
      image_url: '/assets/images/products/6.avif',
      category: 'Coronas'
    },
    {
      name: 'Corona de Rosas Rojas',
      description: 'Corona impresionante de rosas rojas con follaje decorativo.',
      price: 30000,
      image_url: '/assets/images/products/7.avif',
      category: 'Coronas'
    },
    {
      name: 'Corona de Gladiolos',
      description: 'Corona de gladiolos multicolor con detalles en cinta satín.',
      price: 27000,
      image_url: '/assets/images/products/8.avif',
      category: 'Coronas'
    },
    {
      name: 'Corona de Girasoles',
      description: 'Corona vibrante de girasoles con eucalipto y hierbas aromáticas.',
      price: 26000,
      image_url: '/assets/images/products/3.avif',
      category: 'Coronas'
    },
    {
      name: 'Corona de Tulipanes',
      description: 'Corona delicada de tulipanes en tonos pastel con ramas decorativas.',
      price: 29000,
      image_url: '/assets/images/products/1.avif',
      category: 'Coronas'
    },
    {
      name: 'Corona de Carnaciones',
      description: 'Corona clásica de carnanções con follaje tradicional.',
      price: 24000,
      image_url: '/assets/images/products/2.avif',
      category: 'Coronas'
    },
    {
      name: 'Corona de Rosas Blancas',
      description: 'Corona de rosas blancas con detalles en perlas y cintas.',
      price: 31000,
      image_url: '/assets/images/products/Ramo1.avif',
      category: 'Coronas'
    },
    {
      name: 'Corona de Alstroemerias',
      description: 'Corona colorida de alstroemerias con follaje tropical.',
      price: 25500,
      image_url: '/assets/images/products/romantico-ramo-rosas-rosadas_191095-83984.avif',
      category: 'Coronas'
    },
    {
      name: 'Corona de Lirios',
      description: 'Corona de lirios blancos con rosas rojas y follaje clásico.',
      price: 32000,
      image_url: '/assets/images/products/Bouquet De Rosa Blanca Con Tallos Y Elegantes Arreglos Florales.webp',
      category: 'Coronas'
    },
    
    // Productos para Jardinería (necesitamos más)
    {
      name: 'Kit de Jardinería Básico',
      description: 'Kit completo con herramientas básicas para jardinería y guantes.',
      price: 15000,
      image_url: '/assets/images/products/images.jpeg',
      category: 'Jardinería'
    },
    {
      name: 'Maceta Decorativa Grande',
      description: 'Maceta de cerámica decorativa de gran tamaño con diseños florales.',
      price: 12000,
      image_url: '/assets/images/products/flower_arrangement_1.jpg',
      category: 'Jardinería'
    },
    {
      name: 'Fertilizante Orgánico',
      description: 'Fertilizante orgánico para todo tipo de plantas y flores, presentación de 1kg.',
      price: 8000,
      image_url: '/assets/images/products/Captura desde 2025-08-27 20-11-50.png',
      category: 'Jardinería'
    },
    {
      name: 'Tierra Nutritiva Premium',
      description: 'Tierra nutritiva premium para macetas y jardines, mezcla especial para flores.',
      price: 6500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería'
    },
    {
      name: 'Regadera Elegante',
      description: 'Regadera de metal con diseño elegante y capacidad de 2 litros.',
      price: 9500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería'
    },
    {
      name: 'Kit de Semillas Variadas',
      description: 'Kit con semillas de flores variadas de temporada, incluye instrucciones de cultivo.',
      price: 5500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería'
    },
    {
      name: 'Sustrato para Orquídeas',
      description: 'Sustrato especial para orquídeas con corteza de pino y carbón vegetal.',
      price: 7200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería'
    },
    {
      name: 'Tijeras de Podar Profesionales',
      description: 'Tijeras de podar profesionales con mango ergonómico y hojas de acero inoxidable.',
      price: 13500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería'
    },
    
    // Productos para Condolencias (necesitamos más)
    {
      name: 'Arreglo de Condolencia Clásico',
      description: 'Arreglo clásico de condolencia con lirios blancos y rosas rojas.',
      price: 22000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias'
    },
    {
      name: 'Cesta de Condolencia Natural',
      description: 'Cesta de condolencia con flores naturales y follaje fresco.',
      price: 24000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias'
    },
    {
      name: 'Ramo de Condolencia Blanco',
      description: 'Ramo de condolencia en tonos blancos con rosas y gerberas.',
      price: 18000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias'
    },
    {
      name: 'Corona de Condolencia Grande',
      description: 'Corona grande de condolencia con flores blancas y rojas.',
      price: 35000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias'
    },
    {
      name: 'Arreglo de Condolencia en Pie',
      description: 'Arreglo de condolencia en pie con flores frescas y cinta conmemorativa.',
      price: 32000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias'
    },
    {
      name: 'Cruz de Flores de Condolencia',
      description: 'Cruz decorativa de flores para condolencias con mensaje de consuelo.',
      price: 20000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias'
    },
    {
      name: 'Ramo de Condolencia Rosado',
      description: 'Ramo de condolencia en tonos rosados con alstroemerias y rosas.',
      price: 19000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias'
    },
    {
      name: 'Arreglo de Condolencia con Velas',
      description: 'Arreglo de condolencia con flores y velas decorativas de memoria.',
      price: 26000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias'
    },
    {
      name: 'Cesta de Condolencia con Rosas',
      description: 'Cesta de condolencia con rosas rojas y blancas en disposición artística.',
      price: 23000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias'
    },
    
    // Productos adicionales para Arreglos
    {
      name: 'Arreglo de Rosas Exóticas',
      description: 'Arreglo exclusivo con rosas exóticas y follaje tropical.',
      price: 21000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo de Tulipanes Primavera',
      description: 'Arreglo colorido de tulipanes de primavera con ramas florales.',
      price: 19500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo de Girasoles Radiante',
      description: 'Arreglo vibrante de girasoles con hierbas aromáticas y flores complementarias.',
      price: 18500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo de Lirios Blancos',
      description: 'Arreglo elegante de lirios blancos con rosas y follaje clásico.',
      price: 22500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos'
    },
    {
      name: 'Arreglo de Gladiolos Multicolor',
      description: 'Arreglo de gladiolos en tonos multicolor con detalles en cintas.',
      price: 20500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos'
    },
    
    // Productos adicionales para Ramos
    {
      name: 'Ramo de Peonías Elegante',
      description: 'Ramo de peonías elegante con follaje delicado y cintas decorativas.',
      price: 17500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos'
    },
    {
      name: 'Ramo de Flores Silvestres',
      description: 'Ramo encantador de flores silvestres con hierbas aromáticas.',
      price: 16000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos'
    },
    {
      name: 'Ramo de Orquídeas Blancas',
      description: 'Ramo exclusivo de orquídeas blancas con follaje tropical.',
      price: 24000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos'
    },
    {
      name: 'Ramo de Rosas Rosadas',
      description: 'Ramo romántico de rosas rosadas con eucalipto y baby breath.',
      price: 18500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos'
    },
    {
      name: 'Ramo de Gerberas Coloridas',
      description: 'Ramo alegre de gerberas en tonos vibrantes con follaje fresco.',
      price: 16500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos'
    }
  ];

  // Preparar la declaración para insertar productos
  const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)');
  
  // Insertar cada producto
  additionalProducts.forEach((product, index) => {
    stmt.run(product.name, product.description, product.price, product.image_url, product.category, function(err) {
      if (err) {
        console.error('Error al insertar producto:', err.message);
      } else {
        console.log(`Producto insertado: ${product.name} - $${product.price} - ${product.category}`);
      }
      
      // Cerrar la declaración después del último producto
      if (index === additionalProducts.length - 1) {
        stmt.finalize((err) => {
          if (err) {
            console.error('Error al finalizar la declaración:', err.message);
          } else {
            console.log('Todos los productos adicionales han sido insertados');
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
addMoreProducts();