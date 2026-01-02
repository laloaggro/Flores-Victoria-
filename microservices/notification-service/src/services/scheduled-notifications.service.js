/**
 * @fileoverview Sistema de Notificaciones Programadas - Flores Victoria
 * Recordatorios de fechas especiales, cumpleaños, aniversarios y fechas comerciales
 * 
 * @version 1.0.0
 */

const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

// ═══════════════════════════════════════════════════════════════
// CONSTANTES Y CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Tipos de recordatorios
 */
const REMINDER_TYPES = {
  BIRTHDAY: 'birthday',               // Cumpleaños de contacto
  ANNIVERSARY: 'anniversary',         // Aniversario
  MOTHERS_DAY: 'mothers_day',         // Día de la madre
  FATHERS_DAY: 'fathers_day',         // Día del padre
  VALENTINES: 'valentines',           // San Valentín
  CHRISTMAS: 'christmas',             // Navidad
  NEW_YEAR: 'new_year',               // Año nuevo
  CUSTOM: 'custom',                   // Fecha personalizada
  REPEAT_ORDER: 'repeat_order',       // Repetir pedido anterior
  ABANDONED_CART: 'abandoned_cart',   // Carrito abandonado
};

/**
 * Estados del recordatorio
 */
const REMINDER_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * Canales de notificación
 */
const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WHATSAPP: 'whatsapp',
};

/**
 * Fechas comerciales fijas de Chile
 */
const CHILEAN_HOLIDAYS = {
  // Día de la Madre (segundo domingo de mayo)
  MOTHERS_DAY: { month: 5, weekday: 0, week: 2 }, // Calculado
  // Día del Padre (tercer domingo de junio)
  FATHERS_DAY: { month: 6, weekday: 0, week: 3 }, // Calculado
  // San Valentín
  VALENTINES: { month: 2, day: 14 },
  // Navidad
  CHRISTMAS: { month: 12, day: 25 },
  // Año Nuevo
  NEW_YEAR: { month: 1, day: 1 },
  // Día de los Enamorados / San Valentín Chileno (14 de febrero)
  // Día de la Secretaria (último viernes de abril)
  SECRETARY_DAY: { month: 4, weekday: 5, week: -1 }, // Último viernes
  // Día del Niño (segundo domingo de agosto)
  CHILDRENS_DAY: { month: 8, weekday: 0, week: 2 },
};

/**
 * Configuración de anticipación de recordatorios
 */
