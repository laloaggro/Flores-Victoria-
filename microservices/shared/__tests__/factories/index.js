/**
 * @fileoverview Test Data Factory
 * @description Factories para generar datos de prueba realistas
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Generador de datos aleatorios simple (sin dependencias)
 */
class FakeDataGenerator {
  constructor(seed = Date.now()) {
    this.seed = seed;
  }

  /**
   * Genera número aleatorio
   */
  random() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Genera entero entre min y max
   */
  int(min = 0, max = 100) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Genera float entre min y max
   */
  float(min = 0, max = 100, decimals = 2) {
    const value = this.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  }

  /**
   * Selecciona elemento aleatorio de array
   */
  pick(array) {
    return array[Math.floor(this.random() * array.length)];
  }

  /**
   * Selecciona múltiples elementos aleatorios
   */
  pickMultiple(array, count) {
    const shuffled = [...array].sort(() => this.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Genera UUID
   */
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (this.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Genera fecha aleatoria entre dos fechas
   */
  date(start = new Date(2020, 0, 1), end = new Date()) {
    return new Date(start.getTime() + this.random() * (end.getTime() - start.getTime()));
  }

  /**
   * Genera booleano con probabilidad
   */
  boolean(probability = 0.5) {
    return this.random() < probability;
  }
}

// Datos de ejemplo para florería
const SAMPLE_DATA = {
  firstNames: ['María', 'Ana', 'Juan', 'Carlos', 'Laura', 'Pedro', 'Sofia', 'Diego', 'Carmen', 'Luis'],
  lastNames: ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Fernández', 'Pérez', 'Sánchez'],
  domains: ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'test.com'],
  streets: ['Av. Principal', 'Calle Real', 'Jr. Las Flores', 'Av. Los Rosales', 'Calle Primavera'],
  cities: ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Piura'],
  districts: ['Miraflores', 'San Isidro', 'Surco', 'La Molina', 'Barranco'],
  flowerTypes: ['Rosas', 'Tulipanes', 'Girasoles', 'Orquídeas', 'Lilies', 'Claveles', 'Margaritas'],
  occasions: ['Cumpleaños', 'Aniversario', 'Amor', 'Condolencias', 'Graduación', 'San Valentín'],
  colors: ['Rojo', 'Blanco', 'Rosa', 'Amarillo', 'Naranja', 'Morado', 'Mixto'],
  sizes: ['Pequeño', 'Mediano', 'Grande', 'Premium'],
  statuses: {
    order: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'],
    product: ['active', 'inactive', 'out_of_stock'],
    user: ['active', 'inactive', 'suspended'],
  },
  paymentMethods: ['credit_card', 'debit_card', 'cash', 'transfer', 'yape', 'plin'],
};

/**
 * Factory base
 */
class BaseFactory {
  constructor(faker = new FakeDataGenerator()) {
    this.faker = faker;
    this.sequence = 0;
  }

  /**
   * Genera secuencia incremental
   */
  nextSequence() {
    return ++this.sequence;
  }

  /**
   * Reinicia secuencia
   */
  resetSequence() {
    this.sequence = 0;
  }

  /**
   * Sobrescribe para definir datos por defecto
   */
  definition() {
    throw new Error('definition() must be implemented');
  }

  /**
   * Crea una instancia con override
   */
  create(overrides = {}) {
    return { ...this.definition(), ...overrides };
  }

  /**
   * Crea múltiples instancias
   */
  createMany(count, overrides = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Crea con estado específico
   */
  state(stateName) {
    const states = this.states?.() || {};
    if (!states[stateName]) {
      throw new Error(`State '${stateName}' not defined`);
    }
    return {
      create: (overrides = {}) => this.create({ ...states[stateName], ...overrides }),
      createMany: (count, overrides = {}) => this.createMany(count, { ...states[stateName], ...overrides }),
    };
  }
}

/**
 * User Factory
 */
class UserFactory extends BaseFactory {
  definition() {
    const firstName = this.faker.pick(SAMPLE_DATA.firstNames);
    const lastName = this.faker.pick(SAMPLE_DATA.lastNames);
    const domain = this.faker.pick(SAMPLE_DATA.domains);

    return {
      id: this.faker.uuid(),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${this.nextSequence()}@${domain}`,
      phone: `9${this.faker.int(10000000, 99999999)}`,
      password: 'hashedPassword123',
      role: 'customer',
      status: 'active',
      emailVerified: this.faker.boolean(0.8),
      createdAt: this.faker.date(new Date(2023, 0, 1)).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  states() {
    return {
      admin: { role: 'admin', emailVerified: true },
      unverified: { emailVerified: false },
      inactive: { status: 'inactive' },
      suspended: { status: 'suspended' },
    };
  }
}

/**
 * Address Factory
 */
class AddressFactory extends BaseFactory {
  definition() {
    return {
      id: this.faker.uuid(),
      street: `${this.faker.pick(SAMPLE_DATA.streets)} ${this.faker.int(100, 999)}`,
      district: this.faker.pick(SAMPLE_DATA.districts),
      city: this.faker.pick(SAMPLE_DATA.cities),
      reference: `Cerca al parque`,
      isDefault: this.faker.boolean(0.3),
      label: this.faker.pick(['Casa', 'Oficina', 'Otro']),
    };
  }
}

/**
 * Product Factory
 */
class ProductFactory extends BaseFactory {
  definition() {
    const flowerType = this.faker.pick(SAMPLE_DATA.flowerTypes);
    const color = this.faker.pick(SAMPLE_DATA.colors);
    const size = this.faker.pick(SAMPLE_DATA.sizes);
    const occasion = this.faker.pick(SAMPLE_DATA.occasions);

    const basePrice = this.faker.float(30, 200, 2);

    return {
      id: this.faker.uuid(),
      name: `Arreglo de ${flowerType} ${color}`,
      slug: `arreglo-${flowerType.toLowerCase()}-${color.toLowerCase()}-${this.nextSequence()}`,
      description: `Hermoso arreglo de ${flowerType.toLowerCase()} ${color.toLowerCase()}, perfecto para ${occasion.toLowerCase()}.`,
      shortDescription: `${flowerType} ${color} - ${size}`,
      price: basePrice,
      comparePrice: this.faker.boolean(0.3) ? this.faker.float(basePrice * 1.2, basePrice * 1.5, 2) : null,
      sku: `FL-${this.faker.int(1000, 9999)}`,
      stock: this.faker.int(0, 50),
      category: occasion,
      subcategory: flowerType,
      tags: [flowerType.toLowerCase(), color.toLowerCase(), occasion.toLowerCase()],
      images: [`/images/products/arrangement-${this.faker.int(1, 20)}.jpg`],
      size,
      color,
      flowerTypes: [flowerType],
      status: this.faker.pick(SAMPLE_DATA.statuses.product),
      featured: this.faker.boolean(0.2),
      rating: this.faker.float(3.5, 5, 1),
      reviewCount: this.faker.int(0, 100),
      createdAt: this.faker.date(new Date(2023, 0, 1)).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  states() {
    return {
      outOfStock: { stock: 0, status: 'out_of_stock' },
      featured: { featured: true, rating: this.faker.float(4.5, 5, 1) },
      onSale: {
        comparePrice: this.faker.float(80, 150, 2),
        price: this.faker.float(50, 79, 2),
      },
      inactive: { status: 'inactive' },
    };
  }
}

/**
 * Order Factory
 */
class OrderFactory extends BaseFactory {
  constructor(faker, userFactory, productFactory, addressFactory) {
    super(faker);
    this.userFactory = userFactory || new UserFactory(faker);
    this.productFactory = productFactory || new ProductFactory(faker);
    this.addressFactory = addressFactory || new AddressFactory(faker);
  }

  definition() {
    const itemCount = this.faker.int(1, 5);
    const items = Array.from({ length: itemCount }, () => {
      const product = this.productFactory.create();
      const quantity = this.faker.int(1, 3);
      return {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        subtotal: product.price * quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = subtotal > 100 ? 0 : 15;
    const total = subtotal + shipping;

    return {
      id: this.faker.uuid(),
      orderNumber: `ORD-${this.faker.int(10000, 99999)}`,
      userId: this.faker.uuid(),
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping,
      total: parseFloat(total.toFixed(2)),
      status: this.faker.pick(SAMPLE_DATA.statuses.order),
      paymentMethod: this.faker.pick(SAMPLE_DATA.paymentMethods),
      paymentStatus: this.faker.pick(['pending', 'paid', 'refunded']),
      shippingAddress: this.addressFactory.create(),
      deliveryDate: this.faker.date(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).toISOString(),
      deliveryTime: this.faker.pick(['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00']),
      notes: this.faker.boolean(0.3) ? 'Por favor, llamar antes de entregar' : null,
      giftMessage: this.faker.boolean(0.5) ? '¡Feliz cumpleaños!' : null,
      createdAt: this.faker.date(new Date(2024, 0, 1)).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  states() {
    return {
      pending: { status: 'pending', paymentStatus: 'pending' },
      paid: { status: 'confirmed', paymentStatus: 'paid' },
      delivered: { status: 'delivered', paymentStatus: 'paid' },
      cancelled: { status: 'cancelled', paymentStatus: 'refunded' },
    };
  }
}

/**
 * Review Factory
 */
class ReviewFactory extends BaseFactory {
  definition() {
    const ratings = [3, 4, 4, 4, 5, 5, 5, 5]; // Sesgo positivo
    const comments = [
      'Excelente calidad, muy frescas',
      'Hermoso arreglo, llegó a tiempo',
      'Las flores estaban perfectas',
      'Muy buen servicio',
      'Superó mis expectativas',
      'Buena relación calidad-precio',
      'Recomendado 100%',
    ];

    return {
      id: this.faker.uuid(),
      productId: this.faker.uuid(),
      userId: this.faker.uuid(),
      userName: `${this.faker.pick(SAMPLE_DATA.firstNames)} ${this.faker.pick(SAMPLE_DATA.lastNames)}`,
      rating: this.faker.pick(ratings),
      title: this.faker.pick(['Excelente', 'Muy bueno', 'Recomendado', 'Me encantó']),
      comment: this.faker.pick(comments),
      images: this.faker.boolean(0.2) ? [`/images/reviews/review-${this.faker.int(1, 10)}.jpg`] : [],
      verified: this.faker.boolean(0.7),
      helpful: this.faker.int(0, 20),
      createdAt: this.faker.date(new Date(2024, 0, 1)).toISOString(),
    };
  }

  states() {
    return {
      negative: {
        rating: this.faker.int(1, 2),
        title: 'Decepcionante',
        comment: 'No cumplió con mis expectativas',
      },
      verified: { verified: true },
      withImages: {
        images: [
          `/images/reviews/review-${this.faker.int(1, 10)}.jpg`,
          `/images/reviews/review-${this.faker.int(1, 10)}.jpg`,
        ],
      },
    };
  }
}

/**
 * Cart Factory
 */
class CartFactory extends BaseFactory {
  constructor(faker, productFactory) {
    super(faker);
    this.productFactory = productFactory || new ProductFactory(faker);
  }

  definition() {
    const itemCount = this.faker.int(1, 4);
    const items = Array.from({ length: itemCount }, () => {
      const product = this.productFactory.create();
      const quantity = this.faker.int(1, 3);
      return {
        productId: product.id,
        product,
        quantity,
        addedAt: this.faker.date(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).toISOString(),
      };
    });

    return {
      id: this.faker.uuid(),
      userId: this.faker.uuid(),
      sessionId: this.faker.uuid(),
      items,
      createdAt: this.faker.date(new Date(Date.now() - 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  states() {
    return {
      empty: { items: [] },
      guest: { userId: null },
    };
  }
}

/**
 * Factory Manager - Punto de entrada principal
 */
class FactoryManager {
  constructor(seed) {
    this.faker = new FakeDataGenerator(seed);
    this.factories = {
      user: new UserFactory(this.faker),
      address: new AddressFactory(this.faker),
      product: new ProductFactory(this.faker),
      order: new OrderFactory(this.faker),
      review: new ReviewFactory(this.faker),
      cart: new CartFactory(this.faker),
    };
  }

  /**
   * Obtiene factory por nombre
   */
  factory(name) {
    const factory = this.factories[name];
    if (!factory) {
      throw new Error(`Factory '${name}' not found`);
    }
    return factory;
  }

  /**
   * Crea instancia directamente
   */
  create(factoryName, overrides = {}) {
    return this.factory(factoryName).create(overrides);
  }

  /**
   * Crea múltiples instancias
   */
  createMany(factoryName, count, overrides = {}) {
    return this.factory(factoryName).createMany(count, overrides);
  }

  /**
   * Seed de base de datos completa
   */
  seedDatabase() {
    return {
      users: this.createMany('user', 10),
      admins: this.factory('user').state('admin').createMany(2),
      products: this.createMany('product', 50),
      featuredProducts: this.factory('product').state('featured').createMany(6),
      orders: this.createMany('order', 30),
      reviews: this.createMany('review', 100),
    };
  }
}

module.exports = {
  FactoryManager,
  FakeDataGenerator,
  BaseFactory,
  UserFactory,
  AddressFactory,
  ProductFactory,
  OrderFactory,
  ReviewFactory,
  CartFactory,
  SAMPLE_DATA,
};
