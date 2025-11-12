/**
 * Export System - CSV and PDF Export Functionality
 * Uses jsPDF and PapaParse libraries
 */

class ExportSystem {
    constructor() {
        this.loadLibraries();
    }

    /**
     * Load required libraries dynamically
     */
    async loadLibraries() {
        // Load jsPDF
        if (!window.jsPDF) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }

        // Load PapaParse
        if (!window.Papa) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js');
        }

        console.log('📦 Export libraries loaded');
    }

    /**
     * Load external script
     * @param {string} url 
     * @returns {Promise}
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Export data to CSV
     * @param {Array} data 
     * @param {string} filename 
     */
    exportToCSV(data, filename = 'export.csv') {
        try {
            if (!window.Papa) {
                throw new Error('PapaParse library not loaded');
            }

            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            this.downloadFile(blob, filename);

            // Show success notification
            if (window.notify) {
                notify({
                    type: 'success',
                    title: 'Exportación Exitosa',
                    message: `Archivo ${filename} descargado correctamente`,
                    duration: 3000
                });
            }

            // Log action
            if (window.rbac) {
                rbac.logAction('export_csv', filename, { records: data.length });
            }

            return true;
        } catch (error) {
            console.error('CSV export error:', error);
            
            if (window.notify) {
                notify({
                    type: 'error',
                    title: 'Error de Exportación',
                    message: error.message,
                    duration: 5000
                });
            }

            return false;
        }
    }

    /**
     * Export data to PDF
     * @param {Object} options 
     */
    async exportToPDF(options) {
        const {
            title = 'Reporte',
            data = [],
            columns = [],
            filename = 'export.pdf',
            orientation = 'portrait',
            pageSize = 'a4'
        } = options;

        try {
            // Wait for jsPDF to be available
            if (!window.jspdf) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: pageSize
            });

            // Add title
            doc.setFontSize(18);
            doc.setTextColor(102, 126, 234);
            doc.text(title, 15, 20);

            // Add timestamp
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 15, 30);

            // Add data table
            if (data.length > 0 && columns.length > 0) {
                this.addTableToPDF(doc, data, columns, 40);
            }

            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Página ${i} de ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
                doc.text(
                    'Flores Victoria - Admin Control Center',
                    doc.internal.pageSize.width - 15,
                    doc.internal.pageSize.height - 10,
                    { align: 'right' }
                );
            }

            // Save PDF
            doc.save(filename);

            // Show success notification
            if (window.notify) {
                notify({
                    type: 'success',
                    title: 'PDF Generado',
                    message: `Archivo ${filename} descargado correctamente`,
                    duration: 3000
                });
            }

            // Log action
            if (window.rbac) {
                rbac.logAction('export_pdf', filename, { 
                    records: data.length,
                    pages: pageCount 
                });
            }

            return true;
        } catch (error) {
            console.error('PDF export error:', error);
            
            if (window.notify) {
                notify({
                    type: 'error',
                    title: 'Error al Generar PDF',
                    message: error.message,
                    duration: 5000
                });
            }

            return false;
        }
    }

    /**
     * Add table to PDF document
     * @param {jsPDF} doc 
     * @param {Array} data 
     * @param {Array} columns 
     * @param {number} startY 
     */
    addTableToPDF(doc, data, columns, startY) {
        let currentY = startY;
        const lineHeight = 7;
        const columnWidth = (doc.internal.pageSize.width - 30) / columns.length;

        // Add headers
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setFillColor(102, 126, 234);
        doc.setTextColor(255);

        columns.forEach((column, i) => {
            doc.rect(15 + (i * columnWidth), currentY, columnWidth, 8, 'F');
            doc.text(
                column.header || column,
                15 + (i * columnWidth) + 2,
                currentY + 6
            );
        });

        currentY += 10;

        // Add data rows
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50);
        doc.setFontSize(9);

        data.forEach((row, rowIndex) => {
            // Check if we need a new page
            if (currentY > doc.internal.pageSize.height - 30) {
                doc.addPage();
                currentY = 20;
            }

            // Alternate row colors
            if (rowIndex % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(15, currentY, doc.internal.pageSize.width - 30, lineHeight, 'F');
            }

            columns.forEach((column, i) => {
                const key = column.key || column;
                const value = row[key] || '-';
                const text = String(value).substring(0, 30);
                
                doc.text(
                    text,
                    15 + (i * columnWidth) + 2,
                    currentY + 5
                );
            });

            currentY += lineHeight;
        });
    }

    /**
     * Export table element to CSV
     * @param {HTMLTableElement} table 
     * @param {string} filename 
     */
    exportTableToCSV(table, filename = 'table-export.csv') {
        const data = this.tableToArray(table);
        return this.exportToCSV(data, filename);
    }

    /**
     * Export table element to PDF
     * @param {HTMLTableElement} table 
     * @param {string} filename 
     * @param {string} title 
     */
    exportTableToPDF(table, filename = 'table-export.pdf', title = 'Reporte') {
        const { data, columns } = this.tableToArrayWithColumns(table);
        
        return this.exportToPDF({
            title: title,
            data: data,
            columns: columns,
            filename: filename
        });
    }

    /**
     * Convert HTML table to array
     * @param {HTMLTableElement} table 
     * @returns {Array}
     */
    tableToArray(table) {
        const data = [];
        const rows = table.querySelectorAll('tr');

        rows.forEach((row, index) => {
            const rowData = {};
            const cells = row.querySelectorAll('td, th');
            
            cells.forEach((cell, cellIndex) => {
                const key = index === 0 ? `col${cellIndex}` : table.rows[0].cells[cellIndex]?.textContent.trim() || `col${cellIndex}`;
                rowData[key] = cell.textContent.trim();
            });

            if (index > 0 || !table.querySelector('thead')) {
                data.push(rowData);
            }
        });

        return data;
    }

    /**
     * Convert HTML table to array with columns
     * @param {HTMLTableElement} table 
     * @returns {Object}
     */
    tableToArrayWithColumns(table) {
        const data = [];
        const columns = [];
        const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
        
        // Extract headers
        if (headerRow) {
            headerRow.querySelectorAll('th, td').forEach(cell => {
                const header = cell.textContent.trim();
                columns.push({
                    header: header,
                    key: header.toLowerCase().replace(/\s+/g, '_')
                });
            });
        }

        // Extract data
        const dataRows = table.querySelectorAll('tbody tr, tr');
        
        dataRows.forEach((row, index) => {
            if (index === 0 && headerRow === row) return;
            
            const rowData = {};
            const cells = row.querySelectorAll('td, th');
            
            cells.forEach((cell, cellIndex) => {
                const key = columns[cellIndex]?.key || `col${cellIndex}`;
                rowData[key] = cell.textContent.trim();
            });

            data.push(rowData);
        });

        return { data, columns };
    }

    /**
     * Download file helper
     * @param {Blob} blob 
     * @param {string} filename 
     */
    downloadFile(blob, filename) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Create export buttons for a container
     * @param {HTMLElement} container 
     * @param {Function} getDataCallback 
     * @param {string} baseFilename 
     */
    createExportButtons(container, getDataCallback, baseFilename = 'export') {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'export-buttons';
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin: 15px 0;
        `;

        // CSV button
        const csvBtn = document.createElement('button');
        csvBtn.className = 'btn-export btn-csv';
        csvBtn.innerHTML = '<i class="fas fa-file-csv"></i> Exportar CSV';
        csvBtn.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(135deg, #11998e, #38ef7d);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        `;
        csvBtn.onclick = () => {
            const data = getDataCallback();
            this.exportToCSV(data, `${baseFilename}.csv`);
        };

        // PDF button
        const pdfBtn = document.createElement('button');
        pdfBtn.className = 'btn-export btn-pdf';
        pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Exportar PDF';
        pdfBtn.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(135deg, #eb3349, #f45c43);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        `;
        pdfBtn.onclick = () => {
            const data = getDataCallback();
            const columns = Object.keys(data[0] || {}).map(key => ({
                key: key,
                header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
            }));
            
            this.exportToPDF({
                title: baseFilename.charAt(0).toUpperCase() + baseFilename.slice(1),
                data: data,
                columns: columns,
                filename: `${baseFilename}.pdf`
            });
        };

        buttonContainer.appendChild(csvBtn);
        buttonContainer.appendChild(pdfBtn);

        // Add hover effects
        [csvBtn, pdfBtn].forEach(btn => {
            btn.onmouseover = () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
            };
            btn.onmouseout = () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            };
        });

        container.appendChild(buttonContainer);
        return buttonContainer;
    }
}

// Create and export instance
const exportSystem = new ExportSystem();

// Make it globally available
if (typeof window !== 'undefined') {
    window.exportSystem = exportSystem;
    
    // Helper functions
    window.exportToCSV = (data, filename) => exportSystem.exportToCSV(data, filename);
    window.exportToPDF = (options) => exportSystem.exportToPDF(options);
    window.exportTableToCSV = (table, filename) => exportSystem.exportTableToCSV(table, filename);
    window.exportTableToPDF = (table, filename, title) => exportSystem.exportTableToPDF(table, filename, title);
}
