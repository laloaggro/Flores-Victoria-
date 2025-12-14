/**
 * @fileoverview Checkout Service con Transacciones Atómicas
 * @description Implementa el proceso de checkout con transacciones MongoDB
 *              para garantizar consistencia de datos (stock, orden, carrito)
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Clase CheckoutService
 * Maneja el proceso de checkout con transacciones atómicas
 */
class CheckoutService {
  /**
   * @param {Object} options - Opciones de configuración
   * @param {Object} options.orderModel - Modelo de Order (Mongoose)
   * @param {Object} options.productCollection - Colección de productos (MongoDB)
   * @param {Object} options.cartService - Servicio de carrito
   * @param {Object} options.logger - Logger instance
   */
  constructor({ orderModel, productCollection, cartService, logger }) {
    this.orderModel = orderModel;
    this.productCollection = productCollection;
    this.cartService = cartService;
    this.logger = logger || console;
  }

  /**
   * Procesar checkout con transacción atómica
   * Garantiza que: stock se reduce, orden se crea, carrito se limpia
   * O ninguna de estas operaciones ocurre (rollback)
   *
   * @param {Object} checkoutData - Datos del checkout
   * @param {string} checkoutData.userId - ID del usuario
   * @param {Array} checkoutData.items - Items del carrito
   * @param {Object} checkoutData.shippingAddress - Dirección de envío
   * @param {string} checkoutData.paymentMethod - Método de pago
   * @param {Object} checkoutData.paymentDetails - Detalles del pago
   * @returns {Promise<Object>} Resultado del checkout
   */
  async processCheckout(checkoutData) {
    const { userId, items, shippingAddress, paymentMethod, paymentDetails } = checkoutData;

    // Validar datos de entrada
    this._validateCheckoutData(checkoutData);

    // Iniciar sesión de transacción
    const session = await mongoose.startSession();

    try {
      let order;
      let stockUpdates = [];

      // Ejecutar transacción
      await session.withTransaction(
        async () => {
          // PASO 1: Verificar y reservar stock
          stockUpdates = await this._reserveStock(items, session);

          // PASO 2: Calcular totales
          const totals = this._calculateTotals(items);

          // PASO 3: Crear la orden
          order = await this._createOrder(
            {
              userId,
              items,
              shippingAddress,
              paymentMethod,
              paymentDetails,
              ...totals,
            },
            session
          );

          // PASO 4: Limpiar carrito (si está disponible)
          if (this.cartService) {
            await this._clearCart(userId);
          }

          this.logger.info('Checkout transaction completed', {
            orderId: order._id,
            userId,
            itemCount: items.length,
            total: totals.total,
          });
        },
        {
          readPreference: 'primary',
          readConcern: { level: 'local' },
          writeConcern: { w: 'majority' },
        }
      );

      return {
        success: true,
        order: this._formatOrder(order),
        stockUpdates,
        message: 'Pedido creado exitosamente',
      };
    } catch (error) {
      // La transacción se revierte automáticamente en caso de error
      this.logger.error('Checkout transaction failed', {
        userId,
        error: error.message,
        items: items.map((i) => i.productId),
      });

      // Determinar tipo de error para respuesta apropiada
      if (error.code === 'INSUFFICIENT_STOCK') {
        return {
          success: false,
          error: 'INSUFFICIENT_STOCK',
          message: error.message,
          product: error.product,
        };
      }

      if (error.code === 'PRODUCT_NOT_FOUND') {
        return {
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: error.message,
          productId: error.productId,
        };
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Validar datos de checkout
   * @private
   */
  _validateCheckoutData(data) {
    const { userId, items, shippingAddress, paymentMethod } = data;

    if (!userId) {
      throw new Error('userId es requerido');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('items es requerido y debe ser un array no vacío');
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        throw new Error('Cada item debe tener productId y quantity válidos');
      }
    }

    if (!shippingAddress) {
      throw new Error('shippingAddress es requerido');
    }

    if (!paymentMethod) {
      throw new Error('paymentMethod es requerido');
    }
  }

  /**
   * Verificar disponibilidad y reservar stock
   * @private
   */
  async _reserveStock(items, session) {
    const stockUpdates = [];

    for (const item of items) {
      // Buscar producto y verificar stock en una operación atómica
      const result = await this.productCollection.findOneAndUpdate(
        {
          _id: item.productId,
          active: true,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
          $set: { updatedAt: new Date() },
        },
        {
          session,
          returnDocument: 'after',
          projection: { name: 1, stock: 1, price: 1 },
        }
      );

      if (!result.value) {
        // Verificar si el producto existe
        const product = await this.productCollection.findOne(
          { _id: item.productId },
          { session, projection: { name: 1, stock: 1 } }
        );

        if (!product) {
          const error = new Error(`Producto no encontrado: ${item.productId}`);
          error.code = 'PRODUCT_NOT_FOUND';
          error.productId = item.productId;
          throw error;
        }

        // El producto existe pero no tiene suficiente stock
        const error = new Error(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
        );
        error.code = 'INSUFFICIENT_STOCK';
        error.product = {
          id: item.productId,
          name: product.name,
          available: product.stock,
          requested: item.quantity,
        };
        throw error;
      }

      stockUpdates.push({
        productId: item.productId,
        productName: result.value.name,
        previousStock: result.value.stock + item.quantity,
        newStock: result.value.stock,
        reserved: item.quantity,
      });
    }

    return stockUpdates;
  }

  /**
   * Calcular totales del pedido
   * @private
   */
  _calculateTotals(items) {
    const subtotal = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // Configuración de cálculos (podría venir de config)
    const taxRate = 0.19; // IVA Chile
    const freeShippingThreshold = 50000;
    const standardShippingCost = 5000;

    const taxes = Math.round(subtotal * taxRate);
    const shipping = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;
    const total = subtotal + taxes + shipping;

    return {
      subtotal,
      taxes,
      shipping,
      total,
      currency: 'CLP',
    };
  }

  /**
   * Crear orden en la base de datos
   * @private
   */
  async _createOrder(orderData, session) {
    const orderDoc = new this.orderModel({
      userId: orderData.userId,
      items: orderData.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      })),
      subtotal: orderData.subtotal,
      taxes: orderData.taxes,
      shipping: orderData.shipping,
      total: orderData.total,
      currency: orderData.currency,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentDetails: orderData.paymentDetails,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          note: 'Pedido creado',
        },
      ],
    });

    // Guardar dentro de la sesión de transacción
    await orderDoc.save({ session });

    return orderDoc;
  }

  /**
   * Limpiar carrito del usuario
   * @private
   */
  async _clearCart(userId) {
    try {
      if (typeof this.cartService.clearCart === 'function') {
        await this.cartService.clearCart(userId);
      }
    } catch (error) {
      // Log pero no fallar la transacción por el carrito
      this.logger.warn('Could not clear cart', { userId, error: error.message });
    }
  }

  /**
   * Formatear orden para respuesta
   * @private
   */
  _formatOrder(order) {
    return {
      id: order._id,
      orderNumber: order.orderNumber || order._id.toString().slice(-8).toUpperCase(),
      userId: order.userId,
      items: order.items,
      subtotal: order.subtotal,
      taxes: order.taxes,
      shipping: order.shipping,
      total: order.total,
      currency: order.currency,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    };
  }

  /**
   * Revertir stock manualmente (para casos especiales)
   * Nota: Las transacciones automáticamente revierten, esto es para rollback manual
   *
   * @param {Array} stockUpdates - Updates de stock a revertir
   * @returns {Promise<void>}
   */
  async revertStock(stockUpdates) {
    for (const update of stockUpdates) {
      await this.productCollection.updateOne(
        { _id: update.productId },
        { $inc: { stock: update.reserved } }
      );
    }

    this.logger.info('Stock reverted manually', {
      products: stockUpdates.map((u) => u.productId),
    });
  }

  /**
   * Verificar disponibilidad de productos sin reservar
   * Útil para validación previa al checkout
   *
   * @param {Array} items - Items a verificar
   * @returns {Promise<Object>} Resultado de disponibilidad
   */
  async checkAvailability(items) {
    const availability = [];
    let allAvailable = true;

    for (const item of items) {
      const product = await this.productCollection.findOne(
        { _id: item.productId, active: true },
        { projection: { name: 1, stock: 1, price: 1 } }
      );

      if (!product) {
        availability.push({
          productId: item.productId,
          available: false,
          reason: 'PRODUCT_NOT_FOUND',
        });
        allAvailable = false;
        continue;
      }

      const isAvailable = product.stock >= item.quantity;

      availability.push({
        productId: item.productId,
        name: product.name,
        requested: item.quantity,
        available: isAvailable,
        currentStock: product.stock,
        currentPrice: product.price,
      });

      if (!isAvailable) {
        allAvailable = false;
      }
    }

    return {
      allAvailable,
      items: availability,
    };
  }
}

/**
 * Factory function para crear instancia del servicio
 * @param {Object} dependencies - Dependencias del servicio
 * @returns {CheckoutService} Instancia del servicio
 */
function createCheckoutService(dependencies) {
  return new CheckoutService(dependencies);
}

module.exports = {
  CheckoutService,
  createCheckoutService,
};
