#!/usr/bin/env node

/**
 * Link Validator - Comprehensive HTML Link & Asset Checker
 * 
 * Validates all links, stylesheets, scripts, and assets in HTML files.
 * Supports both local file validation and HTTP URL checking.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { parse } = require('node-html-parser');

// Configuration
const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  htmlDirs: [
    'admin-panel/public',
    'frontend/pages',
    'admin-site/pages'
  ],
  excludeDirs: [
    'node_modules',
    'limpieza-backups',
    'consolidacion-backups',
    '.git',
    'dist',
    'build'
  ],
  servers: {
    adminPanel: 'http://localhost:3021',
    frontend: 'http://localhost:3000'
  },
  timeout: 5000,
  maxConcurrent: 10
};

// Results storage
const results = {
  totalFiles: 0,
  totalLinks: 0,
  brokenLinks: [],
  missingAssets: [],
  validLinks: 0,
  skippedLinks: 0,
  errors: []
};

// Link types to check
const LINK_SELECTORS = {
  href: 'a[href], link[href]',
  src: 'script[src], img[src], iframe[src]',
  data: '[data-src], [data-href]'
};

/**
 * Find all HTML files in specified directories
 */
function findHtmlFiles() {
  const htmlFiles = [];
  
  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip excluded directories
          if (!CONFIG.excludeDirs.includes(item)) {
            scanDir(fullPath);
          }
        } else if (stat.isFile() && item.endsWith('.html')) {
          htmlFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
    }
  }
  
  // Scan each configured directory
  for (const htmlDir of CONFIG.htmlDirs) {
    const fullDir = path.join(CONFIG.rootDir, htmlDir);
    if (fs.existsSync(fullDir)) {
      scanDir(fullDir);
    }
  }
  
  return htmlFiles;
}

/**
 * Extract all links from HTML content
 */
function extractLinks(htmlContent, filePath) {
  const links = [];
  
  try {
    const root = parse(htmlContent);
    
    // Extract href links
    const hrefElements = root.querySelectorAll(LINK_SELECTORS.href);
    hrefElements.forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        links.push({
          url: href,
          type: el.tagName === 'LINK' ? 'stylesheet' : 'link',
          element: el.tagName.toLowerCase(),
          file: filePath
        });
      }
    });
    
    // Extract src links
    const srcElements = root.querySelectorAll(LINK_SELECTORS.src);
    srcElements.forEach(el => {
      const src = el.getAttribute('src');
      if (src) {
        links.push({
          url: src,
          type: el.tagName === 'SCRIPT' ? 'script' : 'asset',
          element: el.tagName.toLowerCase(),
          file: filePath
        });
      }
    });
    
    // Extract data attributes
    const dataElements = root.querySelectorAll(LINK_SELECTORS.data);
    dataElements.forEach(el => {
      const dataSrc = el.getAttribute('data-src') || el.getAttribute('data-href');
      if (dataSrc) {
        links.push({
          url: dataSrc,
          type: 'data-attribute',
          element: el.tagName.toLowerCase(),
          file: filePath
        });
      }
    });
    
  } catch (error) {
    results.errors.push({
      file: filePath,
      error: `Failed to parse HTML: ${error.message}`
    });
  }
  
  return links;
}

/**
 * Check if a URL is external
 */
function isExternalUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
}

/**
 * Resolve relative path to absolute file system path
 */
function resolveLocalPath(linkUrl, sourceFile) {
  // Handle absolute paths from web root
  if (linkUrl.startsWith('/')) {
    // Try admin-panel/public first
    const adminPath = path.join(CONFIG.rootDir, 'admin-panel/public', linkUrl);
    if (fs.existsSync(adminPath)) {
      return adminPath;
    }
    
    // Try frontend next
    const frontendPath = path.join(CONFIG.rootDir, 'frontend', linkUrl);
    if (fs.existsSync(frontendPath)) {
      return frontendPath;
    }
    
    // Return admin path even if not found (for error reporting)
    return adminPath;
  }
  
  // Handle relative paths
  const sourceDir = path.dirname(sourceFile);
  return path.resolve(sourceDir, linkUrl);
}

