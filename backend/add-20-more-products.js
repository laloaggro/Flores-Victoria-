const path = require('path');

const sqlite3 = require('sqlite3').verbose();

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

// Función para agregar 20 productos más por categoría
function add20MoreProducts() {
  // Definir 20 productos adicionales por categoría
  const additionalProducts = [
    // 20 productos para Ramos
    {
      name: 'Ramo de Rosas Rojas Apasionadas',
      description: 'Ramo intenso de rosas rojas frescas, símbolo del amor verdadero y apasionado.',
      price: 19500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Tulipanes Primaverales',
      description:
        'Hermoso ramo de tulipanes en tonos pastel que representan la llegada de la primavera.',
      price: 17800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Girasoles Soleados',
      description: 'Ramo vibrante de girasoles que transmiten alegría y energía positiva.',
      price: 16500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Lirios Blancos Puros',
      description: 'Ramo elegante de lirios blancos que simbolizan la pureza y la devoción.',
      price: 21000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Peonías Románticas',
      description: 'Ramo exuberante de peonías que representan la prosperidad y el honor.',
      price: 22500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Orquídeas Exóticas',
      description: 'Ramo de orquídeas exóticas que simbolizan la belleza y la fuerza.',
      price: 25000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Margaritas Inocentes',
      description: 'Ramo fresco de margaritas que representan la inocencia y la nueva vida.',
      price: 15500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Claveles Multicolor',
      description: 'Ramo colorido de claveles que simbolizan el amor y la admiración.',
      price: 16800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Gardenias Fragantes',
      description: 'Ramo de gardenias con un aroma embriagador y elegancia clásica.',
      price: 23500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Narcisos Primaverales',
      description: 'Ramo de narcisos que anuncian la llegada de la primavera con alegría.',
      price: 17200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Rosas Blancas Puras',
      description: 'Ramo de rosas blancas que simbolizan la pureza y el respeto sincero.',
      price: 18900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Anémonas Silvestres',
      description: 'Ramo de anémonas silvestres que representan la esperanza y la anticipación.',
      price: 17600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Dalias Coloridas',
      description: 'Ramo de dalias en una variedad de colores vibrantes y formas únicas.',
      price: 19800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Amaryllis Dramáticas',
      description: 'Ramo de amaryllis con flores grandes y llamativas que simbolizan el orgullo.',
      price: 20500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Freesias Fragantes',
      description: 'Ramo de freesias con un aroma dulce y delicado que representa la inocencia.',
      price: 18200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Alstroemerias Duraderas',
      description: 'Ramo de alstroemerias que simbolizan la amistad duradera y la devoción mutua.',
      price: 16900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Crisantemos Abundantes',
      description: 'Ramo de crisantemos que representan la longevidad y la alegría.',
      price: 17400,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Gerberas Alegres',
      description:
        'Ramo de gerberas brillantes que simbolizan la admiración y la alegría infantil.',
      price: 16200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Ranúnculos Elegantes',
      description:
        'Ramo de ranúnculos con pétalos delicados que representan el encanto y la belleza.',
      price: 19300,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },
    {
      name: 'Ramo de Lisianthus Refinados',
      description: 'Ramo de lisianthus que simbolizan la gratitud y el acuerdo cordial.',
      price: 20100,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Ramos',
    },

    // 20 productos para Arreglos
    {
      name: 'Arreglo de Rosas Rojas y Blancas',
      description: 'Arreglo clásico de rosas rojas y blancas en una composición elegante.',
      price: 28500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Tulipanes Primaverales',
      description: 'Arreglo colorido de tulipanes que celebra la llegada de la primavera.',
      price: 26800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Girasoles Radiantes',
      description: 'Arreglo vibrante de girasoles que ilumina cualquier espacio con alegría.',
      price: 25500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Lirios Elegantes',
      description: 'Arreglo sofisticado de lirios blancos con follaje decorativo.',
      price: 30000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Peonías Exuberantes',
      description: 'Arreglo exuberante de peonías en plena floración con ramas decorativas.',
      price: 31500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Orquídeas Tropicales',
      description: 'Arreglo de orquídeas tropicales con elementos exóticos y follaje especial.',
      price: 33000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Margaritas Frescas',
      description: 'Arreglo fresco de margaritas con una presentación natural y encantadora.',
      price: 24500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Claveles Aromáticos',
      description: 'Arreglo de claveles con una fragancia duradera y colores vibrantes.',
      price: 25800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Gardenias Blancas',
      description: 'Arreglo de gardenias blancas con un aroma embriagador y presentación clásica.',
      price: 32500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Narcisos Primaverales',
      description: 'Arreglo de narcisos que anuncian la llegada de la primavera con alegría.',
      price: 26200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Rosas Rosadas Románticas',
      description: 'Arreglo de rosas rosadas que simbolizan la admiración y el aprecio.',
      price: 27900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Anémonas Silvestres',
      description: 'Arreglo de anémonas silvestres con una presentación natural y encantadora.',
      price: 26600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Dalias Coloridas',
      description: 'Arreglo de dalias en una variedad de colores vibrantes y formas únicas.',
      price: 28800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Amaryllis Dramáticas',
      description:
        'Arreglo de amaryllis con flores grandes y llamativas en una composición impactante.',
      price: 29500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Freesias Fragantes',
      description:
        'Arreglo de freesias con un aroma dulce y delicado en una presentación elegante.',
      price: 27200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Alstroemerias Duraderas',
      description:
        'Arreglo de alstroemerias que simbolizan la amistad duradera en una composición colorida.',
      price: 25900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Crisantemos Abundantes',
      description:
        'Arreglo de crisantemos que representan la longevidad en una presentación abundante.',
      price: 26400,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Gerberas Alegres',
      description:
        'Arreglo de gerberas brillantes que simbolizan la admiración en una composición vibrante.',
      price: 25200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Ranúnculos Elegantes',
      description: 'Arreglo de ranúnculos con pétalos delicados en una presentación refinada.',
      price: 28300,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },
    {
      name: 'Arreglo de Lisianthus Refinados',
      description: 'Arreglo de lisianthus que simbolizan la gratitud en una composición elegante.',
      price: 29100,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Arreglos',
    },

    // 20 productos para Coronas
    {
      name: 'Corona de Rosas Rojas Apasionadas',
      description: 'Corona imponente de rosas rojas para ocasiones solemnes y conmemorativas.',
      price: 38500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Tulipanes Primaverales',
      description: 'Corona colorida de tulipanes que celebra la vida y la renovación.',
      price: 36800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Girasoles Radiantes',
      description: 'Corona vibrante de girasoles que simboliza la admiración y el respeto.',
      price: 35500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Lirios Elegantes',
      description: 'Corona sofisticada de lirios blancos con un mensaje de paz y pureza.',
      price: 40000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Peonías Exuberantes',
      description: 'Corona exuberante de peonías que representa la prosperidad y el honor.',
      price: 41500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Orquídeas Tropicales',
      description:
        'Corona de orquídeas tropicales con elementos exóticos para una despedida distinguida.',
      price: 43000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Margaritas Frescas',
      description: 'Corona fresca de margaritas con una presentación natural y clásica.',
      price: 34500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Claveles Aromáticos',
      description: 'Corona de claveles con una fragancia duradera y colores significativos.',
      price: 35800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Gardenias Blancas',
      description:
        'Corona de gardenias blancas con un aroma embriagador para una despedida respetuosa.',
      price: 42500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Narcisos Primaverales',
      description: 'Corona de narcisos que anuncian la esperanza de la primavera eterna.',
      price: 36200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Rosas Rosadas Románticas',
      description: 'Corona de rosas rosadas que simbolizan el aprecio y la admiración eterna.',
      price: 37900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Anémonas Silvestres',
      description: 'Corona de anémonas silvestres con una presentación natural y significativa.',
      price: 36600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Dalias Coloridas',
      description:
        'Corona de dalias en una variedad de colores vibrantes para una despedida alegre.',
      price: 38800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Amaryllis Dramáticas',
      description:
        'Corona de amaryllis con flores grandes y llamativas para una despedida impactante.',
      price: 39500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Freesias Fragantes',
      description: 'Corona de freesias con un aroma dulce y delicado para una despedida elegante.',
      price: 37200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Alstroemerias Duraderas',
      description:
        'Corona de alstroemerias que simbolizan la amistad eterna en una composición colorida.',
      price: 35900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Crisantemos Abundantes',
      description:
        'Corona de crisantemos que representan la longevidad en una presentación abundante.',
      price: 36400,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Gerberas Alegres',
      description:
        'Corona de gerberas brillantes que simbolizan la admiración en una composición vibrante.',
      price: 35200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Ranúnculos Elegantes',
      description:
        'Corona de ranúnculos con pétalos delicados en una presentación refinada y respetuosa.',
      price: 38300,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },
    {
      name: 'Corona de Lisianthus Refinados',
      description:
        'Corona de lisianthus que simbolizan la gratitud en una composición elegante y respetuosa.',
      price: 39100,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Coronas',
    },

    // 20 productos para Insumos
    {
      name: 'Fertilizante Orgánico para Rosales',
      description:
        'Fertilizante orgánico especializado para rosales con microelementos esenciales. Presentación de 1kg.',
      price: 14500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Tierra Especial para Cactus y Suculentas',
      description:
        'Mezcla especial de tierra para cactus y suculentas con arena y perlita. Bolsa de 3 litros.',
      price: 9800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Sustrato para Bonsáis Profesional',
      description:
        'Sustrato profesional para bonsáis con akadama, kiryu y arena volcánica. Bolsa de 2kg.',
      price: 18600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Abono Orgánico para Hortalizas',
      description:
        'Abono orgánico universal para hortalizas con ingredientes naturales. Presentación de 2kg.',
      price: 12800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Vermiculita para Macetas',
      description:
        'Vermiculita de grano medio para retención de agua en macetas. Bolsa de 5 litros.',
      price: 7600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Perlite para Drenaje',
      description: 'Perlite expandida para mejorar el drenaje del suelo. Bolsa de 10 litros.',
      price: 8200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Humus de Lombriz Premium Plus',
      description: 'Humus de lombriz premium 100% natural con guano de murciélago. Bolsa de 5kg.',
      price: 19800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Control de Hongos Ecológico',
      description:
        'Control ecológico de hongos para plantas y flores. Spray de 750ml con ingredientes naturales.',
      price: 13200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Nutriente Floral para Flores Grandes',
      description:
        'Nutriente floral especializado para flores grandes con fósforo y potasio. Presentación de 500ml.',
      price: 15500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Compostador de Jardín Grande',
      description:
        'Compostador de jardín grande con tapa sellada y ruedas. Capacidad de 300 litros.',
      price: 42900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Fertilizante Líquido para Orquídeas',
      description:
        'Fertilizante líquido especializado para orquídeas con aminoácidos. Presentación de 1 litro.',
      price: 16500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Tierra para Semilleros Profesional',
      description:
        'Mezcla profesional para semilleros sin semillas y esterilizada. Bolsa de 10 litros.',
      price: 11800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Sustrato para Plantas Carnívoras',
      description:
        'Sustrato especial para plantas carnívoras con turba baja en nutrientes. Bolsa de 5 litros.',
      price: 13600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Abono Orgánico para Plantas Aromáticas',
      description:
        'Abono orgánico especializado para plantas aromáticas con hierbas marinas. Presentación de 1.5kg.',
      price: 14200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Vermiculita para Germinación Profesional',
      description:
        'Vermiculita profesional de grano fino para germinación de semillas. Bolsa de 5 litros.',
      price: 9600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Perlite para Hidroponía',
      description:
        'Perlite expandida para sistemas hidropónicos con pH neutral. Bolsa de 20 litros.',
      price: 12200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Humus de Lombriz para Macetas',
      description: 'Humus de lombriz especializado para macetas con slow release. Bolsa de 3kg.',
      price: 16800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Control de Insectos Voladores Ecológico',
      description:
        'Control ecológico de insectos voladores para plantas. Spray de 1 litro con ingredientes naturales.',
      price: 15200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Nutriente Floral para Flores Fragantes',
      description:
        'Nutriente floral especializado para flores fragantes con magnesio. Presentación de 750ml.',
      price: 17500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },
    {
      name: 'Compostador Eléctrico Inteligente',
      description:
        'Compostador eléctrico inteligente con control de temperatura y agitador automático. Capacidad de 10 litros.',
      price: 89900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Insumos',
    },

    // 20 productos para Accesorios
    {
      name: 'Macetero Geométrico Moderno',
      description: 'Macetero geométrico moderno de cerámica con acabado mate. Diámetro de 20cm.',
      price: 19800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Regadera de Latón Antiguo',
      description: 'Regadera de latón con acabado antiguo y boquilla larga. Capacidad de 2 litros.',
      price: 27500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Soporte para Macetas de Pared',
      description:
        'Soporte para macetas de pared con diseño moderno de metal. Para maceta de hasta 25cm de diámetro.',
      price: 21900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Juego de Macetas de Cemento',
      description:
        'Juego de 4 macetas de cemento en tonos grises con textura rústica. Medidas: 10cm, 15cm, 20cm y 25cm.',
      price: 34900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Portamacetas de Fibra de Coco',
      description:
        'Portamacetas de fibra de coco natural con acabado ecológico. Para maceta de hasta 30cm de diámetro.',
      price: 15600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Decoración de Jardín Solar Mariposa',
      description:
        'Decoración de jardín solar con forma de mariposa multicolor. Carga automática durante el día.',
      price: 18800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Sistema de Riego por Goteo Completo',
      description:
        'Sistema de riego por goteo completo para 6 zonas con temporizador digital. Incluye manguera de 20m.',
      price: 52600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Cortacésped Eléctrico Profesional',
      description:
        'Cortacésped eléctrico profesional con cuchillas de acero templado. Potencia de 1800W.',
      price: 45500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Kit de Herramientas de Jardinería Premium',
      description:
        'Kit premium de herramientas de jardinería con 7 piezas en funda de cuero. Incluye pala, rastrillo, tijeras, etc.',
      price: 34800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Lámpara de Crecimiento LED Full Spectrum',
      description:
        'Lámpara de crecimiento LED full spectrum para plantas de interior. Potencia de 50W con control de intensidad y temporizador.',
      price: 28500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Macetero Colgante de Cerámica',
      description: 'Macetero colgante de cerámica con acabado brillante. Diámetro de 18cm.',
      price: 18800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Regadera de Cobre Antiguo',
      description:
        'Regadera de cobre con acabado antiguo y boquilla fina. Capacidad de 1.8 litros.',
      price: 26500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Soporte para Macetas Elevado',
      description: 'Soporte para macetas elevado de madera tratada con 3 niveles. Altura de 80cm.',
      price: 29900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Juego de Macetas de Vidrio',
      description:
        'Juego de 3 macetas de vidrio transparente con bases de madera. Medidas: 15cm, 20cm y 25cm.',
      price: 32900,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Portamacetas de Metal Industrial',
      description:
        'Portamacetas de metal con diseño industrial y acabado negro mate. Para maceta de hasta 25cm de diámetro.',
      price: 17600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Decoración de Jardín Solar Luciérnaga',
      description:
        'Decoración de jardín solar con forma de luciérnaga que parpadea suavemente. Carga automática durante el día.',
      price: 16800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Sistema de Riego Automático Inteligente Plus',
      description:
        'Sistema de riego automático inteligente plus programable para 8 zonas. Incluye sensor de humedad y temporizador digital.',
      price: 58600,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Desbrozadora Eléctrica Profesional',
      description:
        'Desbrozadora eléctrica profesional con cabezal intercambiable. Potencia de 1200W.',
      price: 39500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Kit de Herramientas de Jardinería Ergonómico',
      description:
        'Kit ergonómico de herramientas de jardinería con 6 piezas en funda de poliéster. Incluye mango antideslizante.',
      price: 29800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },
    {
      name: 'Lámpara de Crecimiento LED para Invernadero',
      description:
        'Lámpara de crecimiento LED para invernadero full spectrum. Potencia de 100W con control de intensidad y temporizador.',
      price: 38500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Accesorios',
    },

    // 20 productos para Condolencias
    {
      name: 'Arreglo de Condolencia con Rosas Blancas',
      description:
        'Arreglo de condolencia con rosas blancas que simbolizan la pureza del alma. Incluye cinta conmemorativa.',
      price: 32500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Cesta de Condolencia Natural con Lirios',
      description:
        'Cesta de condolencia con lirios blancos y follaje fresco en una presentación natural y respetuosa.',
      price: 34800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Ramo de Condolencia con Claveles',
      description:
        'Ramo de condolencia con claveles blancos que representan el amor eterno y la admiración.',
      price: 28000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Corona de Condolencia con Rosas Rojas',
      description:
        'Corona de condolencia con rosas rojas que simbolizan el respeto y el amor por el ser querido.',
      price: 45000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Arreglo de Condolencia en Pie con Girasoles',
      description:
        'Arreglo de condolencia en pie con girasoles que simbolizan la lealtad y el respeto eterno.',
      price: 42000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Cruz de Flores de Condolencia con Gardenias',
      description:
        'Cruz decorativa de flores con gardenias blancas para condolencias con un mensaje de paz y consuelo.',
      price: 30000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Ramo de Condolencia con Tulipanes',
      description:
        'Ramo de condolencia con tulipanes blancos que representan la esperanza y la paz eterna.',
      price: 29000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Arreglo de Condolencia con Velas y Rosas',
      description:
        'Arreglo de condolencia con rosas blancas y velas decorativas de memoria con cinta conmemorativa.',
      price: 36000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Cesta de Condolencia con Peonías',
      description:
        'Cesta de condolencia con peonías blancas en una disposición artística respetuosa.',
      price: 33000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Corona de Condolencia con Alstroemerias',
      description:
        'Corona de condolencia con alstroemerias que simbolizan la amistad eterna en una composición respetuosa.',
      price: 43500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Arreglo de Condolencia con Margaritas',
      description:
        'Arreglo de condolencia con margaritas blancas que representan la inocencia del alma. Incluye cinta conmemorativa.',
      price: 31500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Cesta de Condolencia con Gerberas',
      description:
        'Cesta de condolencia con gerberas blancas en una presentación natural y respetuosa.',
      price: 32800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Ramo de Condolencia con Narcisos',
      description:
        'Ramo de condolencia con narcisos blancos que simbolizan la esperanza de la primavera eterna.',
      price: 27500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Corona de Condolencia con Crisantemos',
      description:
        'Corona de condolencia con crisantemos blancos que representan la longevidad del recuerdo. Incluye cinta conmemorativa.',
      price: 44500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Arreglo de Condolencia en Pie con Lirios',
      description:
        'Arreglo de condolencia en pie con lirios blancos en una presentación imponente y respetuosa.',
      price: 43000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Cruz de Flores de Condolencia con Rosas',
      description:
        'Cruz decorativa de flores con rosas blancas para condolencias con un mensaje de paz y amor eterno.',
      price: 31000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Ramo de Condolencia con Anémonas',
      description:
        'Ramo de condolencia con anémonas blancas que representan la esperanza y el renacimiento espiritual.',
      price: 28500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Arreglo de Condolencia con Velas y Lirios',
      description:
        'Arreglo de condolencia con lirios blancos y velas decorativas de memoria con cinta conmemorativa.',
      price: 37000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Cesta de Condolencia con Tulipanes',
      description:
        'Cesta de condolencia con tulipanes blancos en una disposición artística respetuosa y elegante.',
      price: 34000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },
    {
      name: 'Corona de Condolencia con Gardenias',
      description:
        'Corona de condolencia con gardenias blancas que simbolizan la pureza del alma en una composición respetuosa.',
      price: 46500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Condolencias',
    },

    // 20 productos para Jardinería
    {
      name: 'Kit de Jardinería Profesional',
      description:
        'Kit profesional completo con herramientas de alta calidad y guantes ergonómicos.',
      price: 25000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Maceta Decorativa Extra Grande',
      description:
        'Maceta de cerámica decorativa de extra gran tamaño con diseños florales y acabado brillante.',
      price: 22000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Fertilizante Orgánico Premium',
      description:
        'Fertilizante orgánico premium para todo tipo de plantas y flores, presentación de 2kg con slow release.',
      price: 18000,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Tierra Nutritiva Profesional',
      description:
        'Tierra nutritiva profesional para macetas y jardines, mezcla especial con perlita y vermiculita. Bolsa de 20 litros.',
      price: 16500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Regadera Profesional de 5 Litros',
      description:
        'Regadera profesional de aluminio con diseño ergonómico y capacidad de 5 litros.',
      price: 19500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Kit de Semillas Exóticas',
      description:
        'Kit con semillas de flores exóticas de temporada, incluye instrucciones detalladas de cultivo.',
      price: 15500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Sustrato para Orquídeas Premium',
      description:
        'Sustrato premium para orquídeas con corteza de pino, carbón y fibra de coco tratada. Bolsa de 5 litros.',
      price: 17200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Tijeras de Podar Profesionales Plus',
      description:
        'Tijeras de podar profesionales plus con mango ergonómico, hojas de acero inoxidable y resorte de retorno.',
      price: 23500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Kit de Jardinería para Principiantes',
      description:
        'Kit completo de jardinería para principiantes con herramientas básicas, guía de cultivo y semillas variadas.',
      price: 18500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Maceta Autoregable Grande',
      description:
        'Maceta autoregable de plástico con sistema de riego interno y capacidad de 5 litros.',
      price: 15200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Fertilizante Líquido Universal',
      description:
        'Fertilizante líquido universal para todo tipo de plantas y flores, presentación de 1 litro.',
      price: 12500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Tierra para Plantas de Interior',
      description:
        'Tierra especial para plantas de interior con perlita y fibra de coco. Bolsa de 15 litros.',
      price: 14800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Regadera de Cobre Decorativa Grande',
      description: 'Regadera de cobre decorativa con boquilla larga y capacidad de 3 litros.',
      price: 24500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Kit de Semillas para Balcones',
      description:
        'Kit con semillas de plantas ideales para balcones y espacios pequeños, incluye instrucciones de cultivo.',
      price: 13500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Sustrato para Suculentas y Cactus',
      description:
        'Sustrato especial para suculentas y cactus con arena, perlita y turba baja en nutrientes. Bolsa de 5 litros.',
      price: 11200,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Tijeras de Podar Eléctricas',
      description:
        'Tijeras de podar eléctricas con batería recargable y hojas de acero templado. Potencia de 12V.',
      price: 32500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Kit de Jardinería para Macetas',
      description:
        'Kit completo de jardinería para macetas con herramientas específicas, guía de cultivo y fertilizantes.',
      price: 21500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Maceta de Autorriego Inteligente',
      description:
        'Maceta de autorriego inteligente con sensor de humedad y sistema automático de riego. Capacidad de 8 litros.',
      price: 27800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Fertilizante Orgánico para Plantas Frutales',
      description:
        'Fertilizante orgánico especializado para plantas frutales con guano y microelementos. Presentación de 1.5kg.',
      price: 19500,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
    {
      name: 'Tierra para Jardín Vertical',
      description:
        'Tierra especial para jardines verticales con fibra de coco y perlita. Bolsa de 10 litros.',
      price: 16800,
      image_url: '/assets/images/products/placeholder.svg',
      category: 'Jardinería',
    },
  ];

  // Preparar la declaración para insertar productos
  const stmt = db.prepare(
    'INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)'
  );

  // Insertar cada producto
  additionalProducts.forEach((product, index) => {
    stmt.run(
      product.name,
      product.description,
      product.price,
      product.image_url,
      product.category,
      (err) => {
        if (err) {
          console.error('Error al insertar producto:', err.message);
        } else {
          console.log(
            `Producto insertado: ${product.name} - $${product.price} - ${product.category}`
          );
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
      }
    );
  });
}

// Ejecutar la función
add20MoreProducts();
