/**
 * Content Security Policy (CSP) Configuration
 * Implementación de seguridad empresarial para Arreglos Victoria
 * 
 * Este archivo configura políticas de seguridad estrictas para prevenir:
 * - Cross-Site Scripting (XSS)
 * - Code Injection attacks
 * - Data exfiltration
 * - Malicious resource loading
 */

class CSPManager {
    constructor() {
        this.policies = {
            // Directiva base: solo permitir contenido del mismo origen
            'default-src': ["'self'"],
            
            // Scripts: permitir inline para analytics y self para módulos
            'script-src': [
                "'self'",
                "'unsafe-inline'", // Para Google Analytics y eventos inline
                "'unsafe-eval'",   // Para desarrollo Vite (solo dev)
                'https://www.googletagmanager.com',
                'https://www.google-analytics.com',
                'https://connect.facebook.net',
                'https://cdn.jsdelivr.net'
            ],
            
            // Estilos: permitir inline y fuentes externas
            'style-src': [
                "'self'",
                "'unsafe-inline'", // Para estilos dinámicos
                'https://fonts.googleapis.com',
                'https://cdn.jsdelivr.net'
            ],
            
            // Imágenes: permitir data URIs y dominios confiables
            'img-src': [
                "'self'",
                'data:',
                'blob:',
                'https://images.unsplash.com',
                'https://via.placeholder.com',
                'https://www.google-analytics.com',
                'https://stats.g.doubleclick.net'
            ],
            
            // Fuentes: Google Fonts y self
            'font-src': [
                "'self'",
                'https://fonts.gstatic.com',
                'data:'
            ],
            
            // Conexiones: APIs y analytics
            'connect-src': [
                "'self'",
                'https://www.google-analytics.com',
                'https://region1.google-analytics.com',
                'https://api.floresvictoria.cl',
                'ws://localhost:*', // WebSocket para Vite HMR
                'http://localhost:*' // Desarrollo local
            ],
            
            // Media: self y blob para uploads
            'media-src': [
                "'self'",
                'blob:'
            ],
            
            // Workers: self para Service Worker
            'worker-src': [
                "'self'",
                'blob:'
            ],
            
            // Child frames: permitir embeds necesarios
            'child-src': [
                "'self'",
                'https://www.google.com' // Para reCAPTCHA si es necesario
            ],
            
            // Frame ancestors: prevenir clickjacking
            'frame-ancestors': ["'none'"],
            
            // Form actions: solo mismo origen
            'form-action': ["'self'"],
            
            // Base URI: restricción estricta
            'base-uri': ["'self'"],
            
            // Object source: bloquear plugins
            'object-src': ["'none'"],
            
            // Manifest: PWA manifest
            'manifest-src': ["'self'"]
        };
        
        this.reportingEndpoint = '/api/csp-report';
        this.isProduction = this.detectEnvironment();
    }
    
    /**
     * Detectar si estamos en producción
     */
    detectEnvironment() {
        return !window.location.hostname.includes('localhost') && 
               !window.location.hostname.includes('127.0.0.1');
    }
    
    /**
     * Generar la política CSP como string
     */
    generatePolicyString() {
        let policy = '';
        
        // Ajustar políticas según el entorno
        if (!this.isProduction) {
            // En desarrollo, ser más permisivo para Vite
            this.policies['script-src'].push('http://localhost:*');
            this.policies['style-src'].push('http://localhost:*');
            this.policies['connect-src'].push('ws://localhost:*');
        } else {
            // En producción, remover unsafe-eval
            this.policies['script-src'] = this.policies['script-src']
                .filter(src => src !== "'unsafe-eval'");
        }
        
        // Construir string de política
        for (const [directive, sources] of Object.entries(this.policies)) {
            policy += `${directive} ${sources.join(' ')}; `;
        }
        
        // Agregar reporting en producción
        if (this.isProduction) {
            policy += `report-uri ${this.reportingEndpoint}; `;
        }
        
        return policy.trim();
    }
    
    /**
     * Aplicar CSP mediante meta tag
     */
    applyCSPMeta() {
        const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (existingMeta) {
            existingMeta.remove();
        }
        
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Security-Policy');
        meta.setAttribute('content', this.generatePolicyString());
        document.head.appendChild(meta);
        
        console.log('🔒 CSP Policy Applied:', this.generatePolicyString());
    }
    
    /**
     * Configurar reportes de violaciones
     */
    setupViolationReporting() {
        document.addEventListener('securitypolicyviolation', (e) => {
            const violation = {
                documentURI: e.documentURI,
                referrer: e.referrer,
                blockedURI: e.blockedURI,
                violatedDirective: e.violatedDirective,
                originalPolicy: e.originalPolicy,
                sourceFile: e.sourceFile,
                lineNumber: e.lineNumber,
                columnNumber: e.columnNumber,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            // Reportar violación
            this.reportViolation(violation);
            
            // Log en desarrollo
            if (!this.isProduction) {
                console.warn('🚨 CSP Violation:', violation);
            }
        });
    }
    
    /**
     * Reportar violación al servidor
     */
    async reportViolation(violation) {
        try {
            if (this.isProduction) {
                await fetch(this.reportingEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(violation)
                });
            }
        } catch (error) {
            console.error('Error reporting CSP violation:', error);
        }
    }
    
    /**
     * Validar CSP actual
     */
    validateCurrentPolicy() {
        const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!meta) {
            console.warn('⚠️ No CSP policy found');
            return false;
        }
        
        const policy = meta.getAttribute('content');
        console.log('✅ Current CSP Policy:', policy);
        return true;
    }
    
    /**
     * Generar reporte de seguridad
     */
    generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            environment: this.isProduction ? 'production' : 'development',
            cspApplied: this.validateCurrentPolicy(),
            httpsOnly: window.location.protocol === 'https:',
            policies: this.policies,
            recommendations: []
        };
        
        // Agregar recomendaciones
        if (!report.httpsOnly && this.isProduction) {
            report.recommendations.push('Migrate to HTTPS in production');
        }
        
        if (!report.cspApplied) {
            report.recommendations.push('Apply Content Security Policy');
        }
        
        return report;
    }
    
    /**
     * Inicializar CSP Manager
     */
    init() {
        console.log('🔒 Initializing CSP Manager...');
        
        this.applyCSPMeta();
        this.setupViolationReporting();
        
        // Generar reporte inicial
        const securityReport = this.generateSecurityReport();
        console.log('📊 Security Report:', securityReport);
        
        console.log('✅ CSP Manager initialized successfully');
    }
}

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.cspManager = new CSPManager();
    window.cspManager.init();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSPManager;
}