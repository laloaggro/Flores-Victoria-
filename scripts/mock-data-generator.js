/**
 * Mock Data Generator for Flores Victoria
 * Generates realistic test data for development and testing
 */

class MockDataGenerator {
  constructor() {
    this.categories = ['Ramos', 'Arreglos', 'Plantas', 'Accesorios'];
    this.flowers = ['Rosas', 'Tulipanes', 'Lirios', 'Girasoles', 'Orquídeas', 'Claveles'];
    this.colors = ['Rojas', 'Blancas', 'Rosadas', 'Amarillas', 'Moradas', 'Mixtas'];
    this.occasions = ['Cumpleaños', 'Aniversario', 'Amor', 'Agradecimiento', 'Condolencias'];
  }

  // Generate random number between min and max
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate random element from array
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Generate UUID
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Generate slug from string
  generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Generate product
  generateProduct() {
    const flower = this.randomChoice(this.flowers);
    const color = this.randomChoice(this.colors);
    const category = this.randomChoice(this.categories);
    const name = `${category} de ${flower} ${color}`;

    return {
      id: this.generateId(),
      name,
      slug: this.generateSlug(name),
      description: `Hermoso ${category.toLowerCase()} de ${flower.toLowerCase()} ${color.toLowerCase()} perfectas para cualquier ocasión`,
      category,
      price: this.random(15, 80) * 1000,
      originalPrice: this.random(80, 120) * 1000,
      discount: this.random(0, 30),
      stock: this.random(0, 100),
      featured: Math.random() > 0.7,
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviews: this.random(0, 200),
      images: [
        `/images/products/${this.generateSlug(name)}-1.webp`,
        `/images/products/${this.generateSlug(name)}-2.webp`,
      ],
      tags: [flower, color, this.randomChoice(this.occasions)],
      active: true,
      createdAt: new Date(Date.now() - this.random(0, 365) * 24 * 60 * 60 * 1000),
    };
  }

  // Generate multiple products
  generateProducts(count = 50) {
    return Array.from({ length: count }, () => this.generateProduct());
  }

  // Generate user
  generateUser() {
    const firstNames = ['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Carmen', 'José', 'Isabel'];
    const lastNames = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez'];
    const firstName = this.randomChoice(firstNames);
    const lastName = this.randomChoice(lastNames);

    return {
      id: this.generateId(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      firstName,
      lastName,
      phone: `+569${this.random(10000000, 99999999)}`,
      role: Math.random() > 0.9 ? 'admin' : 'customer',
      active: Math.random() > 0.1,
      createdAt: new Date(Date.now() - this.random(0, 730) * 24 * 60 * 60 * 1000),
    };
  }

  // Generate multiple users
  generateUsers(count = 100) {
    return Array.from({ length: count }, () => this.generateUser());
  }

  // Generate order
  generateOrder(userId = null) {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['credit_card', 'debit_card', 'transfer', 'cash'];
    const productCount = this.random(1, 5);
    const products = this.generateProducts(productCount);

    const subtotal = products.reduce((sum, p) => sum + p.price, 0);
    const shipping = 5000;
    const tax = Math.round(subtotal * 0.19);
    const total = subtotal + shipping + tax;

    return {
      id: this.generateId(),
      orderNumber: `FV-${Date.now()}-${this.random(1000, 9999)}`,
      userId: userId || this.generateId(),
      status: this.randomChoice(statuses),
      items: products.map((p) => ({
        productId: p.id,
        productName: p.name,
        quantity: this.random(1, 3),
        price: p.price,
      })),
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod: this.randomChoice(paymentMethods),
      paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending',
      shippingAddress: {
        street: `Calle ${this.random(1, 100)} #${this.random(100, 9999)}`,
        city: this.randomChoice(['Santiago', 'Valparaíso', 'Concepción', 'La Serena']),
        region: 'Metropolitana',
        postalCode: `${this.random(1000000, 9999999)}`,
        country: 'Chile',
      },
      createdAt: new Date(Date.now() - this.random(0, 90) * 24 * 60 * 60 * 1000),
    };
  }

  // Generate multiple orders
  generateOrders(count = 200) {
    return Array.from({ length: count }, () => this.generateOrder());
  }

  // Generate review
  generateReview(productId = null) {
    const ratings = [1, 2, 3, 4, 5];
    const comments = [
      'Excelente producto, muy recomendado',
      'Buena calidad, llegó a tiempo',
      'Hermosas flores, tal como en la foto',
      'El arreglo superó mis expectativas',
      'Muy satisfecho con la compra',
      'Las flores llegaron frescas y hermosas',
    ];

    return {
      id: this.generateId(),
      productId: productId || this.generateId(),
      userId: this.generateId(),
      rating: this.randomChoice(ratings),
      comment: this.randomChoice(comments),
      helpful: this.random(0, 50),
      verified: Math.random() > 0.3,
      createdAt: new Date(Date.now() - this.random(0, 180) * 24 * 60 * 60 * 1000),
    };
  }

  // Generate complete dataset
  generateDataset() {
    return {
      products: this.generateProducts(50),
      users: this.generateUsers(100),
      orders: this.generateOrders(200),
      categories: this.categories.map((cat) => ({
        id: this.generateId(),
        name: cat,
        slug: this.generateSlug(cat),
        active: true,
      })),
    };
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockDataGenerator;
}
