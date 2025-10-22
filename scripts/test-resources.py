#!/usr/bin/env python3
"""
Script para verificar los módulos JavaScript y recursos adicionales
"""
import requests
from urllib.parse import urljoin

BASE_URL = "http://localhost:5175"
TIMEOUT = 5

# Módulos JavaScript a verificar
JS_MODULES = [
    # Componentes principales
    "/js/components/utils/utils.js",
    "/js/components/utils/userMenu.js",
    "/js/components/utils/pageUserMenu.js",
    "/js/utils/httpClient.js",  # Nombre correcto del cliente HTTP
    "/js/utils.js",
    
    # Managers
    "/js/sw-register.js",
    "/js/seo-manager.js",
    "/js/ux-enhancements.js",
    
    # Páginas
    "/js/main.js",
    "/js/pages/home.js",
    "/js/pages/products.js",
    "/js/pages/admin.js",
    "/js/pages/contact.js",
    
    # Utils
    "/js/utils/cart.js",
    "/js/utils/theme.js",
    
    # Config
    "/js/config/api.js",
    "/js/config/business-config.js",
    
    # Service Worker
    "/sw.js",
]

# CSS adicionales
ADDITIONAL_CSS = [
    "/css/fixes.css",
    "/css/social-auth.css",
]

# Imágenes importantes
IMAGES = [
    "/logo.svg",
    "/apple-touch-icon.png",
]

# Iconos PWA
PWA_ICONS = [
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png",
]

def test_resources(resources, category_name):
    """Prueba una lista de recursos"""
    print(f"\n{'='*80}")
    print(f"📦 {category_name}")
    print(f"{'='*80}\n")
    
    ok_count = 0
    error_count = 0
    
    for resource in resources:
        url = urljoin(BASE_URL, resource)
        try:
            response = requests.get(url, timeout=TIMEOUT)
            if response.status_code == 200:
                ok_count += 1
                size_kb = len(response.content) / 1024
                print(f"✅ {resource:50} {size_kb:.1f} KB")
            else:
                error_count += 1
                print(f"❌ {resource:50} [{response.status_code}]")
        except Exception as e:
            error_count += 1
            print(f"❌ {resource:50} Error: {str(e)[:30]}")
    
    print(f"\n   Total: {len(resources)} | ✅ {ok_count} | ❌ {error_count}")
    return ok_count, error_count

def main():
    print("=" * 80)
    print("🔍 VERIFICACIÓN COMPLETA DE RECURSOS")
    print("=" * 80)
    
    total_ok = 0
    total_error = 0
    
    # Probar módulos JS
    ok, err = test_resources(JS_MODULES, "MÓDULOS JAVASCRIPT")
    total_ok += ok
    total_error += err
    
    # Probar CSS adicionales
    ok, err = test_resources(ADDITIONAL_CSS, "CSS ADICIONALES")
    total_ok += ok
    total_error += err
    
    # Probar imágenes
    ok, err = test_resources(IMAGES, "IMÁGENES")
    total_ok += ok
    total_error += err
    
    # Probar iconos PWA
    ok, err = test_resources(PWA_ICONS, "ICONOS PWA")
    total_ok += ok
    total_error += err
    
    # Resumen final
    print("\n" + "=" * 80)
    print("📊 RESUMEN GENERAL")
    print("=" * 80)
    print(f"\n   Total de recursos: {total_ok + total_error}")
    print(f"   ✅ Disponibles: {total_ok} ({total_ok/(total_ok+total_error)*100:.1f}%)")
    print(f"   ❌ Faltantes: {total_error} ({total_error/(total_ok+total_error)*100:.1f}%)")
    
    if total_error == 0:
        print("\n🎉 ¡TODOS LOS RECURSOS ESTÁN DISPONIBLES!")
    else:
        print(f"\n⚠️  {total_error} recursos no están disponibles")
    
    print()

if __name__ == '__main__':
    main()
