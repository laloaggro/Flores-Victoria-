const express = require("express");
const app = express();
app.use(express.json());

// Simular el endpoint de Google login
app.post("/api/users/google-login", (req, res) => {
  console.log("Datos recibidos:", req.body);
  res.json({ message: "OK", received: req.body });
});

app.listen(3001, () => {
  console.log("Servidor de prueba en http://localhost:3001");
});
