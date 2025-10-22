#!/usr/bin/env python3
"""
Auditoría de archivos HTML - Verificación de CSS y estructura
"""
import os
import re
from pathlib import Path
from collections import defaultdict

# Estructura CSS correcta esperada
EXPECTED_CSS = [
    '/css/design-system.css',
    '/css/base.css',
    '/css/style.css'
]

OPTIONAL_CSS = [
    '/css/fixes.css',
    '/css/social-auth.css'
]

WRONG_PATHS = [
    '../assets/css/main.css',
    '../public/css/',
    './css/',
    'assets/css/'
]

def analyze_html_file(filepath):
    """Analiza un archivo HTML y retorna problemas encontrados"""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 1. Verificar enlaces CSS
        css_links = re.findall(r'<link[^>]+rel=["\']stylesheet["\'][^>]*>', content)
        
        local_css = []
        for link in css_links:
            href_match = re.search(r'href=["\']([^"\']+)["\']', link)
            if href_match:
                href = href_match.group(1)
                # Solo archivos locales (no CDN)
                if not href.startswith('http'):
                    local_css.append(href)
                    
        # Verificar rutas incorrectas
        for css in local_css:
            for wrong_path in WRONG_PATHS:
                if wrong_path in css:
                    issues.append(f"❌ Ruta CSS incorrecta: {css}")
                    
        # Verificar si tiene los CSS básicos
        has_design_system = any('/css/design-system.css' in css for css in local_css)
        has_base = any('/css/base.css' in css for css in local_css)
        has_style = any('/css/style.css' in css for css in local_css)
        
        if not has_design_system:
            issues.append("⚠️  Falta: /css/design-system.css")
        if not has_base:
            issues.append("⚠️  Falta: /css/base.css")
        if not has_style:
            issues.append("⚠️  Falta: /css/style.css")
            
        # 2. Verificar meta tags PWA
        has_manifest = '<link rel="manifest"' in content
        has_theme_color = '<meta name="theme-color"' in content
        
        if not has_manifest:
            issues.append("⚠️  Falta: <link rel=\"manifest\">")
        if not has_theme_color:
            issues.append("⚠️  Falta: <meta name=\"theme-color\">")
            
        # 3. Verificar rutas de módulos JS
        wrong_js_paths = re.findall(r'from ["\']\/assets\/js\/[^"\']+["\']', content)
        if wrong_js_paths:
            issues.append(f"❌ Ruta JS incorrecta: /assets/js/ (debería ser /js/)")
            
        # 4. Verificar DOCTYPE y estructura básica
        if not content.strip().startswith('<!DOCTYPE html>'):
            issues.append("❌ Falta DOCTYPE")
            
        if '<html lang=' not in content:
            issues.append("⚠️  Falta atributo lang en <html>")
            
        # 5. Verificar meta viewport
        if '<meta name="viewport"' not in content:
            issues.append("❌ Falta meta viewport")
            
        # 6. Verificar charset
        if '<meta charset=' not in content:
            issues.append("❌ Falta meta charset")
            
        return issues, local_css
        
    except Exception as e:
        return [f"❌ Error al leer archivo: {str(e)}"], []

def main():
    """Función principal"""
    print("=" * 80)
    print("🔍 AUDITORÍA DE ARCHIVOS HTML - Verificación CSS y Estructura")
    print("=" * 80)
    print()
    
    # Directorio base
    base_dir = Path('/home/impala/Documentos/Proyectos/flores-victoria/frontend')
    
    # Buscar todos los HTMLs (excluyendo backups)
    html_files = []
    for pattern in ['index.html', 'pages/*.html', 'public/*.html']:
        html_files.extend(base_dir.glob(pattern))
    
    # Filtrar backups
    html_files = [f for f in html_files if 'backup' not in str(f).lower()]
    
    # Estadísticas
    total_files = 0
    files_with_issues = 0
    total_issues = 0
    
    issues_by_file = {}
    
    for html_file in sorted(html_files):
        relative_path = html_file.relative_to(base_dir)
        issues, css_files = analyze_html_file(html_file)
        
        total_files += 1
        
        if issues:
            files_with_issues += 1
            total_issues += len(issues)
            issues_by_file[str(relative_path)] = issues
            
    # Reporte
    print(f"📊 RESUMEN:")
    print(f"   Total de archivos analizados: {total_files}")
    print(f"   Archivos con problemas: {files_with_issues}")
    print(f"   Total de problemas: {total_issues}")
    print()
    
    if issues_by_file:
        print("=" * 80)
        print("📋 ARCHIVOS CON PROBLEMAS:")
        print("=" * 80)
        print()
        
        for filepath, file_issues in sorted(issues_by_file.items()):
            print(f"📄 {filepath}")
            for issue in file_issues:
                print(f"   {issue}")
            print()
            
    # Archivos que necesitan corrección
    files_to_fix = []
    for filepath, file_issues in issues_by_file.items():
        critical = any('❌' in issue for issue in file_issues)
        if critical:
            files_to_fix.append(filepath)
            
    if files_to_fix:
        print("=" * 80)
        print("🔧 ARCHIVOS QUE REQUIEREN CORRECCIÓN URGENTE:")
        print("=" * 80)
        print()
        for filepath in sorted(files_to_fix):
            print(f"   • {filepath}")
        print()
        
    # Recomendaciones
    print("=" * 80)
    print("💡 RECOMENDACIONES:")
    print("=" * 80)
    print()
    print("1. Todos los archivos HTML deben incluir en este orden:")
    print("   <link rel=\"stylesheet\" href=\"/css/design-system.css\">")
    print("   <link rel=\"stylesheet\" href=\"/css/base.css\">")
    print("   <link rel=\"stylesheet\" href=\"/css/style.css\">")
    print()
    print("2. Archivos específicos pueden incluir CSS adicionales:")
    print("   - login.html, register.html: /css/fixes.css, /css/social-auth.css")
    print("   - contact.html: /css/fixes.css")
    print()
    print("3. Evitar rutas como:")
    print("   ❌ ../assets/css/main.css")
    print("   ❌ ./css/style.css")
    print("   ✅ /css/style.css (ruta absoluta desde la raíz)")
    print()
    print("4. Todos los archivos deben tener:")
    print("   - <!DOCTYPE html>")
    print("   - <meta charset=\"UTF-8\">")
    print("   - <meta name=\"viewport\" content=\"...\">")
    print("   - <link rel=\"manifest\" href=\"/manifest.json\">")
    print("   - <meta name=\"theme-color\" content=\"#2d5016\">")
    print()

if __name__ == '__main__':
    main()
