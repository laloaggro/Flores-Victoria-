const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Servicio para generar imágenes basadas en el nombre del producto
 */
class ImageGenerationService {
  constructor() {
    // Aquí podrías configurar tu API key y endpoint
    this.apiKey = process.env.IMAGE_GENERATION_API_KEY || '';
    this.apiEndpoint = process.env.IMAGE_GENERATION_ENDPOINT || '';
  }

  /**
   * Generar una imagen basada en el nombre del producto
   * @param {string} productName - Nombre del producto
   * @param {string} productId - ID del producto (para nombrar el archivo)
   * @returns {Promise<string>} - Ruta de la imagen generada
   */
  async generateImageForProduct(productName, productId) {
    try {
      // Crear el prompt para la generación de imagen
      const prompt = `Arreglo floral de ${productName}, fotografía profesional, alta calidad, fondo blanco`;
      
      // En un entorno real, aquí harías la llamada a la API
      // const response = await axios.post(this.apiEndpoint, {
      //   prompt: prompt,
      //   n: 1,
      //   size: "512x512"
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Por ahora, simulamos la generación de imagen
      console.log(`Generando imagen para: ${productName}`);
      
      // Crear directorio si no existe
      const imagesDir = path.join(__dirname, '../assets/images/products');
      try {
        await fs.access(imagesDir);
      } catch (error) {
        await fs.mkdir(imagesDir, { recursive: true });
      }
      
      // En una implementación real, aquí guardarías la imagen recibida de la API
      // Por ahora, creamos un archivo de marcador de posición
      const imagePath = path.join(imagesDir, `${productId}.jpg`);
      
      // Simular la creación de una imagen (en realidad solo creamos un archivo vacío)
      await fs.writeFile(imagePath, '', 'binary');
      
      // Devolver la ruta relativa para acceder desde el frontend
      return `/assets/images/products/${productId}.jpg`;
    } catch (error) {
      console.error('Error generando imagen:', error);
      throw error;
    }
  }
  
  /**
   * Generar imágenes para múltiples productos
   * @param {Array} products - Array de productos
   * @returns {Promise<Array>} - Array con las rutas de las imágenes generadas
   */
  async generateImagesForProducts(products) {
    const imagePaths = [];
    
    for (const product of products) {
      try {
        const imagePath = await this.generateImageForProduct(product.name, product.id);
        imagePaths.push({
          productId: product.id,
          imagePath: imagePath
        });
      } catch (error) {
        console.error(`Error generando imagen para producto ${product.id}:`, error);
        imagePaths.push({
          productId: product.id,
          imagePath: null,
          error: error.message
        });
      }
    }
    
    return imagePaths;
  }
}

module.exports = new ImageGenerationService();