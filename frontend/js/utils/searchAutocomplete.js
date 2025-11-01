/**
 * Sistema de Búsqueda Avanzada con Autocompletado
 * Búsqueda por múltiples criterios con sugerencias en tiempo real
 */

export class SearchAutocomplete {
  constructor(options = {}) {
    this.inputId = options.inputId || 'search-input';
    this.onSearch = options.onSearch;
    this.onSelect = options.onSelect;
    this.minChars = options.minChars || 2;
    this.maxSuggestions = options.maxSuggestions || 8;
    this.debounceTime = options.debounceTime || 300;
    
    this.input = null;
    this.dropdown = null;
    this.suggestions = [];
    this.currentIndex = -1;
    this.debounceTimer = null;
    this.allProducts = [];
  }
  
  /**
   * Inicializa el autocompletado
   */
  init(products = []) {
    this.allProducts = products;
    this.input = document.getElementById(this.inputId);
    
    if (!this.input) {
      console.warn(`SearchAutocomplete: Input #${this.inputId} no encontrado`);
      return;
    }
    
    this.createDropdown();
    this.setupEventListeners();
    
    console.log('🔍 Búsqueda avanzada inicializada');
  }
  
  /**
   * Actualiza productos disponibles
   */
  updateProducts(products) {
    this.allProducts = products;
  }
  
  /**
   * Crea el dropdown de sugerencias
   */
  createDropdown() {
    // Verificar si ya existe
    let dropdown = document.getElementById('search-autocomplete-dropdown');
    if (dropdown) {
      this.dropdown = dropdown;
      return;
    }
    
    dropdown = document.createElement('div');
    dropdown.id = 'search-autocomplete-dropdown';
    dropdown.className = 'search-autocomplete-dropdown';
    dropdown.style.display = 'none';
    
    // Insertar después del input
    this.input.parentNode.style.position = 'relative';
    this.input.parentNode.insertBefore(dropdown, this.input.nextSibling);
    
    this.dropdown = dropdown;
  }
  
  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Input con debounce
    this.input.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      
      const query = e.target.value.trim();
      
