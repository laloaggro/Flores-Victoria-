const request = require('supertest');
const app = require('../../microservices/i18n-service/src/app');

describe('I18n Service', () => {
  test('debería obtener traducciones para un idioma específico', async () => {
    const response = await request(app).get('/translations/es');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('language', 'es');
    expect(response.body).toHaveProperty('translations');
  });

  test('debería obtener una traducción específica', async () => {
    const response = await request(app).get('/translate/es/welcome');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('language', 'es');
    expect(response.body).toHaveProperty('key', 'welcome');
    expect(response.body).toHaveProperty('translation', 'Bienvenido');
  });

  test('debería obtener la lista de idiomas disponibles', async () => {
    const response = await request(app).get('/languages');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('languages');
    expect(Array.isArray(response.body.languages)).toBe(true);
    expect(response.body.languages).toContain('es');
    expect(response.body.languages).toContain('en');
    expect(response.body.languages).toContain('fr');
  });

  test('debería devolver la clave si no se encuentra la traducción', async () => {
    const response = await request(app).get('/translate/es/nonexistent_key');
    expect(response.status).toBe(200);
    expect(response.body.translation).toBe('nonexistent_key');
  });

  test('debería usar español como idioma por defecto', async () => {
    const response = await request(app).get('/translate/xx/welcome');
    expect(response.status).toBe(200);
    expect(response.body.translation).toBe('Bienvenido');
  });
});