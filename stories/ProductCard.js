import './product-card.css';

export const createProductCard = ({
  image = 'https://via.placeholder.com/300x300',
  title = 'Arreglo Floral',
  description = 'Hermoso arreglo de rosas',
  price = 25000,
  discount = 0,
  onAddToCart,
  onViewDetails,
}) => {
  const card = document.createElement('div');
  card.className = 'product-card';

  const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(finalPrice);

  const formattedOriginalPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);

  card.innerHTML = `
    ${discount > 0 ? `<div class="product-card__badge">-${discount}%</div>` : ''}
    <div class="product-card__image">
      <img src="${image}" alt="${title}" />
    </div>
    <div class="product-card__content">
      <h3 class="product-card__title">${title}</h3>
      <p class="product-card__description">${description}</p>
      <div class="product-card__footer">
        <div class="product-card__price">
          ${discount > 0 ? `<span class="product-card__original-price">${formattedOriginalPrice}</span>` : ''}
          <span class="product-card__final-price">${formattedPrice}</span>
        </div>
        <div class="product-card__actions">
          <button class="product-card__btn product-card__btn--view">Ver Detalles</button>
          <button class="product-card__btn product-card__btn--cart">🛒 Agregar</button>
        </div>
      </div>
    </div>
  `;

  if (onViewDetails) {
    card.querySelector('.product-card__btn--view').addEventListener('click', onViewDetails);
  }

  if (onAddToCart) {
    card.querySelector('.product-card__btn--cart').addEventListener('click', onAddToCart);
  }

  return card;
};
