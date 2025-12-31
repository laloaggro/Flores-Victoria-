#!/usr/bin/env python3
"""
Flores Victoria - Generador de Diagramas de Arquitectura
Usa la librería 'diagrams' para crear diagramas programáticamente

Instalación:
    pip install diagrams

Requisitos:
    - Graphviz instalado en el sistema
    - Ubuntu/Debian: sudo apt install graphviz
    - MacOS: brew install graphviz
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users, Client
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL, MongoDB
from diagrams.onprem.inmemory import Redis
from diagrams.onprem.network import Nginx
from diagrams.generic.network import Firewall
from diagrams.saas.chat import Slack
from diagrams.saas.analytics import Mixpanel
from diagrams.programming.framework import React
from diagrams.aws.general import User
from diagrams.custom import Custom

# Configuración general
graph_attr = {
    "fontsize": "20",
    "bgcolor": "white",
    "pad": "0.5"
}

def create_main_architecture():
    """Diagrama principal de arquitectura"""
    with Diagram(
        "Flores Victoria - Arquitectura de Microservicios",
        filename="docs/diagrams/output/main_architecture",
        show=False,
        direction="TB",
        graph_attr=graph_attr
    ):
        # Clientes
        with Cluster("Clientes"):
            web = Client("Web Browser")
            mobile = Client("Mobile App")
            admin = Client("Admin Panel")

        # API Gateway
        with Cluster("API Gateway"):
            gateway = Nginx("API Gateway\n:3000")
            
        # Microservicios
        with Cluster("Microservicios"):
            with Cluster("Core"):
                auth = Server("Auth\n:3001")
                user = Server("User\n:3002")
                product = Server("Product\n:3009")
            
            with Cluster("Commerce"):
                order = Server("Order\n:3004")
                cart = Server("Cart\n:3005")
                payment = Server("Payment\n:3018")
            
            with Cluster("Engagement"):
                wishlist = Server("Wishlist\n:3006")
                review = Server("Review\n:3007")
                notification = Server("Notification\n:3010")
            
            with Cluster("Support"):
                contact = Server("Contact\n:3008")

        # Bases de datos
        with Cluster("Data Layer"):
            postgres = PostgreSQL("PostgreSQL\nUsers, Orders")
            mongodb = MongoDB("MongoDB\nProducts, Reviews")
            redis = Redis("Redis\nCache, Sessions")

        # Conexiones clientes -> gateway
        [web, mobile, admin] >> gateway
        
        # Gateway -> Servicios
        gateway >> [auth, user, product, order, cart, wishlist, review, contact, notification, payment]
        
        # Servicios -> Bases de datos
        [auth, user, order] >> postgres
        [product, wishlist, review, contact] >> mongodb
        [cart, auth] >> redis


def create_data_flow():
    """Diagrama de flujo de datos"""
    with Diagram(
        "Flores Victoria - Flujo de Datos",
        filename="docs/diagrams/output/data_flow",
        show=False,
        direction="LR",
        graph_attr=graph_attr
    ):
        with Cluster("Frontend"):
            client = Client("Cliente")
        
        with Cluster("API Layer"):
            gw = Nginx("API Gateway")
        
        with Cluster("Business Logic"):
            services = Server("Microservicios")
        
        with Cluster("Persistence"):
            pg = PostgreSQL("PostgreSQL")
            mongo = MongoDB("MongoDB")
            cache = Redis("Redis")

        client >> Edge(label="HTTPS") >> gw
        gw >> Edge(label="JWT Auth") >> services
        services >> Edge(label="SQL") >> pg
        services >> Edge(label="NoSQL") >> mongo
        services >> Edge(label="Cache") >> cache


def create_deployment():
    """Diagrama de deployment en Railway"""
    with Diagram(
        "Flores Victoria - Railway Deployment",
        filename="docs/diagrams/output/railway_deployment",
        show=False,
        direction="TB",
        graph_attr=graph_attr
    ):
        users = Users("Usuarios")
        
        with Cluster("Railway Platform"):
            with Cluster("Public Services"):
                frontend = Server("Frontend\nReact/Vite")
                admin_panel = Server("Admin Panel")
                api_gw = Nginx("API Gateway")
            
            with Cluster("Internal Network"):
                with Cluster("Services"):
                    auth_svc = Server("Auth")
                    product_svc = Server("Product")
                    order_svc = Server("Order")
                    cart_svc = Server("Cart")
                    other_svc = Server("Other Services...")
                
                with Cluster("Databases"):
                    pg = PostgreSQL("PostgreSQL")
                    mongo = MongoDB("MongoDB")
                    redis = Redis("Redis")
        
        users >> [frontend, admin_panel]
        [frontend, admin_panel] >> api_gw
        api_gw >> [auth_svc, product_svc, order_svc, cart_svc, other_svc]
        
        auth_svc >> pg
        product_svc >> mongo
        cart_svc >> redis
        order_svc >> pg


def create_security_layers():
    """Diagrama de capas de seguridad"""
    with Diagram(
        "Flores Victoria - Capas de Seguridad",
        filename="docs/diagrams/output/security_layers",
        show=False,
        direction="TB",
        graph_attr=graph_attr
    ):
        attacker = Client("Posible Atacante")
        user = Client("Usuario Legítimo")
        
        with Cluster("Capa 1: Edge"):
            cdn = Server("CDN/WAF")
            ssl = Firewall("SSL/TLS")
        
        with Cluster("Capa 2: API Gateway"):
            rate_limit = Firewall("Rate Limiting")
            cors = Firewall("CORS")
            validation = Firewall("Input Validation")
        
        with Cluster("Capa 3: Auth"):
            jwt = Firewall("JWT Validation")
            rbac = Firewall("RBAC")
        
        with Cluster("Capa 4: Data"):
            encryption = Firewall("Encryption at Rest")
            db = PostgreSQL("Database")
        
        attacker >> Edge(color="red", style="dashed") >> cdn
        user >> cdn >> ssl >> rate_limit >> cors >> validation >> jwt >> rbac >> encryption >> db


def main():
    """Genera todos los diagramas"""
    import os
    
    # Crear directorio de salida si no existe
    os.makedirs("docs/diagrams/output", exist_ok=True)
    
    print("🎨 Generando diagramas de arquitectura...")
    
    print("  📊 1/4 Arquitectura principal...")
    create_main_architecture()
    
    print("  📊 2/4 Flujo de datos...")
    create_data_flow()
    
    print("  📊 3/4 Railway deployment...")
    create_deployment()
    
    print("  📊 4/4 Capas de seguridad...")
    create_security_layers()
    
    print("\n✅ Diagramas generados en docs/diagrams/output/")
    print("   - main_architecture.png")
    print("   - data_flow.png") 
    print("   - railway_deployment.png")
    print("   - security_layers.png")


if __name__ == "__main__":
    main()
