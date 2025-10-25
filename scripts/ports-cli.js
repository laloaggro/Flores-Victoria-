#!/usr/bin/env node

/**
 * Professional Ports CLI - Flores Victoria
 * Commands: status, who, kill, suggest, env, validate, check, export-json
 */

const { execSync } = require('child_process');
// const path = require('path');
const PortManager = require('./port-manager');
const manager = new PortManager();

function sh(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

function dockerPs() {
  const out = sh("docker ps --format '{{.ID}}\t{{.Names}}\t{{.Ports}}'");
  return out
    ? out.split('\n').map((l) => {
        const [id, name, ports] = l.split('\t');
        return { id, name, ports };
      })
    : [];
}

function portPids(port) {
  const out = sh(`lsof -nP -iTCP:${port} -sTCP:LISTEN -Fpcn`);
  if (!out) return [];
  const lines = out.split('\n');
  const results = [];
  let current = {};
  for (const line of lines) {
    if (line.startsWith('p')) current.pid = line.slice(1);
    if (line.startsWith('c')) current.cmd = line.slice(1);
    if (line.startsWith('n')) {
      // finalize
      results.push({ ...current });
      current = {};
    }
  }
  return results.filter((r) => r.pid);
}

function who(port) {
  const processes = portPids(port);
  const containers = dockerPs().filter((c) => (c.ports || '').includes(`:${port}->`));
  return { processes, containers };
}

function status(env = 'development') {
  const ports = manager.getAllPorts(env);
  const rows = [];
  for (const [service, port] of Object.entries(ports)) {
    const info = who(port);
    const usedBy = [];
    if (info.processes.length)
      usedBy.push(`proc:${info.processes.map((p) => `${p.cmd}#${p.pid}`).join(',')}`);
    if (info.containers.length)
      usedBy.push(`docker:${info.containers.map((c) => c.name).join(',')}`);
    rows.push({
      service,
      port,
      status: usedBy.length ? 'EN USO' : 'LIBRE',
      usedBy: usedBy.join(' | '),
    });
  }
  console.log(`\n🔎 Puertos (${env})`);
  console.log('Servicio'.padEnd(26), 'Puerto'.padEnd(8), 'Estado'.padEnd(10), 'Ocupado por');
  console.log('-'.repeat(80));
  rows
    .sort((a, b) => a.port - b.port)
    .forEach((r) =>
      console.log(r.service.padEnd(26), String(r.port).padEnd(8), r.status.padEnd(10), r.usedBy)
    );
}

function killPort(port) {
  const ps = portPids(port);
  if (!ps.length) {
    console.log(`✅ Puerto ${port} sin procesos locales`);
    return 0;
  }
  ps.forEach((p) => {
    try {
      process.kill(parseInt(p.pid, 10));
      console.log(`🗑️  Killed PID ${p.pid} (${p.cmd}) en puerto ${port}`);
    } catch (e) {
      console.log(`⚠️  No se pudo matar PID ${p.pid}: ${e.message}`);
    }
  });
  return 0;
}

function suggest(start = 3000, count = 5) {
  const res = [];
  let p = parseInt(start, 10);
  while (res.length < count) {
    const inUse = sh(`ss -tulpen | grep :${p} || lsof -i:${p}`);
    if (!inUse) res.push(p);
    p += 1;
  }
  console.log(res.join('\n'));
}

function exportJson(env = 'development') {
  const ports = manager.getAllPorts(env);
  const result = {};
  for (const [service, port] of Object.entries(ports)) {
    const info = who(port);
    result[service] = {
      port,
      status: info.processes.length || info.containers.length ? 'in-use' : 'free',
      processes: info.processes,
      containers: info.containers,
    };
  }
  console.log(JSON.stringify({ environment: env, data: result }, null, 2));
}

function main() {
  const [, , cmd, ...args] = process.argv;
  switch (cmd) {
    case 'status':
      status(args[0] || 'development');
      break;
    case 'who':
      if (!args[0]) return console.error('Uso: ports who <port>');
      console.log(JSON.stringify(who(parseInt(args[0], 10)), null, 2));
      break;
    case 'kill':
      if (!args[0]) return console.error('Uso: ports kill <port>');
      process.exit(killPort(parseInt(args[0], 10)));
      break;
    case 'suggest':
      suggest(args[0] || 3000, parseInt(args[1] || '5', 10));
      break;
    case 'env': {
      const env = args[0] || 'development';
      const out = args[1] || `.env.${env}`;
      manager.generateEnvFile(env, out);
      break;
    }
    case 'validate': {
      const conflicts = manager.validatePorts();
      if (conflicts.length === 0) {
        console.log('✅ No hay conflictos de puertos entre ambientes');
        process.exit(0);
      }
      console.log('❌ Conflictos encontrados:');
      conflicts.forEach((c) => console.log(`  Puerto ${c.port}: ${c.service1} <-> ${c.service2}`));
      process.exit(1);
      break;
    }
    case 'check': {
      const env = args[0] || 'development';
      manager.checkAvailability(env).then((results) => {
        const unavailable = results.filter((r) => !r.available).length;
        process.exit(unavailable > 0 ? 1 : 0);
      });
      break;
    }
    case 'export-json':
      exportJson(args[0] || 'development');
      break;
    default:
      console.log(`
Ports CLI - Flores Victoria

Uso:
  ports status [env]          # Estado actual de puertos por ambiente
  ports who <port>            # Quién ocupa un puerto (procesos/containers)
  ports kill <port>           # Matar procesos locales del puerto
  ports suggest [start] [n]   # Sugerir N puertos libres
  ports env [env] [out]       # Generar .env desde config/ports.json
  ports validate              # Conflictos entre ambientes
  ports check [env]           # Disponibilidad (exit code)
  ports export-json [env]     # Exportar estado como JSON
`);
      process.exit(0);
  }
}

main();
