/**
 * Skeleton Loaders para productos
 * Muestra placeholders animados mientras se cargan los productos
 */

/**
 * Genera un skeleton loader para una tarjeta de producto
 */
export function renderProductSkeleton() {
  return `
    <div class="product-skeleton">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-category"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-title short"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-tags">
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
        </div>
        <div class="skeleton-price"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>
  `;
}

/**
 * Renderiza múltiples skeleton loaders
 */
export function renderProductSkeletons(count = 12) {
  const skeletons = Array(count)
    .fill(null)
    .map(() => renderProductSkeleton())
    .join('');
  
  return `<div class="products-skeleton-grid">${skeletons}</div>`;
}

/**
 * Muestra skeleton loaders en un contenedor
 */
export function showSkeletonLoaders(container, count = 12) {
  if (!container) return;
  container.innerHTML = renderProductSkeletons(count);
}

// Inyectar estilos para skeleton loaders
const injectStyles = () => {
  if (document.getElementById('skeleton-loader-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'skeleton-loader-styles';
  style.textContent = `
    /* Grid para skeletons */
    .products-skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    
    /* Skeleton card */
    .product-skeleton {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Animación shimmer */
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    
    /* Elementos skeleton base */
    .product-skeleton > div,
    .product-skeleton .skeleton-content > div {
      background: linear-gradient(
        90deg,
        #f0f0f0 0px,
        #f8f8f8 40px,
        #f0f0f0 80px
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite linear;
      border-radius: 4px;
    }
    
    /* Imagen skeleton */
    .skeleton-image {
      width: 100%;
      height: 320px;
      background: linear-gradient(
        90deg,
        #e0e0e0 0px,
        #f0f0f0 40px,
        #e0e0e0 80px
      ) !important;
      background-size: 1000px 100% !important;
    }
    
    /* Contenido skeleton */
    .skeleton-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    /* Categoría */
    .skeleton-category {
      width: 40%;
      height: 14px;
    }
    
    /* Título */
    .skeleton-title {
      width: 90%;
      height: 20px;
    }
    
    .skeleton-title.short {
      width: 60%;
    }
    
    /* Descripción */
    .skeleton-description {
      width: 100%;
      height: 12px;
      margin-top: 0.25rem;
    }
    
    /* Tags */
    .skeleton-tags {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .skeleton-tag {
      width: 80px;
      height: 24px;
      border-radius: 12px;
    }
    
    /* Precio */
    .skeleton-price {
      width: 50%;
      height: 28px;
      margin-top: 0.5rem;
    }
    
    /* Botón */
    .skeleton-button {
      width: 100%;
      height: 48px;
      margin-top: 1rem;
      border-radius: 8px;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .products-skeleton-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.5rem;
      }
      
      .skeleton-image {
        height: 280px;
      }
    }
    
    @media (max-width: 480px) {
      .products-skeleton-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .skeleton-image {
        height: 240px;
      }
    }
    
    /* Variación de velocidad para algunos elementos */
    .skeleton-image {
      animation-duration: 2.5s;
    }
    
    .skeleton-title,
    .skeleton-category {
      animation-duration: 1.8s;
    }
    
    .skeleton-button {
      animation-duration: 2.2s;
    }
    
    /* Prevenir flash de skeleton en carga rápida */
    .products-skeleton-grid {
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;
  
  document.head.appendChild(style);
};

// Inyectar estilos cuando se cargue el módulo
if (typeof document !== 'undefined') {
  injectStyles();
}
