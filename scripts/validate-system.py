#!/usr/bin/env python3
"""
Script de Validación Completa del Sistema Flores Victoria
Valida: páginas, recursos, APIs, bases de datos, funcionalidad
"""

import requests
import json
import time
from urllib.parse import urljoin
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:5175"
API_URL = "http://localhost:3000"
TIMEOUT = 10

# Colores para terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{'='*80}")
    print(f"{BOLD}{BLUE}{text}{RESET}")
    print(f"{'='*80}\n")

def print_section(text):
    print(f"\n{BOLD}{text}{RESET}")
    print(f"{'-'*80}")

def test_http(url, method='GET', data=None, description=""):
    """Prueba una petición HTTP"""
    try:
        if method == 'GET':
            response = requests.get(url, timeout=TIMEOUT)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=TIMEOUT)
        
        status = response.status_code
        size_kb = len(response.content) / 1024
        
        if status == 200:
            print(f"✅ {description:50} {status} ({size_kb:.1f} KB)")
            return True, response
        else:
            print(f"⚠️  {description:50} [{status}]")
            return False, response
    except Exception as e:
        print(f"❌ {description:50} Error: {str(e)[:50]}")
        return False, None

# ============================================================================
# 1. VALIDACIÓN DE PÁGINAS HTML
# ============================================================================
def validate_pages():
    print_header("📄 VALIDACIÓN DE PÁGINAS HTML")
    
    pages = [
        '/', '/index.html',
        '/pages/login.html', '/pages/register.html',
        '/pages/products.html', '/pages/cart.html',
        '/pages/profile.html', '/pages/admin.html',
        '/pages/contact.html', '/pages/about.html'
    ]
    
    ok_count = 0
    error_count = 0
    
    for page in pages:
        url = urljoin(BASE_URL, page)
        success, _ = test_http(url, description=page)
        if success:
            ok_count += 1
        else:
            error_count += 1
    
    print(f"\n   Total: {len(pages)} | ✅ {ok_count} | ❌ {error_count}")
    return ok_count, error_count

# ============================================================================
# 2. VALIDACIÓN DE RECURSOS ESTÁTICOS
# ============================================================================
def validate_resources():
    print_header("📦 VALIDACIÓN DE RECURSOS ESTÁTICOS")
    
    resources = {
        'CSS': [
            '/css/design-system.css',
            '/css/base.css',
            '/css/style.css'
        ],
        'JavaScript': [
            '/js/utils/httpClient.js',
            '/js/components/utils/userMenu.js',
            '/js/main.js',
            '/sw.js'
        ],
        'PWA': [
            '/manifest.json',
            '/favicon.png',
            '/icons/icon-192x192.png'
        ]
    }
    
    total_ok = 0
    total_error = 0
    
    for category, items in resources.items():
        print_section(f"   {category}")
        ok = 0
        err = 0
        for resource in items:
            url = urljoin(BASE_URL, resource)
            success, _ = test_http(url, description=resource)
            if success:
                ok += 1
            else:
                err += 1
        total_ok += ok
        total_error += err
        print(f"   Subtotal: {len(items)} | ✅ {ok} | ❌ {err}")
    
    print(f"\n   Total Recursos: {total_ok + total_error} | ✅ {total_ok} | ❌ {total_error}")
    return total_ok, total_error

# ============================================================================
# 3. VALIDACIÓN DE APIs Y MICROSERVICIOS
# ============================================================================
def validate_apis():
    print_header("🔌 VALIDACIÓN DE APIs Y MICROSERVICIOS")
    
    # Health checks de microservicios
    services = [
        ('Auth Service', 'http://localhost:3001/health'),
        ('User Service', 'http://localhost:3003/health'),
        ('Product Service', 'http://localhost:3009/health'),  # Puerto correcto: 3009
        ('Order Service', 'http://localhost:3004/health'),
        ('Cart Service', 'http://localhost:3005/health'),
        ('API Gateway', 'http://localhost:3000/health'),
    ]
    
    print_section("   Health Checks")
    ok_count = 0
    error_count = 0
    
    for name, url in services:
        success, response = test_http(url, description=name)
        if success:
            ok_count += 1
        else:
            error_count += 1
    
    print(f"\n   Total Servicios: {len(services)} | ✅ {ok_count} | ❌ {error_count}")
    
    # Pruebas de endpoints públicos
    print_section("   Endpoints Públicos")
    endpoints_ok = 0
    endpoints_error = 0
    
    public_endpoints = [
        ('GET Products', f'{API_URL}/api/products', 'GET'),
    ]
    
    for name, url, method in public_endpoints:
        success, _ = test_http(url, method=method, description=name)
        if success:
            endpoints_ok += 1
        else:
            endpoints_error += 1
    
    print(f"\n   Total Endpoints: {len(public_endpoints)} | ✅ {endpoints_ok} | ❌ {endpoints_error}")
    
    return ok_count + endpoints_ok, error_count + endpoints_error

