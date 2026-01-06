/**
 * Email Templates
 * HTML templates for all transactional emails
 */

// Helper para renderizar información de entrega (evita ternarios anidados)
const renderDeliveryInfo = (deliveryDate, timeSlot) => {
  const timeSlotText = timeSlot ? ` (${timeSlot})` : '';
  return `
    <p style="margin-top: 20px;">
      <strong>📅 Fecha de entrega programada:</strong> ${deliveryDate}${timeSlotText}
    </p>
  `;
};

// Helper para renderizar apartamento (evita ternario en template)
const renderApartment = (apartment) => {
  return apartment ? `${apartment}<br>` : '';
};

const baseTemplate = (content, preheader = '') => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Flores Victoria</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #e91e63 0%, #f48fb1 100%); padding: 30px; text-align: center; }
    .header img { max-width: 150px; height: auto; }
    .header h1 { color: white; margin: 15px 0 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .footer { background: #f5f5f5; padding: 30px; text-align: center; font-size: 12px; color: #666; }
    .btn { display: inline-block; background: #e91e63; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .btn:hover { background: #c2185b; }
    .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .order-table th { background: #f9f9f9; }
    .total-row { font-weight: bold; font-size: 18px; }
    .social-links a { display: inline-block; margin: 0 10px; }
    .social-links img { width: 32px; height: 32px; }
    @media screen and (max-width: 600px) {
      .content { padding: 20px; }
      .header h1 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>
  <div class="email-container">
    <div class="header">
      <img src="https://flores-victoria.cl/images/logo-white.png" alt="Flores Victoria">
      <h1>🌸 Flores Victoria</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="https://facebook.com/floresvictoria"><img src="https://flores-victoria.cl/images/social/facebook.png" alt="Facebook"></a>
        <a href="https://instagram.com/floresvictoria"><img src="https://flores-victoria.cl/images/social/instagram.png" alt="Instagram"></a>
        <a href="https://twitter.com/floresvictoria"><img src="https://flores-victoria.cl/images/social/twitter.png" alt="Twitter"></a>
      </div>
      <p style="margin-top: 20px;">
        Flores Victoria - Llevamos la belleza natural a tu puerta<br>
        📍 Av. Providencia 1234, Santiago, Chile<br>
        📞 +56 9 1234 5678 | 📧 contacto@flores-victoria.cl
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #999;">
        Este correo fue enviado a {{ email }}. Si no deseas recibir más correos,
        <a href="{{ unsubscribe_url }}" style="color: #e91e63;">cancela tu suscripción aquí</a>.
      </p>
    </div>
  </div>
</body>
</html>
`;

const templates = {
  // Welcome Email
  welcome: (data) => ({
    subject: '¡Bienvenido a Flores Victoria! 🌸',
    html: baseTemplate(`
      <h2>¡Hola ${data.name}! 👋</h2>
      <p>Te damos la más cordial bienvenida a <strong>Flores Victoria</strong>.</p>
      <p>Estamos encantados de tenerte como parte de nuestra familia floral. A partir de ahora podrás:</p>
      <ul>
        <li>🌷 Explorar nuestra colección de arreglos florales</li>
        <li>💐 Recibir ofertas exclusivas</li>
        <li>🎁 Acumular puntos con cada compra</li>
        <li>🚚 Disfrutar de entregas en el mismo día</li>
      </ul>
      <p style="text-align: center;">
        <a href="${data.shopUrl || 'https://flores-victoria.cl/productos'}" class="btn">Explorar Productos</a>
      </p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
      <p>Con cariño,<br><strong>El equipo de Flores Victoria</strong></p>
    `, 'Bienvenido a Flores Victoria - Descubre nuestra colección'),
  }),

  // Email Verification
  emailVerification: (data) => ({
    subject: 'Verifica tu correo electrónico',
    html: baseTemplate(`
      <h2>Verifica tu correo electrónico</h2>
      <p>Hola ${data.name},</p>
      <p>Por favor, haz clic en el botón de abajo para verificar tu dirección de correo electrónico:</p>
      <p style="text-align: center;">
        <a href="${data.verificationUrl}" class="btn">Verificar Correo</a>
      </p>
      <p>Si no creaste una cuenta en Flores Victoria, puedes ignorar este correo.</p>
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        Este enlace expirará en 24 horas. Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="${data.verificationUrl}" style="color: #e91e63;">${data.verificationUrl}</a>
      </p>
    `, 'Verifica tu correo para completar tu registro'),
  }),

  // Password Reset
  passwordReset: (data) => ({
    subject: 'Restablece tu contraseña',
    html: baseTemplate(`
      <h2>Solicitud de restablecimiento de contraseña</h2>
      <p>Hola ${data.name},</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
      <p style="text-align: center;">
        <a href="${data.resetUrl}" class="btn">Restablecer Contraseña</a>
      </p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá segura.</p>
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        Este enlace expirará en 1 hora. Si el botón no funciona, copia y pega este enlace:<br>
        <a href="${data.resetUrl}" style="color: #e91e63;">${data.resetUrl}</a>
      </p>
    `, 'Restablece tu contraseña de Flores Victoria'),
  }),

  // Order Confirmation
  orderConfirmation: (data) => ({
    subject: `Pedido #${data.orderNumber} Confirmado 🎉`,
    html: baseTemplate(`
      <h2>¡Gracias por tu pedido! 🎉</h2>
      <p>Hola ${data.customerName},</p>
      <p>Tu pedido <strong>#${data.orderNumber}</strong> ha sido confirmado y está siendo procesado.</p>
      
      <table class="order-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th style="text-align: center;">Cantidad</th>
            <th style="text-align: right;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">$${item.total.toLocaleString('es-CL')}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="2" style="text-align: right;">Subtotal:</td>
            <td style="text-align: right;">$${data.subtotal.toLocaleString('es-CL')}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: right;">Envío:</td>
            <td style="text-align: right;">$${data.shipping.toLocaleString('es-CL')}</td>
          </tr>
          ${data.discount > 0 ? `
            <tr style="color: #4caf50;">
              <td colspan="2" style="text-align: right;">Descuento:</td>
              <td style="text-align: right;">-$${data.discount.toLocaleString('es-CL')}</td>
            </tr>
          ` : ''}
          <tr class="total-row">
            <td colspan="2" style="text-align: right;">Total:</td>
            <td style="text-align: right;">$${data.total.toLocaleString('es-CL')}</td>
          </tr>
        </tbody>
      </table>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-top: 20px;">
        <h3 style="margin-top: 0;">📍 Dirección de entrega</h3>
        <p style="margin-bottom: 0;">
          ${data.shippingAddress.street} ${data.shippingAddress.number}<br>
          ${renderApartment(data.shippingAddress.apartment)}
          ${data.shippingAddress.city}, ${data.shippingAddress.region}<br>
          ${data.shippingAddress.country}
        </p>
      </div>

      ${data.deliveryDate ? renderDeliveryInfo(data.deliveryDate, data.deliveryTimeSlot) : ''}

      <p style="text-align: center;">
        <a href="${data.trackingUrl || `https://flores-victoria.cl/orders/${data.orderNumber}`}" class="btn">Ver Estado del Pedido</a>
      </p>

      <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
    `, `Tu pedido #${data.orderNumber} está confirmado`),
  }),

  // Shipping Notification
  shippingNotification: (data) => ({
    subject: `Tu pedido #${data.orderNumber} está en camino 🚚`,
    html: baseTemplate(`
      <h2>¡Tu pedido está en camino! 🚚</h2>
      <p>Hola ${data.customerName},</p>
      <p>Tu pedido <strong>#${data.orderNumber}</strong> ha sido despachado y va en camino a tu dirección.</p>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #1976d2;">Código de seguimiento</p>
        <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #1565c0;">${data.trackingCode}</p>
      </div>

      <p style="text-align: center;">
        <a href="${data.trackingUrl}" class="btn">Rastrear Envío</a>
      </p>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 10px;">
        <h3 style="margin-top: 0;">📍 Dirección de entrega</h3>
        <p style="margin-bottom: 0;">
          ${data.shippingAddress.street} ${data.shippingAddress.number}<br>
          ${data.shippingAddress.city}, ${data.shippingAddress.region}
        </p>
      </div>

      <p style="margin-top: 20px;">
        <strong>Tiempo estimado de entrega:</strong> ${data.estimatedDelivery || '1-2 días hábiles'}
      </p>
    `, `Tu pedido #${data.orderNumber} está en camino`),
  }),

  // Delivery Confirmation
  deliveryConfirmation: (data) => ({
    subject: `Tu pedido #${data.orderNumber} fue entregado 🎁`,
    html: baseTemplate(`
      <h2>¡Pedido entregado! 🎁</h2>
      <p>Hola ${data.customerName},</p>
      <p>Tu pedido <strong>#${data.orderNumber}</strong> ha sido entregado exitosamente.</p>
      
      <p>Esperamos que disfrutes tu compra. Tu opinión es muy importante para nosotros.</p>
      
      <p style="text-align: center;">
        <a href="${data.reviewUrl || `https://flores-victoria.cl/orders/${data.orderNumber}/review`}" class="btn">Dejar una Reseña</a>
      </p>

      <p>¿Tuviste algún problema con tu pedido? <a href="https://flores-victoria.cl/contact" style="color: #e91e63;">Contáctanos</a> y te ayudaremos.</p>
      
      <p>¡Gracias por elegir Flores Victoria! 🌸</p>
    `, `Tu pedido #${data.orderNumber} fue entregado`),
  }),

  // Promotional Email
  promotion: (data) => ({
    subject: data.subject || '🌸 ¡Oferta especial solo para ti!',
    html: baseTemplate(`
      <div style="text-align: center;">
        ${data.bannerImage ? `<img src="${data.bannerImage}" alt="${data.title}" style="max-width: 100%; border-radius: 10px;">` : ''}
        <h2 style="color: #e91e63; margin-top: 20px;">${data.title}</h2>
        <p style="font-size: 18px;">${data.description}</p>
        
        ${data.discountCode ? `
          <div style="background: #fce4ec; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">Usa el código:</p>
            <p style="margin: 10px 0 0; font-size: 28px; font-weight: bold; color: #e91e63; letter-spacing: 3px;">${data.discountCode}</p>
          </div>
        ` : ''}
        
        <p style="text-align: center;">
          <a href="${data.ctaUrl || 'https://flores-victoria.cl/productos'}" class="btn">${data.ctaText || 'Ver Ofertas'}</a>
        </p>
        
        ${data.expiresAt ? `
          <p style="font-size: 12px; color: #666;">
            Oferta válida hasta el ${new Date(data.expiresAt).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        ` : ''}
      </div>
    `, data.preheader || 'No te pierdas esta oferta especial'),
  }),

  // Review Request
  reviewRequest: (data) => ({
    subject: '⭐ ¿Qué te pareció tu compra?',
    html: baseTemplate(`
      <h2>¿Disfrutaste tu compra? ⭐</h2>
      <p>Hola ${data.customerName},</p>
      <p>Esperamos que hayas disfrutado tu pedido de Flores Victoria. Tu opinión nos ayuda a mejorar y ayuda a otros clientes a tomar mejores decisiones.</p>
      
      <p>¿Podrías tomarte un momento para dejarnos una reseña?</p>
      
      <p style="text-align: center;">
        <a href="${data.reviewUrl}" class="btn">Dejar Reseña</a>
      </p>
      
      <p style="color: #666; font-size: 14px;">Como agradecimiento, te daremos un <strong>10% de descuento</strong> en tu próxima compra.</p>
    `, 'Tu opinión es importante para nosotros'),
  }),

  // Abandoned Cart
  abandonedCart: (data) => ({
    subject: '🛒 ¿Olvidaste algo en tu carrito?',
    html: baseTemplate(`
      <h2>Tu carrito te extraña 🛒</h2>
      <p>Hola ${data.customerName},</p>
      <p>Notamos que dejaste algunos productos en tu carrito. ¡No dejes que se marchiten!</p>
      
      <table class="order-table">
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td style="width: 80px;">
                <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 5px;">
              </td>
              <td>
                <strong>${item.name}</strong><br>
                <span style="color: #666;">Cantidad: ${item.quantity}</span>
              </td>
              <td style="text-align: right; font-weight: bold;">$${item.price.toLocaleString('es-CL')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <p style="text-align: center;">
        <a href="${data.cartUrl || 'https://flores-victoria.cl/cart'}" class="btn">Completar Compra</a>
      </p>
      
      ${data.discountCode ? `
        <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; text-align: center; margin-top: 20px;">
          <p style="margin: 0;">¡Usa el código <strong>${data.discountCode}</strong> para obtener un ${data.discountPercent || 10}% de descuento!</p>
        </div>
      ` : ''}
    `, 'Tienes productos esperándote en tu carrito'),
  }),

  // Contact Form Response
  contactResponse: (data) => ({
    subject: 'Hemos recibido tu mensaje',
    html: baseTemplate(`
      <h2>Gracias por contactarnos</h2>
      <p>Hola ${data.name},</p>
      <p>Hemos recibido tu mensaje y lo responderemos lo antes posible, generalmente dentro de las próximas 24 horas hábiles.</p>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">Tu mensaje:</p>
        <p style="margin: 10px 0 0; white-space: pre-line;">${data.message}</p>
      </div>
      
      <p>Número de ticket: <strong>#${data.ticketNumber}</strong></p>
      
      <p>Si necesitas agregar información adicional, responde a este correo citando tu número de ticket.</p>
    `, 'Recibimos tu mensaje - Te responderemos pronto'),
  }),
};

module.exports = templates;
