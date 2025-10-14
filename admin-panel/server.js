const express = require('express');
const path = require('path');
const cors = require('cors');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'admin-panel',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas de API para funcionalidades administrativas

// Gestión de productos
app.get('/api/admin/products', (req, res) => {
  // En una implementación real, esto vendría de la base de datos de productos
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        name: 'Ramo de Rosas Rojas',
        description: 'Hermoso ramo de rosas rojas frescas',
        price: 15000,
        category: 'Ramos',
        image: '/temp/images/1.avif'
      },
      {
        id: 2,
        name: 'Arreglo Floral Premium',
        description: 'Arreglo floral con variedad de flores de temporada',
        price: 25000,
        category: 'Arreglos',
        image: '/temp/images/2.avif'
      }
    ]
  });
});

app.post('/api/admin/products', (req, res) => {
  // En una implementación real, esto crearía un nuevo producto
  res.json({
    status: 'success',
    message: 'Producto creado exitosamente',
    data: {
      id: 3,
      ...req.body
    }
  });
});

app.put('/api/admin/products/:id', (req, res) => {
  // En una implementación real, esto actualizaría un producto existente
  res.json({
    status: 'success',
    message: 'Producto actualizado exitosamente',
    data: {
      id: req.params.id,
      ...req.body
    }
  });
});

app.delete('/api/admin/products/:id', (req, res) => {
  // En una implementación real, esto eliminaría un producto
  res.json({
    status: 'success',
    message: 'Producto eliminado exitosamente',
    data: {
      id: req.params.id
    }
  });
});

// Gestión de usuarios
app.get('/api/admin/users', (req, res) => {
  // En una implementación real, esto vendría de la base de datos de usuarios
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        name: 'Administrador',
        email: 'admin@arreglosvictoria.com',
        role: 'admin',
        createdAt: '2025-01-01'
      },
      {
        id: 2,
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        role: 'user',
        createdAt: '2025-09-10'
      }
    ]
  });
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  // En una implementación real, esto actualizaría el estado de un pedido
  res.json({
    status: 'success',
    message: 'Estado de pedido actualizado exitosamente',
    data: {
      id: req.params.id,
      status: req.body.status
    }
  });
});

// Monitoreo del sistema
app.get('/api/system/status', (req, res) => {
  res.json({
    status: 'success',
    data: {
      servers: [
        { id: 1, name: 'Frontend Server', status: 'running', uptime: '99.9%' },
        { id: 2, name: 'Backend API', status: 'running', uptime: '99.8%' },
        { id: 3, name: 'Database', status: 'running', uptime: '100%' },
        { id: 4, name: 'Auth Service', status: 'running', uptime: '99.9%' },
        { id: 5, name: 'Product Service', status: 'running', uptime: '99.7%' }
      ],
      metrics: {
        cpu: 45,
        memory: 65,
        disk: 30,
        network: 120
      }
    }
  });
});

app.get('/api/system/logs', (req, res) => {
  res.json({
    status: 'success',
    data: [
      { timestamp: '2025-09-17 10:30:15', level: 'info', message: 'Servidor de comercio iniciado correctamente' },
      { timestamp: '2025-09-17 10:29:42', level: 'info', message: 'Usuario admin@arreglosvictoria.cl inició sesión' },
      { timestamp: '2025-09-17 10:25:18', level: 'warning', message: 'Uso de memoria alto en servidor de imágenes' },
      { timestamp: '2025-09-17 10:20:05', level: 'info', message: 'Pedido #12345 procesado correctamente' },
      { timestamp: '2025-09-17 10:15:33', level: 'info', message: 'Copia de seguridad completada' },
      { timestamp: '2025-09-17 10:05:17', level: 'error', message: 'Error de conexión a la base de datos (reintentando...)' },
      { timestamp: '2025-09-17 10:00:45', level: 'info', message: 'Servidor reiniciado correctamente' }
    ]
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Panel de administración corriendo en http://localhost:${PORT}`);
});