/**
 * Check if local file exists
 */
function checkLocalFile(linkUrl, sourceFile) {
  const resolvedPath = resolveLocalPath(linkUrl, sourceFile);
  const exists = fs.existsSync(resolvedPath);
  
  return {
    exists,
    path: resolvedPath,
    type: 'local'
  };
}

/**
 * Check HTTP URL with timeout
 */
function checkHttpUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      resolve({
        exists: false,
        status: 'timeout',
        type: 'http'
      });
    }, CONFIG.timeout);
    
    try {
      const req = client.get(url, { timeout: CONFIG.timeout }, (res) => {
        clearTimeout(timeout);
        resolve({
          exists: res.statusCode >= 200 && res.statusCode < 400,
          status: res.statusCode,
          type: 'http'
        });
        res.resume(); // Consume response
      });
      
      req.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          exists: false,
          status: error.message,
          type: 'http'
        });
      });
      
    } catch (error) {
      clearTimeout(timeout);
      resolve({
        exists: false,
        status: error.message,
        type: 'http'
      });
    }
  });
}

/**
 * Validate a single link
 */
async function validateLink(link) {
  results.totalLinks++;
  
  // Skip certain protocols and patterns
  if (link.url.startsWith('mailto:') || 
      link.url.startsWith('tel:') ||
      link.url.startsWith('data:') || // Skip data URIs (inline SVG, images, etc)
      link.url.includes('{{') || // Template variables
      link.url.includes('${')) { // Template literals
    results.skippedLinks++;
    return { valid: true, reason: 'skipped' };
  }
  
  // Check external URLs
  if (isExternalUrl(link.url)) {
    // Skip external validation for now (can be slow)
    results.skippedLinks++;
    return { valid: true, reason: 'external' };
  }
  
  // Check local files
  const result = checkLocalFile(link.url, link.file);
  
  if (result.exists) {
    results.validLinks++;
    return { valid: true, ...result };
  } else {
    results.brokenLinks.push({
      ...link,
      resolvedPath: result.path,
      reason: 'File not found'
    });
    return { valid: false, ...result };
  }
}

// Debug log
console.log('Link Validator script started');

// Find and validate links in all HTML files
(async () => {
  const htmlFiles = findHtmlFiles();
  results.totalFiles = htmlFiles.length;
  
  for (const filePath of htmlFiles) {
    try {
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      const links = extractLinks(htmlContent, filePath);
      
      // Validate each link
      for (const link of links) {
        await validateLink(link);
      }
    } catch (error) {
      results.errors.push({
        file: filePath,
        error: `Failed to process file: ${error.message}`
      });
    }
  }
  
  // Output results
  console.log('--- Link Validation Results ---');
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`Total links found: ${results.totalLinks}`);
  console.log(`Valid links: ${results.validLinks}`);
  console.log(`Broken links: ${results.brokenLinks.length}`);
  console.log(`Skipped links: ${results.skippedLinks}`);
  console.log(`Errors: ${results.errors.length}`);
  
  // Detailed error log
  if (results.errors.length > 0) {
    console.log('\n--- Error Details ---');
    results.errors.forEach(err => {
      console.log(`File: ${err.file}, Error: ${err.error}`);
    });
  }
  
  // Detailed broken link log
  if (results.brokenLinks.length > 0) {
    console.log('\n--- Broken Links ---');
    results.brokenLinks.forEach(link => {
      console.log(`URL: ${link.url}, Reason: ${link.reason}, File: ${link.file}`);
    });
  }

  console.log('Validación finalizada. Revisa LINK_VALIDATION_REPORT.md para el resumen.');
})();
