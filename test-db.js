const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:admin123@postgres:5432/floresvictoria',
});
client
  .connect()
  .then(() => {
    console.log('Conexión exitosa');
    client.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Error en la consulta:', err);
      } else {
        console.log('Consulta exitosa:', res.rows);
      }
      client.end();
    });
  })
  .catch((err) => {
    console.error('Error de conexión:', err);
  });
