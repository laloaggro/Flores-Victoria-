#!/usr/bin/env python3
"""
Flores Victoria - Generador de Imágenes de Productos con Hugging Face
Genera imágenes de alta calidad para productos florales usando IA

Instalación:
    pip install requests pillow

Uso:
    export HUGGINGFACE_TOKEN="tu-token"
    python generate-product-images-hf.py --list          # Ver productos sin imagen adecuada
    python generate-product-images-hf.py --generate      # Generar imágenes faltantes
    python generate-product-images-hf.py --product KIT001  # Generar imagen específica
"""

import os
import sys
import requests
import json
import argparse
from pathlib import Path
from datetime import datetime
import time

# Configuración
HF_API_BASE = "https://router.huggingface.co/hf-inference/models"
OUTPUT_DIR = Path("frontend/images/products/generated-hf")
FINAL_DIR = Path("frontend/images/products/final")

# Modelos disponibles
MODELS = {
    "flux": "black-forest-labs/FLUX.1-schnell",
    "sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
}

# Categorías de productos y sus prompts base
CATEGORY_PROMPTS = {
    "rosas": "Beautiful arrangement of fresh roses, {color} roses, professional florist work, elegant vase, soft natural lighting, product photography, 4k quality, white background",
    "tulipanes": "Stunning tulip bouquet, fresh {color} tulips, spring flowers, elegant arrangement, professional product photography, clean background, high quality",
    "bouquets": "Luxurious mixed flower bouquet, {description}, professional florist arrangement, beautiful wrapping, soft lighting, product showcase, 4k",
    "orquideas": "Elegant orchid arrangement, phalaenopsis orchids, {color} orchids in decorative pot, minimalist style, professional photography, white background",
    "girasoles": "Bright sunflower arrangement, cheerful yellow sunflowers, rustic style vase, natural lighting, warm atmosphere, product photography",
    "lirios": "Elegant lily arrangement, fresh {color} lilies, sophisticated vase, professional florist work, soft lighting, high quality image",
    "tropicales": "Exotic tropical flower arrangement, bird of paradise, heliconias, anthuriums, vibrant colors, modern vase, professional photography",
    "kits": "Gift set with flowers, {description}, beautiful presentation, ribbon and wrapping, romantic setup, product photography, 4k",
    "plantas": "Beautiful {description}, healthy green plant, decorative pot, indoor plant photography, natural lighting, clean background",
    "sustentables": "Eco-friendly flower arrangement, sustainable floristry, natural materials, organic style, earth tones, professional photography",
    "temporada": "Seasonal flower arrangement, {description}, festive decoration, professional florist work, holiday atmosphere, product photography",
    "funeral": "Elegant sympathy flowers, white lilies and roses, peaceful arrangement, respectful presentation, soft lighting, professional photography",
    "bodas": "Wedding flower arrangement, {description}, elegant bridal flowers, romantic style, soft pink and white, professional wedding photography",
    "cumpleanos": "Birthday flower arrangement, colorful and cheerful bouquet, {description}, festive presentation, bright colors, product photography",
    "amor": "Romantic flower arrangement, red roses and hearts, love theme, elegant presentation, soft romantic lighting, Valentine style",
    "aniversario": "Anniversary flowers, elegant rose arrangement, gold accents, sophisticated style, romantic atmosphere, professional photography",
    "default": "Beautiful flower arrangement, fresh flowers, professional florist work, elegant vase, soft natural lighting, product photography, 4k quality"
}

# Productos que necesitan imágenes nuevas (agregar IDs aquí)
PRODUCTS_TO_UPDATE = [
    # Formato: {"id": "XXX001", "category": "categoria", "name": "nombre", "description": "descripción adicional", "color": "color"}
]


def get_headers():
    """Obtiene headers con autenticación"""
    token = os.environ.get("HUGGINGFACE_TOKEN", os.environ.get("HF_TOKEN", ""))
    if not token:
        print("⚠️  HUGGINGFACE_TOKEN no configurado")
        print("   Obtén tu token en: https://huggingface.co/settings/tokens")
        sys.exit(1)
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }


def generate_prompt(category: str, name: str, description: str = "", color: str = "mixed colors") -> str:
    """Genera un prompt optimizado para el producto"""
    base_prompt = CATEGORY_PROMPTS.get(category, CATEGORY_PROMPTS["default"])
    
    # Reemplazar placeholders
    prompt = base_prompt.format(
        description=description or name,
        color=color
    )
    
    # Agregar mejoras de calidad
    quality_suffix = ", sharp focus, vibrant colors, no text, no watermark, centered composition"
    
    return prompt + quality_suffix


def generate_image(prompt: str, model_key: str = "flux", retries: int = 3) -> bytes | None:
    """Genera una imagen usando Hugging Face Inference API"""
    model = MODELS.get(model_key, MODELS["flux"])
    url = f"{HF_API_BASE}/{model}"
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "num_inference_steps": 30,
            "guidance_scale": 7.5,
            "width": 1024,
            "height": 1024,
        }
    }
    
    for attempt in range(retries):
        try:
            print(f"   🔗 Intento {attempt + 1}/{retries}...")
            response = requests.post(url, headers=get_headers(), json=payload, timeout=300)
            
            if response.status_code == 200:
                return response.content
            elif response.status_code == 503:
                print(f"   ⏳ Modelo cargándose, esperando 30s...")
                time.sleep(30)
            elif response.status_code == 429:
                print(f"   ⏳ Rate limited, esperando 60s...")
                time.sleep(60)
            else:
                print(f"   ❌ Error {response.status_code}: {response.text[:200]}")
                
        except requests.exceptions.Timeout:
            print("   ⏱️ Timeout - reintentando...")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    return None


