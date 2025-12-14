#!/usr/bin/env python3
"""
Script para generar imágenes de productos basadas en sus descripciones
usando HuggingFace Inference API Pro con marca de agua del logo.

Requiere: pip install requests pillow
Uso: python generate-images-from-products.py --api-key TU_HF_API_KEY
"""

import os
import sys
import json
import time
import argparse
import requests
from pathlib import Path
from io import BytesIO

# Configuración - HuggingFace Pro con FLUX.1-schnell (rápido y gratuito)
API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
BASE_DIR = Path(__file__).parent.parent
PRODUCTS_JSON = BASE_DIR / "frontend" / "public" / "assets" / "mock" / "products.json"
OUTPUT_DIR = BASE_DIR / "frontend" / "images" / "products" / "final"
WATERMARK_PATH = BASE_DIR / "frontend" / "public" / "images" / "logo-watermark.png"

# Mapeo de categorías a contexto adicional para mejores prompts
CATEGORY_CONTEXT = {
    "aniversarios": "romantic anniversary celebration, red roses, elegant",
    "amor": "romantic love flowers, red and pink roses, hearts",
    "graduaciones": "graduation celebration flowers, yellow and orange, festive",
    "cumpleaños": "birthday celebration bouquet, colorful, balloons",
    "bodas": "wedding flowers, white roses, elegant bridal",
    "condolencias": "sympathy funeral flowers, white lilies, peaceful",
    "nacimiento": "baby celebration flowers, soft pastels, teddy bear",
    "bebe": "newborn baby flowers, pink or blue, cute",
    "mama": "mother's day flowers, pink roses, carnations",
    "rosas": "beautiful roses bouquet, premium Ecuador roses",
    "tulipanes": "fresh tulips arrangement, spring flowers",
    "orquideas": "elegant orchids, phalaenopsis, exotic",
    "girasoles": "bright sunflowers arrangement, cheerful",
    "lirios": "elegant lilies bouquet, fragrant",
    "plantas": "green indoor plant, decorative pot",
    "premium": "luxury premium flower arrangement, high-end",
    "corporativo": "corporate professional flowers, modern",
    "exoticos": "exotic tropical flowers arrangement",
    "seasonal": "seasonal flowers arrangement"
}

def load_products():
    """Carga los productos del JSON"""
    with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_products(products):
    """Guarda los productos actualizados"""
    with open(PRODUCTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

def get_products_needing_images(products):
    """Identifica productos que necesitan imágenes generadas"""
    needs_images = []
    for p in products:
        img_url = p.get('image_url', '')
        # Productos con placeholder, VAR genérico repetido, o SVG temporal
        if ('placeholder' in img_url or 
            img_url.endswith('.svg') or
            'VAR001.webp' in img_url or
            'pollinations' in img_url.lower()):
            needs_images.append(p)
    return needs_images

def generate_prompt(product):
    """Genera un prompt optimizado basado en el producto"""
    name = product.get('name', 'Arreglo floral')
    description = product.get('description', '')
    category = product.get('category', '').lower()
    
    # Contexto adicional por categoría
    cat_context = CATEGORY_CONTEXT.get(category, "beautiful flower arrangement")
    
    # Construir prompt optimizado para FLUX
    prompt = f"""Professional product photography of {name}, {description}, {cat_context}, 
florist shop quality, clean white background, professional studio lighting, 
high resolution, sharp details, vibrant natural colors, commercial product photo, 
elegant floral arrangement presentation, 8k quality"""
    
    # Limpiar y limitar longitud
    prompt = ' '.join(prompt.split())[:400]
    
    return prompt

def generate_sku(product):
    """Genera un SKU único basado en el producto"""
    category = product.get('category', 'var').upper()[:3]
    product_id = product.get('id', 0)
    return f"{category}{product_id:03d}"

def add_watermark(img, watermark_path):
    """Agrega marca de agua a la imagen"""
    try:
        from PIL import Image, ImageEnhance
        
        if not watermark_path.exists():
            print(f"   ⚠️  Marca de agua no encontrada: {watermark_path}")
            return img
        
        watermark = Image.open(watermark_path).convert('RGBA')
        
        # Redimensionar marca de agua (20% del ancho)
        wm_width = int(img.width * 0.20)
        wm_ratio = wm_width / watermark.width
        wm_height = int(watermark.height * wm_ratio)
        watermark = watermark.resize((wm_width, wm_height), Image.Resampling.LANCZOS)
        
        # Hacer semi-transparente (35% opacidad)
        alpha = watermark.split()[3]
        alpha = ImageEnhance.Brightness(alpha).enhance(0.35)
        watermark.putalpha(alpha)
        
        # Posición: esquina inferior derecha
        position = (img.width - wm_width - 10, img.height - wm_height - 10)
        
        # Crear imagen con canal alpha si no lo tiene
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Pegar marca de agua
        img.paste(watermark, position, watermark)
        
        return img.convert('RGB')
        
    except Exception as e:
        print(f"   ⚠️  Error agregando marca de agua: {e}")
        return img

def generate_image_hf(prompt, api_key, output_path, max_retries=3):
    """Genera una imagen usando HuggingFace Pro API"""
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "num_inference_steps": 25,
            "guidance_scale": 7.0,
            "width": 512,
            "height": 512
        }
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
            
            if response.status_code == 200:
                from PIL import Image
                
                # Verificar que es una imagen
                content_type = response.headers.get('content-type', '')
                if 'image' in content_type or response.content[:4] in [b'\x89PNG', b'\xff\xd8\xff\xe0', b'\xff\xd8\xff\xe1']:
                    img = Image.open(BytesIO(response.content)).convert('RGB')
                    
                    # Agregar marca de agua
                    img = add_watermark(img, WATERMARK_PATH)
                    
                    # Guardar como WebP
                    img.save(output_path, 'WEBP', quality=90)
                    return True
                else:
                    print(f"   ❌ Respuesta no es imagen: {response.text[:100]}")
                    return False
                    
            elif response.status_code == 503:
                wait_time = 15 * (attempt + 1)
                print(f"   ⏳ Modelo cargando, esperando {wait_time}s...")
                time.sleep(wait_time)
                
            elif response.status_code == 429:
                print(f"   ⏳ Rate limit, esperando 30s...")
                time.sleep(30)
                
            elif response.status_code == 401:
                print(f"   ❌ API Key inválida o sin permisos")
                return False
                
            else:
                error_msg = response.text[:200] if response.text else "Sin mensaje"
                print(f"   ❌ Error {response.status_code}: {error_msg}")
                if attempt < max_retries - 1:
                    time.sleep(5)
                    
        except requests.exceptions.Timeout:
            print(f"   ⏳ Timeout, reintento {attempt + 1}/{max_retries}...")
            time.sleep(5)
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(5)
    
    return False