const REMINDER_ADVANCE_DAYS = {
  [REMINDER_TYPES.BIRTHDAY]: [7, 3, 1],      // 7, 3 y 1 día antes
  [REMINDER_TYPES.ANNIVERSARY]: [7, 3, 1],
  [REMINDER_TYPES.MOTHERS_DAY]: [14, 7, 3],  // Más anticipación para días comerciales
  [REMINDER_TYPES.FATHERS_DAY]: [14, 7, 3],
  [REMINDER_TYPES.VALENTINES]: [14, 7, 3],
  [REMINDER_TYPES.CHRISTMAS]: [21, 14, 7],
  [REMINDER_TYPES.CUSTOM]: [7, 3, 1],
  [REMINDER_TYPES.REPEAT_ORDER]: [30],       // 30 días después de la última compra
  [REMINDER_TYPES.ABANDONED_CART]: [1, 3],   // 1 hora y 3 horas después
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE NOTIFICACIONES PROGRAMADAS
// ═══════════════════════════════════════════════════════════════

/**
 * Servicio de recordatorios y notificaciones programadas
 */
class ScheduledNotificationService {
  constructor(options = {}) {
    this.db = options.db;
    this.cache = options.cache;
    this.notificationService = options.notificationService;
    this.couponService = options.couponService;
    this.loyaltyService = options.loyaltyService;
    
    this.cronJobs = new Map();
    this.isRunning = false;
  }

  // ───────────────────────────────────────────────────────────
  // INICIALIZACIÓN Y CRON JOBS
  // ───────────────────────────────────────────────────────────

  /**
   * Inicia el servicio de notificaciones programadas
   */
  start() {
    if (this.isRunning) return;

    console.log('[ScheduledNotifications] Iniciando servicio...');

    // Verificar recordatorios cada hora
    this.cronJobs.set('reminders', cron.schedule('0 * * * *', () => {
      this.processReminders();
    }));

    // Verificar cumpleaños cada día a las 9:00 AM
    this.cronJobs.set('birthdays', cron.schedule('0 9 * * *', () => {
      this.processBirthdayReminders();
    }));

    // Verificar carritos abandonados cada 30 minutos
    this.cronJobs.set('abandoned', cron.schedule('*/30 * * * *', () => {
      this.processAbandonedCarts();
    }));

    // Preparar fechas comerciales cada día a las 8:00 AM
    this.cronJobs.set('holidays', cron.schedule('0 8 * * *', () => {
      this.processHolidayReminders();
    }));

    this.isRunning = true;
    console.log('[ScheduledNotifications] Servicio iniciado');
  }

  /**
   * Detiene el servicio
   */
  stop() {
    for (const [name, job] of this.cronJobs) {
      job.stop();
      console.log(`[ScheduledNotifications] Job ${name} detenido`);
    }
    this.cronJobs.clear();
    this.isRunning = false;
  }

  // ───────────────────────────────────────────────────────────
  // GESTIÓN DE RECORDATORIOS
  // ───────────────────────────────────────────────────────────

  /**
   * Crea un recordatorio personalizado
   * @param {Object} data - Datos del recordatorio
   * @returns {Object} Recordatorio creado
   */
  async createReminder(data) {
    const {
      userId,
      type,
      name,
      date,
      recipientName,
      recipientPhone,
      message,
      channels = [NOTIFICATION_CHANNELS.EMAIL],
      recurring = false,
      productSuggestions = [],
    } = data;

    const id = uuidv4();

    await this.db.query(`
      INSERT INTO scheduled_reminders (
        id, user_id, type, name, reminder_date, recipient_name,
        recipient_phone, message, channels, recurring,
        product_suggestions, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    `, [
      id, userId, type, name, new Date(date), recipientName,
      recipientPhone, message, JSON.stringify(channels), recurring,
      JSON.stringify(productSuggestions), REMINDER_STATUS.ACTIVE,
    ]);

    // Programar notificaciones de anticipación
    await this._scheduleAdvanceNotifications(id, type, new Date(date));

    return this.getReminderById(id);
  }

  /**
   * Actualiza un recordatorio
   * @param {string} reminderId - ID del recordatorio
   * @param {string} userId - ID del usuario (verificación)
   * @param {Object} updates - Campos a actualizar
   * @returns {Object} Recordatorio actualizado
   */
  async updateReminder(reminderId, userId, updates) {
    const reminder = await this.getReminderById(reminderId);
    
    if (!reminder || reminder.userId !== userId) {
      throw new Error('Recordatorio no encontrado');
    }

    const allowedFields = ['name', 'reminder_date', 'recipient_name', 'message', 'channels', 'status'];
    const setClauses = [];
    const params = [reminderId];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        paramCount++;
        setClauses.push(`${dbKey} = $${paramCount}`);
        params.push(key === 'channels' ? JSON.stringify(value) : value);
      }
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = NOW()');
      await this.db.query(
        `UPDATE scheduled_reminders SET ${setClauses.join(', ')} WHERE id = $1`,
        params
      );
    }

    // Si cambió la fecha, reprogramar
    if (updates.date || updates.reminderDate) {
      await this._scheduleAdvanceNotifications(
        reminderId, 
        reminder.type, 
        new Date(updates.date || updates.reminderDate)
      );
    }

    return this.getReminderById(reminderId);
  }

  /**
   * Cancela un recordatorio
   * @param {string} reminderId - ID del recordatorio
   * @param {string} userId - ID del usuario
   */
  async cancelReminder(reminderId, userId) {
    await this.db.query(`
      UPDATE scheduled_reminders 
      SET status = $2, updated_at = NOW()
      WHERE id = $1 AND user_id = $3
    `, [reminderId, REMINDER_STATUS.CANCELLED, userId]);

    // Cancelar notificaciones pendientes
    await this.db.query(`
      UPDATE scheduled_notifications 
      SET status = 'cancelled'
      WHERE reminder_id = $1 AND sent_at IS NULL
    `, [reminderId]);
  }

  /**
   * Obtiene un recordatorio por ID
   * @param {string} id - ID del recordatorio
   * @returns {Object|null} Recordatorio
   */
  async getReminderById(id) {
    const result = await this.db.query(
      'SELECT * FROM scheduled_reminders WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? this._mapReminder(result.rows[0]) : null;
  }

  /**
   * Lista recordatorios de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de filtrado
   * @returns {Array} Lista de recordatorios
   */
  async getUserReminders(userId, options = {}) {
    const { status, type, upcoming = false, limit = 50 } = options;
    
    let query = 'SELECT * FROM scheduled_reminders WHERE user_id = $1';
    const params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (upcoming) {
      query += ' AND reminder_date >= CURRENT_DATE';
    }

    query += ' ORDER BY reminder_date ASC';
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    const result = await this.db.query(query, params);
    return result.rows.map(this._mapReminder);
  }

  // ───────────────────────────────────────────────────────────
  // PROCESAMIENTO DE RECORDATORIOS
  // ───────────────────────────────────────────────────────────

  /**
   * Procesa recordatorios pendientes de enviar
   */
  async processReminders() {
    console.log('[ScheduledNotifications] Procesando recordatorios...');

    const result = await this.db.query(`
      SELECT sn.*, sr.user_id, sr.name as reminder_name, sr.type, 
             sr.recipient_name, sr.message, sr.channels,
             u.email, u.phone, u.name as user_name
      FROM scheduled_notifications sn
      JOIN scheduled_reminders sr ON sn.reminder_id = sr.id
      JOIN users u ON sr.user_id = u.id
      WHERE sn.scheduled_for <= NOW()
        AND sn.sent_at IS NULL
        AND sn.status = 'pending'
      ORDER BY sn.scheduled_for ASC
      LIMIT 100
    `);

    for (const notification of result.rows) {
      try {
        await this._sendNotification(notification);
        
        await this.db.query(`
          UPDATE scheduled_notifications 
          SET sent_at = NOW(), status = 'sent'
          WHERE id = $1
        `, [notification.id]);
      } catch (error) {
        console.error(`[ScheduledNotifications] Error enviando ${notification.id}:`, error);
        
        await this.db.query(`
          UPDATE scheduled_notifications 
          SET status = 'failed', error = $2
          WHERE id = $1
        `, [notification.id, error.message]);
      }
    }

    console.log(`[ScheduledNotifications] Procesados ${result.rows.length} recordatorios`);
  }

  /**
   * Procesa recordatorios de cumpleaños
   */
  async processBirthdayReminders() {
    console.log('[ScheduledNotifications] Procesando cumpleaños...');

    const advanceDays = REMINDER_ADVANCE_DAYS[REMINDER_TYPES.BIRTHDAY];

    for (const days of advanceDays) {
      const targetDate = this._addDays(new Date(), days);
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();

      // Buscar usuarios con cumpleaños
      const users = await this.db.query(`
        SELECT id, name, email, phone, birthday
        FROM users
        WHERE EXTRACT(MONTH FROM birthday) = $1
          AND EXTRACT(DAY FROM birthday) = $2
          AND notification_preferences->>'birthday_reminders' != 'false'
      `, [month, day]);

      for (const user of users.rows) {
        await this._sendBirthdayReminder(user, days);
      }

      // Buscar recordatorios de cumpleaños de contactos
      const reminders = await this.db.query(`
        SELECT sr.*, u.email, u.phone, u.name as user_name
        FROM scheduled_reminders sr
        JOIN users u ON sr.user_id = u.id
        WHERE sr.type = $1
          AND sr.status = 'active'
          AND EXTRACT(MONTH FROM sr.reminder_date) = $2
          AND EXTRACT(DAY FROM sr.reminder_date) = $3
      `, [REMINDER_TYPES.BIRTHDAY, month, day]);

      for (const reminder of reminders.rows) {
        await this._sendContactBirthdayReminder(reminder, days);
      }
    }
  }

  /**
   * Procesa carritos abandonados
   */
  async processAbandonedCarts() {
    console.log('[ScheduledNotifications] Procesando carritos abandonados...');

    // Carritos abandonados hace 1 hora
    const oneHourAgo = await this.db.query(`
      SELECT c.*, u.id as user_id, u.email, u.name, u.phone
      FROM carts c
      JOIN users u ON c.user_id = u.id
      WHERE c.updated_at < NOW() - INTERVAL '1 hour'
        AND c.updated_at > NOW() - INTERVAL '2 hours'
        AND c.status = 'active'
        AND c.items_count > 0
        AND NOT EXISTS (
          SELECT 1 FROM abandoned_cart_notifications acn
          WHERE acn.cart_id = c.id AND acn.sequence = 1
        )
    `);

    for (const cart of oneHourAgo.rows) {
      await this._sendAbandonedCartReminder(cart, 1);
    }

    // Carritos abandonados hace 24 horas
    const oneDayAgo = await this.db.query(`
      SELECT c.*, u.id as user_id, u.email, u.name, u.phone
      FROM carts c
      JOIN users u ON c.user_id = u.id
      WHERE c.updated_at < NOW() - INTERVAL '24 hours'
        AND c.updated_at > NOW() - INTERVAL '25 hours'
        AND c.status = 'active'
        AND c.items_count > 0
        AND NOT EXISTS (
          SELECT 1 FROM abandoned_cart_notifications acn
          WHERE acn.cart_id = c.id AND acn.sequence = 2
        )
    `);

    for (const cart of oneDayAgo.rows) {
      await this._sendAbandonedCartReminder(cart, 2);
    }
  }

  /**
   * Procesa recordatorios de fechas comerciales
   */
  async processHolidayReminders() {
    console.log('[ScheduledNotifications] Procesando fechas comerciales...');

    const today = new Date();
    const year = today.getFullYear();

    // Calcular próximas fechas comerciales
    const upcomingHolidays = [];

    for (const [key, config] of Object.entries(CHILEAN_HOLIDAYS)) {
      const holidayDate = this._calculateHolidayDate(config, year);
      const daysUntil = this._daysBetween(today, holidayDate);

      // Si está dentro de los próximos 21 días
      if (daysUntil >= 0 && daysUntil <= 21) {
        upcomingHolidays.push({
          type: key,
          date: holidayDate,
          daysUntil,
        });
      }
    }

    // Enviar recordatorios según configuración
    for (const holiday of upcomingHolidays) {
      const reminderType = REMINDER_TYPES[holiday.type] || REMINDER_TYPES.CUSTOM;
      const advanceDays = REMINDER_ADVANCE_DAYS[reminderType] || [7, 3];

      if (advanceDays.includes(holiday.daysUntil)) {
        await this._sendHolidayReminder(holiday);
      }
    }
  }

  // ───────────────────────────────────────────────────────────
  // MÉTODOS DE ENVÍO
  // ───────────────────────────────────────────────────────────

  async _sendNotification(notification) {
    const channels = notification.channels || [NOTIFICATION_CHANNELS.EMAIL];

    for (const channel of channels) {
      switch (channel) {
        case NOTIFICATION_CHANNELS.EMAIL:
          await this._sendEmailNotification(notification);
          break;
        case NOTIFICATION_CHANNELS.SMS:
          await this._sendSMSNotification(notification);
          break;
        case NOTIFICATION_CHANNELS.WHATSAPP:
          await this._sendWhatsAppNotification(notification);
          break;
        case NOTIFICATION_CHANNELS.PUSH:
          await this._sendPushNotification(notification);
          break;
      }
    }
  }

  async _sendEmailNotification(data) {
    if (!this.notificationService) return;

    await this.notificationService.sendEmail({
      to: data.email,
      subject: this._getSubject(data.type, data),
      template: 'reminder',
      data: {
        userName: data.user_name,
        reminderName: data.reminder_name,
        recipientName: data.recipient_name,
        message: data.message,
        daysUntil: data.days_until,
        productSuggestions: data.product_suggestions,
      },
    });
  }

  async _sendSMSNotification(data) {
    if (!this.notificationService) return;

    await this.notificationService.sendSMS({
      to: data.phone,
      message: this._getSMSMessage(data.type, data),
    });
  }

  async _sendWhatsAppNotification(data) {
    if (!this.notificationService) return;

    await this.notificationService.sendWhatsApp({
      to: data.phone,
      template: 'reminder',
      data: {
        name: data.user_name,
        event: data.reminder_name,
        daysUntil: data.days_until,
      },
    });
  }

  async _sendPushNotification(data) {
    if (!this.notificationService) return;

    await this.notificationService.sendPush({
      userId: data.user_id,
      title: this._getSubject(data.type, data),
      body: this._getPushMessage(data.type, data),
      data: { reminderId: data.reminder_id },
    });
  }

  async _sendBirthdayReminder(user, daysUntil) {
    // Generar cupón de cumpleaños si es el día
    if (daysUntil === 0 && this.couponService) {
      const coupon = await this.couponService.generateBirthdayCoupon(user.id);
      // Enviar con cupón
      await this.notificationService?.sendEmail({
        to: user.email,
        subject: `🎂 ¡Feliz Cumpleaños ${user.name}!`,
        template: 'birthday',
        data: {
          userName: user.name,
          couponCode: coupon.code,
          couponDiscount: coupon.discountValue,
        },
      });
    } else if (daysUntil === 3) {
      // Recordatorio previo
      await this.notificationService?.sendEmail({
        to: user.email,
        subject: `🎁 Tu cumpleaños está cerca, ${user.name}`,
        template: 'birthday_reminder',
        data: {
          userName: user.name,
          daysUntil,
        },
      });
    }
  }

  async _sendContactBirthdayReminder(reminder, daysUntil) {
    await this.notificationService?.sendEmail({
      to: reminder.email,
      subject: `💐 Recordatorio: Cumpleaños de ${reminder.recipient_name}`,
      template: 'contact_birthday_reminder',
      data: {
        userName: reminder.user_name,
        recipientName: reminder.recipient_name,
        daysUntil,
        message: reminder.message,
      },
    });
  }

  async _sendAbandonedCartReminder(cart, sequence) {
    // Registrar envío
    await this.db.query(`
      INSERT INTO abandoned_cart_notifications (id, cart_id, user_id, sequence, sent_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [uuidv4(), cart.id, cart.user_id, sequence]);

    // Generar cupón de recuperación si es segundo intento
    let couponCode = null;
    if (sequence === 2 && this.couponService) {
      const coupon = await this.couponService.createCoupon({
        code: `CARRITO-${cart.id.slice(-6).toUpperCase()}`,
        name: 'Recupera tu carrito',
        description: '10% de descuento para completar tu compra',
        type: 'single_use',
        discountType: 'percentage',
        discountValue: 10,
        maxUses: 1,
        allowedUsers: [cart.user_id],
        endDate: this._addDays(new Date(), 3),
        createdBy: 'system',
      });
      couponCode = coupon.code;
    }

    await this.notificationService?.sendEmail({
      to: cart.email,
      subject: sequence === 1 
        ? '¿Olvidaste algo? 🌸' 
        : '¡Último aviso! 10% de descuento en tu carrito 🎁',
      template: 'abandoned_cart',
      data: {
        userName: cart.name,
        cartTotal: cart.total,
        itemsCount: cart.items_count,
        couponCode,
        sequence,
      },
    });
  }

  async _sendHolidayReminder(holiday) {
    const holidayNames = {
      MOTHERS_DAY: 'Día de la Madre',
      FATHERS_DAY: 'Día del Padre',
      VALENTINES: 'San Valentín',
      CHRISTMAS: 'Navidad',
      SECRETARY_DAY: 'Día de la Secretaria',
      CHILDRENS_DAY: 'Día del Niño',
    };

    // Obtener usuarios que quieren recordatorios
    const users = await this.db.query(`
      SELECT id, name, email
      FROM users
      WHERE notification_preferences->>'holiday_reminders' != 'false'
    `);

    for (const user of users.rows) {
      await this.notificationService?.sendEmail({
        to: user.email,
        subject: `💐 ${holidayNames[holiday.type]} está cerca`,
        template: 'holiday_reminder',
        data: {
          userName: user.name,
          holidayName: holidayNames[holiday.type],
          daysUntil: holiday.daysUntil,
          holidayDate: holiday.date.toLocaleDateString('es-CL'),
        },
      });
    }
  }

  // ───────────────────────────────────────────────────────────
  // MÉTODOS AUXILIARES
  // ───────────────────────────────────────────────────────────

  async _scheduleAdvanceNotifications(reminderId, type, date) {
    const advanceDays = REMINDER_ADVANCE_DAYS[type] || [7, 3, 1];

    // Eliminar notificaciones anteriores
    await this.db.query(
      'DELETE FROM scheduled_notifications WHERE reminder_id = $1 AND sent_at IS NULL',
      [reminderId]
    );

    // Crear nuevas
    for (const days of advanceDays) {
      const scheduledFor = this._addDays(date, -days);
      
      // Solo si es en el futuro
      if (scheduledFor > new Date()) {
        await this.db.query(`
          INSERT INTO scheduled_notifications (id, reminder_id, scheduled_for, days_until, status)
          VALUES ($1, $2, $3, $4, 'pending')
        `, [uuidv4(), reminderId, scheduledFor, days]);
      }
    }
  }

  _calculateHolidayDate(config, year) {
    if (config.day) {
      // Fecha fija
      return new Date(year, config.month - 1, config.day);
    }

    // Calcular día por semana (ej: segundo domingo de mayo)
    const firstDay = new Date(year, config.month - 1, 1);
    const firstWeekday = firstDay.getDay();
    
    let targetDate;
    if (config.week > 0) {
      // N-ésima semana
      const daysUntilFirst = (config.weekday - firstWeekday + 7) % 7;
      targetDate = new Date(year, config.month - 1, 1 + daysUntilFirst + (config.week - 1) * 7);
    } else {
      // Última semana
      const lastDay = new Date(year, config.month, 0);
      const lastWeekday = lastDay.getDay();
      const daysFromLast = (lastWeekday - config.weekday + 7) % 7;
      targetDate = new Date(year, config.month - 1, lastDay.getDate() - daysFromLast);
    }

    return targetDate;
  }

  _getSubject(type, data) {
    const subjects = {
      [REMINDER_TYPES.BIRTHDAY]: `🎂 Recordatorio: Cumpleaños de ${data.recipient_name}`,
      [REMINDER_TYPES.ANNIVERSARY]: `💕 Recordatorio: Aniversario con ${data.recipient_name}`,
      [REMINDER_TYPES.MOTHERS_DAY]: '💐 ¡No olvides el Día de la Madre!',
      [REMINDER_TYPES.FATHERS_DAY]: '💐 ¡No olvides el Día del Padre!',
      [REMINDER_TYPES.VALENTINES]: '💝 San Valentín está cerca',
      [REMINDER_TYPES.CUSTOM]: `📅 Recordatorio: ${data.reminder_name}`,
    };
    return subjects[type] || `Recordatorio: ${data.reminder_name}`;
  }

  _getSMSMessage(type, data) {
    return `Flores Victoria: ${data.reminder_name} es en ${data.days_until} días. ¡Sorprende con flores! 🌸`;
  }

  _getPushMessage(type, data) {
    return `${data.reminder_name} es en ${data.days_until} días. ¡No lo olvides!`;
  }

  _addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  _daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2 - date1) / oneDay);
  }

  _mapReminder(row) {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      name: row.name,
      date: row.reminder_date,
      recipientName: row.recipient_name,
      recipientPhone: row.recipient_phone,
      message: row.message,
      channels: row.channels || [],
      recurring: row.recurring,
      productSuggestions: row.product_suggestions || [],
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  ScheduledNotificationService,
  REMINDER_TYPES,
  REMINDER_STATUS,
  NOTIFICATION_CHANNELS,
  CHILEAN_HOLIDAYS,
};
