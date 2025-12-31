#!/usr/bin/env python3
"""
Alternativa: Usa un banco de imágenes gratuito (Unsplash) para obtener imágenes de flores profesionales
"""

import os
import requests
from pathlib import Path
from PIL import Image
import io
import time

try:
    from dotenv import load_dotenv
    project_root = Path(__file__).parent.parent
    load_dotenv(project_root / '.env')
except:
    pass

def download_unsplash_image(query, output_path):
    """
    Descarga una imagen profesional de flores desde Unsplash (gratis, sin API key)
    """
    print(f"🔍 Buscando imágenes de: {query}")
    
    # Unsplash Source permite descargar imágenes sin API key
    queries = {
        "1": "flowers,bouquet,colorful",
        "2": "flower,petals,romantic,pink",
        "3": "flower,arrangement,professional",
        "4": "minimalist,flowers,modern",
        "5": "sunflowers,vibrant,colorful"
    }
    
    # URL de Unsplash Source (servicio gratis)
    width, height = 3072, 2048
    url = f"https://source.unsplash.com/{width}x{height}/?{query}"
    
    print(f"📥 Descargando imagen de alta calidad...")
    print(f"🔗 URL: {url}")
    
    try:
        response = requests.get(url, stream=True, timeout=30)
        if response.status_code == 200:
            image = Image.open(io.BytesIO(response.content))
            
            # Asegurar tamaño correcto
            if image.size != (width, height):
                image = image.resize((width, height), Image.Resampling.LANCZOS)
            
            # Guardar como WEBP
            image.save(output_path, "WEBP", quality=95, method=6)
            
            print(f"✅ Imagen descargada: {output_path}")
            print(f"📐 Tamaño: {image.size[0]}x{image.size[1]}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 70)
    print("🌸 DESCARGAR IMAGEN PROFESIONAL DE FLORES")
    print("=" * 70)
    print("\nFuente: Unsplash (fotos profesionales gratis)")
    
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "scripts"
    output_file = output_dir / "flowers-scatter-unsplash.webp"
    
    print("\n📋 Selecciona el estilo de imagen:\n")
    print("  1. Bouquet colorido y profesional")
    print("  2. Pétalos románticos en tonos rosa")
    print("  3. Arreglo floral profesional")
    print("  4. Flores minimalistas modernas")
    print("  5. Flores vibrantes (girasoles)")
    
    queries = {
        "1": "flowers,bouquet,colorful,professional",
        "2": "flower,petals,romantic,pink,elegant",
        "3": "flower,arrangement,florist,professional",
        "4": "minimalist,flowers,modern,clean",
        "5": "sunflowers,gerbera,vibrant,bright"
    }
    
    print("\n" + "=" * 70)
    choice = input("Ingresa el número (1-5) o presiona Enter para opción 1: ").strip() or "1"
    
    if choice not in queries:
        choice = "1"
    
    # Descargar imagen
    success = download_unsplash_image(queries[choice], output_file)
    
    if success:
        print("\n" + "=" * 70)
        print("✅ IMAGEN DESCARGADA EXITOSAMENTE")
        print("=" * 70)
        print(f"\n📁 Imagen guardada en: {output_file}")
        
        # Preguntar si reemplazar
        print("\n" + "=" * 70)
        replace = input("¿Reemplazar la imagen actual en el proyecto? (s/N): ").strip().lower()
        
        if replace == 's':
            from shutil import copy2
            
            frontend_images = project_root / "frontend" / "images"
            frontend_public_images = project_root / "frontend" / "public" / "images"
            
            dest1 = frontend_images / "flowers-scatter.webp"
            dest2 = frontend_public_images / "flowers-scatter.webp"
            
            # Backup
            if dest1.exists():
                backup_name = f"flowers-scatter-backup-{int(time.time())}.webp"
                copy2(dest1, frontend_images / backup_name)
                print(f"💾 Backup: {backup_name}")
            
            if dest2.exists():
                backup_name = f"flowers-scatter-backup-{int(time.time())}.webp"
                copy2(dest2, frontend_public_images / backup_name)
            
            # Copiar
            copy2(output_file, dest1)
            copy2(output_file, dest2)
            
            print(f"✅ Imagen actualizada en: {dest1}")
            print(f"✅ Imagen actualizada en: {dest2}")
            print(f"\n🎉 ¡Listo! Revisa la imagen en about.html")
            print(f"\n💡 Si no te gusta, ejecuta de nuevo para obtener otra imagen")
        else:
            print(f"\n📝 Para reemplazar manualmente:")
            print(f"   cp {output_file} frontend/images/flowers-scatter.webp")
            print(f"   cp {output_file} frontend/public/images/flowers-scatter.webp")
    else:
        print("\n❌ No se pudo descargar la imagen")
        print("💡 Verifica tu conexión a internet")

if __name__ == "__main__":
    main()
