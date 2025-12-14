#!/usr/bin/env node

/**
 * @fileoverview License Checker & SBOM Generator
 * @description Audita licencias de dependencias y genera Software Bill of Materials
 * @author Flores Victoria Team
 * @version 1.0.0
 * 
 * Uso: 
 *   node scripts/license-checker.js [--check] [--sbom] [--format json|spdx|cyclonedx]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Licencias permitidas (aprobadas para uso comercial)
 */
const ALLOWED_LICENSES = [
  'MIT',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'CC0-1.0',
  'Unlicense',
  '0BSD',
  'CC-BY-3.0',
  'CC-BY-4.0',
  'WTFPL',
  'Python-2.0',
  'Zlib',
  'BlueOak-1.0.0',
];

/**
 * Licencias que requieren revisión
 */
const REVIEW_LICENSES = [
  'LGPL-2.0',
  'LGPL-2.1',
  'LGPL-3.0',
  'MPL-2.0',
  'EPL-1.0',
  'EPL-2.0',
  'CDDL-1.0',
];

/**
 * Licencias no permitidas para uso comercial
 */
const FORBIDDEN_LICENSES = [
  'GPL-2.0',
  'GPL-3.0',
  'AGPL-3.0',
  'CC-BY-NC-4.0',
  'CC-BY-NC-SA-4.0',
];

/**
 * Paquetes excluidos (falsos positivos o licencias ya verificadas)
 */
const EXCLUDED_PACKAGES = [
  // Paquetes de desarrollo que no se distribuyen
];

/**
 * Obtiene información de licencias de un directorio
 * @param {string} dir - Directorio con package.json
 * @returns {Array}
 */
function getLicenseInfo(dir) {
  const packages = [];
  const nodeModulesPath = path.join(dir, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    return packages;
  }

  const entries = fs.readdirSync(nodeModulesPath);
  
  for (const entry of entries) {
    // Manejar scoped packages
    if (entry.startsWith('@')) {
      const scopedPath = path.join(nodeModulesPath, entry);
      const scopedEntries = fs.readdirSync(scopedPath);
      
      for (const scopedEntry of scopedEntries) {
        const pkgPath = path.join(scopedPath, scopedEntry, 'package.json');
        const pkg = readPackageJson(pkgPath);
        if (pkg) {
          packages.push({
            ...pkg,
            name: `${entry}/${scopedEntry}`,
          });
        }
      }
    } else {
      const pkgPath = path.join(nodeModulesPath, entry, 'package.json');
      const pkg = readPackageJson(pkgPath);
      if (pkg) {
        packages.push(pkg);
      }
    }
  }
  
  return packages;
}

/**
 * Lee y parsea un package.json
 * @param {string} pkgPath
 * @returns {Object|null}
 */
function readPackageJson(pkgPath) {
  if (!fs.existsSync(pkgPath)) {
    return null;
  }
  
  try {
    const content = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return {
      name: content.name,
      version: content.version,
      license: normalizeLicense(content.license || content.licenses),
      description: content.description || '',
      homepage: content.homepage || '',
      repository: content.repository?.url || content.repository || '',
      author: formatAuthor(content.author),
    };
  } catch {
    return null;
  }
}

/**
 * Normaliza el campo de licencia
 * @param {string|Object|Array} license
 * @returns {string}
 */
function normalizeLicense(license) {
  if (!license) return 'UNKNOWN';
  
  if (typeof license === 'string') {
    return license.replace(/[()]/g, '').trim();
  }
  
  if (Array.isArray(license)) {
    return license.map(l => l.type || l).join(' OR ');
  }
  
  if (typeof license === 'object' && license.type) {
    return license.type;
  }
  
  return 'UNKNOWN';
}

/**
 * Formatea información del autor
 * @param {string|Object} author
 * @returns {string}
 */
function formatAuthor(author) {
  if (!author) return '';
  if (typeof author === 'string') return author;
  
  const parts = [];
  if (author.name) parts.push(author.name);
  if (author.email) parts.push(`<${author.email}>`);
  return parts.join(' ');
}

/**
 * Categoriza una licencia
 * @param {string} license
 * @returns {string}
 */
