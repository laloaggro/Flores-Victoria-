# 💻 CÓDIGO ESENCIAL - FLORES VICTORIA v3.0

## 🚀 **SNIPPETS DE CÓDIGO MÁS UTILIZADOS**

### 📱 **Frontend PWA - JavaScript Avanzado**

```javascript
// === SERVICE WORKER INTELIGENTE ===
const CACHE_NAME = 'flores-victoria-v3.0';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/app.js',
  '/js/ai-chat.js',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// === AI CHAT INTEGRATION ===
class AIChat {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.conversationHistory = [];
  }

  async sendMessage(message) {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          message,
          sessionId: this.sessionId,
          userId: this.getCurrentUserId(),
          context: this.getContext()
        })
      });

      const data = await response.json();
      
      this.conversationHistory.push({
        user: message,
        ai: data.response,
        timestamp: new Date().toISOString(),
        confidence: data.confidence
      });

      return data;
    } catch (error) {
      console.error('AI Chat Error:', error);
      return { error: 'Error al procesar mensaje' };
    }
  }

  getRecommendations(context = 'general') {
    return fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({
        userId: this.getCurrentUserId(),
        context,
        limit: 10,
        filters: this.getCurrentFilters()
      })
    }).then(res => res.json());
  }
}

// === CAMERA API INTEGRATION ===
class CameraHandler {
  constructor() {
    this.stream = null;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
  }

  async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      const video = document.getElementById('camera');
      video.srcObject = this.stream;
      
      return true;
    } catch (error) {
      console.error('Camera Error:', error);
      return false;
    }
  }

  capturePhoto() {
    const video = document.getElementById('camera');
    this.canvas.width = video.videoWidth;
    this.canvas.height = video.videoHeight;
    
    this.context.drawImage(video, 0, 0);
    
    return this.canvas.toDataURL('image/jpeg', 0.95);
  }

  async processWithWASM(imageData) {
    try {
      const response = await fetch('/api/wasm/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'optimize',
          imageData: imageData,
          parameters: {
            quality: 0.85,
            format: 'webp',
            resize: { width: 800, height: 600 }
          }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('WASM Processing Error:', error);
      return null;
    }
  }
}

// === PUSH NOTIFICATIONS ===
class PushNotifications {
  constructor() {
    this.registration = null;
    this.vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NpjTUgLJ5IYyE7yP3T-8Cn0D1g1Xd8J5KG3r_1';
  }

  async init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado');
        
        const permission = await this.requestPermission();
        if (permission === 'granted') {
          await this.subscribeUser();
        }
      } catch (error) {
        console.error('Error registering service worker:', error);
      }
    }
  }

  async requestPermission() {
    return await Notification.requestPermission();
  }

  async subscribeUser() {
    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Enviar suscripción al servidor
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
```

### 🤖 **Backend AI Service - Node.js**

