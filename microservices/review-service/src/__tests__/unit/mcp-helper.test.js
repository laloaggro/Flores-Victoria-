/**
 * Tests para mcp-helper de review-service
 */

const mcpHelper = require('../../mcp-helper');

describe('MCP Helper - Review Service', () => {
  it('should be defined', () => {
    expect(mcpHelper).toBeDefined();
  });

  it('should export module', () => {
    expect(typeof mcpHelper).toBe('object');
  });

  describe('validateReview', () => {
    it('should validate a correct review', () => {
      const review = {
        productId: 'prod123',
        userId: 'user123',
        rating: 5,
        comment: 'Great product!',
      };
      expect(() => mcpHelper.validateReview(review)).not.toThrow();
    });

    it('should throw error if review is not an object', () => {
      expect(() => mcpHelper.validateReview(null)).toThrow('Review debe ser un objeto');
      expect(() => mcpHelper.validateReview('string')).toThrow('Review debe ser un objeto');
    });

    it('should throw error if productId is missing', () => {
      const review = { userId: 'user123', rating: 5 };
      expect(() => mcpHelper.validateReview(review)).toThrow('Review debe tener productId');
    });

    it('should throw error if userId is missing', () => {
      const review = { productId: 'prod123', rating: 5 };
      expect(() => mcpHelper.validateReview(review)).toThrow('Review debe tener userId');
    });

    it('should throw error if rating is invalid', () => {
      const review = { productId: 'prod123', userId: 'user123', rating: 6 };
      expect(() => mcpHelper.validateReview(review)).toThrow(
        'Rating debe ser un número entre 1 y 5'
      );
    });

    it('should throw error if comment is not a string', () => {
      const review = { productId: 'prod123', userId: 'user123', rating: 5, comment: 123 };
      expect(() => mcpHelper.validateReview(review)).toThrow('Comment debe ser un string');
    });
  });

  describe('calculateAverageRating', () => {
    it('should return 0 for empty array', () => {
      expect(mcpHelper.calculateAverageRating([])).toBe(0);
    });

    it('should return 0 for non-array', () => {
      expect(mcpHelper.calculateAverageRating(null)).toBe(0);
    });

    it('should calculate average correctly', () => {
      const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 3 }];
      expect(mcpHelper.calculateAverageRating(reviews)).toBe(4);
    });

    it('should round to 1 decimal', () => {
      const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 4 }];
      expect(mcpHelper.calculateAverageRating(reviews)).toBe(4.3);
    });

    it('should handle invalid ratings as 0', () => {
      const reviews = [{ rating: 5 }, { rating: 'invalid' }, { rating: 3 }];
      expect(mcpHelper.calculateAverageRating(reviews)).toBe(2.7);
    });
  });

  describe('groupReviewsByRating', () => {
    it('should return default distribution for empty array', () => {
      const result = mcpHelper.groupReviewsByRating([]);
      expect(result).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    });

    it('should return default distribution for non-array', () => {
      const result = mcpHelper.groupReviewsByRating(null);
      expect(result).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    });

    it('should group reviews correctly', () => {
      const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 3 }, { rating: 1 }];
      const result = mcpHelper.groupReviewsByRating(reviews);
      expect(result).toEqual({ 1: 1, 2: 0, 3: 1, 4: 1, 5: 2 });
    });

    it('should ignore invalid ratings', () => {
      const reviews = [{ rating: 5 }, { rating: 0 }, { rating: 6 }, { rating: 'invalid' }];
      const result = mcpHelper.groupReviewsByRating(reviews);
      expect(result).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 });
    });
  });

  describe('canUserReview', () => {
    it('should return false if userId is missing', () => {
      expect(mcpHelper.canUserReview(null, [])).toBe(false);
    });

    it('should return true if user has not reviewed', () => {
      const reviews = [{ userId: 'other123' }];
      expect(mcpHelper.canUserReview('user123', reviews)).toBe(true);
    });

    it('should return false if user already reviewed', () => {
      const reviews = [{ userId: 'user123' }];
      expect(mcpHelper.canUserReview('user123', reviews)).toBe(false);
    });

    it('should handle empty reviews array', () => {
      expect(mcpHelper.canUserReview('user123', [])).toBe(true);
    });

    it('should handle object IDs correctly', () => {
      const reviews = [{ userId: { toString: () => 'user123' } }];
      expect(mcpHelper.canUserReview({ toString: () => 'user123' }, reviews)).toBe(false);
    });
  });

  describe('formatReviewResponse', () => {
    it('should return null for null review', () => {
      expect(mcpHelper.formatReviewResponse(null)).toBeNull();
    });

    it('should format review correctly', () => {
      const review = {
        _id: 'rev123',
        productId: 'prod123',
        userId: 'user123',
        userName: 'John Doe',
        rating: 5,
        comment: 'Great!',
        helpful: 10,
        verified: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };
      const result = mcpHelper.formatReviewResponse(review);
      expect(result).toEqual({
        id: 'rev123',
        productId: 'prod123',
        userId: 'user123',
        userName: 'John Doe',
        rating: 5,
        comment: 'Great!',
        helpful: 10,
        verified: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      });
    });

    it('should use default values for missing fields', () => {
      const review = {
        _id: 'rev123',
        productId: 'prod123',
        userId: 'user123',
        rating: 5,
      };
      const result = mcpHelper.formatReviewResponse(review);
      expect(result.userName).toBe('Usuario Anónimo');
      expect(result.comment).toBe('');
      expect(result.helpful).toBe(0);
      expect(result.verified).toBe(false);
    });
  });

  describe('filterByMinRating', () => {
    it('should return empty array for non-array', () => {
      expect(mcpHelper.filterByMinRating(null, 3)).toEqual([]);
    });

    it('should return all reviews if minRating is invalid', () => {
      const reviews = [{ rating: 1 }, { rating: 5 }];
      expect(mcpHelper.filterByMinRating(reviews, 0)).toEqual(reviews);
      expect(mcpHelper.filterByMinRating(reviews, 6)).toEqual(reviews);
    });

    it('should filter reviews correctly', () => {
      const reviews = [{ rating: 1 }, { rating: 3 }, { rating: 4 }, { rating: 5 }];
      const result = mcpHelper.filterByMinRating(reviews, 4);
      expect(result).toHaveLength(2);
      expect(result[0].rating).toBe(4);
      expect(result[1].rating).toBe(5);
    });
  });

  describe('sortByHelpful', () => {
    it('should return empty array for non-array', () => {
      expect(mcpHelper.sortByHelpful(null)).toEqual([]);
    });

    it('should sort in descending order by default', () => {
      const reviews = [{ helpful: 5 }, { helpful: 20 }, { helpful: 10 }];
      const result = mcpHelper.sortByHelpful(reviews);
      expect(result[0].helpful).toBe(20);
      expect(result[1].helpful).toBe(10);
      expect(result[2].helpful).toBe(5);
    });

    it('should sort in ascending order', () => {
      const reviews = [{ helpful: 20 }, { helpful: 5 }, { helpful: 10 }];
      const result = mcpHelper.sortByHelpful(reviews, 'asc');
      expect(result[0].helpful).toBe(5);
      expect(result[1].helpful).toBe(10);
      expect(result[2].helpful).toBe(20);
    });

    it('should handle missing helpful values as 0', () => {
      const reviews = [{ helpful: 10 }, {}, { helpful: 5 }];
      const result = mcpHelper.sortByHelpful(reviews, 'desc');
      expect(result[0].helpful).toBe(10);
      expect(result[1].helpful).toBe(5);
    });
  });

  describe('calculateReviewStats', () => {
    it('should return default stats for empty array', () => {
      const result = mcpHelper.calculateReviewStats([]);
      expect(result).toEqual({
        total: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    });

    it('should return default stats for non-array', () => {
      const result = mcpHelper.calculateReviewStats(null);
      expect(result).toEqual({
        total: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    });

    it('should calculate stats correctly', () => {
      const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 3 }, { rating: 1 }];
      const result = mcpHelper.calculateReviewStats(reviews);
      expect(result.total).toBe(5);
      expect(result.average).toBe(3.6);
      expect(result.distribution).toEqual({ 1: 1, 2: 0, 3: 1, 4: 1, 5: 2 });
    });
  });
});
