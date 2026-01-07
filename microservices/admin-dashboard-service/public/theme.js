/**
 * Theme System - Dark/Light Mode with Persistence
 * Root-level theme.js for index.html and dashboard pages
 * Version: 1.0.0
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
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    /**
     * Load theme from localStorage
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
     */
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    /**
     * Apply theme to document
     */
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        
        if (!theme) {
            console.error('Theme not found:', themeName);
            return;
        }

        // Apply CSS variables
        Object.entries(theme).forEach(([key, value]) => {
            if (key.startsWith('--')) {
                document.documentElement.style.setProperty(key, value);
            }
        });

        // Update body class
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${themeName}`);
        
        // Update data attribute
        document.documentElement.setAttribute('data-theme', themeName);
        document.body.setAttribute('data-theme', themeName);

        this.currentTheme = themeName;
        this.saveTheme(themeName);
        this.updateToggleButton();

        console.log('🎨 Theme applied:', themeName);
    }

    /**
     * Toggle between light and dark
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    /**
     * Create theme toggle button
     */
    createToggleButton() {
        // Don't create if already exists
        if (document.getElementById('theme-toggle-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'theme-toggle-btn';
        btn.className = 'theme-toggle-btn';
        btn.title = 'Cambiar tema';
        btn.innerHTML = this.currentTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        
        btn.addEventListener('click', () => this.toggle());
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .theme-toggle-btn {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: var(--primary, #667eea);
                color: white;
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 9998;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .theme-toggle-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
            
            .theme-toggle-btn:active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(btn);
    }

    /**
     * Update toggle button icon
     */
    updateToggleButton() {
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.innerHTML = this.currentTheme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
    }

    /**
     * Get current theme name
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Check if current theme is dark
     */
    isDark() {
        return this.currentTheme === 'dark';
    }
}

// Initialize global theme system
const theme = new ThemeSystem();

// Export for global access
if (typeof window !== 'undefined') {
    window.theme = theme;
    window.ThemeSystem = ThemeSystem;
}

console.log('✅ Theme system loaded');