def main():
    parser = argparse.ArgumentParser(description='Generar imágenes de productos con HuggingFace Pro')
    parser.add_argument('--api-key', type=str, 
                        default=os.environ.get('HF_API_KEY', ''),
                        help='HuggingFace API Key')
    parser.add_argument('--dry-run', action='store_true', 
                        help='Solo mostrar qué se generaría')
    parser.add_argument('--limit', type=int, default=0, 
                        help='Limitar número de imágenes')
    parser.add_argument('--product-id', type=int, default=0,
                        help='Generar solo para un producto específico')
    parser.add_argument('--all', action='store_true',
                        help='Regenerar TODAS las imágenes')
    args = parser.parse_args()
    
    print("🌸 Generador de Imágenes HuggingFace Pro - Flores Victoria")
    print("=" * 60)
    
    # Verificar dependencias
    try:
        from PIL import Image
    except ImportError:
        print("❌ Error: Pillow no instalado. Ejecuta: pip install pillow")
        sys.exit(1)
    
    if not args.api_key and not args.dry_run:
        print("❌ Error: Se requiere API Key de HuggingFace")
        print("   Uso: python generate-images-from-products.py --api-key TU_KEY")
        sys.exit(1)
    
    # Cargar productos
    products = load_products()
    print(f"📦 Total productos: {len(products)}")
    
    # Filtrar productos que necesitan imágenes
    if args.product_id:
        needs_images = [p for p in products if p['id'] == args.product_id]
    elif args.all:
        needs_images = products
    else:
        needs_images = get_products_needing_images(products)
    
    if args.limit > 0:
        needs_images = needs_images[:args.limit]
    
    print(f"🖼️  Productos a procesar: {len(needs_images)}")
    print()
    
    if not needs_images:
        print("✅ Todos los productos tienen imágenes!")
        return
    
    # Crear directorio de salida
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    if args.dry_run:
        print("🔍 Modo Dry-Run - Productos que se procesarían:\n")
        for p in needs_images[:10]:
            sku = generate_sku(p)
            print(f"  ID {p['id']:3d} - {p['name'][:40]} → {sku}.webp")
        if len(needs_images) > 10:
            print(f"  ... y {len(needs_images) - 10} productos más")
        return
    
    # Generar imágenes
    success = 0
    failed = 0
    
    for i, product in enumerate(needs_images, 1):
        sku = generate_sku(product)
        output_path = OUTPUT_DIR / f"{sku}.webp"
        prompt = generate_prompt(product)
        
        print(f"[{i}/{len(needs_images)}] ID {product['id']}: {product['name'][:35]}...")
        
        if generate_image_hf(prompt, args.api_key, output_path):
            print(f"   ✅ {sku}.webp guardado con marca de agua")
            
            # Actualizar URL en el producto
            product['image_url'] = f"/images/products/final/{sku}.webp"
            success += 1
        else:
            failed += 1
        
        # Pausa corta entre requests (HuggingFace Pro es rápido)
        if i < len(needs_images):
            time.sleep(1)
    
    # Guardar productos actualizados
    if success > 0:
        save_products(products)
        print()
        print(f"💾 products.json actualizado con {success} nuevas URLs")
    
    print()
    print("=" * 60)
    print(f"✅ Generadas exitosamente: {success}")
    print(f"❌ Fallidas: {failed}")
    print(f"📁 Directorio: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
