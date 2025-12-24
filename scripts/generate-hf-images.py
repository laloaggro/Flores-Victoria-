#!/usr/bin/env python3
"""
Flores Victoria - Generador de Imágenes con Hugging Face
Genera imágenes conceptuales/artísticas del proyecto usando modelos de IA

NOTA: Para diagramas técnicos precisos, usar generate-diagrams.py
Este script es para imágenes artísticas/conceptuales.

Instalación:
    pip install requests pillow

Uso:
    export HUGGINGFACE_TOKEN="tu-token"
    python generate-hf-images.py
"""

import os
import requests
import json
from pathlib import Path
import base64
from datetime import datetime

# Configuración - Usar router.huggingface.co
HF_API_BASE = "https://router.huggingface.co/hf-inference/models"
OUTPUT_DIR = Path("docs/diagrams/ai-generated")

# Modelos disponibles (gratuitos con rate limits)
MODELS = {
    "flux": "black-forest-labs/FLUX.1-schnell",
    "sdxl": "stabilityai/stable-diffusion-xl-base-1.0", 
    "sd2": "stabilityai/stable-diffusion-2-1",
    "sd15": "runwayml/stable-diffusion-v1-5",
}

# Prompts para diferentes aspectos del proyecto
PROMPTS = {
    "hero": {
        "prompt": "A beautiful modern e-commerce website interface for a flower shop, elegant design with roses and tulips, purple and pink color scheme, minimalist UI, professional photography quality, 4k, clean aesthetic",
        "filename": "flores-victoria-hero"
    },
    "architecture": {
        "prompt": "Abstract visualization of cloud computing architecture, interconnected nodes and services, modern tech illustration, blue and purple gradient, flowing data streams, microservices concept, digital art style",
        "filename": "microservices-concept"
    },
    "flowers": {
        "prompt": "Stunning bouquet of fresh flowers, roses, tulips, and lilies, professional florist arrangement, soft natural lighting, pink and white colors, elegant gift wrapping, product photography style",
        "filename": "product-showcase"
    },
    "delivery": {
        "prompt": "Modern flower delivery service illustration, delivery person with beautiful bouquet, urban setting, happy customer receiving flowers, warm and friendly atmosphere, digital illustration style",
        "filename": "delivery-service"
    },
    "dashboard": {
        "prompt": "Modern admin dashboard interface design, analytics charts and graphs, dark mode UI, e-commerce statistics, purple accent color, clean minimal design, UI mockup style",
        "filename": "admin-dashboard"
    },
    "security": {
        "prompt": "Digital security concept illustration, shield protecting data, encrypted connections, modern cybersecurity visualization, blue and green neon colors, tech illustration style",
        "filename": "security-concept"
    },
    "team": {
        "prompt": "Diverse team of developers working together, modern office environment, collaborative atmosphere, laptops and monitors, startup culture, professional photography style",
        "filename": "team-collaboration"
    },
    "mobile": {
        "prompt": "Mobile app mockup for flower shop, smartphone displaying beautiful floral products, clean UI design, floating flowers around device, product showcase style",
        "filename": "mobile-app"
    }
}


def get_headers():
    """Obtiene headers con autenticación"""
    token = os.environ.get("HUGGINGFACE_TOKEN", os.environ.get("HF_TOKEN", ""))
    if not token:
        print("⚠️  HUGGINGFACE_TOKEN no configurado. Usando API pública (rate limited)")
        return {"Content-Type": "application/json"}
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }


def generate_image(prompt: str, model_key: str = "flux") -> bytes | None:
    """Genera una imagen usando Hugging Face Inference API"""
    model = MODELS.get(model_key, MODELS["flux"])
    
    # Usar router.huggingface.co (nuevo endpoint)
    url = f"{HF_API_BASE}/{model}"
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "num_inference_steps": 25,
            "guidance_scale": 7.5,
        }
    }
    
    try:
        print(f"   🔗 Conectando a: {url}")
        response = requests.post(url, headers=get_headers(), json=payload, timeout=180)
        
        if response.status_code == 200:
            return response.content
        elif response.status_code == 503:
            # Modelo cargándose
            print(f"   ⏳ Modelo cargándose, esperando...")
            import time
            time.sleep(20)
            return generate_image(prompt, model_key)
        else:
            print(f"   ❌ Error {response.status_code}: {response.text[:200]}")
            return None
            
    except requests.exceptions.Timeout:
        print("   ⏱️ Timeout - el modelo tardó demasiado")
        return None
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None


