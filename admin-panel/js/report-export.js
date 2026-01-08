/**
 * @fileoverview Report Export Utilities
 * @description Exportación de reportes en PDF y Excel para el admin panel
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Configuración de estilos para reportes
 */
const REPORT_STYLES = {
  colors: {
    primary: '#C2185B',
    secondary: '#7B1FA2',
    success: '#388E3C',
    warning: '#F57C00',
    danger: '#D32F2F',
    dark: '#212121',
    light: '#FAFAFA',
    border: '#E0E0E0',
  },
  fonts: {
    title: '18px',
    subtitle: '14px',
    body: '11px',
    small: '9px',
  },
};

/**
 * Formatear moneda
 */
function formatCurrency(amount, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formatear fecha
 */
function formatDate(date, format = 'full') {
  const d = new Date(date);
  const options = format === 'full' 
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: '2-digit', day: '2-digit' };
  return d.toLocaleDateString('es-MX', options);
}

// ═══════════════════════════════════════════════════════════════
// EXPORTACIÓN A CSV
// ═══════════════════════════════════════════════════════════════

/**
 * Exportar datos a CSV
 * @param {Array} data - Array de objetos
 * @param {Array} columns - Definición de columnas [{key, header}]
 * @param {string} filename - Nombre del archivo
 */
function exportToCSV(data, columns, filename = 'report') {
  // Headers
  const headers = columns.map(col => `"${col.header}"`).join(',');
  
  // Rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      
      // Aplicar formato si existe
      if (col.format === 'currency') {
        value = formatCurrency(value);
      } else if (col.format === 'date') {
        value = formatDate(value);
      }
      
      // Escapar comillas dobles
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
      }
      
      return `"${value ?? ''}"`;
    }).join(',');
  }).join('\n');
  
  const csv = `${headers}\n${rows}`;
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  
  downloadBlob(blob, `${filename}.csv`);
}

// ═══════════════════════════════════════════════════════════════
// EXPORTACIÓN A EXCEL (XLSX)
// ═══════════════════════════════════════════════════════════════

/**
 * Exportar datos a Excel usando SheetJS (si está disponible)
 * @param {Array} data - Array de objetos
 * @param {Array} columns - Definición de columnas
 * @param {string} filename - Nombre del archivo
 * @param {Object} options - Opciones adicionales
 */
async function exportToExcel(data, columns, filename = 'report', options = {}) {
  // Verificar si SheetJS está disponible
  if (typeof XLSX === 'undefined') {
    console.warn('SheetJS (XLSX) not loaded, falling back to CSV');
    return exportToCSV(data, columns, filename);
  }

  const {
    sheetName = 'Reporte',
    includeHeader = true,
    autoWidth = true,
  } = options;

  // Preparar datos para Excel
  const headers = columns.map(col => col.header);
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      
      if (col.format === 'currency' && typeof value === 'number') {
        return value; // Excel formateará el número
      } else if (col.format === 'date' && value) {
        return new Date(value);
      }
      
      return value ?? '';
    });
  });

  // Crear workbook
  const wb = XLSX.utils.book_new();
  const wsData = includeHeader ? [headers, ...rows] : rows;
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-ajustar ancho de columnas
  if (autoWidth) {
    const colWidths = columns.map((col, i) => {
      const maxLength = Math.max(
        col.header.length,
        ...rows.map(row => String(row[i] ?? '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;
  }

  // Aplicar estilos a headers (si está soportado)
  if (includeHeader) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'C2185B' } },
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ═══════════════════════════════════════════════════════════════
// EXPORTACIÓN A PDF
// ═══════════════════════════════════════════════════════════════

/**
 * Exportar tabla a PDF usando jsPDF (si está disponible)
 * @param {Array} data - Array de objetos
 * @param {Array} columns - Definición de columnas
 * @param {string} filename - Nombre del archivo
 * @param {Object} options - Opciones adicionales
 */
async function exportToPDF(data, columns, filename = 'report', options = {}) {
  // Verificar si jsPDF está disponible
  if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
    console.error('jsPDF not loaded. Please include jsPDF library.');
    alert('Para exportar a PDF, por favor recarga la página.');
    return;
  }

  const {
    title = 'Reporte',
    subtitle = `Generado el ${formatDate(new Date())}`,
    orientation = 'landscape',
    pageSize = 'a4',
  } = options;

  const { jsPDF } = window.jspdf || window;
  const doc = new jsPDF(orientation, 'mm', pageSize);

  // Configuración de página
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Logo y título
  doc.setFontSize(18);
  doc.setTextColor(194, 24, 91); // Primary color
  doc.text('🌸 Flores Victoria', margin, yPos);
  yPos += 10;

  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text(title, margin, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setTextColor(117, 117, 117);
  doc.text(subtitle, margin, yPos);
  yPos += 10;

  // Preparar datos de tabla
  const headers = columns.map(col => col.header);
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      
      if (col.format === 'currency') {
        value = formatCurrency(value);
      } else if (col.format === 'date' && value) {
        value = formatDate(value, 'short');
      }
      
      return String(value ?? '');
    });
  });

  // Usar autoTable si está disponible
  if (doc.autoTable) {
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: yPos,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [194, 24, 91],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: columns.reduce((acc, col, i) => {
        if (col.format === 'currency') {
          acc[i] = { halign: 'right' };
        }
        return acc;
      }, {}),
    });
  } else {
    // Tabla simple sin autoTable
    const colWidth = (pageWidth - 2 * margin) / columns.length;
    
    // Headers
    doc.setFillColor(194, 24, 91);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    
    headers.forEach((header, i) => {
      doc.text(header, margin + i * colWidth + 2, yPos + 5);
    });
    yPos += 10;

    // Rows
    doc.setTextColor(33, 33, 33);
    rows.forEach((row, rowIndex) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      
      if (rowIndex % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 7, 'F');
      }
      
      row.forEach((cell, i) => {
        const text = cell.substring(0, 20) + (cell.length > 20 ? '...' : '');
        doc.text(text, margin + i * colWidth + 2, yPos + 2);
      });
      yPos += 7;
    });
  }

  // Footer con número de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  doc.save(`${filename}.pdf`);
}

