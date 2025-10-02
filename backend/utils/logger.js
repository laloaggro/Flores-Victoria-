/**
 * Sistema de logging para la aplicación
 * Proporciona funciones para registrar diferentes tipos de mensajes
 */

/**
 * Formatear fecha para los logs
 * @returns {string} Fecha formateada
 */
function formatLogDate() {
    const now = new Date();
    return now.toISOString();
}

/**
 * Escribir mensaje en el archivo de log
 * @param {string} level - Nivel de log (INFO, ERROR, WARN, etc.)
 * @param {string} message - Mensaje a loguear
 * @param {Object} context - Contexto adicional
 */
function writeLog(level, message, context = null) {
    /*
    const timestamp = formatLogDate();
    const logEntry = {
        timestamp,
        level,
        message,
        context
    };
    
    // Escribir en archivo principal
    const logMessage = `${timestamp} [${level}] ${message}${context ? ` Context: ${JSON.stringify(context)}` : ''}\n`;
    fs.appendFileSync(logFile, logMessage);
    
    // Escribir en archivo de respaldo para errores y eventos importantes
    if (level === 'ERROR' || level === 'EVENT') {
        fs.appendFileSync(backupLogFile, logMessage);
    }
    */
    
    // Solo mostrar en consola
    const timestamp = formatLogDate();
    const logMessage = `${timestamp} [${level}] ${message}${context ? ` Context: ${JSON.stringify(context)}` : ''}`;
    console.log(logMessage);
}

/**
 * Registrar información
 * @param {string} message - Mensaje informativo
 * @param {Object} context - Contexto adicional
 */
function logInfo(message, context = null) {
    writeLog('INFO', message, context);
}

/**
 * Registrar advertencias
 * @param {string} message - Mensaje de advertencia
 * @param {Object} context - Contexto adicional
 */
function logWarn(message, context = null) {
    writeLog('WARN', message, context);
}

/**
 * Registrar errores
 * @param {string} message - Mensaje de error
 * @param {Error|Object} error - Error o contexto adicional
 */
function logError(message, error = null) {
    const context = error instanceof Error ? { 
        message: error.message, 
        stack: error.stack,
        name: error.name
    } : error;
    
    writeLog('ERROR', message, context);
}

/**
 * Registrar solicitudes HTTP
 * @param {string} method - Método HTTP
 * @param {string} url - URL de la solicitud
 * @param {string} ip - Dirección IP del cliente
 * @param {number} statusCode - Código de estado (opcional)
 */
function logHttpRequest(method, url, ip, statusCode = null) {
    // No registrar solicitudes de herramientas de desarrollo
    const devToolsPaths = ['.well-known', 'favicon.ico', 'robots.txt'];
    if (devToolsPaths.some(path => url.includes(path))) {
        return;
    }
    
    const message = statusCode 
        ? `[${method}] ${url} - IP: ${ip} - Status: ${statusCode}`
        : `[${method}] ${url} - IP: ${ip} - In progress`;
    
    writeLog(statusCode && statusCode >= 400 ? 'ERROR' : 'INFO', message);
}

/**
 * Registrar errores de aplicación
 * @param {string} message - Mensaje de error
 * @param {Error} error - Error
 * @param {Object} context - Contexto adicional
 */
function logApplicationError(message, error = null, context = null) {
    const errorContext = error instanceof Error ? { 
        message: error.message, 
        stack: error.stack,
        name: error.name
    } : error;
    
    const fullContext = { ...context, ...errorContext };
    writeLog('ERROR', `[APPLICATION_ERROR] ${message}`, fullContext);
}

/**
 * Registrar eventos importantes de la aplicación
 * @param {string} message - Mensaje del evento
 * @param {Object} context - Contexto adicional
 */
function logEvent(message, context = null) {
    writeLog('EVENT', message, context);
}

/**
 * Obtener estadísticas del sistema para monitoreo
 * @returns {Object} Estadísticas del sistema
 */
function getSystemStats() {
    const stats = {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
    };
    
    return stats;
}

/**
 * Registrar estadísticas del sistema
 */
function logSystemStats() {
    const stats = getSystemStats();
    logInfo('System Statistics', stats);
}

module.exports = {
    logInfo,
    logWarn,
    logError,
    logHttpRequest,
    logApplicationError,
    logEvent,
    logSystemStats,
    getSystemStats
};