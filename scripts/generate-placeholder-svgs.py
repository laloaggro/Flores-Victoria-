#!/usr/bin/env python3
"""
Script para generar imágenes placeholder SVG para productos
Genera imágenes SVG simples pero elegantes con colores según el tipo de producto
Incluye marca de agua con logo de Flores Victoria
"""

import os
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "images" / "products" / "final"

# Logo SVG de Flores Victoria (simplificado para marca de agua)
LOGO_WATERMARK = '''
  <g transform="translate({x}, {y}) scale({scale})" opacity="0.15">
    <defs>
      <linearGradient id="wm-green-{sku}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#3a6b1f"/>
        <stop offset="100%" style="stop-color:#2d5016"/>
      </linearGradient>
      <linearGradient id="wm-pink-{sku}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff6b9d"/>
        <stop offset="100%" style="stop-color:#c9184a"/>
      </linearGradient>
    </defs>
    <!-- Hojas -->
    <path d="M 40,50 Q 20,35 15,10 Q 25,25 35,35 Q 38,42 40,50 Z" fill="url(#wm-green-{sku})"/>
    <path d="M 60,50 Q 80,35 85,10 Q 75,25 65,35 Q 62,42 60,50 Z" fill="url(#wm-green-{sku})"/>
    <!-- Flor -->
    <g transform="translate(50, 35)">
      <ellipse cx="0" cy="-12" rx="8" ry="14" fill="url(#wm-pink-{sku})" transform="rotate(0)"/>
      <ellipse cx="0" cy="-12" rx="8" ry="14" fill="url(#wm-pink-{sku})" transform="rotate(72)"/>
      <ellipse cx="0" cy="-12" rx="8" ry="14" fill="url(#wm-pink-{sku})" transform="rotate(144)"/>
      <ellipse cx="0" cy="-12" rx="8" ry="14" fill="url(#wm-pink-{sku})" transform="rotate(216)"/>
      <ellipse cx="0" cy="-12" rx="8" ry="14" fill="url(#wm-pink-{sku})" transform="rotate(288)"/>
      <circle cx="0" cy="0" r="6" fill="#ffd60a"/>
    </g>
  </g>
'''

# Colores por categoría de producto
COLORS = {
    "BDY": {"bg": "#FFE4E6", "fg": "#BE185D", "icon": "🎂"},  # Birthday - Rosa
    "WED": {"bg": "#FFF7ED", "fg": "#C2410C", "icon": "💒"},  # Wedding - Melocotón
    "ANV": {"bg": "#FEE2E2", "fg": "#DC2626", "icon": "❤️"},  # Anniversary - Rojo
    "FUN": {"bg": "#F3F4F6", "fg": "#4B5563", "icon": "🕯️"},  # Funeral - Gris
    "MOM": {"bg": "#FCE7F3", "fg": "#DB2777", "icon": "💝"},  # Mother's Day - Rosa fuerte
    "GRD": {"bg": "#FEF3C7", "fg": "#D97706", "icon": "🎓"},  # Graduation - Dorado
    "ROS": {"bg": "#FFE4E6", "fg": "#E11D48", "icon": "🌹"},  # Roses - Rojo rosa
    "TUL": {"bg": "#FECDD3", "fg": "#F43F5E", "icon": "🌷"},  # Tulips - Rosa
    "ORQ": {"bg": "#F5D0FE", "fg": "#A855F7", "icon": "🌸"},  # Orchids - Púrpura
    "GIR": {"bg": "#FEF08A", "fg": "#CA8A04", "icon": "🌻"},  # Sunflowers - Amarillo
    "LIR": {"bg": "#FFF1F2", "fg": "#FB7185", "icon": "💮"},  # Lilies - Rosa suave
    "PLT": {"bg": "#DCFCE7", "fg": "#16A34A", "icon": "🌿"},  # Plants - Verde
    "CLS": {"bg": "#E0E7FF", "fg": "#4F46E5", "icon": "💐"},  # Classic - Índigo
    "JAR": {"bg": "#CFFAFE", "fg": "#0891B2", "icon": "🏺"},  # Vase - Cian
    "CST": {"bg": "#FEF3C7", "fg": "#B45309", "icon": "🧺"},  # Basket - Marrón
    "LUX": {"bg": "#FAF5FF", "fg": "#7C3AED", "icon": "✨"},  # Luxury - Violeta
    "CRP": {"bg": "#F1F5F9", "fg": "#475569", "icon": "🏢"}   # Corporate - Slate
}

MISSING_IMAGES = [
    "ANV001.webp", "ANV002.webp", "ANV003.webp", "ANV004.webp", "ANV005.webp",
    "BDY006.webp",
    "CLS001.webp", "CLS002.webp", "CLS003.webp", "CLS004.webp", "CLS005.webp",
    "CRP003.webp", "CRP004.webp", "CRP005.webp", "CRP006.webp",
    "CST001.webp", "CST002.webp", "CST003.webp", "CST004.webp", "CST005.webp",
    "FUN001.webp", "FUN002.webp", "FUN003.webp", "FUN004.webp", "FUN005.webp",
    "GIR001.webp", "GIR002.webp", "GIR003.webp", "GIR004.webp", "GIR005.webp",
    "GRD003.webp", "GRD004.webp", "GRD005.webp",
    "JAR001.webp", "JAR002.webp", "JAR003.webp", "JAR004.webp", "JAR005.webp",
    "LIR001.webp", "LIR002.webp", "LIR003.webp", "LIR004.webp", "LIR005.webp",
    "LUX001.webp", "LUX002.webp", "LUX003.webp", "LUX004.webp", "LUX005.webp",
    "MOM001.webp", "MOM002.webp", "MOM003.webp", "MOM004.webp", "MOM005.webp",
    "ORQ001.webp", "ORQ002.webp", "ORQ003.webp", "ORQ004.webp", "ORQ005.webp",
    "PLT006.webp", "PLT007.webp", "PLT008.webp", "PLT009.webp",
    "ROS001.webp", "ROS002.webp", "ROS003.webp", "ROS004.webp", "ROS005.webp",
    "TUL001.webp", "TUL002.webp", "TUL003.webp", "TUL004.webp", "TUL005.webp",
    "WED001.webp", "WED002.webp", "WED003.webp", "WED004.webp", "WED005.webp"
]

