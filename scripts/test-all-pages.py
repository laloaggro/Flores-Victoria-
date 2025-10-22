#!/usr/bin/env python3
"""
Script para probar todas las páginas HTML del proyecto
Verifica que las páginas carguen correctamente y tengan los recursos necesarios
"""
import requests
import time
from pathlib import Path
from urllib.parse import urljoin

# Configuración
BASE_URL = "http://localhost:5175"
TIMEOUT = 5

# Lista de páginas a probar
PAGES = [
    # Páginas principales
    "/",
    "/index.html",
    
    # Páginas de usuario
    "/pages/login.html",
    "/pages/register.html",
    "/pages/forgot-password.html",
    "/pages/new-password.html",
    "/pages/reset-password.html",
    
    # Páginas de productos
    "/pages/products.html",
    "/pages/product-detail.html",
    "/pages/cart.html",
    "/pages/checkout.html",
    "/pages/wishlist.html",
    
    # Páginas de cuenta
    "/pages/profile.html",
    "/pages/orders.html",
    "/pages/order-detail.html",
    
    # Páginas informativas
    "/pages/about.html",
    "/pages/contact.html",
    "/pages/faq.html",
    "/pages/testimonials.html",
    
    # Páginas legales
    "/pages/terms.html",
    "/pages/privacy.html",
    "/pages/shipping.html",
    
    # Páginas admin
    "/pages/admin.html",
    "/pages/admin-products.html",
    "/pages/admin-orders.html",
    "/pages/admin-users.html",
    
    # Páginas especiales
    "/pages/sitemap.html",
    "/pages/invoice.html",
    
    # Páginas públicas
    "/404.html",
    "/health.html",
    "/offline.html",
]

# Recursos críticos a verificar
CRITICAL_RESOURCES = [
    "/css/design-system.css",
    "/css/base.css",
    "/css/style.css",
    "/manifest.json",
    "/favicon.png",
]

def test_page(url):
    """Prueba una página individual"""
    try:
        response = requests.get(url, timeout=TIMEOUT)
        
        return {
            'url': url,
            'status_code': response.status_code,
            'ok': response.status_code == 200,
            'size': len(response.content),
            'content_type': response.headers.get('Content-Type', 'unknown'),
            'error': None
        }
    except requests.exceptions.Timeout:
        return {
            'url': url,
            'status_code': 0,
            'ok': False,
            'size': 0,
            'content_type': 'unknown',
            'error': 'Timeout'
        }
    except requests.exceptions.ConnectionError:
        return {
            'url': url,
            'status_code': 0,
            'ok': False,
            'size': 0,
            'content_type': 'unknown',
            'error': 'Connection Error'
        }
    except Exception as e:
        return {
            'url': url,
            'status_code': 0,
            'ok': False,
            'size': 0,
            'content_type': 'unknown',
            'error': str(e)
        }

def main():
    """Función principal"""
    print("=" * 80)
    print("🧪 PRUEBA DE TODAS LAS PÁGINAS HTML")
    print("=" * 80)
    print(f"\n🌐 Base URL: {BASE_URL}")
    print(f"📄 Páginas a probar: {len(PAGES)}")
    print(f"📦 Recursos críticos: {len(CRITICAL_RESOURCES)}")
    print()
    
    # Verificar que el servidor esté corriendo
    print("🔍 Verificando servidor...")
    try:
        response = requests.get(BASE_URL, timeout=TIMEOUT)
        print(f"✅ Servidor responde: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: El servidor no está corriendo en {BASE_URL}")
        print(f"   {str(e)}")
        print()
        print("💡 Inicia el servidor con: docker-compose up -d")
        return
    
    print()
    print("=" * 80)
    print("📋 PROBANDO PÁGINAS")
    print("=" * 80)
    print()
    
    results = []
    success_count = 0
    error_count = 0
    
    for page in PAGES:
        url = urljoin(BASE_URL, page)
        result = test_page(url)
        results.append(result)
        
        if result['ok']:
            success_count += 1
            status = "✅"
        else:
            error_count += 1
            status = "❌"
        
        # Mostrar resultado
        size_kb = result['size'] / 1024 if result['size'] > 0 else 0
        print(f"{status} {page:40} [{result['status_code']}] {size_kb:.1f} KB")
        
        if result['error']:
            print(f"   ⚠️  Error: {result['error']}")
    
    print()
    print("=" * 80)
    print("📦 PROBANDO RECURSOS CRÍTICOS")
    print("=" * 80)
    print()
    
    resource_results = []
    resources_ok = 0
    resources_error = 0
    
    for resource in CRITICAL_RESOURCES:
        url = urljoin(BASE_URL, resource)
        result = test_page(url)
        resource_results.append(result)
        
        if result['ok']:
            resources_ok += 1
            status = "✅"
        else:
            resources_error += 1
            status = "❌"
        
        size_kb = result['size'] / 1024 if result['size'] > 0 else 0
        print(f"{status} {resource:40} [{result['status_code']}] {size_kb:.1f} KB")
    
    print()
    print("=" * 80)
    print("📊 RESUMEN")
    print("=" * 80)
    print()
    print(f"📄 PÁGINAS:")
    print(f"   Total: {len(PAGES)}")
    print(f"   ✅ Exitosas: {success_count} ({success_count/len(PAGES)*100:.1f}%)")
    print(f"   ❌ Errores: {error_count} ({error_count/len(PAGES)*100:.1f}%)")
    print()
    print(f"📦 RECURSOS:")
    print(f"   Total: {len(CRITICAL_RESOURCES)}")
    print(f"   ✅ Disponibles: {resources_ok} ({resources_ok/len(CRITICAL_RESOURCES)*100:.1f}%)")
    print(f"   ❌ Faltantes: {resources_error} ({resources_error/len(CRITICAL_RESOURCES)*100:.1f}%)")
    print()
    
    # Páginas con errores
    if error_count > 0:
        print("=" * 80)
        print("❌ PÁGINAS CON ERRORES")
        print("=" * 80)
        print()
        for result in results:
            if not result['ok']:
                print(f"   • {result['url']}")
                if result['error']:
                    print(f"     Error: {result['error']}")
                else:
                    print(f"     Status: {result['status_code']}")
        print()
    
    # Recursos faltantes
    if resources_error > 0:
        print("=" * 80)
        print("❌ RECURSOS FALTANTES")
        print("=" * 80)
        print()
        for result in resource_results:
            if not result['ok']:
                print(f"   • {result['url']}")
        print()
    
    # Resultado final
    if error_count == 0 and resources_error == 0:
        print("🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!")
    else:
        print("⚠️  ALGUNAS PRUEBAS FALLARON")
    
    print()

if __name__ == '__main__':
    main()
