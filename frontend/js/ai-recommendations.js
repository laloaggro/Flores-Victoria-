/**
 * 🤖 Flores Victoria AI Recommendations Frontend
 * Client-side implementation for AI-powered recommendations
 *
 * @author Eduardo Garay (@laloaggro)
 * @version 2.1.0
 * @license MIT
 */

class RecommendationsManager {
  constructor(options = {}) {
    this.apiBaseUrl = options.apiUrl || '/api/ai';
    this.userId = options.userId || this.getUserId();
    this.sessionId = this.generateSessionId();
    this.interactions = [];
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes

    this.initializeRecommendations();
  }

  /**
   * 🚀 Inicializar sistema de recomendaciones
   */
  async initializeRecommendations() {
    try {
      console.log('🤖 Inicializando sistema de recomendaciones...');

      // Verificar que el servicio esté disponible
      await this.healthCheck();

      // Cargar recomendaciones iniciales
      await this.loadInitialRecommendations();

      // Setup event listeners
      this.setupEventListeners();

      // Setup intersection observer para lazy loading
      this.setupIntersectionObserver();

      console.log('✅ Sistema de recomendaciones inicializado');
    } catch (error) {
      console.error('❌ Error inicializando recomendaciones:', error);
      this.showFallbackRecommendations();
    }
  }

  /**
   * 🏥 Health check del servicio
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('⚠️ Servicio de recomendaciones no disponible:', error);
      throw error;
    }
  }

  /**
   * 🎯 Obtener recomendaciones personalizadas
   */
  async getPersonalizedRecommendations(context = {}) {
    try {
      const cacheKey = `recommendations_${this.userId}_${JSON.stringify(context)}`;

      // Verificar cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        sessionId: this.sessionId,
        ...context,
      });

