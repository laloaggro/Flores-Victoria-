const fs = require('fs');

// Mapeo de productos a imágenes AI disponibles
const imageMapping = {
  'GRD001': ['/images/productos/victoria-graduacion-001-v3.webp', '/images/productos/victoria-girasoles-001-v3.webp'],
  'GRD002': ['/images/productos/victoria-rosas-001-v3.webp', '/images/productos/orquidea-elegante-1.webp'],
  'BBY001': ['/images/productos/victoria-mixtos-001-v3.webp', '/images/productos/alegria-vibrante-1.webp'],
  'BBY002': ['/images/productos/victoria-rosas-001-v3.webp', '/images/productos/elegancia-femenina-1.webp'],
  'BBY003': ['/images/productos/dulce-compania-1.webp', '/images/productos/alegria-vibrante-1.webp'],
  'THX001': ['/images/productos/victoria-margaritas-001-v3.webp', '/images/productos/alegria-vibrante-1.webp'],
  'THX002': ['/images/productos/victoria-gerberas-001-v3.webp', '/images/productos/felicidad-colorida-1.webp'],
  'SYM001': ['/images/productos/victoria-lirios-001-v3.webp', '/images/productos/elegancia-femenina-1.webp'],
  'SYM002': ['/images/productos/victoria-rosas-001-v3.webp', '/images/productos/passion-eterna-1.webp'],
  'CRP001': ['/images/productos/orquidea-elegante-1.webp', '/images/productos/victoria-rosas-001-v3.webp'],
  'CRP002': ['/images/productos/victoria-aniversario-amor-001-v3.webp', '/images/productos/elegancia-femenina-1.webp'],
  'PLT001': ['/images/productos/mini-jardin-suculento-1.webp', '/images/productos/mini-jardin-suculento-2.webp'],
  'PLT002': ['/images/productos/mini-jardin-suculento-1.webp', '/images/productos/mini-jardin-suculento-3.webp'],
  'PLT003': ['/images/productos/mini-jardin-suculento-2.webp', '/images/productos/mini-jardin-suculento-3.webp'],
  'PLT004': ['/images/productos/mini-jardin-suculento-1.webp', '/images/productos/mini-jardin-suculento-2.webp'],
  'PLT005': ['/images/productos/mini-jardin-suculento-2.webp', '/images/productos/mini-jardin-suculento-1.webp'],
  'PRM001': ['/images/productos/passion-eterna-1.webp', '/images/productos/victoria-rosas-001-v3.webp'],
  'PRM002': ['/images/productos/orquidea-elegante-1.webp', '/images/productos/elegancia-femenina-1.webp'],
  'EXO001': ['/images/productos/victoria-mixtos-001-v3.webp', '/images/productos/alegria-vibrante-1.webp'],
  'EXO002': ['/images/productos/victoria-gerberas-001-v3.webp', '/images/productos/alegria-vibrante-2.webp'],
  'SEA001': ['/images/productos/victoria-tulipanes-001-v3.webp', '/images/productos/alegria-vibrante-1.webp'],
  'SEA002': ['/images/productos/victoria-recuperacion-001-v3.webp', '/images/productos/passion-eterna-1.webp'],
  'MIN001': ['/images/productos/victoria-margaritas-001-v3.webp', '/images/productos/felicidad-colorida-1.webp'],
  'MIN002': ['/images/productos/victoria-rosas-001-v3.webp', '/images/productos/passion-eterna-1.webp'],
  'SUS001': ['/images/productos/victoria-mixtos-001-v3.webp', '/images/productos/alegria-vibrante-1.webp'],
  'SUS002': ['/images/productos/victoria-aniversario-amor-001-v3.webp', '/images/productos/elegancia-femenina-1.webp'],
  'KIT001': ['/images/productos/victoria-recuperacion-001-v3.webp', '/images/productos/dulce-compania-1.webp'],
  'KIT002': ['/images/productos/victoria-mixtos-001-v3.webp', '/images/productos/alegria-vibrante-1.webp'],
  'DEC001': ['/images/productos/mini-jardin-suculento-1.webp', '/images/productos/elegancia-femenina-1.webp'],
  'DEC002': ['/images/productos/mini-jardin-suculento-2.webp', '/images/productos/mini-jardin-suculento-3.webp'],
  'VAR001': ['/images/productos/victoria-tulipanes-001-v3.webp', '/images/productos/victoria-tulipanes-007-v3.webp'],
  'VAR002': ['/images/productos/victoria-lirios-001-v3.webp', '/images/productos/elegancia-femenina-1.webp'],
  'VAR003': ['/images/productos/victoria-recuperacion-001-v3.webp', '/images/productos/dulce-compania-1.webp'],
  'VAR004': ['/images/productos/victoria-hortensias-001-v3.webp', '/images/productos/elegancia-femenina-1.webp'],
  'VAR005': ['/images/productos/passion-eterna-1.webp', '/images/productos/victoria-rosas-001-v3.webp'],
  'VAR006': ['/images/productos/victoria-mixtos-001-v3.webp', '/images/productos/alegria-vibrante-1.webp'],
  'VAR007': ['/images/productos/victoria-rosas-001-v3.webp', '/images/productos/elegancia-femenina-1.webp'],
  'VAR008': ['/images/productos/victoria-gerberas-001-v3.webp', '/images/productos/alegria-vibrante-2.webp'],
  'VAR009': ['/images/productos/victoria-rosas-001-v3.webp', '/images/productos/corazon-enamorados-1.webp'],
  'VAR010': ['/images/productos/victoria-recuperacion-001-v3.webp', '/images/productos/alegria-vibrante-1.webp'],
  'VAR011': ['/images/productos/passion-eterna-1.webp', '/images/productos/victoria-rosas-001-v3.webp'],
  'VAR012': ['/images/productos/victoria-aniversario-amor-001-v3.webp', '/images/productos/elegancia-femenina-1.webp'],
  'VAR013': ['/images/productos/victoria-margaritas-001-v3.webp', '/images/productos/felicidad-colorida-1.webp'],
  'VAR014': ['/images/productos/victoria-recuperacion-001-v3.webp', '/images/productos/dulce-compania-1.webp'],
  'VAR015': ['/images/productos/mini-jardin-suculento-1.webp', '/images/productos/mini-jardin-suculento-3.webp'],
  'VAR016': ['/images/productos/victoria-claveles-001-v3.webp', '/images/productos/alegria-vibrante-1.webp'],
};

let content = fs.readFileSync('initial-products.js', 'utf8');

Object.keys(imageMapping).forEach(productId => {
  const images = imageMapping[productId];
  const regex = new RegExp(`(id: '${productId}'[\\s\\S]*?images: \\[)[^\\]]+`, 'g');
  const replacement = `$1\n      '${images[0]}',\n      '${images[1]}',\n    `;
  content = content.replace(regex, replacement);
});

fs.writeFileSync('initial-products-updated.js', content);
console.log('✅ Archivo actualizado con imágenes AI: initial-products-updated.js');
