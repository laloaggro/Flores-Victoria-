const Joi = require('joi');

// Import schemas from validation middleware
const { productSchema, filterSchema } = require('../../middleware/validation');

describe('Product Validation - Product Schema', () => {
  describe('valid product data', () => {
    it('should validate a complete product', () => {
      const validProduct = {
        id: 'rose-bouquet-1',
        name: 'Red Rose Bouquet',
        description: 'Beautiful bouquet of fresh red roses',
        price: 59900,
        original_price: 79900,
        category: 'bouquets',
        stock: 10,
        featured: true,
        active: true,
        rating: 4.5,
        reviews_count: 25,
        size: 'medium',
        delivery_time: '2-3 days',
        flowers: ['roses'],
        colors: ['red'],
        occasions: ['anniversary', 'love'],
        images: ['rose1.jpg', 'rose2.jpg'],
      };

      const { error, value } = productSchema.validate(validProduct, { context: { isUpdate: false } });
      expect(error).toBeUndefined();
      expect(value.name).toBe(validProduct.name);
      expect(value.price).toBe(validProduct.price);
    });

    it('should validate minimal required product data', () => {
      const minimalProduct = {
        id: 'simple-flower',
        name: 'Simple Flower',
        description: 'A simple flower arrangement for any occasion',
        price: 29900,
        category: 'single-flowers',
      };

      const { error, value } = productSchema.validate(minimalProduct, { context: { isUpdate: false } });
      expect(error).toBeUndefined();
      expect(value.stock).toBe(0); // Default value
      expect(value.featured).toBe(false); // Default value
      expect(value.active).toBe(true); // Default value
    });

    it('should apply default values', () => {
      const product = {
        id: 'test-product',
        name: 'Test Product',
        description: 'This is a test product for validation',
        price: 10000,
        category: 'test',
      };

      const { error, value } = productSchema.validate(product, { context: { isUpdate: false } });
      expect(error).toBeUndefined();
      expect(value.stock).toBe(0);
      expect(value.featured).toBe(false);
      expect(value.active).toBe(true);
      expect(value.reviews_count).toBe(0);
    });
  });

  describe('invalid product data', () => {
    it('should reject product without required fields', () => {
      const invalidProduct = {
        id: 'incomplete',
        name: 'No Description',
      };

      const { error } = productSchema.validate(invalidProduct, { context: { isUpdate: false } });
      expect(error).toBeDefined();
      expect(error.details).toBeDefined();
    });

    it('should reject product with short name', () => {
      const product = {
        id: 'test',
        name: 'AB', // Too short (min 3)
        description: 'Valid description here',
        price: 10000,
        category: 'test',
      };

      const { error } = productSchema.validate(product, { context: { isUpdate: false } });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 3 characters');
    });

    it('should reject product with short description', () => {
      const product = {
        id: 'test',
        name: 'Valid Name',
        description: 'Short', // Too short (min 10)
        price: 10000,
        category: 'test',
      };

      const { error } = productSchema.validate(product, { context: { isUpdate: false } });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 10 characters');
    });

    it('should reject product with negative price', () => {
      const product = {
        id: 'test',
        name: 'Test Product',
        description: 'Valid description',
        price: -1000, // Negative
        category: 'test',
      };

      const { error } = productSchema.validate(product, { context: { isUpdate: false } });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('positive');
    });

    it('should reject product with zero price', () => {
      const product = {
        id: 'test',
        name: 'Test Product',
        description: 'Valid description',
        price: 0,
        category: 'test',
      };

      const { error } = productSchema.validate(product, { context: { isUpdate: false } });
      expect(error).toBeDefined();
    });

    it('should reject product with invalid rating', () => {
      const product = {
        id: 'test',
        name: 'Test Product',
        description: 'Valid description',
        price: 10000,
        category: 'test',
        rating: 6, // Max is 5
      };

      const { error } = productSchema.validate(product, { context: { isUpdate: false } });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('less than or equal to 5');
    });

    it('should reject product with negative stock', () => {
      const product = {
        id: 'test',
        name: 'Test Product',
        description: 'Valid description',
        price: 10000,
        category: 'test',
        stock: -5,
      };

      const { error } = productSchema.validate(product, { context: { isUpdate: false } });
      expect(error).toBeDefined();
    });
  });

  describe('data sanitization', () => {
    it('should trim whitespace from strings', () => {
      const product = {
        id: '  test-id  ',
        name: '  Product Name  ',
        description: '  Product Description  ',
        price: 10000,
        category: '  category  ',
      };

      const { error, value } = productSchema.validate(product, { context: { isUpdate: false } });
      expect(error).toBeUndefined();
      expect(value.id).toBe('test-id');
      expect(value.name).toBe('Product Name');
      expect(value.description).toBe('Product Description');
      expect(value.category).toBe('category');
    });
  });
});

