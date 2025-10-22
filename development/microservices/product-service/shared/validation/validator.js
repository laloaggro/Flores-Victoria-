/**
 * Sistema de validación de entrada mejorado
 */
class Validator {
  /**
   * Validar un objeto contra un esquema
   * @param {object} data - Datos a validar
   * @param {object} schema - Esquema de validación
   * @returns {object} Resultado de validación
   */
  static validate(data, schema) {
    const errors = [];

    for (const field in schema) {
      const rules = schema[field];
      const value = data[field];

      // Verificar campo requerido
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} es requerido`);
        continue;
      }

      // Saltar validaciones si el campo no está presente y no es requerido
      if (value === undefined || value === null) {
        continue;
      }

      // Validar tipo
      if (rules.type) {
        if (!this._validateType(value, rules.type)) {
          errors.push(`${field} debe ser de tipo ${rules.type}`);
          continue;
        }
      }

      // Validar longitud
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
      }

      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`${field} debe tener máximo ${rules.maxLength} caracteres`);
      }

      // Validar rango numérico
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} debe ser al menos ${rules.min}`);
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} debe ser máximo ${rules.max}`);
      }

      // Validar patrón
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} no cumple con el formato requerido`);
      }

      // Validar email
      if (rules.email && !this._validateEmail(value)) {
        errors.push(`${field} debe ser un email válido`);
      }

      // Validar URL
      if (rules.url && !this._validateURL(value)) {
        errors.push(`${field} debe ser una URL válida`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar tipo de dato
   * @param {any} value - Valor a validar
   * @param {string} type - Tipo esperado
   * @returns {boolean} Si el tipo es válido
   */
  static _validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Validar email
   * @param {string} email - Email a validar
   * @returns {boolean} Si el email es válido
   */
  static _validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar URL
   * @param {string} url - URL a validar
   * @returns {boolean} Si la URL es válida
   */
  static _validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Crear middleware de validación para Express
   * @param {object} schema - Esquema de validación
   * @returns {function} Middleware de Express
   */
  static createMiddleware(schema) {
    return (req, res, next) => {
      const data = { ...req.body, ...req.query, ...req.params };
      const result = this.validate(data, schema);

      if (!result.isValid) {
        return res.status(400).json({
          status: 'fail',
          message: 'Error de validación',
          errors: result.errors,
        });
      }

      next();
    };
  }
}

module.exports = Validator;
