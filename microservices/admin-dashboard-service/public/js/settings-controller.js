/**
 * Settings Controller
 * Manages settings page interactions and persistence
 */

(function() {
    'use strict';

    // ================================
    // State Management
    // ================================
    const defaultSettings = {
        // Profile
        firstName: 'Administrador',
        lastName: '',
        email: 'admin@floresvictoria.com',
        phone: '',
        bio: '',
        
        // Appearance
        theme: 'light',
        compactSidebar: false,
        animations: true,
        fontSize: 'medium',
        
        // Notifications
        emailNotifications: true,
        orderNotifications: true,
        stockNotifications: true,
        userNotifications: false,
        reviewNotifications: true,
        soundNotifications: false,
        
        // Security
        loginAlerts: true,
        actionLog: true,
        
        // Store
        storeName: 'Flores Victoria',
        storeDescription: 'Arreglos florales artesanales con el amor de siempre',
        currency: 'MXN',
        timezone: 'America/Mexico_City',
        storeEmail: 'contacto@floresvictoria.com',
        storePhone: '+52 55 1234 5678',
        storeAddress: 'Av. Reforma 123, Col. Juárez, CDMX 06600',
        
        // Payments
        stripeEnabled: true,
        paypalEnabled: false,
        bankEnabled: true,
        cashEnabled: true,
        
        // Shipping
        freeShipping: true,
        freeShippingMin: 500,
        standardShipping: 80,
        expressShipping: 150,
        nationalShipping: true,
        
        // Advanced
        maintenanceMode: false,
        debugMode: false,
        cacheEnabled: true,
        gzipEnabled: true
    };

    let settings = { ...defaultSettings };
    let hasChanges = false;

    // ================================
    // UI Functions
    // ================================
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        container.appendChild(toast);
        
        toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function switchSection(sectionId) {
        // Update nav
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });
        
        // Update sections
        document.querySelectorAll('.settings-section').forEach(section => {
            const id = section.id.replace('section-', '');
            section.hidden = id !== sectionId;
        });
    }

    function loadSettingsToUI() {
        // Profile
        document.getElementById('firstName').value = settings.firstName;
        document.getElementById('lastName').value = settings.lastName;
        document.getElementById('email').value = settings.email;
        document.getElementById('phone').value = settings.phone;
        document.getElementById('bio').value = settings.bio;
        updateProfileHeader();
        
        // Appearance
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.themeOption === settings.theme);
        });
        document.getElementById('compactSidebar').checked = settings.compactSidebar;
        document.getElementById('animations').checked = settings.animations;
        document.getElementById('fontSize').value = settings.fontSize;
        
        // Notifications
        document.getElementById('emailNotifications').checked = settings.emailNotifications;
        document.getElementById('orderNotifications').checked = settings.orderNotifications;
        document.getElementById('stockNotifications').checked = settings.stockNotifications;
        document.getElementById('userNotifications').checked = settings.userNotifications;
        document.getElementById('reviewNotifications').checked = settings.reviewNotifications;
        document.getElementById('soundNotifications').checked = settings.soundNotifications;
        
        // Security
        document.getElementById('loginAlerts').checked = settings.loginAlerts;
        document.getElementById('actionLog').checked = settings.actionLog;
        
        // Store
        document.getElementById('storeName').value = settings.storeName;
        document.getElementById('storeDescription').value = settings.storeDescription;
        document.getElementById('currency').value = settings.currency;
        document.getElementById('timezone').value = settings.timezone;
        document.getElementById('storeEmail').value = settings.storeEmail;
        document.getElementById('storePhone').value = settings.storePhone;
        document.getElementById('storeAddress').value = settings.storeAddress;
        
        // Payments
        document.getElementById('stripeEnabled').checked = settings.stripeEnabled;
        document.getElementById('paypalEnabled').checked = settings.paypalEnabled;
        document.getElementById('bankEnabled').checked = settings.bankEnabled;
        document.getElementById('cashEnabled').checked = settings.cashEnabled;
        
        // Shipping
        document.getElementById('freeShipping').checked = settings.freeShipping;
        document.getElementById('freeShippingMin').value = settings.freeShippingMin;
        document.getElementById('standardShipping').value = settings.standardShipping;
        document.getElementById('expressShipping').value = settings.expressShipping;
        document.getElementById('nationalShipping').checked = settings.nationalShipping;
        
        // Advanced
        document.getElementById('maintenanceMode').checked = settings.maintenanceMode;
        document.getElementById('debugMode').checked = settings.debugMode;
        document.getElementById('cacheEnabled').checked = settings.cacheEnabled;
        document.getElementById('gzipEnabled').checked = settings.gzipEnabled;
    }

    function collectSettingsFromUI() {
        settings = {
            // Profile
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            bio: document.getElementById('bio').value,
            
            // Appearance
            theme: document.querySelector('.theme-option.active')?.dataset.themeOption || 'light',
            compactSidebar: document.getElementById('compactSidebar').checked,
            animations: document.getElementById('animations').checked,
            fontSize: document.getElementById('fontSize').value,
            
            // Notifications
            emailNotifications: document.getElementById('emailNotifications').checked,
            orderNotifications: document.getElementById('orderNotifications').checked,
            stockNotifications: document.getElementById('stockNotifications').checked,
            userNotifications: document.getElementById('userNotifications').checked,
            reviewNotifications: document.getElementById('reviewNotifications').checked,
            soundNotifications: document.getElementById('soundNotifications').checked,
            
            // Security
            loginAlerts: document.getElementById('loginAlerts').checked,
            actionLog: document.getElementById('actionLog').checked,
            
            // Store
            storeName: document.getElementById('storeName').value,
            storeDescription: document.getElementById('storeDescription').value,
            currency: document.getElementById('currency').value,
            timezone: document.getElementById('timezone').value,
            storeEmail: document.getElementById('storeEmail').value,
            storePhone: document.getElementById('storePhone').value,
            storeAddress: document.getElementById('storeAddress').value,
            
            // Payments
            stripeEnabled: document.getElementById('stripeEnabled').checked,
            paypalEnabled: document.getElementById('paypalEnabled').checked,
            bankEnabled: document.getElementById('bankEnabled').checked,
            cashEnabled: document.getElementById('cashEnabled').checked,
            
            // Shipping
            freeShipping: document.getElementById('freeShipping').checked,
            freeShippingMin: parseInt(document.getElementById('freeShippingMin').value),
            standardShipping: parseInt(document.getElementById('standardShipping').value),
            expressShipping: parseInt(document.getElementById('expressShipping').value),
            nationalShipping: document.getElementById('nationalShipping').checked,
            
            // Advanced
            maintenanceMode: document.getElementById('maintenanceMode').checked,
            debugMode: document.getElementById('debugMode').checked,
            cacheEnabled: document.getElementById('cacheEnabled').checked,
            gzipEnabled: document.getElementById('gzipEnabled').checked
        };
    }

    function updateProfileHeader() {
        const name = `${settings.firstName} ${settings.lastName}`.trim() || 'Administrador';
        const initials = `${(settings.firstName || 'A')[0]}${(settings.lastName || '')[0] || ''}`.toUpperCase();
        
        document.getElementById('profileAvatar').textContent = initials;
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileEmail').textContent = settings.email;
        
        // Update sidebar and header
        document.querySelectorAll('.sidebar-user-avatar, .header-user-avatar').forEach(el => {
            el.textContent = initials[0];
        });
        document.querySelector('.sidebar-user-name').textContent = name;
        document.querySelector('.header-user-name').textContent = name;
    }

    function applyTheme(theme) {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        const icon = document.querySelector('#themeToggle i');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        localStorage.setItem('theme', theme);
    }

    // ================================
    // API Functions
    // ================================
    async function saveSettings() {
        collectSettingsFromUI();
        
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                },
                body: JSON.stringify(settings)
            });
            
            if (!response.ok) throw new Error('Save failed');
            
            showToast('Configuración guardada correctamente', 'success');
            hasChanges = false;
        } catch (error) {
            console.warn('Saving locally:', error.message);
            localStorage.setItem('adminSettings', JSON.stringify(settings));
            showToast('Configuración guardada localmente', 'success');
            hasChanges = false;
        }
        
        // Apply theme immediately
        applyTheme(settings.theme);
        updateProfileHeader();
    }

    async function loadSettings() {
        try {
            const response = await fetch('/api/admin/settings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                }
            });
            
            if (!response.ok) throw new Error('Load failed');
            
            const data = await response.json();
            settings = { ...defaultSettings, ...data };
        } catch (error) {
            console.warn('Loading local settings:', error.message);
            const saved = localStorage.getItem('adminSettings');
            if (saved) {
                settings = { ...defaultSettings, ...JSON.parse(saved) };
            }
        }
        
        loadSettingsToUI();
        applyTheme(settings.theme);
    }

    function resetSettings() {
        if (confirm('¿Estás seguro de que deseas restablecer toda la configuración? Esta acción no se puede deshacer.')) {
            settings = { ...defaultSettings };
            loadSettingsToUI();
            applyTheme(settings.theme);
            localStorage.removeItem('adminSettings');
            showToast('Configuración restablecida', 'warning');
            hasChanges = false;
        }
    }

    function clearCache() {
        // Clear localStorage cache
        const keysToKeep = ['adminToken', 'adminSettings', 'theme'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        showToast('Caché limpiada correctamente', 'success');
    }

    // ================================
    // Event Handlers
    // ================================
    function setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
        
        // Theme toggle button (quick toggle)
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            settings.theme = newTheme;
            
            // Update theme options UI
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.themeOption === newTheme);
            });
            
            hasChanges = true;
        });
        
        // User dropdown
        document.getElementById('userDropdown')?.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            document.getElementById('userDropdown')?.classList.remove('active');
        });
        
        // Settings navigation
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                switchSection(item.dataset.section);
            });
        });
        
        // Theme options
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                applyTheme(opt.dataset.themeOption);
                hasChanges = true;
            });
        });
        
        // Save button
        document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
        
        // Reset button
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            if (hasChanges) {
                loadSettingsToUI();
                showToast('Cambios descartados', 'info');
                hasChanges = false;
            }
        });
        
        // Clear cache button
        document.getElementById('clearCacheBtn')?.addEventListener('click', clearCache);
        
        // Reset all settings button
        document.getElementById('resetSettingsBtn')?.addEventListener('click', resetSettings);
        
        // Avatar upload
        document.getElementById('avatarUpload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('profileAvatar').style.backgroundImage = `url(${e.target.result})`;
                    document.getElementById('profileAvatar').textContent = '';
                    document.getElementById('profileAvatar').style.backgroundSize = 'cover';
                    showToast('Imagen de perfil actualizada', 'success');
                    hasChanges = true;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Track changes
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', () => {
                hasChanges = true;
            });
        });
        
        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
        
        // Profile name change updates header
        document.getElementById('firstName')?.addEventListener('input', () => {
            settings.firstName = document.getElementById('firstName').value;
            updateProfileHeader();
        });
        
        document.getElementById('lastName')?.addEventListener('input', () => {
            settings.lastName = document.getElementById('lastName').value;
            updateProfileHeader();
        });
        
        document.getElementById('email')?.addEventListener('input', () => {
            settings.email = document.getElementById('email').value;
            updateProfileHeader();
        });
    }

    // ================================
    // Initialization
    // ================================
    async function init() {
        // Load saved theme immediately
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        
        setupEventListeners();
        await loadSettings();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
