#!/usr/bin/env python3
"""
Script para GENERAR una imagen completamente nueva usando IA de Hugging Face
Crea una imagen artística de flores para la página about.html
"""

import os
import sys
import requests
from pathlib import Path
from PIL import Image
import io
import time

# Cargar variables de entorno desde .env
try:
    from dotenv import load_dotenv
    project_root = Path(__file__).parent.parent
    env_path = project_root / '.env'
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Variables de entorno cargadas desde: {env_path}")
except ImportError:
    print("⚠️  python-dotenv no instalado")

def generate_image_with_hf(prompt, output_path, style="realistic"):
    """
    Genera una imagen nueva usando modelos de IA de Hugging Face
    """
    # Obtener token
    HF_TOKEN = (os.environ.get("HF_TOKEN") or 
               os.environ.get("HUGGING_FACE_TOKEN") or 
               os.environ.get("HUGGINGFACE_API_KEY"))
    
    if not HF_TOKEN:
        print("❌ Token de Hugging Face no encontrado")
        print("💡 Agrega el token al archivo .env")
        return False
    
    print(f"🔑 Token encontrado: {HF_TOKEN[:10]}...")
    
    # Modelos disponibles de Hugging Face (usando modelos más ligeros y rápidos)
    models = {
        "realistic": "CompVis/stable-diffusion-v1-4",
        "artistic": "runwayml/stable-diffusion-v1-5",
        "modern": "stabilityai/stable-diffusion-2-1",
    }
    
    model = models.get(style, models["realistic"])
    # Usar API de inferencia oficial de Hugging Face
    # Nota: La API antigua api-inference.huggingface.co ya no funciona
    API_URL = f"https://api-inference.huggingface.co/models/{model}"
    
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    
    print(f"\n🎨 Generando imagen con IA...")
    print(f"📝 Prompt: {prompt}")
    print(f"🤖 Modelo: {model}")
    print(f"🔗 API URL: {API_URL}")
    print(f"⏳ Esto puede tomar 20-60 segundos...")
    
    # Simplificar payload - solo enviar el texto
    payload = {"inputs": prompt}
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        
        if response.status_code == 200:
            # Guardar imagen generada
            image = Image.open(io.BytesIO(response.content))
            
            # Redimensionar a tamaño apropiado para web
            image = image.resize((3072, 2048), Image.Resampling.LANCZOS)
            
            # Guardar como WEBP de alta calidad
            image.save(output_path, "WEBP", quality=95, method=6)
            
            print(f"✅ Imagen generada exitosamente: {output_path}")
            print(f"📐 Tamaño: {image.size[0]}x{image.size[1]}")
            return True
            
        elif response.status_code == 503:
            print(f"⏳ Modelo cargándose (código {response.status_code})")
            print(f"💡 Los modelos de HF se cargan bajo demanda. Puede tomar 1-2 minutos.")
            print(f"🔄 Reintentando en 20 segundos...")
            time.sleep(20)
            
            # Reintentar una vez
            response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
            if response.status_code == 200:
                image = Image.open(io.BytesIO(response.content))
                image = image.resize((3072, 2048), Image.Resampling.LANCZOS)
                image.save(output_path, "WEBP", quality=95, method=6)
                print(f"✅ Imagen generada exitosamente: {output_path}")
                return True
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Mensaje: {response.text[:500]}")
                return False
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Mensaje: {response.text[:500]}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Timeout al generar imagen")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 70)
    print("🌸 GENERACIÓN DE IMAGEN NUEVA CON IA - HUGGING FACE")
    print("=" * 70)
    
    # Directorio del proyecto
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "scripts"
    output_file = output_dir / "flowers-scatter-ai-generated.webp"
    
    # Prompts disponibles
    prompts = {
        "1": {
            "text": "Beautiful arrangement of fresh colorful flowers including roses, lilies, and daisies scattered naturally on white background, professional photography, soft natural lighting, high detail, vibrant colors, florist shop style",
            "desc": "Arreglo profesional de flores frescas y coloridas (estilo clásico)"
        },
        "2": {
            "text": "Elegant scattered flower petals and blooms in pink, red and white tones, romantic atmosphere, soft bokeh background, professional product photography, natural daylight, premium quality, flowers victoria brand style",
            "desc": "Pétalos elegantes dispersos (estilo romántico)"
        },
        "3": {
            "text": "Artistic close-up of fresh cut flowers bouquet with roses, carnations and greenery, professional florist arrangement, clean bright background, catalog photography, high resolution, Chile flower shop aesthetic",
            "desc": "Close-up artístico de bouquet profesional (estilo catálogo)"
        },
        "4": {
            "text": "Modern minimalist flower arrangement with fresh roses and eucalyptus leaves, scattered on marble surface, natural window light, professional commercial photography, elegant and clean aesthetic, boutique flower shop style",
            "desc": "Arreglo moderno minimalista (estilo boutique)"
        },
        "5": {
            "text": "Vibrant collection of mixed fresh flowers including sunflowers, gerberas, and roses, artfully scattered arrangement, bright cheerful colors, studio photography with soft shadows, premium flower delivery service aesthetic",
            "desc": "Colección vibrante mixta (estilo alegre)"
        }
    }
    
    print("\n📋 Selecciona el tipo de imagen que deseas generar:\n")
    for key, value in prompts.items():
        print(f"  {key}. {value['desc']}")
    
    print("\n" + "=" * 70)
    choice = input("Ingresa el número (1-5) o presiona Enter para opción 2: ").strip() or "2"
    
    if choice not in prompts:
        print("❌ Opción inválida, usando opción 2 por defecto")
        choice = "2"
    
    selected_prompt = prompts[choice]
    print(f"\n✅ Seleccionado: {selected_prompt['desc']}")
    
    # Generar imagen
    success = generate_image_with_hf(selected_prompt["text"], output_file, style="realistic")
    
    if success:
        print("\n" + "=" * 70)
        print("✅ IMAGEN GENERADA EXITOSAMENTE")
        print("=" * 70)
        print(f"\n📁 Imagen guardada en: {output_file}")
        print(f"\n📝 Próximos pasos:")
        print(f"1. Revisa la imagen generada: {output_file.name}")
        print(f"2. Si te gusta, cópiala a las ubicaciones del proyecto:")
        print(f"   cp {output_file} frontend/images/flowers-scatter.webp")
        print(f"   cp {output_file} frontend/public/images/flowers-scatter.webp")
        print(f"3. Si no te gusta, ejecuta de nuevo y elige otra opción")
        
        # Preguntar si quiere copiar automáticamente
        print(f"\n" + "=" * 70)
        replace = input("¿Quieres reemplazar la imagen actual automáticamente? (s/N): ").strip().lower()
        
        if replace == 's':
            from shutil import copy2
            
            frontend_images = project_root / "frontend" / "images"
            frontend_public_images = project_root / "frontend" / "public" / "images"
            
            dest1 = frontend_images / "flowers-scatter.webp"
            dest2 = frontend_public_images / "flowers-scatter.webp"
            
            # Crear backup
            if dest1.exists():
                copy2(dest1, frontend_images / f"flowers-scatter-backup-{int(time.time())}.webp")
                print(f"💾 Backup creado en frontend/images/")
            
            if dest2.exists():
                copy2(dest2, frontend_public_images / f"flowers-scatter-backup-{int(time.time())}.webp")
                print(f"💾 Backup creado en frontend/public/images/")
            
            # Copiar nueva imagen
            copy2(output_file, dest1)
            copy2(output_file, dest2)
            
            print(f"✅ Imagen reemplazada en: {dest1}")
            print(f"✅ Imagen reemplazada en: {dest2}")
            print(f"\n🎉 ¡Listo! La nueva imagen ya está en la página about.html")
    else:
        print("\n❌ No se pudo generar la imagen")
        print("💡 Verifica:")
        print("  1. Que el token de HF sea válido")
        print("  2. Que tengas conexión a internet")
        print("  3. Que el token tenga permisos de lectura")

if __name__ == "__main__":
    main()
