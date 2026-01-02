/**
 * Rutas de Reportes - Flores Victoria
 * API endpoints para generación y exportación de reportes
 */

const express = require('express');
const router = express.Router();
const { ReportService, REPORT_TYPES } = require('../services/reports.service');

// Instancia del servicio
const reportService = new ReportService();

// ============================================================================
// REPORTES DE VENTAS
// ============================================================================

/**
 * GET /api/reports/sales/daily
 * Generar reporte de ventas diarias
 */
router.get('/sales/daily', async (req, res) => {
    try {
        const { date } = req.query;
        const reportDate = date ? new Date(date) : new Date();
        
        const report = await reportService.generateDailySalesReport(reportDate);
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generando reporte diario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar reporte diario',
            message: error.message
        });
    }
});

/**
 * GET /api/reports/sales/weekly
 * Generar reporte de ventas semanal
 */
router.get('/sales/weekly', async (req, res) => {
    try {
        const { weekStart } = req.query;
        const startDate = weekStart ? new Date(weekStart) : new Date();
        
        // Ajustar al inicio de la semana (lunes)
        const dayOfWeek = startDate.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(startDate.getDate() + diff);
        
        const report = await reportService.generateWeeklySalesReport(startDate);
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generando reporte semanal:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar reporte semanal',
            message: error.message
        });
    }
});

/**
 * GET /api/reports/sales/monthly
 * Generar reporte de ventas mensual
 */
router.get('/sales/monthly', async (req, res) => {
    try {
        const { year, month } = req.query;
        const now = new Date();
        const reportYear = year ? parseInt(year) : now.getFullYear();
        const reportMonth = month ? parseInt(month) : now.getMonth() + 1;
        
        const report = await reportService.generateMonthlySalesReport(reportYear, reportMonth);
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generando reporte mensual:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar reporte mensual',
            message: error.message
        });
    }
});

// ============================================================================
// REPORTES DE PRODUCTOS
// ============================================================================

/**
 * GET /api/reports/products/bestsellers
 * Reporte de productos más vendidos
 */
router.get('/products/bestsellers', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const report = await reportService.generateBestsellersReport(parseInt(days));
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generando reporte bestsellers:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar reporte de productos más vendidos',
            message: error.message
        });
    }
});

/**
 * GET /api/reports/products/inventory
 * Reporte de inventario
 */
router.get('/products/inventory', async (req, res) => {
    try {
        const report = await reportService.generateInventoryReport();
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generando reporte inventario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar reporte de inventario',
            message: error.message
        });
    }
});

// ============================================================================
// REPORTES DE CLIENTES
// ============================================================================

/**
 * GET /api/reports/customers/top
 * Reporte de clientes top
 */
router.get('/customers/top', async (req, res) => {
    try {
        const { days = 90 } = req.query;
        
        const report = await reportService.generateTopCustomersReport(parseInt(days));
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generando reporte clientes top:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar reporte de clientes top',
            message: error.message
        });
    }
});

// ============================================================================
// REPORTES DE ENGAGEMENT
// ============================================================================

/**
 * GET /api/reports/engagement/coupons
 * Reporte de cupones
 */
router.get('/engagement/coupons', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const report = await reportService.generateCouponsReport(parseInt(days));
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generando reporte cupones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar reporte de cupones',
            message: error.message
        });
    }
});

/**
 * GET /api/reports/engagement/loyalty
 * Reporte de programa de fidelización
 */
router.get('/engagement/loyalty', async (req, res) => {
    try {
        const report = await reportService.generateLoyaltyReport();
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generando reporte fidelización:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar reporte de fidelización',
            message: error.message
        });
    }
});

// ============================================================================
// EXPORTACIÓN
// ============================================================================

/**
 * GET /api/reports/export/csv/:type
 * Exportar reporte a CSV
 */
router.get('/export/csv/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { days = 30, year, month, date } = req.query;
        
        let report;
        
        switch (type) {
            case 'sales-daily':
                report = await reportService.generateDailySalesReport(
                    date ? new Date(date) : new Date()
                );
                break;
            case 'sales-weekly':
                report = await reportService.generateWeeklySalesReport(new Date());
                break;
            case 'sales-monthly':
                const now = new Date();
                report = await reportService.generateMonthlySalesReport(
                    year ? parseInt(year) : now.getFullYear(),
                    month ? parseInt(month) : now.getMonth() + 1
                );
                break;
            case 'products-bestsellers':
                report = await reportService.generateBestsellersReport(parseInt(days));
                break;
            case 'products-inventory':
                report = await reportService.generateInventoryReport();
                break;
            case 'customers-top':
                report = await reportService.generateTopCustomersReport(parseInt(days));
                break;
            case 'engagement-coupons':
                report = await reportService.generateCouponsReport(parseInt(days));
                break;
            case 'engagement-loyalty':
                report = await reportService.generateLoyaltyReport();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Tipo de reporte no válido'
                });
        }
        
        const csv = reportService.exportToCSV(report);
        const filename = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csv); // BOM para Excel
        
    } catch (error) {
        console.error('Error exportando CSV:', error);
        res.status(500).json({
            success: false,
            error: 'Error al exportar CSV',
            message: error.message
        });
    }
});

/**
 * GET /api/reports/export/pdf-data/:type
 * Obtener datos para generar PDF (el PDF se genera en frontend)
 */
