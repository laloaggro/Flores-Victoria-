#!/usr/bin/env node

/**
 * Link Fixer - Automated Link Path Correction
 * 
 * Fixes common link path issues in HTML files:
 * - Converts relative paths (./file.html) to proper paths
 * - Handles navigation links to shared pages
 * - Creates missing placeholder files when needed
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  
  // Path mappings for common pages
  sharedPages: {
    'about.html': '/about.html',
    'contact.html': '/contact.html',
    'privacy.html': '/privacy.html',
    'terms.html': '/terms.html',
    'shipping.html': '/shipping.html',
    'faq.html': '/faq.html',
    'login.html': '/login.html',
    'register.html': '/register.html'
  },
  
  // Admin panel specific pages
  adminPages: {
    'admin-products.html': '/admin-products.html',
    'admin-orders.html': '/admin-orders.html',
    'admin-users.html': '/admin-users.html',
    'products.html': '/products.html',
    'orders.html': '/orders.html',
    'users.html': '/users.html',
    'customers.html': '/customers.html',
    'inventory.html': '/inventory.html',
    'settings.html': '/settings.html',
    'analytics.html': '/analytics.html',
    'dashboard.html': '/index.html'
  }
};

const stats = {
  filesProcessed: 0,
  linksFixed: 0,
  filesModified: 0,
  errors: []
};

/**
 * Fix relative links in HTML content
 */
function fixLinks(htmlContent, filePath) {
  let modified = false;
  let newContent = htmlContent;
  const relativePath = path.relative(CONFIG.rootDir, filePath);
  
  // Determine if this is an admin panel file
  const isAdminPanel = relativePath.startsWith('admin-panel/public');
  const isFrontend = relativePath.startsWith('frontend/pages');
  
  // Fix common relative links
  const fixes = [];
  
  // Pattern 1: ./filename.html (same directory reference)
  const relativePattern = /href=["'](\.\/([^"']+))["']/g;
  newContent = newContent.replace(relativePattern, (match, fullPath, filename) => {
    // Check if it's a shared page
    if (CONFIG.sharedPages[filename]) {
      fixes.push({
        from: fullPath,
        to: CONFIG.sharedPages[filename],
        reason: 'Shared page - converted to absolute path'
      });
      modified = true;
      return `href="${CONFIG.sharedPages[filename]}"`;
    }
    
    // Check if it's an admin page
    if (isAdminPanel && CONFIG.adminPages[filename]) {
      fixes.push({
        from: fullPath,
        to: CONFIG.adminPages[filename],
        reason: 'Admin page - converted to absolute path'
      });
      modified = true;
      return `href="${CONFIG.adminPages[filename]}"`;
    }
    
    return match;
  });
  
  // Pattern 2: ../filename.html (parent directory reference)
  const parentPattern = /href=["'](\.\.\/([^"']+))["']/g;
  newContent = newContent.replace(parentPattern, (match, fullPath, filename) => {
    // Extract just the filename
    const basename = path.basename(filename);
    
    // Check if it's a shared page
    if (CONFIG.sharedPages[basename]) {
      fixes.push({
        from: fullPath,
        to: CONFIG.sharedPages[basename],
        reason: 'Parent ref to shared page - converted to absolute path'
      });
      modified = true;
      return `href="${CONFIG.sharedPages[basename]}"`;
    }
    
    return match;
  });
  
  if (CONFIG.verbose && fixes.length > 0) {
    console.log(`\n  ${relativePath}:`);
    fixes.forEach(fix => {
      console.log(`    ${fix.from} → ${fix.to}`);
      console.log(`    Reason: ${fix.reason}`);
    });
  }
  
  if (modified) {
    stats.linksFixed += fixes.length;
  }
  
  return { content: newContent, modified, fixes };
}

/**
 * Process a single HTML file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = fixLinks(content, filePath);
    
    stats.filesProcessed++;
    
    if (result.modified) {
      stats.filesModified++;
      
      if (!CONFIG.dryRun) {
        // Create backup
        const backupPath = filePath + '.backup-link-fix';
        fs.writeFileSync(backupPath, content);
        
        // Write fixed content
        fs.writeFileSync(filePath, result.content);
        
        if (CONFIG.verbose) {
          console.log(`  ✓ Fixed (backup: ${path.basename(backupPath)})`);
        }
      } else {
        if (CONFIG.verbose) {
          console.log(`  ✓ Would fix (dry run)`);
        }
      }
    }
    
  } catch (error) {
    stats.errors.push({
      file: filePath,
      error: error.message
    });
    console.error(`  ✗ Error: ${error.message}`);
  }
}

/**
 * Find and process all HTML files
 */
function processAllFiles() {
  const htmlDirs = [
    'admin-panel/public',
    'frontend/pages'
  ];
  
  const excludeDirs = [
    'node_modules',
    'limpieza-backups',
    'consolidacion-backups',
    '.git',
    'docs'
  ];
  
  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!excludeDirs.includes(item)) {
            scanDir(fullPath);
          }
        } else if (stat.isFile() && item.endsWith('.html')) {
          processFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
    }
  }
  
  for (const htmlDir of htmlDirs) {
    const fullDir = path.join(CONFIG.rootDir, htmlDir);
    if (fs.existsSync(fullDir)) {
      if (!CONFIG.verbose) {
        process.stdout.write(`Processing ${htmlDir}... `);
      }
      scanDir(fullDir);
      if (!CONFIG.verbose) {
        process.stdout.write('✓\n');
      }
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Link Fixer Starting...\n');
  
  if (CONFIG.dryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }
  
  if (CONFIG.verbose) {
    console.log('📝 Verbose mode enabled\n');
  }
  
  console.log('Processing HTML files...\n');
  processAllFiles();
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files Processed: ${stats.filesProcessed}`);
  console.log(`Files Modified:  ${stats.filesModified}`);
  console.log(`Links Fixed:     ${stats.linksFixed}`);
  console.log(`Errors:          ${stats.errors.length}`);
  console.log('='.repeat(60));
  
  if (CONFIG.dryRun) {
    console.log('\nRun without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Changes applied. Backups saved with .backup-link-fix extension.');
  }
  
  if (stats.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    stats.errors.forEach(err => {
      console.log(`  - ${path.relative(CONFIG.rootDir, err.file)}: ${err.error}`);
    });
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { fixLinks, processFile };
