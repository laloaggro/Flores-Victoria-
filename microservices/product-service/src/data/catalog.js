// Catálogo completo de productos Victoria Arreglos Florales
// Basado en la estructura profesional propuesta

const productCatalog = {
  // Productos por Ocasión - Aniversario & Amor
  anniversary_love: [
    {
      id: 'AML001',
      name: 'Ramo "Pasión Eterna"',
      description: 'Sorprende a tu ser amado con este exuberante ramo de 12 rosas rojas premium con follaje verde fresco y envoltura de lino artesanal. Símbolo de un amor profundo y eterno, perfecto para aniversarios o para decir "Te Amo" en un día especial.',
      price: 45.99,
      size: 'Altura: 45cm, Diámetro: 30cm',
      flowers: ['Rosas rojas premium', 'Follaje verde', 'Eucalipto'],
      colors: ['rojo', 'verde'],
      delivery_time: '2-4 horas',
      occasions: ['aniversario', 'amor', 'san_valentin'],
      category: 'ramos_clasicos',
      stock: 15,
      images: ['/images/productos/passion-eterna-1.jpg', '/images/productos/passion-eterna-2.jpg'],
      featured: true,
      rating: 4.9,
      reviews_count: 156
    },
    {
      id: 'AML002',
      name: 'Caja de Corazón "Enamorados"',
      description: 'Delicada caja en forma de corazón con rosas rojas y blancas cuidadosamente dispuestas. Un regalo que habla por sí solo del amor verdadero. Perfecta para sorprender en ocasiones románticas especiales.',
      price: 52.99,
      size: '20cm x 20cm x 8cm',
      flowers: ['Rosas rojas', 'Rosas blancas', 'Gipsophila'],
      colors: ['rojo', 'blanco'],
      delivery_time: '2-4 horas',
      occasions: ['aniversario', 'amor', 'san_valentin', 'compromiso'],
      category: 'arreglos_especiales',
      stock: 8,
      images: ['/images/productos/corazon-enamorados-1.jpg'],
      featured: true,
      rating: 4.8,
      reviews_count: 89
    },
    {
      id: 'AML003',
      name: 'Arreglo "Dulce Compañía"',
      description: 'Combinación armoniosa de rosas, liliums y gipsophilas en colores suaves como rosa, blanco y crema. Un arreglo que transmite ternura y complicidad perfecta para parejas que celebran momentos especiales juntos.',
      price: 38.99,
      size: 'Altura: 35cm',
      flowers: ['Rosas', 'Liliums', 'Gipsophila'],
      colors: ['rosa', 'blanco', 'crema'],
      delivery_time: 'Same day',
      occasions: ['aniversario', 'amor', 'amistad'],
      category: 'arreglos_jarrones',
      stock: 12,
      images: ['/images/productos/dulce-compania-1.jpg'],
      rating: 4.7,
      reviews_count: 67
    },
    {
      id: 'AML004',
      name: 'Orquídea Elegante',
      description: 'Majestuosa orquídea phalaenopsis en maceta de cerámica artesanal. Símbolo de amor sofisticado y lujo duradero. Un regalo que perdura en el tiempo y embellece cualquier espacio con su elegancia natural.',
      price: 65.99,
      size: 'Altura total: 50cm, Maceta: 15cm diámetro',
      flowers: ['Orquídea Phalaenopsis'],
      colors: ['blanco', 'rosa', 'violeta'],
      delivery_time: '24 horas',
      occasions: ['aniversario', 'amor', 'lujo'],
      category: 'plantas_orquideas',
      stock: 6,
      images: ['/images/productos/orquidea-elegante-1.jpg'],
      care_instructions: 'Regar una vez por semana, luz indirecta',
      rating: 4.9,
      reviews_count: 43
    },
    {
      id: 'AML005',
      name: 'Ramo "Te Amo Mamá"',
      description: 'Ramo brillante y colorido que expresa todo el amor familiar. Combinación perfecta de flores de temporada en tonos vibrantes que celebran el vínculo especial entre madre e hijo. Ideal para el Día de la Madre o cualquier momento especial.',
      price: 42.99,
      size: 'Altura: 40cm',
      flowers: ['Gerberas', 'Claveles', 'Rosas', 'Statice'],
      colors: ['multicolor', 'rosa', 'amarillo', 'naranja'],
      delivery_time: '2-4 horas',
      occasions: ['dia_madre', 'amor_familiar', 'agradecimiento'],
      category: 'ramos_clasicos',
      stock: 10,
      images: ['/images/productos/te-amo-mama-1.jpg'],
      rating: 4.8,
      reviews_count: 92
    }
  ],

  // Productos por Ocasión - Cumpleaños
  birthday: [
    {
      id: 'BDY001',
      name: 'Ramo "Felicidad Colorida"',
      description: '¡Celebra la vida con esta explosión de alegría! Girasoles radiantes, crisantemos brillantes y claveles vibrantes en amarillo, naranja y fucsia. Un ramo que contagia felicidad y transmite los mejores deseos de cumpleaños.',
      price: 35.99,
      size: 'Altura: 42cm',
      flowers: ['Girasoles', 'Crisantemos', 'Claveles'],
      colors: ['amarillo', 'naranja', 'fucsia'],
      delivery_time: 'Same day',
      occasions: ['cumpleanos', 'celebracion', 'alegria'],
      category: 'ramos_clasicos',
      stock: 18,
      images: ['/images/productos/felicidad-colorida-1.jpg'],
      featured: true,
      rating: 4.6,
      reviews_count: 124
    },
    {
      id: 'BDY002',
      name: 'Arreglo "Alegría Vibrante"',
      description: 'Gerberas sonrientes, rosas frescas y statice delicado en un jarrón moderno de cerámica. Este arreglo contemporáneo irradia energía positiva y es perfecto para hacer brillar el día especial de esa persona querida.',
      price: 48.99,
      size: 'Altura total: 45cm, Jarrón incluido',
      flowers: ['Gerberas', 'Rosas', 'Statice'],
      colors: ['multicolor', 'rosa', 'amarillo', 'naranja'],
      delivery_time: '2-4 horas',
      occasions: ['cumpleanos', 'celebracion'],
      category: 'arreglos_jarrones',
      stock: 12,
      images: ['/images/productos/alegria-vibrante-1.jpg'],
      rating: 4.7,
      reviews_count: 78
    },
    {
      id: 'BDY003',
      name: 'Cesta "Dulce Cumpleaños"',
      description: 'La combinación perfecta entre belleza y dulzura. Arreglo floral mixto acompañado de una exquisita caja de chocolates gourmet artesanales. Un regalo doble que endulza el corazón y deleita los sentidos.',
      price: 58.99,
      size: 'Cesta: 30cm x 20cm',
      flowers: ['Mix de flores de temporada'],
      colors: ['multicolor'],
      delivery_time: '4-6 horas',
      occasions: ['cumpleanos', 'celebracion', 'agradecimiento'],
      category: 'cestas_canastas',
      stock: 8,
      extras: ['Chocolates gourmet artesanales'],
      images: ['/images/productos/dulce-cumpleanos-1.jpg'],
      rating: 4.8,
      reviews_count: 56
    },
    {
      id: 'BDY004',
      name: 'Ramo "Elegancia Femenina"',
      description: 'Suavidad y elegancia en perfecta armonía. Rosas rosadas delicadas y liliums blancos puros crean un ramo sofisticado y femenino. Ideal para mujeres que aprecian la belleza sutil y refinada.',
      price: 44.99,
      size: 'Altura: 38cm',
      flowers: ['Rosas rosadas', 'Liliums blancos', 'Follaje verde'],
      colors: ['rosa', 'blanco', 'verde'],
      delivery_time: '2-4 horas',
      occasions: ['cumpleanos', 'elegancia', 'feminidad'],
      category: 'ramos_clasicos',
      stock: 14,
      images: ['/images/productos/elegancia-femenina-1.jpg'],
      rating: 4.7,
      reviews_count: 63
    },
    {
      id: 'BDY005',
      name: 'Mini Jardín Suculento',
      description: 'Para quienes prefieren regalos duraderos y modernos. Colección de suculentas variadas en maceta de cerámica contemporánea. Un regalo vivo que simboliza crecimiento y perdura en el tiempo, perfecto para espacios modernos.',
      price: 32.99,
      size: 'Maceta: 18cm diámetro x 12cm alto',
      flowers: ['Suculentas variadas'],
      colors: ['verde', 'gris', 'morado'],
      delivery_time: '24 horas',
      occasions: ['cumpleanos', 'moderno', 'duradero'],
      category: 'plantas_orquideas',
      stock: 15,
      care_instructions: 'Regar cada 10-15 días, luz indirecta',
      images: ['/images/productos/mini-jardin-suculento-1.jpg'],
      rating: 4.5,
      reviews_count: 34
    }
  ]
};

