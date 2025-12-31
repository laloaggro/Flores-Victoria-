jest.mock('../app', () => ({
  listen: jest.fn((port, callback) => {
    if (callback) callback();
    return { on: jest.fn(), close: jest.fn() };
  }),
}));

describe('Cart Service - Server', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = require('../app');
  });

  it('should load server module', () => {
    expect(() => {
      require('../server.simple');
    }).not.toThrow();
  });

  it('should call app.listen', () => {
    require('../server.simple');
    expect(app.listen).toHaveBeenCalled();
  });

  it('should listen on port', () => {
    require('../server.simple');
    expect(app.listen.mock.calls.length).toBeGreaterThan(0);
  });
});
