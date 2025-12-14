/**
 * Filtros de Ocasión - Flores Victoria
 * Filtrado de productos por ocasión especial
 */

const OccasionFilters = {
  // Definición de ocasiones
  occasions: [
    {
      id: 'cumpleanos',
      name: 'Cumpleaños',
      icon: '🎂',
      categories: ['cumpleaños', 'bouquets', 'rosas', 'girasoles'],
    },
    {
      id: 'bodas',
      name: 'Bodas',
      icon: '💒',
      categories: ['bodas', 'rosas', 'orquideas', 'lirios'],
    },
    {
      id: 'aniversarios',
      name: 'Aniversario',
      icon: '💕',
      categories: ['aniversarios', 'rosas', 'orquideas'],
    },
    { id: 'amor', name: 'Amor', icon: '❤️', categories: ['rosas', 'orquideas', 'tulipanes'] },
    { id: 'condolencias', name: 'Condolencias', icon: '🕊️', categories: ['funebres', 'lirios'] },
    {
      id: 'amistad',
      name: 'Amistad',
      icon: '🤝',
      categories: ['girasoles', 'tulipanes', 'bouquets'],
    },
    {
      id: 'corporativo',
      name: 'Corporativo',
      icon: '🏢',
      categories: ['corporativos', 'orquideas'],
    },
    {
      id: 'graduacion',
      name: 'Graduación',
      icon: '🎓',
      categories: ['bouquets', 'rosas', 'girasoles'],
    },
    { id: 'nacimiento', name: 'Nacimiento', icon: '👶', categories: ['bouquets', 'tulipanes'] },
    {
      id: 'recuperacion',
      name: 'Pronta Recuperación',
      icon: '💐',
      categories: ['girasoles', 'bouquets', 'tulipanes'],
    },
    {
      id: 'madre',
      name: 'Día de la Madre',
      icon: '👩',
      categories: ['rosas', 'orquideas', 'tulipanes', 'bouquets'],
    },
    { id: 'todos', name: 'Todas', icon: '🌸', categories: [] },
  ],

  // Estado actual
  activeFilter: null,

  /**
   * Obtener productos filtrados por ocasión
   */
  async filterByOccasion(occasionId, products) {
    if (occasionId === 'todos' || !occasionId) {
      return products;
    }

    const occasion = this.occasions.find((o) => o.id === occasionId);
    if (!occasion) return products;

    return products.filter((product) =>
      occasion.categories.includes(product.category.toLowerCase())
    );
  },

  /**
   * Renderizar filtros
   */
  renderFilters(containerId, onFilterChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <style>
        .occasion-filters {
          padding: 16px 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .occasion-filters-title {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        
        .occasion-filters-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .occasion-filters-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .occasion-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          background: white;
          border: 2px solid #eee;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: #555;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        
        .occasion-chip:hover {
          border-color: #C2185B;
          color: #C2185B;
        }
        
        .occasion-chip.active {
          background: linear-gradient(135deg, #C2185B, #E91E63);
          border-color: transparent;
          color: white;
        }
        
        .occasion-chip-icon {
          font-size: 16px;
        }
        
        /* Grid de ocasiones para página dedicada */
        .occasion-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          padding: 20px 0;
        }
        
        .occasion-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          background: white;
          border: 2px solid #eee;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          color: inherit;
        }
        
        .occasion-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border-color: #C2185B;
        }
        
        .occasion-card.active {
          background: linear-gradient(135deg, #C2185B, #E91E63);
          border-color: transparent;
          color: white;
        }
        
        .occasion-card-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }
        
        .occasion-card-name {
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }
        
        @media (max-width: 640px) {
          .occasion-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          
          .occasion-card {
            padding: 16px 10px;
          }
          
          .occasion-card-icon {
            font-size: 28px;
          }
          
          .occasion-card-name {
            font-size: 12px;
          }
        }
      </style>
      
      <div class="occasion-filters">
        <h4 class="occasion-filters-title">🎉 Filtrar por ocasión</h4>
        <div class="occasion-filters-scroll">
          ${this.occasions
            .map(
              (occasion) => `
            <button 
              class="occasion-chip ${this.activeFilter === occasion.id ? 'active' : ''}" 
              data-occasion="${occasion.id}"
            >
              <span class="occasion-chip-icon">${occasion.icon}</span>
              <span>${occasion.name}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    // Vincular eventos
    container.querySelectorAll('.occasion-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const occasionId = chip.dataset.occasion;
        this.setActiveFilter(occasionId, container);

        if (typeof onFilterChange === 'function') {
          onFilterChange(occasionId);
        }

        // Track en analytics
        if (window.gtag) {
          window.gtag('event', 'filter_occasion', {
            event_category: 'engagement',
            event_label: occasionId,
          });
        }
      });
    });
  },

  /**
   * Renderizar grid de ocasiones (para página principal)
   */
  renderOccasionGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Excluir "Todos" del grid
    const occasions = this.occasions.filter((o) => o.id !== 'todos');

    container.innerHTML = `
      <div class="occasion-grid">
        ${occasions
          .map(
            (occasion) => `
          <a 
            href="/pages/products.html?occasion=${occasion.id}" 
            class="occasion-card"
          >
            <span class="occasion-card-icon">${occasion.icon}</span>
            <span class="occasion-card-name">${occasion.name}</span>
          </a>
        `
          )
          .join('')}
      </div>
    `;
  },

  /**
   * Establecer filtro activo
   */
  setActiveFilter(occasionId, container) {
    this.activeFilter = occasionId;

    // Actualizar UI
    container.querySelectorAll('.occasion-chip, .occasion-card').forEach((el) => {
      el.classList.toggle('active', el.dataset.occasion === occasionId);
    });

    // Actualizar URL
    const url = new URL(window.location);
    if (occasionId && occasionId !== 'todos') {
      url.searchParams.set('occasion', occasionId);
    } else {
      url.searchParams.delete('occasion');
    }
    window.history.replaceState({}, '', url);
  },

  /**
   * Obtener filtro de URL
   */
  getFilterFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('occasion') || null;
  },

  /**
   * Inicializar con filtro de URL
   */
  initFromURL() {
    this.activeFilter = this.getFilterFromURL();
    return this.activeFilter;
  },
};

window.OccasionFilters = OccasionFilters;
