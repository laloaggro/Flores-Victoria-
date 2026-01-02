/**
 * Servicio de Reportes - Flores Victoria
 * Generación de reportes PDF/Excel para ventas, productos y clientes
 */

const { v4: uuidv4 } = require('uuid');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const REPORT_CONFIG = {
    currency: 'CLP',
    locale: 'es-CL',
    timezone: 'America/Santiago',
    companyName: 'Flores Victoria',
    companyRut: '76.XXX.XXX-X',
    companyAddress: 'Santiago Norte, Chile',
    companyPhone: '+56 9 XXXX XXXX',
    companyEmail: 'ventas@floresvictoria.cl'
};

// Tipos de reportes
const REPORT_TYPES = {
    SALES_DAILY: 'sales_daily',
    SALES_WEEKLY: 'sales_weekly',
    SALES_MONTHLY: 'sales_monthly',
    PRODUCTS_BESTSELLERS: 'products_bestsellers',
    PRODUCTS_INVENTORY: 'products_inventory',
    CUSTOMERS_TOP: 'customers_top',
    CUSTOMERS_NEW: 'customers_new',
    ENGAGEMENT_COUPONS: 'engagement_coupons',
    ENGAGEMENT_LOYALTY: 'engagement_loyalty',
    ENGAGEMENT_REVIEWS: 'engagement_reviews',
    DELIVERY_ZONES: 'delivery_zones',
    FINANCIAL_SUMMARY: 'financial_summary'
};

// ============================================================================
// SERVICIO DE REPORTES
// ============================================================================

class ReportService {
    constructor() {
        // Datos de ejemplo (en producción vendrían de la DB)
        this.salesData = this.generateSampleSalesData();
        this.productsData = this.generateSampleProductsData();
        this.customersData = this.generateSampleCustomersData();
    }

    // ========================================================================
    // REPORTES DE VENTAS
    // ========================================================================

    /**
     * Generar reporte de ventas diarias
     */
    async generateDailySalesReport(date = new Date()) {
        const dateStr = date.toISOString().split('T')[0];
        const sales = this.salesData.filter(s => 
            s.createdAt.toISOString().split('T')[0] === dateStr
        );

        const report = {
            id: uuidv4(),
            type: REPORT_TYPES.SALES_DAILY,
            title: `Reporte de Ventas Diarias - ${this.formatDate(date)}`,
            generatedAt: new Date(),
            period: {
                type: 'daily',
                date: dateStr
            },
            summary: {
                totalOrders: sales.length,
                totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
                averageOrderValue: sales.length > 0 
                    ? Math.round(sales.reduce((sum, s) => sum + s.total, 0) / sales.length) 
                    : 0,
                totalItems: sales.reduce((sum, s) => sum + s.items.length, 0),
                paymentMethods: this.groupByPaymentMethod(sales),
                deliveryZones: this.groupByDeliveryZone(sales),
                hourlyDistribution: this.getHourlyDistribution(sales)
            },
            orders: sales.map(s => ({
                orderId: s.id,
                customer: s.customerName,
                total: s.total,
                items: s.items.length,
                status: s.status,
                paymentMethod: s.paymentMethod,
                deliveryZone: s.deliveryZone,
                time: s.createdAt.toLocaleTimeString('es-CL')
            })),
            topProducts: this.getTopProductsFromSales(sales, 5),
            metadata: {
                currency: REPORT_CONFIG.currency,
                company: REPORT_CONFIG.companyName
            }
        };

        return report;
    }

    /**
     * Generar reporte de ventas semanal
     */
    async generateWeeklySalesReport(weekStart = new Date()) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const sales = this.salesData.filter(s => 
            s.createdAt >= weekStart && s.createdAt <= weekEnd
        );

        const dailyBreakdown = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            const dayStr = day.toISOString().split('T')[0];
            const daySales = sales.filter(s => 
                s.createdAt.toISOString().split('T')[0] === dayStr
            );
            
