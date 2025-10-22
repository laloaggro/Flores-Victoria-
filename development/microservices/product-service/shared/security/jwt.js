/**
 * Verificar token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {object} Payload decodificado del token
 */
function verifyToken(token) {
  try {
    // En una implementación real, aquí se verificaría la firma del token
    // Por ahora, solo decodificamos el payload (parte central del JWT)
    const payload = token.split('.')[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

/**
 * Generar token JWT
 * @param {object} payload - Datos a incluir en el token
 * @returns {string} Token JWT generado
 */
function generateToken(payload) {
  // En una implementación real, aquí se firmaría el token
  // Por ahora, solo creamos una estructura básica de JWT
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'signature'; // Firma falsa para demostración

  return `${header}.${encodedPayload}.${signature}`;
}

module.exports = {
  verifyToken,
  generateToken,
};
