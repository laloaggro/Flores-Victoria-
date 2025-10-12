// Rutas para Recomendaciones
const express = require('express');
const recommendationService = require('../services/recommendationService');

const router = express.Router();

// Obtener recomendaciones para un usuario
router.get('/recommendations', async (req, res) => {
  try {
    const { userId, purchasedProducts, viewedProducts } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'El parámetro "userId" es requerido'
      });
    }
    
    // Parsear arrays si se proporcionan
    const parsedPurchasedProducts = purchasedProducts ? JSON.parse(purchasedProducts) : [];
    const parsedViewedProducts = viewedProducts ? JSON.parse(viewedProducts) : [];
    
    const result = await recommendationService.generateRecommendations(
      userId,
      parsedPurchasedProducts,
      parsedViewedProducts
    );
    
    if (result.success) {
      res.status(200).json({
        status: 'success',
        data: result.data
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Error generando recomendaciones',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// Registrar visualización de producto
router.post('/recommendations/view', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Los campos "userId" y "productId" son requeridos'
      });
    }
    
    const result = await recommendationService.recordProductView(userId, productId);
    
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Visualización registrada exitosamente'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Error registrando visualización',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// Registrar compra de producto
router.post('/recommendations/purchase', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Los campos "userId" y "productId" son requeridos'
      });
    }
    
    const result = await recommendationService.recordProductPurchase(userId, productId);
    
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Compra registrada exitosamente'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Error registrando compra',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;