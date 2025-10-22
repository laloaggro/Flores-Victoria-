const path = require('path');

const express = require('express');

const router = express.Router();

// Servir documentación de API
router.get('/', (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Documentación de API - Arreglos Victoria</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                }
                .header {
                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                    color: white;
                    padding: 2rem;
                    border-radius: 10px;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .header h1 {
                    margin: 0;
                    font-size: 2.5rem;
                }
                .endpoint {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    border-left: 4px solid #4CAF50;
                }
                .endpoint-method {
                    display: inline-block;
                    padding: 0.3rem 0.8rem;
                    border-radius: 4px;
                    font-weight: bold;
                    margin-right: 0.5rem;
                }
                .get {
                    background-color: #2196F3;
                    color: white;
                }
                .post {
                    background-color: #4CAF50;
                    color: white;
                }
                .put {
                    background-color: #FF9800;
                    color: white;
                }
                .delete {
                    background-color: #F44336;
                    color: white;
                }
                .endpoint-url {
                    font-family: 'Courier New', monospace;
                    font-size: 1.1rem;
                    color: #2E7D32;
                    font-weight: bold;
                }
                .endpoint-description {
                    margin: 1rem 0;
                    color: #555;
                }
                .endpoint-params {
                    background-color: #f1f8e9;
                    padding: 1rem;
                    border-radius: 6px;
                    margin: 1rem 0;
                }
                .endpoint-params h4 {
                    margin-top: 0;
                    color: #2E7D32;
                }
                .endpoint-example {
                    background-color: #e3f2fd;
                    padding: 1rem;
                    border-radius: 6px;
                    margin: 1rem 0;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9rem;
                }
                .response {
                    background-color: #fff3e0;
                    padding: 1rem;
                    border-radius: 6px;
                    margin: 1rem 0;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9rem;
                }
                h2 {
                    color: #2E7D32;
                    border-bottom: 2px solid #4CAF50;
                    padding-bottom: 0.5rem;
                }
                h3 {
                    color: #388E3C;
                }
                code {
                    background-color: #f5f5f5;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Documentación de API</h1>
                <p>Arreglos Victoria Florería - API RESTful</p>
            </div>
            
            <h2>Introducción</h2>
            <p>Esta es la documentación de la API RESTful para Arreglos Victoria Florería. La API permite acceder a productos, usuarios, carrito de compras, órdenes y otras funcionalidades del sistema.</p>
            
            <h2>Endpoints</h2>
            
            <div class="endpoint">
                <div>
                    <span class="endpoint-method get">GET</span>
                    <span class="endpoint-url">/api/products</span>
                </div>
                <div class="endpoint-description">
                    <p>Obtiene una lista de productos con paginación y filtros.</p>
                </div>
                <div class="endpoint-params">
                    <h4>Parámetros de consulta (Query Parameters)</h4>
                    <ul>
                        <li><code>page</code> (opcional) - Número de página (por defecto: 1)</li>
                        <li><code>limit</code> (opcional) - Productos por página (por defecto: 12)</li>
                        <li><code>category</code> (opcional) - Filtrar por categoría</li>
                        <li><code>minPrice</code> (opcional) - Precio mínimo</li>
                        <li><code>maxPrice</code> (opcional) - Precio máximo</li>
                        <li><code>search</code> (opcional) - Término de búsqueda</li>
                        <li><code>sortBy</code> (opcional) - Ordenar por (name, price-low, price-high)</li>
                    </ul>
                </div>
                <div class="endpoint-example">
                    <h4>Ejemplo de solicitud:</h4>
                    <p>GET /api/products?page=1&limit=12&category=ramos&sortBy=price-low</p>
                </div>
                <div class="response">
                    <h4>Ejemplo de respuesta:</h4>
                    <pre>{
  "products": [
    {
      "id": 1,
      "name": "Ramo de Rosas",
      "description": "Hermoso ramo de rosas rojas",
      "price": 15990,
      "image": "ramo-rosas.jpg",
      "category": "ramos"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}</pre>
                </div>
            </div>
            
            <div class="endpoint">
                <div>
                    <span class="endpoint-method get">GET</span>
                    <span class="endpoint-url">/api/products/:id</span>
                </div>
                <div class="endpoint-description">
                    <p>Obtiene un producto específico por su ID.</p>
                </div>
                <div class="endpoint-params">
                    <h4>Parámetros</h4>
                    <ul>
                        <li><code>id</code> (requerido) - ID del producto</li>
                    </ul>
                </div>
                <div class="endpoint-example">
                    <h4>Ejemplo de solicitud:</h4>
                    <p>GET /api/products/1</p>
                </div>
                <div class="response">
                    <h4>Ejemplo de respuesta:</h4>
                    <pre>{
  "id": 1,
  "name": "Ramo de Rosas",
  "description": "Hermoso ramo de rosas rojas",
  "price": 15990,
  "image": "ramo-rosas.jpg",
  "category": "ramos"
}</pre>
                </div>
            </div>
            
            <div class="endpoint">
                <div>
                    <span class="endpoint-method get">GET</span>
                    <span class="endpoint-url">/api/users/test</span>
                </div>
                <div class="endpoint-description">
                    <p>Endpoint de prueba para verificar que las rutas de usuarios estén montadas correctamente.</p>
                </div>
                <div class="response">
                    <h4>Ejemplo de respuesta:</h4>
                    <pre>{
  "message": "Rutas de usuarios montadas correctamente"
}</pre>
                </div>
            </div>
            
            <h2>Autenticación</h2>
            <p>Algunos endpoints requieren autenticación mediante tokens JWT. Los tokens se obtienen al iniciar sesión y deben enviarse en el encabezado <code>Authorization</code> con el prefijo <code>Bearer</code>.</p>
            
            <h2>Códigos de estado HTTP</h2>
            <ul>
                <li><code>200</code> - Éxito</li>
                <li><code>400</code> - Solicitud incorrecta</li>
                <li><code>401</code> - No autorizado</li>
                <li><code>404</code> - No encontrado</li>
                <li><code>500</code> - Error interno del servidor</li>
            </ul>
            
            <h2>Soporte</h2>
            <p>Para soporte técnico, contacta al administrador del sistema.</p>
        </body>
        </html>
    `);
});

module.exports = router;