// ═══════════════════════════════════════════════════════════════
// REPORTES PRE-DEFINIDOS
// ═══════════════════════════════════════════════════════════════

/**
 * Definiciones de reportes comunes
 */
const REPORT_DEFINITIONS = {
  orders: {
    title: 'Reporte de Pedidos',
    columns: [
      { key: 'orderNumber', header: 'Número' },
      { key: 'createdAt', header: 'Fecha', format: 'date' },
      { key: 'customerName', header: 'Cliente' },
      { key: 'status', header: 'Estado' },
      { key: 'total', header: 'Total', format: 'currency' },
      { key: 'paymentStatus', header: 'Pago' },
    ],
  },
  
  products: {
    title: 'Catálogo de Productos',
    columns: [
      { key: 'sku', header: 'SKU' },
      { key: 'name', header: 'Nombre' },
      { key: 'category', header: 'Categoría' },
      { key: 'price', header: 'Precio', format: 'currency' },
      { key: 'stock', header: 'Stock' },
      { key: 'active', header: 'Activo' },
    ],
  },
  
  sales: {
    title: 'Reporte de Ventas',
    columns: [
      { key: 'date', header: 'Fecha', format: 'date' },
      { key: 'orders', header: 'Pedidos' },
      { key: 'revenue', header: 'Ingresos', format: 'currency' },
      { key: 'avgOrderValue', header: 'Ticket Promedio', format: 'currency' },
    ],
  },
  
  customers: {
    title: 'Reporte de Clientes',
    columns: [
      { key: 'name', header: 'Nombre' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Teléfono' },
      { key: 'totalOrders', header: 'Pedidos' },
      { key: 'totalSpent', header: 'Total Gastado', format: 'currency' },
      { key: 'lastOrder', header: 'Último Pedido', format: 'date' },
    ],
  },
  
  inventory: {
    title: 'Reporte de Inventario',
    columns: [
      { key: 'sku', header: 'SKU' },
      { key: 'name', header: 'Producto' },
      { key: 'stock', header: 'Stock Actual' },
      { key: 'minStock', header: 'Stock Mínimo' },
      { key: 'status', header: 'Estado' },
      { key: 'value', header: 'Valor', format: 'currency' },
    ],
  },
};

/**
 * Exportar reporte pre-definido
 */
function exportReport(reportType, data, format = 'excel', customOptions = {}) {
  const definition = REPORT_DEFINITIONS[reportType];
  
  if (!definition) {
    console.error(`Unknown report type: ${reportType}`);
    return;
  }
  
  const filename = `${reportType}_${new Date().toISOString().split('T')[0]}`;
  const options = {
    title: definition.title,
    ...customOptions,
  };
  
  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(data, definition.columns, filename);
      break;
    case 'excel':
    case 'xlsx':
      exportToExcel(data, definition.columns, filename, options);
      break;
    case 'pdf':
      exportToPDF(data, definition.columns, filename, options);
      break;
    default:
      console.error(`Unknown format: ${format}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

/**
 * Descargar blob como archivo
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Cargar dependencias de exportación dinámicamente
 */
async function loadExportDependencies() {
  const dependencies = [];
  
  // SheetJS para Excel
  if (typeof XLSX === 'undefined') {
    dependencies.push(
      loadScript('https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js')
    );
  }
  
  // jsPDF para PDF
  if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
    dependencies.push(
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    );
    dependencies.push(
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js')
    );
  }
  
  if (dependencies.length > 0) {
    await Promise.all(dependencies);
  }
}

/**
 * Cargar script externo
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ═══════════════════════════════════════════════════════════════
// EXPORTAR API
// ═══════════════════════════════════════════════════════════════

window.FloresVictoriaReports = {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportReport,
  loadExportDependencies,
  REPORT_DEFINITIONS,
  formatCurrency,
  formatDate,
};

// Auto-cargar dependencias al cargar el script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadExportDependencies);
} else {
  loadExportDependencies();
}
