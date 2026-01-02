// Access log middleware stub - factory function
const accessLog = (logger) => (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
module.exports = { accessLog };