def save_image(image_data: bytes, filename: str) -> str:
    """Guarda la imagen en disco"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    filepath = OUTPUT_DIR / f"{filename}.png"
    with open(filepath, "wb") as f:
        f.write(image_data)
    
    return str(filepath)


def generate_all_images(model_key: str = "flux"):
    """Genera todas las imágenes del proyecto"""
    print(f"\n🎨 Generador de Imágenes Flores Victoria")
    print(f"   Modelo: {MODELS.get(model_key, model_key)}")
    print(f"   Output: {OUTPUT_DIR}/\n")
    
    results = []
    
    for key, config in PROMPTS.items():
        print(f"📷 Generando: {config['filename']}...")
        
        image_data = generate_image(config["prompt"], model_key)
        
        if image_data:
            filepath = save_image(image_data, config["filename"])
            print(f"   ✅ Guardado: {filepath}")
            results.append({"name": key, "file": filepath, "status": "success"})
        else:
            print(f"   ❌ Falló")
            results.append({"name": key, "file": None, "status": "failed"})
    
    # Resumen
    success = sum(1 for r in results if r["status"] == "success")
    print(f"\n📊 Resumen: {success}/{len(results)} imágenes generadas")
    
    # Guardar metadata
    metadata = {
        "generated_at": datetime.now().isoformat(),
        "model": MODELS.get(model_key, model_key),
        "results": results
    }
    
    with open(OUTPUT_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    
    return results


def generate_single(prompt_key: str, model_key: str = "flux"):
    """Genera una sola imagen"""
    if prompt_key not in PROMPTS:
        print(f"❌ Prompt '{prompt_key}' no encontrado")
        print(f"   Disponibles: {', '.join(PROMPTS.keys())}")
        return
    
    config = PROMPTS[prompt_key]
    print(f"📷 Generando: {config['filename']}...")
    
    image_data = generate_image(config["prompt"], model_key)
    
    if image_data:
        filepath = save_image(image_data, config["filename"])
        print(f"✅ Guardado: {filepath}")
    else:
        print("❌ Falló la generación")


def generate_custom(prompt: str, filename: str, model_key: str = "flux"):
    """Genera imagen con prompt personalizado"""
    print(f"📷 Generando imagen personalizada...")
    
    image_data = generate_image(prompt, model_key)
    
    if image_data:
        filepath = save_image(image_data, filename)
        print(f"✅ Guardado: {filepath}")
    else:
        print("❌ Falló la generación")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--list":
            print("📋 Prompts disponibles:")
            for key, config in PROMPTS.items():
                print(f"   • {key}: {config['filename']}")
        
        elif command == "--single" and len(sys.argv) > 2:
            generate_single(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "flux")
        
        elif command == "--custom" and len(sys.argv) > 3:
            generate_custom(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else "flux")
        
        elif command == "--help":
            print("""
🌸 Flores Victoria - Generador de Imágenes con Hugging Face

Uso:
    python generate-hf-images.py              # Genera todas las imágenes
    python generate-hf-images.py --list       # Lista prompts disponibles
    python generate-hf-images.py --single <prompt_key> [model]
    python generate-hf-images.py --custom "<prompt>" <filename> [model]
    
Modelos disponibles:
    flux  - FLUX.1 schnell (rápido, buena calidad)
    sdxl  - Stable Diffusion XL (alta calidad)
    sd2   - Stable Diffusion 2.1 (compatible)

Configuración:
    export HUGGINGFACE_TOKEN="hf_xxxx"  # Token de HF (opcional pero recomendado)
    
Ejemplos:
    python generate-hf-images.py --single hero flux
    python generate-hf-images.py --custom "beautiful roses" my-roses sdxl
""")
        else:
            print("❌ Comando no reconocido. Usa --help para ver opciones.")
    else:
        # Generar todas las imágenes
        generate_all_images("flux")
