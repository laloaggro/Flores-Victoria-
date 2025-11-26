// Exports centralizados para @flores-victoria/shared
module.exports = {
  // Logging
  logger: require('./logging'),
  
  // Database
  database: require('./database'),
  
  // Middleware
  middleware: require('./middleware'),
  
  // Health
  health: require('./health'),
  
  // Errors
  errors: require('./errors'),
  
  // Tracing
  tracing: require('./tracing'),
  
  // Utils
  utils: require('./utils'),
  
  // Validation
  validation: require('./validation'),
  
  // Cache
  cache: require('./cache'),
  
  // MCP
  mcp: require('./mcp'),
};
