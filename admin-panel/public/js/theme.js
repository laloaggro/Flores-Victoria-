/**
 * Theme System - Dark/Light Mode with Persistence
 */

class ThemeSystem {
    constructor() {
        this.themes = {
            light: {
                name: 'light',
                '--primary': '#667eea',
                '--primary-dark': '#764ba2',
                '--secondary': '#11998e',
                '--secondary-light': '#38ef7d',
                '--danger': '#eb3349',
                '--warning': '#f2994a',
                '--success': '#4ade80',
                '--dark': '#1e1e1e',
                '--light': '#f9fafb',
                '--bg-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '--bg-body': '#f9fafb',
                '--text-primary': '#333',
                '--text-secondary': '#666',
                '--card-bg': '#ffffff',
                '--border-color': '#e1e8ed',
                '--shadow': '0 10px 30px rgba(0,0,0,0.1)',
                '--shadow-lg': '0 20px 60px rgba(0,0,0,0.15)'
            },
            dark: {
                name: 'dark',
                '--primary': '#8b5cf6',
                '--primary-dark': '#7c3aed',
                '--secondary': '#14b8a6',
                '--secondary-light': '#2dd4bf',
                '--danger': '#ef4444',
                '--warning': '#f59e0b',
                '--success': '#10b981',
                '--dark': '#0f172a',
                '--light': '#1e293b',
                '--bg-primary': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                '--bg-body': '#0f172a',
                '--text-primary': '#f1f5f9',
                '--text-secondary': '#cbd5e1',
                '--card-bg': '#1e293b',
                '--border-color': '#334155',
                '--shadow': '0 10px 30px rgba(0,0,0,0.5)',
                '--shadow-lg': '0 20px 60px rgba(0,0,0,0.7)'
            }
        };

        this.currentTheme = this.loadTheme();
        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        this.applyTheme(this.currentTheme);
        this.createToggleButton();
    }

    /**
     * Load theme from localStorage
     * @returns {string}
     */
    loadTheme() {
        const saved = localStorage.getItem('theme');
        
        if (saved && this.themes[saved]) {
            return saved;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    /**
     * Save theme to localStorage
     * @param {string} theme 
     */
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    /**
     * Apply theme to document
     * @param {string} themeName 
     */
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        
        if (!theme) {
            console.error('Theme not found:', themeName);
            return;
        }

        // Apply CSS variables
        const root = document.documentElement;
        
        Object.entries(theme).forEach(([key, value]) => {
            if (key !== 'name') {
                root.style.setProperty(key, value);
            }
        });

        // Update body gradient background
        document.body.style.background = theme['--bg-primary'];

        // Update data attribute for CSS selectors
        document.documentElement.setAttribute('data-theme', themeName);

        this.currentTheme = themeName;
        this.saveTheme(themeName);

        // Update toggle button if it exists
        this.updateToggleButton();
    }

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Add animation effect
        document.body.style.transition = 'background 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
    }

    /**
     * Create theme toggle button
     */
    createToggleButton() {
        const button = document.createElement('button');
        button.id = 'themeToggle';
        button.className = 'theme-toggle-btn';
        button.setAttribute('aria-label', 'Toggle theme');
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .theme-toggle-btn {
                position: fixed;
                bottom: 20px;
                right: 80px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: var(--card-bg);
                border: 2px solid var(--border-color);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
                box-shadow: var(--shadow);
                z-index: 9998;
            }

            .theme-toggle-btn:hover {
                transform: translateY(-3px);
                box-shadow: var(--shadow-lg);
            }

            .theme-toggle-btn i {
                transition: all 0.3s ease;
                color: var(--text-primary);
            }

            .theme-toggle-btn:active {
                transform: translateY(0);
            }

            /* Dark theme specific styles */
            [data-theme="dark"] .stat-card,
            [data-theme="dark"] .card {
                background: var(--card-bg);
                color: var(--text-primary);
            }

            [data-theme="dark"] .stat-card h3,
            [data-theme="dark"] .card h2 {
                color: var(--text-primary);
            }

            [data-theme="dark"] .stat-card p,
            [data-theme="dark"] .card p {
                color: var(--text-secondary);
            }

            [data-theme="dark"] .card-list a {
                background: var(--light);
                color: var(--text-primary);
            }

            [data-theme="dark"] .card-list a:hover {
                background: var(--dark);
            }

            [data-theme="dark"] .status-item {
                background: var(--light);
                color: var(--text-primary);
            }

            [data-theme="dark"] header {
                background: var(--card-bg);
            }

            [data-theme="dark"] header h1 {
                color: var(--primary);
            }

            [data-theme="dark"] header p {
                color: var(--text-secondary);
            }

            [data-theme="dark"] .user-btn {
                background: var(--light);
                border-color: var(--border-color);
                color: var(--text-primary);
            }

            [data-theme="dark"] .user-dropdown {
                background: var(--card-bg);
            }

            [data-theme="dark"] .user-dropdown-item {
                color: var(--text-primary);
            }

            [data-theme="dark"] .user-dropdown-item:hover {
                background: var(--light);
            }

            @media (max-width: 768px) {
                .theme-toggle-btn {
                    bottom: 80px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);

        // Add click handler
        button.addEventListener('click', () => {
            this.toggle();
        });

        // Add to document
        document.body.appendChild(button);

        // Initial update
        this.updateToggleButton();
    }

    /**
     * Update toggle button icon
     */
    updateToggleButton() {
        const button = document.getElementById('themeToggle');
        
        if (!button) {
            return;
        }

        const isDark = this.currentTheme === 'dark';
        
        button.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        
        button.title = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
    }

    /**
     * Get current theme name
     * @returns {string}
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Check if dark mode is active
     * @returns {boolean}
     */
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
}

// Create and export theme system instance
const themeSystem = new ThemeSystem();

// Make it globally available
if (typeof window !== 'undefined') {
    window.themeSystem = themeSystem;
}

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            themeSystem.applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}
