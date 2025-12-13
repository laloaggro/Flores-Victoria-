/**
 * Comprehensive tests for Image Handler middleware
 * Target: 44.59% → 80% coverage
 */

const fs = require('fs').promises;

// Mock fs before requiring imageHandler
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const imageHandler = require('../../middleware/imageHandler');
const logger = require('../../logger');

describe('Image Handler Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Module exports', () => {
    it('should export all required functions', () => {
      expect(imageHandler.uploadProductImages).toBeDefined();
      expect(imageHandler.validateImageUrl).toBeDefined();
      expect(imageHandler.validateImageUrls).toBeDefined();
      expect(imageHandler.processUploadedImages).toBeDefined();
      expect(imageHandler.validateProductImages).toBeDefined();
      expect(imageHandler.deleteImageFile).toBeDefined();
      expect(imageHandler.cleanupOrphanImages).toBeDefined();
    });
  });

  describe('validateImageUrl', () => {
    it('should accept valid HTTPS image URLs', () => {
      const validUrls = [
        'https://example.com/image.jpg',
        'https://example.com/path/to/image.png',
        'https://cdn.example.com/image.webp',
        'https://example.com/image.jpeg',
        'https://example.com/image.gif',
        'https://example.com/image.svg',
      ];

      validUrls.forEach((url) => {
        expect(imageHandler.validateImageUrl(url)).toBe(true);
      });
    });

    it('should accept valid HTTP image URLs', () => {
      expect(imageHandler.validateImageUrl('http://example.com/image.jpg')).toBe(true);
    });

    it('should accept URLs without protocol', () => {
      expect(imageHandler.validateImageUrl('example.com/path/image.png')).toBe(true);
    });

    it('should reject URLs without image extensions', () => {
      expect(imageHandler.validateImageUrl('https://example.com/file.pdf')).toBe(false);
      expect(imageHandler.validateImageUrl('https://example.com/doc.txt')).toBe(false);
      expect(imageHandler.validateImageUrl('https://example.com/document')).toBe(false);
    });

    it('should reject invalid URL formats', () => {
      expect(imageHandler.validateImageUrl('not-a-url')).toBe(false);
      expect(imageHandler.validateImageUrl('http://')).toBe(false);
      expect(imageHandler.validateImageUrl('')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(imageHandler.validateImageUrl(null)).toBe(false);
      expect(imageHandler.validateImageUrl(undefined)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(imageHandler.validateImageUrl(123)).toBe(false);
      expect(imageHandler.validateImageUrl({})).toBe(false);
      expect(imageHandler.validateImageUrl([])).toBe(false);
    });
  });

  describe('validateImageUrls', () => {
    it('should accept valid array of image URLs', () => {
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.png',
        'https://example.com/image3.webp',
      ];
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

    it('should reject more than 10 images', () => {
      const urls = Array(11).fill('https://example.com/image.jpg');
      const result = imageHandler.validateImageUrls(urls);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Máximo 10');
    });

    it('should identify invalid URL in array', () => {
      const urls = ['https://example.com/valid.jpg', 'invalid-url'];
      const result = imageHandler.validateImageUrls(urls);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('URL de imagen inválida');
    });

    it('should accept exactly 10 images', () => {
      const urls = Array(10).fill('https://example.com/image.jpg');
      const result = imageHandler.validateImageUrls(urls);
      expect(result.isValid).toBe(true);
    });

    it('should accept exactly 1 image', () => {
      const result = imageHandler.validateImageUrls(['https://example.com/image.jpg']);
      expect(result.isValid).toBe(true);
    });
  });

  describe('processUploadedImages', () => {
    it('should process uploaded files and add to req.body', async () => {
      const req = {
        files: [{ filename: '123_image1.jpg' }, { filename: '456_image2.png' }],
        body: {},
      };
      const res = {};
      const next = jest.fn();

      await imageHandler.processUploadedImages(req, res, next);

      expect(req.body.images).toEqual([
        '/uploads/products/123_image1.jpg',
        '/uploads/products/456_image2.png',
      ]);
      expect(next).toHaveBeenCalled();
    });

    it('should call next without modifying body if no files', async () => {
      const req = { body: {} };
      const res = {};
      const next = jest.fn();

      await imageHandler.processUploadedImages(req, res, next);

      expect(req.body.images).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should call next if files array is empty', async () => {
      const req = { files: [], body: {} };
      const res = {};
      const next = jest.fn();

      await imageHandler.processUploadedImages(req, res, next);

      expect(req.body.images).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const req = { files: null, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      // Force error by accessing files
      Object.defineProperty(req, 'files', {
        get: () => {
          throw new Error('Test error');
        },
      });

      await imageHandler.processUploadedImages(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error procesando imágenes subidas' })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateProductImages', () => {
    it('should call next for valid images', () => {
      const req = {
        body: { images: ['https://example.com/image1.jpg', 'https://example.com/image2.png'] },
      };
      const res = {};
      const next = jest.fn();

      imageHandler.validateProductImages(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next if no images in body', () => {
      const req = { body: {} };
      const res = {};
      const next = jest.fn();

      imageHandler.validateProductImages(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 for invalid images', () => {
      const req = { body: { images: ['invalid-url'] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      imageHandler.validateProductImages(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Imágenes inválidas' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for empty images array', () => {
      const req = { body: { images: [] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      imageHandler.validateProductImages(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('deleteImageFile', () => {
    it('should delete file from uploads directory', async () => {
      const imagePath = '/uploads/products/123_image.jpg';

      await imageHandler.deleteImageFile(imagePath);

      expect(fs.unlink).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Imagen eliminada',
        expect.objectContaining({ imagePath })
      );
    });

    it('should not delete files outside uploads directory', async () => {
      await imageHandler.deleteImageFile('/etc/passwd');
      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      const imagePath = '/uploads/products/test.jpg';
      fs.unlink.mockRejectedValueOnce(new Error('File not found'));

      await imageHandler.deleteImageFile(imagePath);

      expect(logger.error).toHaveBeenCalledWith(
        'Error eliminando imagen',
        expect.objectContaining({ error: 'File not found' })
      );
    });

    it('should handle external URLs gracefully', async () => {
      await imageHandler.deleteImageFile('https://example.com/external-image.jpg');
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });

  describe('cleanupOrphanImages', () => {
    it('should delete unused images from uploads folder', async () => {
      const usedImages = ['/uploads/products/image1.jpg', '/uploads/products/image3.jpg'];
      fs.readdir.mockResolvedValueOnce(['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg']);

      await imageHandler.cleanupOrphanImages(usedImages);

      expect(fs.readdir).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith(
        'Limpieza de imágenes huérfanas completada',
        expect.objectContaining({ service: 'product-service' })
      );
    });

    it('should not delete any files if all are used', async () => {
      const usedImages = ['/uploads/products/image1.jpg', '/uploads/products/image2.jpg'];
      fs.readdir.mockResolvedValueOnce(['image1.jpg', 'image2.jpg']);

      await imageHandler.cleanupOrphanImages(usedImages);

      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('should handle empty uploads folder', async () => {
      fs.readdir.mockResolvedValueOnce([]);

      await imageHandler.cleanupOrphanImages([]);

      expect(fs.unlink).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle readdir errors', async () => {
      fs.readdir.mockRejectedValueOnce(new Error('Permission denied'));

      await imageHandler.cleanupOrphanImages([]);

      expect(logger.error).toHaveBeenCalledWith(
        'Error en limpieza de imágenes',
        expect.objectContaining({ error: 'Permission denied' })
      );
    });
  });
});