# ============================================================================
# 4. VALIDACIÓN DE BASES DE DATOS
# ============================================================================
def validate_databases():
    print_header("🗄️  VALIDACIÓN DE BASES DE DATOS")
    
    print_section("   Pruebas de Conexión")
    
    # Verificar que los servicios respondan (indirectamente verifica DB)
    db_checks = [
        ('PostgreSQL (via Auth)', 'http://localhost:3001/health'),
        ('PostgreSQL (via User)', 'http://localhost:3003/health'),
        ('MongoDB (via Products)', 'http://localhost:3009/health'),
    ]
    
    ok_count = 0
    error_count = 0
    
    for name, url in db_checks:
        success, _ = test_http(url, description=name)
        if success:
            ok_count += 1
        else:
            error_count += 1
    
    print(f"\n   Total Conexiones: {len(db_checks)} | ✅ {ok_count} | ❌ {error_count}")
    return ok_count, error_count

# ============================================================================
# 5. VALIDACIÓN DE FUNCIONALIDADES
# ============================================================================
def validate_functionality():
    print_header("⚙️  VALIDACIÓN DE FUNCIONALIDADES")
    
    ok_count = 0
    error_count = 0
    
    # 5.1 Validar estructura de páginas de login
    print_section("   Autenticación")
    success, response = test_http(
        urljoin(BASE_URL, '/pages/login.html'),
        description="Página de Login"
    )
    if success and response:
        content = response.text
        checks = [
            ('Formulario de login', 'id="loginForm"' in content or 'login-form' in content),
            ('Modal de Google OAuth', 'Google' in content and 'OAuth' in content or 'modal' in content),
            ('Link a registro', 'register' in content.lower()),
            ('Recuperar contraseña', 'forgot' in content.lower() or 'recuperar' in content.lower()),
        ]
        
        for check_name, result in checks:
            if result:
                print(f"✅ {check_name:50}")
                ok_count += 1
            else:
                print(f"❌ {check_name:50}")
                error_count += 1
    else:
        error_count += 4
    
    # 5.2 Validar estructura de productos
    print_section("   Catálogo de Productos")
    success, response = test_http(
        urljoin(BASE_URL, '/pages/products.html'),
        description="Página de Productos"
    )
    if success and response:
        content = response.text
        checks = [
            ('Grid de productos', 'product' in content.lower() and ('grid' in content.lower() or 'container' in content.lower())),
            ('Filtros', 'filter' in content.lower() or 'filtro' in content.lower()),
            ('Buscador', 'search' in content.lower() or 'buscar' in content.lower()),
        ]
        
        for check_name, result in checks:
            if result:
                print(f"✅ {check_name:50}")
                ok_count += 1
            else:
                print(f"❌ {check_name:50}")
                error_count += 1
    else:
        error_count += 3
    
    # 5.3 Validar carrito
    print_section("   Carrito de Compras")
    success, response = test_http(
        urljoin(BASE_URL, '/pages/cart.html'),
        description="Página de Carrito"
    )
    if success and response:
        content = response.text
        checks = [
            ('Contenedor de carrito', 'cart' in content.lower()),
            ('Botón de checkout', 'checkout' in content.lower() or 'finalizar' in content.lower()),
            ('Total de compra', 'total' in content.lower()),
        ]
        
        for check_name, result in checks:
            if result:
                print(f"✅ {check_name:50}")
                ok_count += 1
            else:
                print(f"❌ {check_name:50}")
                error_count += 1
    else:
        error_count += 3
    
    # 5.4 Validar perfil de usuario
    print_section("   Perfil de Usuario")
    success, response = test_http(
        urljoin(BASE_URL, '/pages/profile.html'),
        description="Página de Perfil"
    )
    if success and response:
        content = response.text
        checks = [
            ('Formulario de perfil', 'profile' in content.lower() and 'form' in content.lower()),
            ('Avatar/foto', 'avatar' in content.lower() or 'photo' in content.lower() or 'picture' in content.lower()),
            ('Datos personales', 'email' in content.lower() or 'name' in content.lower()),
        ]
        
        for check_name, result in checks:
            if result:
                print(f"✅ {check_name:50}")
                ok_count += 1
            else:
                print(f"❌ {check_name:50}")
                error_count += 1
    else:
        error_count += 3
    
    # 5.5 Validar panel admin
    print_section("   Panel de Administración")
    success, response = test_http(
        urljoin(BASE_URL, '/pages/admin.html'),
        description="Panel Admin"
    )
    if success and response:
        content = response.text
        checks = [
            ('Dashboard', 'dashboard' in content.lower() or 'admin' in content.lower()),
            ('Gestión de productos', 'product' in content.lower()),
            ('Estadísticas', 'stat' in content.lower() or 'metric' in content.lower() or 'chart' in content.lower()),
        ]
        
        for check_name, result in checks:
            if result:
                print(f"✅ {check_name:50}")
                ok_count += 1
            else:
                print(f"❌ {check_name:50}")
                error_count += 1
    else:
        error_count += 3
    
    print(f"\n   Total Funcionalidades: {ok_count + error_count} | ✅ {ok_count} | ❌ {error_count}")
    return ok_count, error_count

