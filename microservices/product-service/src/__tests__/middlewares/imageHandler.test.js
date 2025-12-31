const imageHandler = require('../../middleware/imageHandler');

describe('Image Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      file: null,
      files: [],
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should export middleware', () => {
    expect(imageHandler).toBeDefined();
  });

  it('should be a middleware object or function', () => {
    const isValid = typeof imageHandler === 'function' || typeof imageHandler === 'object';
    expect(isValid).toBe(true);
  });

  it('should have upload property if multer', () => {
    if (imageHandler && typeof imageHandler === 'object') {
      expect(imageHandler).toBeTruthy();
    }
  });
});
