#!/usr/bin/env python3
"""
Script para mejorar la imagen flowers-scatter.webp usando modelos de Hugging Face
Utiliza modelos de super-resolución y mejora de calidad
"""

import os
import sys
import requests
from pathlib import Path
from PIL import Image
import io

# Cargar variables de entorno desde .env
try:
    from dotenv import load_dotenv
    # Buscar .env en la raíz del proyecto
    project_root = Path(__file__).parent.parent
    env_path = project_root / '.env'
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Variables de entorno cargadas desde: {env_path}")
    else:
        print(f"⚠️  Archivo .env no encontrado en: {env_path}")
except ImportError:
    print("⚠️  python-dotenv no instalado. Ejecuta: pip install python-dotenv")
    print("   Usando variables de entorno del sistema...")

def download_image(url, output_path):
    """Descarga una imagen desde una URL"""
    print(f"📥 Descargando imagen desde: {url}")
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print(f"✅ Imagen descargada: {output_path}")
    return output_path

def enhance_image_with_hf(input_path, output_path):
    """
    Mejora la imagen usando modelos de Hugging Face
    Opciones:
    1. Real-ESRGAN: Super-resolución
    2. Stable Diffusion: Mejora de calidad
    """
    print("🤖 Intentando usar API de Hugging Face...")
    
    # Opción: Usar API de Hugging Face Inference
    API_URL = "https://api-inference.huggingface.co/models/caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr"
    
    # Cargar imagen original para info
    image = Image.open(input_path)
    original_size = image.size
    print(f"📐 Tamaño original: {original_size[0]}x{original_size[1]}")
    
    # Leer la imagen como bytes
    with open(input_path, "rb") as f:
        img_bytes = f.read()
    
    # Obtener token de Hugging Face desde variables de entorno
    # Buscar en múltiples nombres de variables
    HF_TOKEN = (os.environ.get("HF_TOKEN") or 
               os.environ.get("HUGGING_FACE_TOKEN") or 
               os.environ.get("HUGGINGFACE_API_KEY"))
    
    if HF_TOKEN:
        print(f"🔑 Token de Hugging Face encontrado: {HF_TOKEN[:10]}...")
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        
        try:
            print("🚀 Enviando imagen a Hugging Face para super-resolución 4x...")
            print("⏳ Esto puede tomar 10-30 segundos...")
            
            response = requests.post(API_URL, headers=headers, data=img_bytes, timeout=60)
            
            if response.status_code == 200:
                enhanced_image = Image.open(io.BytesIO(response.content))
                enhanced_image.save(output_path, "WEBP", quality=95, method=6)
                print(f"✅ Imagen mejorada con IA guardada: {output_path}")
                print(f"📐 Tamaño mejorado: {enhanced_image.size[0]}x{enhanced_image.size[1]}")
                print(f"🎯 Mejora aplicada: Super-resolución 4x con modelo Swin2SR")
                return True
            elif response.status_code == 503:
                print(f"⚠️  Modelo cargándose en HF: {response.status_code}")
                print(f"💡 El modelo está inicializándose. Espera ~20s y reintenta.")
                print(f"🔄 Aplicando mejoras locales mientras tanto...")
            else:
                print(f"⚠️  Error en API: {response.status_code}")
                print(f"Mensaje: {response.text[:200]}")
                print("🔄 Aplicando mejoras locales como alternativa...")
        except requests.exceptions.Timeout:
            print("⚠️  Timeout al conectar con Hugging Face API")
            print("🔄 Aplicando mejoras locales...")
        except Exception as e:
            print(f"⚠️  Error al usar API HF: {e}")
            print("🔄 Aplicando mejoras locales...")
    else:
        print("⚠️  Token de Hugging Face no encontrado en .env")
        print("💡 El token está guardado como: HUGGINGFACE_API_KEY, HF_TOKEN, o HUGGING_FACE_TOKEN")
        print("🔄 Usando mejoras locales como alternativa...")
    
    # Fallback: Mejoras locales con PIL
    print("📊 Aplicando mejoras locales con PIL...")
    image = Image.open(input_path)
    
    # Aumentar resolución 2x
    new_size = (image.size[0] * 2, image.size[1] * 2)
    enhanced = image.resize(new_size, Image.Resampling.LANCZOS)
    
    # Mejorar nitidez
    from PIL import ImageEnhance, ImageFilter
    
    # Aplicar filtro de mejora
    enhanced = enhanced.filter(ImageFilter.SHARPEN)
    
    # Mejorar brillo y contraste
    enhancer = ImageEnhance.Contrast(enhanced)
    enhanced = enhancer.enhance(1.2)
    
    enhancer = ImageEnhance.Color(enhanced)
    enhanced = enhancer.enhance(1.1)
    
    enhancer = ImageEnhance.Sharpness(enhanced)
    enhanced = enhancer.enhance(1.3)
    
    # Guardar con alta calidad
    enhanced.save(output_path, "WEBP", quality=95, method=6)
    print(f"✅ Imagen mejorada (local) guardada: {output_path}")
    print(f"📐 Tamaño mejorado: {enhanced.size[0]}x{enhanced.size[1]}")
    
    return True

