/**
 * @fileoverview Rutas de Recordatorios Programados - Flores Victoria
 * API para gestión de recordatorios de fechas especiales
 */

const express = require('express');
const router = express.Router();
const { 
  ScheduledNotificationService,
  REMINDER_TYPES,
  REMINDER_STATUS,
  NOTIFICATION_CHANNELS,
  CHILEAN_HOLIDAYS,
} = require('../services/scheduled-notifications.service');

let scheduledService = null;

/**
 * Inicializa el servicio
 */
function initializeScheduledNotifications(options) {
  scheduledService = new ScheduledNotificationService(options);
  scheduledService.start();
}

// Middleware
const requireService = (req, res, next) => {
  if (!scheduledService) {
    return res.status(503).json({ success: false, error: 'Servicio no disponible' });
  }
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, error: 'Autenticación requerida' });
  }
  next();
};

// ═══════════════════════════════════════════════════════════════
// RUTAS DE RECORDATORIOS
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /reminders:
 *   get:
 *     summary: Lista recordatorios del usuario
 *     tags: [Recordatorios]
 */
router.get('/', requireService, requireAuth, async (req, res) => {
  try {
    const { status, type, upcoming } = req.query;
    
    const reminders = await scheduledService.getUserReminders(req.user.id, {
      status,
      type,
      upcoming: upcoming === 'true',
    });
    
    res.json({ success: true, data: reminders });
  } catch (error) {
    console.error('[Reminders] Error listing:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo recordatorios' });
  }
});

/**
 * @swagger
 * /reminders:
 *   post:
 *     summary: Crea un nuevo recordatorio
 *     tags: [Recordatorios]
 */
