const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Importar logger mejorado
const { logInfo, logError, logSystemStats } = require('./utils/logger');

// Crear aplicación Express
const app = express();

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Variables para el servidor
let server;

// Función para iniciar el servidor
function startServer(port) {
    server = app.listen(port, () => {
        logInfo(`Servidor backend iniciado en puerto ${port}`, {
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        });
        console.log(`Servidor corriendo en puerto ${port}`);
    });
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            logError(`El puerto ${port} está ocupado. Por favor, detenga el proceso que lo está utilizando o especifique un puerto diferente.`, err);
            console.error(`El puerto ${port} está ocupado. Por favor, detenga el proceso que lo está utilizando o especifique un puerto diferente.`);
            process.exit(1);
        } else {
            logError(`Error al iniciar el servidor: ${err.message}`, err);
            console.error(`Error al iniciar el servidor: ${err.message}`);
            process.exit(1);
        }
    });
}

// Ruta básica de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ruta para obtener productos (ejemplo)
app.get('/api/products', (req, res) => {
    // En una implementación real, esto vendría de una base de datos
    res.status(200).json({
        products: [],
        message: 'Lista de productos obtenida correctamente'
    });
});

// Iniciar el servidor
startServer(PORT);

// Registrar estadísticas del sistema cada 10 minutos
setInterval(() => {
    logSystemStats();
}, 10 * 60 * 1000); // 10 minutos

// Registrar estadísticas iniciales después de 1 minuto
setTimeout(() => {
    logSystemStats();
}, 60 * 1000); // 1 minuto

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
    logError('Error no manejado', err);
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
    const message = `❌ Error no capturado: ${err.message}`;
    logError(message, err);
    console.error(message, err);
    
    // Cerrar el servidor y salir
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    const message = `❌ Promesa rechazada no manejada: ${reason}`;
    logError(message, reason instanceof Error ? reason : new Error(String(reason)));
    console.error(message, reason);
    
    // Cerrar el servidor y salir
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// Manejar cierre graceful
process.on('SIGTERM', () => {
    logInfo('Recibida señal SIGTERM, cerrando servidor gracefully');
    if (server) {
        server.close(() => {
            logInfo('Servidor cerrado');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGINT', () => {
    logInfo('Recibida señal SIGINT, cerrando servidor gracefully');
    if (server) {
        server.close(() => {
            logInfo('Servidor cerrado');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});