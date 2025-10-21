const { MongoClient } = require('mongodb');

// Configuración de MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'flores-victoria';

// Productos expandidos organizados por categoría
const expandedProducts = {
  // CATEGORÍA: RAMOS (15 nuevos productos)
  ramos: [
    {
      name: 'Ramo de Peonías Premium',
      description: 'Exquisito ramo de peonías en tonos rosados y blancos, símbolo de romance y prosperidad. Flores de temporada de la más alta calidad.',
      price: 45000,
      image_url: '/assets/images/products/peonias-premium.jpg',
      category: 'Ramos',
      stock: 8,
      featured: true
    },
    {
      name: 'Ramo Tropical con Aves del Paraíso',
      description: 'Espectacular ramo tropical con aves del paraíso, heliconias y follaje exótico. Perfecto para ocasiones especiales.',
      price: 52000,
      image_url: '/assets/images/products/tropical-aves.jpg',
      category: 'Ramos',
      stock: 6
    },
    {
      name: 'Ramo Campestre con Lavanda',
      description: 'Ramo rústico con lavanda francesa, margaritas y trigo. Aroma relajante y estilo campestre único.',
      price: 28000,
      image_url: '/assets/images/products/campestre-lavanda.jpg',
      category: 'Ramos',
      stock: 12
    },
    {
      name: 'Ramo de Rosas Spray Multicolor',
      description: 'Alegre ramo con rosas spray en diversos colores. Ideal para celebraciones vibrantes y alegres.',
      price: 32000,
      image_url: '/assets/images/products/rosas-spray.jpg',
      category: 'Ramos',
      stock: 15
    },
    {
      name: 'Ramo de Fresias Aromáticas',
      description: 'Delicado ramo de fresias en tonos pastel. Fragancia intensa y duradera que perfuma cualquier espacio.',
      price: 24000,
      image_url: '/assets/images/products/fresias-aromaticas.jpg',
      category: 'Ramos',
      stock: 20
    },
    {
      name: 'Ramo Vintage con Ranúnculos',
      description: 'Elegante ramo estilo vintage con ranúnculos, rosas antiguas y eucalipto. Perfecto para bodas románticas.',
      price: 38000,
      image_url: '/assets/images/products/vintage-ranunculos.jpg',
      category: 'Ramos',
      stock: 10
    },
    {
      name: 'Ramo de Alstroemerias Mixtas',
      description: 'Ramo abundante de alstroemerias en colores variados. Excelente duración y gran volumen.',
      price: 26000,
      image_url: '/assets/images/products/alstroemerias-mixtas.jpg',
      category: 'Ramos',
      stock: 18
    },
    {
      name: 'Ramo de Astromelias y Lirios',
      description: 'Combinación perfecta de astromelias y lirios asiáticos. Elegancia y frescura en un solo arreglo.',
      price: 35000,
      image_url: '/assets/images/products/astromelias-lirios.jpg',
      category: 'Ramos',
      stock: 12
    },
    {
      name: 'Ramo de Dalias de Temporada',
      description: 'Hermosas dalias de temporada en tonos cálidos. Flores grandes y vistosas con textura única.',
      price: 42000,
      image_url: '/assets/images/products/dalias-temporada.jpg',
      category: 'Ramos',
      stock: 8
    },
    {
      name: 'Ramo de Anémonas y Eucalipto',
      description: 'Moderno ramo con anémonas de centro negro y eucalipto plateado. Estilo contemporáneo y sofisticado.',
      price: 36000,
      image_url: '/assets/images/products/anemonas-eucalipto.jpg',
      category: 'Ramos',
      stock: 10
    },
    {
      name: 'Ramo de Proteas Exóticas',
      description: 'Ramo exclusivo con proteas sudafricanas y follaje tropical. Para conocedores de flores únicas.',
      price: 58000,
      image_url: '/assets/images/products/proteas-exoticas.jpg',
      category: 'Ramos',
      stock: 5,
      featured: true
    },
    {
      name: 'Ramo Rústico con Girasoles Mini',
      description: 'Alegre ramo con girasoles miniatura, solidago y follaje natural. Perfecto para ambientes informales.',
      price: 29000,
      image_url: '/assets/images/products/girasoles-mini.jpg',
      category: 'Ramos',
      stock: 14
    },
    {
      name: 'Ramo de Crisantemos Japoneses',
      description: 'Refinado ramo con crisantemos japoneses tipo pompón. Elegancia oriental y larga duración.',
      price: 31000,
      image_url: '/assets/images/products/crisantemos-japoneses.jpg',
      category: 'Ramos',
      stock: 16
    },
    {
      name: 'Ramo de Gerberas Coloridas',
      description: 'Vibrante ramo de gerberas en colores intensos. Alegría y optimismo en cada flor.',
      price: 27000,
      image_url: '/assets/images/products/gerberas-coloridas.jpg',
      category: 'Ramos',
      stock: 20
    },
    {
      name: 'Ramo de Lisianthus Elegantes',
      description: 'Sofisticado ramo de lisianthus en tonos púrpura y blanco. Flores delicadas con aspecto de rosas.',
      price: 40000,
      image_url: '/assets/images/products/lisianthus-elegantes.jpg',
      category: 'Ramos',
      stock: 9
    }
  ],

  // CATEGORÍA: ARREGLOS (15 nuevos productos)
  arreglos: [
    {
      name: 'Arreglo de Orquídeas en Maceta',
      description: 'Elegantes orquídeas phalaenopsis en maceta decorativa. Regalo duradero y sofisticado.',
      price: 48000,
      image_url: '/assets/images/products/orquideas-maceta.jpg',
      category: 'Arreglos',
      stock: 10,
      featured: true
    },
    {
      name: 'Arreglo Zen con Bambú y Flores',
      description: 'Arreglo minimalista estilo zen con bambú, orquídeas y piedras. Equilibrio y armonía.',
      price: 55000,
      image_url: '/assets/images/products/zen-bambu.jpg',
      category: 'Arreglos',
      stock: 7
    },
    {
      name: 'Arreglo de Mesa para Bodas',
      description: 'Centro de mesa elegante para bodas con rosas, hortensias y velas. Romántico y sofisticado.',
      price: 62000,
      image_url: '/assets/images/products/mesa-bodas.jpg',
      category: 'Arreglos',
      stock: 15,
      featured: true
    },
    {
      name: 'Arreglo Corporativo Moderno',
      description: 'Diseño contemporáneo para oficinas con anturios, orquídeas y follaje verde. Imagen profesional.',
      price: 45000,
      image_url: '/assets/images/products/corporativo-moderno.jpg',
      category: 'Arreglos',
      stock: 12
    },
    {
      name: 'Arreglo de Flores Silvestres',
      description: 'Encantador arreglo con flores de campo en cesta rústica. Estilo natural y campestre.',
      price: 32000,
      image_url: '/assets/images/products/flores-silvestres.jpg',
      category: 'Arreglos',
      stock: 18
    },
    {
      name: 'Arreglo Mediterráneo con Romero',
      description: 'Arreglo aromático estilo mediterráneo con lavanda, romero y flores azules. Fragancia única.',
      price: 38000,
      image_url: '/assets/images/products/mediterraneo-romero.jpg',
      category: 'Arreglos',
      stock: 10
    },
    {
      name: 'Arreglo de Suculentas y Flores',
      description: 'Combinación moderna de suculentas, echeverias y flores. Bajo mantenimiento y duradero.',
      price: 42000,
      image_url: '/assets/images/products/suculentas-flores.jpg',
      category: 'Arreglos',
      stock: 14
    },
    {
      name: 'Arreglo Colgante con Hiedra',
      description: 'Arreglo colgante con hiedra, flores pendientes y musgo. Perfecto para decoración aérea.',
      price: 35000,
      image_url: '/assets/images/products/colgante-hiedra.jpg',
      category: 'Arreglos',
      stock: 8
    },
    {
      name: 'Arreglo de Tulipanes en Jarrón',
      description: 'Frescos tulipanes holandeses en elegante jarrón de cristal. Simplicidad y elegancia.',
      price: 40000,
      image_url: '/assets/images/products/tulipanes-jarron.jpg',
      category: 'Arreglos',
      stock: 16
    },
    {
      name: 'Arreglo de Lirios Asiáticos',
      description: 'Majestuoso arreglo de lirios asiáticos en tonos vibrantes. Fragancia intensa y flores grandes.',
      price: 46000,
      image_url: '/assets/images/products/lirios-asiaticos.jpg',
      category: 'Arreglos',
      stock: 11
    },
    {
      name: 'Arreglo de Flores Secas Decorativas',
      description: 'Arreglo permanente con flores secas, espigas y pampa grass. Sin mantenimiento.',
      price: 38000,
      image_url: '/assets/images/products/flores-secas.jpg',
      category: 'Arreglos',
      stock: 20
    },
    {
      name: 'Arreglo de Navidad Tradicional',
      description: 'Arreglo festivo con flores rojas, pinos y velas. Espíritu navideño en cada detalle.',
      price: 44000,
      image_url: '/assets/images/products/navidad-tradicional.jpg',
      category: 'Arreglos',
      stock: 25,
      seasonal: 'Navidad'
    },
    {
      name: 'Arreglo de Pascua con Azucenas',
      description: 'Elegante arreglo de Pascua con azucenas blancas y follaje primaveral. Pureza y renovación.',
      price: 42000,
      image_url: '/assets/images/products/pascua-azucenas.jpg',
      category: 'Arreglos',
      stock: 20,
      seasonal: 'Pascua'
    },
    {
      name: 'Arreglo de Verano Tropical',
      description: 'Explosión de colores con flores tropicales, heliconias y follaje exótico. Energía veraniega.',
      price: 50000,
      image_url: '/assets/images/products/verano-tropical.jpg',
      category: 'Arreglos',
      stock: 12
    },
    {
      name: 'Arreglo de Otoño con Crisantemos',
      description: 'Cálido arreglo otoñal con crisantemos en tonos naranjas, amarillos y rojos.',
      price: 36000,
      image_url: '/assets/images/products/otono-crisantemos.jpg',
      category: 'Arreglos',
      stock: 15,
      seasonal: 'Otoño'
    }
  ],

  // CATEGORÍA: INSUMOS (20 nuevos productos)
  insumos: [
    {
      name: 'Fertilizante Líquido Para Flores 500ml',
      description: 'Fertilizante líquido concentrado NPK 20-20-20 para flores. Aplicación foliar y radicular.',
      price: 8500,
      image_url: '/assets/images/products/fertilizante-liquido.jpg',
      category: 'Insumos',
      stock: 50
    },
    {
      name: 'Tierra Especial Para Rosas 5L',
      description: 'Sustrato premium para rosas con compost, perlita y micronutrientes. pH balanceado.',
      price: 6900,
      image_url: '/assets/images/products/tierra-rosas.jpg',
      category: 'Insumos',
      stock: 40
    },
    {
      name: 'Abono Orgánico Universal 1kg',
      description: 'Abono 100% orgánico para todo tipo de plantas. Rico en materia orgánica.',
      price: 5500,
      image_url: '/assets/images/products/abono-organico.jpg',
      category: 'Insumos',
      stock: 60
    },
    {
      name: 'Sustrato Para Orquídeas 2L',
      description: 'Mezcla especial de corteza de pino, carbón y perlita para orquídeas epífitas.',
      price: 7200,
      image_url: '/assets/images/products/sustrato-orquideas.jpg',
      category: 'Insumos',
      stock: 35
    },
    {
      name: 'Tierra Para Cactus y Suculentas 3L',
      description: 'Sustrato con excelente drenaje, arena y perlita. Ideal para plantas crasas.',
      price: 4800,
      image_url: '/assets/images/products/tierra-cactus.jpg',
      category: 'Insumos',
      stock: 45
    },
    {
      name: 'Fertilizante Foliar Micronutrientes 250ml',
      description: 'Fertilizante foliar con hierro, zinc, manganeso y boro. Previene deficiencias.',
      price: 6500,
      image_url: '/assets/images/products/fertilizante-foliar.jpg',
      category: 'Insumos',
      stock: 30
    },
    {
      name: 'Humus de Lombriz Premium 2kg',
      description: 'Humus de lombriz californiana de alta calidad. Mejora estructura del suelo.',
      price: 9800,
      image_url: '/assets/images/products/humus-lombriz.jpg',
      category: 'Insumos',
      stock: 42,
      featured: true
    },
    {
      name: 'Perlita Para Drenaje 2L',
      description: 'Perlita expandida para mejorar drenaje y aireación. Inerte y pH neutro.',
      price: 3200,
      image_url: '/assets/images/products/perlita.jpg',
      category: 'Insumos',
      stock: 55
    },
    {
      name: 'Vermiculita Agrícola 2L',
      description: 'Vermiculita expandida para retención de humedad y nutrientes.',
      price: 3500,
      image_url: '/assets/images/products/vermiculita.jpg',
      category: 'Insumos',
      stock: 48
    },
    {
      name: 'Carbón Activado Para Plantas 500g',
      description: 'Carbón activado para purificar agua y prevenir pudrición de raíces.',
      price: 4200,
      image_url: '/assets/images/products/carbon-activado.jpg',
      category: 'Insumos',
      stock: 38
    },
    {
      name: 'Hormona de Enraizamiento 50g',
      description: 'Hormona en polvo para estimular el enraizamiento de esquejes.',
      price: 5800,
      image_url: '/assets/images/products/hormona-enraizamiento.jpg',
      category: 'Insumos',
      stock: 32
    },
    {
      name: 'Insecticida Orgánico 500ml',
      description: 'Insecticida natural a base de aceite de neem. Efectivo y ecológico.',
      price: 7900,
      image_url: '/assets/images/products/insecticida-organico.jpg',
      category: 'Insumos',
      stock: 44
    },
    {
      name: 'Fungicida Preventivo 250ml',
      description: 'Fungicida sistémico para prevención de hongos. Amplio espectro.',
      price: 6800,
      image_url: '/assets/images/products/fungicida.jpg',
      category: 'Insumos',
      stock: 36
    },
    {
      name: 'Nutrientes Para Hidroponía 1L',
      description: 'Solución nutritiva completa NPK + micronutrientes para hidroponía.',
      price: 12500,
      image_url: '/assets/images/products/nutrientes-hidroponia.jpg',
      category: 'Insumos',
      stock: 25
    },
    {
      name: 'Arena de Río Lavada 5L',
      description: 'Arena de río lavada y esterilizada. Mejora drenaje en sustratos.',
      price: 3800,
      image_url: '/assets/images/products/arena-rio.jpg',
      category: 'Insumos',
      stock: 50
    },
    {
      name: 'Compost Orgánico 5L',
      description: 'Compost maduro y tamizado. Rico en nutrientes y microorganismos benéficos.',
      price: 5200,
      image_url: '/assets/images/products/compost.jpg',
      category: 'Insumos',
      stock: 46
    },
    {
      name: 'Turba Rubia 5L',
      description: 'Turba rubia natural. Retiene humedad y mejora estructura del sustrato.',
      price: 6200,
      image_url: '/assets/images/products/turba-rubia.jpg',
      category: 'Insumos',
      stock: 38
    },
    {
      name: 'Corteza de Pino Decorativa 3L',
      description: 'Corteza de pino natural para mulching y decoración. Previene malezas.',
      price: 4500,
      image_url: '/assets/images/products/corteza-pino.jpg',
      category: 'Insumos',
      stock: 52
    },
    {
      name: 'Piedras Decorativas 1kg',
      description: 'Piedras decorativas de colores para macetas y arreglos. Variedad de tonos.',
      price: 3900,
      image_url: '/assets/images/products/piedras-decorativas.jpg',
      category: 'Insumos',
      stock: 60
    },
    {
      name: 'Musgo Sphagnum 200g',
      description: 'Musgo sphagnum natural para orquídeas y bonsáis. Excelente retención de humedad.',
      price: 5500,
      image_url: '/assets/images/products/musgo-sphagnum.jpg',
      category: 'Insumos',
      stock: 28
    }
  ],

  // CATEGORÍA: ACCESORIOS (20 nuevos productos)
  accesorios: [
    {
      name: 'Maceta de Cerámica Pintada a Mano 15cm',
      description: 'Maceta artesanal de cerámica con diseños únicos. Incluye plato drenaje.',
      price: 12500,
      image_url: '/assets/images/products/maceta-ceramica.jpg',
      category: 'Accesorios',
      stock: 24,
      featured: true
    },
    {
      name: 'Jarrón de Cristal Cortado',
      description: 'Elegante jarrón de cristal cortado a mano. Altura 25cm, perfecto para ramos grandes.',
      price: 18900,
      image_url: '/assets/images/products/jarron-cristal.jpg',
      category: 'Accesorios',
      stock: 16
    },
    {
      name: 'Florero de Vidrio Soplado',
      description: 'Florero artesanal de vidrio soplado con formas únicas. Cada pieza es única.',
      price: 22000,
      image_url: '/assets/images/products/florero-soplado.jpg',
      category: 'Accesorios',
      stock: 12
    },
    {
      name: 'Portamacetas de Hierro Forjado',
      description: 'Soporte de hierro forjado para macetas. Diseño clásico para 3 niveles.',
      price: 28500,
      image_url: '/assets/images/products/portamacetas-hierro.jpg',
      category: 'Accesorios',
      stock: 10
    },
    {
      name: 'Regadera Decorativa Vintage',
      description: 'Regadera de metal estilo vintage. Capacidad 2L, doble función decorativa.',
      price: 15800,
      image_url: '/assets/images/products/regadera-vintage.jpg',
      category: 'Accesorios',
      stock: 18
    },
    {
      name: 'Tijeras de Podar Profesionales',
      description: 'Tijeras de podar con hoja de acero inoxidable. Mango ergonómico antideslizante.',
      price: 14200,
      image_url: '/assets/images/products/tijeras-podar.jpg',
      category: 'Accesorios',
      stock: 32
    },
    {
      name: 'Pulverizador de Latón 500ml',
      description: 'Pulverizador vintage de latón. Ideal para plantas delicadas y orquídeas.',
      price: 19500,
      image_url: '/assets/images/products/pulverizador-laton.jpg',
      category: 'Accesorios',
      stock: 14
    },
    {
      name: 'Macetas de Terracota Set 3 Tamaños',
      description: 'Set de macetas de terracota natural. Tamaños: 12cm, 15cm, 18cm.',
      price: 9800,
      image_url: '/assets/images/products/macetas-terracota.jpg',
      category: 'Accesorios',
      stock: 28
    },
    {
      name: 'Jardinera de Madera Rectangular',
      description: 'Jardinera de madera tratada. Medidas: 60x20x20cm. Incluye geotextil.',
      price: 24900,
      image_url: '/assets/images/products/jardinera-madera.jpg',
      category: 'Accesorios',
      stock: 15
    },
    {
      name: 'Soportes Para Plantas Colgantes Set 3',
      description: 'Ganchos de techo para plantas colgantes. Soportan hasta 5kg cada uno.',
      price: 7500,
      image_url: '/assets/images/products/soportes-colgantes.jpg',
      category: 'Accesorios',
      stock: 35
    },
    {
      name: 'Etiquetas Para Plantas 50 Unidades',
      description: 'Etiquetas de plástico resistente a la intemperie. Incluye marcador.',
      price: 3200,
      image_url: '/assets/images/products/etiquetas-plantas.jpg',
      category: 'Accesorios',
      stock: 45
    },
    {
      name: 'Guantes de Jardinería Premium',
      description: 'Guantes de cuero con refuerzos. Protección y comodidad para jardinería.',
      price: 8900,
      image_url: '/assets/images/products/guantes-jardineria.jpg',
      category: 'Accesorios',
      stock: 40
    },
    {
      name: 'Delantal de Jardinero con Bolsillos',
      description: 'Delantal de lona resistente con múltiples bolsillos. Ajustable.',
      price: 12800,
      image_url: '/assets/images/products/delantal-jardinero.jpg',
      category: 'Accesorios',
      stock: 22
    },
    {
      name: 'Cestas de Mimbre Decoradas Set 2',
      description: 'Cestas de mimbre natural decoradas. Ideales para arreglos florales.',
      price: 16500,
      image_url: '/assets/images/products/cestas-mimbre.jpg',
      category: 'Accesorios',
      stock: 20
    },
    {
      name: 'Cajas de Madera Rústicas Set 3',
      description: 'Cajas de madera reciclada estilo rústico. Perfectas para decoración.',
      price: 18200,
      image_url: '/assets/images/products/cajas-madera.jpg',
      category: 'Accesorios',
      stock: 18
    },
    {
      name: 'Lazos y Cintas Decorativas Surtidas',
      description: 'Pack de 10 lazos y cintas de diversos colores y texturas.',
      price: 5800,
      image_url: '/assets/images/products/lazos-cintas.jpg',
      category: 'Accesorios',
      stock: 50
    },
    {
      name: 'Tarjetas de Regalo Personalizadas 20 Und',
      description: 'Tarjetas de regalo con sobres. Diseños florales elegantes.',
      price: 4500,
      image_url: '/assets/images/products/tarjetas-regalo.jpg',
      category: 'Accesorios',
      stock: 60
    },
    {
      name: 'Papel de Regalo Ecológico Rollos 3m',
      description: 'Papel kraft ecológico con diseños botánicos. 70cm ancho.',
      price: 3900,
      image_url: '/assets/images/products/papel-ecologico.jpg',
      category: 'Accesorios',
      stock: 48
    },
    {
      name: 'Envoltorios de Celofán Colores 10 Und',
      description: 'Rollos de celofán en colores variados. 70x200cm cada uno.',
      price: 6200,
      image_url: '/assets/images/products/celofan-colores.jpg',
      category: 'Accesorios',
      stock: 42
    },
    {
      name: 'Kit Accesorios Para Ikebana',
      description: 'Kit completo para ikebana: kenzan, tijeras especiales y recipiente.',
      price: 32000,
      image_url: '/assets/images/products/kit-ikebana.jpg',
      category: 'Accesorios',
      stock: 8
    }
  ],

  // CATEGORÍA: JARDINERÍA (25 nuevos productos)
  jardineria: [
    {
      name: 'Semillas de Flores Anuales Mix',
      description: 'Mix de semillas de flores anuales: petunias, caléndulas, zinnias. Sobre 5g.',
      price: 2500,
      image_url: '/assets/images/products/semillas-anuales.jpg',
      category: 'Jardinería',
      stock: 80
    },
    {
      name: 'Semillas de Flores Perennes Mix',
      description: 'Mix de flores perennes: lavanda, equinácea, margaritas. Sobre 3g.',
      price: 3200,
      image_url: '/assets/images/products/semillas-perennes.jpg',
      category: 'Jardinería',
      stock: 70
    },
    {
      name: 'Bulbos de Tulipanes Holandeses 10 Und',
      description: 'Bulbos de tulipanes variados importados de Holanda. Floración primaveral.',
      price: 8500,
      image_url: '/assets/images/products/bulbos-tulipanes.jpg',
      category: 'Jardinería',
      stock: 45,
      featured: true
    },
    {
      name: 'Bulbos de Narcisos 15 Und',
      description: 'Bulbos de narcisos amarillos y blancos. Fácil cultivo y naturalización.',
      price: 6800,
      image_url: '/assets/images/products/bulbos-narcisos.jpg',
      category: 'Jardinería',
      stock: 52
    },
    {
      name: 'Albahaca Genovesa Maceta 12cm',
      description: 'Planta de albahaca genovesa lista para cocinar. Aroma intenso.',
      price: 3500,
      image_url: '/assets/images/products/albahaca.jpg',
      category: 'Jardinería',
      stock: 60
    },
    {
      name: 'Menta Piperita Maceta 12cm',
      description: 'Planta de menta piperita fresca. Ideal para infusiones y cócteles.',
      price: 3200,
      image_url: '/assets/images/products/menta.jpg',
      category: 'Jardinería',
      stock: 55
    },
    {
      name: 'Romero Maceta 15cm',
      description: 'Planta de romero aromático. Uso culinario y ornamental.',
      price: 4200,
      image_url: '/assets/images/products/romero.jpg',
      category: 'Jardinería',
      stock: 48
    },
    {
      name: 'Cactus Variados Maceta 8cm',
      description: 'Cactus surtidos de fácil cuidado. Ideal para principiantes.',
      price: 3800,
      image_url: '/assets/images/products/cactus-variados.jpg',
      category: 'Jardinería',
      stock: 75
    },
    {
      name: 'Suculentas Mixtas Set 6 Und',
      description: 'Set de 6 suculentas variadas en macetas 6cm. Bajo mantenimiento.',
      price: 12500,
      image_url: '/assets/images/products/suculentas-mix.jpg',
      category: 'Jardinería',
      stock: 40,
      featured: true
    },
    {
      name: 'Helecho de Boston Maceta 15cm',
      description: 'Helecho de Boston colgante. Purifica el aire y humidifica.',
      price: 9800,
      image_url: '/assets/images/products/helecho-boston.jpg',
      category: 'Jardinería',
      stock: 32
    },
    {
      name: 'Potos Dorado Maceta 12cm',
      description: 'Potos dorado de fácil cuidado. Purificador natural del aire.',
      price: 6500,
      image_url: '/assets/images/products/potos-dorado.jpg',
      category: 'Jardinería',
      stock: 50
    },
    {
      name: 'Filodendro Scandens Maceta 15cm',
      description: 'Filodendro trepador o colgante. Crecimiento rápido y resistente.',
      price: 8200,
      image_url: '/assets/images/products/filodendro.jpg',
      category: 'Jardinería',
      stock: 38
    },
    {
      name: 'Anturio Rojo Maceta 14cm',
      description: 'Anturio con flores rojas brillantes. Floración casi continua.',
      price: 14500,
      image_url: '/assets/images/products/anturio-rojo.jpg',
      category: 'Jardinería',
      stock: 28
    },
    {
      name: 'Violeta Africana Colores Surtidos',
      description: 'Violeta africana en flor. Colores: rosa, púrpura, blanco. Maceta 10cm.',
      price: 5800,
      image_url: '/assets/images/products/violeta-africana.jpg',
      category: 'Jardinería',
      stock: 45
    },
    {
      name: 'Begonia Rex Maceta 12cm',
      description: 'Begonia rex con hojas decorativas multicolor. Ideal para interiores.',
      price: 7500,
      image_url: '/assets/images/products/begonia-rex.jpg',
      category: 'Jardinería',
      stock: 35
    },
    {
      name: 'Caladio Bicolor Maceta 14cm',
      description: 'Caladio con hojas bicolor espectaculares. Temporada primavera-verano.',
      price: 9200,
      image_url: '/assets/images/products/caladio.jpg',
      category: 'Jardinería',
      stock: 25
    },
    {
      name: 'Ficus Benjamina Maceta 18cm',
      description: 'Ficus benjamina variegado. Árbol de interior clásico.',
      price: 16500,
      image_url: '/assets/images/products/ficus-benjamina.jpg',
      category: 'Jardinería',
      stock: 22
    },
    {
      name: 'Dracena Marginata Maceta 20cm',
      description: 'Dracena marginata tricolor. Resistente y de lento crecimiento.',
      price: 18900,
      image_url: '/assets/images/products/dracena.jpg',
      category: 'Jardinería',
      stock: 18
    },
    {
      name: 'Palma Areca Maceta 25cm',
      description: 'Palma areca purificadora de aire. Crecimiento compacto.',
      price: 24500,
      image_url: '/assets/images/products/palma-areca.jpg',
      category: 'Jardinería',
      stock: 15,
      featured: true
    },
    {
      name: 'Bambú de la Suerte Set 3 Tallos',
      description: 'Bambú de la suerte en vaso de vidrio. Símbolo de buena fortuna.',
      price: 5500,
      image_url: '/assets/images/products/bambu-suerte.jpg',
      category: 'Jardinería',
      stock: 65
    },
    {
      name: 'Bonsái de Ficus Retusa 15cm',
      description: 'Bonsái de ficus retusa para iniciación. Incluye guía de cuidados.',
      price: 32000,
      image_url: '/assets/images/products/bonsai-ficus.jpg',
      category: 'Jardinería',
      stock: 12
    },
    {
      name: 'Planta Carnívora Venus Atrapamoscas',
      description: 'Venus atrapamoscas en maceta especial. Fascinante y educativa.',
      price: 11500,
      image_url: '/assets/images/products/venus-atrapamoscas.jpg',
      category: 'Jardinería',
      stock: 20
    },
    {
      name: 'Orquídea Phalaenopsis Blanca',
      description: 'Orquídea phalaenopsis blanca en flor. 2-3 varas florales.',
      price: 28000,
      image_url: '/assets/images/products/orquidea-blanca.jpg',
      category: 'Jardinería',
      stock: 24,
      featured: true
    },
    {
      name: 'Rosal Miniatura Maceta 14cm',
      description: 'Rosal miniatura en diversos colores. Floración abundante.',
      price: 8900,
      image_url: '/assets/images/products/rosal-miniatura.jpg',
      category: 'Jardinería',
      stock: 35
    },
    {
      name: 'Azalea Japonesa Colores Variados',
      description: 'Azalea japonesa en flor. Floración espectacular primaveral.',
      price: 16800,
      image_url: '/assets/images/products/azalea-japonesa.jpg',
      category: 'Jardinería',
      stock: 28
    }
  ]
};

