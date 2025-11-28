-- Schema para auth-service en PostgreSQL
-- Tabla de usuarios para autenticación

CREATE TABLE IF NOT EXISTS auth_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  provider VARCHAR(50),
  provider_id VARCHAR(255),
  picture TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_provider ON auth_users(provider, provider_id);

-- Comentarios para documentación
COMMENT ON TABLE auth_users IS 'Usuarios registrados en el sistema de autenticación';
COMMENT ON COLUMN auth_users.username IS 'Nombre de usuario para mostrar';
COMMENT ON COLUMN auth_users.email IS 'Email único del usuario (usado para login)';
COMMENT ON COLUMN auth_users.password IS 'Hash bcrypt de la contraseña';
COMMENT ON COLUMN auth_users.role IS 'Rol del usuario: user, admin, etc.';
COMMENT ON COLUMN auth_users.provider IS 'Proveedor OAuth: google, facebook, etc.';
COMMENT ON COLUMN auth_users.provider_id IS 'ID del usuario en el proveedor OAuth';
COMMENT ON COLUMN auth_users.picture IS 'URL de la foto de perfil';
