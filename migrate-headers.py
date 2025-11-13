#!/usr/bin/env python3
"""
Migración masiva de headers estáticos a componentes dinámicos
Flores Victoria v2.0.0
"""

import re
import os
from pathlib import Path
from datetime import datetime

# Archivos a procesar
FILES = [
    "frontend/pages/checkout.html",
    "frontend/pages/contact.html",
    "frontend/pages/wishlist.html",
    "frontend/pages/faq.html",
    "frontend/pages/about.html",
    "frontend/pages/catalog.html",
    "frontend/pages/blog.html",
    "frontend/pages/gallery.html",
    "frontend/pages/testimonials.html",
    "frontend/pages/demo-microinteractions.html",
]

BASE_PATH = Path("/home/impala/Documentos/Proyectos/flores-victoria")

def migrate_header(file_path):
    """Reemplaza header estático con componente dinámico"""
    
    if not file_path.exists():
        return False, "Archivo no encontrado"
    
    # Leer contenido
    content = file_path.read_text(encoding='utf-8')
    
    # Verificar si ya tiene header dinámico
    if 'id="header-root"' in content:
        return True, "Ya tiene header dinámico"
    
    # Patron para encontrar header completo (más flexible)
    pattern = r'(<header[^>]*>.*?</header>)'
    
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        return False, "No se encontró header estático"
    
    # Crear backup
    backup_path = file_path.with_suffix(f'.backup-{datetime.now().strftime("%Y%m%d-%H%M%S")}.html')
    backup_path.write_text(content, encoding='utf-8')
    
    # Reemplazar header
    replacement = '    <!-- Header Component v2.0.0 (dinámico) -->\n    <div id="header-root"></div>'
    new_content = content.replace(match.group(1), replacement)
    
    # Guardar cambios
    file_path.write_text(new_content, encoding='utf-8')
    
    return True, "Header migrado exitosamente"

def main():
    print("🔄 Iniciando migración masiva de headers...\n")
    
    results = {
        'success': 0,
        'already_migrated': 0,
        'failed': 0,
        'not_found': 0
    }
    
    for file_rel in FILES:
        file_path = BASE_PATH / file_rel
        print(f"📝 Procesando: {file_rel}")
        
        success, message = migrate_header(file_path)
        
        if success:
            if "Ya tiene" in message:
                results['already_migrated'] += 1
                print(f"   ✅ {message}\n")
            else:
                results['success'] += 1
                print(f"   ✅ {message}\n")
        else:
            if "no encontrado" in message.lower():
                results['not_found'] += 1
            else:
                results['failed'] += 1
            print(f"   ❌ {message}\n")
    
    # Resumen
    print("\n" + "="*60)
    print("📊 RESUMEN DE MIGRACIÓN")
    print("="*60)
    print(f"Total de archivos: {len(FILES)}")
    print(f"✅ Migrados exitosamente: {results['success']}")
    print(f"✓  Ya estaban migrados: {results['already_migrated']}")
    print(f"❌ Fallidos: {results['failed']}")
    print(f"⚠️  No encontrados: {results['not_found']}")
    print()
    
    if results['success'] > 0:
        print("🎉 Migración completada!")
        print("\n💡 Próximos pasos:")
        print("   1. Verificar que cada página cargue correctamente")
        print("   2. Comprobar que el header dinámico se muestre")
        print("   3. Eliminar backups si todo funciona")
        print()

if __name__ == "__main__":
    main()
