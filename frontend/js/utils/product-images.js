/**
 * Utilidad para obtener la imagen del producto con marca de agua
 * Prioriza imágenes AI-generadas, luego watermarked, luego originales
 */

export function getProductImageUrl(product) {
  if (!product || !product.id) {
    return '/images/placeholder.jpg';
  }

  // Prioridad 1: Imagen final (AI-generada o watermarked)
  const finalImageUrl = `/images/products/final/${product.id}.png`;
  
  // Prioridad 2: Primera imagen del array images (si existe)
  const fallbackImageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/images/placeholder.jpg';
  
  return finalImageUrl;
}

export function getProductImageUrls(product) {
  if (!product || !product.id) {
    return ['/images/placeholder.jpg'];
  }

  // Siempre incluir la imagen final como primera opción
  const urls = [`/images/products/final/${product.id}.png`];
  
  // Agregar imágenes adicionales del array si existen
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
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
