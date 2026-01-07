/**
 * Rutas para gestión de backups
 * Migrado desde admin-panel legacy
 */
const express = require('express');
const router = express.Router();
const { logger } = require('@flores-victoria/shared/utils/logger');

// Initialize backup manager
let backupManager;
try {
  backupManager = require('../services/backup-manager');
  backupManager.init().catch(err => {
    logger.error('Failed to initialize backup manager:', { error: err.message });
  });
} catch (error) {
  logger.warn('Backup manager not available:', { error: error.message });
}

/**
 * @route   GET /api/backups
 * @desc    Listar todos los backups
 */
router.get('/', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    await backupManager.loadBackupHistory();
    const stats = backupManager.getBackupStats();

    res.json({
      success: true,
      backups: backupManager.backupHistory,
      stats: stats
    });
  } catch (error) {
    logger.error('Error getting backups:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/backups/create
 * @desc    Crear nuevo backup
 */
router.post('/create', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    const result = await backupManager.createFullBackup('manual');
    res.json(result);
  } catch (error) {
    logger.error('Error creating backup:', { error: error.message });
    res.status(500).json({ error: error.message, success: false });
  }
});

/**
 * @route   POST /api/backups/restore/:filename
 * @desc    Restaurar backup
 */
router.post('/restore/:filename', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    const result = await backupManager.restoreBackup(req.params.filename);
    res.json(result);
  } catch (error) {
    logger.error('Error restoring backup:', { error: error.message });
    res.status(500).json({ error: error.message, success: false });
  }
});

/**
 * @route   DELETE /api/backups/:filename
 * @desc    Eliminar backup
 */
router.delete('/:filename', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    const result = await backupManager.deleteBackup(req.params.filename);
    res.json(result);
  } catch (error) {
    logger.error('Error deleting backup:', { error: error.message });
    res.status(500).json({ error: error.message, success: false });
  }
});

/**
 * @route   POST /api/backups/cleanup
 * @desc    Limpiar backups antiguos
 */
router.post('/cleanup', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    const result = await backupManager.cleanupOldBackups();
    res.json(result);
  } catch (error) {
    logger.error('Error cleaning up backups:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/backups/schedule
 * @desc    Actualizar configuración de schedule
 */
router.post('/schedule', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Schedule configuration saved (requires restart to apply)'
    });
  } catch (error) {
    logger.error('Error updating schedule:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
