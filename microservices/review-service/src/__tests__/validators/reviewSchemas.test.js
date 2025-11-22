/**
 * Tests para Review Service Validators
 * Coverage: 100% de reviewSchemas.js
 */

const {
  createReviewSchema,
  updateReviewSchema,
  reviewFiltersSchema,
  markHelpfulSchema,
  respondToReviewSchema,
} = require('../../validators/reviewSchemas');

describe('Review Validators - createReviewSchema', () => {
  const validReview = {
    productId: 'prod-123',
    userId: 'user-456',
    rating: 5,
    title: 'Excellent product!',
    comment: 'I absolutely loved these flowers. They lasted for weeks!',
  };

  test('should accept valid review', () => {
    const { error } = createReviewSchema.validate(validReview);
    expect(error).toBeUndefined();
  });

  test('should accept all optional fields', () => {
    const { error } = createReviewSchema.validate({
      ...validReview,
      orderId: 'order-789',
      pros: ['Long lasting', 'Beautiful colors'],
      cons: ['Slightly expensive'],
      wouldRecommend: true,
      isVerifiedPurchase: true,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    });
    expect(error).toBeUndefined();
  });

  test('should default wouldRecommend to true', () => {
    const { value } = createReviewSchema.validate(validReview);
    expect(value.wouldRecommend).toBe(true);
  });

  test('should default isVerifiedPurchase to false', () => {
    const { value } = createReviewSchema.validate(validReview);
    expect(value.isVerifiedPurchase).toBe(false);
  });

  test('should accept ratings 1-5', () => {
    [1, 2, 3, 4, 5].forEach((rating) => {
      const { error } = createReviewSchema.validate({ ...validReview, rating });
      expect(error).toBeUndefined();
    });
  });

  test('should reject rating < 1', () => {
    const { error } = createReviewSchema.validate({ ...validReview, rating: 0 });
    expect(error).toBeDefined();
  });

  test('should reject rating > 5', () => {
    const { error } = createReviewSchema.validate({ ...validReview, rating: 6 });
    expect(error).toBeDefined();
  });

  test('should reject short title (< 5 chars)', () => {
    const { error } = createReviewSchema.validate({ ...validReview, title: 'Good' });
    expect(error).toBeDefined();
  });

  test('should reject long title (> 100 chars)', () => {
    const { error } = createReviewSchema.validate({ ...validReview, title: 'A'.repeat(101) });
    expect(error).toBeDefined();
  });

  test('should reject short comment (< 10 chars)', () => {
    const { error } = createReviewSchema.validate({ ...validReview, comment: 'Nice' });
    expect(error).toBeDefined();
  });

  test('should reject long comment (> 1000 chars)', () => {
    const { error } = createReviewSchema.validate({ ...validReview, comment: 'A'.repeat(1001) });
    expect(error).toBeDefined();
  });

  test('should accept up to 5 pros', () => {
    const { error } = createReviewSchema.validate({
      ...validReview,
      pros: ['Pro 1', 'Pro 2', 'Pro 3', 'Pro 4', 'Pro 5'],
    });
    expect(error).toBeUndefined();
  });

  test('should reject more than 5 pros', () => {
    const { error } = createReviewSchema.validate({
      ...validReview,
      pros: Array(6).fill('Pro'),
    });
    expect(error).toBeDefined();
  });

  test('should accept up to 5 cons', () => {
    const { error } = createReviewSchema.validate({
      ...validReview,
      cons: ['Con 1', 'Con 2', 'Con 3', 'Con 4', 'Con 5'],
    });
    expect(error).toBeUndefined();
  });

  test('should reject more than 5 cons', () => {
    const { error } = createReviewSchema.validate({
      ...validReview,
      cons: Array(6).fill('Con'),
    });
    expect(error).toBeDefined();
  });

  test('should accept up to 5 images', () => {
    const { error } = createReviewSchema.validate({
      ...validReview,
      images: Array(5).fill('https://example.com/img.jpg'),
    });
    expect(error).toBeUndefined();
  });

  test('should reject more than 5 images', () => {
    const { error } = createReviewSchema.validate({
      ...validReview,
      images: Array(6).fill('https://example.com/img.jpg'),
    });
    expect(error).toBeDefined();
  });

  test('should reject missing required fields', () => {
    const { error: error1 } = createReviewSchema.validate({ ...validReview, productId: undefined });
    const { error: error2 } = createReviewSchema.validate({ ...validReview, userId: undefined });
    const { error: error3 } = createReviewSchema.validate({ ...validReview, rating: undefined });
    const { error: error4 } = createReviewSchema.validate({ ...validReview, title: undefined });
    const { error: error5 } = createReviewSchema.validate({ ...validReview, comment: undefined });

    expect(error1).toBeDefined();
    expect(error2).toBeDefined();
    expect(error3).toBeDefined();
    expect(error4).toBeDefined();
    expect(error5).toBeDefined();
  });
});