def main():
    # URLs y rutas
    image_url = "https://frontend-v2-production-7508.up.railway.app/images/flowers-scatter.webp"
    
    # Directorio del proyecto
    project_root = Path(__file__).parent.parent
    frontend_images = project_root / "frontend" / "images"
    frontend_public_images = project_root / "frontend" / "public" / "images"
    
    # Crear directorios si no existen
    frontend_images.mkdir(parents=True, exist_ok=True)
    frontend_public_images.mkdir(parents=True, exist_ok=True)
    
    # Rutas de archivos
    temp_download = project_root / "scripts" / "temp_flowers_scatter.webp"
    output_enhanced = project_root / "scripts" / "flowers-scatter-enhanced.webp"
    
    try:
        print("=" * 60)
        print("🌸 MEJORA DE IMAGEN CON HUGGING FACE")
        print("=" * 60)
        
        # Paso 1: Descargar imagen original
        download_image(image_url, temp_download)
        
        # Paso 2: Mejorar imagen
        enhance_image_with_hf(temp_download, output_enhanced)
        
        # Paso 3: Copiar a ubicaciones del proyecto
        print("\n📋 Copiando imagen mejorada al proyecto...")
        
        from shutil import copy2
        
        # Copiar a ambas ubicaciones
        dest1 = frontend_images / "flowers-scatter.webp"
        dest2 = frontend_public_images / "flowers-scatter.webp"
        
        # Crear backup de originales
        if dest1.exists():
            copy2(dest1, frontend_images / "flowers-scatter-original.webp")
            print(f"💾 Backup creado: {frontend_images / 'flowers-scatter-original.webp'}")
        
        if dest2.exists():
            copy2(dest2, frontend_public_images / "flowers-scatter-original.webp")
            print(f"💾 Backup creado: {frontend_public_images / 'flowers-scatter-original.webp'}")
        
        # Copiar imagen mejorada
        copy2(output_enhanced, dest1)
        copy2(output_enhanced, dest2)
        
        print(f"✅ Imagen mejorada copiada a: {dest1}")
        print(f"✅ Imagen mejorada copiada a: {dest2}")
        
        # Limpiar archivos temporales
        if temp_download.exists():
            temp_download.unlink()
        
        print("\n" + "=" * 60)
        print("✅ PROCESO COMPLETADO EXITOSAMENTE")
        print("=" * 60)
        print("\n📝 Próximos pasos:")
        print("1. Revisa las imágenes mejoradas en frontend/images/")
        print("2. Compara con los backups (*-original.webp)")
        print("3. Haz commit de los cambios si te gustan")
        print("\n💡 Tip: Para usar API de Hugging Face:")
        print("   1. Crea un token en https://huggingface.co/settings/tokens")
        print("   2. Agrégalo al archivo .env: HF_TOKEN=hf_tu_token")
        print("   3. Ejecuta de nuevo: python3 scripts/enhance-image-hf.py")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
