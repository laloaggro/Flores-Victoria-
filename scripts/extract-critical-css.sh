#!/bin/bash
# Extract Critical CSS - Flores Victoria
# Extrae el CSS crítico above-the-fold para inline

set -e

echo "🎨 Extrayendo CSS crítico..."

CRITICAL_CSS_FILE="frontend/css/critical-inline.css"

cat > "$CRITICAL_CSS_FILE" << 'EOF'
/* Critical CSS - Inline para Above-the-Fold */
/* Solo estilos esenciales para First Contentful Paint */

:root {
  --primary: #C2185B;
  --primary-dark: #880E4F;
  --primary-light: #F48FB1;
  --secondary: #2E7D32;
  --accent: #FFA000;
  --dark: #2C1F2F;
  --light: #F8F9FA;
  --white: #FFFFFF;
  --gray: #6C757D;
  --gray-light: #E9ECEF;
  --success: #28A745;
  --danger: #DC3545;
  --warning: #FFC107;
  --info: #17A2B8;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #2C1F2F;
  background: #FFFFFF;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header crítico */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

/* Hero section crítico */
.hero {
  min-height: 60vh;
  display: flex;
  align-items: center;
  padding: 4rem 0;
  margin-top: 70px;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #2C1F2F;
  font-weight: 700;
  line-height: 1.2;
}

/* Grid básico */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

/* Loading state */
.loading {
  text-align: center;
  padding: 3rem;
  color: #6C757D;
}

/* Skeleton loaders */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
EOF

echo "✅ CSS crítico extraído: $CRITICAL_CSS_FILE"
echo "💡 Para usarlo, incluir en <head> con <style>...</style>"
