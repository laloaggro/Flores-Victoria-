// Productos iniciales para Victoria Arreglos Florales
// Precios en Pesos Chilenos (CLP) - Mercado realista

const initialProducts = [
  // CATEGORÍA: ANIVERSARIO & AMOR
  {
    id: 'AML001',
    name: 'Ramo "Pasión Eterna"',
    description:
      'Sorprende a tu ser amado con este exuberante ramo de 12 rosas rojas premium con follaje verde fresco y envoltura de lino artesanal. Símbolo de un amor profundo y eterno, perfecto para aniversarios o para decir "Te Amo" en un día especial.',
    price: 35000, // $35.000 CLP
    original_price: 42000, // Precio original para mostrar descuento
    category: 'aniversario_amor',
    stock: 15,
    featured: true,
    active: true,
    rating: 4.9,
    reviews_count: 156,
    size: 'Altura: 45cm, Diámetro: 30cm',
    delivery_time: '2-4 horas',
    flowers: ['Rosas rojas premium', 'Follaje verde', 'Eucalipto'],
    colors: ['rojo', 'verde'],
    occasions: ['aniversario', 'amor', 'san_valentin'],
    images: [
      '/images/productos/passion-eterna-1.webp',
      '/images/productos/passion-eterna-2.webp',
      '/images/productos/passion-eterna-3.webp',
    ],
    care_instructions: 'Cambiar agua cada 2 días, cortar tallos en diagonal',
  },
  {
    id: 'AML002',
    name: 'Caja de Corazón "Enamorados"',
    description:
      'Delicada caja en forma de corazón con rosas rojas y blancas cuidadosamente dispuestas. Un regalo que habla por sí solo del amor verdadero. Perfecta para sorprender en ocasiones románticas especiales.',
    price: 42000, // $42.000 CLP
    original_price: 48000,
    category: 'aniversario_amor',
    stock: 8,
    featured: true,
    active: true,
    rating: 4.8,
    reviews_count: 89,
    size: '20cm x 20cm x 8cm',
    delivery_time: '2-4 horas',
    flowers: ['Rosas rojas', 'Rosas blancas', 'Gipsophila'],
    colors: ['rojo', 'blanco'],
    occasions: ['aniversario', 'amor', 'san_valentin', 'compromiso'],
    images: [
      '/images/productos/corazon-enamorados-1.webp',
      '/images/productos/corazon-enamorados-2.webp',
      '/images/productos/corazon-enamorados-3.webp',
    ],
    care_instructions: 'No requiere agua, duración 3-4 días',
  },
  {
    id: 'AML003',
    name: 'Arreglo "Dulce Compañía"',
    description:
      'Combinación armoniosa de rosas, liliums y gipsophilas en colores suaves como rosa, blanco y crema. Un arreglo que transmite ternura y complicidad perfecta para parejas que celebran momentos especiales juntos.',
    price: 28000, // $28.000 CLP
    original_price: 32000,
    category: 'aniversario_amor',
    stock: 12,
    featured: false,
    active: true,
    rating: 4.7,
    reviews_count: 67,
    size: 'Altura: 35cm con jarrón incluido',
    delivery_time: '2-4 horas',
    flowers: ['Rosas rosadas', 'Liliums', 'Gipsophila'],
    colors: ['rosa', 'blanco', 'crema'],
    occasions: ['aniversario', 'amor', 'amistad'],
    images: [
      '/images/productos/dulce-compania-1.webp',
      '/images/productos/dulce-compania-2.webp',
      '/images/productos/dulce-compania-3.webp',
    ],
    care_instructions: 'Cambiar agua cada 3 días, lugar fresco',
  },
  {
    id: 'AML004',
    name: 'Orquídea Elegante Premium',
    description:
      'Majestuosa orquídea phalaenopsis en maceta de cerámica artesanal. Símbolo de amor sofisticado y lujo duradero. Un regalo que perdura en el tiempo y embellece cualquier espacio con su elegancia natural.',
    price: 55000, // $55.000 CLP
    original_price: 65000,
    category: 'plantas_premium',
    stock: 6,
    featured: true,
    active: true,
    rating: 4.9,
    reviews_count: 43,
    size: 'Altura total: 50cm, Maceta: 15cm diámetro',
    delivery_time: '24 horas',
    flowers: ['Orquídea Phalaenopsis'],
    colors: ['blanco', 'rosa', 'violeta'],
    occasions: ['aniversario', 'amor', 'lujo', 'inauguracion'],
    images: [
      '/images/productos/orquidea-elegante-1.webp',
      '/images/productos/orquidea-elegante-2.webp',
      '/images/productos/orquidea-elegante-3.webp',
    ],
    care_instructions: 'Regar una vez por semana con cubitos de hielo, luz indirecta',
  },
  {
    id: 'AML005',
    name: 'Ramo "Te Amo Mamá"',
    description:
      'Ramo brillante y colorido que expresa todo el amor familiar. Combinación perfecta de flores de temporada en tonos vibrantes que celebran el vínculo especial entre madre e hijo. Ideal para el Día de la Madre o cualquier momento especial.',
    price: 32000, // $32.000 CLP
    original_price: 38000,
    category: 'familia',
    stock: 10,
    featured: false,
    active: true,
    rating: 4.8,
    reviews_count: 92,
    size: 'Altura: 40cm',
    delivery_time: '2-4 horas',
    flowers: ['Gerberas', 'Claveles', 'Rosas', 'Statice'],
    colors: ['multicolor', 'rosa', 'amarillo', 'naranja'],
    occasions: ['dia_madre', 'amor_familiar', 'agradecimiento'],
    images: [
      '/images/productos/te-amo-mama-1.webp',
      '/images/productos/te-amo-mama-2.webp',
      '/images/productos/te-amo-mama-3.webp',
    ],
    care_instructions: 'Cambiar agua diariamente, cortar tallos',
  },

  // CATEGORÍA: CUMPLEAÑOS
  {
    id: 'BDY001',
    name: 'Ramo "Felicidad Colorida"',
    description:
      '¡Celebra la vida con esta explosión de alegría! Girasoles radiantes, crisantemos brillantes y claveles vibrantes en amarillo, naranja y fucsia. Un ramo que contagia felicidad y transmite los mejores deseos de cumpleaños.',
    price: 25000, // $25.000 CLP
    original_price: 30000,
    category: 'cumpleanos',
    stock: 18,
    featured: true,
    active: true,
    rating: 4.6,
    reviews_count: 124,
    size: 'Altura: 42cm',
    delivery_time: '2-4 horas',
    flowers: ['Girasoles', 'Crisantemos', 'Claveles'],
    colors: ['amarillo', 'naranja', 'fucsia'],
    occasions: ['cumpleanos', 'celebracion', 'alegria'],
    images: [
      '/images/productos/felicidad-colorida-1.webp',
      '/images/productos/felicidad-colorida-2.webp',
      '/images/productos/felicidad-colorida-3.webp',
    ],
    care_instructions: 'Agua fresca diariamente, luz solar indirecta',
  },
  {
    id: 'BDY002',
    name: 'Arreglo "Alegría Vibrante"',
    description:
      'Gerberas sonrientes, rosas frescas y statice delicado en un jarrón moderno de cerámica. Este arreglo contemporáneo irradia energía positiva y es perfecto para hacer brillar el día especial de esa persona querida.',
    price: 38000, // $38.000 CLP
    original_price: 45000,
    category: 'cumpleanos',
    stock: 12,
    featured: false,
    active: true,
    rating: 4.7,
    reviews_count: 78,
    size: 'Altura total: 45cm, Jarrón incluido',
    delivery_time: '2-4 horas',
    flowers: ['Gerberas', 'Rosas', 'Statice'],
    colors: ['multicolor', 'rosa', 'amarillo', 'naranja'],
    occasions: ['cumpleanos', 'celebracion'],
    images: [
      '/images/productos/alegria-vibrante-1.webp',
      '/images/productos/alegria-vibrante-2.webp',
      '/images/productos/alegria-vibrante-3.webp',
    ],
    care_instructions: 'Cambiar agua cada 2 días, mantener fresco',
  },
  {
    id: 'BDY003',
    name: 'Cesta "Dulce Cumpleaños"',
    description:
      'La combinación perfecta entre belleza y dulzura. Arreglo floral mixto acompañado de una exquisita caja de chocolates gourmet artesanales. Un regalo doble que endulza el corazón y deleita los sentidos.',
    price: 48000, // $48.000 CLP
    original_price: 55000,
    category: 'cumpleanos',
    stock: 8,
    featured: true,
    active: true,
    rating: 4.8,
    reviews_count: 56,
    size: 'Cesta: 30cm x 20cm',
    delivery_time: '4-6 horas',
    flowers: ['Mix de flores de temporada'],
    colors: ['multicolor'],
    occasions: ['cumpleanos', 'celebracion', 'agradecimiento'],
    images: [
      '/images/productos/dulce-cumpleanos-1.webp',
      '/images/productos/dulce-cumpleanos-2.webp',
      '/images/productos/dulce-cumpleanos-3.webp',
    ],
    extras: ['Chocolates gourmet artesanales 200g'],
    care_instructions: 'Flores: cambiar agua cada 2 días. Chocolates: conservar en lugar fresco',
  },
  {
    id: 'BDY004',
    name: 'Ramo "Elegancia Femenina"',
    description:
      'Suavidad y elegancia en perfecta armonía. Rosas rosadas delicadas y liliums blancos puros crean un ramo sofisticado y femenino. Ideal para mujeres que aprecian la belleza sutil y refinada.',
    price: 33000, // $33.000 CLP
    original_price: 39000,
    category: 'cumpleanos',
    stock: 14,
    featured: false,
    active: true,
    rating: 4.7,
    reviews_count: 63,
    size: 'Altura: 38cm',
    delivery_time: '2-4 horas',
    flowers: ['Rosas rosadas', 'Liliums blancos', 'Follaje verde'],
    colors: ['rosa', 'blanco', 'verde'],
    occasions: ['cumpleanos', 'elegancia', 'feminidad'],
    images: [
      '/images/productos/elegancia-femenina-1.webp',
      '/images/productos/elegancia-femenina-2.webp',
      '/images/productos/elegancia-femenina-3.webp',
    ],
    care_instructions: 'Agua fresca cada 2 días, cortar tallos sesgado',
  },
  {
    id: 'BDY005',
    name: 'Mini Jardín Suculento',
    description:
      'Para quienes prefieren regalos duraderos y modernos. Colección de suculentas variadas en maceta de cerámica contemporánea. Un regalo vivo que simboliza crecimiento y perdura en el tiempo, perfecto para espacios modernos.',
    price: 22000, // $22.000 CLP
    original_price: 28000,
    category: 'plantas_modernas',
    stock: 15,
    featured: false,
    active: true,
    rating: 4.5,
    reviews_count: 34,
    size: 'Maceta: 18cm diámetro x 12cm alto',
    delivery_time: '24 horas',
    flowers: ['Suculentas variadas'],
    colors: ['verde', 'gris', 'morado'],
    occasions: ['cumpleanos', 'moderno', 'duradero', 'oficina'],
    images: [
      '/images/productos/mini-jardin-suculento-1.webp',
      '/images/productos/mini-jardin-suculento-2.webp',
      '/images/productos/mini-jardin-suculento-3.webp',
    ],
    care_instructions: 'Regar cada 10-15 días, luz indirecta, drenaje importante',
  },
];

