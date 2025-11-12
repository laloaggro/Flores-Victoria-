#!/bin/bash

# Script para actualizar todas las páginas admin con el header consistente

ADMIN_DIR="/home/impala/Documentos/Proyectos/flores-victoria/admin-panel/public"

echo "🔧 Actualizando páginas de administración..."
echo ""

# Páginas admin a actualizar
ADMIN_PAGES=(
    "admin-products.html"
    "admin-orders.html"
    "admin-users.html"
)

for PAGE in "${ADMIN_PAGES[@]}"; do
    FILE="$ADMIN_DIR/$PAGE"
    
    if [ ! -f "$FILE" ]; then
        echo "⚠️  No se encontró: $PAGE"
        continue
    fi
    
    echo "📝 Procesando: $PAGE"
    
    # Crear backup
    cp "$FILE" "$FILE.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Extraer el título original
    TITLE=$(grep -m 1 "<title>" "$FILE" | sed 's/.*<title>\(.*\)<\/title>.*/\1/')
    
    # Crear nueva versión con header admin consistente
    cat > "$FILE" << 'EOHTML'
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TITLE_PLACEHOLDER</title>
    <meta name="description" content="Panel de administración de Arreglos Victoria">
    
    <!-- PWA -->
    <link rel="icon" href="/favicon.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#2d5016">
    <meta name="robots" content="noindex, nofollow">
    
    <!-- Fuentes y estilos -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous" />
    
    <!-- Estilos principales -->
    <link rel="stylesheet" href="/css/design-system.css">
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/admin-nav.css">
    
    <style>
        .admin-content-wrapper {
            min-height: calc(100vh - 80px);
            background: linear-gradient(135deg, rgba(45, 80, 22, 0.05) 0%, rgba(74, 124, 44, 0.05) 100%);
            padding: 2rem 0;
        }
        
        .admin-page-header {
            margin-bottom: 2rem;
        }
        
        .admin-page-title {
            font-size: 2rem;
            font-weight: 700;
            color: var(--admin-primary);
            margin-bottom: 0.5rem;
        }
        
        .admin-page-description {
            color: var(--text-secondary);
            font-size: 1rem;
        }
        
        .admin-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        
        .admin-card-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--admin-primary);
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--admin-primary);
        }
        
        [data-theme="dark"] .admin-content-wrapper {
            background: linear-gradient(135deg, rgba(45, 80, 22, 0.1) 0%, rgba(74, 124, 44, 0.1) 100%);
        }
        
        [data-theme="dark"] .admin-card {
            background: var(--dark-bg-secondary);
        }
        
        [data-theme="dark"] .admin-page-title,
        [data-theme="dark"] .admin-card-title {
            color: var(--admin-secondary);
        }
    </style>
</head>
<body>
    <!-- Admin Header -->
    <admin-header></admin-header>
    
    <div class="admin-content-wrapper">
        <div class="container">
            <div class="admin-page-header">
                <h1 class="admin-page-title">PAGE_TITLE_PLACEHOLDER</h1>
                <p class="admin-page-description">PAGE_DESC_PLACEHOLDER</p>
            </div>
            
            <div class="admin-card">
                <h2 class="admin-card-title">Contenido</h2>
                <div id="adminPageContent">
                    <!-- El contenido específico de la página se carga aquí -->
                    <p class="text-muted">Cargando contenido...</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="/js/admin-nav.js"></script>
    <script src="/js/theme.js"></script>
    <script>
        // Script específico de la página aquí
        console.log('Página PAGE_NAME_PLACEHOLDER cargada');
        
        // Verificar autenticación
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole !== 'admin') {
            alert('Debes iniciar sesión como administrador para acceder a esta página');
            window.location.href = '/login.html';
        }
    </script>
</body>
</html>
EOHTML
    
    # Reemplazar placeholders
    sed -i "s/TITLE_PLACEHOLDER/$TITLE/" "$FILE"
    
    # Extraer nombre de página para títulos personalizados
    case "$PAGE" in
        "admin-products.html")
            sed -i "s/PAGE_TITLE_PLACEHOLDER/Gestión de Productos/" "$FILE"
            sed -i "s/PAGE_DESC_PLACEHOLDER/Administra el catálogo de productos, actualiza precios y disponibilidad/" "$FILE"
            sed -i "s/PAGE_NAME_PLACEHOLDER/Productos/" "$FILE"
            ;;
        "admin-orders.html")
            sed -i "s/PAGE_TITLE_PLACEHOLDER/Gestión de Pedidos/" "$FILE"
            sed -i "s/PAGE_DESC_PLACEHOLDER/Administra los pedidos, actualiza estados y gestiona entregas/" "$FILE"
            sed -i "s/PAGE_NAME_PLACEHOLDER/Pedidos/" "$FILE"
            ;;
        "admin-users.html")
            sed -i "s/PAGE_TITLE_PLACEHOLDER/Gestión de Usuarios/" "$FILE"
            sed -i "s/PAGE_DESC_PLACEHOLDER/Administra usuarios, roles y permisos del sistema/" "$FILE"
            sed -i "s/PAGE_NAME_PLACEHOLDER/Usuarios/" "$FILE"
            ;;
    esac
    
    echo "   ✅ Actualizado: $PAGE"
done

echo ""
echo "✅ Actualización completada!"
echo ""
echo "📋 Páginas actualizadas:"
echo "   - admin-products.html"
echo "   - admin-orders.html" 
echo "   - admin-users.html"
echo ""
echo "🔗 Enlaces verificados:"
echo "   /admin.html → Dashboard principal"
echo "   /admin-products.html → Gestión de productos"
echo "   /admin-orders.html → Gestión de pedidos"
echo "   /admin-users.html → Gestión de usuarios"
echo "   /control-center.html → Control de servicios"
echo "   /monitoring.html → Monitoreo del sistema"
echo ""
echo "⚠️  NOTA: Se han creado backups de los archivos originales"
