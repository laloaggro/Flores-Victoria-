/**
 * Skeleton Loader Component
 * Generates loading placeholders for various content types
 */

class SkeletonLoader {
  constructor(options = {}) {
    this.options = {
      animation: 'shimmer', // 'shimmer', 'pulse', 'wave'
      baseColor: '#e0e0e0',
      highlightColor: '#f5f5f5',
      borderRadius: '8px',
      ...options,
    };
  }

  /**
   * Generate product card skeleton
   */
  productCard(count = 1) {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      skeletons.push(`
        <div class="skeleton-card product-skeleton">
          <div class="skeleton-image skeleton-shimmer"></div>
          <div class="skeleton-content">
            <div class="skeleton-line skeleton-title skeleton-shimmer"></div>
            <div class="skeleton-line skeleton-text skeleton-shimmer"></div>
            <div class="skeleton-line skeleton-text short skeleton-shimmer"></div>
            <div class="skeleton-price-row">
              <div class="skeleton-line skeleton-price skeleton-shimmer"></div>
              <div class="skeleton-button skeleton-shimmer"></div>
            </div>
          </div>
        </div>
      `);
    }
    return skeletons.join('');
  }

  /**
   * Generate product grid skeleton
   */
  productGrid(columns = 4, rows = 3) {
    const total = columns * rows;
    return `
      <div class="skeleton-grid" style="grid-template-columns: repeat(${columns}, 1fr);">
        ${this.productCard(total)}
      </div>
    `;
  }

  /**
   * Generate cart item skeleton
   */
  cartItem(count = 3) {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      skeletons.push(`
        <div class="skeleton-cart-item">
          <div class="skeleton-image small skeleton-shimmer"></div>
          <div class="skeleton-cart-details">
            <div class="skeleton-line skeleton-title skeleton-shimmer"></div>
            <div class="skeleton-line skeleton-text short skeleton-shimmer"></div>
          </div>
          <div class="skeleton-cart-actions">
            <div class="skeleton-quantity skeleton-shimmer"></div>
            <div class="skeleton-line skeleton-price skeleton-shimmer"></div>
          </div>
        </div>
      `);
    }
    return skeletons.join('');
  }

  /**
   * Generate table skeleton
   */
  table(rows = 5, columns = 4) {
    const headerCells = Array(columns).fill('<div class="skeleton-line skeleton-shimmer"></div>').join('');
    const bodyRows = [];
    
    for (let i = 0; i < rows; i++) {
      const cells = Array(columns).fill('<div class="skeleton-line skeleton-shimmer"></div>').join('');
      bodyRows.push(`<div class="skeleton-table-row">${cells}</div>`);
    }

    return `
      <div class="skeleton-table">
        <div class="skeleton-table-header">${headerCells}</div>
        <div class="skeleton-table-body">${bodyRows.join('')}</div>
      </div>
    `;
  }

  /**
   * Generate form skeleton
   */
  form(fields = 5) {
    const formFields = [];
    for (let i = 0; i < fields; i++) {
      formFields.push(`
        <div class="skeleton-form-field">
          <div class="skeleton-line skeleton-label skeleton-shimmer"></div>
          <div class="skeleton-input skeleton-shimmer"></div>
        </div>
      `);
    }

    return `
      <div class="skeleton-form">
        ${formFields.join('')}
        <div class="skeleton-button large skeleton-shimmer"></div>
      </div>
    `;
  }

  /**
   * Generate list skeleton
   */
  list(items = 5, hasImage = false) {
    const listItems = [];
    for (let i = 0; i < items; i++) {
      listItems.push(`
        <div class="skeleton-list-item">
          ${hasImage ? '<div class="skeleton-image tiny skeleton-shimmer"></div>' : ''}
          <div class="skeleton-list-content">
            <div class="skeleton-line skeleton-shimmer"></div>
            <div class="skeleton-line short skeleton-shimmer"></div>
          </div>
        </div>
      `);
    }
    return `<div class="skeleton-list">${listItems.join('')}</div>`;
  }

  /**
   * Generate text skeleton
   */
  text(lines = 3, width = 'full') {
    const textLines = [];
    for (let i = 0; i < lines; i++) {
      const lineWidth = i === lines - 1 ? 'short' : width;
      textLines.push(`<div class="skeleton-line skeleton-shimmer ${lineWidth}"></div>`);
    }
    return `<div class="skeleton-text-block">${textLines.join('')}</div>`;
  }

  /**
   * Generate profile skeleton
   */
  profile() {
    return `
      <div class="skeleton-profile">
        <div class="skeleton-avatar skeleton-shimmer"></div>
        <div class="skeleton-profile-info">
          <div class="skeleton-line skeleton-title skeleton-shimmer"></div>
          <div class="skeleton-line skeleton-text skeleton-shimmer"></div>
          <div class="skeleton-line skeleton-text short skeleton-shimmer"></div>
        </div>
      </div>
    `;
  }

  /**
   * Generate image skeleton
   */
  image(aspectRatio = '16/9') {
    return `
      <div class="skeleton-image-wrapper" style="aspect-ratio: ${aspectRatio};">
        <div class="skeleton-image-placeholder skeleton-shimmer"></div>
      </div>
    `;
  }

  /**
   * Generate testimonial card skeleton
   */
  testimonial(count = 3) {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      skeletons.push(`
        <div class="skeleton-testimonial">
          <div class="skeleton-testimonial-header">
            <div class="skeleton-avatar small skeleton-shimmer"></div>
            <div class="skeleton-testimonial-info">
              <div class="skeleton-line skeleton-title short skeleton-shimmer"></div>
              <div class="skeleton-rating skeleton-shimmer"></div>
            </div>
          </div>
          <div class="skeleton-testimonial-body">
            <div class="skeleton-line skeleton-shimmer"></div>
            <div class="skeleton-line skeleton-shimmer"></div>
            <div class="skeleton-line short skeleton-shimmer"></div>
          </div>
        </div>
      `);
    }
    return skeletons.join('');
  }

  /**
   * Show skeleton in container
   */
  show(container, type, options = {}) {
    const element = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;

    if (!element) {
      console.warn('Skeleton container not found:', container);
      return;
    }

    let skeleton = '';
    switch (type) {
      case 'product-card':
        skeleton = this.productCard(options.count || 1);
        break;
      case 'product-grid':
        skeleton = this.productGrid(options.columns || 4, options.rows || 3);
        break;
      case 'cart-item':
        skeleton = this.cartItem(options.count || 3);
        break;
      case 'table':
        skeleton = this.table(options.rows || 5, options.columns || 4);
        break;
      case 'form':
        skeleton = this.form(options.fields || 5);
        break;
      case 'list':
        skeleton = this.list(options.items || 5, options.hasImage || false);
        break;
      case 'text':
        skeleton = this.text(options.lines || 3, options.width || 'full');
        break;
      case 'profile':
        skeleton = this.profile();
        break;
      case 'image':
        skeleton = this.image(options.aspectRatio || '16/9');
        break;
      case 'testimonial':
        skeleton = this.testimonial(options.count || 3);
        break;
      default:
        console.warn('Unknown skeleton type:', type);
        return;
    }

    element.innerHTML = skeleton;
    element.classList.add('skeleton-container');
  }

  /**
   * Hide skeleton and show content
   */
  hide(container) {
    const element = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;

    if (element) {
      element.classList.remove('skeleton-container');
    }
  }

  /**
   * Replace skeleton with content
   */
  replace(container, content) {
    const element = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;

    if (!element) return;

    // Fade out skeleton
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
      element.innerHTML = content;
      element.classList.remove('skeleton-container');
      element.style.opacity = '1';
    }, 300);
  }
}

