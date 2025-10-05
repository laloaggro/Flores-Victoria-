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

// Nuevos productos con las imágenes copiadas
const newProducts = [
  {
    name: 'Ramo Elegante de Rosas Blancas',
    description: 'Hermoso ramo de rosas blancas frescas, perfecto para ocasiones especiales.',
    price: 15000,
    image_url: './assets/images/products/Ramo1.avif',
    category: 'Ramos'
  },
  {
    name: 'Romántico Ramo de Rosas Rosadas',
    description: 'Encantador ramo de rosas rosadas con follaje decorativo, ideal para expresar amor.',
    price: 18000,
    image_url: './assets/images/products/romantico-ramo-rosas-rosadas_191095-83984.avif',
    category: 'Ramos'
  },
  {
    name: 'Arreglo Floral Exótico',
    description: 'Composición floral con flores exóticas y tropicales para decorar espacios especiales.',
    price: 25000,
    image_url: './assets/images/products/Bouquet De Rosa Blanca Con Tallos Y Elegantes Arreglos Florales.webp',
    category: 'Arreglos'
  },
  {
    name: 'Ramo Colorido de Flores Silvestres',
    description: 'Precioso ramo con una variedad de flores silvestres en tonos vibrantes.',
    price: 12000,
    image_url: './assets/images/products/1.avif',
    category: 'Ramos'
  },
  {
    name: 'Arreglo de Girasoles y Rosas',
    description: 'Alegre combinación de girasoles y rosas amarillas para iluminar cualquier espacio.',
    price: 20000,
    image_url: './assets/images/products/2.avif',
    category: 'Arreglos'
  },
  {
    name: 'Elegante Cesta de Flores',
    description: 'Cesta decorativa llena de flores frescas de temporada, ideal para regalar.',
    price: 22000,
    image_url: './assets/images/products/3.avif',
    category: 'Arreglos'
  },
  {
    name: 'Ramo de Tulipanes Multicolor',
    description: 'Ramo vibrante con tulipanes de varios colores, símbolo de primavera y renovación.',
    price: 16000,
    image_url: './assets/images/products/4.avif',
    category: 'Ramos'
  },
  {
    name: 'Corona de Flores Fúnebre',
    description: 'Corona de flores con crisantemos y follaje, adecuada para expresar condolencias.',
    price: 35000,
    image_url: './assets/images/products/6.avif',
    category: 'Condolencias'
  },
  {
    name: 'Centro de Mesa Floral',
    description: 'Centro de mesa elegante con flores frescas, ideal para eventos especiales.',
    price: 28000,
    image_url: './assets/images/products/7.avif',
    category: 'Arreglos'
  },
  {
    name: 'Ramo de Lirios y Rosas',
    description: 'Combinación perfecta de lirios blancos y rosas rojas, símbolo de pasión y pureza.',
    price: 19000,
    image_url: './assets/images/products/8.avif',
    category: 'Ramos'
  }
];

// Insertar nuevos productos en la base de datos
const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)');

newProducts.forEach((product, index) => {
  stmt.run(product.name, product.description, product.price, product.image_url, product.category, function(err) {
    if (err) {
      console.error('Error al insertar producto:', err.message);
    } else {
      console.log(`Producto insertado: ${product.name} - $${product.price} - ${product.category} - ${product.image_url}`);
    }
    
    // Cerrar la declaración después del último producto
    if (index === newProducts.length - 1) {
      stmt.finalize();
    }
  });
});

// Cerrar la base de datos después de insertar todos los productos
db.close((err) => {
  if (err) {
    console.error('Error al cerrar la base de datos:', err.message);
  } else {
    console.log('Base de datos cerrada correctamente');
  }
  process.exit(0);
});