// Función para obtener todos los productos como array plano
function getAllProducts() {
  const allProducts = [];
  Object.values(productCatalog).forEach(categoryProducts => {
    allProducts.push(...categoryProducts);
  });
  return allProducts;
}

// Función para obtener productos por ocasión
function getProductsByOccasion(occasion) {
  return getAllProducts().filter(product => 
    product.occasions.includes(occasion)
  );
}

// Función para obtener productos por categoría
function getProductsByCategory(category) {
  return getAllProducts().filter(product => 
    product.category === category
  );
}

// Función para obtener productos por color
function getProductsByColor(color) {
  return getAllProducts().filter(product => 
    product.colors.includes(color)
  );
}

// Función para obtener productos en rango de precio
function getProductsByPriceRange(min, max) {
  return getAllProducts().filter(product => 
    product.price >= min && product.price <= max
  );
}

// Función para buscar productos por texto
function searchProducts(query) {
  const searchTerm = query.toLowerCase();
  return getAllProducts().filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.flowers.some(flower => flower.toLowerCase().includes(searchTerm))
  );
}

// Función para obtener productos destacados
function getFeaturedProducts() {
  return getAllProducts().filter(product => product.featured === true);
}

module.exports = {
  productCatalog,
  getAllProducts,
  getProductsByOccasion,
  getProductsByCategory,
  getProductsByColor,
  getProductsByPriceRange,
  searchProducts,
  getFeaturedProducts
};