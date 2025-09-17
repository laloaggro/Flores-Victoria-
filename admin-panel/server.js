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

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas de API simuladas para el panel de administración
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
      { timestamp: '2025-09-17 10:10:22', level: 'info', message: 'Usuario nuevo registrado: cliente@ejemplo.com' },
      { timestamp: '2025-09-17 10:05:17', level: 'error', message: 'Error de conexión a la base de datos (reintentando...)' },
      { timestamp: '2025-09-17 10:00:45', level: 'info', message: 'Servidor reiniciado correctamente' }
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de administración corriendo en puerto ${PORT}`);
  console.log(`Accede al panel en http://localhost:${PORT}`);
});