/**
 * WebAssembly Image Processing Manager - Flores Victoria
 * High-performance image processing integration
 * Open Source Project - MIT License
 */

class FloresVictoriaWASMProcessor {
  constructor() {
    this.module = null;
    this.isInitialized = false;
    this.maxImageSize = 4096 * 4096 * 4; // 64MB max
    this.processingQueue = [];
    this.isProcessing = false;

    this.performanceMetrics = {
      totalOperations: 0,
      averageTime: 0,
      operationTimes: [],
    };

    this.supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
    this.init();
  }

  async init() {
    try {
      // Wait for WASM module to load
      await this.waitForWASM();

      // Initialize the processor with max size
      const success = this.module.initImageProcessor(this.maxImageSize);
      if (!success) {
        throw new Error('Failed to initialize WASM image processor');
      }

      this.isInitialized = true;
      console.log('Flores Victoria WASM Image Processor initialized successfully');

      // Process any queued operations
      this.processQueue();
    } catch (error) {
      console.error('WASM Processor initialization failed:', error);
      throw error;
    }
  }

  waitForWASM() {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.FloresVictoriaWASM) {
        this.module = window.FloresVictoriaWASM;
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('WASM module loading timeout'));
      }, 10000);

      const checkWASM = () => {
        if (typeof window !== 'undefined' && window.FloresVictoriaWASM) {
          clearTimeout(timeout);
          this.module = window.FloresVictoriaWASM;
          resolve();
        } else {
          setTimeout(checkWASM, 100);
        }
      };

      checkWASM();
    });
  }

  async processImage(imageData, operations) {
    if (!this.isInitialized) {
      return new Promise((resolve, reject) => {
        this.processingQueue.push({ imageData, operations, resolve, reject });
      });
    }

    return this.executeProcessing(imageData, operations);
  }

  async executeProcessing(imageData, operations) {
    const startTime = performance.now();

    try {
      this.isProcessing = true;

      // Validate input
      if (!this.validateImageData(imageData)) {
        throw new Error('Invalid image data provided');
      }

      // Copy image data to WASM memory
      const inputBuffer = this.copyToWASM(imageData);
      if (!inputBuffer) {
        throw new Error('Failed to copy image data to WASM memory');
      }

      // Process each operation
      let currentWidth = imageData.width;
      let currentHeight = imageData.height;
      const channels = imageData.channels || 4;

      for (const operation of operations) {
        const result = await this.executeOperation(
          operation,
          currentWidth,
          currentHeight,
          channels
        );
        if (!result.success) {
          throw new Error(`Operation ${operation.type} failed: ${result.error}`);
        }

        // Update dimensions if they changed
        if (result.width) currentWidth = result.width;
        if (result.height) currentHeight = result.height;

        // Swap buffers for next operation
        this.swapBuffers();
      }

      // Copy result back from WASM
      const resultData = this.copyFromWASM(currentWidth, currentHeight, channels);

      // Update performance metrics
      const processingTime = performance.now() - startTime;
      this.updatePerformanceMetrics(processingTime);

      return {
        success: true,
        data: resultData,
        width: currentWidth,
        height: currentHeight,
        channels,
        processingTime,
        operations: operations.length,
      };
    } catch (error) {
      console.error('WASM image processing failed:', error);
      return {
        success: false,
        error: error.message,
        processingTime: performance.now() - startTime,
      };
    } finally {
      this.isProcessing = false;
    }
  }

  async executeOperation(operation, width, height, channels) {
    try {
      switch (operation.type) {
        case 'resize':
          return this.resize(width, height, operation.width, operation.height, channels);

        case 'filters':
          return this.applyFilters(width, height, channels, operation.filters);

        case 'crop':
          return this.crop(width, height, channels, operation.cropArea);

        case 'edges':
          return this.detectEdges(width, height, channels, operation.threshold);

        case 'equalize':
          return this.equalizeHistogram(width, height, channels);

        case 'blur':
          return this.applyBlur(width, height, channels, operation.radius);

        case 'temperature':
          return this.adjustColorTemperature(width, height, channels, operation.temperature);

        default:
          return { success: false, error: `Unknown operation: ${operation.type}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  resize(srcWidth, srcHeight, dstWidth, dstHeight, channels) {
    const result = this.module.resizeImage(srcWidth, srcHeight, dstWidth, dstHeight, channels);

    return {
      success: result === 1,
      width: dstWidth,
      height: dstHeight,
      error: result !== 1 ? 'Resize operation failed' : null,
    };
  }

  applyFilters(width, height, channels, filters) {
    const { brightness = 0, contrast = 1, saturation = 1, sharpness = 0, gamma = 1 } = filters;

    const result = this.module.applyFilters(
      width,
      height,
      channels,
      brightness,
      contrast,
      saturation,
      sharpness,
      gamma
    );

    return {
      success: result === 1,
      error: result !== 1 ? 'Filters application failed' : null,
    };
  }

  crop(width, height, channels, cropArea) {
    const { x, y, width: cropWidth, height: cropHeight } = cropArea;

    const result = this.module.cropImage(width, height, channels, x, y, cropWidth, cropHeight);

    return {
      success: result === 1,
      width: cropWidth,
      height: cropHeight,
      error: result !== 1 ? 'Crop operation failed' : null,
    };
  }

  detectEdges(width, height, channels, threshold = 50) {
    const result = this.module.detectEdges(width, height, channels, threshold);

    return {
      success: result === 1,
      error: result !== 1 ? 'Edge detection failed' : null,
    };
  }

  equalizeHistogram(width, height, channels) {
    const result = this.module.equalizeHistogram(width, height, channels);

    return {
      success: result === 1,
      error: result !== 1 ? 'Histogram equalization failed' : null,
    };
  }

  applyBlur(width, height, channels, radius = 2) {
    const result = this.module.applyBlur(width, height, channels, radius);

    return {
      success: result === 1,
      error: result !== 1 ? 'Blur operation failed' : null,
    };
  }

  adjustColorTemperature(width, height, channels, temperature = 5000) {
    const result = this.module.adjustColorTemperature(width, height, channels, temperature);

    return {
      success: result === 1,
      error: result !== 1 ? 'Color temperature adjustment failed' : null,
    };
  }

  validateImageData(imageData) {
    if (!imageData || typeof imageData !== 'object') {
      return false;
    }

    const { data, width, height } = imageData;
    if (!data || !width || !height) {
      return false;
    }

    if (width <= 0 || height <= 0 || width > 4096 || height > 4096) {
      return false;
    }

    const expectedSize = width * height * (imageData.channels || 4);
    if (data.length !== expectedSize) {
      return false;
    }

    return true;
  }

  copyToWASM(imageData) {
    try {
      const inputPtr = this.module.getInputBuffer();
      if (!inputPtr) {
        throw new Error('Failed to get WASM input buffer');
      }

      const inputBuffer = new Uint8Array(
        this.module.HEAPU8.buffer,
        inputPtr,
        imageData.data.length
      );
      inputBuffer.set(imageData.data);

      return inputPtr;
    } catch (error) {
      console.error('Failed to copy data to WASM:', error);
      return null;
    }
  }

  copyFromWASM(width, height, channels) {
    try {
      const outputPtr = this.module.getOutputBuffer();
      if (!outputPtr) {
        throw new Error('Failed to get WASM output buffer');
      }

      const dataSize = width * height * channels;
      const outputBuffer = new Uint8Array(this.module.HEAPU8.buffer, outputPtr, dataSize);

      // Create a copy of the data
      const resultData = new Uint8Array(dataSize);
      resultData.set(outputBuffer);

      return {
        data: resultData,
        width,
        height,
        channels,
      };
    } catch (error) {
      console.error('Failed to copy data from WASM:', error);
      return null;
    }
  }

  swapBuffers() {
    // In a real implementation, we would swap input/output buffers
    // For simplicity, we copy output to input
    try {
      const inputPtr = this.module.getInputBuffer();
      const outputPtr = this.module.getOutputBuffer();

      if (inputPtr && outputPtr) {
        const bufferSize = this.maxImageSize;
        const inputBuffer = new Uint8Array(this.module.HEAPU8.buffer, inputPtr, bufferSize);
        const outputBuffer = new Uint8Array(this.module.HEAPU8.buffer, outputPtr, bufferSize);

        inputBuffer.set(outputBuffer);
      }
    } catch (error) {
      console.error('Failed to swap buffers:', error);
    }
  }

  updatePerformanceMetrics(processingTime) {
    this.performanceMetrics.totalOperations++;
    this.performanceMetrics.operationTimes.push(processingTime);

    // Keep only last 100 operations for average calculation
    if (this.performanceMetrics.operationTimes.length > 100) {
      this.performanceMetrics.operationTimes.shift();
    }

    // Calculate new average
    const sum = this.performanceMetrics.operationTimes.reduce((a, b) => a + b, 0);
    this.performanceMetrics.averageTime = sum / this.performanceMetrics.operationTimes.length;
  }

  processQueue() {
    if (this.processingQueue.length === 0) return;

    const { imageData, operations, resolve, reject } = this.processingQueue.shift();

    this.executeProcessing(imageData, operations)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        // Process next item in queue
        if (this.processingQueue.length > 0 && !this.isProcessing) {
          setTimeout(() => this.processQueue(), 0);
        }
      });
  }

  // Utility methods for common operations
  async optimizeForWeb(imageData, maxWidth = 1920, quality = 0.85) {
    const operations = [];

    // Resize if too large
    if (imageData.width > maxWidth) {
      const aspectRatio = imageData.height / imageData.width;
      operations.push({
        type: 'resize',
        width: maxWidth,
        height: Math.round(maxWidth * aspectRatio),
      });
    }

    // Apply web optimization filters
    operations.push({
      type: 'filters',
      filters: {
        contrast: 1.05,
        saturation: 1.1,
        sharpness: 0.2,
      },
    });

    return this.processImage(imageData, operations);
  }

  async createThumbnail(imageData, size = 300) {
    const operations = [
      {
        type: 'resize',
        width: size,
        height: size,
      },
      {
        type: 'filters',
        filters: {
          sharpness: 0.3,
          contrast: 1.1,
        },
      },
    ];

    return this.processImage(imageData, operations);
  }

  async enhanceProduct(imageData) {
    const operations = [
      {
        type: 'filters',
        filters: {
          brightness: 0.05,
          contrast: 1.15,
          saturation: 1.2,
          sharpness: 0.3,
        },
      },
      {
        type: 'equalize',
      },
    ];

    return this.processImage(imageData, operations);
  }

  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  isSupported() {
    return typeof WebAssembly !== 'undefined' && typeof WebAssembly.instantiate === 'function';
  }

  cleanup() {
    if (this.module && this.module.cleanupProcessor) {
      this.module.cleanupProcessor();
    }
    this.isInitialized = false;
    this.processingQueue = [];
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloresVictoriaWASMProcessor;
} else if (typeof window !== 'undefined') {
  window.FloresVictoriaWASMProcessor = FloresVictoriaWASMProcessor;
}

// Auto-initialize global instance
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (!window.floresVictoriaWASM) {
      window.floresVictoriaWASM = new FloresVictoriaWASMProcessor();
    }
  });
}