describe('Review Validators - updateReviewSchema', () => {
  test('should accept partial update', () => {
    const { error } = updateReviewSchema.validate({ rating: 4 });
    expect(error).toBeUndefined();
  });

  test('should accept multiple field updates', () => {
    const { error } = updateReviewSchema.validate({
      rating: 4,
      title: 'Updated title here',
      comment: 'Updated comment with more details',
    });
    expect(error).toBeUndefined();
  });

  test('should reject empty update', () => {
    const { error } = updateReviewSchema.validate({});
    expect(error).toBeDefined();
  });

  test('should accept wouldRecommend update', () => {
    const { error } = updateReviewSchema.validate({ wouldRecommend: false });
    expect(error).toBeUndefined();
  });

  test('should accept images update', () => {
    const { error } = updateReviewSchema.validate({
      images: ['https://example.com/new-image.jpg'],
    });
    expect(error).toBeUndefined();
  });

  test('should reject invalid rating in update', () => {
    const { error } = updateReviewSchema.validate({ rating: 6 });
    expect(error).toBeDefined();
  });

  test('should reject short title in update', () => {
    const { error } = updateReviewSchema.validate({ title: 'Hi' });
    expect(error).toBeDefined();
  });

  test('should reject short comment in update', () => {
    const { error } = updateReviewSchema.validate({ comment: 'Short' });
    expect(error).toBeDefined();
  });
});

describe('Review Validators - reviewFiltersSchema', () => {
  test('should accept empty filters with defaults', () => {
    const { error, value } = reviewFiltersSchema.validate({});
    expect(error).toBeUndefined();
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
    expect(value.sort).toBe('createdAt');
    expect(value.order).toBe('desc');
  });

  test('should accept productId filter', () => {
    const { error } = reviewFiltersSchema.validate({ productId: 'prod-123' });
    expect(error).toBeUndefined();
  });

  test('should accept userId filter', () => {
    const { error } = reviewFiltersSchema.validate({ userId: 'user-456' });
    expect(error).toBeUndefined();
  });

  test('should accept rating filter', () => {
    const { error } = reviewFiltersSchema.validate({ rating: 5 });
    expect(error).toBeUndefined();
  });

  test('should accept rating range', () => {
    const { error } = reviewFiltersSchema.validate({ minRating: 3, maxRating: 5 });
    expect(error).toBeUndefined();
  });

  test('should accept isVerifiedPurchase filter', () => {
    const { error } = reviewFiltersSchema.validate({ isVerifiedPurchase: true });
    expect(error).toBeUndefined();
  });

  test('should accept date range', () => {
    const dateFrom = new Date('2024-01-01').toISOString();
    const dateTo = new Date('2024-12-31').toISOString();
    const { error } = reviewFiltersSchema.validate({ dateFrom, dateTo });
    expect(error).toBeUndefined();
  });

  test('should reject dateTo before dateFrom', () => {
    const dateFrom = new Date('2024-12-31').toISOString();
    const dateTo = new Date('2024-01-01').toISOString();
    const { error } = reviewFiltersSchema.validate({ dateFrom, dateTo });
    expect(error).toBeDefined();
  });

  test('should accept pagination', () => {
    const { error } = reviewFiltersSchema.validate({ page: 3, limit: 50 });
    expect(error).toBeUndefined();
  });

  test('should accept valid sort fields', () => {
    const sorts = ['createdAt', 'rating', 'helpful'];
    sorts.forEach((sort) => {
      const { error } = reviewFiltersSchema.validate({ sort });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid sort field', () => {
    const { error } = reviewFiltersSchema.validate({ sort: 'invalid' });
    expect(error).toBeDefined();
  });
});

describe('Review Validators - markHelpfulSchema', () => {
  test('should accept helpful = true', () => {
    const { error } = markHelpfulSchema.validate({ helpful: true });
    expect(error).toBeUndefined();
  });

  test('should accept helpful = false', () => {
    const { error } = markHelpfulSchema.validate({ helpful: false });
    expect(error).toBeUndefined();
  });

  test('should reject missing helpful field', () => {
    const { error } = markHelpfulSchema.validate({});
    expect(error).toBeDefined();
  });

  test('should reject non-boolean helpful', () => {
    const { error } = markHelpfulSchema.validate({ helpful: 'yes' });
    expect(error).toBeDefined();
  });
});

describe('Review Validators - respondToReviewSchema', () => {
  test('should accept valid response', () => {
    const { error } = respondToReviewSchema.validate({
      response: 'Thank you for your feedback! We appreciate your business.',
      respondedBy: 'admin-123',
    });
    expect(error).toBeUndefined();
  });

  test('should reject short response (< 10 chars)', () => {
    const { error } = respondToReviewSchema.validate({
      response: 'Thanks',
      respondedBy: 'admin-123',
    });
    expect(error).toBeDefined();
  });

  test('should reject long response (> 500 chars)', () => {
    const { error } = respondToReviewSchema.validate({
      response: 'A'.repeat(501),
      respondedBy: 'admin-123',
    });
    expect(error).toBeDefined();
  });

  test('should reject missing response', () => {
    const { error } = respondToReviewSchema.validate({ respondedBy: 'admin-123' });
    expect(error).toBeDefined();
  });

  test('should reject missing respondedBy', () => {
    const { error } = respondToReviewSchema.validate({
      response: 'Thank you for the feedback',
    });
    expect(error).toBeDefined();
  });

  test('should accept response at minimum length', () => {
    const { error } = respondToReviewSchema.validate({
      response: '1234567890',
      respondedBy: 'admin',
    });
    expect(error).toBeUndefined();
  });

  test('should accept response at maximum length', () => {
    const { error } = respondToReviewSchema.validate({
      response: 'A'.repeat(500),
      respondedBy: 'admin',
    });
    expect(error).toBeUndefined();
  });
});
