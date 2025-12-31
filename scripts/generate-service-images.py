#!/usr/bin/env python3
"""
Generador de imágenes de servicios para Flores Victoria
Usa Hugging Face Stable Diffusion XL
"""

import os
import requests
from pathlib import Path
import time

# Configuración
HF_API_BASE = "https://router.huggingface.co/hf-inference/models"
MODEL = "stabilityai/stable-diffusion-xl-base-1.0"
OUTPUT_DIR = Path("docs/diagrams/ai-generated/services")

# Prompts para cada servicio
SERVICE_PROMPTS = {
    "auth": {
        "prompt": "Digital security concept, glowing padlock with fingerprint scan, cyber security authentication system, blue and purple neon colors, futuristic tech illustration, abstract digital art, high quality",
        "filename": "service-auth"
    },
    "user": {
        "prompt": "Abstract user profile management concept, minimalist avatar icons in a network, connected people illustration, modern clean UI design, soft purple gradient background, digital art",
        "filename": "service-user"
    },
    "product": {
        "prompt": "Luxurious flower bouquet arrangement with roses tulips and lilies, elegant product photography style, soft professional studio lighting, premium florist display, high end floral shop",
        "filename": "service-product"
    },
    "order": {
        "prompt": "Package delivery and order tracking concept, elegant gift boxes with satin ribbons, shipping and logistics modern illustration, warm inviting colors, e-commerce fulfillment",
        "filename": "service-order"
    },
    "cart": {
        "prompt": "Elegant shopping cart filled with beautiful flowers, e-commerce checkout concept, minimalist modern design, purple and pink pastel gradient, clean illustration style",
        "filename": "service-cart"
    },
    "payment": {
        "prompt": "Secure digital payment processing concept, credit card with protective shield icon, online transaction illustration, fintech modern design, green and blue trustworthy colors",
        "filename": "service-payment"
    },
    "notification": {
        "prompt": "Glowing notification bell with alert badges, push notification mobile concept, communication app illustration, modern clean design, orange and warm yellow colors",
        "filename": "service-notification"
    },
    "review": {
        "prompt": "Five golden stars customer rating concept, glowing review stars, feedback and testimonials illustration, quality excellence badge, yellow gold premium colors",
        "filename": "service-review"
    },
    "wishlist": {
        "prompt": "Glowing red heart surrounded by beautiful flowers, wishlist favorites concept, love and appreciation romantic illustration, pink and red gradient, elegant valentine style",
        "filename": "service-wishlist"
    },
    "promotion": {
        "prompt": "Vibrant sale discount tag with celebration confetti, promotional offer marketing concept, special deal badge illustration, exciting bright colors, festive design",
        "filename": "service-promotion"
    },
    "gateway": {
        "prompt": "Network API gateway concept, central hub with interconnected glowing nodes, data flow visualization, cloud architecture illustration, blue purple tech colors",
        "filename": "service-api-gateway"
    },
    "database": {
        "prompt": "Modern database storage concept, glowing cylindrical data containers, organized information architecture visualization, tech illustration, blue cyan colors",
        "filename": "service-database"
    },
    "contact": {
        "prompt": "Customer support contact concept, elegant envelope with flowers, communication and messaging illustration, friendly warm colors, modern clean design",
        "filename": "service-contact"
    }
}

def get_token():
    """Obtiene el token de HuggingFace"""
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        raise ValueError("Set HF_TOKEN environment variable")
    return token

def generate_image(prompt: str) -> bytes | None:
    """Genera una imagen usando HuggingFace API"""
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
            print("   ⏳ Modelo cargando, esperando 30s...")
            time.sleep(30)
            return generate_image(prompt)
        else:
            print(f"   ❌ Error {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

def main():
    """Genera todas las imágenes de servicios"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("🎨 Generando imágenes de servicios con Hugging Face SDXL\n")
    
    generated = []
    failed = []
    
    for service_key, config in SERVICE_PROMPTS.items():
        filename = config["filename"]
        filepath = OUTPUT_DIR / f"{filename}.png"
        
        # Skip si ya existe
        if filepath.exists():
            print(f"⏭️  {filename} ya existe, saltando...")
            continue
        
        print(f"📷 Generando: {filename}...")
        
        image_data = generate_image(config["prompt"])
        
        if image_data:
            with open(filepath, "wb") as f:
                f.write(image_data)
            print(f"   ✅ Guardado: {filepath}")
            generated.append(filename)
            
            # Esperar entre requests para no saturar la API
            time.sleep(2)
        else:
            failed.append(filename)
    
    print(f"\n📊 Resumen:")
    print(f"   ✅ Generadas: {len(generated)}")
    print(f"   ❌ Fallidas: {len(failed)}")
    
    if failed:
        print(f"   Fallidas: {', '.join(failed)}")

if __name__ == "__main__":
    main()
