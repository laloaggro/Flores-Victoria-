const redis = require('redis');
const config = require('../config');

/**
 * Modelo de carrito para el servicio de carrito
 */
class Cart {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Obtener carrito por ID de usuario
   * @param {string} userId - ID del usuario
   * @returns {object} Carrito del usuario
   */
  async getCart(userId) {
    const cartKey = `cart:${userId}`;
    const cart = await this.redis.get(cartKey);

    if (cart) {
      return JSON.parse(cart);
    }

    // Devolver carrito vacío si no existe
    return { items: [], total: 0 };
  }

  /**
   * Agregar item al carrito
   * @param {string} userId - ID del usuario
   * @param {object} item - Item a agregar
   * @returns {object} Carrito actualizado
   */
  async addItem(userId, item) {
    const cartKey = `cart:${userId}`;
    const cart = await this.getCart(userId);

    // Verificar si el item ya existe en el carrito
    const existingItemIndex = cart.items.findIndex((i) => i.productId === item.productId);

    if (existingItemIndex >= 0) {
      // Actualizar cantidad si el item ya existe
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      // Agregar nuevo item
      cart.items.push(item);
    }

    // Calcular total
    cart.total = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Guardar carrito en Redis
    await this.redis.set(cartKey, JSON.stringify(cart), { EX: 86400 }); // Expira en 24 horas

    return cart;
  }

  /**
   * Remover item del carrito
   * @param {string} userId - ID del usuario
   * @param {string} productId - ID del producto
   * @returns {object} Carrito actualizado
   */
  async removeItem(userId, productId) {
    const cartKey = `cart:${userId}`;
    const cart = await this.getCart(userId);

    // Filtrar items para remover el especificado
    cart.items = cart.items.filter((item) => item.productId !== productId);

    // Calcular total
    cart.total = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Guardar carrito en Redis
    await this.redis.set(cartKey, JSON.stringify(cart), { EX: 86400 }); // Expira en 24 horas

    return cart;
  }

  /**
   * Limpiar carrito
   * @param {string} userId - ID del usuario
   * @returns {object} Carrito vacío
   */
  async clearCart(userId) {
    const cartKey = `cart:${userId}`;
    const emptyCart = { items: [], total: 0 };

    await this.redis.set(cartKey, JSON.stringify(emptyCart), { EX: 86400 });

    return emptyCart;
  }
}

module.exports = Cart;
