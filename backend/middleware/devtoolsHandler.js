const { logInfo } = require('../utils/logger');

/**
 * Middleware para manejar solicitudes de herramientas de desarrollo
 * como solicitudes de favicon, robots.txt, etc.
 */

/**
 * Middleware para manejar solicitudes de herramientas de desarrollo
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
function handleDevToolsRequests(req, res, next) {
    // Manejar solicitud de Chrome DevTools (debe ir antes de otras rutas)
    if (req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
        return res.status(200).json({
            name: "Arreglos Victoria Florería",
            version: "1.0.0",
            description: "Florería familiar con más de 20 años de experiencia"
        });
    }
    
    // Registrar solicitudes de herramientas de desarrollo
    const devToolsPaths = [
        '/favicon.ico',
        '/robots.txt',
        '/.well-known/',
        '/health'
    ];
    
    if (devToolsPaths.some(path => req.url.includes(path))) {
        logInfo('Solicitud de herramienta de desarrollo', {
            url: req.url,
            method: req.method,
            ip: req.ip
        });
    }
    
    // Manejar solicitud de health check
    if (req.url === process.env.HEALTH_CHECK_ENDPOINT || req.url === '/health') {
        return res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    }
    
    // Manejar solicitud de favicon
    if (req.url === '/favicon.ico') {
        return res.status(204).end();
    }
    
    // Manejar solicitud de robots.txt
    if (req.url === '/robots.txt') {
        res.type('text/plain');
        return res.send('User-agent: *\nDisallow: /admin/\nDisallow: /api/users/\n');
    }
    
    // Manejar otras solicitudes de .well-known
    if (req.url.startsWith('/.well-known/')) {
        logInfo('Solicitud a .well-known', {
            url: req.url,
            method: req.method,
            ip: req.ip
        });
        // Para otras rutas de .well-known que no están definidas específicamente, devolver 404
        return res.status(404).json({
            error: 'Ruta no encontrada'
        });
    }
    
    next();
}

module.exports = { handleDevToolsRequests };