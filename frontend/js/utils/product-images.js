/**
 * Utilidad para obtener la imagen del producto con marca de agua
 * Prioriza imágenes AI-generadas, luego watermarked, luego originales
 */

export function getProductImageUrl(product) {
  if (!product || !product.id) {
    return '/images/placeholder.jpg';
  }

  // Prioridad 1: Imagen final (AI-generada o watermarked)
  return `/images/products/final/${product.id}.png`;
}

export function getProductImageUrls(product) {
  if (!product || !product.id) {
    return ['/images/placeholder.jpg'];
  }

  // Siempre incluir la imagen final como primera opción
  const urls = [`/images/products/final/${product.id}.png`];

  // Agregar imágenes adicionales del array si existen
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img && !urls.includes(img)) {
        urls.push(img);
      }
    });
  }

  return urls;
}

// Para compatibilidad con código existente
export function getProductImage(product) {
  return getProductImageUrl(product);
}
