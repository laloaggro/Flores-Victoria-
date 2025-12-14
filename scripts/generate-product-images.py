#!/usr/bin/env python3
"""
Script para generar imágenes de productos usando HuggingFace Inference API
Incluye marca de agua con logo de Flores Victoria
Requiere: pip install requests pillow
Uso: python generate-product-images.py [--api-key HF_API_KEY]
"""

import os
import sys
import json
import time
import argparse
import requests
from pathlib import Path

# Configuración
API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "images" / "products" / "final"
WATERMARK_PATH = Path(__file__).parent.parent / "frontend" / "public" / "images" / "logo-watermark.png"

# Mapeo de prefijos de SKU a descripciones de productos para los prompts
SKU_PROMPTS = {
    # Por Ocasión
    "BDY": "beautiful birthday flower bouquet with colorful roses, gerberas and balloons, festive arrangement, professional product photography, white background, high quality",
    "WED": "elegant wedding flower bouquet with white roses, lilies and baby's breath, romantic bridal arrangement, professional product photography, white background, high quality",
    "ANV": "romantic anniversary flower arrangement with red roses and white orchids, elegant vase, professional product photography, white background, high quality",
    "FUN": "sympathy funeral flower arrangement, white lilies, chrysanthemums and carnations, respectful condolence flowers, professional product photography, white background, high quality",
    "MOM": "mother's day flower bouquet with pink roses, tulips and carnations, loving arrangement with ribbon, professional product photography, white background, high quality",
    "GRD": "graduation celebration flowers, sunflowers and colorful gerberas with graduation cap decoration, festive bouquet, professional product photography, white background, high quality",
    
    # Por Categoría de Flor
    "ROS": "luxurious rose bouquet, premium Ecuador roses in various colors, elegant arrangement, professional product photography, white background, high quality",
    "TUL": "beautiful tulip bouquet, fresh colorful tulips from Holland, spring flowers arrangement, professional product photography, white background, high quality",
    "ORQ": "elegant orchid arrangement, phalaenopsis orchids in decorative pot, exotic flowers, professional product photography, white background, high quality",
    "GIR": "cheerful sunflower bouquet, bright yellow sunflowers arrangement, happy flowers, professional product photography, white background, high quality",
    "LIR": "elegant lily bouquet, white and pink lilies arrangement, fragrant flowers, professional product photography, white background, high quality",
    "PLT": "beautiful indoor plant, green decorative plant in elegant pot, home decor plant, professional product photography, white background, high quality",
    
    # Por Tipo de Arreglo
    "CLS": "classic flower bouquet, traditional arrangement with mixed flowers and greenery, wrapped in craft paper, professional product photography, white background, high quality",
    "JAR": "elegant flower arrangement in glass vase, mixed flowers in crystal vase, centerpiece, professional product photography, white background, high quality",
    "CST": "beautiful flower basket, wicker basket with mixed flowers arrangement, gift basket, professional product photography, white background, high quality",
    "LUX": "luxury premium flower arrangement, exotic flowers in elegant box, high-end floral design, professional product photography, white background, high quality",
    "CRP": "corporate flower arrangement, professional office flowers in modern vase, business gift flowers, professional product photography, white background, high quality"
}

# Lista de imágenes que necesitamos generar
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

def get_prompt_for_sku(sku: str) -> str:
    """Obtiene el prompt adecuado basado en el prefijo del SKU"""
    prefix = sku[:3]
    base_prompt = SKU_PROMPTS.get(prefix, "beautiful flower arrangement, professional product photography, white background, high quality")
    
    # Añadir variación basada en el número del SKU
    sku_num = sku[3:].replace(".webp", "")
    variations = [
        ", style variation 1, unique design",
        ", style variation 2, different angle",
        ", style variation 3, alternative colors",
        ", style variation 4, special edition",
        ", style variation 5, premium version",
        ", style variation 6, deluxe arrangement"
    ]
    try:
        var_idx = (int(sku_num) - 1) % len(variations)
        return base_prompt + variations[var_idx]
    except ValueError:
        return base_prompt

