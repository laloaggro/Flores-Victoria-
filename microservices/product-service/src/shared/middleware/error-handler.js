// Error handler middleware stub
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not Found' });
};

module.exports = { errorHandler, notFoundHandler };
