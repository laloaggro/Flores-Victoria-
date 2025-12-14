/**
 * Mock de Stripe para tests
 */
const mockPaymentIntents = {
  create: jest.fn(),
  confirm: jest.fn(),
  retrieve: jest.fn(),
};

const mockRefunds = {
  create: jest.fn(),
};

const mockStripe = jest.fn().mockReturnValue({
  paymentIntents: mockPaymentIntents,
  refunds: mockRefunds,
});

module.exports = {
  mockStripe,
  mockPaymentIntents,
  mockRefunds,
};
