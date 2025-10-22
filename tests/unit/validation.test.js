const { validate, registerSchema, loginSchema, productSchema, orderSchema } = require('../../microservices/shared/validation/schemas');

describe('Validation Schemas', () => {
  describe('Register Schema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Juan Pérez',
        phone: '+56 9 1234 5678'
      };

      const { error, value } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(validData);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Juan Pérez'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Juan Pérez'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });

    it('should trim and lowercase email', () => {
      const data = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123!',
        name: 'Juan Pérez'
      };

      const { error, value } = registerSchema.validate(data);
      expect(error).toBeUndefined();
      expect(value.email).toBe('test@example.com');
    });

    it('should reject invalid Chilean phone number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Juan Pérez',
        phone: '1234567890' // Invalid format
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('Login Schema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword'
      };

      const { error, value } = loginSchema.validate(validData);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(validData);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'anypassword'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });
  });

  describe('Product Schema', () => {
    it('should validate valid product data', () => {
      const validData = {
        name: 'Ramo de Rosas',
        description: 'Hermoso ramo de rosas rojas',
        price: 35000,
        category: 'Ramos',
        stock: 10,
        discount: 15
      };

      const { error, value } = productSchema.validate(validData);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(validData);
    });

    it('should reject negative price', () => {
      const invalidData = {
        name: 'Producto',
        price: -100,
        category: 'Ramos'
      };

      const { error } = productSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject invalid category', () => {
      const invalidData = {
        name: 'Producto',
        price: 100,
        category: 'InvalidCategory'
      };

      const { error } = productSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('category');
    });

    it('should set default values', () => {
      const data = {
        name: 'Producto',
        price: 100,
        category: 'Ramos'
      };

      const { error, value } = productSchema.validate(data);
      expect(error).toBeUndefined();
      expect(value.stock).toBe(0);
      expect(value.discount).toBe(0);
      expect(value.featured).toBe(false);
    });

    it('should reject discount over 100%', () => {
      const invalidData = {
        name: 'Producto',
        price: 100,
        category: 'Ramos',
        discount: 150
      };

      const { error } = productSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('Order Schema', () => {
    it('should validate valid order data', () => {
      const validData = {
        items: [
          { productId: '123', quantity: 2 },
          { productId: '456', quantity: 1 }
        ],
        deliveryAddress: {
          street: 'Calle Falsa',
          number: '123',
          commune: 'Las Condes',
          city: 'Santiago',
          region: 'Región Metropolitana'
        },
        paymentMethod: 'webpay',
        deliveryDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      };

      const { error, value } = orderSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject empty items array', () => {
      const invalidData = {
        items: [],
        deliveryAddress: {
          street: 'Calle Falsa',
          commune: 'Las Condes',
          city: 'Santiago',
          region: 'Región Metropolitana'
        },
        paymentMethod: 'webpay',
        deliveryDate: new Date(Date.now() + 86400000).toISOString()
      };

      const { error } = orderSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject invalid payment method', () => {
      const invalidData = {
        items: [{ productId: '123', quantity: 1 }],
        deliveryAddress: {
          street: 'Calle Falsa',
          commune: 'Las Condes',
          city: 'Santiago',
          region: 'Región Metropolitana'
        },
        paymentMethod: 'bitcoin',
        deliveryDate: new Date(Date.now() + 86400000).toISOString()
      };

      const { error } = orderSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('paymentMethod');
    });

    it('should reject past delivery date', () => {
      const invalidData = {
        items: [{ productId: '123', quantity: 1 }],
        deliveryAddress: {
          street: 'Calle Falsa',
          commune: 'Las Condes',
          city: 'Santiago',
          region: 'Región Metropolitana'
        },
        paymentMethod: 'webpay',
        deliveryDate: new Date(Date.now() - 86400000).toISOString() // Yesterday
      };

      const { error } = orderSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject invalid postal code format', () => {
      const invalidData = {
        items: [{ productId: '123', quantity: 1 }],
        deliveryAddress: {
          street: 'Calle Falsa',
          commune: 'Las Condes',
          city: 'Santiago',
          region: 'Región Metropolitana',
          postalCode: '123' // Should be 7 digits
        },
        paymentMethod: 'webpay',
        deliveryDate: new Date(Date.now() + 86400000).toISOString()
      };

      const { error } = orderSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});
