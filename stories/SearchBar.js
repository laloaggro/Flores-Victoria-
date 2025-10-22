import './search-bar.css';

/**
 * SearchBar Component
 * Advanced search bar with filters and suggestions
 */

export const createSearchBar = ({
  placeholder = 'Buscar productos...',
  value = '',
  suggestions = [],
  showFilters = false,
  onSearch,
  onClear,
  onFilterChange,
} = {}) => {
  const container = document.createElement('div');
  container.className = 'search-bar-container';

  container.innerHTML = `
    <div class="search-bar">
      <!-- Search Icon -->
      <div class="search-bar__icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="8.5" cy="8.5" r="5.5"></circle>
          <path d="M12 12l5 5"></path>
        </svg>
      </div>

      <!-- Input -->
      <input
        type="text"
        class="search-bar__input"
        placeholder="${placeholder}"
        value="${value}"
        aria-label="Buscar productos"
      />

      <!-- Clear Button -->
      ${
        value
          ? `
        <button class="search-bar__clear" aria-label="Limpiar búsqueda">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 4L4 12M4 4l8 8"></path>
          </svg>
        </button>
      `
          : ''
      }

      <!-- Filter Toggle -->
      ${
        showFilters
          ? `
        <button class="search-bar__filter-toggle" aria-label="Filtros">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h14M6 10h8M8 14h4"></path>
          </svg>
        </button>
      `
          : ''
      }

      <!-- Search Button -->
      <button class="search-bar__submit" aria-label="Buscar">
        Buscar
      </button>
    </div>

    <!-- Suggestions Dropdown -->
    ${
      suggestions.length > 0
        ? `
      <div class="search-bar__suggestions">
        <ul class="search-bar__suggestions-list">
          ${suggestions
            .map(
              (suggestion) => `
            <li class="search-bar__suggestion-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="6.5" cy="6.5" r="4.5"></circle>
                <path d="M10 10l4 4"></path>
              </svg>
              <span>${suggestion}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `
        : ''
    }

    <!-- Filters Panel -->
    ${
      showFilters
        ? `
      <div class="search-bar__filters">
        <div class="search-bar__filter-group">
          <label class="search-bar__filter-label">Categoría:</label>
          <select class="search-bar__filter-select" name="category">
            <option value="">Todas</option>
            <option value="rosas">Rosas</option>
            <option value="arreglos">Arreglos</option>
            <option value="plantas">Plantas</option>
            <option value="eventos">Eventos</option>
          </select>
        </div>

        <div class="search-bar__filter-group">
          <label class="search-bar__filter-label">Precio:</label>
          <select class="search-bar__filter-select" name="price">
            <option value="">Todos</option>
            <option value="0-20000">Hasta $20.000</option>
            <option value="20000-40000">$20.000 - $40.000</option>
            <option value="40000-60000">$40.000 - $60.000</option>
            <option value="60000+">Más de $60.000</option>
          </select>
        </div>

        <div class="search-bar__filter-group">
          <label class="search-bar__filter-label">Ordenar por:</label>
          <select class="search-bar__filter-select" name="sort">
            <option value="relevance">Relevancia</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name">Nombre</option>
            <option value="newest">Más recientes</option>
          </select>
        </div>
      </div>
    `
        : ''
    }
  `;

  // Event Listeners
  const input = container.querySelector('.search-bar__input');
  const clearBtn = container.querySelector('.search-bar__clear');
  const submitBtn = container.querySelector('.search-bar__submit');
  const filterToggle = container.querySelector('.search-bar__filter-toggle');
  const filtersPanel = container.querySelector('.search-bar__filters');
  const filterSelects = container.querySelectorAll('.search-bar__filter-select');

  // Input event
  if (input) {
    input.addEventListener('input', (e) => {
      if (onSearch) onSearch(e.target.value);
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(e.target.value);
      }
    });
  }

  // Clear button
  if (clearBtn && onClear) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      onClear();
    });
  }

  // Submit button
  if (submitBtn && onSearch) {
    submitBtn.addEventListener('click', () => {
      onSearch(input.value);
    });
  }

  // Filter toggle
  if (filterToggle && filtersPanel) {
    filterToggle.addEventListener('click', () => {
      filtersPanel.classList.toggle('search-bar__filters--visible');
      filterToggle.classList.toggle('search-bar__filter-toggle--active');
    });
  }

  // Filter selects
  if (onFilterChange) {
    filterSelects.forEach((select) => {
      select.addEventListener('change', () => {
        const filters = {};
        filterSelects.forEach((s) => {
          if (s.value) filters[s.name] = s.value;
        });
        onFilterChange(filters);
      });
    });
  }

  // Suggestion clicks
  const suggestionItems = container.querySelectorAll('.search-bar__suggestion-item');
  suggestionItems.forEach((item) => {
    item.addEventListener('click', () => {
      const text = item.querySelector('span').textContent;
      input.value = text;
      if (onSearch) onSearch(text);
    });
  });

  return container;
};