```javascript
// === AI RECOMMENDATION ENGINE ===
const tf = require('@tensorflow/tfjs-node');

class RecommendationEngine {
  constructor() {
    this.model = null;
    this.userEmbeddings = new Map();
    this.productEmbeddings = new Map();
    this.isTraining = false;
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('file://./models/recommendation-model.json');
      console.log('Modelo de recomendación cargado');
    } catch (error) {
      console.log('Creando nuevo modelo...');
      await this.createModel();
    }
  }

  async createModel() {
    // Crear modelo neural para recomendaciones
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [100], // User + Product features
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid' // Probabilidad de compra
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    return model;
  }

  async getRecommendations(userId, context = 'general', limit = 10) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const userVector = this.createUserVector(userProfile, context);
      
      const products = await this.getAvailableProducts();
      const recommendations = [];

      for (const product of products) {
        const productVector = this.createProductVector(product);
        const combinedVector = tf.concat([userVector, productVector]);
        
        const prediction = this.model.predict(combinedVector.expandDims(0));
        const score = await prediction.data();
        
        recommendations.push({
          product,
          score: score[0],
          confidence: this.calculateConfidence(score[0], userProfile, product)
        });

        combinedVector.dispose();
        prediction.dispose();
      }

      // Ordenar por score y tomar los mejores
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(rec => ({
          ...rec.product,
          recommendationScore: rec.score,
          confidence: rec.confidence,
          reasons: this.explainRecommendation(userProfile, rec.product)
        }));

    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      return [];
    }
  }

  async trainModel(trainingData) {
    if (this.isTraining) return;
    
    this.isTraining = true;
    console.log('Iniciando entrenamiento del modelo...');

    try {
      const { xs, ys } = this.prepareTrainingData(trainingData);
      
      const history = await this.model.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
          }
        }
      });

      // Guardar modelo entrenado
      await this.model.save('file://./models/recommendation-model');
      
      console.log('Modelo entrenado y guardado');
      
      xs.dispose();
      ys.dispose();
      
      return history;
    } catch (error) {
      console.error('Error durante entrenamiento:', error);
    } finally {
      this.isTraining = false;
    }
  }

  createUserVector(userProfile, context) {
    // Vector de 50 dimensiones para usuario
    const vector = new Float32Array(50);
    
    // Características demográficas
    vector[0] = userProfile.age / 100;
    vector[1] = userProfile.gender === 'male' ? 1 : 0;
    vector[2] = userProfile.location?.latitude || 0;
    vector[3] = userProfile.location?.longitude || 0;
    
    // Historial de compras
    vector[4] = userProfile.totalPurchases / 100;
    vector[5] = userProfile.averageOrderValue / 1000;
    vector[6] = userProfile.daysSinceLastPurchase / 365;
    
    // Preferencias por categoría
    const categories = ['roses', 'anniversary', 'birthday', 'wedding'];
    categories.forEach((cat, idx) => {
      vector[7 + idx] = userProfile.categoryPreferences?.[cat] || 0;
    });
    
    // Contexto actual
    const contextVector = this.getContextVector(context);
    contextVector.forEach((val, idx) => {
      if (11 + idx < 50) vector[11 + idx] = val;
    });

    return tf.tensor1d(vector);
  }

  createProductVector(product) {
    // Vector de 50 dimensiones para producto
    const vector = new Float32Array(50);
    
    // Características básicas
    vector[0] = product.price / 1000;
    vector[1] = product.rating / 5;
    vector[2] = product.popularity / 100;
    vector[3] = product.stock / 1000;
    
    // Categorías (one-hot encoding)
    const categories = ['roses', 'anniversary', 'birthday', 'wedding'];
    const categoryIndex = categories.indexOf(product.category);
    if (categoryIndex !== -1) vector[4 + categoryIndex] = 1;
    
    // Atributos específicos
    vector[8] = product.seasonal ? 1 : 0;
    vector[9] = product.premium ? 1 : 0;
    vector[10] = product.customizable ? 1 : 0;
    
    // Embedding de texto (simulado)
    const textEmbedding = this.getTextEmbedding(product.description);
    textEmbedding.forEach((val, idx) => {
      if (11 + idx < 50) vector[11 + idx] = val;
    });

    return tf.tensor1d(vector);
  }
}

// === NLP CHATBOT ===
class NLPChatbot {
  constructor() {
    this.intents = this.loadIntents();
    this.responses = this.loadResponses();
    this.context = new Map();
  }

  loadIntents() {
    return {
      greeting: [
        'hola', 'hello', 'hi', 'buenas', 'saludos'
      ],
      product_inquiry: [
        'flores', 'rosas', 'arreglo', 'bouquet', 'precio'
      ],
      order_status: [
        'orden', 'pedido', 'entrega', 'estado', 'tracking'
      ],
      recommendation: [
        'recomienda', 'sugiere', 'mejor', 'ideal', 'perfecto'
      ],
      complaint: [
        'problema', 'error', 'malo', 'defecto', 'queja'
      ]
    };
  }

  async processMessage(message, sessionId, userId) {
    try {
      // Limpiar y procesar mensaje
      const cleanMessage = this.cleanMessage(message);
      const tokens = this.tokenize(cleanMessage);
      
      // Detectar intención
      const intent = this.detectIntent(tokens);
      const entities = this.extractEntities(cleanMessage);
      
      // Obtener contexto
      const userContext = this.context.get(sessionId) || {};
      
      // Generar respuesta
      const response = await this.generateResponse(intent, entities, userContext, userId);
      
      // Actualizar contexto
      this.updateContext(sessionId, intent, entities, response);
      
      return {
        response: response.text,
        confidence: response.confidence,
        intent,
        entities,
        suggestions: response.suggestions || []
      };
      
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      return {
        response: 'Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?',
        confidence: 0,
        intent: 'error',
        entities: []
      };
    }
  }

  detectIntent(tokens) {
    const scores = {};
    
    for (const [intent, keywords] of Object.entries(this.intents)) {
      scores[intent] = 0;
      
      for (const token of tokens) {
        for (const keyword of keywords) {
          if (token.includes(keyword) || keyword.includes(token)) {
            scores[intent] += this.calculateSimilarity(token, keyword);
          }
        }
      }
    }
    
    // Obtener intención con mayor score
    const maxIntent = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );
    
    return scores[maxIntent] > 0.3 ? maxIntent : 'unknown';
  }

  async generateResponse(intent, entities, context, userId) {
    switch (intent) {
      case 'greeting':
        return {
          text: '¡Hola! Soy tu asistente virtual de Flores Victoria. ¿En qué puedo ayudarte hoy?',
          confidence: 0.95,
          suggestions: ['Ver catálogo', 'Hacer pedido', 'Estado de orden']
        };

      case 'product_inquiry':
        const products = await this.getRelevantProducts(entities);
        return {
          text: `Te muestro nuestros mejores productos:\n${products.map(p => `• ${p.name} - $${p.price}`).join('\n')}`,
          confidence: 0.88,
          suggestions: ['Ver detalles', 'Agregar al carrito', 'Más opciones']
        };

      case 'recommendation':
        const recommendations = await this.getPersonalizedRecommendations(userId, entities);
        return {
          text: `Basado en tus preferencias, te recomiendo:\n${recommendations.map(r => `• ${r.name} - ${r.reason}`).join('\n')}`,
          confidence: 0.92,
          suggestions: ['Me gusta', 'Ver más', 'Personalizar']
        };

      case 'order_status':
        const orderInfo = await this.getOrderStatus(userId, entities);
        return {
          text: orderInfo ? 
            `Tu orden #${orderInfo.id} está ${orderInfo.status}. Entrega estimada: ${orderInfo.delivery}` :
            'No encontré órdenes recientes. ¿Podrías proporcionar el número de orden?',
          confidence: orderInfo ? 0.90 : 0.60,
          suggestions: orderInfo ? ['Ver detalles', 'Rastrear'] : ['Ayuda', 'Contactar soporte']
        };

      default:
        return {
          text: 'No estoy seguro de cómo ayudarte con eso. ¿Podrías ser más específico?',
          confidence: 0.30,
          suggestions: ['Ver catálogo', 'Hacer pregunta', 'Contactar humano']
        };
    }
  }
}
```

### ⚡ **WASM Image Processor - C++**

```cpp
// === WASM IMAGE PROCESSOR (C++) ===
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <vector>
#include <cmath>
#include <algorithm>
#include <immintrin.h> // Para SIMD

