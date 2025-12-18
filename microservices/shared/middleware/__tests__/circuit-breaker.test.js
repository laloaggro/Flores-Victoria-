/**
 * @fileoverview Tests for Circuit Breaker Pattern
 * @description Comprehensive tests for circuit breaker middleware
 */

const { CircuitBreaker, resetAllCircuits } = require('../circuit-breaker');

describe('CircuitBreaker', () => {
  let circuitBreaker;

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    circuitBreaker = new CircuitBreaker({
      name: 'test-breaker',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetAllCircuits();
  });

  describe('Initial State', () => {
    it('should start in CLOSED state', () => {
      expect(circuitBreaker.state).toBe('CLOSED');
    });

    it('should have zero failure count initially', () => {
      expect(circuitBreaker.failureCount).toBe(0);
    });

    it('should allow requests when closed', () => {
      expect(circuitBreaker.canRequest()).toBe(true);
    });

    it('should use default values when no options provided', () => {
      const defaultBreaker = new CircuitBreaker();
      expect(defaultBreaker.name).toBe('default');
      expect(defaultBreaker.failureThreshold).toBe(5);
      expect(defaultBreaker.successThreshold).toBe(2);
      expect(defaultBreaker.timeout).toBe(30000);
    });
  });

  describe('Failure Recording', () => {
    it('should increment failure count on failure', () => {
      circuitBreaker.recordFailure();
      expect(circuitBreaker.failureCount).toBe(1);
    });

    it('should open circuit after reaching failure threshold', () => {
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.state).toBe('OPEN');
    });

    it('should not allow requests when circuit is open', () => {
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.canRequest()).toBe(false);
    });

    it('should call onOpen callback when circuit opens', () => {
      const onOpen = jest.fn();
      const breaker = new CircuitBreaker({
        name: 'callback-test',
        failureThreshold: 2,
        onOpen,
      });

      breaker.recordFailure();
      breaker.recordFailure();

      expect(onOpen).toHaveBeenCalled();
    });
  });

  describe('Success Recording', () => {
    it('should reset failure count on success when closed', () => {
      circuitBreaker.recordFailure(new Error('Test error'));
      circuitBreaker.recordSuccess();
      expect(circuitBreaker.failureCount).toBe(0);
    });

    it('should close circuit after success threshold in half-open', async () => {
      const onClose = jest.fn();
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        timeout: 50,
        onClose,
      });

      // Open the circuit
      breaker.recordFailure(new Error('Error 1'));
      breaker.recordFailure(new Error('Error 2'));
      expect(breaker.state).toBe('OPEN');

      // Wait for timeout to allow half-open
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Trigger half-open by checking canRequest
      breaker.canRequest();
      expect(breaker.state).toBe('HALF_OPEN');

      // Record successes to close
      breaker.recordSuccess();
      breaker.recordSuccess();

      expect(breaker.state).toBe('CLOSED');
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Half-Open State', () => {
    it('should transition to half-open after timeout', async () => {
      const onHalfOpen = jest.fn();
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        timeout: 50,
        onHalfOpen,
      });

      // Open the circuit
      breaker.recordFailure(new Error('Error 1'));
      breaker.recordFailure(new Error('Error 2'));

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should allow request and transition to half-open
      expect(breaker.canRequest()).toBe(true);
      expect(breaker.state).toBe('HALF_OPEN');
      expect(onHalfOpen).toHaveBeenCalled();
    });

    it('should reopen circuit on failure in half-open state', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        timeout: 50,
      });

      // Open circuit
      breaker.recordFailure(new Error('Error 1'));
      breaker.recordFailure(new Error('Error 2'));

      // Wait and transition to half-open
      await new Promise((resolve) => setTimeout(resolve, 60));
      breaker.canRequest();

      // Fail in half-open
      breaker.recordFailure(new Error('Error in half-open'));

      expect(breaker.state).toBe('OPEN');
    });
  });

  describe('Execute Method', () => {
    it('should execute function when circuit is closed', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalled();
    });

    it('should throw error when circuit is open', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      const mockFn = jest.fn().mockResolvedValue('success');

      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow(/Circuit breaker .* is OPEN/);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should record failure when function throws', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Function error'));

      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Function error');
      expect(circuitBreaker.failureCount).toBe(1);
    });

    it('should record success when function resolves', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      await circuitBreaker.execute(mockFn);

      expect(circuitBreaker.failureCount).toBe(0);
    });
  });

  describe('Stats and Metrics', () => {
    it('should return correct state', () => {
      const state = circuitBreaker.getState();

      expect(state).toHaveProperty('name', 'test-breaker');
      expect(state).toHaveProperty('state', 'CLOSED');
      expect(state).toHaveProperty('failureCount', 0);
      expect(state).toHaveProperty('successCount', 0);
    });

    it('should track failure time', () => {
      const beforeTime = Date.now();
      circuitBreaker.recordFailure();
      const afterTime = Date.now();

      expect(circuitBreaker.lastFailureTime).toBeGreaterThanOrEqual(beforeTime);
      expect(circuitBreaker.lastFailureTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Reset', () => {
    it('should reset circuit to initial state', () => {
      // Create some state
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      expect(circuitBreaker.state).toBe('OPEN');

      // Reset
      circuitBreaker.reset();

      expect(circuitBreaker.state).toBe('CLOSED');
      expect(circuitBreaker.failureCount).toBe(0);
      expect(circuitBreaker.successCount).toBe(0);
    });
  });
});
