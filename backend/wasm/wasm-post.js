/**
 * WebAssembly Post-JS - Flores Victoria
 * Code executed after WASM module is loaded and ready
 */

// Initialize WASM functions after module is ready
Module.onRuntimeInitialized = function () {
  console.log('Flores Victoria WASM Image Processor initialized');

  // Wrap C functions for JavaScript usage
  Module.initImageProcessor = Module.cwrap('init_image_processor', 'number', ['number']);
  Module.getInputBuffer = Module.cwrap('get_input_buffer', 'number', []);
  Module.getOutputBuffer = Module.cwrap('get_output_buffer', 'number', []);
  Module.cleanupProcessor = Module.cwrap('cleanup_processor', null, []);

  Module.resizeImage = Module.cwrap('resize_image', 'number', [
    'number',
    'number',
    'number',
    'number',
    'number',
  ]);
  Module.applyFilters = Module.cwrap('apply_filters', 'number', [
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
  ]);
  Module.cropImage = Module.cwrap('crop_image', 'number', [
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
    'number',
  ]);
  Module.detectEdges = Module.cwrap('detect_edges', 'number', [
    'number',
    'number',
    'number',
    'number',
  ]);
  Module.equalizeHistogram = Module.cwrap('equalize_histogram', 'number', [
    'number',
    'number',
    'number',
  ]);
  Module.applyBlur = Module.cwrap('apply_blur', 'number', ['number', 'number', 'number', 'number']);
  Module.adjustColorTemperature = Module.cwrap('adjust_color_temperature', 'number', [
    'number',
    'number',
    'number',
    'number',
  ]);

  // Signal that WASM is ready
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('wasmReady', {
        detail: { module: Module },
      })
    );
  }

  // Node.js support
  if (typeof global !== 'undefined' && global.process) {
    global.FloresVictoriaWASM = Module;
  }
};

// Error handling for WASM loading
Module.onAbort = function (what) {
  console.error('WASM Module aborted:', what);
};

// Memory growth callback
Module.onMemoryGrowth = function (oldSize, newSize) {
  console.log(`WASM memory grew from ${oldSize} to ${newSize} bytes`);
};