class ImageProcessor {
private:
    std::vector<uint8_t> imageData;
    int width, height, channels;

public:
    ImageProcessor() : width(0), height(0), channels(0) {}

    // Cargar imagen desde JavaScript
    void loadImage(emscripten::val jsImageData, int w, int h, int c) {
        width = w;
        height = h;
        channels = c;
        
        imageData.clear();
        imageData.reserve(width * height * channels);
        
        // Copiar datos desde JavaScript
        for (int i = 0; i < width * height * channels; ++i) {
            imageData.push_back(jsImageData[i].as<uint8_t>());
        }
    }

    // Redimensionar imagen con interpolación bilinear SIMD
    emscripten::val resize(int newWidth, int newHeight) {
        std::vector<uint8_t> resized(newWidth * newHeight * channels);
        
        float xRatio = static_cast<float>(width) / newWidth;
        float yRatio = static_cast<float>(height) / newHeight;
        
        // Usar SIMD para acelerar el procesamiento
        #pragma omp parallel for
        for (int y = 0; y < newHeight; ++y) {
            for (int x = 0; x < newWidth; ++x) {
                float srcX = x * xRatio;
                float srcY = y * yRatio;
                
                int x1 = static_cast<int>(srcX);
                int y1 = static_cast<int>(srcY);
                int x2 = std::min(x1 + 1, width - 1);
                int y2 = std::min(y1 + 1, height - 1);
                
                float dx = srcX - x1;
                float dy = srcY - y1;
                
                for (int c = 0; c < channels; ++c) {
                    uint8_t p1 = getPixel(x1, y1, c);
                    uint8_t p2 = getPixel(x2, y1, c);
                    uint8_t p3 = getPixel(x1, y2, c);
                    uint8_t p4 = getPixel(x2, y2, c);
                    
                    float interpolated = p1 * (1 - dx) * (1 - dy) +
                                       p2 * dx * (1 - dy) +
                                       p3 * (1 - dx) * dy +
                                       p4 * dx * dy;
                    
                    setPixelResized(resized, x, y, c, static_cast<uint8_t>(interpolated), newWidth);
                }
            }
        }
        
        // Convertir a formato JavaScript
        emscripten::val result = emscripten::val::array();
        for (size_t i = 0; i < resized.size(); ++i) {
            result.call<void>("push", resized[i]);
        }
        
        return result;
    }

