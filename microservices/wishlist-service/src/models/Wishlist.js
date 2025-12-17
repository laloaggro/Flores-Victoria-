const redis = require('redis');
const config = require('../config');

/**
 * Modelo de lista de deseos para el servicio de lista de deseos
 */
class Wishlist {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Obtener lista de deseos por ID de usuario
   * @param {string} userId - ID del usuario
   * @returns {object} Lista de deseos del usuario
   */
  async getWishlist(userId) {
    const wishlistKey = `wishlist:${userId}`;
    const wishlist = await this.redis.get(wishlistKey);

    if (wishlist) {
      return JSON.parse(wishlist);
    }

    // Devolver lista de deseos vacía si no existe
    return { items: [] };
  }

  /**
   * Agregar item a la lista de deseos
   * @param {string} userId - ID del usuario
   * @param {object} item - Item a agregar
   * @returns {object} Lista de deseos actualizada
   */
  async addItem(userId, item) {
    const wishlistKey = `wishlist:${userId}`;
    const wishlist = await this.getWishlist(userId);

    // Verificar si el item ya existe en la lista de deseos
    const existingItem = wishlist.items.find((i) => i.productId === item.productId);

    if (!existingItem) {
      // Agregar nuevo item
      wishlist.items.push(item);

      // Guardar lista de deseos en Redis
      await this.redis.set(wishlistKey, JSON.stringify(wishlist), { EX: 86400 }); // Expira en 24 horas
    }

    return wishlist;
  }

  /**
   * Remover item de la lista de deseos
   * @param {string} userId - ID del usuario
   * @param {string} productId - ID del producto
   * @returns {object} Lista de deseos actualizada
   */
  async removeItem(userId, productId) {
    const wishlistKey = `wishlist:${userId}`;
    const wishlist = await this.getWishlist(userId);

    // Filtrar items para remover el especificado
    wishlist.items = wishlist.items.filter((item) => item.productId !== productId);

    // Guardar lista de deseos en Redis
    await this.redis.set(wishlistKey, JSON.stringify(wishlist), { EX: 86400 }); // Expira en 24 horas

    return wishlist;
  }

  /**
   * Limpiar lista de deseos
   * @param {string} userId - ID del usuario
   * @returns {object} Lista de deseos vacía
   */
  async clearWishlist(userId) {
    const wishlistKey = `wishlist:${userId}`;
    const emptyWishlist = { items: [] };

    await this.redis.set(wishlistKey, JSON.stringify(emptyWishlist), { EX: 86400 });

    return emptyWishlist;
  }
}

module.exports = Wishlist;