      const response = await fetch(`${this.apiBaseUrl}/recommendations/${this.userId}?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones:', error);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * 🔥 Obtener productos trending
   */
  async getTrendingProducts(limit = 10, category = null) {
    try {
      const params = new URLSearchParams({ limit });
      if (category) params.append('category', category);

      const response = await fetch(`${this.apiBaseUrl}/trending?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo trending:', error);
      return { success: false, data: { trending: [] } };
    }
  }

  /**
   * 🎉 Obtener recomendaciones por ocasión
   */
  async getOccasionRecommendations(occasion, limit = 10) {
    try {
      const params = new URLSearchParams({ limit });
      const response = await fetch(`${this.apiBaseUrl}/occasion/${occasion}?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones por ocasión:', error);
      return { success: false, data: { recommendations: [] } };
    }
  }

  /**
   * 🔍 Obtener productos similares
   */
  async getSimilarProducts(productId, limit = 5) {
    try {
      const params = new URLSearchParams({ limit });
      const response = await fetch(`${this.apiBaseUrl}/similar/${productId}?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo productos similares:', error);
      return { success: false, data: { similar: [] } };
    }
  }

  /**
   * 📊 Registrar interacción
   */
  async recordInteraction(interaction) {
    try {
      const interactionData = {
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        ...interaction,
      };

      // Guardar localmente primero
      this.interactions.push(interactionData);

      // Enviar al servidor
      const response = await fetch(`${this.apiBaseUrl}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interactionData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Limpiar cache relacionado
      this.clearRelatedCache(interaction);

      return await response.json();
    } catch (error) {
      console.error('❌ Error registrando interacción:', error);
      // Store for retry later
      this.storeFailedInteraction(interaction);
    }
  }

  /**
   * 🎨 Renderizar recomendaciones personalizadas
   */
  async renderPersonalizedRecommendations(container, options = {}) {
    try {
      const containerId = typeof container === 'string' ? container : container.id;
      const element = document.getElementById(containerId);

      if (!element) {
        console.error(`❌ Container no encontrado: ${containerId}`);
        return;
      }

      // Mostrar loading
      element.innerHTML = this.getLoadingHTML();

      // Obtener recomendaciones
      const result = await this.getPersonalizedRecommendations(options.context);

      if (!result.success || !result.data.recommendations.length) {
        element.innerHTML = this.getEmptyStateHTML();
        return;
      }

      // Renderizar recomendaciones
      const html = this.generateRecommendationsHTML(result.data.recommendations, options);
      element.innerHTML = html;

      // Setup event listeners para las recomendaciones
      this.setupRecommendationEvents(element);
    } catch (error) {
      console.error('❌ Error renderizando recomendaciones:', error);
      document.getElementById(container).innerHTML = this.getErrorHTML();
    }
  }

  /**
   * 🔥 Renderizar productos trending
   */
  async renderTrendingProducts(container, options = {}) {
    try {
      const element = document.getElementById(container);
      element.innerHTML = this.getLoadingHTML();

      const result = await this.getTrendingProducts(options.limit, options.category);

      if (!result.success || !result.data.trending.length) {
        element.innerHTML = this.getEmptyStateHTML('trending');
        return;
      }

      const html = this.generateTrendingHTML(result.data.trending, options);
      element.innerHTML = html;

      this.setupRecommendationEvents(element);
    } catch (error) {
      console.error('❌ Error renderizando trending:', error);
      document.getElementById(container).innerHTML = this.getErrorHTML();
    }
  }

  /**
   * 🎉 Renderizar recomendaciones por ocasión
   */
  async renderOccasionRecommendations(container, occasion, options = {}) {
    try {
      const element = document.getElementById(container);
      element.innerHTML = this.getLoadingHTML();

      const result = await this.getOccasionRecommendations(occasion, options.limit);

      if (!result.success || !result.data.recommendations.length) {
        element.innerHTML = this.getEmptyStateHTML('occasion');
        return;
      }

      const html = this.generateOccasionHTML(result.data.recommendations, occasion, options);
      element.innerHTML = html;

      this.setupRecommendationEvents(element);
    } catch (error) {
      console.error('❌ Error renderizando recomendaciones por ocasión:', error);
      document.getElementById(container).innerHTML = this.getErrorHTML();
    }
  }

  /**
   * 🏗️ Generar HTML de recomendaciones
   */
  generateRecommendationsHTML(recommendations, options = {}) {
    const showReason = options.showReason !== false;
    const showConfidence = options.showConfidence === true;

    return `
      <div class="ai-recommendations">
        <div class="recommendations-header">
          <h3>🤖 Recomendaciones Personalizadas</h3>
          <p class="recommendations-subtitle">Seleccionadas especialmente para ti</p>
        </div>
        <div class="recommendations-grid">
          ${recommendations
            .map((rec, index) =>
              this.generateRecommendationCard(rec, index, { showReason, showConfidence })
            )
            .join('')}
        </div>
      </div>
    `;
  }

  /**
   * 🎴 Generar tarjeta de recomendación
   */
  generateRecommendationCard(recommendation, index, options = {}) {
    const product = recommendation.product || {};
    const confidence = Math.round(recommendation.confidence * 100);
    const sources = recommendation.sources || [recommendation.source];

    return `
      <div class="recommendation-card" data-product-id="${product.id || recommendation.productId}" data-index="${index}">
        <div class="card-image">
          <img src="${product.image || '/images/placeholder-flower.jpg'}" 
               alt="${product.name || 'Producto recomendado'}"
               loading="lazy"
               onerror="this.src='/images/placeholder-flower.jpg'">
          ${options.showConfidence ? `<div class="confidence-badge">${confidence}%</div>` : ''}
          <div class="ai-badge">🤖 IA</div>
        </div>
        <div class="card-content">
          <h4 class="product-name">${product.name || 'Producto Recomendado'}</h4>
          <p class="product-price">$${this.formatPrice(product.price || 0)}</p>
          
          ${
            options.showReason && recommendation.reason
              ? `
            <div class="recommendation-reason">
              <small>💡 ${recommendation.reason}</small>
            </div>
          `
              : ''
          }
          
          <div class="recommendation-sources">
            ${sources.map((source) => `<span class="source-tag">${this.getSourceLabel(source)}</span>`).join('')}
          </div>
          
          <div class="card-actions">
            <button class="btn-add-cart" data-product-id="${product.id || recommendation.productId}">
              Agregar al Carrito
            </button>
            <button class="btn-view-details" data-product-id="${product.id || recommendation.productId}">
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 🔥 Generar HTML de trending
   */
  generateTrendingHTML(trendingProducts, options = {}) {
    return `
      <div class="trending-products">
        <div class="trending-header">
          <h3>🔥 Lo Más Popular</h3>
          <p class="trending-subtitle">Los favoritos de nuestros clientes</p>
        </div>
        <div class="trending-grid">
          ${trendingProducts
            .map((product, index) => this.generateTrendingCard(product, index))
            .join('')}
        </div>
      </div>
    `;
  }

  /**
   * 🎴 Generar tarjeta de trending
   */
  generateTrendingCard(product, index) {
    return `
      <div class="trending-card" data-product-id="${product.id}" data-index="${index}">
        <div class="card-image">
          <img src="${product.image || '/images/placeholder-flower.jpg'}" 
               alt="${product.name}"
               loading="lazy">
          <div class="trending-badge">🔥 #${index + 1}</div>
          <div class="trending-score">${product.trendingScore || 0}%</div>
        </div>
        <div class="card-content">
          <h4 class="product-name">${product.name}</h4>
          <p class="product-price">$${this.formatPrice(product.price)}</p>
          <div class="trending-stats">
            <span class="views">👁️ ${product.views || 0}</span>
            <span class="purchases">🛒 ${product.purchases || 0}</span>
          </div>
          <div class="card-actions">
            <button class="btn-add-cart" data-product-id="${product.id}">
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 🎉 Generar HTML de ocasión
   */
  generateOccasionHTML(recommendations, occasion, options = {}) {
    return `
      <div class="occasion-recommendations">
        <div class="occasion-header">
          <h3>🎉 Perfecto para ${this.getOccasionLabel(occasion)}</h3>
          <p class="occasion-subtitle">Especialmente seleccionados para esta ocasión</p>
        </div>
        <div class="occasion-grid">
          ${recommendations.map((rec, index) => this.generateOccasionCard(rec, index)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 🎴 Generar tarjeta de ocasión
   */
  generateOccasionCard(recommendation, index) {
    return `
      <div class="occasion-card" data-product-id="${recommendation.id}" data-index="${index}">
        <div class="card-image">
          <img src="${recommendation.image || '/images/placeholder-flower.jpg'}" 
               alt="${recommendation.name}"
               loading="lazy">
          <div class="occasion-badge">🎉</div>
        </div>
        <div class="card-content">
          <h4 class="product-name">${recommendation.name}</h4>
          <p class="product-price">$${this.formatPrice(recommendation.price)}</p>
          <div class="recommendation-reason">
            <small>💡 ${recommendation.reason}</small>
          </div>
          <div class="card-actions">
            <button class="btn-add-cart" data-product-id="${recommendation.id}">
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 🎧 Setup event listeners
   */
  setupEventListeners() {
    // Track page visibility for session management
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.recordInteraction({
          type: 'page_hidden',
          timestamp: Date.now(),
        });
      } else {
        this.recordInteraction({
          type: 'page_visible',
          timestamp: Date.now(),
        });
      }
    });

    // Track scroll behavior
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordInteraction({
          type: 'scroll',
          scrollY: window.scrollY,
          timestamp: Date.now(),
        });
      }, 1000);
    });
  }

  /**
   * 🎧 Setup recommendation event listeners
   */
  setupRecommendationEvents(container) {
    // Add to cart buttons
    container.querySelectorAll('.btn-add-cart').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        this.handleAddToCart(productId, e.target);
      });
    });

    // View details buttons
    container.querySelectorAll('.btn-view-details').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        this.handleViewDetails(productId);
      });
    });

    // Card hover tracking
    container
      .querySelectorAll('.recommendation-card, .trending-card, .occasion-card')
      .forEach((card) => {
        let hoverStartTime;

        card.addEventListener('mouseenter', () => {
          hoverStartTime = Date.now();
        });

        card.addEventListener('mouseleave', () => {
          if (hoverStartTime) {
            const hoverDuration = Date.now() - hoverStartTime;
            this.recordInteraction({
              type: 'product_hover',
              productId: card.dataset.productId,
              duration: hoverDuration,
              index: parseInt(card.dataset.index),
            });
          }
        });
      });
  }

  /**
   * 👁️ Setup intersection observer
   */
  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productId = entry.target.dataset.productId;
            const index = entry.target.dataset.index;

            this.recordInteraction({
              type: 'product_viewed',
              productId,
              index: parseInt(index),
              intersectionRatio: entry.intersectionRatio,
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe recommendation cards when they're created
    document
      .querySelectorAll('.recommendation-card, .trending-card, .occasion-card')
      .forEach((card) => {
        observer.observe(card);
      });
  }

  /**
   * 🛒 Manejar agregar al carrito
   */
  async handleAddToCart(productId, button) {
    try {
      // Show loading state
      const originalText = button.textContent;
      button.textContent = 'Agregando...';
      button.disabled = true;

      // Record interaction
      await this.recordInteraction({
        type: 'add_to_cart',
        productId,
        source: 'recommendation',
      });

      // Add to cart (implement your cart logic here)
      await this.addToCart(productId);

      // Success feedback
      button.textContent = '✅ Agregado';
      button.classList.add('success');

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('success');
      }, 2000);
    } catch (error) {
      console.error('❌ Error agregando al carrito:', error);
      button.textContent = 'Error';
      button.classList.add('error');

      setTimeout(() => {
        button.textContent = 'Agregar al Carrito';
        button.disabled = false;
        button.classList.remove('error');
      }, 2000);
    }
  }

  /**
   * 👁️ Manejar ver detalles
   */
  handleViewDetails(productId) {
    this.recordInteraction({
      type: 'view_details',
      productId,
      source: 'recommendation',
    });

    // Navigate to product details (implement your navigation logic)
    window.location.href = `/product/${productId}`;
  }

  /**
   * 🛒 Agregar al carrito (implement your cart logic)
   */
  async addToCart(productId) {
    // This should integrate with your existing cart system
    console.log(`Adding product ${productId} to cart`);

    // Example implementation:
    // return await fetch('/api/cart/add', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ productId, quantity: 1 })
    // });
  }

  /**
   * 🔧 Utility methods
   */
  getUserId() {
    // Get user ID from session, localStorage, or generate anonymous ID
    let userId = localStorage.getItem('flores_user_id');
    if (!userId) {
      userId = 'anonymous_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('flores_user_id', userId);
    }
    return userId;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  formatPrice(price) {
    return new Intl.NumberFormat('es-CL').format(price);
  }

  getSourceLabel(source) {
    const labels = {
      collaborative: 'Usuarios similares',
      content: 'Productos similares',
      seasonal: 'Estacional',
      trending: 'Popular',
      occasion: 'Ocasión',
    };
    return labels[source] || source;
  }

  getOccasionLabel(occasion) {
    const labels = {
      valentine: 'San Valentín',
      'mother-day': 'Día de la Madre',
      birthday: 'Cumpleaños',
      wedding: 'Bodas',
      christmas: 'Navidad',
    };
    return labels[occasion] || occasion;
  }

  getLoadingHTML() {
    return `
      <div class="recommendations-loading">
        <div class="loading-spinner"></div>
        <p>🤖 Generando recomendaciones personalizadas...</p>
      </div>
    `;
  }

  getEmptyStateHTML(type = 'recommendations') {
    const messages = {
      recommendations: 'No hay recomendaciones disponibles en este momento',
      trending: 'No hay productos trending disponibles',
      occasion: 'No hay recomendaciones para esta ocasión',
    };

    return `
      <div class="recommendations-empty">
        <div class="empty-icon">🌸</div>
        <p>${messages[type]}</p>
        <button onclick="location.reload()" class="btn-retry">Intentar de nuevo</button>
      </div>
    `;
  }

  getErrorHTML() {
    return `
      <div class="recommendations-error">
        <div class="error-icon">⚠️</div>
        <p>Error cargando recomendaciones</p>
        <button onclick="location.reload()" class="btn-retry">Intentar de nuevo</button>
      </div>
    `;
  }

  async loadInitialRecommendations() {
    // Load any initial recommendations needed
    console.log('Loading initial recommendations...');
  }

  showFallbackRecommendations() {
    // Show basic recommendations when AI service is not available
    console.log('Showing fallback recommendations');
  }

  getFallbackRecommendations() {
    return {
      success: true,
      data: {
        recommendations: [],
        metadata: { fallback: true },
      },
    };
  }

  clearRelatedCache(interaction) {
    // Clear cache entries related to this interaction
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(interaction.productId) || key.includes(this.userId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  storeFailedInteraction(interaction) {
    // Store failed interactions for retry
    const failed = JSON.parse(localStorage.getItem('failed_interactions') || '[]');
    failed.push(interaction);
    localStorage.setItem('failed_interactions', JSON.stringify(failed));
  }
}

// CSS Styles for recommendations
const recommendationsCSS = `
  .ai-recommendations,
  .trending-products,
  .occasion-recommendations {
    margin: 2rem 0;
    padding: 1rem;
  }

  .recommendations-header,
  .trending-header,
  .occasion-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .recommendations-header h3,
  .trending-header h3,
  .occasion-header h3 {
    color: #2d3748;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .recommendations-subtitle,
  .trending-subtitle,
  .occasion-subtitle {
    color: #718096;
    font-size: 0.9rem;
  }

  .recommendations-grid,
  .trending-grid,
  .occasion-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .recommendation-card,
  .trending-card,
  .occasion-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
  }

  .recommendation-card:hover,
  .trending-card:hover,
  .occasion-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .card-image {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ai-badge,
  .trending-badge,
  .occasion-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .confidence-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
  }

  .trending-score {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(255, 107, 107, 0.9);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .card-content {
    padding: 1rem;
  }

  .product-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .product-price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #e53e3e;
    margin-bottom: 0.5rem;
  }

  .recommendation-reason {
    background: #f7fafc;
    padding: 0.5rem;
    border-radius: 8px;
    margin: 0.5rem 0;
  }

  .recommendation-reason small {
    color: #4a5568;
    font-style: italic;
  }

  .recommendation-sources {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin: 0.5rem 0;
  }

  .source-tag {
    background: #e2e8f0;
    color: #4a5568;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
  }

  .trending-stats {
    display: flex;
    justify-content: space-between;
    margin: 0.5rem 0;
    font-size: 0.8rem;
    color: #718096;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .btn-add-cart,
  .btn-view-details {
    flex: 1;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-add-cart {
    background: #48bb78;
    color: white;
  }

  .btn-add-cart:hover {
    background: #38a169;
  }

  .btn-add-cart.success {
    background: #38a169;
  }

  .btn-add-cart.error {
    background: #e53e3e;
  }

  .btn-view-details {
    background: #edf2f7;
    color: #4a5568;
  }

  .btn-view-details:hover {
    background: #e2e8f0;
  }

  .recommendations-loading,
  .recommendations-empty,
  .recommendations-error {
    text-align: center;
    padding: 3rem;
    color: #718096;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-left: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-icon,
  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .btn-retry {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 1rem;
  }

  .btn-retry:hover {
    background: #5a67d8;
  }

  @media (max-width: 768px) {
    .recommendations-grid,
    .trending-grid,
    .occasion-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .card-actions {
      flex-direction: column;
    }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = recommendationsCSS;
  document.head.appendChild(style);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationsManager;
}

// Global initialization
if (typeof window !== 'undefined') {
  window.RecommendationsManager = RecommendationsManager;

  // Auto-initialize if containers are found
  document.addEventListener('DOMContentLoaded', () => {
    if (
      document.getElementById('ai-recommendations') ||
      document.getElementById('trending-products') ||
      document.getElementById('occasion-recommendations')
    ) {
      window.floresRecommendations = new RecommendationsManager({
        apiUrl: window.location.origin.includes('localhost')
          ? 'http://localhost:3012'
          : '/api/recommendations',
      });
    }
  });
}