            dailyBreakdown.push({
                date: dayStr,
                dayName: day.toLocaleDateString('es-CL', { weekday: 'long' }),
                orders: daySales.length,
                revenue: daySales.reduce((sum, s) => sum + s.total, 0)
            });
        }

        return {
            id: uuidv4(),
            type: REPORT_TYPES.SALES_WEEKLY,
            title: `Reporte Semanal - ${this.formatDate(weekStart)} al ${this.formatDate(weekEnd)}`,
            generatedAt: new Date(),
            period: {
                type: 'weekly',
                start: weekStart.toISOString().split('T')[0],
                end: weekEnd.toISOString().split('T')[0]
            },
            summary: {
                totalOrders: sales.length,
                totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
                averageOrderValue: sales.length > 0 
                    ? Math.round(sales.reduce((sum, s) => sum + s.total, 0) / sales.length) 
                    : 0,
                ordersPerDay: (sales.length / 7).toFixed(1),
                bestDay: dailyBreakdown.reduce((best, day) => 
                    day.revenue > best.revenue ? day : best, dailyBreakdown[0]
                )
            },
            dailyBreakdown,
            topProducts: this.getTopProductsFromSales(sales, 10),
            paymentMethods: this.groupByPaymentMethod(sales),
            deliveryZones: this.groupByDeliveryZone(sales),
            metadata: {
                currency: REPORT_CONFIG.currency,
                company: REPORT_CONFIG.companyName
            }
        };
    }

    /**
     * Generar reporte de ventas mensual
     */
    async generateMonthlySalesReport(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const sales = this.salesData.filter(s => 
            s.createdAt >= startDate && s.createdAt <= endDate
        );

        // Agrupar por semana
        const weeklyBreakdown = [];
        let weekStart = new Date(startDate);
        while (weekStart <= endDate) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());

            const weekSales = sales.filter(s => 
                s.createdAt >= weekStart && s.createdAt <= weekEnd
            );

            weeklyBreakdown.push({
                week: weeklyBreakdown.length + 1,
                start: weekStart.toISOString().split('T')[0],
                end: weekEnd.toISOString().split('T')[0],
                orders: weekSales.length,
                revenue: weekSales.reduce((sum, s) => sum + s.total, 0)
            });

            weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() + 1);
        }

        // Comparación con mes anterior
        const prevMonthStart = new Date(year, month - 2, 1);
        const prevMonthEnd = new Date(year, month - 1, 0);
        const prevMonthSales = this.salesData.filter(s => 
            s.createdAt >= prevMonthStart && s.createdAt <= prevMonthEnd
        );

        const currentRevenue = sales.reduce((sum, s) => sum + s.total, 0);
        const prevRevenue = prevMonthSales.reduce((sum, s) => sum + s.total, 0);
        const revenueGrowth = prevRevenue > 0 
            ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) 
            : 0;

        return {
            id: uuidv4(),
            type: REPORT_TYPES.SALES_MONTHLY,
            title: `Reporte Mensual - ${startDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`,
            generatedAt: new Date(),
            period: {
                type: 'monthly',
                year,
                month,
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            },
            summary: {
                totalOrders: sales.length,
                totalRevenue: currentRevenue,
                averageOrderValue: sales.length > 0 
                    ? Math.round(currentRevenue / sales.length) 
                    : 0,
                ordersPerDay: (sales.length / endDate.getDate()).toFixed(1),
                revenueGrowth: parseFloat(revenueGrowth),
                previousMonthRevenue: prevRevenue
            },
            weeklyBreakdown,
            topProducts: this.getTopProductsFromSales(sales, 15),
            topCustomers: this.getTopCustomersFromSales(sales, 10),
            paymentMethods: this.groupByPaymentMethod(sales),
            deliveryZones: this.groupByDeliveryZone(sales),
            metadata: {
                currency: REPORT_CONFIG.currency,
                company: REPORT_CONFIG.companyName
            }
        };
    }

    // ========================================================================
    // REPORTES DE PRODUCTOS
    // ========================================================================

    /**
     * Reporte de productos más vendidos
     */
    async generateBestsellersReport(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const sales = this.salesData.filter(s => s.createdAt >= startDate);
        const productSales = new Map();

        sales.forEach(sale => {
            sale.items.forEach(item => {
                const current = productSales.get(item.productId) || {
                    productId: item.productId,
                    name: item.name,
                    category: item.category,
                    unitsSold: 0,
                    revenue: 0,
                    orders: 0
                };
                current.unitsSold += item.quantity;
                current.revenue += item.price * item.quantity;
                current.orders += 1;
                productSales.set(item.productId, current);
            });
        });

        const products = Array.from(productSales.values())
            .sort((a, b) => b.revenue - a.revenue);

        return {
            id: uuidv4(),
            type: REPORT_TYPES.PRODUCTS_BESTSELLERS,
            title: `Productos Más Vendidos - Últimos ${days} días`,
            generatedAt: new Date(),
            period: {
                days,
                start: startDate.toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
            },
            summary: {
                totalProducts: products.length,
                totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
                totalUnitsSold: products.reduce((sum, p) => sum + p.unitsSold, 0),
                avgRevenuePerProduct: products.length > 0
                    ? Math.round(products.reduce((sum, p) => sum + p.revenue, 0) / products.length)
                    : 0
            },
            products: products.map((p, index) => ({
                rank: index + 1,
                ...p,
                avgPrice: Math.round(p.revenue / p.unitsSold),
                contribution: ((p.revenue / products.reduce((sum, pr) => sum + pr.revenue, 0)) * 100).toFixed(1) + '%'
            })),
            byCategory: this.groupProductsByCategory(products),
            metadata: {
                currency: REPORT_CONFIG.currency,
                company: REPORT_CONFIG.companyName
            }
        };
    }

    /**
     * Reporte de inventario
     */
    async generateInventoryReport() {
        const products = this.productsData;
        
        const summary = {
            totalProducts: products.length,
            totalValue: products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0),
            outOfStock: products.filter(p => p.stock === 0).length,
            lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
            healthy: products.filter(p => p.stock > 10).length
        };

        return {
            id: uuidv4(),
            type: REPORT_TYPES.PRODUCTS_INVENTORY,
            title: 'Reporte de Inventario',
            generatedAt: new Date(),
            summary,
            products: products.map(p => ({
                productId: p.id,
                name: p.name,
                sku: p.sku,
                category: p.category,
                stock: p.stock,
                costPrice: p.costPrice,
                salePrice: p.price,
                stockValue: p.stock * p.costPrice,
                status: p.stock === 0 ? 'agotado' : 
                        p.stock <= 10 ? 'bajo' : 'normal',
                reorderNeeded: p.stock <= p.reorderPoint
            })).sort((a, b) => a.stock - b.stock),
            byCategory: products.reduce((acc, p) => {
                if (!acc[p.category]) {
                    acc[p.category] = { count: 0, value: 0 };
                }
                acc[p.category].count += 1;
                acc[p.category].value += p.stock * p.costPrice;
                return acc;
            }, {}),
            reorderList: products
                .filter(p => p.stock <= p.reorderPoint)
                .map(p => ({
                    productId: p.id,
                    name: p.name,
                    currentStock: p.stock,
                    reorderPoint: p.reorderPoint,
                    suggestedOrder: p.reorderQuantity
                })),
            metadata: {
                currency: REPORT_CONFIG.currency,
                company: REPORT_CONFIG.companyName
            }
        };
    }

    // ========================================================================
    // REPORTES DE CLIENTES
    // ========================================================================

    /**
     * Reporte de clientes top
     */
    async generateTopCustomersReport(days = 90) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const sales = this.salesData.filter(s => s.createdAt >= startDate);
        const customerStats = new Map();

        sales.forEach(sale => {
            const current = customerStats.get(sale.customerId) || {
                customerId: sale.customerId,
                name: sale.customerName,
                email: sale.customerEmail,
                totalOrders: 0,
                totalSpent: 0,
                avgOrderValue: 0,
                lastOrderDate: null
            };
            current.totalOrders += 1;
            current.totalSpent += sale.total;
            if (!current.lastOrderDate || sale.createdAt > current.lastOrderDate) {
                current.lastOrderDate = sale.createdAt;
            }
            customerStats.set(sale.customerId, current);
        });

        const customers = Array.from(customerStats.values())
            .map(c => ({
                ...c,
                avgOrderValue: Math.round(c.totalSpent / c.totalOrders),
                lastOrderDate: c.lastOrderDate.toISOString().split('T')[0]
            }))
            .sort((a, b) => b.totalSpent - a.totalSpent);

        return {
            id: uuidv4(),
            type: REPORT_TYPES.CUSTOMERS_TOP,
            title: `Clientes Top - Últimos ${days} días`,
            generatedAt: new Date(),
            period: {
                days,
                start: startDate.toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
            },
            summary: {
                totalCustomers: customers.length,
                totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
                avgLifetimeValue: customers.length > 0
                    ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length)
                    : 0,
                top10Revenue: customers.slice(0, 10).reduce((sum, c) => sum + c.totalSpent, 0)
            },
            customers: customers.map((c, index) => ({
                rank: index + 1,
                ...c,
                contribution: ((c.totalSpent / customers.reduce((sum, cu) => sum + cu.totalSpent, 0)) * 100).toFixed(1) + '%'
            })),
            segments: {
                vip: customers.filter(c => c.totalSpent >= 500000).length,
                frequent: customers.filter(c => c.totalOrders >= 5).length,
                occasional: customers.filter(c => c.totalOrders >= 2 && c.totalOrders < 5).length,
                oneTime: customers.filter(c => c.totalOrders === 1).length
            },
            metadata: {
                currency: REPORT_CONFIG.currency,
                company: REPORT_CONFIG.companyName
            }
        };
    }

    // ========================================================================
    // REPORTES DE ENGAGEMENT
    // ========================================================================

    /**
     * Reporte de cupones
     */
    async generateCouponsReport(days = 30) {
        // Datos de ejemplo
        const coupons = [
            { code: 'PRIMAVERA2025', type: 'percentage', value: 15, uses: 487, revenue: 12500000 },
            { code: 'BIENVENIDO', type: 'fixed', value: 5000, uses: 324, revenue: 8200000 },
            { code: 'ENVIOGRATIS', type: 'shipping', value: 0, uses: 256, revenue: 6800000 },
            { code: 'DIADELAMADRE', type: 'percentage', value: 20, uses: 198, revenue: 5400000 }
        ];

        return {
            id: uuidv4(),
            type: REPORT_TYPES.ENGAGEMENT_COUPONS,
            title: `Reporte de Cupones - Últimos ${days} días`,
            generatedAt: new Date(),
            summary: {
                totalCoupons: coupons.length,
                totalUses: coupons.reduce((sum, c) => sum + c.uses, 0),
                totalRevenueGenerated: coupons.reduce((sum, c) => sum + c.revenue, 0),
                avgUsesPerCoupon: Math.round(coupons.reduce((sum, c) => sum + c.uses, 0) / coupons.length)
            },
            coupons: coupons.map((c, i) => ({
                rank: i + 1,
                ...c,
                avgOrderValue: Math.round(c.revenue / c.uses)
            })),
            metadata: {
                currency: REPORT_CONFIG.currency,
                company: REPORT_CONFIG.companyName
            }
        };
    }

    /**
     * Reporte de fidelización
     */
    async generateLoyaltyReport() {
        const tiers = {
            bronze: { count: 423, points: 125000, spent: 8500000 },
            silver: { count: 284, points: 340000, spent: 15200000 },
            gold: { count: 98, points: 520000, spent: 24800000 },
            platinum: { count: 42, points: 680000, spent: 35600000 }
        };

        const totalMembers = Object.values(tiers).reduce((sum, t) => sum + t.count, 0);
        const totalPoints = Object.values(tiers).reduce((sum, t) => sum + t.points, 0);
        const totalSpent = Object.values(tiers).reduce((sum, t) => sum + t.spent, 0);

        return {
            id: uuidv4(),
            type: REPORT_TYPES.ENGAGEMENT_LOYALTY,
            title: 'Reporte del Programa de Fidelización',
            generatedAt: new Date(),
            summary: {
                totalMembers,
                totalPointsIssued: totalPoints,
                totalRevenueFromMembers: totalSpent,
                avgPointsPerMember: Math.round(totalPoints / totalMembers),
                avgSpentPerMember: Math.round(totalSpent / totalMembers)
            },
            tiers: Object.entries(tiers).map(([name, data]) => ({
                tier: name.charAt(0).toUpperCase() + name.slice(1),
                members: data.count,
                percentage: ((data.count / totalMembers) * 100).toFixed(1) + '%',
                totalPoints: data.points,
                totalSpent: data.spent,
                avgSpentPerMember: Math.round(data.spent / data.count)
            })),
            metadata: {
                currency: REPORT_CONFIG.currency,
                company: REPORT_CONFIG.companyName
            }
        };
    }

    // ========================================================================
    // EXPORTACIÓN
    // ========================================================================

    /**
     * Exportar reporte a CSV
     */
    exportToCSV(report, includeHeaders = true) {
        let csv = '';
        
        // Determinar datos a exportar según tipo de reporte
        let data = [];
        let headers = [];

        switch (report.type) {
            case REPORT_TYPES.SALES_DAILY:
            case REPORT_TYPES.SALES_WEEKLY:
            case REPORT_TYPES.SALES_MONTHLY:
                data = report.orders || report.dailyBreakdown || report.weeklyBreakdown;
                if (data.length > 0) {
                    headers = Object.keys(data[0]);
                }
                break;
            case REPORT_TYPES.PRODUCTS_BESTSELLERS:
            case REPORT_TYPES.PRODUCTS_INVENTORY:
                data = report.products;
                if (data.length > 0) {
                    headers = Object.keys(data[0]);
                }
                break;
            case REPORT_TYPES.CUSTOMERS_TOP:
                data = report.customers;
                if (data.length > 0) {
                    headers = Object.keys(data[0]);
                }
                break;
            default:
                // Exportar resumen
                data = [report.summary];
                headers = Object.keys(report.summary);
        }

        if (includeHeaders && headers.length > 0) {
            csv += headers.join(',') + '\n';
        }

        data.forEach(row => {
            const values = headers.map(h => {
                const value = row[h];
                // Escapar comas y comillas
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            });
            csv += values.join(',') + '\n';
        });

        return csv;
    }

    /**
     * Generar datos para PDF
     */
    generatePDFData(report) {
        return {
            title: report.title,
            company: REPORT_CONFIG,
            generatedAt: this.formatDateTime(report.generatedAt),
            period: report.period,
            summary: report.summary,
            details: report.products || report.customers || report.orders || report.dailyBreakdown,
            charts: this.generateChartData(report),
            footer: `Generado por ${REPORT_CONFIG.companyName} - ${this.formatDateTime(new Date())}`
        };
    }

    /**
     * Generar datos para gráficos
     */
    generateChartData(report) {
        const charts = [];

        if (report.dailyBreakdown) {
            charts.push({
                type: 'bar',
                title: 'Ventas por Día',
                labels: report.dailyBreakdown.map(d => d.dayName || d.date),
                datasets: [{
                    label: 'Ingresos',
                    data: report.dailyBreakdown.map(d => d.revenue)
                }]
            });
        }

        if (report.paymentMethods) {
            charts.push({
                type: 'pie',
                title: 'Métodos de Pago',
                labels: Object.keys(report.paymentMethods),
                data: Object.values(report.paymentMethods).map(m => m.count)
            });
        }

        if (report.byCategory) {
            const categories = Object.entries(report.byCategory);
            charts.push({
                type: 'bar',
                title: 'Por Categoría',
                labels: categories.map(([name]) => name),
                datasets: [{
                    label: 'Cantidad',
                    data: categories.map(([, data]) => data.count || data)
                }]
            });
        }

        return charts;
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    formatDate(date) {
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateTime(date) {
        return date.toLocaleString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    groupByPaymentMethod(sales) {
        return sales.reduce((acc, sale) => {
            const method = sale.paymentMethod || 'otro';
            if (!acc[method]) {
                acc[method] = { count: 0, total: 0 };
            }
            acc[method].count += 1;
            acc[method].total += sale.total;
            return acc;
        }, {});
    }

    groupByDeliveryZone(sales) {
        return sales.reduce((acc, sale) => {
            const zone = sale.deliveryZone || 'otro';
            if (!acc[zone]) {
                acc[zone] = { count: 0, total: 0 };
            }
            acc[zone].count += 1;
            acc[zone].total += sale.total;
            return acc;
        }, {});
    }

    getHourlyDistribution(sales) {
        const hours = Array(24).fill(0);
        sales.forEach(sale => {
            const hour = sale.createdAt.getHours();
            hours[hour]++;
        });
        return hours.map((count, hour) => ({ hour: `${hour}:00`, orders: count }));
    }

    getTopProductsFromSales(sales, limit = 5) {
        const productSales = new Map();
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const current = productSales.get(item.productId) || {
                    productId: item.productId,
                    name: item.name,
                    unitsSold: 0,
                    revenue: 0
                };
                current.unitsSold += item.quantity;
                current.revenue += item.price * item.quantity;
                productSales.set(item.productId, current);
            });
        });

        return Array.from(productSales.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    getTopCustomersFromSales(sales, limit = 5) {
        const customers = new Map();
        
        sales.forEach(sale => {
            const current = customers.get(sale.customerId) || {
                customerId: sale.customerId,
                name: sale.customerName,
                orders: 0,
                totalSpent: 0
            };
            current.orders += 1;
            current.totalSpent += sale.total;
            customers.set(sale.customerId, current);
        });

        return Array.from(customers.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, limit);
    }

    groupProductsByCategory(products) {
        return products.reduce((acc, p) => {
            const category = p.category || 'Sin categoría';
            if (!acc[category]) {
                acc[category] = { count: 0, revenue: 0, units: 0 };
            }
            acc[category].count += 1;
            acc[category].revenue += p.revenue;
            acc[category].units += p.unitsSold;
            return acc;
        }, {});
    }

    // ========================================================================
    // DATOS DE EJEMPLO
    // ========================================================================

    generateSampleSalesData() {
        const sales = [];
        const products = [
            { id: 'p1', name: 'Ramo Primaveral', category: 'Ramos', price: 25000 },
            { id: 'p2', name: 'Arreglo Romántico', category: 'Arreglos', price: 35000 },
            { id: 'p3', name: 'Bouquet Elegante', category: 'Bouquets', price: 45000 },
            { id: 'p4', name: 'Corona Fúnebre', category: 'Coronas', price: 55000 },
            { id: 'p5', name: 'Rosas Rojas x12', category: 'Rosas', price: 18000 }
        ];
        const customers = [
            { id: 'c1', name: 'María González', email: 'maria@email.com' },
            { id: 'c2', name: 'Carlos Rodríguez', email: 'carlos@email.com' },
            { id: 'c3', name: 'Ana Martínez', email: 'ana@email.com' }
        ];
        const zones = ['Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa', 'Santiago Centro'];
        const methods = ['flow_card', 'khipu', 'webpay'];

        // Generar 50 ventas de ejemplo
        for (let i = 0; i < 50; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const numItems = Math.floor(Math.random() * 3) + 1;
            const items = [];
            
            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                items.push({
                    productId: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    quantity: Math.floor(Math.random() * 2) + 1
                });
            }

            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            date.setHours(Math.floor(Math.random() * 12) + 8);

            sales.push({
                id: `ORD-${1000 + i}`,
                customerId: customer.id,
                customerName: customer.name,
                customerEmail: customer.email,
                items,
                total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                status: 'completed',
                paymentMethod: methods[Math.floor(Math.random() * methods.length)],
                deliveryZone: zones[Math.floor(Math.random() * zones.length)],
                createdAt: date
            });
        }

        return sales;
    }

    generateSampleProductsData() {
        return [
            { id: 'p1', name: 'Ramo Primaveral', sku: 'RP-001', category: 'Ramos', stock: 25, costPrice: 12000, price: 25000, reorderPoint: 10, reorderQuantity: 30 },
            { id: 'p2', name: 'Arreglo Romántico', sku: 'AR-001', category: 'Arreglos', stock: 8, costPrice: 18000, price: 35000, reorderPoint: 10, reorderQuantity: 20 },
            { id: 'p3', name: 'Bouquet Elegante', sku: 'BE-001', category: 'Bouquets', stock: 0, costPrice: 22000, price: 45000, reorderPoint: 5, reorderQuantity: 15 },
            { id: 'p4', name: 'Corona Fúnebre', sku: 'CF-001', category: 'Coronas', stock: 3, costPrice: 28000, price: 55000, reorderPoint: 5, reorderQuantity: 10 },
            { id: 'p5', name: 'Rosas Rojas x12', sku: 'RR-012', category: 'Rosas', stock: 45, costPrice: 9000, price: 18000, reorderPoint: 15, reorderQuantity: 50 }
        ];
    }

    generateSampleCustomersData() {
        return [
            { id: 'c1', name: 'María González', email: 'maria@email.com', tier: 'gold' },
            { id: 'c2', name: 'Carlos Rodríguez', email: 'carlos@email.com', tier: 'platinum' },
            { id: 'c3', name: 'Ana Martínez', email: 'ana@email.com', tier: 'silver' }
        ];
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    ReportService,
    REPORT_TYPES,
    REPORT_CONFIG
};
