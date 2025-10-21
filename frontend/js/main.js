// Funcionalidad básica para el sitio web

// Usar sentencias import ya que el script se carga como módulo
import { API_CONFIG } from './api.js';
import UserMenu from '../public/js/components/utils/userMenu.js';

// Inicializar el menú de usuario
UserMenu.init();

document.addEventListener('DOMContentLoaded', function() {
  // Funcionalidad del menú móvil
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      
      // Animación del botón de menú
      this.classList.toggle('active');
    });
  }

  // Funcionalidad del formulario de contacto
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Obtener valores del formulario
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      // Validación básica
      if (name && email && message) {
        // En un sitio real, aquí se enviaría el formulario a un servidor
        alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
        contactForm.reset();
      } else {
        alert('Por favor, completa todos los campos.');
      }
    });
  }

  // Efecto de scroll suave para los enlaces de navegación
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Cerrar menú móvil si está abierto
        if (mainNav && mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          menuToggle.classList.remove('active');
        }
      }
    });
  });

  // Animaciones al hacer scroll
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.collection-card, .feature-card, .testimonial-card');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      
      if (elementPosition < screenPosition) {
        element.style.opacity = 1;
        element.style.transform = 'translateY(0)';
      }
    });
  };

  // Estilos iniciales para animaciones
  const setInitialStyles = function() {
    const elements = document.querySelectorAll('.collection-card, .feature-card, .testimonial-card');
    
    elements.forEach(element => {
      element.style.opacity = 0;
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
  };

  // Inicializar estilos y eventos
  setInitialStyles();
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll(); // Ejecutar una vez al cargar la página

  // Actualizar contador del carrito (simulado)
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    // En un sitio real, esto se obtendría del estado del carrito
    cartCount.textContent = '0';
  }
});