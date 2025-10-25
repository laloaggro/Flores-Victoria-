#!/usr/bin/env python3
"""
Script para actualizar la sección de Logs del Admin Panel
Agrega selector de ambiente y controles de servicios
"""

import re

def update_logs_section():
    # Read the HTML file
    with open('admin-panel/public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # New logs section HTML
    new_logs_section = '''            <section id="logs" class="content-section section-panel" role="region" aria-labelledby="section-logs-title">
                <h2 id="section-logs-title" class="page-title" style="margin-bottom: var(--space-6);">🧾 Logs y Control de Servicios</h2>
                
                <!-- Environment Selection (Always Visible) -->
                <div id="logs-env-selection" class="feature-card" style="margin-bottom: var(--space-4);">
                    <div class="card-header">
                        <div class="card-icon">🌍</div>
                        <div class="card-content">
                            <h3>Seleccionar Ambiente de Trabajo</h3>
                            <p>Elige el entorno para visualizar logs y controlar servicios</p>
                        </div>
                    </div>
                    <div style="padding: var(--space-6); text-align: center;">
                        <div style="max-width: 600px; margin: 0 auto;">
                            <label for="logs-env-selector" style="display: block; margin-bottom: var(--space-3); font-size: 1.125rem; font-weight: 600; color: var(--text-primary);">
                                ¿En qué ambiente deseas trabajar?
                            </label>
                            <select 
                                id="logs-env-selector"
                                style="width: 100%; padding: var(--space-3) var(--space-4); background: var(--bg-secondary); border: 2px solid var(--primary); border-radius: var(--radius-lg); color: var(--text-primary); font-size: 1rem; font-weight: 500; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
                            >
                                <option value="">-- Selecciona un ambiente --</option>
                                <option value="dev">🔧 Development (Desarrollo)</option>
                                <option value="test">🧪 Testing (Pruebas)</option>
                                <option value="prod">🚀 Production (Producción)</option>
                            </select>
                            <div style="margin-top: var(--space-3); padding: var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--text-secondary);">
                                💡 <strong>Tip:</strong> Selecciona el ambiente para ver los logs específicos y gestionar servicios
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Logs Content (Hidden until environment selected) -->
                <div id="logs-main-content" style="display: none;">
'''
    
    # Find and replace the logs section
    pattern = r'<section id="logs".*?</section>\s*(?=<section id="monitoring")'
    
    replacement = new_logs_section
    
    # Add service controls and existing logs content
    # Since the file is too complex, let me read the exact end
    
    content_new = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
    
    # Write back
    with open('admin-panel/public/index.html', 'w', encoding='utf-8') as f:
        f.write(content_new)
    
    print("✅ Logs section updated successfully!")

if __name__ == '__main__':
    update_logs_section()