def save_image(image_data: bytes, product_id: str) -> str:
    """Guarda la imagen generada"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Guardar como PNG primero
    png_path = OUTPUT_DIR / f"{product_id}.png"
    with open(png_path, "wb") as f:
        f.write(image_data)
    
    # Convertir a WebP para producción
    try:
        from PIL import Image
        img = Image.open(png_path)
        webp_path = OUTPUT_DIR / f"{product_id}.webp"
        img.save(webp_path, "WEBP", quality=90)
        print(f"   ✅ Guardado: {webp_path}")
        return str(webp_path)
    except ImportError:
        print(f"   ✅ Guardado: {png_path} (instala pillow para WebP)")
        return str(png_path)


def list_products_needing_images():
    """Lista productos que podrían necesitar nuevas imágenes"""
    print("\n📋 Productos en PRODUCTS_TO_UPDATE:")
    
    if not PRODUCTS_TO_UPDATE:
        print("   (vacío) - Agrega productos al array PRODUCTS_TO_UPDATE")
        print("\n   Ejemplo:")
        print('   {"id": "KIT001", "category": "kits", "name": "Kit Romántico", "description": "rosas rojas con chocolates", "color": "red"}')
    else:
        for p in PRODUCTS_TO_UPDATE:
            print(f"   - {p['id']}: {p['name']} ({p['category']})")
    
    print("\n📁 Imágenes existentes en generated-hf/:")
    if OUTPUT_DIR.exists():
        images = list(OUTPUT_DIR.glob("*.webp")) + list(OUTPUT_DIR.glob("*.png"))
        for img in sorted(images)[:20]:
            print(f"   - {img.name}")
        if len(images) > 20:
            print(f"   ... y {len(images) - 20} más")
    else:
        print("   (carpeta vacía)")


def generate_for_product(product: dict, model_key: str = "flux"):
    """Genera imagen para un producto específico"""
    product_id = product["id"]
    category = product.get("category", "default")
    name = product.get("name", product_id)
    description = product.get("description", "")
    color = product.get("color", "mixed colors")
    
    print(f"\n🌸 Generando imagen para: {name} ({product_id})")
    
    # Generar prompt
    prompt = generate_prompt(category, name, description, color)
    print(f"   📝 Prompt: {prompt[:100]}...")
    
    # Generar imagen
    image_data = generate_image(prompt, model_key)
    
    if image_data:
        filepath = save_image(image_data, product_id)
        return {"id": product_id, "file": filepath, "status": "success"}
    else:
        print(f"   ❌ Falló la generación")
        return {"id": product_id, "file": None, "status": "failed"}


def generate_all():
    """Genera imágenes para todos los productos en PRODUCTS_TO_UPDATE"""
    if not PRODUCTS_TO_UPDATE:
        print("❌ No hay productos en PRODUCTS_TO_UPDATE")
        print("   Edita el script y agrega productos al array")
        return
    
    print(f"\n🎨 Generando {len(PRODUCTS_TO_UPDATE)} imágenes...")
    
    results = []
    for product in PRODUCTS_TO_UPDATE:
        result = generate_for_product(product)
        results.append(result)
        
        # Rate limiting
        if result["status"] == "success":
            print("   ⏳ Esperando 5s antes de la siguiente...")
            time.sleep(5)
    
    # Resumen
    success = sum(1 for r in results if r["status"] == "success")
    print(f"\n📊 Resumen: {success}/{len(results)} imágenes generadas")
    
    if success > 0:
        print(f"\n📁 Imágenes guardadas en: {OUTPUT_DIR}/")
        print("   Para usar en producción, copia a frontend/images/products/final/")


def generate_single(product_id: str, category: str = "default", name: str = "", description: str = "", color: str = ""):
    """Genera una sola imagen por ID"""
    product = {
        "id": product_id,
        "category": category,
        "name": name or product_id,
        "description": description,
        "color": color or "mixed colors"
    }
    generate_for_product(product)


def main():
    parser = argparse.ArgumentParser(description="Genera imágenes de productos con Hugging Face")
    parser.add_argument("--list", action="store_true", help="Lista productos pendientes")
    parser.add_argument("--generate", action="store_true", help="Genera todas las imágenes pendientes")
    parser.add_argument("--product", type=str, help="ID de producto específico")
    parser.add_argument("--category", type=str, default="default", help="Categoría del producto")
    parser.add_argument("--name", type=str, default="", help="Nombre del producto")
    parser.add_argument("--description", type=str, default="", help="Descripción adicional")
    parser.add_argument("--color", type=str, default="", help="Color principal")
    parser.add_argument("--model", type=str, default="flux", choices=["flux", "sdxl"], help="Modelo a usar")
    
    args = parser.parse_args()
    
    if args.list:
        list_products_needing_images()
    elif args.generate:
        generate_all()
    elif args.product:
        generate_single(args.product, args.category, args.name, args.description, args.color)
    else:
        parser.print_help()
        print("\n📌 Ejemplos:")
        print("   python generate-product-images-hf.py --list")
        print("   python generate-product-images-hf.py --product KIT001 --category kits --name 'Kit Romántico' --description 'rosas rojas con chocolates'")
        print("   python generate-product-images-hf.py --generate")


if __name__ == "__main__":
    main()