      if (query.length >= this.minChars) {
        this.debounceTimer = setTimeout(() => {
          this.search(query);
        }, this.debounceTime);
      } else {
        this.hideDropdown();
      }
    });
    
    // Navegación con teclado
    this.input.addEventListener('keydown', (e) => {
      if (!this.isDropdownVisible()) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.navigateDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.navigateUp();
          break;
        case 'Enter':
          e.preventDefault();
          this.selectCurrent();
          break;
        case 'Escape':
          this.hideDropdown();
          break;
      }
    });
    
    // Focus
    this.input.addEventListener('focus', () => {
      if (this.suggestions.length > 0) {
        this.showDropdown();
      }
    });
    
    // Click fuera cierra dropdown
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.hideDropdown();
      }
    });
  }
  
  /**
   * Busca y genera sugerencias
   */
  search(query) {
    const queryLower = query.toLowerCase();
    const results = [];
    
    // Buscar en productos
    this.allProducts.forEach((product) => {
      const score = this.calculateRelevance(product, queryLower);
      if (score > 0) {
        results.push({
          type: 'product',
          data: product,
          score,
          matchType: this.getMatchType(product, queryLower),
        });
      }
    });
    
    // Ordenar por relevancia
    results.sort((a, b) => b.score - a.score);
    
    // Limitar resultados
    this.suggestions = results.slice(0, this.maxSuggestions);
    
    if (this.suggestions.length > 0) {
      this.renderSuggestions(queryLower);
      this.showDropdown();
    } else {
      this.renderNoResults(query);
      this.showDropdown();
    }
    
    // Trigger callback
    if (this.onSearch) {
      this.onSearch(query, this.suggestions);
    }
  }
  
  /**
   * Calcula relevancia de un producto
   */
  calculateRelevance(product, query) {
    let score = 0;
    
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const flowers = (product.flowers || []).map((f) => f.toLowerCase());
    const occasions = (product.occasions || []).map((o) => o.toLowerCase());
    
    // Coincidencia exacta en nombre (peso alto)
    if (name === query) score += 100;
    
    // Comienza con query en nombre
    if (name.startsWith(query)) score += 50;
    
    // Contiene query en nombre
    if (name.includes(query)) score += 30;
    
    // Coincidencia en flores
    flowers.forEach((flower) => {
      if (flower.includes(query)) score += 20;
      if (flower.startsWith(query)) score += 10;
    });
    
    // Coincidencia en categoría
    if (category.includes(query)) score += 15;
    
    // Coincidencia en ocasiones
    occasions.forEach((occasion) => {
      if (occasion.includes(query)) score += 10;
    });
    
    // Coincidencia en descripción
    if (description.includes(query)) score += 5;
    
    return score;
  }
  
  /**
   * Obtiene tipo de coincidencia
   */
  getMatchType(product, query) {
    const name = (product.name || '').toLowerCase();
    const flowers = (product.flowers || []).map((f) => f.toLowerCase());
    const category = (product.category || '').toLowerCase();
    
    if (name.includes(query)) return 'name';
    if (flowers.some((f) => f.includes(query))) return 'flower';
    if (category.includes(query)) return 'category';
    return 'other';
  }
  
  /**
   * Renderiza sugerencias
   */
  renderSuggestions(query) {
    const items = this.suggestions.map((suggestion, index) => {
      const product = suggestion.data;
      const matchType = suggestion.matchType;
      
      return `
        <div class="autocomplete-item ${index === this.currentIndex ? 'active' : ''}" 
             data-index="${index}">
          <div class="autocomplete-image">
            <img src="${product.images?.[0] || '/images/placeholders/flower-placeholder.svg'}" 
                 alt="${product.name}"
                 onerror="this.src='/images/placeholders/flower-placeholder.svg'">
          </div>
          <div class="autocomplete-content">
            <div class="autocomplete-name">
              ${this.highlightMatch(product.name, query)}
            </div>
            <div class="autocomplete-meta">
              <span class="autocomplete-match-type">
                ${this.getMatchTypeLabel(matchType)}
              </span>
              <span class="autocomplete-price">
                ${this.formatPrice(product.price)}
              </span>
            </div>
            ${matchType === 'flower' && product.flowers ? `
              <div class="autocomplete-flowers">
                ${product.flowers.slice(0, 3).map((f) => this.highlightMatch(f, query)).join(' • ')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    this.dropdown.innerHTML = items;
    
    // Event listeners para items
    this.dropdown.querySelectorAll('.autocomplete-item').forEach((item) => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.selectSuggestion(index);
      });
      
      item.addEventListener('mouseenter', () => {
        this.currentIndex = parseInt(item.dataset.index);
        this.updateActiveItem();
      });
    });
  }
  
  /**
   * Renderiza mensaje sin resultados
   */
  renderNoResults(query) {
    this.dropdown.innerHTML = `
      <div class="autocomplete-no-results">
        <i class="fas fa-search"></i>
        <p>No se encontraron resultados para "${query}"</p>
        <p class="autocomplete-hint">Intenta con otros términos como:</p>
        <ul class="autocomplete-suggestions">
          <li>Nombres de flores (rosas, tulipanes, orquídeas)</li>
          <li>Ocasiones (bodas, aniversario, cumpleaños)</li>
          <li>Categorías (premium, ramos, plantas)</li>
        </ul>
      </div>
    `;
  }
  
  /**
   * Resalta coincidencias en texto
   */
  highlightMatch(text, query) {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  /**
   * Escapa caracteres especiales de regex
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Obtiene etiqueta de tipo de coincidencia
   */
  getMatchTypeLabel(type) {
    const labels = {
      name: '📝 Nombre',
      flower: '🌸 Flor',
      category: '📦 Categoría',
      other: '🔍 Relacionado',
    };
    return labels[type] || labels.other;
  }
  
  /**
   * Formatea precio
   */
  formatPrice(price) {
    if (typeof price !== 'number') {
      price = parseFloat(price) || 0;
    }
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  }
  
  /**
   * Navega hacia abajo en sugerencias
   */
  navigateDown() {
    if (this.currentIndex < this.suggestions.length - 1) {
      this.currentIndex++;
      this.updateActiveItem();
    }
  }
  
  /**
   * Navega hacia arriba en sugerencias
   */
  navigateUp() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateActiveItem();
    } else {
      this.currentIndex = -1;
      this.updateActiveItem();
    }
  }
  
  /**
   * Actualiza item activo visualmente
   */
  updateActiveItem() {
    this.dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  /**
   * Selecciona sugerencia actual
   */
  selectCurrent() {
    if (this.currentIndex >= 0 && this.currentIndex < this.suggestions.length) {
      this.selectSuggestion(this.currentIndex);
    }
  }
  
  /**
   * Selecciona una sugerencia
   */
  selectSuggestion(index) {
    const suggestion = this.suggestions[index];
    if (!suggestion) return;
    
    const product = suggestion.data;
    
    // Actualizar input
    this.input.value = product.name;
    
    // Ocultar dropdown
    this.hideDropdown();
    
    // Trigger callback
    if (this.onSelect) {
      this.onSelect(product, suggestion);
    }
    
    console.log('Producto seleccionado:', product.name);
  }
  
  /**
   * Muestra el dropdown
   */
  showDropdown() {
    if (this.dropdown) {
      this.dropdown.style.display = 'block';
    }
  }
  
  /**
   * Oculta el dropdown
   */
  hideDropdown() {
    if (this.dropdown) {
      this.dropdown.style.display = 'none';
      this.currentIndex = -1;
    }
  }
  
  /**
   * Verifica si dropdown está visible
   */
  isDropdownVisible() {
    return this.dropdown && this.dropdown.style.display !== 'none';
  }
  
  /**
   * Limpia búsqueda
   */
  clear() {
    if (this.input) {
      this.input.value = '';
    }
    this.hideDropdown();
    this.suggestions = [];
    this.currentIndex = -1;
  }
}

