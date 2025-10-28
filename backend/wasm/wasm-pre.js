/**
 * WebAssembly Pre-JS - Flores Victoria
 * Initialization code executed before WASM module loading
 */

// Global configuration for WASM module
const FloresVictoriaWASMConfig = {
  wasmBinaryFile: 'image-processor.wasm',
  locateFile(path, prefix) {
    if (path.endsWith('.wasm')) {
      return `/js/wasm/${path}`;
    }
    return prefix + path;
  },
};

// Performance monitoring
const WASMPerformance = {
  operationTimes: {},
  startTime(operation) {
    this.operationTimes[operation] = performance.now();
  },
  endTime(operation) {
    if (this.operationTimes[operation]) {
      const duration = performance.now() - this.operationTimes[operation];
      console.log(`WASM ${operation} completed in ${duration.toFixed(2)}ms`);
      delete this.operationTimes[operation];
      return duration;
    }
    return 0;
  },
};

// Memory management helpers
const WASMMemoryManager = {
  allocatedPointers: new Set(),

  trackAllocation(ptr) {
    if (ptr) {
      this.allocatedPointers.add(ptr);
    }
    return ptr;
  },

  freeTracked(ptr) {
    if (ptr && this.allocatedPointers.has(ptr)) {
      Module._free(ptr);
      this.allocatedPointers.delete(ptr);
    }
  },

  cleanup() {
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
const WASMErrorHandler = {
  handleError(operation, error) {
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
  const originalConsoleLog = console.log;
  console.log = function (...args) {
    originalConsoleLog.apply(console, ['[WASM Pre-JS]'].concat(args));
  };
}
