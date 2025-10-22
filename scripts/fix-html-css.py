#!/usr/bin/env python3
"""
Script para corregir automáticamente problemas CSS en archivos HTML
"""
import os
import re
from pathlib import Path

# Plantilla del HEAD estándar para todas las páginas
STANDARD_HEAD_TEMPLATE = '''<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    
    <!-- PWA -->
    <link rel="icon" href="/favicon.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#2d5016">
    
    <!-- Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="/css/design-system.css">
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/style.css">{extra_css}
</head>'''

def fix_css_links(content, filename):
    """Corrige los enlaces CSS en el contenido"""
    
    # Reemplazar rutas incorrectas
    content = content.replace('../assets/css/main.css', '/css/style.css')
    content = content.replace('../public/css/', '/css/')
    content = content.replace('./css/', '/css/')
    content = content.replace('assets/css/', '/css/')
    
    return content

def ensure_pwa_meta_tags(content):
    """Asegura que existan los meta tags PWA"""
    
    if '<link rel="manifest"' not in content:
        # Insertar después de theme-color o viewport
        if '<meta name="theme-color"' in content:
            pass  # Ya está bien
        elif '<meta name="viewport"' in content:
            content = content.replace(
                '<meta name="viewport"',
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <link rel="manifest" href="/manifest.json">\n    <meta name="theme-color" content="#2d5016">\n    <meta name="viewport"'
            )
            # Eliminar duplicado
            content = re.sub(r'<meta name="viewport"[^>]*>\s*<link rel="manifest"[^>]*>\s*<meta name="theme-color"[^>]*>\s*<meta name="viewport"', '<meta name="viewport"', content, count=1)
            
    return content

def fix_file(filepath):
    """Corrige un archivo HTML"""
    
    print(f"🔧 Corrigiendo: {filepath.name}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original_content = content
    
    # 1. Corregir enlaces CSS
    content = fix_css_links(content, filepath.name)
    
    # 2. Asegurar meta tags PWA
    content = ensure_pwa_meta_tags(content)
    
    # Solo escribir si hubo cambios
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"   ✅ Archivo corregido")
        return True
    else:
        print(f"   ℹ️  Sin cambios necesarios")
        return False

def main():
    """Función principal"""
    print("=" * 80)
    print("🔧 CORRECCIÓN AUTOMÁTICA DE ARCHIVOS HTML")
    print("=" * 80)
    print()
    
    base_dir = Path('/home/impala/Documentos/Proyectos/flores-victoria/frontend')
    
    # Archivos críticos a corregir
    critical_files = [
        'pages/footer-demo.html',
        'pages/server-admin.html',
        'pages/test-styles.html',
        'pages/testimonials.html'
    ]
    
    # Archivos con problemas menores
    minor_files = [
        'pages/faq.html',
        'pages/invoice.html',
        'pages/privacy.html',
        'pages/sitemap.html',
        'pages/terms.html',
        'public/404.html',
        'public/health.html',
        'public/offline.html'
    ]
    
    print("🚨 Corrigiendo archivos CRÍTICOS:")
    print("-" * 80)
    critical_fixed = 0
    for file_path in critical_files:
        full_path = base_dir / file_path
        if full_path.exists():
            if fix_file(full_path):
                critical_fixed += 1
        else:
            print(f"⚠️  No encontrado: {file_path}")
    print()
    
    print("📋 Corrigiendo archivos con problemas MENORES:")
    print("-" * 80)
    minor_fixed = 0
    for file_path in minor_files:
        full_path = base_dir / file_path
        if full_path.exists():
            if fix_file(full_path):
                minor_fixed += 1
        else:
            print(f"⚠️  No encontrado: {file_path}")
    print()
    
    print("=" * 80)
    print("📊 RESUMEN:")
    print("=" * 80)
    print(f"   Archivos críticos corregidos: {critical_fixed}/{len(critical_files)}")
    print(f"   Archivos menores corregidos: {minor_fixed}/{len(minor_files)}")
    print(f"   Total: {critical_fixed + minor_fixed}/{len(critical_files) + len(minor_files)}")
    print()
    print("✅ Corrección completada!")
    print()

if __name__ == '__main__':
    main()
