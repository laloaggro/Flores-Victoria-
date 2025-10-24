# WebAssembly Image Processor - Build Configuration
# Flores Victoria Open Source Project

# Compiler settings
CC = emcc
CFLAGS = -O3 -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap", "ccall", "setValue", "getValue", "HEAPU8"]' \
         -s ALLOW_MEMORY_GROWTH=1 -s INITIAL_MEMORY=33554432 -s MAXIMUM_MEMORY=134217728 \
         -s MODULARIZE=1 -s EXPORT_NAME="FloresVictoriaWASM" \
         -s EXPORTED_FUNCTIONS='["_malloc", "_free"]' \
         --pre-js wasm-pre.js --post-js wasm-post.js

# Source and output files
SOURCE = image-processor.c
OUTPUT = image-processor.js
WASM_OUTPUT = image-processor.wasm

# Build targets
all: $(OUTPUT)

$(OUTPUT): $(SOURCE)
	$(CC) $(CFLAGS) $(SOURCE) -o $(OUTPUT)

# Development build with debug info
debug: CFLAGS += -g -s ASSERTIONS=1 -s SAFE_HEAP=1
debug: $(OUTPUT)

# Optimized production build
production: CFLAGS += -s FILESYSTEM=0 -s ENVIRONMENT='web' --closure 1
production: $(OUTPUT)

# Clean build files
clean:
	rm -f $(OUTPUT) $(WASM_OUTPUT)

# Install emscripten (for CI/CD)
install-emscripten:
	git clone https://github.com/emscripten-core/emsdk.git
	cd emsdk && ./emsdk install latest && ./emsdk activate latest

# Test build
test: $(OUTPUT)
	node test-wasm.js

.PHONY: all debug production clean install-emscripten test