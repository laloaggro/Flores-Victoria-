const { securityHeaders, csrfProtection } = require('../../middleware/security');

describe('Security Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      method: 'GET',
      cookies: {},
    };
    res = {
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('securityHeaders', () => {
    it('should set security headers', () => {
      securityHeaders(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('csrfProtection', () => {
    it('should allow GET requests', () => {
      req.method = 'GET';
      csrfProtection(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow HEAD requests', () => {
      req.method = 'HEAD';
      csrfProtection(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow OPTIONS requests', () => {
      req.method = 'OPTIONS';
      csrfProtection(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should validate CSRF token for POST requests', () => {
      req.method = 'POST';
      req.headers['x-csrf-token'] = 'valid-token';
      req.cookies.csrfToken = 'valid-token';

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if CSRF token is missing', () => {
      req.method = 'POST';

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'CSRF token inválido',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if CSRF token does not match', () => {
      req.method = 'POST';
      req.headers['x-csrf-token'] = 'token1';
      req.cookies.csrfToken = 'token2';

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'CSRF token inválido',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
