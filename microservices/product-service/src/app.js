const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Product Service is running!' });
});

app.get('/products', (req, res) => {
  // Simular obtención de productos
  const products = [
    { id: 1, name: 'Rosa Roja', price: 10.99 },
    { id: 2, name: 'Tulipán Blanco', price: 8.99 },
    { id: 3, name: 'Girasol', price: 12.99 }
  ];
  res.json(products);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'product-service' });
});

module.exports = app;