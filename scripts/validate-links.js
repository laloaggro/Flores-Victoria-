#!/usr/bin/env node
/*
 Validate internal links and assets (href/src) across HTML files.
 - Scans selected UI roots: admin-panel/public, frontend
 - Checks existence of local files referenced via absolute or relative paths
 - Skips external (http, https, mailto, tel, data) and hash anchors
 - Emits a markdown report with broken references grouped by source file
*/
const fs = require('fs');
const path = require('path');

const UI_ROOTS = [
  path.resolve(__dirname, '..', 'admin-panel', 'public'),
  path.resolve(__dirname, '..', 'frontend'),
];

const OUTPUT_DIR = path.resolve(__dirname, '..', 'test-results');

function listHtmlFiles(root) {
  const out = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
        out.push(full);
      }
    }
  }
  if (fs.existsSync(root)) walk(root);
  return out;
}

function extractLinks(html) {
  const links = [];
  // href="..." or href='...'
  const hrefRegex = /href\s*=\s*(["'])(.*?)\1/gi;
  const srcRegex = /src\s*=\s*(["'])(.*?)\1/gi;
  let m;
  while ((m = hrefRegex.exec(html)) !== null) {
    links.push({ attr: 'href', value: m[2] });
  }
  while ((m = srcRegex.exec(html)) !== null) {
    links.push({ attr: 'src', value: m[2] });
  }
  return links;
}

function isExternal(url) {
  return (
    /^(https?:)?\/\//i.test(url) ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:') ||
    url.startsWith('data:')
  );
}

function normalizeLocalRef(ref) {
  // Strip query/hash
  return ref.split('#')[0].split('?')[0];
}

function resolveRefToFs(ref, filePath, uiRoot) {
  const clean = normalizeLocalRef(ref);
  if (!clean || clean === '' || clean === '#') return null;
  if (clean.startsWith('#')) return null;

  // Absolute path from UI root
  if (clean.startsWith('/')) {
    return path.join(uiRoot, clean);
  }
  // Relative to file location
  return path.resolve(path.dirname(filePath), clean);
}

function checkFileExists(fsPath) {
  try {
    if (!fsPath) return { exists: true };
    const stat = fs.statSync(fsPath);
    return { exists: stat.isFile() || stat.isDirectory() };
  } catch (e) {
    return { exists: false, error: e.message };
  }
}

function run() {
  const report = { scanned: [], broken: [] };
  for (const uiRoot of UI_ROOTS) {
    if (!fs.existsSync(uiRoot)) continue;
    const files = listHtmlFiles(uiRoot);
    for (const file of files) {
      const html = fs.readFileSync(file, 'utf8');
      const links = extractLinks(html);
      const brokenForFile = [];
      for (const { attr, value } of links) {
        if (!value || value.trim() === '' || value.trim() === '#') continue;
        if (isExternal(value)) continue;
        const target = resolveRefToFs(value, file, uiRoot);
        const { exists } = checkFileExists(target);
        if (!exists) {
          brokenForFile.push({ attr, value, resolved: target });
        }
      }
      report.scanned.push({ file, totalLinks: links.length, broken: brokenForFile.length });
      if (brokenForFile.length) {
        report.broken.push({ file, items: brokenForFile });
      }
    }
  }

  // Emit markdown report
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(OUTPUT_DIR, `link_check_report_${ts}.md`);
  let md = `# Link Check Report (UI)\n\nDate: ${new Date().toLocaleString()}\n\n`;
  const totalFiles = report.scanned.length;
  const totalBroken = report.broken.reduce((acc, f) => acc + f.items.length, 0);
  md += `Scanned HTML files: ${totalFiles}\n`;
  md += `Broken references: ${totalBroken}\n\n`;
  for (const entry of report.broken) {
    md += `## ${path.relative(path.resolve(__dirname, '..'), entry.file)}\n\n`;
    for (const item of entry.items) {
      md += `- ${item.attr}="${item.value}" → MISSING (resolved: ${path.relative(path.resolve(__dirname, '..'), item.resolved)})\n`;
    }
    md += '\n';
  }
  if (!totalBroken) md += 'All good. No broken local href/src found.\n';
  fs.writeFileSync(outPath, md, 'utf8');
  // Console summary
  console.log(md);
  console.log(`\nReport saved to: ${outPath}`);

  // Exit with non-zero if broken found (useful for CI)
  process.exit(totalBroken ? 1 : 0);
}

if (require.main === module) run();
