module.exports = {
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/flores-victoria-products',
  },
  port: process.env.PORT || 3002,
  auditServiceUrl: process.env.AUDIT_SERVICE_URL || 'http://localhost:3005',
};