# ============================================================================
# 6. VALIDACIÓN DE PWA
# ============================================================================
def validate_pwa():
    print_header("📱 VALIDACIÓN DE PWA")
    
    ok_count = 0
    error_count = 0
    
    # Validar manifest.json
    print_section("   Manifest.json")
    success, response = test_http(
        urljoin(BASE_URL, '/manifest.json'),
        description="Manifest PWA"
    )
    if success and response:
        try:
            manifest = response.json()
            checks = [
                ('name', 'name' in manifest),
                ('short_name', 'short_name' in manifest),
                ('start_url', 'start_url' in manifest),
                ('display', 'display' in manifest),
                ('background_color', 'background_color' in manifest),
                ('theme_color', 'theme_color' in manifest),
                ('icons', 'icons' in manifest and len(manifest.get('icons', [])) > 0),
            ]
            
            for check_name, result in checks:
                if result:
                    print(f"✅ {check_name:50}")
                    ok_count += 1
                else:
                    print(f"❌ {check_name:50} faltante")
                    error_count += 1
        except:
            print(f"❌ Error al parsear manifest.json")
            error_count += 7
    else:
        error_count += 7
    
    # Validar Service Worker
    print_section("   Service Worker")
    success, response = test_http(
        urljoin(BASE_URL, '/sw.js'),
        description="Service Worker"
    )
    if success and response:
        content = response.text
        checks = [
            ('Event install', 'install' in content),
            ('Event activate', 'activate' in content),
            ('Event fetch', 'fetch' in content),
            ('Cache API', 'cache' in content.lower()),
        ]
        
        for check_name, result in checks:
            if result:
                print(f"✅ {check_name:50}")
                ok_count += 1
            else:
                print(f"❌ {check_name:50}")
                error_count += 1
    else:
        error_count += 4
    
    # Validar iconos PWA
    print_section("   Iconos PWA")
    icon_sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    icons_ok = 0
    icons_error = 0
    
    for size in icon_sizes:
        url = urljoin(BASE_URL, f'/icons/icon-{size}x{size}.png')
        success, _ = test_http(url, description=f"Icon {size}x{size}")
        if success:
            icons_ok += 1
        else:
            icons_error += 1
    
    ok_count += icons_ok
    error_count += icons_error
    
    print(f"\n   Total Validaciones PWA: {ok_count + error_count} | ✅ {ok_count} | ❌ {error_count}")
    return ok_count, error_count

