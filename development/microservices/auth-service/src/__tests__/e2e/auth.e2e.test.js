const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Importar la aplicación real
const app = require('../../app');

// Configurar base de datos en memoria para pruebas E2E
let db;

beforeAll(() => {
  // Crear base de datos en memoria
  db = new Database(':memory:');
  
  // Crear tabla de usuarios
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      provider TEXT,
      provider_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Inyectar la base de datos en la aplicación
  app.locals.db = db;
});

afterAll(() => {
  // Cerrar la base de datos
  if (db) {
    db.close();
  }
});

describe('Auth Service E2E Tests', () => {
  beforeEach(() => {
    // Limpiar la base de datos antes de cada prueba
    db.exec('DELETE FROM users');
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Usuario registrado exitosamente');
      expect(response.body.data.user).toMatchObject({
        username: newUser.username,
        email: newUser.email
      });
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteUser = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Nombre de usuario, email y contraseña son requeridos');
    });

    it('debería devolver error 409 si el email ya está registrado', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      // Registrar el primer usuario
      await request(app)
        .post('/api/auth/register')
        .send(newUser);

      // Intentar registrar el mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'Password456!'
        })
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('El email ya está registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería iniciar sesión correctamente con credenciales válidas', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      // Registrar un usuario primero
      await request(app)
        .post('/api/auth/register')
        .send(newUser);

      // Iniciar sesión
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Inicio de sesión exitoso');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toMatchObject({
        username: newUser.username,
        email: newUser.email
      });
    });

    it('debería devolver error 401 con credenciales inválidas', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      // Registrar un usuario primero
      await request(app)
        .post('/api/auth/register')
        .send(newUser);

      // Intentar iniciar sesión con contraseña incorrecta
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('debería devolver error 404 si el usuario no existe', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Usuario no encontrado');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debería cerrar sesión correctamente', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Sesión cerrada exitosamente');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('debería obtener el perfil del usuario autenticado', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      // Registrar un usuario primero
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      // Iniciar sesión para obtener el token
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      const token = loginResponse.body.data.token;

      // Obtener el perfil del usuario
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toMatchObject({
        username: newUser.username,
        email: newUser.email
      });
    });

    it('debería devolver error 401 si no hay token de autenticación', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token no proporcionado');
    });

    it('debería devolver error 401 con token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token inválido');
    });
  });
});