// Función principal
async function addExpandedCatalog() {
  let client;
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    client = await MongoClient.connect(MONGO_URI);
    const db = client.db(DB_NAME);
    const productsCollection = db.collection('products');

    console.log('✅ Conectado a MongoDB');
    console.log('📦 Preparando productos para inserción...');

    // Contar productos existentes por categoría
    const existingCounts = {};
    for (const category of Object.keys(expandedProducts)) {
      const count = await productsCollection.countDocuments({ category: category.charAt(0).toUpperCase() + category.slice(1) });
      existingCounts[category] = count;
      console.log(`📊 ${category}: ${count} productos existentes`);
    }

    // Preparar todos los productos con timestamps
    const allProducts = [];
    const now = new Date();
    
    for (const [category, products] of Object.entries(expandedProducts)) {
      products.forEach(product => {
        allProducts.push({
          ...product,
          createdAt: now,
          updatedAt: now,
          in_stock: true,
          stock_quantity: product.stock || 10
        });
      });
    }

    console.log(`\n📦 Total de productos a agregar: ${allProducts.length}`);
    console.log('🚀 Insertando productos...\n');

    // Insertar todos los productos
    const result = await productsCollection.insertMany(allProducts);
    
    console.log(`✅ ${result.insertedCount} productos agregados exitosamente\n`);

    // Contar productos finales por categoría
    console.log('📊 Resumen por categoría:\n');
    for (const [category, products] of Object.entries(expandedProducts)) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      const finalCount = await productsCollection.countDocuments({ category: categoryName });
      const added = products.length;
      console.log(`${categoryName}:`);
      console.log(`  Antes: ${existingCounts[category]}`);
      console.log(`  Agregados: ${added}`);
      console.log(`  Total: ${finalCount}\n`);
    }

    // Estadísticas finales
    const totalProducts = await productsCollection.countDocuments();
    const featuredProducts = await productsCollection.countDocuments({ featured: true });
    
    console.log('📈 Estadísticas globales:');
    console.log(`  Total de productos en catálogo: ${totalProducts}`);
    console.log(`  Productos destacados: ${featuredProducts}`);
    console.log(`  Productos con stock > 30: ${await productsCollection.countDocuments({ stock_quantity: { $gt: 30 } })}`);

    console.log('\n✨ ¡Catálogo ampliado exitosamente!');
    console.log('💡 Recomendaciones:');
    console.log('  1. Actualizar imágenes de productos con fotos reales');
    console.log('  2. Revisar precios según mercado local');
    console.log('  3. Actualizar stock según inventario real');
    console.log('  4. Agregar más productos destacados estratégicamente');
    
  } catch (error) {
    console.error('❌ Error al agregar productos:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión a MongoDB cerrada');
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  addExpandedCatalog()
    .then(() => {
      console.log('\n✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { addExpandedCatalog, expandedProducts };
