// Access log middleware stub
const accessLog = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
module.exports = { accessLog };