    // Aplicar filtros avanzados
    emscripten::val applyFilter(const std::string& filterType, float intensity = 1.0f) {
        std::vector<uint8_t> filtered = imageData;
        
        if (filterType == "blur") {
            filtered = applyGaussianBlur(filtered, intensity);
        } else if (filterType == "sharpen") {
            filtered = applySharpen(filtered, intensity);
        } else if (filterType == "edge") {
            filtered = applyEdgeDetection(filtered);
        } else if (filterType == "vintage") {
            filtered = applyVintageFilter(filtered, intensity);
        } else if (filterType == "hdr") {
            filtered = applyHDREffect(filtered, intensity);
        }
        
        // Convertir resultado
        emscripten::val result = emscripten::val::array();
        for (size_t i = 0; i < filtered.size(); ++i) {
            result.call<void>("push", filtered[i]);
        }
        
        return result;
    }

    // Compresión inteligente
    emscripten::val compress(float quality, const std::string& format) {
        std::vector<uint8_t> compressed;
        
        if (format == "webp") {
            compressed = compressWebP(imageData, quality);
        } else if (format == "jpeg") {
            compressed = compressJPEG(imageData, quality);
        } else {
            compressed = compressPNG(imageData);
        }
        
        emscripten::val result = emscripten::val::array();
        for (size_t i = 0; i < compressed.size(); ++i) {
            result.call<void>("push", compressed[i]);
        }
        
        return result;
    }

private:
    uint8_t getPixel(int x, int y, int c) const {
        if (x >= 0 && x < width && y >= 0 && y < height && c >= 0 && c < channels) {
            return imageData[(y * width + x) * channels + c];
        }
        return 0;
    }
    
    void setPixelResized(std::vector<uint8_t>& data, int x, int y, int c, uint8_t value, int w) {
        data[(y * w + x) * channels + c] = value;
    }

    // Filtro Gaussiano con SIMD
    std::vector<uint8_t> applyGaussianBlur(const std::vector<uint8_t>& data, float sigma) {
        std::vector<uint8_t> result(data.size());
        
        // Kernel Gaussiano 5x5
        float kernel[25];
        generateGaussianKernel(kernel, 5, sigma);
        
        #pragma omp parallel for
        for (int y = 2; y < height - 2; ++y) {
            for (int x = 2; x < width - 2; ++x) {
                for (int c = 0; c < channels; ++c) {
                    float sum = 0;
                    
                    // Aplicar kernel 5x5
                    for (int ky = -2; ky <= 2; ++ky) {
                        for (int kx = -2; kx <= 2; ++kx) {
                            uint8_t pixel = getPixel(x + kx, y + ky, c);
                            sum += pixel * kernel[(ky + 2) * 5 + (kx + 2)];
                        }
                    }
                    
                    result[(y * width + x) * channels + c] = 
                        std::clamp(static_cast<int>(sum), 0, 255);
                }
            }
        }
        
        return result;
    }

    // Detección de bordes Sobel
    std::vector<uint8_t> applyEdgeDetection(const std::vector<uint8_t>& data) {
        std::vector<uint8_t> result(data.size());
        
        // Kernels Sobel
        int sobelX[9] = {-1, 0, 1, -2, 0, 2, -1, 0, 1};
        int sobelY[9] = {-1, -2, -1, 0, 0, 0, 1, 2, 1};
        
        #pragma omp parallel for
        for (int y = 1; y < height - 1; ++y) {
            for (int x = 1; x < width - 1; ++x) {
                for (int c = 0; c < channels; ++c) {
                    int gx = 0, gy = 0;
                    
                    // Aplicar kernels Sobel
                    for (int ky = -1; ky <= 1; ++ky) {
                        for (int kx = -1; kx <= 1; ++kx) {
                            uint8_t pixel = getPixel(x + kx, y + ky, c);
                            int idx = (ky + 1) * 3 + (kx + 1);
                            gx += pixel * sobelX[idx];
                            gy += pixel * sobelY[idx];
                        }
                    }
                    
                    int magnitude = static_cast<int>(std::sqrt(gx * gx + gy * gy));
                    result[(y * width + x) * channels + c] = 
                        std::clamp(magnitude, 0, 255);
                }
            }
        }
        
        return result;
    }

