
// Script generado automáticamente - Seed de productos
// Ejecutar en MongoDB Railway

db = db.getSiblingDB('flores-victoria');

// Limpiar colección existente (opcional)
// db.products.deleteMany({});

// Insertar productos
const products = [
  {
    "name": "Ramo de Rosas Rojas Premium",
    "slug": "ramo-de-rosas-rojas-premium",
    "description": "Clásico ramo de 12 rosas rojas con follaje fresco. Ideal para amor y romance.",
    "price": 45000,
    "category": "rosas",
    "images": [
      "/images/products/final/PLT001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 1
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Tulipanes de Primavera",
    "slug": "tulipanes-de-primavera",
    "description": "Colorido arreglo de 10 tulipanes mixtos importados de Holanda.",
    "price": 35000,
    "category": "tulipanes",
    "images": [
      "/images/products/final/PLT002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 2
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Orquídea Phalaenopsis Elegante",
    "slug": "orquidea-phalaenopsis-elegante",
    "description": "Elegante orquídea en maceta, ideal para regalo corporativo o decoración.",
    "price": 75000,
    "category": "orquideas",
    "images": [
      "/images/products/final/EXO001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 3
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Girasoles Radiantes",
    "slug": "girasoles-radiantes",
    "description": "Arreglo de 8 girasoles con detalles verdes y flores de campo.",
    "price": 38000,
    "category": "girasoles",
    "images": [
      "/images/products/final/PLT003.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 4
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Bouquet Deluxe Mixto",
    "slug": "bouquet-deluxe-mixto",
    "description": "Exquisito bouquet con rosas, lirios y flores de temporada.",
    "price": 52000,
    "category": "bouquets",
    "images": [
      "/images/products/final/VAR004.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 5
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Arreglo Floral Corporativo",
    "slug": "arreglo-floral-corporativo",
    "description": "Arreglo elegante diseñado para oficinas y eventos de empresa.",
    "price": 68000,
    "category": "corporativos",
    "images": [
      "/images/products/final/CRP001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 6
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Ramo de Lirios Blancos",
    "slug": "ramo-de-lirios-blancos",
    "description": "Hermoso ramo de lirios blancos símbolo de pureza y elegancia.",
    "price": 42000,
    "category": "lirios",
    "images": [
      "/images/products/final/PLT004.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 7
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Corona Fúnebre Tradicional",
    "slug": "corona-funebre-tradicional",
    "description": "Elegante corona de condolencias con rosas blancas y lirios.",
    "price": 95000,
    "category": "funebres",
    "images": [
      "/images/products/final/SYM001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 8
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Arreglo de Cumpleaños Festivo",
    "slug": "arreglo-de-cumpleanos-festivo",
    "description": "Alegre arreglo con flores coloridas y globo de cumpleaños.",
    "price": 48000,
    "category": "cumpleaños",
    "images": [
      "/images/products/final/BDY001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 9
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Centro de Mesa Rústico",
    "slug": "centro-de-mesa-rustico",
    "description": "Arreglo rústico perfecto para bodas campestres.",
    "price": 55000,
    "category": "bodas",
    "images": [
      "/images/products/final/AML001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 10
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Rosas Rosadas en Caja",
    "slug": "rosas-rosadas-en-caja",
    "description": "12 rosas rosadas premium en elegante caja cuadrada negra.",
    "price": 58000,
    "category": "rosas",
    "images": [
      "/images/products/final/AML002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 11
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Arreglo Aniversario de Amor",
    "slug": "arreglo-aniversario-de-amor",
    "description": "Romántico arreglo con rosas rojas, lirios y detalles dorados.",
    "price": 65000,
    "category": "aniversarios",
    "images": [
      "/images/products/final/AML003.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 12
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Alegría Vibrante",
    "slug": "alegria-vibrante",
    "description": "Explosión de colores con flores de temporada vibrantes y alegres.",
    "price": 44000,
    "category": "mixtos",
    "images": [
      "/images/products/final/VAR010.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 13
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Corazón Enamorado Premium",
    "slug": "corazon-enamorado-premium",
    "description": "Arreglo especial con forma de corazón, perfecto para declaraciones de amor.",
    "price": 72000,
    "category": "amor",
    "images": [
      "/images/products/final/AML004.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 14
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Dulce Compañía",
    "slug": "dulce-compania",
    "description": "Delicado arreglo pastel ideal para consentir a alguien especial.",
    "price": 39000,
    "category": "amistad",
    "images": [
      "/images/products/final/THX001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 15
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Dulce Cumpleaños",
    "slug": "dulce-cumpleanos",
    "description": "Festivo arreglo de cumpleaños con flores alegres y detalles divertidos.",
    "price": 46000,
    "category": "cumpleaños",
    "images": [
      "/images/products/final/BDY002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 16
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Elegancia Femenina Premium",
    "slug": "elegancia-femenina-premium",
    "description": "Sofisticado bouquet en tonos suaves ideal para celebrar a las mujeres.",
    "price": 54000,
    "category": "bouquets",
    "images": [
      "/images/products/final/PLT005.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 17
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Orquídea Elegante Luxury",
    "slug": "orquidea-elegante-luxury",
    "description": "Orquídea de lujo en maceta decorativa con acabados elegantes.",
    "price": 85000,
    "category": "orquideas",
    "images": [
      "/images/products/final/EXO002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 18
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Margaritas Frescas del Campo",
    "slug": "margaritas-frescas-del-campo",
    "description": "Ramo campestre con margaritas blancas y flores silvestres.",
    "price": 32000,
    "category": "margaritas",
    "images": [
      "/images/products/final/VAR007.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 19
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Hortensias Premium Azules",
    "slug": "hortensias-premium-azules",
    "description": "Elegantes hortensias en tonos azules y morados, arreglo espectacular.",
    "price": 68000,
    "category": "hortensias",
    "images": [
      "/images/products/final/VAR008.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 20
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Arreglo Victoria Signature",
    "slug": "arreglo-victoria-signature",
    "description": "Combinación perfecta de rosas, lirios y flores de temporada.",
    "price": 51000,
    "category": "mixtos",
    "images": [
      "/images/products/final/AML005.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 21
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Ramo de Graduación Especial",
    "slug": "ramo-de-graduacion-especial",
    "description": "Arreglo especial para celebrar logros académicos con flores alegres.",
    "price": 47000,
    "category": "graduaciones",
    "images": [
      "/images/products/final/GRD001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 22
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Alegría Vibrante Deluxe",
    "slug": "alegria-vibrante-deluxe",
    "description": "Versión premium con flores exóticas y presentación de lujo.",
    "price": 62000,
    "category": "mixtos",
    "images": [
      "/images/products/final/BBY001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 23
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Dulce Compañía Deluxe",
    "slug": "dulce-compania-deluxe",
    "description": "Arreglo deluxe con rosas importadas y detalles especiales.",
    "price": 58000,
    "category": "amistad",
    "images": [
      "/images/products/final/THX002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 24
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Gerberas Multicolor",
    "slug": "gerberas-multicolor",
    "description": "Alegre ramo de gerberas en colores vibrantes, ideal para alegrar el día.",
    "price": 36000,
    "category": "gerberas",
    "images": [
      "/images/products/final/VAR012.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 25
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Claveles Tradicionales",
    "slug": "claveles-tradicionales",
    "description": "Hermoso arreglo de claveles frescos en tonos rosados y blancos.",
    "price": 28000,
    "category": "claveles",
    "images": [
      "/images/products/final/VAR013.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 26
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Arreglo de Recuperación",
    "slug": "arreglo-de-recuperacion",
    "description": "Arreglo especial para desear pronta recuperación con flores alegres.",
    "price": 43000,
    "category": "recuperacion",
    "images": [
      "/images/products/final/MIN001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 27
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Te Amo Mamá Especial",
    "slug": "te-amo-mama-especial",
    "description": "Arreglo dedicado especialmente para mamá con las flores más hermosas.",
    "price": 56000,
    "category": "mama",
    "images": [
      "/images/products/final/VAR001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 28
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Pasión Eterna",
    "slug": "pasion-eterna",
    "description": "Intenso arreglo en tonos rojos y burdeos que expresa pasión verdadera.",
    "price": 67000,
    "category": "amor",
    "images": [
      "/images/products/final/VAR002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 29
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Mini Jardín de Suculentas",
    "slug": "mini-jardin-de-suculentas",
    "description": "Encantador jardín de suculentas variadas en maceta decorativa.",
    "price": 34000,
    "category": "suculentas",
    "images": [
      "/images/products/final/SUS001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 30
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Felicidad Colorida",
    "slug": "felicidad-colorida",
    "description": "Arreglo lleno de vida con flores en todos los colores del arcoíris.",
    "price": 49000,
    "category": "mixtos",
    "images": [
      "/images/products/final/BBY002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 31
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Rosas Rojas Medium",
    "slug": "rosas-rojas-medium",
    "description": "Elegante ramo de 6 rosas rojas, perfecto para sorpresas románticas.",
    "price": 32000,
    "category": "rosas",
    "images": [
      "/images/products/final/BBY003.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 32
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Tulipanes Clásicos",
    "slug": "tulipanes-clasicos",
    "description": "Ramo tradicional de tulipanes frescos en tonos variados.",
    "price": 38000,
    "category": "tulipanes",
    "images": [
      "/images/products/final/SEA001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 33
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Aniversario de Amor Deluxe",
    "slug": "aniversario-de-amor-deluxe",
    "description": "Arreglo premium para aniversarios con las mejores flores importadas.",
    "price": 78000,
    "category": "aniversarios",
    "images": [
      "/images/products/final/SEA002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 34
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Graduación Triunfal",
    "slug": "graduacion-triunfal",
    "description": "Ramo festivo para celebrar el éxito académico con estilo.",
    "price": 52000,
    "category": "graduaciones",
    "images": [
      "/images/products/final/GRD002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 35
    },
    "createdAt": "2025-11-30T03:54:19.089Z",
    "updatedAt": "2025-11-30T03:54:19.089Z"
  },
  {
    "name": "Orquídea Elegante Triple",
    "slug": "orquidea-elegante-triple",
    "description": "Tres tallos de orquídeas blancas en maceta premium de cerámica.",
    "price": 95000,
    "category": "orquideas",
    "images": [
      "/images/products/final/VAR003.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 36
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Alegría Vibrante XL",
    "slug": "alegria-vibrante-xl",
    "description": "Arreglo extra grande con flores exóticas y presentación espectacular.",
    "price": 82000,
    "category": "mixtos",
    "images": [
      "/images/products/final/BDY003.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 37
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Corazón Enamorado Clásico",
    "slug": "corazon-enamorado-clasico",
    "description": "Arreglo romántico en forma de corazón con rosas rojas y rosadas.",
    "price": 64000,
    "category": "amor",
    "images": [
      "/images/products/final/BDY004.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 38
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Dulce Cumpleaños Deluxe",
    "slug": "dulce-cumpleanos-deluxe",
    "description": "Celebración especial con arreglo de cumpleaños premium y globo.",
    "price": 61000,
    "category": "cumpleaños",
    "images": [
      "/images/products/final/BDY005.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 39
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Elegancia Femenina Clásica",
    "slug": "elegancia-femenina-clasica",
    "description": "Bouquet sofisticado en tonos pastel para la mujer elegante.",
    "price": 48000,
    "category": "bouquets",
    "images": [
      "/images/products/final/CRP002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 40
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Te Amo Mamá Premium",
    "slug": "te-amo-mama-premium",
    "description": "Arreglo especial premium para el Día de la Madre con flores selectas.",
    "price": 69000,
    "category": "mama",
    "images": [
      "/images/products/final/VAR009.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 41
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Pasión Eterna Deluxe",
    "slug": "pasion-eterna-deluxe",
    "description": "Arreglo apasionado de lujo con rosas rojas premium y detalles dorados.",
    "price": 84000,
    "category": "amor",
    "images": [
      "/images/products/final/DEC001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 42
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Mini Jardín Suculento Deluxe",
    "slug": "mini-jardin-suculento-deluxe",
    "description": "Jardín de suculentas premium en maceta de diseño exclusivo.",
    "price": 45000,
    "category": "suculentas",
    "images": [
      "/images/products/final/SUS002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 43
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Felicidad Colorida Premium",
    "slug": "felicidad-colorida-premium",
    "description": "Arreglo premium multicolor con flores exóticas importadas.",
    "price": 66000,
    "category": "mixtos",
    "images": [
      "/images/products/final/DEC002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 44
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Girasoles del Sol",
    "slug": "girasoles-del-sol",
    "description": "Radiante ramo de girasoles grandes que iluminan cualquier espacio.",
    "price": 41000,
    "category": "girasoles",
    "images": [
      "/images/products/final/VAR005.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 45
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Lirios Blancos de Pureza",
    "slug": "lirios-blancos-de-pureza",
    "description": "Elegante ramo de lirios blancos aromáticos de la más alta calidad.",
    "price": 47000,
    "category": "lirios",
    "images": [
      "/images/products/final/VAR006.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 46
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Margaritas Silvestres",
    "slug": "margaritas-silvestres",
    "description": "Encantador ramo campestre con margaritas y flores del campo.",
    "price": 29000,
    "category": "margaritas",
    "images": [
      "/images/products/final/KIT001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 47
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Hortensias Azul Cielo",
    "slug": "hortensias-azul-cielo",
    "description": "Hermosas hortensias en tonos azules intensos, frescas y duraderas.",
    "price": 59000,
    "category": "hortensias",
    "images": [
      "/images/products/final/KIT002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 48
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Te Amo Mamá Clásico",
    "slug": "te-amo-mama-clasico",
    "description": "Tierno arreglo para mamá con flores en tonos rosados y blancos.",
    "price": 51000,
    "category": "mama",
    "images": [
      "/images/products/final/MIN002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 49
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Felicidad Colorida XL",
    "slug": "felicidad-colorida-xl",
    "description": "Arreglo extra grande lleno de alegría con flores tropicales.",
    "price": 79000,
    "category": "mixtos",
    "images": [
      "/images/products/final/PRM001.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 50
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Mini Jardín Zen",
    "slug": "mini-jardin-zen",
    "description": "Jardín de suculentas con diseño minimalista y piedras decorativas.",
    "price": 38000,
    "category": "suculentas",
    "images": [
      "/images/products/final/VAR011.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 51
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Gerberas Radiantes",
    "slug": "gerberas-radiantes",
    "description": "Vibrante arreglo de gerberas en colores brillantes y alegres.",
    "price": 39000,
    "category": "gerberas",
    "images": [
      "/images/products/final/PRM002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 52
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Claveles del Jardín",
    "slug": "claveles-del-jardin",
    "description": "Ramo tradicional de claveles frescos en tonos pastel.",
    "price": 31000,
    "category": "claveles",
    "images": [
      "/images/products/final/SYM002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 53
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Pronta Recuperación Premium",
    "slug": "pronta-recuperacion-premium",
    "description": "Arreglo especial premium para desear salud con flores positivas.",
    "price": 53000,
    "category": "recuperacion",
    "images": [
      "/images/products/final/VAR014.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 54
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Dulce Cumpleaños XL",
    "slug": "dulce-cumpleanos-xl",
    "description": "Gran celebración con arreglo XXL de cumpleaños y detalles festivos.",
    "price": 73000,
    "category": "cumpleaños",
    "images": [
      "/images/products/final/VAR015.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 55
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Tulipanes Premium Holland",
    "slug": "tulipanes-premium-holland",
    "description": "Tulipanes importados directamente de Holanda en presentación de lujo.",
    "price": 56000,
    "category": "tulipanes",
    "images": [
      "/images/products/final/VAR016.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 56
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Aniversario Romántico",
    "slug": "aniversario-romantico",
    "description": "Arreglo romántico perfecto para celebrar años de amor juntos.",
    "price": 71000,
    "category": "aniversarios",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 57
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Graduación Exitosa Premium",
    "slug": "graduacion-exitosa-premium",
    "description": "Celebra el logro académico con este arreglo premium y elegante.",
    "price": 58000,
    "category": "graduaciones",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 58
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Pasión Eterna Clásica",
    "slug": "pasion-eterna-clasica",
    "description": "Arreglo clásico de pasión con rosas rojas y detalles románticos.",
    "price": 59000,
    "category": "amor",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 59
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo Premium Signature",
    "slug": "arreglo-premium-signature",
    "description": "Nuestro arreglo insignia con las mejores flores de la temporada.",
    "price": 89000,
    "category": "premium",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 60
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Bienvenido Bebé Niño - Azul",
    "slug": "bienvenido-bebe-nino-azul",
    "description": "Hermoso arreglo floral en tonos azules y blancos para celebrar la llegada del bebé. Incluye rosas azules teñidas, claveles blancos y globo decorativo.",
    "price": 48000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 61
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Bienvenida Bebé Niña - Rosa",
    "slug": "bienvenida-bebe-nina-rosa",
    "description": "Delicado arreglo en tonos rosas y blancos con rosas, alstroemerias y detalles infantiles para dar la bienvenida a la pequeña princesa.",
    "price": 48000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 62
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Canastilla Floral de Bebé",
    "slug": "canastilla-floral-de-bebe",
    "description": "Encantadora canastilla decorada con flores mixtas en tonos pasteles, peluche de osito y lazo de raso. Perfecta para llevar al hospital.",
    "price": 55000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 63
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo Unisex Bebé - Amarillo",
    "slug": "arreglo-unisex-bebe-amarillo",
    "description": "Arreglo neutral en tonos amarillos y blancos con girasoles mini, margaritas y decoración de cigüeña. Ideal cuando aún no se conoce el sexo del bebé.",
    "price": 45000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 64
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Ramo Maternidad Premium",
    "slug": "ramo-maternidad-premium",
    "description": "Elegante ramo para la mamá recién estrenada con rosas, liliums y flores de temporada en tonos suaves. Incluye tarjeta de felicitación.",
    "price": 52000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 65
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Centro de Mesa Bautizo",
    "slug": "centro-de-mesa-bautizo",
    "description": "Arreglo floral para mesa de celebración de bautizo con flores blancas, hortensias azules o rosas y velas decorativas.",
    "price": 62000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 66
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Caja de Flores Baby Shower",
    "slug": "caja-de-flores-baby-shower",
    "description": "Caja decorativa con flores frescas mixtas en tonos pasteles, chocolates y tarjeta personalizable. Perfecta para baby shower.",
    "price": 58000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 67
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo Gemelos o Mellizos",
    "slug": "arreglo-gemelos-o-mellizos",
    "description": "Doble arreglo especial para celebrar la llegada de gemelos, disponible en combinaciones azul-azul, rosa-rosa o mixto.",
    "price": 85000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 68
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Globo y Flores Nacimiento",
    "slug": "globo-y-flores-nacimiento",
    "description": "Combo de arreglo floral en base de cerámica con globo metalizado 'It's a Boy' o 'It's a Girl' y chocolates premium.",
    "price": 65000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 69
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo Hospital Express",
    "slug": "arreglo-hospital-express",
    "description": "Arreglo compacto diseñado especialmente para llevar al hospital, con flores de larga duración en colores suaves y mensaje personalizado.",
    "price": 42000,
    "category": "nacimiento",
    "images": [
      "/images/placeholder-product.jpg"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 70
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Bouquet Primaveral Multicolor",
    "slug": "bouquet-primaveral-multicolor",
    "description": "Explosión de colores con tulipanes, ranúnculos, fresias y verdes frescos. Perfecto para alegrar cualquier espacio.",
    "price": 48000,
    "category": "bouquets",
    "images": [
      "/images/products/final/VAR005.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 71
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Rosas Blancas Premium",
    "slug": "rosas-blancas-premium",
    "description": "Elegante ramo de 18 rosas blancas de tallo largo con eucalipto plateado. Simboliza pureza y nuevos comienzos.",
    "price": 52000,
    "category": "rosas",
    "images": [
      "/images/products/final/PLT005.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 72
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo Tropical Paradise",
    "slug": "arreglo-tropical-paradise",
    "description": "Exóticas aves del paraíso, anturios rojos, heliconias y follaje tropical en base de cerámica.",
    "price": 78000,
    "category": "exoticos",
    "images": [
      "/images/products/final/EXO002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 73
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Centro de Mesa Rústico Premium",
    "slug": "centro-de-mesa-rustico-premium",
    "description": "Arreglo bajo con rosas, hortensias, eucalipto y detalles de madera. Ideal para bodas campestres.",
    "price": 62000,
    "category": "bodas",
    "images": [
      "/images/products/final/AML004.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 74
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Cesta de Girasoles Radiantes",
    "slug": "cesta-de-girasoles-radiantes",
    "description": "Alegre cesta con 10 girasoles grandes, margaritas amarillas y flores de campo. Transmite energía positiva.",
    "price": 44000,
    "category": "girasoles",
    "images": [
      "/images/products/final/VAR006.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 75
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Lirios Asiáticos Luxury",
    "slug": "lirios-asiaticos-luxury",
    "description": "Ramo de lirios asiáticos en tonos rosa, naranja y blanco con follaje verde oscuro. Fragancia intensa.",
    "price": 54000,
    "category": "lirios",
    "images": [
      "/images/products/final/VAR007.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 76
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo Corporativo Executive",
    "slug": "arreglo-corporativo-executive",
    "description": "Sofisticado arreglo en tonos blancos y verdes con rosas, lisianthus y orquídeas. Perfecto para oficinas.",
    "price": 82000,
    "category": "corporativos",
    "images": [
      "/images/products/final/CRP002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 77
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Ramo de Peonías Romántico",
    "slug": "ramo-de-peonias-romantico",
    "description": "Lujoso ramo con peonías rosas y blancas, rosas garden y eucalipto. Elegancia francesa.",
    "price": 95000,
    "category": "bouquets",
    "images": [
      "/images/products/final/VAR008.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 78
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo Zen Minimalista",
    "slug": "arreglo-zen-minimalista",
    "description": "Diseño contemporáneo con bambú, orquídeas blancas, suculentas y piedras decorativas en base cuadrada.",
    "price": 68000,
    "category": "minimalistas",
    "images": [
      "/images/products/final/MIN002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 79
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Corona Fúnebre Deluxe",
    "slug": "corona-funebre-deluxe",
    "description": "Elegante corona con rosas blancas, lirios, crisantemos y cinta de condolencia personalizada.",
    "price": 115000,
    "category": "funebres",
    "images": [
      "/images/products/final/SYM002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 80
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Bouquet Vintage Shabby Chic",
    "slug": "bouquet-vintage-shabby-chic",
    "description": "Romántico ramo estilo vintage con rosas antiguas, lisianthus, astilbe y cintas de encaje.",
    "price": 72000,
    "category": "bouquets",
    "images": [
      "/images/products/final/VAR009.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 81
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo de Cumpleaños Fiesta",
    "slug": "arreglo-de-cumpleanos-fiesta",
    "description": "Colorido arreglo con gerberas, alstroemerias, solidago y globo de cumpleaños metalizado.",
    "price": 51000,
    "category": "cumpleaños",
    "images": [
      "/images/products/final/BDY002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 82
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Jardín en Maceta Grande",
    "slug": "jardin-en-maceta-grande",
    "description": "Maceta de cerámica con combinación de plantas florales: kalanchoes, begonias, crisantemos e ivy.",
    "price": 58000,
    "category": "plantas",
    "images": [
      "/images/products/final/GRD002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 83
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Ramo Silvestre de Campo",
    "slug": "ramo-silvestre-de-campo",
    "description": "Natural y fresco ramo con flores de campo: margaritas, statice, limonium y trigo decorativo.",
    "price": 38000,
    "category": "bouquets",
    "images": [
      "/images/products/final/VAR010.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 84
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo Aniversario Gold",
    "slug": "arreglo-aniversario-gold",
    "description": "Lujoso arreglo con rosas rojas, ranúnculos dorados, lirios y detalles metálicos en base de cristal.",
    "price": 88000,
    "category": "aniversarios",
    "images": [
      "/images/products/final/AML005.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 85
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Orquídeas Phalaenopsis Dobles",
    "slug": "orquideas-phalaenopsis-dobles",
    "description": "Dos varas de orquídeas phalaenopsis blancas en maceta de cerámica negra. Sofisticación y durabilidad.",
    "price": 98000,
    "category": "orquideas",
    "images": [
      "/images/products/final/VAR011.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 86
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Centro de Mesa Navideño",
    "slug": "centro-de-mesa-navideno",
    "description": "Arreglo festivo con flores rojas, poinsetias, ramas de pino, piñas y velas decorativas.",
    "price": 64000,
    "category": "temporada",
    "images": [
      "/images/products/final/SEA002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 87
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Bouquet Monocromático Elegante",
    "slug": "bouquet-monocromatico-elegante",
    "description": "Sofisticado ramo en tonos morados: rosas lavanda, lisianthus, veronica y eucalipto.",
    "price": 56000,
    "category": "bouquets",
    "images": [
      "/images/products/final/VAR012.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 88
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Arreglo Sustentable Eco",
    "slug": "arreglo-sustentable-eco",
    "description": "Diseño ecológico con flores locales de temporada, sin espuma floral, en contenedor reciclado.",
    "price": 46000,
    "category": "sustentables",
    "images": [
      "/images/products/final/SUS002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 89
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  },
  {
    "name": "Kit Regalo Romántico Completo",
    "slug": "kit-regalo-romantico-completo",
    "description": "Pack especial: ramo de 12 rosas, chocolates Ferrero Rocher, vela aromática y tarjeta personalizada.",
    "price": 92000,
    "category": "kits",
    "images": [
      "/images/products/final/KIT002.webp"
    ],
    "stock": 10,
    "featured": false,
    "active": true,
    "metadata": {
      "occasion": null,
      "color": null,
      "size": "medium",
      "originalId": 90
    },
    "createdAt": "2025-11-30T03:54:19.090Z",
    "updatedAt": "2025-11-30T03:54:19.090Z"
  }
];

db.products.insertMany(products);

print('✅ Insertados ' + products.length + ' productos en MongoDB');

// Crear índices si no existen
db.products.createIndex({ name: 1 });
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ featured: 1 });
db.products.createIndex({ active: 1 });
db.products.createIndex({ createdAt: -1 });

print('✅ Índices creados');

// Mostrar estadísticas
print('📊 Total de productos: ' + db.products.countDocuments());
print('📊 Productos por categoría:');
db.products.aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).forEach(doc => print('   - ' + doc._id + ': ' + doc.count));

print('✅ Base de datos poblada exitosamente!');
