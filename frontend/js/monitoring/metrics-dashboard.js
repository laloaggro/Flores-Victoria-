// Real-time Metrics Dashboard - Arreglos Victoria
// Dashboard centralizado para monitoreo en tiempo real

class MetricsDashboard {
    constructor() {
        this.metrics = {
            performance: {},
            analytics: {},
            errors: {},
            business: {},
            system: {}
        };
        
        this.subscribers = [];
        this.isActive = false;
        this.updateInterval = 5000; // 5 segundos
        this.chartInstances = {};
        
        this.init();
    }
    
    init() {
        this.createDashboardUI();
        this.startMetricsCollection();
        this.setupEventListeners();
        this.isActive = true;
        
        console.log('📊 Metrics Dashboard initialized');
    }
    
    createDashboardUI() {
        // Crear contenedor del dashboard
        const dashboardContainer = document.createElement('div');
        dashboardContainer.id = 'metrics-dashboard';
        dashboardContainer.className = 'metrics-dashboard hidden';
        
        dashboardContainer.innerHTML = `
            <div class="dashboard-header">
                <h2>📊 Real-time Metrics Dashboard</h2>
                <div class="dashboard-controls">
                    <button id="refresh-metrics" class="btn-primary">🔄 Refresh</button>
                    <button id="export-metrics" class="btn-secondary">📥 Export</button>
                    <button id="toggle-auto-refresh" class="btn-secondary">⏸️ Pause</button>
                    <button id="close-dashboard" class="btn-close">✕</button>
                </div>
            </div>
            
            <div class="dashboard-content">
                <!-- Performance Metrics -->
                <div class="metrics-section">
                    <h3>⚡ Performance Metrics</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-title">LCP (Largest Contentful Paint)</div>
                            <div class="metric-value" id="lcp-value">-</div>
                            <div class="metric-status" id="lcp-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">FID (First Input Delay)</div>
                            <div class="metric-value" id="fid-value">-</div>
                            <div class="metric-status" id="fid-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">CLS (Cumulative Layout Shift)</div>
                            <div class="metric-value" id="cls-value">-</div>
                            <div class="metric-status" id="cls-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Page Load Time</div>
                            <div class="metric-value" id="load-time-value">-</div>
                            <div class="metric-status" id="load-time-status">○</div>
                        </div>
                    </div>
                    <canvas id="performance-chart" width="400" height="200"></canvas>
                </div>
                
                <!-- Analytics Metrics -->
                <div class="metrics-section">
                    <h3>📈 Analytics Metrics</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-title">Page Views (Session)</div>
                            <div class="metric-value" id="pageviews-value">-</div>
                            <div class="metric-status" id="pageviews-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Session Duration</div>
                            <div class="metric-value" id="session-duration-value">-</div>
                            <div class="metric-status" id="session-duration-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Bounce Rate</div>
                            <div class="metric-value" id="bounce-rate-value">-</div>
                            <div class="metric-status" id="bounce-rate-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Engagement Score</div>
                            <div class="metric-value" id="engagement-value">-</div>
                            <div class="metric-status" id="engagement-status">○</div>
                        </div>
                    </div>
                    <canvas id="analytics-chart" width="400" height="200"></canvas>
                </div>
                
                <!-- Error Tracking -->
                <div class="metrics-section">
                    <h3>🐛 Error Tracking</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-title">JavaScript Errors</div>
                            <div class="metric-value" id="js-errors-value">-</div>
                            <div class="metric-status" id="js-errors-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Network Errors</div>
                            <div class="metric-value" id="network-errors-value">-</div>
                            <div class="metric-status" id="network-errors-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">CSP Violations</div>
                            <div class="metric-value" id="csp-violations-value">-</div>
                            <div class="metric-status" id="csp-violations-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Error Rate</div>
                            <div class="metric-value" id="error-rate-value">-</div>
                            <div class="metric-status" id="error-rate-status">○</div>
                        </div>
                    </div>
                    <div id="recent-errors" class="recent-errors"></div>
                </div>
                
                <!-- Business Metrics -->
                <div class="metrics-section">
                    <h3>💼 Business Metrics</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-title">Contact Form Submissions</div>
                            <div class="metric-value" id="form-submissions-value">-</div>
                            <div class="metric-status" id="form-submissions-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Phone Call Clicks</div>
                            <div class="metric-value" id="phone-clicks-value">-</div>
                            <div class="metric-status" id="phone-clicks-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Service Views</div>
                            <div class="metric-value" id="service-views-value">-</div>
                            <div class="metric-status" id="service-views-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Conversion Rate</div>
                            <div class="metric-value" id="conversion-rate-value">-</div>
                            <div class="metric-status" id="conversion-rate-status">○</div>
                        </div>
                    </div>
                </div>
                
                <!-- System Health -->
                <div class="metrics-section">
                    <h3>🖥️ System Health</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-title">Memory Usage</div>
                            <div class="metric-value" id="memory-usage-value">-</div>
                            <div class="metric-status" id="memory-usage-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Service Worker Status</div>
                            <div class="metric-value" id="sw-status-value">-</div>
                            <div class="metric-status" id="sw-status-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Cache Hit Rate</div>
                            <div class="metric-value" id="cache-hit-rate-value">-</div>
                            <div class="metric-status" id="cache-hit-rate-status">○</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Online Status</div>
                            <div class="metric-value" id="online-status-value">-</div>
                            <div class="metric-status" id="online-status-status">○</div>
                        </div>
                    </div>
                </div>
                
                <!-- Real-time Activity Log -->
                <div class="metrics-section">
                    <h3>📝 Real-time Activity Log</h3>
                    <div id="activity-log" class="activity-log"></div>
                </div>
            </div>
        `;
        
        // Agregar estilos
        const styles = `
            <style>
            .metrics-dashboard {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                overflow-y: auto;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                color: #ffffff;
            }
            
            .metrics-dashboard.hidden {
                display: none;
            }
            
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 2rem;
                background: #1a1a1a;
                border-bottom: 1px solid #333;
            }
            
            .dashboard-header h2 {
                margin: 0;
                color: #00ff88;
            }
            
            .dashboard-controls {
                display: flex;
                gap: 0.5rem;
            }
            
            .dashboard-controls button {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #00ff88;
                color: #000;
            }
            
            .btn-secondary {
                background: #333;
                color: #fff;
            }
            
            .btn-close {
                background: #ff4444;
                color: #fff;
            }
            
            .dashboard-content {
                padding: 2rem;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .metrics-section {
                margin-bottom: 3rem;
                background: #1a1a1a;
                border-radius: 8px;
                padding: 1.5rem;
                border: 1px solid #333;
            }
            
            .metrics-section h3 {
                margin: 0 0 1.5rem 0;
                color: #00ff88;
                border-bottom: 1px solid #333;
                padding-bottom: 0.5rem;
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .metric-card {
                background: #2a2a2a;
                border-radius: 6px;
                padding: 1rem;
                border: 1px solid #444;
                position: relative;
            }
            
            .metric-title {
                font-size: 0.9rem;
                color: #ccc;
                margin-bottom: 0.5rem;
            }
            
            .metric-value {
                font-size: 1.8rem;
                font-weight: bold;
                color: #00ff88;
                margin-bottom: 0.5rem;
            }
            
            .metric-status {
                position: absolute;
                top: 1rem;
                right: 1rem;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
            }
            
            .metric-status.good { background: #00ff88; color: #000; }
            .metric-status.warning { background: #ffaa00; color: #000; }
            .metric-status.critical { background: #ff4444; color: #fff; }
            
            .activity-log, .recent-errors {
                background: #0a0a0a;
                border-radius: 4px;
                padding: 1rem;
                height: 200px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 0.8rem;
                line-height: 1.4;
                border: 1px solid #333;
            }
            
            .log-entry {
                padding: 0.25rem 0;
                border-bottom: 1px solid #222;
            }
            
            .log-timestamp {
                color: #666;
                margin-right: 0.5rem;
            }
            
            .log-level-info { color: #00ff88; }
            .log-level-warning { color: #ffaa00; }
            .log-level-error { color: #ff4444; }
            
            canvas {
                width: 100%;
                height: 200px;
                background: #0a0a0a;
                border-radius: 4px;
                border: 1px solid #333;
            }
            
            @media (max-width: 768px) {
                .dashboard-header {
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .dashboard-controls {
                    flex-wrap: wrap;
                }
                
                .metrics-grid {
                    grid-template-columns: 1fr;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.appendChild(dashboardContainer);
        
        // Crear trigger button
        this.createTriggerButton();
    }
    
    createTriggerButton() {
        const triggerBtn = document.createElement('button');
        triggerBtn.id = 'dashboard-trigger';
        triggerBtn.innerHTML = '📊';
        triggerBtn.title = 'Open Metrics Dashboard';
        
        Object.assign(triggerBtn.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: '#00ff88',
            color: '#000',
            fontSize: '1.5rem',
            cursor: 'pointer',
            zIndex: '9999',
            boxShadow: '0 4px 12px rgba(0, 255, 136, 0.3)',
            transition: 'all 0.3s ease'
        });
        
        triggerBtn.addEventListener('click', () => this.toggle());
        triggerBtn.addEventListener('mouseenter', () => {
            triggerBtn.style.transform = 'scale(1.1)';
            triggerBtn.style.boxShadow = '0 6px 16px rgba(0, 255, 136, 0.4)';
        });
        triggerBtn.addEventListener('mouseleave', () => {
            triggerBtn.style.transform = 'scale(1)';
            triggerBtn.style.boxShadow = '0 4px 12px rgba(0, 255, 136, 0.3)';
        });
        
        document.body.appendChild(triggerBtn);
    }
    
    setupEventListeners() {
        // Dashboard controls
        document.getElementById('refresh-metrics').addEventListener('click', () => {
            this.collectAllMetrics();
            this.logActivity('Manual refresh triggered', 'info');
        });
        
        document.getElementById('export-metrics').addEventListener('click', () => {
            this.exportMetrics();
        });
        
        document.getElementById('toggle-auto-refresh').addEventListener('click', (e) => {
            this.toggleAutoRefresh();
            e.target.textContent = this.isActive ? '⏸️ Pause' : '▶️ Resume';
        });
        
        document.getElementById('close-dashboard').addEventListener('click', () => {
            this.hide();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                this.toggle();
            } else if (e.key === 'Escape' && !document.querySelector('.metrics-dashboard').classList.contains('hidden')) {
                this.hide();
            }
        });
    }
    
    startMetricsCollection() {
        this.collectAllMetrics();
        
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        
        this.metricsInterval = setInterval(() => {
            if (this.isActive) {
                this.collectAllMetrics();
            }
        }, this.updateInterval);
    }
    
    async collectAllMetrics() {
        try {
            await Promise.all([
                this.collectPerformanceMetrics(),
                this.collectAnalyticsMetrics(),
                this.collectErrorMetrics(),
                this.collectBusinessMetrics(),
                this.collectSystemMetrics()
            ]);
            
            this.updateUI();
            this.notifySubscribers();
        } catch (error) {
            console.error('Error collecting metrics:', error);
            this.logActivity(`Error collecting metrics: ${error.message}`, 'error');
        }
    }
    
    async collectPerformanceMetrics() {
        if (!('performance' in window)) return;
        
        // Web Vitals
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.performance.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            this.metrics.performance.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            this.metrics.performance.ttfb = navigation.responseStart - navigation.requestStart;
        }
        
        // Memory usage (si está disponible)
        if ('memory' in performance) {
            this.metrics.performance.memoryUsed = performance.memory.usedJSHeapSize;
            this.metrics.performance.memoryTotal = performance.memory.totalJSHeapSize;
            this.metrics.performance.memoryLimit = performance.memory.jsHeapSizeLimit;
        }
        
        // Resource timing
        const resources = performance.getEntriesByType('resource');
        this.metrics.performance.resourceCount = resources.length;
        this.metrics.performance.totalResourceSize = resources.reduce((sum, resource) => 
            sum + (resource.transferSize || 0), 0);
    }
    
    async collectAnalyticsMetrics() {
        // Session data
        const sessionStart = sessionStorage.getItem('session_start') || Date.now();
        this.metrics.analytics.sessionDuration = (Date.now() - parseInt(sessionStart)) / 1000;
        
        // Page views
        this.metrics.analytics.pageViews = parseInt(sessionStorage.getItem('page_views') || '1');
        
        // Engagement metrics
        if (window.ga4Manager) {
            const report = window.ga4Manager.getAnalyticsReport();
            this.metrics.analytics.customEvents = report.customEventsCount;
            this.metrics.analytics.engagementScore = report.userProperties.engagement_score || 0;
        }
        
        // Scroll depth
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        ) || 0;
        this.metrics.analytics.scrollDepth = scrollPercent;
    }
    
    async collectErrorMetrics() {
        // Error tracker data
        if (window.errorTracker) {
            const errorData = window.errorTracker.getErrorSummary();
            this.metrics.errors.jsErrors = errorData.jsErrors || 0;
            this.metrics.errors.networkErrors = errorData.networkErrors || 0;
            this.metrics.errors.performanceIssues = errorData.performanceIssues || 0;
            this.metrics.errors.totalErrors = errorData.totalErrors || 0;
            this.metrics.errors.errorRate = errorData.errorRate || 0;
            this.metrics.errors.recentErrors = errorData.recentErrors || [];
        }
        
        // CSP violations
        if (window.cspManager) {
            this.metrics.errors.cspViolations = window.cspManager.getViolationCount() || 0;
        }
    }
    
    async collectBusinessMetrics() {
        // Form submissions
        this.metrics.business.formSubmissions = parseInt(localStorage.getItem('form_submissions') || '0');
        
        // Contact interactions
        this.metrics.business.phoneClicks = parseInt(sessionStorage.getItem('phone_clicks') || '0');
        this.metrics.business.emailClicks = parseInt(sessionStorage.getItem('email_clicks') || '0');
        
        // Service views
        this.metrics.business.serviceViews = parseInt(sessionStorage.getItem('service_views') || '0');
        
        // Conversion rate calculation
        const totalInteractions = this.metrics.business.formSubmissions + 
                                this.metrics.business.phoneClicks + 
                                this.metrics.business.emailClicks;
        const totalVisits = this.metrics.analytics.pageViews || 1;
        this.metrics.business.conversionRate = ((totalInteractions / totalVisits) * 100).toFixed(2);
    }
    
    async collectSystemMetrics() {
        // Service Worker status
        this.metrics.system.serviceWorkerActive = 'serviceWorker' in navigator && 
            await navigator.serviceWorker.getRegistration() !== undefined;
        
        // Network status
        this.metrics.system.online = navigator.onLine;
        
        // Connection info
        if ('connection' in navigator) {
            this.metrics.system.connectionType = navigator.connection.effectiveType;
            this.metrics.system.connectionSpeed = navigator.connection.downlink;
        }
        
        // Cache performance (estimado)
        const cacheHits = parseInt(sessionStorage.getItem('cache_hits') || '0');
        const cacheMisses = parseInt(sessionStorage.getItem('cache_misses') || '0');
        const totalRequests = cacheHits + cacheMisses;
        this.metrics.system.cacheHitRate = totalRequests > 0 ? 
            ((cacheHits / totalRequests) * 100).toFixed(1) : '0';
    }
    
    updateUI() {
        // Performance metrics
        this.updateMetricCard('lcp', this.metrics.performance.lcp, 'ms', 2500, 4000);
        this.updateMetricCard('fid', this.metrics.performance.fid, 'ms', 100, 300);
        this.updateMetricCard('cls', this.metrics.performance.cls, '', 0.1, 0.25);
        this.updateMetricCard('load-time', this.metrics.performance.loadTime, 'ms', 3000, 5000);
        
        // Analytics metrics
        this.updateMetricCard('pageviews', this.metrics.analytics.pageViews, '', 1, 5);
        this.updateMetricCard('session-duration', Math.round(this.metrics.analytics.sessionDuration), 's', 30, 120);
        this.updateMetricCard('engagement', this.metrics.analytics.engagementScore, '%', 50, 80);
        
        // Error metrics
        this.updateMetricCard('js-errors', this.metrics.errors.jsErrors, '', 0, 3);
        this.updateMetricCard('network-errors', this.metrics.errors.networkErrors, '', 0, 2);
        this.updateMetricCard('csp-violations', this.metrics.errors.cspViolations, '', 0, 1);
        this.updateMetricCard('error-rate', this.metrics.errors.errorRate, '%', 1, 5);
        
        // Business metrics
        this.updateMetricCard('form-submissions', this.metrics.business.formSubmissions, '', 0, 1);
        this.updateMetricCard('phone-clicks', this.metrics.business.phoneClicks, '', 0, 1);
        this.updateMetricCard('service-views', this.metrics.business.serviceViews, '', 0, 3);
        this.updateMetricCard('conversion-rate', this.metrics.business.conversionRate, '%', 2, 10);
        
        // System metrics
        const memoryUsagePercent = this.metrics.performance.memoryUsed && this.metrics.performance.memoryLimit ?
            ((this.metrics.performance.memoryUsed / this.metrics.performance.memoryLimit) * 100).toFixed(1) : 0;
        this.updateMetricCard('memory-usage', memoryUsagePercent, '%', 70, 90);
        this.updateMetricCard('sw-status', this.metrics.system.serviceWorkerActive ? 'Active' : 'Inactive', '');
        this.updateMetricCard('cache-hit-rate', this.metrics.system.cacheHitRate, '%', 80, 95);
        this.updateMetricCard('online-status', this.metrics.system.online ? 'Online' : 'Offline', '');
        
        // Update error log
        this.updateErrorLog();
        
        // Update charts
        this.updateCharts();
    }
    
    updateMetricCard(metricName, value, unit, goodThreshold, warningThreshold) {
        const valueElement = document.getElementById(`${metricName}-value`);
        const statusElement = document.getElementById(`${metricName}-status`);
        
        if (!valueElement || !statusElement) return;
        
        valueElement.textContent = value !== undefined ? `${value}${unit}` : '-';
        
        // Determinar status
        let status = 'good';
        let statusIcon = '●';
        
        if (typeof value === 'number' && goodThreshold !== undefined) {
            if (value > warningThreshold) {
                status = 'critical';
                statusIcon = '●';
            } else if (value > goodThreshold) {
                status = 'warning';
                statusIcon = '●';
            }
        } else if (typeof value === 'string') {
            status = value.toLowerCase().includes('active') || value.toLowerCase().includes('online') ? 'good' : 'warning';
        }
        
        statusElement.textContent = statusIcon;
        statusElement.className = `metric-status ${status}`;
    }
    
    updateErrorLog() {
        const errorLog = document.getElementById('recent-errors');
        if (!errorLog || !this.metrics.errors.recentErrors) return;
        
        const errors = this.metrics.errors.recentErrors.slice(-10);
        errorLog.innerHTML = errors.map(error => `
            <div class="log-entry">
                <span class="log-timestamp">${new Date(error.timestamp).toLocaleTimeString()}</span>
                <span class="log-level-error">[ERROR]</span>
                ${error.message}
            </div>
        `).join('');
    }
    
    updateCharts() {
        // Placeholder para gráficos (requeriría Chart.js o similar)
        // Aquí se podrían implementar gráficos de tendencias
    }
    
    logActivity(message, level = 'info') {
        const activityLog = document.getElementById('activity-log');
        if (!activityLog) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-level-${level}">[${level.toUpperCase()}]</span>
            ${message}
        `;
        
        activityLog.insertBefore(entry, activityLog.firstChild);
        
        // Mantener solo las últimas 50 entradas
        while (activityLog.children.length > 50) {
            activityLog.removeChild(activityLog.lastChild);
        }
    }
    
