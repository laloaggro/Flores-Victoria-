// Logger stub
const createLogger = (name) => ({
  info: (...args) => console.log(`[INFO] [${name}]`, ...args),
  error: (...args) => console.error(`[ERROR] [${name}]`, ...args),
  warn: (...args) => console.warn(`[WARN] [${name}]`, ...args),
  debug: () => {},
});
module.exports = { createLogger };