router.post('/', requireService, requireAuth, async (req, res) => {
  try {
    const { type, name, date, recipientName, recipientPhone, message, channels, recurring, productSuggestions } = req.body;

    // Validaciones
    if (!name || !date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nombre y fecha son requeridos' 
      });
    }

    if (!Object.values(REMINDER_TYPES).includes(type || REMINDER_TYPES.CUSTOM)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tipo de recordatorio no válido',
        validTypes: Object.values(REMINDER_TYPES),
      });
    }

    const reminder = await scheduledService.createReminder({
      userId: req.user.id,
      type: type || REMINDER_TYPES.CUSTOM,
      name,
      date,
      recipientName,
      recipientPhone,
      message,
      channels,
      recurring,
      productSuggestions,
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Recordatorio creado',
      data: reminder,
    });
  } catch (error) {
    console.error('[Reminders] Error creating:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /reminders/{id}:
 *   get:
 *     summary: Obtiene un recordatorio
 *     tags: [Recordatorios]
 */
router.get('/:id', requireService, requireAuth, async (req, res) => {
  try {
    const reminder = await scheduledService.getReminderById(req.params.id);
    
    if (!reminder || reminder.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Recordatorio no encontrado' });
    }
    
    res.json({ success: true, data: reminder });
  } catch (error) {
    console.error('[Reminders] Error getting:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo recordatorio' });
  }
});

/**
 * @swagger
 * /reminders/{id}:
 *   put:
 *     summary: Actualiza un recordatorio
 *     tags: [Recordatorios]
 */
router.put('/:id', requireService, requireAuth, async (req, res) => {
  try {
    const reminder = await scheduledService.updateReminder(
      req.params.id,
      req.user.id,
      req.body
    );
    
    res.json({ success: true, message: 'Recordatorio actualizado', data: reminder });
  } catch (error) {
    console.error('[Reminders] Error updating:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /reminders/{id}:
 *   delete:
 *     summary: Cancela un recordatorio
 *     tags: [Recordatorios]
 */
router.delete('/:id', requireService, requireAuth, async (req, res) => {
  try {
    await scheduledService.cancelReminder(req.params.id, req.user.id);
    res.json({ success: true, message: 'Recordatorio cancelado' });
  } catch (error) {
    console.error('[Reminders] Error cancelling:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// RUTAS DE CONVENIENCIA
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /reminders/quick/birthday:
 *   post:
 *     summary: Crea recordatorio de cumpleaños rápido
 *     tags: [Recordatorios]
 */
router.post('/quick/birthday', requireService, requireAuth, async (req, res) => {
  try {
    const { recipientName, birthday, phone, message } = req.body;

    if (!recipientName || !birthday) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nombre y fecha de cumpleaños requeridos' 
      });
    }

    // Ajustar al próximo cumpleaños
    const birthdayDate = new Date(birthday);
    const today = new Date();
    let nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }

    const reminder = await scheduledService.createReminder({
      userId: req.user.id,
      type: REMINDER_TYPES.BIRTHDAY,
      name: `Cumpleaños de ${recipientName}`,
      date: nextBirthday,
      recipientName,
      recipientPhone: phone,
      message: message || `No olvides enviar flores a ${recipientName} por su cumpleaños`,
      channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.PUSH],
      recurring: true,
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    console.error('[Reminders] Error creating birthday:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /reminders/quick/anniversary:
 *   post:
 *     summary: Crea recordatorio de aniversario rápido
 *     tags: [Recordatorios]
 */
router.post('/quick/anniversary', requireService, requireAuth, async (req, res) => {
  try {
    const { recipientName, anniversaryDate, phone, message } = req.body;

    if (!recipientName || !anniversaryDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nombre y fecha de aniversario requeridos' 
      });
    }

    const anniversary = new Date(anniversaryDate);
    const today = new Date();
    let nextAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
    
    if (nextAnniversary < today) {
      nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1);
    }

    const reminder = await scheduledService.createReminder({
      userId: req.user.id,
      type: REMINDER_TYPES.ANNIVERSARY,
      name: `Aniversario con ${recipientName}`,
      date: nextAnniversary,
      recipientName,
      recipientPhone: phone,
      message: message || `Tu aniversario con ${recipientName} está cerca`,
      channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.PUSH],
      recurring: true,
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    console.error('[Reminders] Error creating anniversary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// INFORMACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /reminders/info/types:
 *   get:
 *     summary: Tipos de recordatorios disponibles
 *     tags: [Recordatorios]
 */
router.get('/info/types', (req, res) => {
  res.json({
    success: true,
    data: {
      types: REMINDER_TYPES,
      statuses: REMINDER_STATUS,
      channels: NOTIFICATION_CHANNELS,
    },
  });
});

/**
 * @swagger
 * /reminders/info/holidays:
 *   get:
 *     summary: Próximas fechas comerciales
 *     tags: [Recordatorios]
 */
router.get('/info/holidays', (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  
  const holidayNames = {
    MOTHERS_DAY: { name: 'Día de la Madre', icon: '👩' },
    FATHERS_DAY: { name: 'Día del Padre', icon: '👨' },
    VALENTINES: { name: 'San Valentín', icon: '💕' },
    CHRISTMAS: { name: 'Navidad', icon: '🎄' },
    NEW_YEAR: { name: 'Año Nuevo', icon: '🎆' },
    SECRETARY_DAY: { name: 'Día de la Secretaria', icon: '💼' },
    CHILDRENS_DAY: { name: 'Día del Niño', icon: '👶' },
  };

  const holidays = Object.entries(CHILEAN_HOLIDAYS).map(([key, config]) => {
    let date;
    if (config.day) {
      date = new Date(year, config.month - 1, config.day);
    } else {
      // Calcular fecha dinámica
      date = calculateDynamicDate(config, year);
    }
    
    // Si ya pasó, calcular para próximo año
    if (date < today) {
      date = config.day 
        ? new Date(year + 1, config.month - 1, config.day)
        : calculateDynamicDate(config, year + 1);
    }

    return {
      id: key,
      ...holidayNames[key],
      date: date.toISOString().split('T')[0],
      daysUntil: Math.ceil((date - today) / (1000 * 60 * 60 * 24)),
    };
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  res.json({ success: true, data: holidays });
});

function calculateDynamicDate(config, year) {
  const firstDay = new Date(year, config.month - 1, 1);
  const firstWeekday = firstDay.getDay();
  
  if (config.week > 0) {
    const daysUntilFirst = (config.weekday - firstWeekday + 7) % 7;
    return new Date(year, config.month - 1, 1 + daysUntilFirst + (config.week - 1) * 7);
  } else {
    const lastDay = new Date(year, config.month, 0);
    const lastWeekday = lastDay.getDay();
    const daysFromLast = (lastWeekday - config.weekday + 7) % 7;
    return new Date(year, config.month - 1, lastDay.getDate() - daysFromLast);
  }
}

module.exports = router;
module.exports.initializeScheduledNotifications = initializeScheduledNotifications;
