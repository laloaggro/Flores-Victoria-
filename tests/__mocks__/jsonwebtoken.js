/**
 * Manual mock for jsonwebtoken / Mock manual para jsonwebtoken
 * Used in unit tests to avoid real JWT operations
 * Usado en tests unitarios para evitar operaciones JWT reales
 */

const jwt = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn()
};

module.exports = jwt;
