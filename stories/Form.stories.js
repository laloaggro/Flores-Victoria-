import { createForm } from './Form';

export default {
  title: 'Components/Form',
  tags: ['autodocs'],
  render: (args) => createForm(args),
  argTypes: {
    title: {
      control: 'text',
      description: 'Título del formulario',
    },
    showName: {
      control: 'boolean',
      description: 'Mostrar campo de nombre',
    },
    showEmail: {
      control: 'boolean',
      description: 'Mostrar campo de email',
    },
    showPhone: {
      control: 'boolean',
      description: 'Mostrar campo de teléfono',
    },
    showMessage: {
      control: 'boolean',
      description: 'Mostrar campo de mensaje',
    },
    submitButtonText: {
      control: 'text',
      description: 'Texto del botón de envío',
    },
    onSubmit: { action: 'form-submitted' },
  },
};

export const ContactForm = {
  args: {
    title: 'Contáctanos',
    showName: true,
    showEmail: true,
    showPhone: true,
    showMessage: true,
    submitButtonText: 'Enviar Mensaje',
  },
};

export const QuoteForm = {
  args: {
    title: 'Solicitar Cotización',
    showName: true,
    showEmail: true,
    showPhone: true,
    showMessage: true,
    submitButtonText: 'Solicitar Cotización',
  },
};

export const NewsletterForm = {
  args: {
    title: 'Suscríbete a nuestro Newsletter',
    showName: true,
    showEmail: true,
    showPhone: false,
    showMessage: false,
    submitButtonText: 'Suscribirse',
  },
};

export const SimpleContact = {
  args: {
    title: 'Mensaje Rápido',
    showName: false,
    showEmail: true,
    showPhone: false,
    showMessage: true,
    submitButtonText: 'Enviar',
  },
};

export const FullForm = {
  args: {
    title: 'Formulario Completo',
    showName: true,
    showEmail: true,
    showPhone: true,
    showMessage: true,
    submitButtonText: 'Enviar Formulario',
  },
};
