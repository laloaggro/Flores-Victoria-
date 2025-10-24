/**
 * WebAssembly Image Processing Module - Flores Victoria
 * Ultra-fast image processing for product optimization
 * Open Source Project - MIT License
 */

#include <emscripten.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stdint.h>

// Memory management
#define MAX_IMAGE_SIZE 4096 * 4096 * 4
static uint8_t *image_buffer = NULL;
static uint8_t *output_buffer = NULL;
static int buffer_size = 0;

// Image processing structures
typedef struct {
    int width;
    int height;
    int channels;
    uint8_t *data;
} Image;

typedef struct {
    float brightness;
    float contrast;
    float saturation;
    float sharpness;
    float gamma;
} ImageFilters;

typedef struct {
    int x;
    int y;
    int width;
    int height;
} CropArea;

// Initialize memory buffers
EMSCRIPTEN_KEEPALIVE
int init_image_processor(int max_size) {
    if (image_buffer) {
        free(image_buffer);
    }
    if (output_buffer) {
        free(output_buffer);
    }
    
    buffer_size = max_size;
    image_buffer = (uint8_t*)malloc(max_size);
    output_buffer = (uint8_t*)malloc(max_size);
    
    return (image_buffer && output_buffer) ? 1 : 0;
}

// Get buffer pointers for JavaScript
EMSCRIPTEN_KEEPALIVE
uint8_t* get_input_buffer() {
    return image_buffer;
}

EMSCRIPTEN_KEEPALIVE
uint8_t* get_output_buffer() {
    return output_buffer;
}

// Cleanup memory
EMSCRIPTEN_KEEPALIVE
void cleanup_processor() {
    if (image_buffer) {
        free(image_buffer);
        image_buffer = NULL;
    }
    if (output_buffer) {
        free(output_buffer);
        output_buffer = NULL;
    }
}

// Utility functions
static inline uint8_t clamp_pixel(float value) {
    if (value < 0) return 0;
    if (value > 255) return 255;
    return (uint8_t)value;
}

static inline float srgb_to_linear(float srgb) {
    if (srgb <= 0.04045f) {
        return srgb / 12.92f;
    }
    return powf((srgb + 0.055f) / 1.055f, 2.4f);
}

static inline float linear_to_srgb(float linear) {
    if (linear <= 0.0031308f) {
        return linear * 12.92f;
    }
    return 1.055f * powf(linear, 1.0f / 2.4f) - 0.055f;
}

// Color space conversions
static void rgb_to_hsv(uint8_t r, uint8_t g, uint8_t b, float *h, float *s, float *v) {
    float rf = r / 255.0f;
    float gf = g / 255.0f;
    float bf = b / 255.0f;
    
    float max_val = fmaxf(rf, fmaxf(gf, bf));
    float min_val = fminf(rf, fminf(gf, bf));
    float delta = max_val - min_val;
    
    *v = max_val;
    *s = (max_val == 0) ? 0 : delta / max_val;
    
    if (delta == 0) {
        *h = 0;
    } else if (max_val == rf) {
        *h = 60.0f * ((gf - bf) / delta);
    } else if (max_val == gf) {
        *h = 60.0f * (2 + (bf - rf) / delta);
    } else {
        *h = 60.0f * (4 + (rf - gf) / delta);
    }
    
    if (*h < 0) *h += 360;
}

static void hsv_to_rgb(float h, float s, float v, uint8_t *r, uint8_t *g, uint8_t *b) {
    float c = v * s;
    float x = c * (1 - fabsf(fmodf(h / 60.0f, 2) - 1));
    float m = v - c;
    
    float rf, gf, bf;
    
    if (h < 60) {
        rf = c; gf = x; bf = 0;
    } else if (h < 120) {
        rf = x; gf = c; bf = 0;
    } else if (h < 180) {
        rf = 0; gf = c; bf = x;
    } else if (h < 240) {
        rf = 0; gf = x; bf = c;
    } else if (h < 300) {
        rf = x; gf = 0; bf = c;
    } else {
        rf = c; gf = 0; bf = x;
    }
    
    *r = clamp_pixel((rf + m) * 255);
    *g = clamp_pixel((gf + m) * 255);
    *b = clamp_pixel((bf + m) * 255);
}

