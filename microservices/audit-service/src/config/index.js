module.exports = {
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/flores-victoria-audit'
  },
  server: {
    port: process.env.PORT || 3005
  }
};