// Inyectar estilos
const injectStyles = () => {
  if (document.getElementById('search-autocomplete-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'search-autocomplete-styles';
  style.textContent = `
    .search-autocomplete-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 2px solid #2d5016;
      border-top: none;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
      margin-top: -1px;
    }
    
    .autocomplete-item {
      display: flex;
      gap: 1rem;
      padding: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .autocomplete-item:last-child {
      border-bottom: none;
    }
    
    .autocomplete-item:hover,
    .autocomplete-item.active {
      background: #f0f8f0;
    }
    
    .autocomplete-image {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .autocomplete-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .autocomplete-content {
      flex: 1;
      min-width: 0;
    }
    
    .autocomplete-name {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }
    
    .autocomplete-name mark {
      background: #fff9c4;
      color: #2d5016;
      font-weight: 700;
      padding: 0 2px;
    }
    
    .autocomplete-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #666;
    }
    
    .autocomplete-match-type {
      color: #2d5016;
      font-weight: 500;
    }
    
    .autocomplete-price {
      font-weight: 600;
      color: #2d5016;
    }
    
    .autocomplete-flowers {
      font-size: 0.75rem;
      color: #999;
      margin-top: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .autocomplete-flowers mark {
      background: #e8f5e9;
      color: #2d5016;
    }
    
    .autocomplete-no-results {
      padding: 2rem;
      text-align: center;
      color: #666;
    }
    
    .autocomplete-no-results i {
      font-size: 2rem;
      color: #ddd;
      margin-bottom: 0.5rem;
    }
    
    .autocomplete-no-results p {
      margin: 0.5rem 0;
    }
    
    .autocomplete-hint {
      font-size: 0.875rem;
      color: #999;
      margin-top: 1rem;
    }
    
    .autocomplete-suggestions {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0 0 0;
      font-size: 0.875rem;
      color: #666;
    }
    
    .autocomplete-suggestions li {
      padding: 0.25rem 0;
    }
  `;
  
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  injectStyles();
}
