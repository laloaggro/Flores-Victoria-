/**
 * Tests para utilidades JWT de wishlist-service
 */

const { verifyToken } = require('../../utils/jwt');

jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

describe('JWT Utils - Wishlist Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockDecoded = { userId: '123' };
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);

      const result = verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalled();
      expect(result).toEqual(mockDecoded);
    });

    it('should throw on invalid token', () => {
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken('invalid-token')).toThrow();
    });
  });
});