def generate_image(prompt: str, api_key: str, output_path: Path) -> bool:
    """Genera una imagen usando HuggingFace Inference API con marca de agua"""
    headers = {"Authorization": f"Bearer {api_key}"}
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "num_inference_steps": 30,
            "guidance_scale": 7.5,
            "width": 512,
            "height": 512
        }
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        
        if response.status_code == 200:
            # Guardar como PNG primero
            png_path = output_path.with_suffix('.png')
            with open(png_path, 'wb') as f:
                f.write(response.content)
            
            # Convertir a WebP y agregar marca de agua usando Pillow
            try:
                from PIL import Image, ImageEnhance
                
                # Abrir imagen generada
                img = Image.open(png_path).convert('RGBA')
                
                # Agregar marca de agua si existe
                if WATERMARK_PATH.exists():
                    watermark = Image.open(WATERMARK_PATH).convert('RGBA')
                    
                    # Redimensionar marca de agua (20% del ancho de la imagen)
                    wm_width = int(img.width * 0.25)
                    wm_ratio = wm_width / watermark.width
                    wm_height = int(watermark.height * wm_ratio)
                    watermark = watermark.resize((wm_width, wm_height), Image.Resampling.LANCZOS)
                    
                    # Hacer la marca de agua semi-transparente
                    alpha = watermark.split()[3]
                    alpha = ImageEnhance.Brightness(alpha).enhance(0.4)
                    watermark.putalpha(alpha)
                    
                    # Posición: esquina inferior derecha con padding
                    position = (img.width - wm_width - 15, img.height - wm_height - 15)
                    
                    # Pegar marca de agua
                    img.paste(watermark, position, watermark)
                
                # Guardar como WebP
                img = img.convert('RGB')
                img.save(output_path, 'WEBP', quality=85)
                png_path.unlink()  # Eliminar PNG temporal
                return True
                
            except ImportError:
                print("⚠️  Pillow no instalado. Imagen guardada como PNG sin marca de agua.")
                output_path.with_suffix('.png').rename(output_path)
                return True
                
        elif response.status_code == 503:
            # Modelo cargando, esperar
            print(f"   ⏳ Modelo cargando, esperando 20 segundos...")
            time.sleep(20)
            return generate_image(prompt, api_key, output_path)  # Reintentar
        else:
            print(f"   ❌ Error {response.status_code}: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"   ❌ Timeout al generar imagen")
        return False
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Generar imágenes de productos con HuggingFace')
    parser.add_argument('--api-key', type=str, help='HuggingFace API Key', 
                        default=os.environ.get('HF_API_KEY', ''))
    parser.add_argument('--dry-run', action='store_true', help='Solo mostrar qué se generaría')
    parser.add_argument('--limit', type=int, default=0, help='Limitar número de imágenes a generar')
    args = parser.parse_args()
    
    if not args.api_key and not args.dry_run:
        print("❌ Error: Se requiere API Key de HuggingFace")
        print("   Uso: python generate-product-images.py --api-key TU_API_KEY")
        print("   O establece la variable de entorno HF_API_KEY")
        print("   Obtén tu API key gratis en: https://huggingface.co/settings/tokens")
        sys.exit(1)
    
    # Crear directorio de salida si no existe
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Filtrar imágenes que ya existen
    images_to_generate = [img for img in MISSING_IMAGES if not (OUTPUT_DIR / img).exists()]
    
    if args.limit > 0:
        images_to_generate = images_to_generate[:args.limit]
    
    print(f"🌸 Generador de Imágenes - Flores Victoria")
    print(f"=" * 50)
    print(f"📁 Directorio de salida: {OUTPUT_DIR}")
    print(f"📷 Imágenes a generar: {len(images_to_generate)}")
    print()
    
    if args.dry_run:
        print("🔍 Modo Dry-Run - Prompts que se usarían:\n")
        for img in images_to_generate[:10]:
            prompt = get_prompt_for_sku(img)
            print(f"  {img}: {prompt[:80]}...")
        if len(images_to_generate) > 10:
            print(f"  ... y {len(images_to_generate) - 10} más")
        return
    
    # Generar imágenes
    success_count = 0
    fail_count = 0
    
    for i, img in enumerate(images_to_generate, 1):
        output_path = OUTPUT_DIR / img
        prompt = get_prompt_for_sku(img)
        
        print(f"[{i}/{len(images_to_generate)}] Generando {img}...")
        
        if generate_image(prompt, args.api_key, output_path):
            print(f"   ✅ Guardado: {output_path}")
            success_count += 1
        else:
            fail_count += 1
        
        # Pausa entre requests para no sobrecargar la API
        if i < len(images_to_generate):
            time.sleep(2)
    
    print()
    print(f"=" * 50)
    print(f"✅ Generadas exitosamente: {success_count}")
    print(f"❌ Fallidas: {fail_count}")
    print(f"📁 Directorio: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