describe('Product Validation - Filter Schema', () => {
  describe('valid filters', () => {
    it('should validate search filters', () => {
      const filters = {
        occasion: 'wedding',
        category: 'bouquets',
        color: 'red',
        minPrice: 10000,
        maxPrice: 50000,
        search: 'roses',
        featured: 'true',
        limit: 20,
        page: 2,
      };

      const { error, value } = filterSchema.validate(filters);
      expect(error).toBeUndefined();
      expect(value.occasion).toBe('wedding');
      expect(value.limit).toBe(20);
      expect(value.page).toBe(2);
    });

    it('should apply default values to filters', () => {
      const filters = {
        search: 'flowers',
      };

      const { error, value } = filterSchema.validate(filters);
      expect(error).toBeUndefined();
      expect(value.limit).toBe(50); // Default limit
      expect(value.page).toBe(1); // Default page
    });

    it('should validate empty filters', () => {
      const { error, value } = filterSchema.validate({});
      expect(error).toBeUndefined();
      expect(value.limit).toBe(50);
      expect(value.page).toBe(1);
    });

    it('should trim whitespace from filter strings', () => {
      const filters = {
        occasion: '  wedding  ',
        category: '  bouquets  ',
        search: '  roses  ',
      };

      const { error, value } = filterSchema.validate(filters);
      expect(error).toBeUndefined();
      expect(value.occasion).toBe('wedding');
      expect(value.category).toBe('bouquets');
      expect(value.search).toBe('roses');
    });
  });

  describe('invalid filters', () => {
    it('should reject search term that is too short', () => {
      const filters = {
        search: 'a', // Min length is 2
      };

      const { error } = filterSchema.validate(filters);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 2 characters');
    });

    it('should reject negative price filters', () => {
      const filters1 = { minPrice: -1000 };
      const filters2 = { maxPrice: -5000 };

      expect(filterSchema.validate(filters1).error).toBeDefined();
      expect(filterSchema.validate(filters2).error).toBeDefined();
    });

    it('should reject invalid featured value', () => {
      const filters = {
        featured: 'invalid', // Should be 'true' or 'false'
      };

      const { error } = filterSchema.validate(filters);
      expect(error).toBeDefined();
    });

    it('should reject limit exceeding maximum', () => {
      const filters = {
        limit: 150, // Max is 100
      };

      const { error } = filterSchema.validate(filters);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('less than or equal to 100');
    });

    it('should reject zero or negative limit', () => {
      const filters1 = { limit: 0 };
      const filters2 = { limit: -5 };

      expect(filterSchema.validate(filters1).error).toBeDefined();
      expect(filterSchema.validate(filters2).error).toBeDefined();
    });

    it('should reject zero or negative page', () => {
      const filters1 = { page: 0 };
      const filters2 = { page: -1 };

      expect(filterSchema.validate(filters1).error).toBeDefined();
      expect(filterSchema.validate(filters2).error).toBeDefined();
    });
  });

  describe('unknown fields handling', () => {
    it('should strip unknown fields when stripUnknown is enabled', () => {
      const filters = {
        search: 'roses',
        unknownField: 'should be removed',
        anotherUnknown: 123,
      };

      const { error, value } = filterSchema.validate(filters, { stripUnknown: true });
      expect(error).toBeUndefined();
      expect(value.search).toBe('roses');
      expect(value.unknownField).toBeUndefined();
      expect(value.anotherUnknown).toBeUndefined();
    });
  });
});

describe('Product Validation - Edge Cases', () => {
  it('should handle decimal prices', () => {
    const product = {
      id: 'test',
      name: 'Test Product',
      description: 'Valid description',
      price: 29999, // Integer price in cents
      category: 'test',
    };

    const { error } = productSchema.validate(product, { context: { isUpdate: false } });
    expect(error).toBeUndefined();
  });

  it('should handle arrays in product data', () => {
    const product = {
      id: 'test',
      name: 'Test Product',
      description: 'Valid description',
      price: 10000,
      category: 'test',
      flowers: ['rose', 'tulip', 'lily'],
      colors: ['red', 'white'],
      occasions: ['wedding', 'anniversary'],
      images: ['img1.jpg', 'img2.jpg'],
    };

    const { error, value } = productSchema.validate(product, { context: { isUpdate: false } });
    expect(error).toBeUndefined();
    expect(value.flowers).toHaveLength(3);
    expect(value.colors).toHaveLength(2);
  });

  it('should handle update mode (id optional)', () => {
    const updateData = {
      name: 'Updated Name',
      description: 'Updated description',
      price: 15000,
      category: 'updated',
    };

    const { error } = productSchema.validate(updateData, { context: { isUpdate: true } });
    expect(error).toBeUndefined();
  });

  it('should require id in create mode', () => {
    const createData = {
      name: 'New Product',
      description: 'New product description',
      price: 15000,
      category: 'new',
      // Missing id
    };

    const { error } = productSchema.validate(createData, { context: { isUpdate: false } });
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('required');
  });
});
