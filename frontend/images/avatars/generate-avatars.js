// Script para generar avatares SVG placeholders
const fs = require('fs');
const path = require('path');

const colors = ['#C2185B', '#880E4F', '#D4B0C7', '#7FB891', '#FF6B6B', '#4A90E2'];
const names = ['María G.', 'Juan P.', 'Ana S.', 'Carlos R.', 'Laura M.', 'Pedro V.'];

for (let i = 1; i <= 6; i++) {
  const color = colors[i - 1];
  const name = names[i - 1];
  const initials = name.split(' ').map(n => n[0]).join('');
  
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="72" fill="white" text-anchor="middle" dy=".3em" font-weight="bold">${initials}</text>
</svg>`;

  fs.writeFileSync(path.join(__dirname, `avatar${i}.svg`), svg);
  console.log(`✅ avatar${i}.svg creado`);
}

console.log('\n✨ Todos los avatares creados');
