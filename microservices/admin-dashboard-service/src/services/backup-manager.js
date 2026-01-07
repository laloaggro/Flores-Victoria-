/**
 * Backup Manager System
 * Sistema de respaldos automáticos con retention policy
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const cron = require('node-cron');

class BackupManager {
  constructor() {
    // Usar ruta relativa al proyecto en desarrollo, /app/backups en producción
    const isProduction = process.env.NODE_ENV === 'production';
    const defaultDir = isProduction 
      ? '/app/backups' 
      : path.join(__dirname, '..', '..', '..', '..', '..', 'backups');
    
    this.backupDir = process.env.BACKUP_DIR || defaultDir;
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');
    this.enableDaily = process.env.BACKUP_DAILY === 'true';
    this.enableWeekly = process.env.BACKUP_WEEKLY === 'true';
    this.dailyTime = process.env.BACKUP_DAILY_TIME || '02:00';
    this.weeklyDay = parseInt(process.env.BACKUP_WEEKLY_DAY || '0'); // 0 = Sunday

    this.backupHistory = [];
    this.isRunning = false;
  }

  async init() {
    console.log('🔧 Initializing Backup Manager...');

    // Create backup directory
    await this.ensureBackupDir();

    // Load backup history
    await this.loadBackupHistory();

    // Schedule backups
    this.scheduleBackups();

    console.log('✅ Backup Manager initialized');
    console.log(`📁 Backup directory: ${this.backupDir}`);
    console.log(`🗓️  Retention policy: ${this.retentionDays} days`);
    console.log(
      `📅 Daily backups: ${this.enableDaily ? `Enabled at ${this.dailyTime}` : 'Disabled'}`
    );
    console.log(
      `📅 Weekly backups: ${this.enableWeekly ? `Enabled on day ${this.weeklyDay}` : 'Disabled'}`
    );
  }

  async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('Error creating backup directory:', error);
      throw error;
    }
  }

  async loadBackupHistory() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.tar.gz') || file.endsWith('.sql') || file.endsWith('.json')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);

          backups.push({
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            type: this.getBackupType(file),
          });
        }
      }

      this.backupHistory = backups.sort((a, b) => b.created - a.created);
      console.log(`📚 Loaded ${this.backupHistory.length} existing backups`);
    } catch (error) {
      console.error('Error loading backup history:', error);
      this.backupHistory = [];
    }
  }

  getBackupType(filename) {
    if (filename.includes('mongodb')) return 'mongodb';
    if (filename.includes('postgres')) return 'postgres';
    if (filename.includes('redis')) return 'redis';
    if (filename.includes('full')) return 'full';
    return 'unknown';
  }

  scheduleBackups() {
    // Daily backup at specified time (e.g., 02:00)
    if (this.enableDaily) {
      const [hour, minute] = this.dailyTime.split(':');
      const cronExpression = `${minute} ${hour} * * *`;

      cron.schedule(cronExpression, async () => {
        console.log('⏰ Running scheduled daily backup...');
        await this.createFullBackup('scheduled-daily');
      });

      console.log(`✅ Daily backup scheduled: ${cronExpression}`);
    }

    // Weekly backup (e.g., Sunday at 03:00)
    if (this.enableWeekly) {
      const [hour, minute] = this.dailyTime.split(':');
      const cronExpression = `${minute} ${parseInt(hour) + 1} * * ${this.weeklyDay}`;

      cron.schedule(cronExpression, async () => {
        console.log('⏰ Running scheduled weekly backup...');
        await this.createFullBackup('scheduled-weekly');
      });

      console.log(`✅ Weekly backup scheduled: ${cronExpression}`);
    }

    // Cleanup old backups daily at 04:00
    cron.schedule('0 4 * * *', async () => {
      console.log('🧹 Running backup cleanup...');
      await this.cleanupOldBackups();
    });
  }

  async createFullBackup(trigger = 'manual') {
    if (this.isRunning) {
      console.log('⚠️  Backup already in progress');
      return { success: false, error: 'Backup already in progress' };
    }

    this.isRunning = true;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const results = {
      trigger,
      timestamp,
      started: new Date(),
      backups: [],
    };

    try {
      console.log('🚀 Starting full system backup...');

      // Backup MongoDB
      console.log('📦 Backing up MongoDB...');
      const mongoResult = await this.backupMongoDB(timestamp);
      results.backups.push(mongoResult);

      // Backup PostgreSQL
      console.log('📦 Backing up PostgreSQL...');
      const postgresResult = await this.backupPostgreSQL(timestamp);
      results.backups.push(postgresResult);

      // Backup Redis (if needed)
      console.log('📦 Backing up Redis...');
      const redisResult = await this.backupRedis(timestamp);
      results.backups.push(redisResult);

      // Backup configuration files
      console.log('📦 Backing up configuration...');
      const configResult = await this.backupConfiguration(timestamp);
      results.backups.push(configResult);

      results.completed = new Date();
      results.duration = results.completed - results.started;
      results.success = true;

      // Reload backup history
      await this.loadBackupHistory();

      console.log('✅ Full backup completed successfully');
      return results;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      results.success = false;
      results.error = error.message;
      return results;
    } finally {
      this.isRunning = false;
    }
  }

  async backupMongoDB(timestamp) {
    const filename = `mongodb-backup-${timestamp}.tar.gz`;
    const backupPath = path.join(this.backupDir, filename);

    try {
      // Use mongodump to create backup
      const command = `docker exec flores-victoria-mongodb mongodump --archive=${backupPath} --gzip`;
      await execPromise(command);

      const stats = await fs.stat(backupPath);
      return {
        type: 'mongodb',
        filename,
        path: backupPath,
        size: stats.size,
        success: true,
      };
    } catch (error) {
      console.error('MongoDB backup failed:', error);
      return {
        type: 'mongodb',
        success: false,
        error: error.message,
      };
    }
  }

  async backupPostgreSQL(timestamp) {
    const filename = `postgres-backup-${timestamp}.sql`;
    const backupPath = path.join(this.backupDir, filename);

    try {
      // Use pg_dump to create backup
      const command = `docker exec flores-victoria-postgres pg_dumpall -U postgres > ${backupPath}`;
      await execPromise(command);

      const stats = await fs.stat(backupPath);
      return {
        type: 'postgres',
        filename,
        path: backupPath,
        size: stats.size,
        success: true,
      };
    } catch (error) {
      console.error('PostgreSQL backup failed:', error);
      return {
        type: 'postgres',
        success: false,
        error: error.message,
      };
    }
  }

  async backupRedis(timestamp) {
    const filename = `redis-backup-${timestamp}.rdb`;
    const backupPath = path.join(this.backupDir, filename);

    try {
      // Save Redis snapshot
      await execPromise('docker exec flores-victoria-redis redis-cli SAVE');

      // Copy RDB file
      const command = `docker cp flores-victoria-redis:/data/dump.rdb ${backupPath}`;
      await execPromise(command);

      const stats = await fs.stat(backupPath);
      return {
        type: 'redis',
        filename,
        path: backupPath,
        size: stats.size,
        success: true,
      };
    } catch (error) {
      console.error('Redis backup failed:', error);
      return {
        type: 'redis',
        success: false,
        error: error.message,
      };
    }
  }

  async backupConfiguration(timestamp) {
    const filename = `config-backup-${timestamp}.tar.gz`;
    const backupPath = path.join(this.backupDir, filename);

    try {
      // Backup docker-compose.yml and env files
      const command = `tar -czf ${backupPath} -C /app docker-compose.yml .env* 2>/dev/null || true`;
      await execPromise(command);

      const stats = await fs.stat(backupPath);
      return {
        type: 'configuration',
        filename,
        path: backupPath,
        size: stats.size,
        success: true,
      };
    } catch (error) {
      console.error('Configuration backup failed:', error);
      return {
        type: 'configuration',
        success: false,
        error: error.message,
      };
    }
  }

  async cleanupOldBackups() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    let deletedCount = 0;
    let freedSpace = 0;

    for (const backup of this.backupHistory) {
      if (backup.created < cutoffDate) {
        try {
          const stats = await fs.stat(backup.path);
          await fs.unlink(backup.path);
          deletedCount++;
          freedSpace += stats.size;
          console.log(`🗑️  Deleted old backup: ${backup.filename}`);
        } catch (error) {
          console.error(`Error deleting backup ${backup.filename}:`, error);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(
        `✅ Cleanup completed: ${deletedCount} backups deleted, ${this.formatBytes(freedSpace)} freed`
      );
      await this.loadBackupHistory();
    } else {
      console.log('✅ No old backups to clean up');
    }

    return { deletedCount, freedSpace };
  }

  async restoreBackup(filename) {
    const backup = this.backupHistory.find((b) => b.filename === filename);
    if (!backup) {
      throw new Error('Backup not found');
    }

    console.log(`🔄 Restoring backup: ${filename}`);

    try {
      switch (backup.type) {
        case 'mongodb':
          return await this.restoreMongoDB(backup.path);
        case 'postgres':
          return await this.restorePostgreSQL(backup.path);
        case 'redis':
          return await this.restoreRedis(backup.path);
        default:
          throw new Error(`Unsupported backup type: ${backup.type}`);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  async restoreMongoDB(backupPath) {
    const command = `docker exec -i flores-victoria-mongodb mongorestore --archive=${backupPath} --gzip --drop`;
    await execPromise(command);
    return { success: true, type: 'mongodb' };
  }

  async restorePostgreSQL(backupPath) {
    const command = `docker exec -i flores-victoria-postgres psql -U postgres < ${backupPath}`;
    await execPromise(command);
    return { success: true, type: 'postgres' };
  }

  async restoreRedis(backupPath) {
    // Stop Redis, replace RDB, restart
    await execPromise('docker exec flores-victoria-redis redis-cli SHUTDOWN NOSAVE');
    await execPromise(`docker cp ${backupPath} flores-victoria-redis:/data/dump.rdb`);
    await execPromise('docker start flores-victoria-redis');
    return { success: true, type: 'redis' };
  }

  async deleteBackup(filename) {
    const backup = this.backupHistory.find((b) => b.filename === filename);
    if (!backup) {
      throw new Error('Backup not found');
    }

    await fs.unlink(backup.path);
    await this.loadBackupHistory();

    console.log(`🗑️  Deleted backup: ${filename}`);
    return { success: true };
  }

  getBackupStats() {
    const totalSize = this.backupHistory.reduce((sum, b) => sum + b.size, 0);
    const byType = {};

    for (const backup of this.backupHistory) {
      if (!byType[backup.type]) {
        byType[backup.type] = { count: 0, size: 0 };
      }
      byType[backup.type].count++;
      byType[backup.type].size += backup.size;
    }

    return {
      total: this.backupHistory.length,
      totalSize,
      byType,
      oldest: this.backupHistory[this.backupHistory.length - 1],
      newest: this.backupHistory[0],
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = new BackupManager();