    toggle() {
        const dashboard = document.querySelector('.metrics-dashboard');
        if (dashboard.classList.contains('hidden')) {
            this.show();
        } else {
            this.hide();
        }
    }
    
    show() {
        document.querySelector('.metrics-dashboard').classList.remove('hidden');
        this.collectAllMetrics();
        this.logActivity('Dashboard opened', 'info');
    }
    
    hide() {
        document.querySelector('.metrics-dashboard').classList.add('hidden');
    }
    
    toggleAutoRefresh() {
        this.isActive = !this.isActive;
        this.logActivity(`Auto-refresh ${this.isActive ? 'enabled' : 'disabled'}`, 'info');
    }
    
    exportMetrics() {
        const exportData = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            systemInfo: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                screen: `${screen.width}x${screen.height}`
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `metrics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.logActivity('Metrics exported successfully', 'info');
    }
    
    subscribe(callback) {
        this.subscribers.push(callback);
    }
    
    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }
    
    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.metrics);
            } catch (error) {
                console.error('Error notifying subscriber:', error);
            }
        });
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
    
    destroy() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        
        const dashboard = document.querySelector('.metrics-dashboard');
        const trigger = document.querySelector('#dashboard-trigger');
        
        if (dashboard) dashboard.remove();
        if (trigger) trigger.remove();
        
        this.subscribers = [];
        this.isActive = false;
    }
}

// Inicializar Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que otros sistemas estén listos
    setTimeout(() => {
        window.metricsDashboard = new MetricsDashboard();
        console.log('📊 Real-time Metrics Dashboard initialized!');
        console.log('💡 Press Ctrl+Shift+M to toggle dashboard');
    }, 2000);
});

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetricsDashboard;
}