function categorizeLicense(license) {
  const normalized = license.toUpperCase();
  
  if (ALLOWED_LICENSES.some(l => normalized.includes(l.toUpperCase()))) {
    return 'allowed';
  }
  
  if (FORBIDDEN_LICENSES.some(l => normalized.includes(l.toUpperCase()))) {
    return 'forbidden';
  }
  
  if (REVIEW_LICENSES.some(l => normalized.includes(l.toUpperCase()))) {
    return 'review';
  }
  
  return 'unknown';
}

/**
 * Genera reporte de licencias
 * @param {Array} packages
 * @returns {Object}
 */
function generateReport(packages) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: packages.length,
      allowed: 0,
      review: 0,
      forbidden: 0,
      unknown: 0,
    },
    packages: {
      allowed: [],
      review: [],
      forbidden: [],
      unknown: [],
    },
  };
  
  for (const pkg of packages) {
    if (EXCLUDED_PACKAGES.includes(pkg.name)) continue;
    
    const category = categorizeLicense(pkg.license);
    report.summary[category]++;
    report.packages[category].push(pkg);
  }
  
  return report;
}

/**
 * Genera SBOM en formato SPDX
 * @param {Array} packages
 * @param {Object} projectInfo
 * @returns {Object}
 */
function generateSPDX(packages, projectInfo) {
  return {
    spdxVersion: 'SPDX-2.3',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-DOCUMENT',
    name: projectInfo.name,
    documentNamespace: `https://floresvictoria.com/spdx/${projectInfo.name}-${projectInfo.version}`,
    creationInfo: {
      created: new Date().toISOString(),
      creators: [
        'Tool: flores-victoria-license-checker-1.0.0',
        'Organization: Flores Victoria',
      ],
    },
    packages: packages.map((pkg, index) => ({
      SPDXID: `SPDXRef-Package-${index}`,
      name: pkg.name,
      versionInfo: pkg.version,
      downloadLocation: pkg.repository || 'NOASSERTION',
      filesAnalyzed: false,
      licenseConcluded: pkg.license || 'NOASSERTION',
      licenseDeclared: pkg.license || 'NOASSERTION',
      copyrightText: pkg.author || 'NOASSERTION',
      description: pkg.description,
      homepage: pkg.homepage || 'NOASSERTION',
    })),
    relationships: packages.map((pkg, index) => ({
      spdxElementId: 'SPDXRef-DOCUMENT',
      relationshipType: 'DESCRIBES',
      relatedSpdxElement: `SPDXRef-Package-${index}`,
    })),
  };
}

/**
 * Genera SBOM en formato CycloneDX
 * @param {Array} packages
 * @param {Object} projectInfo
 * @returns {Object}
 */
