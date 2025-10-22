import './form.css';

export const createForm = ({
  title = 'Formulario de Contacto',
  showName = true,
  showEmail = true,
  showPhone = true,
  showMessage = true,
  submitButtonText = 'Enviar',
  onSubmit,
}) => {
  const form = document.createElement('form');
  form.className = 'storybook-form';

  let formHTML = `<h2 class="form__title">${title}</h2>`;

  if (showName) {
    formHTML += `
      <div class="form__group">
        <label class="form__label" for="name">Nombre Completo *</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          class="form__input" 
          required 
          placeholder="Juan Pérez"
        />
      </div>
    `;
  }

  if (showEmail) {
    formHTML += `
      <div class="form__group">
        <label class="form__label" for="email">Email *</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          class="form__input" 
          required 
          placeholder="ejemplo@email.com"
        />
      </div>
    `;
  }

  if (showPhone) {
    formHTML += `
      <div class="form__group">
        <label class="form__label" for="phone">Teléfono</label>
        <input 
          type="tel" 
          id="phone" 
          name="phone" 
          class="form__input" 
          placeholder="+56 9 1234 5678"
        />
      </div>
    `;
  }

  if (showMessage) {
    formHTML += `
      <div class="form__group">
        <label class="form__label" for="message">Mensaje *</label>
        <textarea 
          id="message" 
          name="message" 
          class="form__textarea" 
          required 
          rows="5"
          placeholder="Escribe tu mensaje aquí..."
        ></textarea>
      </div>
    `;
  }

  formHTML += `
    <button type="submit" class="form__submit">${submitButtonText}</button>
  `;

  form.innerHTML = formHTML;

  if (onSubmit) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      onSubmit(data);
    });
  }

  return form;
};
