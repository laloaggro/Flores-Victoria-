#!/bin/bash

# ===================================
# FLORES VICTORIA - Build Script
# Builds the frontend for different environments
# ===================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if environment argument is provided
ENV=${1:-development}

print_info "Building Flores Victoria Frontend for: $ENV"

# Validate environment
if [[ ! "$ENV" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENV"
    echo "Usage: $0 [development|staging|production]"
    exit 1
fi

# Navigate to frontend directory
cd "$(dirname "$0")"

# Load environment variables
if [ -f "../.env.$ENV" ]; then
    print_info "Loading environment from .env.$ENV"
    export $(cat "../.env.$ENV" | grep -v '^#' | xargs)
else
    print_warning ".env.$ENV not found, using defaults"
fi

# Clean previous build
print_info "Cleaning previous build..."
rm -rf dist/
rm -rf node_modules/.vite/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm ci
fi

# Copy updated source files to public/
print_info "Syncing source files to public directory..."
if [ -f "js/components/product/Products.js" ]; then
    mkdir -p public/js/components/product/
    cp js/components/product/Products.js public/js/components/product/
    print_success "Products.js synced"
fi

# Build based on environment
if [ "$ENV" = "production" ]; then
    print_info "Building for PRODUCTION (logs removed, minified)..."
    NODE_ENV=production npm run build
    
    # Additional production optimizations
    print_info "Running production optimizations..."
    
    # Remove source maps if they exist
    find dist/ -name "*.map" -delete
    
    # List build output
    print_info "Build output:"
    du -sh dist/
    
elif [ "$ENV" = "staging" ]; then
    print_info "Building for STAGING (logs enabled, source maps)..."
    NODE_ENV=staging npm run build
    
elif [ "$ENV" = "development" ]; then
    print_info "Building for DEVELOPMENT (full debugging)..."
    NODE_ENV=development npm run build
fi

# Verify critical files exist
print_info "Verifying build..."
CRITICAL_FILES=(
    "dist/index.html"
    "dist/pages/products.html"
    "dist/images/productos/"
)

ALL_GOOD=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -e "dist/$file" ] && [ ! -e "$file" ]; then
        print_error "Missing: $file"
        ALL_GOOD=false
    fi
done

if [ "$ALL_GOOD" = true ]; then
    print_success "Build completed successfully for $ENV! 🎉"
    print_info "Output: $(pwd)/dist/"
else
    print_error "Build verification failed"
    exit 1
fi

# Show next steps
echo ""
print_info "Next steps:"
if [ "$ENV" = "development" ]; then
    echo "  - Run: npm run dev"
    echo "  - Or: docker-compose up -d frontend"
elif [ "$ENV" = "staging" ]; then
    echo "  - Deploy to staging server"
    echo "  - docker-compose -f docker-compose.staging.yml up -d"
else
    echo "  - Run tests before deploying"
    echo "  - Deploy to production: docker-compose -f docker-compose.prod.yml up -d"
fi

exit 0
