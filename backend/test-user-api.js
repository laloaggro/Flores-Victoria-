const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testUserAPI() {
  const baseURL = 'http://localhost:5000/api/users';
  
  console.log('Probando API de usuarios...\n');
  
  // Probar registro de usuario
  console.log('1. Registrando nuevo usuario...');
  try {
    const registerResponse = await fetch(`${baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        phone: '+56912345678',
        password: 'test1234'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Respuesta de registro:', registerData);
    
    if (registerResponse.ok) {
      console.log('✓ Registro exitoso\n');
    } else {
      console.log('✗ Error en registro\n');
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error.message, '\n');
  }
  
  // Probar inicio de sesión
  console.log('2. Iniciando sesión...');
  try {
    const loginResponse = await fetch(`${baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test1234'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Respuesta de login:', loginData);
    
    if (loginResponse.ok) {
      console.log('✓ Inicio de sesión exitoso\n');
    } else {
      console.log('✗ Error en inicio de sesión\n');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message, '\n');
  }
  
  // Probar inicio de sesión con credenciales incorrectas
  console.log('3. Iniciando sesión con credenciales incorrectas...');
  try {
    const loginResponse = await fetch(`${baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Respuesta de login (credenciales incorrectas):', loginData);
    
    if (!loginResponse.ok) {
      console.log('✓ Manejo correcto de credenciales incorrectas\n');
    } else {
      console.log('✗ Error en manejo de credenciales incorrectas\n');
    }
  } catch (error) {
    console.error('Error al probar credenciales incorrectas:', error.message, '\n');
  }
  
  // Probar obtener todos los usuarios
  console.log('4. Obteniendo lista de usuarios...');
  try {
    const usersResponse = await fetch(`${baseURL}/`);
    const usersData = await usersResponse.json();
    console.log('Usuarios registrados:', usersData.users.length);
    
    if (usersResponse.ok) {
      console.log('✓ Lista de usuarios obtenida correctamente\n');
    } else {
      console.log('✗ Error al obtener lista de usuarios\n');
    }
  } catch (error) {
    console.error('Error al obtener lista de usuarios:', error.message, '\n');
  }
  
  console.log('Pruebas completadas.');
}

testUserAPI();