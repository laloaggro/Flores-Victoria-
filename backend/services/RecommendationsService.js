/**
 * 🎯 Flores Victoria Recommendations Service
 * API Service for AI-powered product recommendations
 *
 * @author Eduardo Garay (@laloaggro)
 * @version 2.1.0
 * @license MIT
 */

const express = require('express');

const AIRecommendationEngine = require('./AIRecommendationEngine');

class RecommendationsService {
  constructor(options = {}) {
    this.port = options.port || 3012;
    this.app = express();
    this.aiEngine = new AIRecommendationEngine(options.aiOptions);

    this._setupMiddleware();
    this._setupRoutes();
    this._setupErrorHandling();
  }

  /**
   * 🔧 Configurar middleware
   */
  _setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      );
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`📊 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  /**
   * 🛣️ Configurar rutas
   */
  _setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'recommendations',
        version: '2.1.0',
        timestamp: new Date(),
        aiEngine: this.aiEngine.getMetrics(),
      });
    });

    // Obtener recomendaciones personalizadas
    this.app.get('/recommendations/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const context = {
          occasion: req.query.occasion,
          priceRange: req.query.priceRange,
          category: req.query.category,
          location: req.query.location,
          device: req.headers['user-agent'],
          sessionId: req.query.sessionId,
        };

        const recommendations = await this.aiEngine.getRecommendations(userId, context);

        res.json({
          success: true,
          data: recommendations,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('❌ Error obteniendo recomendaciones:', error);
        res.status(500).json({
          success: false,
          error: 'Error interno del servidor',
          message: error.message,
        });
      }
    });

    // Registrar interacción de usuario
    this.app.post('/interactions', async (req, res) => {
      try {
        const interaction = req.body;

        await this.aiEngine.recordInteraction(interaction.userId, interaction);

        res.json({
          success: true,
          message: 'Interacción registrada correctamente',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('❌ Error registrando interacción:', error);
        res.status(500).json({
          success: false,
          error: 'Error registrando interacción',
          message: error.message,
        });
      }
    });

    // Obtener recomendaciones similares
    this.app.get('/similar/:productId', async (req, res) => {
      try {
        const { productId } = req.params;
        const limit = parseInt(req.query.limit) || 5;

        // Por ahora retornamos recomendaciones mock
        // En el futuro implementaremos similitud por embeddings
        const similarProducts = await this._getSimilarProducts(productId, limit);

        res.json({
          success: true,
          data: {
            productId,
            similar: similarProducts,
            algorithm: 'content-similarity',
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('❌ Error obteniendo productos similares:', error);
        res.status(500).json({
          success: false,
          error: 'Error obteniendo productos similares',
          message: error.message,
        });
      }
    });

    // Obtener trending products
    this.app.get('/trending', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;

        const trendingProducts = await this._getTrendingProducts(limit, category);

        res.json({
          success: true,
          data: {
            trending: trendingProducts,
            period: 'last_7_days',
            category: category || 'all',
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('❌ Error obteniendo productos trending:', error);
        res.status(500).json({
          success: false,
          error: 'Error obteniendo productos trending',
          message: error.message,
        });
      }
    });

    // Obtener recomendaciones por ocasión
    this.app.get('/occasion/:occasion', async (req, res) => {
      try {
        const { occasion } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const occasionRecommendations = await this._getOccasionRecommendations(occasion, limit);

        res.json({
          success: true,
          data: {
            occasion,
            recommendations: occasionRecommendations,
            seasonal: this._isSeasonalOccasion(occasion),
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('❌ Error obteniendo recomendaciones por ocasión:', error);
        res.status(500).json({
          success: false,
          error: 'Error obteniendo recomendaciones por ocasión',
          message: error.message,
        });
      }
    });

    // Obtener métricas del sistema
    this.app.get('/metrics', (req, res) => {
      try {
        const metrics = this.aiEngine.getMetrics();

        res.json({
          success: true,
          data: metrics,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('❌ Error obteniendo métricas:', error);
        res.status(500).json({
          success: false,
          error: 'Error obteniendo métricas',
          message: error.message,
        });
      }
    });

    // Batch recommendations (para múltiples usuarios)
    this.app.post('/batch-recommendations', async (req, res) => {
      try {
        const { userIds, context = {} } = req.body;

        if (!Array.isArray(userIds)) {
          return res.status(400).json({
            success: false,
            error: 'userIds debe ser un array',
          });
        }

        const batchResults = await Promise.all(
          userIds.map(async (userId) => {
            try {
              const recommendations = await this.aiEngine.getRecommendations(userId, context);
              return { userId, recommendations, success: true };
            } catch (error) {
              return { userId, error: error.message, success: false };
            }
          })
        );

        res.json({
          success: true,
          data: {
            results: batchResults,
            total: userIds.length,
            successful: batchResults.filter((r) => r.success).length,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('❌ Error en batch recommendations:', error);
        res.status(500).json({
          success: false,
          error: 'Error en batch recommendations',
          message: error.message,
        });
      }
    });
  }

  /**
   * 🚨 Configurar manejo de errores
   */
  _setupErrorHandling() {
    // 404 Handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        path: req.path,
        method: req.method,
      });
    });

    // Error Handler
    this.app.use((error, req, res, next) => {
      console.error('💥 Error no manejado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : '',
      });
    });
  }

  /**
   * 🔍 Obtener productos similares (mock implementation)
   */
  async _getSimilarProducts(productId, limit) {
    // Mock implementation
    // En producción, esto consultaría la base de datos
    const mockSimilar = [
      {
        id: 'similar-1',
        name: 'Ramo de Rosas Rojas',
        price: 45000,
        image: '/images/rosas-rojas.jpg',
        similarity: 0.95,
        reason: 'Mismo tipo de flor y color similar',
      },
      {
        id: 'similar-2',
        name: 'Bouquet Romántico',
        price: 38000,
        image: '/images/bouquet-romantico.jpg',
        similarity: 0.87,
        reason: 'Misma ocasión y estilo',
      },
      {
        id: 'similar-3',
        name: 'Arreglo de Mesa Rojo',
        price: 52000,
        image: '/images/arreglo-mesa.jpg',
        similarity: 0.82,
        reason: 'Paleta de colores similar',
      },
    ];

    return mockSimilar.slice(0, limit);
  }

  /**
   * 🔥 Obtener productos trending (mock implementation)
   */
  async _getTrendingProducts(limit, category) {
    // Mock implementation
    const mockTrending = [
      {
        id: 'trending-1',
        name: 'Girasoles Premium',
        price: 35000,
        trendingScore: 98,
        views: 1250,
        purchases: 89,
        category: 'flowers',
      },
      {
        id: 'trending-2',
        name: 'Orquídeas Blancas',
        price: 65000,
        trendingScore: 94,
        views: 980,
        purchases: 67,
        category: 'premium',
      },
      {
        id: 'trending-3',
        name: 'Ramo Mixto Primavera',
        price: 42000,
        trendingScore: 91,
        views: 1100,
        purchases: 78,
        category: 'seasonal',
      },
    ];

    let filtered = mockTrending;
    if (category && category !== 'all') {
      filtered = mockTrending.filter((p) => p.category === category);
    }

    return filtered.slice(0, limit);
  }

  /**
   * 🎉 Obtener recomendaciones por ocasión (mock implementation)
   */
  async _getOccasionRecommendations(occasion, limit) {
    const occasionMap = {
      valentine: [
        {
          id: 'valentine-1',
          name: 'Rosas Rojas del Amor',
          price: 55000,
          confidence: 0.98,
          reason: 'Clásico para el Día de San Valentín',
        },
        {
          id: 'valentine-2',
          name: 'Corazón de Flores',
          price: 75000,
          confidence: 0.95,
          reason: 'Diseño romántico especial',
        },
      ],
      'mother-day': [
        {
          id: 'mother-1',
          name: 'Ramo de Tulipanes',
          price: 48000,
          confidence: 0.92,
          reason: 'Perfecto para honrar a mamá',
        },
        {
          id: 'mother-2',
          name: 'Canasta de Flores Mixtas',
          price: 62000,
          confidence: 0.89,
          reason: 'Variedad que representa amor maternal',
        },
      ],
      birthday: [
        {
          id: 'birthday-1',
          name: 'Ramo Colorido Alegre',
          price: 40000,
          confidence: 0.88,
          reason: 'Colores vibrantes para celebrar',
        },
      ],
      wedding: [
        {
          id: 'wedding-1',
          name: 'Bouquet de Novia Clásico',
          price: 85000,
          confidence: 0.96,
          reason: 'Elegancia para el día especial',
        },
      ],
    };

    const recommendations = occasionMap[occasion.toLowerCase()] || [];
    return recommendations.slice(0, limit);
  }

  /**
   * 🌸 Verificar si es ocasión estacional
   */
  _isSeasonalOccasion(occasion) {
    const seasonalOccasions = [
      'valentine',
      'mother-day',
      'christmas',
      'spring',
      'summer',
      'autumn',
      'winter',
    ];
    return seasonalOccasions.includes(occasion.toLowerCase());
  }

  /**
   * 🚀 Iniciar servicio
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.log(`🤖 Recommendations Service iniciado en puerto ${this.port}`);
          console.log(`📊 Health check: http://localhost:${this.port}/health`);
          console.log(`🎯 API docs: http://localhost:${this.port}/api-docs`);
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('❌ Error iniciando servidor:', error);
          reject(error);
        });
      } catch (error) {
        console.error('❌ Error configurando servidor:', error);
        reject(error);
      }
    });
  }

  /**
   * 🛑 Detener servicio
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🤖 Recommendations Service detenido');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Si se ejecuta directamente, iniciar el servicio
if (require.main === module) {
  const recommendationsService = new RecommendationsService({
    port: process.env.RECOMMENDATIONS_PORT || 3012,
    aiOptions: {
      minConfidence: 0.6,
      maxRecommendations: 10,
    },
  });

  recommendationsService
    .start()
    .then(() => {
      console.log('✅ Recommendations Service iniciado correctamente');
    })
    .catch((error) => {
      console.error('❌ Error iniciando Recommendations Service:', error);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    await recommendationsService.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    await recommendationsService.stop();
    process.exit(0);
  });
}

module.exports = RecommendationsService;