    void generateGaussianKernel(float* kernel, int size, float sigma) {
        float sum = 0;
        int center = size / 2;
        
        for (int y = 0; y < size; ++y) {
            for (int x = 0; x < size; ++x) {
                float distance = std::sqrt(
                    (x - center) * (x - center) + (y - center) * (y - center)
                );
                
                kernel[y * size + x] = std::exp(-(distance * distance) / (2 * sigma * sigma));
                sum += kernel[y * size + x];
            }
        }
        
        // Normalizar kernel
        for (int i = 0; i < size * size; ++i) {
            kernel[i] /= sum;
        }
    }
};

// Bind C++ a JavaScript
EMSCRIPTEN_BINDINGS(image_processor) {
    emscripten::class_<ImageProcessor>("ImageProcessor")
        .constructor<>()
        .function("loadImage", &ImageProcessor::loadImage)
        .function("resize", &ImageProcessor::resize)
        .function("applyFilter", &ImageProcessor::applyFilter)
        .function("compress", &ImageProcessor::compress);
}
```

### 📊 **Database Operations - MongoDB & PostgreSQL**

```javascript
// === MONGODB OPERATIONS ===
const { MongoClient, ObjectId } = require('mongodb');

class DatabaseManager {
  constructor() {
    this.mongoClient = null;
    this.postgresClient = null;
    this.db = null;
  }

  async connectMongoDB() {
    try {
      this.mongoClient = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
      });

      await this.mongoClient.connect();
      this.db = this.mongoClient.db('flores_victoria');
      
      // Crear índices importantes
      await this.createIndexes();
      
      console.log('MongoDB conectado exitosamente');
    } catch (error) {
      console.error('Error conectando MongoDB:', error);
      throw error;
    }
  }

  async createIndexes() {
    const collections = {
      users: [
        { email: 1 },
        { 'preferences.categories': 1 },
        { location: '2dsphere' },
        { createdAt: -1 }
      ],
      products: [
        { category: 1, price: 1 },
        { name: 'text', description: 'text' },
        { popularity: -1 },
        { 'metadata.tags': 1 }
      ],
      orders: [
        { userId: 1, createdAt: -1 },
        { status: 1 },
        { 'items.productId': 1 }
      ],
      interactions: [
        { userId: 1, timestamp: -1 },
        { type: 1, productId: 1 }
      ]
    };

    for (const [collection, indexes] of Object.entries(collections)) {
      for (const index of indexes) {
        await this.db.collection(collection).createIndex(index);
      }
    }
  }

  // === USER OPERATIONS ===
  async createUser(userData) {
    try {
      const user = {
        ...userData,
        createdAt: new Date(),
        preferences: {
          categories: [],
          priceRange: { min: 0, max: 1000 },
          notifications: true
        },
        stats: {
          totalPurchases: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          lastActivity: new Date()
        }
      };

      const result = await this.db.collection('users').insertOne(user);
      return { ...user, _id: result.insertedId };
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId, preferences) {
    return await this.db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          preferences: preferences,
          'stats.lastActivity': new Date()
        }
      }
    );
  }

  async getUserRecommendationProfile(userId) {
    const pipeline = [
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: 'interactions',
          localField: '_id',
          foreignField: 'userId',
          as: 'interactions'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $project: {
          preferences: 1,
          stats: 1,
          location: 1,
          demographics: 1,
          recentInteractions: {
            $slice: ['$interactions', -50]
          },
          recentOrders: {
            $slice: ['$orders', -10]
          }
        }
      }
    ];

    const [profile] = await this.db.collection('users').aggregate(pipeline).toArray();
    return profile;
  }

  // === PRODUCT OPERATIONS ===
  async searchProducts(query, filters = {}) {
    const pipeline = [];

    // Text search si hay query
    if (query) {
      pipeline.push({
        $match: { $text: { $search: query } }
      });
      pipeline.push({
        $addFields: { score: { $meta: 'textScore' } }
      });
    }

    // Aplicar filtros
    const matchStage = {};
    
    if (filters.category) {
      matchStage.category = filters.category;
    }
    
    if (filters.priceRange) {
      matchStage.price = {
        $gte: filters.priceRange.min,
        $lte: filters.priceRange.max
      };
    }
    
    if (filters.tags) {
      matchStage['metadata.tags'] = { $in: filters.tags };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Lookup para obtener stats
    pipeline.push({
      $lookup: {
        from: 'interactions',
        localField: '_id',
        foreignField: 'productId',
        as: 'interactions'
      }
    });

    // Calcular popularidad
    pipeline.push({
      $addFields: {
        popularity: { $size: '$interactions' },
        avgRating: { $avg: '$interactions.rating' }
      }
    });

    // Ordenar por relevancia
    if (query) {
      pipeline.push({ $sort: { score: { $meta: 'textScore' }, popularity: -1 } });
    } else {
      pipeline.push({ $sort: { popularity: -1, createdAt: -1 } });
    }

    // Limitar resultados
    pipeline.push({ $limit: filters.limit || 20 });

    return await this.db.collection('products').aggregate(pipeline).toArray();
  }

  // === INTERACTION TRACKING ===
  async trackInteraction(userId, productId, type, metadata = {}) {
    const interaction = {
      userId: new ObjectId(userId),
      productId: new ObjectId(productId),
      type, // view, click, add_to_cart, purchase, rating
      metadata,
      timestamp: new Date(),
      sessionId: metadata.sessionId,
      device: metadata.device,
      location: metadata.location
    };

    await this.db.collection('interactions').insertOne(interaction);

    // Actualizar estadísticas del producto
    await this.db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      {
        $inc: { [`stats.${type}Count`]: 1 },
        $set: { 'stats.lastInteraction': new Date() }
      }
    );
  }

  // === ANALYTICS QUERIES ===
  async getPopularProducts(timeframe = '7d', limit = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate },
          type: { $in: ['view', 'purchase'] }
        }
      },
      {
        $group: {
          _id: '$productId',
          viewCount: {
            $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] }
          },
          purchaseCount: {
            $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, 1, 0] }
          },
          totalInteractions: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $eq: ['$viewCount', 0] },
              0,
              { $divide: ['$purchaseCount', '$viewCount'] }
            ]
          }
        }
      },
      { $sort: { totalInteractions: -1, conversionRate: -1 } },
      { $limit: limit }
    ];

    return await this.db.collection('interactions').aggregate(pipeline).toArray();
  }
}

