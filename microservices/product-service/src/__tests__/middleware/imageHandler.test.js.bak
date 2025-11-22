const imageHandler = require('../../middleware/imageHandler');

describe('Image Handler Middleware', () => {
  describe('Module exports', () => {
    it('should export uploadProductImages', () => {
      expect(imageHandler.uploadProductImages).toBeDefined();
      expect(typeof imageHandler.uploadProductImages).toBe('function');
    });

    it('should export validateImageUrl', () => {
      expect(imageHandler.validateImageUrl).toBeDefined();
      expect(typeof imageHandler.validateImageUrl).toBe('function');
    });

    it('should export validateImageUrls', () => {
      expect(imageHandler.validateImageUrls).toBeDefined();
      expect(typeof imageHandler.validateImageUrls).toBe('function');
    });

    it('should export processUploadedImages', () => {
      expect(imageHandler.processUploadedImages).toBeDefined();
      expect(typeof imageHandler.processUploadedImages).toBe('function');
    });
  });

  describe('validateImageUrl', () => {
    it('should validate correct image URLs', () => {
      expect(imageHandler.validateImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(imageHandler.validateImageUrl('https://example.com/photo.png')).toBe(true);
      expect(imageHandler.validateImageUrl('https://example.com/pic.webp')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(imageHandler.validateImageUrl('')).toBe(false);
      expect(imageHandler.validateImageUrl(null)).toBe(false);
      expect(imageHandler.validateImageUrl(undefined)).toBe(false);
      expect(imageHandler.validateImageUrl('not-a-url')).toBe(false);
    });

    it('should reject URLs without image extensions', () => {
      expect(imageHandler.validateImageUrl('https://example.com/file.pdf')).toBe(false);
      expect(imageHandler.validateImageUrl('https://example.com/doc.txt')).toBe(false);
    });
  });

  describe('validateImageUrls', () => {
    it('should validate array of valid URLs', () => {
      const urls = ['https://example.com/image1.jpg', 'https://example.com/image2.png'];
      const result = imageHandler.validateImageUrls(urls);
      expect(result.isValid).toBe(true);
    });

    it('should reject non-array input', () => {
      const result = imageHandler.validateImageUrls('not-an-array');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('array');
    });

    it('should reject empty array', () => {
      const result = imageHandler.validateImageUrls([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('al menos una imagen');
    });

    it('should reject too many images', () => {
      const urls = Array(11).fill('https://example.com/image.jpg');
      const result = imageHandler.validateImageUrls(urls);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Máximo 10');
    });

    it('should reject array with invalid URL', () => {
      const urls = ['https://example.com/image1.jpg', 'invalid-url'];
      const result = imageHandler.validateImageUrls(urls);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('URL de imagen inválida');
    });
  });

  describe('processUploadedImages', () => {
    it('should be a middleware function', () => {
      expect(typeof imageHandler.processUploadedImages).toBe('function');
      expect(imageHandler.processUploadedImages.length).toBe(3); // req, res, next
    });
  });
});