router.get('/export/pdf-data/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { days = 30, year, month, date } = req.query;
        
        let report;
        
        switch (type) {
            case 'sales-daily':
                report = await reportService.generateDailySalesReport(
                    date ? new Date(date) : new Date()
                );
                break;
            case 'sales-weekly':
                report = await reportService.generateWeeklySalesReport(new Date());
                break;
            case 'sales-monthly':
                const now = new Date();
                report = await reportService.generateMonthlySalesReport(
                    year ? parseInt(year) : now.getFullYear(),
                    month ? parseInt(month) : now.getMonth() + 1
                );
                break;
            case 'products-bestsellers':
                report = await reportService.generateBestsellersReport(parseInt(days));
                break;
            case 'products-inventory':
                report = await reportService.generateInventoryReport();
                break;
            case 'customers-top':
                report = await reportService.generateTopCustomersReport(parseInt(days));
                break;
            case 'engagement-coupons':
                report = await reportService.generateCouponsReport(parseInt(days));
                break;
            case 'engagement-loyalty':
                report = await reportService.generateLoyaltyReport();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Tipo de reporte no válido'
                });
        }
        
        const pdfData = reportService.generatePDFData(report);
        
        res.json({
            success: true,
            data: pdfData
        });
        
    } catch (error) {
        console.error('Error generando datos PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar datos para PDF',
            message: error.message
        });
    }
});

// ============================================================================
// TIPOS Y CONFIGURACIÓN
// ============================================================================

/**
 * GET /api/reports/types
 * Obtener tipos de reportes disponibles
 */
router.get('/types', (req, res) => {
    res.json({
        success: true,
        data: {
            types: Object.entries(REPORT_TYPES).map(([key, value]) => ({
                id: value,
                name: key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()),
                category: key.split('_')[0].toLowerCase()
            })),
            categories: ['sales', 'products', 'customers', 'engagement', 'delivery', 'financial'],
            exportFormats: ['csv', 'pdf']
        }
    });
});

/**
 * GET /api/reports/schedule
 * Obtener reportes programados
 */
router.get('/schedule', async (req, res) => {
    try {
        // En producción, esto vendría de la base de datos
        const scheduled = [
            {
                id: 'sch-1',
                type: REPORT_TYPES.SALES_DAILY,
                frequency: 'daily',
                time: '08:00',
                recipients: ['admin@floresvictoria.cl'],
                format: 'pdf',
                enabled: true
            },
            {
                id: 'sch-2',
                type: REPORT_TYPES.SALES_WEEKLY,
                frequency: 'weekly',
                dayOfWeek: 'monday',
                time: '09:00',
                recipients: ['admin@floresvictoria.cl', 'gerencia@floresvictoria.cl'],
                format: 'pdf',
                enabled: true
            },
            {
                id: 'sch-3',
                type: REPORT_TYPES.PRODUCTS_INVENTORY,
                frequency: 'daily',
                time: '07:00',
                recipients: ['bodega@floresvictoria.cl'],
                format: 'csv',
                enabled: true
            }
        ];
        
        res.json({
            success: true,
            data: scheduled
        });
    } catch (error) {
        console.error('Error obteniendo reportes programados:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener reportes programados',
            message: error.message
        });
    }
});

/**
 * POST /api/reports/schedule
 * Crear reporte programado
 */
router.post('/schedule', async (req, res) => {
    try {
        const { type, frequency, time, recipients, format, dayOfWeek } = req.body;
        
        if (!type || !frequency || !time || !recipients || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos para programar reporte'
            });
        }
        
        // En producción, guardar en base de datos
        const scheduled = {
            id: `sch-${Date.now()}`,
            type,
            frequency,
            time,
            dayOfWeek: frequency === 'weekly' ? dayOfWeek : null,
            recipients,
            format: format || 'pdf',
            enabled: true,
            createdAt: new Date()
        };
        
        res.status(201).json({
            success: true,
            message: 'Reporte programado creado',
            data: scheduled
        });
    } catch (error) {
        console.error('Error creando reporte programado:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear reporte programado',
            message: error.message
        });
    }
});

/**
 * DELETE /api/reports/schedule/:id
 * Eliminar reporte programado
 */
router.delete('/schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // En producción, eliminar de base de datos
        
        res.json({
            success: true,
            message: 'Reporte programado eliminado',
            data: { id }
        });
    } catch (error) {
        console.error('Error eliminando reporte programado:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar reporte programado',
            message: error.message
        });
    }
});

// ============================================================================
// DASHBOARD / RESUMEN
// ============================================================================

/**
 * GET /api/reports/dashboard
 * Obtener resumen para dashboard de reportes
 */
router.get('/dashboard', async (req, res) => {
    try {
        const [dailyReport, inventoryReport, couponsReport, loyaltyReport] = await Promise.all([
            reportService.generateDailySalesReport(new Date()),
            reportService.generateInventoryReport(),
            reportService.generateCouponsReport(30),
            reportService.generateLoyaltyReport()
        ]);
        
        res.json({
            success: true,
            data: {
                todaySales: {
                    orders: dailyReport.summary.totalOrders,
                    revenue: dailyReport.summary.totalRevenue,
                    avgOrder: dailyReport.summary.averageOrderValue
                },
                inventory: {
                    total: inventoryReport.summary.totalProducts,
                    outOfStock: inventoryReport.summary.outOfStock,
                    lowStock: inventoryReport.summary.lowStock,
                    value: inventoryReport.summary.totalValue
                },
                engagement: {
                    couponsUsed: couponsReport.summary.totalUses,
                    loyaltyMembers: loyaltyReport.summary.totalMembers,
                    pointsIssued: loyaltyReport.summary.totalPointsIssued
                },
                recentReports: [
                    { type: 'sales-daily', generatedAt: dailyReport.generatedAt, title: dailyReport.title },
                    { type: 'inventory', generatedAt: inventoryReport.generatedAt, title: inventoryReport.title }
                ]
            }
        });
    } catch (error) {
        console.error('Error generando dashboard reportes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar dashboard de reportes',
            message: error.message
        });
    }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'reports',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
