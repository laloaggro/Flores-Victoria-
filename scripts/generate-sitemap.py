#!/usr/bin/env python3
"""
Generador de Sitemap Dinámico - Flores Victoria
Genera sitemap.xml incluyendo todos los productos
"""

import json
import os
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring, ElementTree
from xml.dom import minidom

# Configuración
BASE_URL = "https://flores-victoria.com"
PRODUCTS_FILE = "frontend/public/assets/mock/products.json"
OUTPUT_FILE = "frontend/sitemap.xml"

# Páginas estáticas
STATIC_PAGES = [
    {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
    {"loc": "/pages/products.html", "priority": "0.9", "changefreq": "daily"},
    {"loc": "/pages/about.html", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "/pages/contact.html", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "/pages/cart.html", "priority": "0.6", "changefreq": "weekly"},
    {"loc": "/pages/checkout.html", "priority": "0.5", "changefreq": "monthly"},
    {"loc": "/pages/login.html", "priority": "0.5", "changefreq": "monthly"},
    {"loc": "/pages/register.html", "priority": "0.5", "changefreq": "monthly"},
]

def load_products():
    """Cargar productos desde JSON"""
    try:
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"⚠️  Archivo no encontrado: {PRODUCTS_FILE}")
        return []
    except json.JSONDecodeError:
        print(f"⚠️  Error parseando JSON: {PRODUCTS_FILE}")
        return []

def create_sitemap():
    """Generar sitemap XML"""
    # Crear elemento raíz
    urlset = Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    urlset.set('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1')
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Agregar páginas estáticas
    for page in STATIC_PAGES:
        url = SubElement(urlset, 'url')
        SubElement(url, 'loc').text = f"{BASE_URL}{page['loc']}"
        SubElement(url, 'lastmod').text = today
        SubElement(url, 'changefreq').text = page['changefreq']
        SubElement(url, 'priority').text = page['priority']
    
    # Cargar y agregar productos
    products = load_products()
    print(f"📦 {len(products)} productos encontrados")
    
    # Agrupar por categoría para prioridades
    categories = set(p.get('category', '') for p in products)
    print(f"📂 Categorías: {', '.join(categories)}")
    
    for product in products:
        url = SubElement(urlset, 'url')
        
        # URL del producto
        product_url = f"{BASE_URL}/pages/product-detail.html?id={product['id']}"
        SubElement(url, 'loc').text = product_url
        SubElement(url, 'lastmod').text = today
        SubElement(url, 'changefreq').text = 'weekly'
        SubElement(url, 'priority').text = '0.8'
        
        # Agregar imagen si existe
        if product.get('image_url'):
            image = SubElement(url, 'image:image')
            image_url = product['image_url']
            # Si es ruta relativa, agregar base URL
            if not image_url.startswith('http'):
                image_url = f"{BASE_URL}{image_url}"
            SubElement(image, 'image:loc').text = image_url
            SubElement(image, 'image:title').text = product.get('name', 'Producto')
            
            # Caption con descripción
            if product.get('description'):
                desc = product['description'][:200]  # Limitar longitud
                SubElement(image, 'image:caption').text = desc
    
    return urlset

def prettify_xml(elem):
    """Formatear XML con indentación"""
    rough_string = tostring(elem, encoding='unicode')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")

def main():
    print("🗺️  Generando sitemap dinámico para Flores Victoria...")
    print("-" * 50)
    
    # Crear sitemap
    urlset = create_sitemap()
    
    # Contar URLs
    url_count = len(urlset.findall('url'))
    print(f"📍 Total URLs en sitemap: {url_count}")
    
    # Formatear y guardar
    xml_string = prettify_xml(urlset)
    
    # Agregar declaración XML correcta
    xml_string = xml_string.replace(
        '<?xml version="1.0" ?>',
        '<?xml version="1.0" encoding="UTF-8"?>'
    )
    
    # Guardar archivo
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(xml_string)
    
    print(f"✅ Sitemap generado exitosamente: {OUTPUT_FILE}")
    print(f"📊 Estadísticas:")
    print(f"   - Páginas estáticas: {len(STATIC_PAGES)}")
    print(f"   - Páginas de productos: {url_count - len(STATIC_PAGES)}")
    print(f"   - Total URLs: {url_count}")
    
    # Mostrar preview
    print("\n📄 Preview del sitemap:")
    print("-" * 50)
    lines = xml_string.split('\n')[:20]
    print('\n'.join(lines))
    print("...")

if __name__ == "__main__":
    main()