// Image resize with bicubic interpolation
EMSCRIPTEN_KEEPALIVE
int resize_image(int src_width, int src_height, int dst_width, int dst_height, int channels) {
    if (!image_buffer || !output_buffer) return 0;
    
    float x_ratio = (float)src_width / dst_width;
    float y_ratio = (float)src_height / dst_height;
    
    for (int y = 0; y < dst_height; y++) {
        for (int x = 0; x < dst_width; x++) {
            float src_x = x * x_ratio;
            float src_y = y * y_ratio;
            
            int x1 = (int)src_x;
            int y1 = (int)src_y;
            int x2 = x1 + 1;
            int y2 = y1 + 1;
            
            // Clamp coordinates
            x1 = x1 < 0 ? 0 : (x1 >= src_width ? src_width - 1 : x1);
            y1 = y1 < 0 ? 0 : (y1 >= src_height ? src_height - 1 : y1);
            x2 = x2 < 0 ? 0 : (x2 >= src_width ? src_width - 1 : x2);
            y2 = y2 < 0 ? 0 : (y2 >= src_height ? src_height - 1 : y2);
            
            float dx = src_x - x1;
            float dy = src_y - y1;
            
            for (int c = 0; c < channels; c++) {
                float p1 = image_buffer[(y1 * src_width + x1) * channels + c];
                float p2 = image_buffer[(y1 * src_width + x2) * channels + c];
                float p3 = image_buffer[(y2 * src_width + x1) * channels + c];
                float p4 = image_buffer[(y2 * src_width + x2) * channels + c];
                
                float interpolated = p1 * (1 - dx) * (1 - dy) +
                                   p2 * dx * (1 - dy) +
                                   p3 * (1 - dx) * dy +
                                   p4 * dx * dy;
                
                output_buffer[(y * dst_width + x) * channels + c] = clamp_pixel(interpolated);
            }
        }
    }
    
    return 1;
}

