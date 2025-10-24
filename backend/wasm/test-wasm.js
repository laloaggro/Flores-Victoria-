/**
 * WebAssembly Test Suite - Flores Victoria
 * Comprehensive testing for WASM image processing
 */

const fs = require('fs');
const path = require('path');

// Mock WebAssembly module for testing
class MockWASMModule {
  constructor() {
    this.HEAPU8 = { buffer: new ArrayBuffer(1024 * 1024) };
    this.inputBuffer = new Uint8Array(256 * 256 * 4);
    this.outputBuffer = new Uint8Array(256 * 256 * 4);
  }

  cwrap() {
    return () => 1; // Mock success
  }

  initImageProcessor() {
    return 1;
  }

  getInputBuffer() {
    return this.inputBuffer.byteOffset;
  }

  getOutputBuffer() {
    return this.outputBuffer.byteOffset;
  }

  cleanupProcessor() {
    return 1;
  }

  resizeImage() {
    return 1;
  }

  applyFilters() {
    return 1;
  }

  cropImage() {
    return 1;
  }

  detectEdges() {
    return 1;
  }

  equalizeHistogram() {
    return 1;
  }

  applyBlur() {
    return 1;
  }

  adjustColorTemperature() {
    return 1;
  }
}

// Test utilities
class WASMTestUtils {
  static createTestImage(width = 256, height = 256, channels = 4) {
    const data = new Uint8Array(width * height * channels);

    // Create a simple gradient pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        data[idx] = (x / width) * 255; // Red gradient
        data[idx + 1] = (y / height) * 255; // Green gradient
        data[idx + 2] = 128; // Blue constant
        if (channels === 4) {
          data[idx + 3] = 255; // Alpha
        }
      }
    }

    return {
      data: data,
      width: width,
      height: height,
      channels: channels,
    };
  }

  static compareImages(img1, img2, tolerance = 0) {
    if (
      img1.width !== img2.width ||
      img1.height !== img2.height ||
      img1.channels !== img2.channels
    ) {
      return false;
    }

    for (let i = 0; i < img1.data.length; i++) {
      if (Math.abs(img1.data[i] - img2.data[i]) > tolerance) {
        return false;
      }
    }

    return true;
  }

  static calculateMSE(img1, img2) {
    if (img1.data.length !== img2.data.length) {
      throw new Error('Images must have same dimensions');
    }

    let mse = 0;
    for (let i = 0; i < img1.data.length; i++) {
      const diff = img1.data[i] - img2.data[i];
      mse += diff * diff;
    }

    return mse / img1.data.length;
  }

  static async measurePerformance(fn, iterations = 100) {
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }

    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    return { average, min, max, times };
  }
}

// Test suite
class WASMTestSuite {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      errors: [],
    };
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('Starting WASM Test Suite...\n');

    for (const test of this.tests) {
      try {
        console.log(`Running: ${test.name}`);
        await test.testFn();
        console.log('✅ PASSED\n');
        this.results.passed++;
      } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        this.results.failed++;
        this.results.errors.push({
          test: test.name,
          error: error.message,
        });
      }
      this.results.total++;
    }

    this.printResults();
  }

  printResults() {
    console.log('='.repeat(50));
    console.log('TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);

    if (this.results.errors.length > 0) {
      console.log('\nFAILED TESTS:');
      this.results.errors.forEach(({ test, error }) => {
        console.log(`- ${test}: ${error}`);
      });
    }
  }
}

// Mock FloresVictoriaWASMProcessor for testing
const FloresVictoriaWASMProcessor = require('./wasm-processor.js');

// Initialize test suite
const testSuite = new WASMTestSuite();

// Test 1: Basic initialization
testSuite.addTest('WASM Processor Initialization', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();
  await processor.init();

  if (!processor.isInitialized) {
    throw new Error('Processor should be initialized');
  }
});

// Test 2: Image validation
testSuite.addTest('Image Validation', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();
  await processor.init();

  // Valid image
  const validImage = WASMTestUtils.createTestImage(256, 256, 4);
  if (!processor.validateImageData(validImage)) {
    throw new Error('Valid image should pass validation');
  }

  // Invalid image - no data
  const invalidImage1 = { width: 256, height: 256 };
  if (processor.validateImageData(invalidImage1)) {
    throw new Error('Image without data should fail validation');
  }

  // Invalid image - wrong dimensions
  const invalidImage2 = {
    data: new Uint8Array(100),
    width: 10,
    height: 10,
    channels: 4,
  };
  if (processor.validateImageData(invalidImage2)) {
    throw new Error('Image with wrong data size should fail validation');
  }
});

// Test 3: Resize operation
testSuite.addTest('Resize Operation', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();
  await processor.init();

  const testImage = WASMTestUtils.createTestImage(256, 256, 4);
  const operations = [
    {
      type: 'resize',
      width: 128,
      height: 128,
    },
  ];

  const result = await processor.processImage(testImage, operations);

  if (!result.success) {
    throw new Error(`Resize operation failed: ${result.error}`);
  }

  if (result.width !== 128 || result.height !== 128) {
    throw new Error(`Expected dimensions 128x128, got ${result.width}x${result.height}`);
  }
});

