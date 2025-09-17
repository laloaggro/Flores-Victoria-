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

// Nuevos productos con diferentes categorías
const newProducts = [
  // Nuevos productos para la categoría "Insumos"
  {
    name: 'Tierra para Macetas Premium',
    description: 'Tierra orgánica especial para macetas, ideal para el crecimiento saludable de tus plantas.',
    price: 8000,
    image_url: '/assets/images/products/product_1.jpg',
    category: 'Insumos'
  },
  {
    name: 'Fertilizante Orgánico Universal',
    description: 'Fertilizante 100% orgánico para todo tipo de plantas y flores.',
    price: 12000,
    image_url: '/assets/images/products/product_2.jpg',
    category: 'Insumos'
  },
  {
    name: 'Maceta de Cerámica Decorativa',
    description: 'Maceta de cerámica con diseño decorativo, disponible en varios colores.',
    price: 15000,
    image_url: '/assets/images/products/product_3.jpg',
    category: 'Insumos'
  },
  
  // Nuevos productos para la categoría "Accesorios"
  {
    name: 'Vela Aromática Floral',
    description: 'Vela aromática con fragancia floral para crear un ambiente acogedor.',
    price: 5000,
    image_url: '/assets/images/products/product_4.jpg',
    category: 'Accesorios'
  },
  {
    name: 'Portavelas de Vidrio Decorado',
    description: 'Portavelas de vidrio con diseños florales decorados a mano.',
    price: 3500,
    image_url: '/assets/images/products/product_5.jpg',
    category: 'Accesorios'
  },
  {
    name: 'Mantel Floral',
    description: 'Mantel con estampado floral, ideal para eventos especiales.',
    price: 20000,
    image_url: '/assets/images/products/product_6.jpg',
    category: 'Accesorios'
  },
  
  // Nuevos productos para la categoría "Plantas"
  {
    name: 'Orquídea Phalaenopsis',
    description: 'Orquídea de alta calidad con hermosas flores blancas, fácil de cuidar.',
    price: 25000,
    image_url: '/assets/images/products/orquidea.jpg',
    category: 'Plantas'
  },
  {
    name: 'Rosa Mosqueta en Maceta',
    description: 'Rosa mosqueta plantada en maceta con tierra especial, lista para florecer.',
    price: 18000,
    image_url: '/assets/images/products/rosas-rojas.jpg',
    category: 'Plantas'
  },
  {
    name: 'Cactus Decorativo',
    description: 'Cactus decorativo de fácil cuidado, ideal para interiores.',
    price: 7000,
    image_url: '/assets/images/products/product_7.svg',
    category: 'Plantas'
  },
  
  // Nuevos productos para la categoría "Coronas"
  {
    name: 'Corona de Rosas Blancas',
    description: 'Corona fúnebre elaborada con rosas blancas frescas, símbolo de pureza y respeto.',
    price: 45000,
    image_url: '/assets/images/products/product_8.svg',
    category: 'Coronas'
  },
  {
    name: 'Corona de Gladiolos',
    description: 'Corona fúnebre con gladiolos de varios colores, expresión de integridad y fortaleza.',
    price: 40000,
    image_url: '/assets/images/products/product_9.svg',
    category: 'Coronas'
  },
  {
    name: 'Corona de Crisantemos',
    description: 'Corona fúnebre con crisantemos blancos y verdes, símbolo de eterna juventud.',
    price: 38000,
    image_url: '/assets/images/products/product_10.svg',
    category: 'Coronas'
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