/**
 * Test básico para verificar que el sistema de tests funciona
 * Este test siempre pasa y sirve como smoke test para CI
 */

describe('Smoke Test', () => {
  test('El entorno de testing está configurado correctamente', () => {
    expect(true).toBe(true);
  });

  test('Jest puede ejecutar tests', () => {
    const sum = (a, b) => a + b;
    expect(sum(2, 2)).toBe(4);
  });

  test('El proyecto tiene la estructura básica', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Verificar que existen directorios clave
    expect(fs.existsSync(path.join(__dirname, '../../microservices'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '../../frontend'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '../../docs'))).toBe(true);
  });
});
