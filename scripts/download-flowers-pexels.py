#!/usr/bin/env python3
"""
Descarga imágenes profesionales de flores de Pexels (gratis y confiable)
"""

import os
import requests
from pathlib import Path
from PIL import Image
import io
import time
import json

try:
    from dotenv import load_dotenv
    project_root = Path(__file__).parent.parent
    load_dotenv(project_root / '.env')
except:
    pass

def search_pexels(query, per_page=15):
    """
    Busca imágenes en Pexels (API gratuita)
    """
    # API Key de Pexels - obtén una gratis en https://www.pexels.com/api/
    API_KEY = os.environ.get("PEXELS_API_KEY", "")
    
    if not API_KEY:
        print("⚠️  No se encontró PEXELS_API_KEY en .env")
        print("💡 Obtén una gratis en: https://www.pexels.com/api/")
        print("💡 Agrégala al .env: PEXELS_API_KEY=tu_key")
        print("\n🔄 Usando imágenes predefinidas de alta calidad...")
        return None
    
    url = "https://api.pexels.com/v1/search"
    headers = {"Authorization": API_KEY}
    params = {
        "query": query,
        "per_page": per_page,
        "orientation": "landscape"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️  Error Pexels API: {response.status_code}")
            return None
    except Exception as e:
        print(f"⚠️  Error: {e}")
        return None

def download_image_from_url(url, output_path):
    """Descarga y guarda una imagen"""
    try:
        print(f"📥 Descargando imagen...")
        response = requests.get(url, stream=True, timeout=30)
        
        if response.status_code == 200:
            image = Image.open(io.BytesIO(response.content))
            
            # Redimensionar a tamaño apropiado
            image = image.resize((3072, 2048), Image.Resampling.LANCZOS)
            
            # Guardar como WEBP
            image.save(output_path, "WEBP", quality=95, method=6)
            
            print(f"✅ Imagen guardada: {output_path}")
            print(f"📐 Tamaño: {image.size[0]}x{image.size[1]}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error al descargar: {e}")
        return False

def main():
    print("=" * 70)
    print("🌸 DESCARGA DE IMÁGENES PROFESIONALES DE FLORES")
    print("=" * 70)
    
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "scripts"
    output_file = output_dir / "flowers-new.webp"
    
    # Imágenes predefinidas de alta calidad (enlaces directos de Pexels - gratis)
    predefined_images = {
        "1": {
            "url": "https://images.pexels.com/photos/1458556/pexels-photo-1458556.jpeg?auto=compress&cs=tinysrgb&w=3072",
            "desc": "Bouquet colorido profesional"
        },
        "2": {
            "url": "https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=3072",
            "desc": "Pétalos románticos en rosa"
        },
        "3": {
            "url": "https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?auto=compress&cs=tinysrgb&w=3072",
            "desc": "Arreglo floral elegante"
        },
        "4": {
            "url": "https://images.pexels.com/photos/1458853/pexels-photo-1458853.jpeg?auto=compress&cs=tinysrgb&w=3072",
            "desc": "Flores minimalistas modernas"
        },
        "5": {
            "url": "https://images.pexels.com/photos/1458864/pexels-photo-1458864.jpeg?auto=compress&cs=tinysrgb&w=3072",
            "desc": "Bouquet vibrante y alegre"
        }
    }
    
    print("\n📋 Selecciona el estilo de imagen:\n")
    for key, value in predefined_images.items():
        print(f"  {key}. {value['desc']}")
    
    print("\n" + "=" * 70)
    choice = input("Ingresa el número (1-5) o presiona Enter para opción 2: ").strip() or "2"
    
    if choice not in predefined_images:
        choice = "2"
    
    selected = predefined_images[choice]
    print(f"\n✅ Seleccionado: {selected['desc']}")
    
    # Descargar imagen
    success = download_image_from_url(selected["url"], output_file)
    
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
            
            # Crear backups
            if dest1.exists():
                backup_name = f"flowers-scatter-backup-{int(time.time())}.webp"
                copy2(dest1, frontend_images / backup_name)
                print(f"💾 Backup creado: {backup_name}")
            
            if dest2.exists():
                backup_name = f"flowers-scatter-backup-{int(time.time())}.webp"
                copy2(dest2, frontend_public_images / backup_name)
            
            # Copiar nueva imagen
            copy2(output_file, dest1)
            copy2(output_file, dest2)
            
            print(f"✅ Imagen actualizada: {dest1}")
            print(f"✅ Imagen actualizada: {dest2}")
            print(f"\n🎉 ¡Listo! La nueva imagen ya está en about.html")
            print(f"💡 Créditos: Foto de Pexels.com (uso gratuito)")
        else:
            print(f"\n📝 Para copiar manualmente:")
            print(f"   cp {output_file} frontend/images/flowers-scatter.webp")
    else:
        print("\n❌ No se pudo descargar la imagen")

if __name__ == "__main__":
    main()