function generateCycloneDX(packages, projectInfo) {
  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.4',
    serialNumber: `urn:uuid:${generateUUID()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [
        {
          vendor: 'Flores Victoria',
          name: 'license-checker',
          version: '1.0.0',
        },
      ],
      component: {
        type: 'application',
        name: projectInfo.name,
        version: projectInfo.version,
      },
    },
    components: packages.map((pkg) => ({
      type: 'library',
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      licenses: pkg.license !== 'UNKNOWN' ? [
        {
          license: {
            id: pkg.license,
          },
        },
      ] : [],
      purl: `pkg:npm/${pkg.name}@${pkg.version}`,
      externalReferences: pkg.homepage ? [
        {
          type: 'website',
          url: pkg.homepage,
        },
      ] : [],
    })),
  };
}

/**
 * Genera UUID simple
 * @returns {string}
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Escanea todos los servicios del proyecto
 * @returns {Object}
 */
function scanProject() {
  const projectRoot = path.resolve(__dirname, '..');
  const allPackages = [];
  
  // Directorios a escanear
  const serviceDirs = [
    '.',
    'frontend',
    'admin-panel',
    'microservices/api-gateway',
    'microservices/auth-service',
    'microservices/product-service',
    'microservices/user-service',
    'microservices/order-service',
    'microservices/cart-service',
    'microservices/wishlist-service',
    'microservices/review-service',
    'microservices/contact-service',
    'microservices/notification-service',
  ];
  
  for (const dir of serviceDirs) {
    const fullPath = path.join(projectRoot, dir);
    if (fs.existsSync(path.join(fullPath, 'package.json'))) {
      console.log(`  Scanning: ${dir || 'root'}`);
      const packages = getLicenseInfo(fullPath);
      allPackages.push(...packages);
    }
  }
  
  // Eliminar duplicados
  const unique = new Map();
  for (const pkg of allPackages) {
    const key = `${pkg.name}@${pkg.version}`;
    if (!unique.has(key)) {
      unique.set(key, pkg);
    }
  }
  
  return Array.from(unique.values());
}

/**
 * Imprime reporte en consola
 * @param {Object} report
 */
function printReport(report) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 License Audit Report');
  console.log('='.repeat(60) + '\n');
  
  console.log(`📦 Total packages scanned: ${report.summary.total}`);
  console.log(`✅ Allowed: ${report.summary.allowed}`);
  console.log(`⚠️  Review required: ${report.summary.review}`);
  console.log(`❌ Forbidden: ${report.summary.forbidden}`);
  console.log(`❓ Unknown: ${report.summary.unknown}`);
  
  if (report.packages.forbidden.length > 0) {
    console.log('\n❌ FORBIDDEN LICENSES (Action Required):\n');
    report.packages.forbidden.forEach(pkg => {
      console.log(`  • ${pkg.name}@${pkg.version} - ${pkg.license}`);
    });
  }
  
  if (report.packages.review.length > 0) {
    console.log('\n⚠️  REQUIRES REVIEW:\n');
    report.packages.review.forEach(pkg => {
      console.log(`  • ${pkg.name}@${pkg.version} - ${pkg.license}`);
    });
  }
  
  if (report.packages.unknown.length > 0) {
    console.log('\n❓ UNKNOWN LICENSES:\n');
    report.packages.unknown.slice(0, 10).forEach(pkg => {
      console.log(`  • ${pkg.name}@${pkg.version} - ${pkg.license}`);
    });
    if (report.packages.unknown.length > 10) {
      console.log(`  ... and ${report.packages.unknown.length - 10} more`);
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const generateSbom = args.includes('--sbom');
  const formatIndex = args.indexOf('--format');
  const format = formatIndex !== -1 ? args[formatIndex + 1] : 'json';
  
  console.log('\n🔍 Flores Victoria License Checker\n');
  console.log('Scanning project dependencies...\n');
  
  // Leer info del proyecto
  const projectRoot = path.resolve(__dirname, '..');
  const projectPkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const projectInfo = {
    name: projectPkg.name || 'flores-victoria',
    version: projectPkg.version || '1.0.0',
  };
  
  // Escanear dependencias
  const packages = scanProject();
  
  console.log(`\n📦 Found ${packages.length} unique packages\n`);
  
  // Generar reporte
  const report = generateReport(packages);
  printReport(report);
  
  // Guardar reporte JSON
  const reportPath = path.join(projectRoot, 'license-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📝 Report saved to: ${reportPath}`);
  
  // Generar SBOM si se solicita
  if (generateSbom) {
    let sbom;
    let sbomPath;
    
    switch (format.toLowerCase()) {
      case 'spdx':
        sbom = generateSPDX(packages, projectInfo);
        sbomPath = path.join(projectRoot, 'sbom.spdx.json');
        break;
      case 'cyclonedx':
        sbom = generateCycloneDX(packages, projectInfo);
        sbomPath = path.join(projectRoot, 'sbom.cyclonedx.json');
        break;
      default:
        sbom = {
          format: 'simple',
          generated: new Date().toISOString(),
          project: projectInfo,
          components: packages,
        };
        sbomPath = path.join(projectRoot, 'sbom.json');
    }
    
    fs.writeFileSync(sbomPath, JSON.stringify(sbom, null, 2));
    console.log(`📝 SBOM saved to: ${sbomPath}`);
  }
  
  // Verificar y exit code
  if (check) {
    if (report.summary.forbidden > 0) {
      console.log('\n❌ License check FAILED - forbidden licenses found\n');
      process.exit(1);
    }
    
    if (report.summary.unknown > 5) {
      console.log('\n⚠️  License check WARNING - many unknown licenses\n');
      process.exit(0);
    }
    
    console.log('\n✅ License check PASSED\n');
  }
  
  process.exit(0);
}

// Ejecutar
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  getLicenseInfo,
  generateReport,
  generateSPDX,
  generateCycloneDX,
  categorizeLicense,
  ALLOWED_LICENSES,
  FORBIDDEN_LICENSES,
  REVIEW_LICENSES,
};