// Apply image filters
EMSCRIPTEN_KEEPALIVE
int apply_filters(int width, int height, int channels, 
                  float brightness, float contrast, float saturation, 
                  float sharpness, float gamma) {
    if (!image_buffer || !output_buffer) return 0;
    
    int total_pixels = width * height;
    
    // Apply gamma correction first
    for (int i = 0; i < total_pixels * channels; i++) {
        float normalized = image_buffer[i] / 255.0f;
        float corrected = powf(normalized, 1.0f / gamma);
        output_buffer[i] = clamp_pixel(corrected * 255.0f);
    }
    
    // Apply brightness, contrast, and saturation
    for (int i = 0; i < total_pixels; i++) {
        int base_idx = i * channels;
        
        if (channels >= 3) {
            // RGB processing
            uint8_t r = output_buffer[base_idx];
            uint8_t g = output_buffer[base_idx + 1];
            uint8_t b = output_buffer[base_idx + 2];
            
            // Brightness and contrast
            float rf = (r / 255.0f - 0.5f) * contrast + 0.5f + brightness;
            float gf = (g / 255.0f - 0.5f) * contrast + 0.5f + brightness;
            float bf = (b / 255.0f - 0.5f) * contrast + 0.5f + brightness;
            
            // Saturation adjustment via HSV
            if (saturation != 1.0f) {
                float h, s, v;
                rgb_to_hsv(clamp_pixel(rf * 255), clamp_pixel(gf * 255), clamp_pixel(bf * 255), &h, &s, &v);
                s *= saturation;
                s = s > 1.0f ? 1.0f : (s < 0 ? 0 : s);
                hsv_to_rgb(h, s, v, &r, &g, &b);
                
                output_buffer[base_idx] = r;
                output_buffer[base_idx + 1] = g;
                output_buffer[base_idx + 2] = b;
            } else {
                output_buffer[base_idx] = clamp_pixel(rf * 255);
                output_buffer[base_idx + 1] = clamp_pixel(gf * 255);
                output_buffer[base_idx + 2] = clamp_pixel(bf * 255);
            }
            
            // Preserve alpha channel
            if (channels == 4) {
                output_buffer[base_idx + 3] = image_buffer[base_idx + 3];
            }
        } else {
            // Grayscale processing
            float pixel = (output_buffer[base_idx] / 255.0f - 0.5f) * contrast + 0.5f + brightness;
            output_buffer[base_idx] = clamp_pixel(pixel * 255);
        }
    }
    
    // Apply sharpening if requested
    if (sharpness > 0 && width > 2 && height > 2) {
        memcpy(image_buffer, output_buffer, total_pixels * channels);
        
        float kernel[9] = {
            0, -sharpness, 0,
            -sharpness, 1 + 4 * sharpness, -sharpness,
            0, -sharpness, 0
        };
        
        for (int y = 1; y < height - 1; y++) {
            for (int x = 1; x < width - 1; x++) {
                for (int c = 0; c < channels; c++) {
                    if (c == 3) { // Skip alpha channel for sharpening
                        output_buffer[(y * width + x) * channels + c] = 
                            image_buffer[(y * width + x) * channels + c];
                        continue;
                    }
                    
                    float sum = 0;
                    for (int ky = -1; ky <= 1; ky++) {
                        for (int kx = -1; kx <= 1; kx++) {
                            int pixel_idx = ((y + ky) * width + (x + kx)) * channels + c;
                            sum += image_buffer[pixel_idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                    output_buffer[(y * width + x) * channels + c] = clamp_pixel(sum);
                }
            }
        }
    }
    
    return 1;
}

// Crop image
EMSCRIPTEN_KEEPALIVE
int crop_image(int src_width, int src_height, int channels,
               int crop_x, int crop_y, int crop_width, int crop_height) {
    if (!image_buffer || !output_buffer) return 0;
    
    // Validate crop area
    if (crop_x < 0 || crop_y < 0 || 
        crop_x + crop_width > src_width || 
        crop_y + crop_height > src_height) {
        return 0;
    }
    
    for (int y = 0; y < crop_height; y++) {
        for (int x = 0; x < crop_width; x++) {
            int src_idx = ((crop_y + y) * src_width + (crop_x + x)) * channels;
            int dst_idx = (y * crop_width + x) * channels;
            
            for (int c = 0; c < channels; c++) {
                output_buffer[dst_idx + c] = image_buffer[src_idx + c];
            }
        }
    }
    
    return 1;
}

// Edge detection using Sobel operator
EMSCRIPTEN_KEEPALIVE
int detect_edges(int width, int height, int channels, float threshold) {
    if (!image_buffer || !output_buffer) return 0;
    
    // Sobel kernels
    int sobel_x[9] = {-1, 0, 1, -2, 0, 2, -1, 0, 1};
    int sobel_y[9] = {-1, -2, -1, 0, 0, 0, 1, 2, 1};
    
    for (int y = 1; y < height - 1; y++) {
        for (int x = 1; x < width - 1; x++) {
            float gx = 0, gy = 0;
            
            // Apply Sobel kernels
            for (int ky = -1; ky <= 1; ky++) {
                for (int kx = -1; kx <= 1; kx++) {
                    int pixel_idx = ((y + ky) * width + (x + kx)) * channels;
                    
                    // Use luminance for edge detection
                    float luminance;
                    if (channels >= 3) {
                        luminance = 0.299f * image_buffer[pixel_idx] + 
                                   0.587f * image_buffer[pixel_idx + 1] + 
                                   0.114f * image_buffer[pixel_idx + 2];
                    } else {
                        luminance = image_buffer[pixel_idx];
                    }
                    
                    int kernel_idx = (ky + 1) * 3 + (kx + 1);
                    gx += luminance * sobel_x[kernel_idx];
                    gy += luminance * sobel_y[kernel_idx];
                }
            }
            
            float magnitude = sqrtf(gx * gx + gy * gy);
            uint8_t edge_value = (magnitude > threshold) ? 255 : 0;
            
            int output_idx = (y * width + x) * channels;
            for (int c = 0; c < channels; c++) {
                if (c == 3) { // Preserve alpha
                    output_buffer[output_idx + c] = image_buffer[output_idx + c];
                } else {
                    output_buffer[output_idx + c] = edge_value;
                }
            }
        }
    }
    
    return 1;
}

// Histogram equalization
EMSCRIPTEN_KEEPALIVE
int equalize_histogram(int width, int height, int channels) {
    if (!image_buffer || !output_buffer) return 0;
    
    int total_pixels = width * height;
    
    for (int c = 0; c < (channels == 4 ? 3 : channels); c++) { // Skip alpha
        int histogram[256] = {0};
        
        // Build histogram
        for (int i = 0; i < total_pixels; i++) {
            histogram[image_buffer[i * channels + c]]++;
        }
        
        // Calculate cumulative distribution
        int cdf[256];
        cdf[0] = histogram[0];
        for (int i = 1; i < 256; i++) {
            cdf[i] = cdf[i - 1] + histogram[i];
        }
        
        // Normalize and create lookup table
        uint8_t lut[256];
        for (int i = 0; i < 256; i++) {
            lut[i] = (uint8_t)((cdf[i] * 255) / total_pixels);
        }
        
        // Apply equalization
        for (int i = 0; i < total_pixels; i++) {
            output_buffer[i * channels + c] = lut[image_buffer[i * channels + c]];
        }
    }
    
    // Copy alpha channel if present
    if (channels == 4) {
        for (int i = 0; i < total_pixels; i++) {
            output_buffer[i * channels + 3] = image_buffer[i * channels + 3];
        }
    }
    
    return 1;
}

// Blur effect using box filter
EMSCRIPTEN_KEEPALIVE
int apply_blur(int width, int height, int channels, int radius) {
    if (!image_buffer || !output_buffer || radius <= 0) return 0;
    
    int kernel_size = radius * 2 + 1;
    float weight = 1.0f / (kernel_size * kernel_size);
    
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            float sum[4] = {0, 0, 0, 0};
            
            for (int ky = -radius; ky <= radius; ky++) {
                for (int kx = -radius; kx <= radius; kx++) {
                    int sample_y = y + ky;
                    int sample_x = x + kx;
                    
                    // Clamp to image bounds
                    sample_y = sample_y < 0 ? 0 : (sample_y >= height ? height - 1 : sample_y);
                    sample_x = sample_x < 0 ? 0 : (sample_x >= width ? width - 1 : sample_x);
                    
                    int sample_idx = (sample_y * width + sample_x) * channels;
                    for (int c = 0; c < channels; c++) {
                        sum[c] += image_buffer[sample_idx + c] * weight;
                    }
                }
            }
            
            int output_idx = (y * width + x) * channels;
            for (int c = 0; c < channels; c++) {
                output_buffer[output_idx + c] = clamp_pixel(sum[c]);
            }
        }
    }
    
    return 1;
}

// Color temperature adjustment
EMSCRIPTEN_KEEPALIVE
int adjust_color_temperature(int width, int height, int channels, float temperature) {
    if (!image_buffer || !output_buffer || channels < 3) return 0;
    
    // Color temperature to RGB multipliers (simplified)
    float r_multiplier, g_multiplier, b_multiplier;
    
    if (temperature < 5000) {
        // Warmer (more red/yellow)
        float factor = (5000 - temperature) / 2000.0f;
        r_multiplier = 1.0f + factor * 0.3f;
        g_multiplier = 1.0f + factor * 0.1f;
        b_multiplier = 1.0f - factor * 0.2f;
    } else {
        // Cooler (more blue)
        float factor = (temperature - 5000) / 2000.0f;
        r_multiplier = 1.0f - factor * 0.2f;
        g_multiplier = 1.0f;
        b_multiplier = 1.0f + factor * 0.3f;
    }
    
    int total_pixels = width * height;
    for (int i = 0; i < total_pixels; i++) {
        int base_idx = i * channels;
        
        output_buffer[base_idx] = clamp_pixel(image_buffer[base_idx] * r_multiplier);
        output_buffer[base_idx + 1] = clamp_pixel(image_buffer[base_idx + 1] * g_multiplier);
        output_buffer[base_idx + 2] = clamp_pixel(image_buffer[base_idx + 2] * b_multiplier);
        
        if (channels == 4) {
            output_buffer[base_idx + 3] = image_buffer[base_idx + 3];
        }
    }
    
    return 1;
}

// Performance benchmarking
EMSCRIPTEN_KEEPALIVE
double benchmark_operation(const char* operation, int iterations) {
    // Simple benchmarking placeholder
    return 0.0;
}