/**
 * WebAssembly Pre-JS - Flores Victoria
 * Initialization code executed before WASM module loading
 */

// Global configuration for WASM module
var FloresVictoriaWASMConfig = {
  wasmBinaryFile: 'image-processor.wasm',
  locateFile: function (path, prefix) {
    if (path.endsWith('.wasm')) {
      return '/js/wasm/' + path;
    }
    return prefix + path;
  },
};

// Performance monitoring
var WASMPerformance = {
  operationTimes: {},
  startTime: function (operation) {
    this.operationTimes[operation] = performance.now();
  },
  endTime: function (operation) {
    if (this.operationTimes[operation]) {
      var duration = performance.now() - this.operationTimes[operation];
      console.log(`WASM ${operation} completed in ${duration.toFixed(2)}ms`);
      delete this.operationTimes[operation];
      return duration;
    }
    return 0;
  },
};

// Memory management helpers
var WASMMemoryManager = {
  allocatedPointers: new Set(),

  trackAllocation: function (ptr) {
    if (ptr) {
      this.allocatedPointers.add(ptr);
    }
    return ptr;
  },

  freeTracked: function (ptr) {
    if (ptr && this.allocatedPointers.has(ptr)) {
      Module._free(ptr);
      this.allocatedPointers.delete(ptr);
    }
  },

  cleanup: function () {
    this.allocatedPointers.forEach((ptr) => {
      try {
        Module._free(ptr);
      } catch (e) {
        console.warn('Failed to free WASM memory:', e);
      }
    });
    this.allocatedPointers.clear();
  },
};

// Error handling
var WASMErrorHandler = {
  handleError: function (operation, error) {
    console.error(`WASM ${operation} failed:`, error);

    // Attempt cleanup on error
    try {
      WASMMemoryManager.cleanup();
    } catch (cleanupError) {
      console.error('WASM cleanup failed:', cleanupError);
    }

    throw new Error(`WebAssembly operation '${operation}' failed: ${error.message}`);
  },
};

// Debug logging (only in development)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  var originalConsoleLog = console.log;
  console.log = function (...args) {
    originalConsoleLog.apply(console, ['[WASM Pre-JS]'].concat(args));
  };
}