def create_svg_placeholder(sku: str) -> str:
    """Crea un SVG placeholder elegante basado en el SKU con marca de agua del logo"""
    prefix = sku[:3]
    colors = COLORS.get(prefix, {"bg": "#F3F4F6", "fg": "#6B7280", "icon": "🌸"})
    
    # Generar marcas de agua del logo en varias posiciones
    watermarks = ""
    watermarks += LOGO_WATERMARK.format(sku=sku, x=20, y=20, scale=0.8)
    watermarks += LOGO_WATERMARK.format(sku=sku, x=380, y=20, scale=0.8)
    watermarks += LOGO_WATERMARK.format(sku=sku, x=20, y=400, scale=0.8)
    watermarks += LOGO_WATERMARK.format(sku=sku, x=380, y=400, scale=0.8)
    watermarks += LOGO_WATERMARK.format(sku=sku, x=200, y=210, scale=1.2)  # Centro
    
    svg = f'''<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-{sku}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{colors['bg']};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow-{sku}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="{colors['fg']}" flood-opacity="0.15"/>
    </filter>
    <pattern id="watermark-pattern-{sku}" patternUnits="userSpaceOnUse" width="150" height="150" patternTransform="rotate(-15)">
      <text x="10" y="75" font-family="Georgia, serif" font-size="14" fill="{colors['fg']}" opacity="0.08">Flores Victoria</text>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg-{sku})"/>
  
  <!-- Watermark pattern overlay -->
  <rect width="512" height="512" fill="url(#watermark-pattern-{sku})"/>
  
  <!-- Logo watermarks en esquinas y centro -->
  {watermarks}
  
  <!-- Decorative circles -->
  <circle cx="80" cy="80" r="60" fill="{colors['fg']}" opacity="0.05"/>
  <circle cx="432" cy="432" r="80" fill="{colors['fg']}" opacity="0.05"/>
  <circle cx="400" cy="100" r="40" fill="{colors['fg']}" opacity="0.08"/>
  
  <!-- Main icon container -->
  <circle cx="256" cy="200" r="100" fill="white" filter="url(#shadow-{sku})"/>
  <circle cx="256" cy="200" r="90" fill="{colors['bg']}" opacity="0.5"/>
  
  <!-- Emoji icon as text -->
  <text x="256" y="225" font-size="80" text-anchor="middle" dominant-baseline="middle">{colors['icon']}</text>
  
  <!-- SKU Label -->
  <rect x="156" y="320" width="200" height="40" rx="20" fill="{colors['fg']}" opacity="0.9"/>
  <text x="256" y="347" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">{sku.replace('.webp', '')}</text>
  
  <!-- Flores Victoria branding -->
  <text x="256" y="400" font-family="Georgia, serif" font-size="24" fill="{colors['fg']}" text-anchor="middle" font-style="italic">Flores Victoria</text>
  <text x="256" y="430" font-family="Arial, sans-serif" font-size="12" fill="{colors['fg']}" text-anchor="middle" opacity="0.7">Imagen Próximamente</text>
  
  <!-- Decorative line -->
  <line x1="180" y1="460" x2="332" y2="460" stroke="{colors['fg']}" stroke-width="2" opacity="0.3"/>
  
  <!-- Copyright watermark -->
  <text x="256" y="495" font-family="Arial, sans-serif" font-size="10" fill="{colors['fg']}" text-anchor="middle" opacity="0.4">© Flores Victoria - flores-victoria.com</text>
</svg>'''
    
    return svg

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"🌸 Generador de Placeholders SVG - Flores Victoria")
    print(f"=" * 50)
    print(f"📁 Directorio: {OUTPUT_DIR}")
    
    generated = 0
    skipped = 0
    
    for img in MISSING_IMAGES:
        svg_path = OUTPUT_DIR / img.replace('.webp', '.svg')
        webp_path = OUTPUT_DIR / img
        
        # Skip if webp already exists
        if webp_path.exists():
            skipped += 1
            continue
        
        # Generate SVG
        svg_content = create_svg_placeholder(img)
        
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        generated += 1
        print(f"  ✅ Creado: {svg_path.name}")
    
    print()
    print(f"=" * 50)
    print(f"✅ SVGs generados: {generated}")
    print(f"⏭️  Omitidos (webp existe): {skipped}")
    print()
    print("ℹ️  Los SVGs son temporales. Ejecuta generate-product-images.py")
    print("   con tu API Key de HuggingFace para generar imágenes reales.")

if __name__ == "__main__":
    main()