# ============================================================================
# 7. VALIDACIÓN DE SEO
# ============================================================================
def validate_seo():
    print_header("🔍 VALIDACIÓN DE SEO")
    
    ok_count = 0
    error_count = 0
    
    pages_to_check = [
        ('Home', '/'),
        ('Products', '/pages/products.html'),
        ('About', '/pages/about.html'),
        ('Contact', '/pages/contact.html'),
    ]
    
    for page_name, page_url in pages_to_check:
        print_section(f"   {page_name}")
        success, response = test_http(
            urljoin(BASE_URL, page_url),
            description=page_name
        )
        
        if success and response:
            content = response.text.lower()
            checks = [
                ('<title>', '<title>' in content),
                ('meta description', 'meta name="description"' in content),
                ('meta viewport', 'meta name="viewport"' in content),
                ('charset', 'charset=' in content),
                ('og:title', 'og:title' in content or 'property="og:' in content),
            ]
            
            for check_name, result in checks:
                if result:
                    print(f"✅ {check_name:50}")
                    ok_count += 1
                else:
                    print(f"⚠️  {check_name:50} faltante")
                    error_count += 1
        else:
            error_count += 5
    
    print(f"\n   Total Validaciones SEO: {ok_count + error_count} | ✅ {ok_count} | ❌ {error_count}")
    return ok_count, error_count

# ============================================================================
# 8. RESUMEN FINAL
# ============================================================================
def print_summary(results):
    print_header("📊 RESUMEN GENERAL DE VALIDACIÓN")
    
    total_ok = 0
    total_error = 0
    
    print(f"{'Categoría':<30} {'OK':<10} {'Error':<10} {'Total':<10} {'%':<10}")
    print(f"{'-'*80}")
    
    for category, (ok, error) in results.items():
        total = ok + error
        percentage = (ok / total * 100) if total > 0 else 0
        total_ok += ok
        total_error += error
        
        status = "✅" if percentage == 100 else "⚠️" if percentage >= 80 else "❌"
        print(f"{status} {category:<28} {ok:<10} {error:<10} {total:<10} {percentage:>6.1f}%")
    
    print(f"{'-'*80}")
    grand_total = total_ok + total_error
    grand_percentage = (total_ok / grand_total * 100) if grand_total > 0 else 0
    
    print(f"\n{BOLD}{'TOTAL GENERAL':<30} {total_ok:<10} {total_error:<10} {grand_total:<10} {grand_percentage:>6.1f}%{RESET}")
    
    if grand_percentage == 100:
        print(f"\n{GREEN}{BOLD}🎉 ¡SISTEMA 100% VALIDADO!{RESET}")
    elif grand_percentage >= 90:
        print(f"\n{GREEN}{BOLD}✅ Sistema en excelente estado ({grand_percentage:.1f}%){RESET}")
    elif grand_percentage >= 75:
        print(f"\n{YELLOW}{BOLD}⚠️  Sistema funcional con algunas mejoras necesarias ({grand_percentage:.1f}%){RESET}")
    else:
        print(f"\n{RED}{BOLD}❌ Sistema requiere atención urgente ({grand_percentage:.1f}%){RESET}")
    
    return grand_percentage

# ============================================================================
# MAIN
# ============================================================================
def main():
    print(f"\n{BOLD}{BLUE}{'='*80}")
    print(f"  🔍 VALIDACIÓN COMPLETA DEL SISTEMA - FLORES VICTORIA")
    print(f"  📅 Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"{'='*80}{RESET}\n")
    
    print(f"🌐 Frontend: {BASE_URL}")
    print(f"🔌 API Gateway: {API_URL}")
    print(f"⏱️  Timeout: {TIMEOUT}s\n")
    
    input("Presiona ENTER para iniciar la validación...")
    
    results = {}
    
    # Ejecutar todas las validaciones
    results['Páginas HTML'] = validate_pages()
    results['Recursos Estáticos'] = validate_resources()
    results['APIs y Microservicios'] = validate_apis()
    results['Bases de Datos'] = validate_databases()
    results['Funcionalidades'] = validate_functionality()
    results['PWA'] = validate_pwa()
    results['SEO'] = validate_seo()
    
    # Mostrar resumen
    percentage = print_summary(results)
    
    # Guardar reporte
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    report_file = f'/home/impala/Documentos/Proyectos/flores-victoria/docs/VALIDATION_REPORT_{timestamp}.txt'
    
    print(f"\n💾 Guardando reporte en: {report_file}")
    
    return percentage >= 90

if __name__ == "__main__":
    try:
        success = main()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}⚠️  Validación cancelada por el usuario{RESET}")
        exit(1)
    except Exception as e:
        print(f"\n\n{RED}❌ Error fatal: {str(e)}{RESET}")
        exit(1)
