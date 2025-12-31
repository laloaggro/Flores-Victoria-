#!/usr/bin/env python3
"""
Generador de imágenes de productos florales para Flores Victoria
"""

import os
import requests
from pathlib import Path
import time

HF_API_BASE = "https://router.huggingface.co/hf-inference/models"
MODEL = "stabilityai/stable-diffusion-xl-base-1.0"
OUTPUT_DIR = Path("docs/diagrams/ai-generated/products")

PRODUCT_PROMPTS = {
    "roses-bouquet": {
        "prompt": "Elegant luxury red roses bouquet, dozen roses wrapped in premium paper, romantic floral arrangement, professional florist photography, soft studio lighting, white background",
        "filename": "product-roses-bouquet"
    },
    "tulips-arrangement": {
        "prompt": "Fresh colorful tulips arrangement in glass vase, spring flowers, pink yellow and white tulips, elegant floral design, professional product photography, clean background",
        "filename": "product-tulips"
    },
    "orchids-premium": {
        "prompt": "Exotic white orchid plant in elegant pot, premium orchid phalaenopsis, luxury indoor plant, minimalist modern style, professional photography, clean white background",
        "filename": "product-orchids"
    },
    "mixed-garden": {
        "prompt": "Colorful mixed flower garden bouquet, sunflowers daisies and wildflowers, cheerful summer arrangement, rustic wrapped in kraft paper, natural daylight photography",
        "filename": "product-mixed-garden"
    },
    "wedding-bouquet": {
        "prompt": "Elegant bridal wedding bouquet, white roses and peonies with eucalyptus, romantic luxury arrangement, professional wedding photography, soft dreamy lighting",
        "filename": "product-wedding"
    },
    "sympathy-arrangement": {
        "prompt": "Elegant white lilies sympathy arrangement, peaceful funeral flowers, white and green floral tribute, respectful and serene, soft diffused lighting",
        "filename": "product-sympathy"
    },
    "tropical-exotic": {
        "prompt": "Exotic tropical flower arrangement, birds of paradise heliconia and anthuriums, vibrant bold colors, modern luxury vase, professional product photography",
        "filename": "product-tropical"
    },
    "birthday-celebration": {
        "prompt": "Festive birthday flower arrangement, colorful gerbera daisies and roses, celebration bouquet with ribbon, bright cheerful colors, party atmosphere",
        "filename": "product-birthday"
    },
    "succulent-garden": {
        "prompt": "Modern succulent garden arrangement, various succulents in geometric concrete planter, minimalist contemporary design, clean product photography",
        "filename": "product-succulents"
    },
    "gift-box": {
        "prompt": "Luxury flower gift box, roses arranged in elegant hat box, premium presentation, pink and gold colors, gift wrapping ribbon, professional photography",
        "filename": "product-gift-box"
    }
}

def get_token():
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        raise ValueError("Set HF_TOKEN environment variable")
    return token

def generate_image(prompt: str) -> bytes | None:
    url = f"{HF_API_BASE}/{MODEL}"
    headers = {
        "Authorization": f"Bearer {get_token()}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "num_inference_steps": 30,
            "guidance_scale": 7.5,
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=180)
        if response.status_code == 200:
            return response.content
        elif response.status_code == 503:
            print("   ⏳ Modelo cargando...")
            time.sleep(30)
            return generate_image(prompt)
        else:
            print(f"   ❌ Error {response.status_code}")
            return None
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("🌸 Generando imágenes de productos florales\n")
    
    generated = []
    
    for key, config in PRODUCT_PROMPTS.items():
        filename = config["filename"]
        filepath = OUTPUT_DIR / f"{filename}.png"
        
        if filepath.exists():
            print(f"⏭️  {filename} ya existe")
            continue
        
        print(f"📷 Generando: {filename}...")
        
        image_data = generate_image(config["prompt"])
        
        if image_data:
            with open(filepath, "wb") as f:
                f.write(image_data)
            print(f"   ✅ Guardado: {filepath}")
            generated.append(filename)
            time.sleep(2)
    
    print(f"\n✅ Generadas: {len(generated)} imágenes de productos")

if __name__ == "__main__":
    main()