// Utility functions for common use cases
const SkeletonUtils = {
  /**
   * Show loading state for products
   */
  showProductsLoading(container, count = 12) {
    const skeleton = new SkeletonLoader();
    skeleton.show(container, 'product-grid', { 
      columns: 4, 
      rows: Math.ceil(count / 4) 
    });
  },

  /**
   * Show loading state for cart
   */
  showCartLoading(container, items = 3) {
    const skeleton = new SkeletonLoader();
    skeleton.show(container, 'cart-item', { count: items });
  },

  /**
   * Show loading state for form
   */
  showFormLoading(container, fields = 5) {
    const skeleton = new SkeletonLoader();
    skeleton.show(container, 'form', { fields });
  },

  /**
   * Show loading state for table
   */
  showTableLoading(container, rows = 5, columns = 4) {
    const skeleton = new SkeletonLoader();
    skeleton.show(container, 'table', { rows, columns });
  },

  /**
   * Show loading state for text content
   */
  showTextLoading(container, lines = 3) {
    const skeleton = new SkeletonLoader();
    skeleton.show(container, 'text', { lines });
  },

  /**
   * Generic loader with custom HTML
   */
  showCustomLoading(container, html) {
    const element = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;

    if (element) {
      element.innerHTML = html;
      element.classList.add('skeleton-container');
    }
  },

  /**
   * Hide all skeletons
   */
  hideAll() {
    document.querySelectorAll('.skeleton-container').forEach(el => {
      el.classList.remove('skeleton-container');
    });
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SkeletonLoader, SkeletonUtils };
}

// Global access
window.SkeletonLoader = SkeletonLoader;
window.SkeletonUtils = SkeletonUtils;