// Categorías disponibles
const categories = [
  {
    name: 'Aniversario & Amor',
    slug: 'aniversario-amor',
    description: 'Arreglos especiales para celebrar el amor y momentos románticos',
    active: true,
  },
  {
    name: 'Cumpleaños',
    slug: 'cumpleanos',
    description: 'Arreglos festivos y coloridos para celebrar la vida',
    active: true,
  },
  {
    name: 'Plantas Premium',
    slug: 'plantas-premium',
    description: 'Plantas de lujo para regalos duraderos',
    active: true,
  },
  {
    name: 'Familia',
    slug: 'familia',
    description: 'Expresiones de amor familiar',
    icon: '👨‍👩‍👧‍👦',
    priority: 4,
    active: true,
  },
  {
    name: 'Plantas Modernas',
    slug: 'plantas-modernas',
    description: 'Plantas contemporáneas para espacios modernos',
    active: true,
  },
];

// Ocasiones disponibles
const occasions = [
  { name: 'Aniversario', slug: 'aniversario', active: true },
  { name: 'Cumpleaños', slug: 'cumpleanos', active: true },
  { name: 'Amor', slug: 'amor', active: true },
  { name: 'San Valentín', slug: 'san-valentin', active: true },
  { name: 'Día de la Madre', slug: 'dia-madre', active: true },
  { name: 'Graduación', slug: 'graduacion', active: true },
  { name: 'Nacimiento', slug: 'nacimiento', active: true },
  { name: 'Condolencias', slug: 'condolencias', active: true },
  { name: 'Inauguración', slug: 'inauguracion', active: true },
  { name: 'Agradecimiento', slug: 'agradecimiento', active: true },
];

module.exports = {
  initialProducts,
  categories,
  occasions,
};
