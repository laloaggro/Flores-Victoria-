const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Conectar a las bases de datos
const productsDbPath = path.join(__dirname, '..', 'products.db');
const usersDbPath = path.join(__dirname, '..', 'users.db');

// Middleware para verificar el token y el rol de administrador
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto');
    
    // Verificar si el usuario es administrador
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(500).json({ error: 'Error al verificar el token' });
  }
};

// Obtener estadísticas generales del sitio
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Conectar a la base de datos de productos
    const productsDb = new sqlite3.Database(productsDbPath, (err) => {
      if (err) {
        console.error('Error al conectar con la base de datos de productos:', err.message);
        return res.status(500).json({ error: 'Error al conectar con la base de datos de productos' });
      }
    });

    // Conectar a la base de datos de usuarios
    const usersDb = new sqlite3.Database(usersDbPath, (err) => {
      if (err) {
        console.error('Error al conectar con la base de datos de usuarios:', err.message);
        productsDb.close();
        return res.status(500).json({ error: 'Error al conectar con la base de datos de usuarios' });
      }
    });

    // Obtener estadísticas de productos
    const getProductStats = () => {
      return new Promise((resolve, reject) => {
        productsDb.get(`
          SELECT 
            COUNT(*) as totalProducts,
            COUNT(DISTINCT category) as totalCategories
          FROM products
        `, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    };

    // Obtener estadísticas de usuarios
    const getUserStats = () => {
      return new Promise((resolve, reject) => {
        usersDb.get(`
          SELECT 
            COUNT(*) as totalUsers,
            COUNT(CASE WHEN role = 'admin' THEN 1 END) as totalAdmins
          FROM users
        `, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    };

    // Obtener categorías de productos
    const getProductCategories = () => {
      return new Promise((resolve, reject) => {
        productsDb.all(`
          SELECT category, COUNT(*) as count
          FROM products
          GROUP BY category
          ORDER BY count DESC
        `, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    };

    // Ejecutar todas las consultas en paralelo
    const [productStats, userStats, categories] = await Promise.all([
      getProductStats(),
      getUserStats(),
      getProductCategories()
    ]);

    // Cerrar conexiones a las bases de datos
    productsDb.close();
    usersDb.close();

    // Devolver estadísticas
    res.json({
      overview: {
        totalProducts: productStats.totalProducts,
        totalCategories: productStats.totalCategories,
        totalUsers: userStats.totalUsers,
        totalAdmins: userStats.totalAdmins
      },
      categories: categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtener actividad reciente del sitio
router.get('/activity', authenticateAdmin, async (req, res) => {
  try {
    // Conectar a la base de datos de usuarios (para registros de login)
    const usersDb = new sqlite3.Database(usersDbPath, (err) => {
      if (err) {
        console.error('Error al conectar con la base de datos de usuarios:', err.message);
        return res.status(500).json({ error: 'Error al conectar con la base de datos de usuarios' });
      }
    });

    // Obtener registros de inicio de sesión recientes
    const getRecentLogins = () => {
      return new Promise((resolve, reject) => {
        usersDb.all(`
          SELECT 
            ll.id,
            ll.user_id,
            u.name as user_name,
            u.email as user_email,
            ll.login_method,
            ll.login_time,
            ll.ip_address
          FROM login_logs ll
          JOIN users u ON ll.user_id = u.id
          ORDER BY ll.login_time DESC
          LIMIT 10
        `, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    };

    // Obtener nuevos usuarios registrados
    const getRecentUsers = () => {
      return new Promise((resolve, reject) => {
        usersDb.all(`
          SELECT id, name, email, role, created_at
          FROM users
          ORDER BY created_at DESC
          LIMIT 10
        `, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    };

    // Ejecutar consultas en paralelo
    const [recentLogins, recentUsers] = await Promise.all([
      getRecentLogins(),
      getRecentUsers()
    ]);

    // Cerrar conexión a la base de datos
    usersDb.close();

    // Devolver actividad reciente
    res.json({
      recentLogins: recentLogins,
      recentUsers: recentUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error.message);
    res.status(500).json({ error: 'Error al obtener actividad reciente' });
  }
});

module.exports = router;