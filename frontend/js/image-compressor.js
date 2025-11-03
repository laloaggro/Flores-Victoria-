/**
 * 🖼️ IMAGE COMPRESSOR
 * Comprime imágenes del lado del cliente antes de cargar
 * Mejora: Reducción de peso de imágenes subidas por usuarios
 */

class ImageCompressor {
  constructor(options = {}) {
    this.maxWidth = options.maxWidth || 1920;
    this.maxHeight = options.maxHeight || 1080;
    this.quality = options.quality || 0.85;
    this.outputFormat = options.outputFormat || 'image/jpeg';
  }

  /**
   * Comprime una imagen File
   * @param {File} file - Archivo de imagen
   * @returns {Promise<Blob>} - Imagen comprimida
   */
  async compress(file) {
    return new Promise((resolve, reject) => {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        reject(new Error('El archivo debe ser una imagen'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          try {
            const compressed = this._compressImage(img);
            resolve(compressed);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('Error al cargar la imagen'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Comprime la imagen usando Canvas
   * @private
   */
  _compressImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calcular dimensiones manteniendo aspect ratio
    const { width, height } = this._calculateDimensions(img.width, img.height);

    canvas.width = width;
    canvas.height = height;

    // Dibujar imagen redimensionada
    ctx.drawImage(img, 0, 0, width, height);

    // Convertir a Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Error al comprimir la imagen'));
          }
        },
        this.outputFormat,
        this.quality
      );
    });
  }

  /**
   * Calcula dimensiones manteniendo aspect ratio
   * @private
   */
  _calculateDimensions(width, height) {
    if (width <= this.maxWidth && height <= this.maxHeight) {
      return { width, height };
    }

    const ratio = Math.min(this.maxWidth / width, this.maxHeight / height);

    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio),
    };
  }

  /**
   * Obtiene información de la imagen original vs comprimida
   */
  async getCompressionInfo(originalFile, compressedBlob) {
    const originalSize = originalFile.size;
    const compressedSize = compressedBlob.size;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    return {
      originalSize: this._formatBytes(originalSize),
      compressedSize: this._formatBytes(compressedSize),
      reduction: `${reduction}%`,
      originalDimensions: await this._getImageDimensions(originalFile),
      compressedDimensions: await this._getImageDimensions(compressedBlob),
    };
  }

  /**
   * Formatea bytes a formato legible
   * @private
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Obtiene dimensiones de una imagen
   * @private
   */
  async _getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(`${img.width}x${img.height}`);
      };

      img.src = url;
    });
  }
}

// Uso automático en formularios con input[type="file"]
document.addEventListener('DOMContentLoaded', () => {
  const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');

  fileInputs.forEach((input) => {
    // Solo agregar si no está marcado explícitamente para no comprimir
    if (!input.dataset.noCompress) {
      input.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const compressor = new ImageCompressor({
          maxWidth: parseInt(input.dataset.maxWidth) || 1920,
          maxHeight: parseInt(input.dataset.maxHeight) || 1080,
          quality: parseFloat(input.dataset.quality) || 0.85,
        });

        try {
          // Comprimir todas las imágenes
          const compressed = await Promise.all(files.map((file) => compressor.compress(file)));

          // Mostrar información (solo en desarrollo)
          if (window.location.hostname === 'localhost') {
            for (let i = 0; i < files.length; i++) {
              const info = await compressor.getCompressionInfo(files[i], compressed[i]);
              console.log('📸 Compresión de imagen:', info);
            }
          }

          // Crear nuevos archivos File
          const compressedFiles = compressed.map(
            (blob, i) =>
              new File([blob], files[i].name, {
                type: blob.type,
                lastModified: Date.now(),
              })
          );

          // Crear DataTransfer para actualizar input
          const dt = new DataTransfer();
          compressedFiles.forEach((file) => dt.items.add(file));
          input.files = dt.files;

          // Disparar evento de cambio
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (error) {
          console.error('❌ Error al comprimir imágenes:', error);
        }
      });
    }
  });
});

// Exportar para uso manual
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageCompressor;
}
