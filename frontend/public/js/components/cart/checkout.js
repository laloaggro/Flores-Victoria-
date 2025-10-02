import { showNotification, updateCartCount, formatPrice, getUserInfoFromToken as getUser, isAuthenticated, API_BASE_URL } from '../utils/utils.js';
import { initUserMenu } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar menú de usuario
  initUserMenu();
  
  // Elementos del DOM
  const orderItems = document.querySelector('.order-items');
  const totalAmount = document.querySelector('.total-amount');
  const paymentForm = document.getElementById('paymentForm');
  const checkoutButton = document.querySelector('.checkout-button');
  
  // Verificar autenticación
  if (!isAuthenticated()) {
    showNotification('Debes iniciar sesión para continuar con el pedido', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  
  // Cargar resumen del pedido
  loadOrderSummary();
  
  // Manejar envío del formulario de pago
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Obtener datos del formulario
      const cardNumber = document.getElementById('cardNumber').value;
      const expiryDate = document.getElementById('expiryDate').value;
      const cvv = document.getElementById('cvv').value;
      const cardName = document.getElementById('cardName').value;
      const billingAddress = document.getElementById('billingAddress').value;
      const notes = document.getElementById('notes').value;
      
      // Validaciones básicas (en un entorno real, estas validaciones serían más robustas)
      if (!cardNumber || !expiryDate || !cvv || !cardName || !billingAddress) {
        showNotification('Por favor completa todos los campos obligatorios', 'error');
        return;
      }
      
      // Validar formato de tarjeta de crédito (simplificado)
      if (!isValidCardNumber(cardNumber)) {
        showNotification('Número de tarjeta inválido', 'error');
        return;
      }
      
      // Validar fecha de expiración
      if (!isValidExpiryDate(expiryDate)) {
        showNotification('Fecha de expiración inválida', 'error');
        return;
      }
      
      // Validar CVV
      if (!isValidCVV(cvv)) {
        showNotification('CVV inválido', 'error');
        return;
      }
      
      // Procesar pago (simulado)
      processPayment({
        cardNumber,
        expiryDate,
        cvv,
        cardName,
        billingAddress,
        notes
      });
    });
  }
  
  // Cargar resumen del pedido
  function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
      if (orderItems) {
        orderItems.innerHTML = '<p class="empty-order-message">No hay productos en tu pedido</p>';
      }
      if (totalAmount) {
        totalAmount.textContent = '$0';
      }
      if (checkoutButton) {
        checkoutButton.disabled = true;
      }
      return;
    }
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Renderizar items del pedido
    if (orderItems) {
      orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
          <div class="order-item-image">
            <img src="${item.image || './assets/images/placeholder.svg'}" alt="${item.name}" onerror="this.src='./assets/images/placeholder.svg'">
          </div>
          <div class="order-item-details">
            <h4>${item.name}</h4>
            <p>${item.quantity} x ${formatPrice(item.price)}</p>
          </div>
          <div class="order-item-total">
            ${formatPrice(item.price * item.quantity)}
          </div>
        </div>
      `).join('');
    }
    
    // Actualizar total
    if (totalAmount) {
      totalAmount.textContent = formatPrice(total);
    }
    
    // Habilitar botón de checkout
    if (checkoutButton) {
      checkoutButton.disabled = false;
    }
  }
  
  // Función para mostrar indicador de carga
  function showLoading(message = 'Procesando...') {
    // Eliminar cualquier indicador de carga existente
    const existingLoading = document.getElementById('checkout-loading');
    if (existingLoading) {
      existingLoading.remove();
    }
    
    const loadingElement = document.createElement('div');
    loadingElement.id = 'checkout-loading';
    loadingElement.className = 'loading-overlay';
    loadingElement.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(loadingElement);
  }

  // Función para ocultar indicador de carga
  function hideLoading() {
    const loadingElement = document.getElementById('checkout-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  // Función para mostrar mensaje de error
  function showError(message) {
    // Eliminar cualquier mensaje de error existente
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="this.parentElement.remove()">Cerrar</button>
    `;
    document.body.appendChild(errorElement);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      if (errorElement.parentElement) {
        errorElement.remove();
      }
    }, 5000);
  }
  
  // Función para mostrar confirmación de pedido
  function showConfirmation(orderId) {
    // Ocultar formulario de pago
    const paymentSection = document.querySelector('.payment-section');
    if (paymentSection) {
      paymentSection.style.display = 'none';
    }
    
    // Mostrar confirmación
    const confirmationSection = document.querySelector('.confirmation-section');
    if (confirmationSection) {
      confirmationSection.style.display = 'block';
      const orderIdElement = confirmationSection.querySelector('.order-id');
      if (orderIdElement) {
        orderIdElement.textContent = orderId;
      }
    }
    
    // Limpiar carrito
    localStorage.removeItem('cart');
    updateCartCount();
  }

  // Función para obtener datos de pago
  function getPaymentData() {
    return {
      cardNumber: document.getElementById('cardNumber')?.value || '',
      expiryDate: document.getElementById('expiryDate')?.value || '',
      cvv: document.getElementById('cvv')?.value || '',
      cardName: document.getElementById('cardName')?.value || '',
      billingAddress: document.getElementById('billingAddress')?.value || '',
      notes: document.getElementById('notes')?.value || ''
    };
  }

  // Función para validar número de tarjeta (simplificada)
  function isValidCardNumber(cardNumber) {
    // Eliminar espacios
    const cleaned = cardNumber.replace(/\s/g, '');
    // Verificar que sean solo números y tengan longitud adecuada
    return /^\d{16}$/.test(cleaned);
  }

  // Función para validar fecha de expiración
  function isValidExpiryDate(expiryDate) {
    // Formato MM/AA
    const regex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    const match = expiryDate.match(regex);
    
    if (!match) return false;
    
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    
    // Convertir a año completo (asumimos 20xx para años menores a 50)
    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    
    // Obtener fecha actual
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() es 0-indexado
    
    // Verificar que la fecha no haya expirado
    if (fullYear < currentYear) return false;
    if (fullYear === currentYear && month < currentMonth) return false;
    
    return true;
  }

  // Función para validar CVV
  function isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }

  // Función para procesar el pago con manejo de errores
  async function processPayment(paymentData) {
    showLoading('Procesando pago...');
    
    try {
      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
      // Preparar datos del pedido
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (cart.length === 0) {
        throw new Error('El carrito está vacío');
      }
      
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentInfo: paymentData,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
      
      // Enviar pedido al servidor
      const response = await fetch(`${API_BASE_URL}/api/checkout/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error en el proceso de pago: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      showConfirmation(result.orderId);
      
      // Mostrar notificación de éxito
      showNotification('¡Pedido procesado con éxito!', 'success');
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      showError(error.message || 'No se pudo procesar el pago. Por favor, verifica tus datos e inténtalo de nuevo.');
    } finally {
      hideLoading();
    }
  }
  
  // Inicializar contador del carrito
  updateCartCount();
});