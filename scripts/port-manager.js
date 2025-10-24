#!/usr/bin/env node

/**
 * 🔧 PORT CONFIGURATION MANAGER - FLORES VICTORIA v3.0
 * Gestiona puertos para diferentes ambientes sin conflictos
 */

const fs = require('fs');
const path = require('path');

class PortManager {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'config', 'ports.json');
    this.loadConfig();
  }

  /**
   * Cargar configuración de puertos
   */
  loadConfig() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
    } catch (error) {
      console.error('❌ Error cargando configuración de puertos:', error.message);
      process.exit(1);
    }
  }

  /**
   * Obtener puerto para un servicio en un ambiente específico
   */
  getPort(service, environment = 'development') {
    const env = this.config[environment];
    if (!env) {
      throw new Error(`Ambiente no encontrado: ${environment}`);
    }

    // Buscar en todas las categorías
    for (const category of Object.keys(env)) {
      if (env[category][service]) {
        return env[category][service];
      }
    }

    throw new Error(`Servicio no encontrado: ${service} en ambiente ${environment}`);
  }

  /**
   * Obtener todos los puertos de un ambiente
   */
  getAllPorts(environment = 'development') {
    const env = this.config[environment];
    if (!env) {
      throw new Error(`Ambiente no encontrado: ${environment}`);
    }

    const ports = {};
    for (const category of Object.keys(env)) {
      for (const service of Object.keys(env[category])) {
        ports[service] = env[category][service];
      }
    }
    return ports;
  }

  /**
   * Verificar si un puerto está en uso
   */
  async isPortInUse(port) {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec(`ss -tlnp | grep :${port} || lsof -i:${port}`, (error, stdout) => {
        resolve(stdout.trim().length > 0);
      });
    });
  }

  /**
   * Validar que no haya conflictos entre ambientes
   */
  validatePorts() {
    const allPorts = new Map();
    const conflicts = [];

    for (const env of ['development', 'production', 'testing']) {
      const ports = this.getAllPorts(env);
      
      for (const [service, port] of Object.entries(ports)) {
        const key = `${service}-${env}`;
        
        if (allPorts.has(port)) {
          conflicts.push({
            port,
            service1: allPorts.get(port),
            service2: key
          });
        } else {
          allPorts.set(port, key);
        }
      }
    }

    return conflicts;
  }

  /**
   * Mostrar configuración de puertos
   */
  printConfig(environment = null) {
    if (environment) {
      console.log(`\n🔧 Configuración de puertos - ${environment.toUpperCase()}`);
      console.log('═'.repeat(60));
      
      const env = this.config[environment];
      for (const category of Object.keys(env)) {
        console.log(`\n📁 ${category.toUpperCase()}`);
        for (const [service, port] of Object.entries(env[category])) {
          console.log(`  ${service.padEnd(25)} → ${port}`);
        }
      }
    } else {
      console.log('\n🔧 CONFIGURACIÓN COMPLETA DE PUERTOS');
      console.log('═'.repeat(80));
      
      for (const env of ['development', 'production', 'testing']) {
        this.printConfig(env);
      }
      
      console.log('\n📊 RANGOS DE PUERTOS');
      console.log('═'.repeat(60));
      for (const [env, range] of Object.entries(this.config.portRanges)) {
        console.log(`  ${env.padEnd(20)} → ${range}`);
      }
    }
    console.log('');
  }

  /**
   * Generar archivo .env con los puertos
   */
  generateEnvFile(environment = 'development', outputPath = null) {
    const ports = this.getAllPorts(environment);
    const envContent = [`# 🔧 PORT CONFIGURATION - ${environment.toUpperCase()}`, ''];

    for (const [service, port] of Object.entries(ports)) {
      const envVar = service.toUpperCase().replace(/-/g, '_') + '_PORT';
      envContent.push(`${envVar}=${port}`);
    }

    envContent.push('');
    const content = envContent.join('\n');

    if (outputPath) {
      fs.writeFileSync(outputPath, content);
      console.log(`✅ Archivo .env generado: ${outputPath}`);
    }

    return content;
  }

  /**
   * Verificar disponibilidad de puertos para un ambiente
   */
  async checkAvailability(environment = 'development') {
    console.log(`\n🔍 Verificando disponibilidad de puertos - ${environment.toUpperCase()}`);
    console.log('═'.repeat(60));

    const ports = this.getAllPorts(environment);
    const results = [];

    for (const [service, port] of Object.entries(ports)) {
      const inUse = await this.isPortInUse(port);
      results.push({
        service,
        port,
        available: !inUse
      });

      const status = inUse ? '❌ EN USO' : '✅ DISPONIBLE';
      console.log(`  ${service.padEnd(25)} :${port.toString().padEnd(6)} ${status}`);
    }

    const unavailable = results.filter(r => !r.available);
    
    console.log('');
    console.log(`📊 Resumen: ${results.length - unavailable.length}/${results.length} puertos disponibles`);
    
    if (unavailable.length > 0) {
      console.log('');
      console.log('⚠️  Puertos ocupados:');
      unavailable.forEach(({ service, port }) => {
        console.log(`  - ${service}: ${port}`);
      });
    }

    return results;
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new PortManager();
  const args = process.argv.slice(2);
  const command = args[0];
  const environment = args[1] || 'development';

  switch (command) {
    case 'show':
    case 'list':
      manager.printConfig(environment === 'all' ? null : environment);
      break;

    case 'get':
      const service = args[2];
      if (!service) {
        console.error('❌ Uso: node port-manager.js get <environment> <service>');
        process.exit(1);
      }
      try {
        const port = manager.getPort(service, environment);
        console.log(port);
      } catch (error) {
        console.error(`❌ ${error.message}`);
        process.exit(1);
      }
      break;

    case 'validate':
      const conflicts = manager.validatePorts();
      if (conflicts.length === 0) {
        console.log('✅ No hay conflictos de puertos entre ambientes');
      } else {
        console.log('❌ Conflictos encontrados:');
        conflicts.forEach(c => {
          console.log(`  Puerto ${c.port}: ${c.service1} <-> ${c.service2}`);
        });
        process.exit(1);
      }
      break;

    case 'check':
      manager.checkAvailability(environment).then(results => {
        const unavailable = results.filter(r => !r.available).length;
        process.exit(unavailable > 0 ? 1 : 0);
      });
      break;

    case 'generate-env':
      const outputPath = args[2] || `.env.${environment}`;
      manager.generateEnvFile(environment, outputPath);
      break;

    case 'help':
    default:
      console.log(`
🔧 PORT MANAGER - Flores Victoria v3.0

COMANDOS:
  show [environment]           Mostrar configuración de puertos
                              Ambientes: development, production, testing, all
  
  get <environment> <service>  Obtener puerto de un servicio
                              Ejemplo: get development ai-service
  
  validate                     Validar que no haya conflictos entre ambientes
  
  check [environment]          Verificar disponibilidad de puertos
  
  generate-env [environment] [output]
                              Generar archivo .env con puertos
                              Ejemplo: generate-env production .env.prod
  
  help                         Mostrar esta ayuda

EJEMPLOS:
  node port-manager.js show development
  node port-manager.js get production admin-panel
  node port-manager.js validate
  node port-manager.js check development
  node port-manager.js generate-env production
      `);
      break;
  }
}

module.exports = PortManager;