// === POSTGRESQL ANALYTICS ===
const { Pool } = require('pg');

class AnalyticsDB {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.POSTGRES_URI,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async recordEvent(event) {
    const query = `
      INSERT INTO events (
        user_id, event_type, event_data, 
        timestamp, session_id, device_info
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const values = [
      event.userId,
      event.type,
      JSON.stringify(event.data),
      event.timestamp || new Date(),
      event.sessionId,
      JSON.stringify(event.deviceInfo)
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getDashboardMetrics(timeframe = '7d') {
    const query = `
      WITH time_series AS (
        SELECT 
          date_trunc('hour', timestamp) as hour,
          COUNT(*) as total_events,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as purchases,
          SUM(CASE 
            WHEN event_type = 'purchase' 
            THEN (event_data->>'amount')::numeric 
            ELSE 0 
          END) as revenue
        FROM events 
        WHERE timestamp >= NOW() - INTERVAL '${timeframe}'
        GROUP BY hour
        ORDER BY hour
      ),
      totals AS (
        SELECT 
          SUM(total_events) as total_events,
          AVG(unique_users) as avg_users_per_hour,
          SUM(purchases) as total_purchases,
          SUM(revenue) as total_revenue
        FROM time_series
      )
      SELECT 
        json_build_object(
          'timeSeries', json_agg(time_series.*),
          'totals', (SELECT row_to_json(totals.*) FROM totals)
        ) as metrics
      FROM time_series
    `;

    const result = await this.pool.query(query);
    return result.rows[0].metrics;
  }

  async getUserJourneyAnalysis(userId) {
    const query = `
      SELECT 
        event_type,
        event_data,
        timestamp,
        LAG(timestamp) OVER (ORDER BY timestamp) as prev_timestamp,
        LEAD(event_type) OVER (ORDER BY timestamp) as next_event
      FROM events 
      WHERE user_id = $1 
        AND timestamp >= NOW() - INTERVAL '30d'
      ORDER BY timestamp
    `;

    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }
}
```

---

**💻 Código Esencial v3.0**  
**📅 Última actualización: Octubre 2024**  
**🌺 Flores Victoria - Sistema E-commerce Ultra-Avanzado**

> 💡 **Este documento contiene los snippets de código más importantes y utilizados del proyecto para referencia rápida durante el desarrollo.**