// Test 4: Filter operations
testSuite.addTest('Filter Operations', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();
  await processor.init();

  const testImage = WASMTestUtils.createTestImage(256, 256, 4);
  const operations = [
    {
      type: 'filters',
      filters: {
        brightness: 0.1,
        contrast: 1.2,
        saturation: 1.1,
        sharpness: 0.2,
        gamma: 1.1,
      },
    },
  ];

  const result = await processor.processImage(testImage, operations);

  if (!result.success) {
    throw new Error(`Filter operation failed: ${result.error}`);
  }
});

// Test 5: Multiple operations chain
testSuite.addTest('Multiple Operations Chain', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();
  await processor.init();

  const testImage = WASMTestUtils.createTestImage(512, 512, 4);
  const operations = [
    {
      type: 'resize',
      width: 256,
      height: 256,
    },
    {
      type: 'filters',
      filters: {
        brightness: 0.05,
        contrast: 1.1,
      },
    },
    {
      type: 'blur',
      radius: 2,
    },
  ];

  const result = await processor.processImage(testImage, operations);

  if (!result.success) {
    throw new Error(`Multiple operations chain failed: ${result.error}`);
  }

  if (result.operations !== 3) {
    throw new Error(`Expected 3 operations, got ${result.operations}`);
  }
});

// Test 6: Performance metrics
testSuite.addTest('Performance Metrics', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();
  await processor.init();

  const testImage = WASMTestUtils.createTestImage(256, 256, 4);
  const operations = [{ type: 'blur', radius: 1 }];

  // Process multiple images to generate metrics
  for (let i = 0; i < 5; i++) {
    await processor.processImage(testImage, operations);
  }

  const metrics = processor.getPerformanceMetrics();

  if (metrics.totalOperations !== 5) {
    throw new Error(`Expected 5 operations, got ${metrics.totalOperations}`);
  }

  if (metrics.averageTime <= 0) {
    throw new Error('Average time should be greater than 0');
  }

  if (metrics.operationTimes.length !== 5) {
    throw new Error(`Expected 5 operation times, got ${metrics.operationTimes.length}`);
  }
});

// Test 7: Utility functions
testSuite.addTest('Utility Functions', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();
  await processor.init();

  const testImage = WASMTestUtils.createTestImage(2048, 1536, 4);

  // Test web optimization
  const webResult = await processor.optimizeForWeb(testImage, 1920, 0.85);
  if (!webResult.success) {
    throw new Error('Web optimization failed');
  }

  // Test thumbnail creation
  const thumbResult = await processor.createThumbnail(testImage, 300);
  if (!thumbResult.success) {
    throw new Error('Thumbnail creation failed');
  }

  // Test product enhancement
  const enhanceResult = await processor.enhanceProduct(testImage);
  if (!enhanceResult.success) {
    throw new Error('Product enhancement failed');
  }
});

// Test 8: Error handling
testSuite.addTest('Error Handling', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();
  await processor.init();

  // Test invalid operation
  const testImage = WASMTestUtils.createTestImage(256, 256, 4);
  const invalidOperations = [
    {
      type: 'invalid_operation',
      param: 'test',
    },
  ];

  const result = await processor.processImage(testImage, invalidOperations);

  if (result.success) {
    throw new Error('Invalid operation should fail');
  }

  if (!result.error.includes('Unknown operation')) {
    throw new Error('Should report unknown operation error');
  }
});

// Test 9: Memory management
testSuite.addTest('Memory Management', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();
  await processor.init();

  // Test cleanup
  processor.cleanup();

  if (processor.isInitialized) {
    throw new Error('Processor should not be initialized after cleanup');
  }

  if (processor.processingQueue.length !== 0) {
    throw new Error('Processing queue should be empty after cleanup');
  }
});

// Test 10: Browser support detection
testSuite.addTest('Browser Support Detection', async () => {
  global.window = {
    FloresVictoriaWASM: new MockWASMModule(),
    addEventListener: () => {},
  };
  global.WebAssembly = {
    instantiate: () => {},
  };

  const processor = new FloresVictoriaWASMProcessor();

  if (!processor.isSupported()) {
    throw new Error('Should detect WebAssembly support');
  }

  // Test without WebAssembly
  delete global.WebAssembly;
  if (processor.isSupported()) {
    throw new Error('Should detect lack of WebAssembly support');
  }
});

// Run the test suite
if (require.main === module) {
  // Set up Node.js globals to simulate browser environment
  global.performance = {
    now: () => Date.now(),
  };

  testSuite
    .runTests()
    .then(() => {
      process.exit(testSuite.results.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  WASMTestSuite,
  WASMTestUtils,
  MockWASMModule,
};
