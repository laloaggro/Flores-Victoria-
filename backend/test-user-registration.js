const bcrypt = require('bcrypt');

// Función para probar el hashing de contraseñas
async function testPasswordHashing() {
  const plainPassword = 'test123';
  
  console.log('Probando hashing de contraseñas...');
  console.log('Contraseña original:', plainPassword);
  
  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  console.log('Contraseña hasheada:', hashedPassword);
  
  // Verificar la contraseña
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('¿Contraseña coincide?', isMatch);
  
  // Probar con una contraseña incorrecta
  const isMatchWrong = await bcrypt.compare('wrongpassword', hashedPassword);
  console.log('¿Contraseña incorrecta coincide?', isMatchWrong);
}

testPasswordHashing().then(() => {
  console.log('Prueba completada');
}).catch(err => {
  console.error('Error en la prueba:', err);
});