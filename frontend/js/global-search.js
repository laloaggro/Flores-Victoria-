/**
 * Global Search Component
 * Componente de búsqueda global para Flores Victoria
 */

// Initialize search overlay when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    createSearchOverlay();
    attachSearchListeners();
});

// Create search overlay HTML
function createSearchOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'global-search-overlay';
    overlay.id = 'search-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Búsqueda del sitio');
    
    overlay.innerHTML = `
        <div class="search-modal">
            <button class="search-close" aria-label="Cerrar búsqueda" onclick="toggleSearch()">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="search-header">
                <h2>🔍 Buscar en Flores Victoria</h2>
                <p>Encuentra productos, artículos del blog y más</p>
            </div>
            
            <form class="search-form" onsubmit="return handleSearchSubmit(event)">
                <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                        type="search" 
                        id="global-search-input" 
                        placeholder="Buscar productos, artículos, información..."
                        aria-label="Campo de búsqueda"
                        autocomplete="off"
                    >
                    <button type="submit" class="search-submit">Buscar</button>
                </div>
            </form>
            
            <div class="search-suggestions">
                <h3>Búsquedas Populares</h3>
                <div class="suggestion-tags">
                    <a href="/pages/products.html?category=rosas" class="tag-link">🌹 Rosas</a>
                    <a href="/pages/products.html?category=bouquets" class="tag-link">💐 Bouquets</a>
                    <a href="/pages/products.html?category=arrangements" class="tag-link">🎀 Arreglos</a>
                    <a href="/pages/products.html?category=gifts" class="tag-link">🎁 Regalos</a>
                    <a href="/pages/products.html?occasion=wedding" class="tag-link">💒 Bodas</a>
                    <a href="/pages/products.html?occasion=birthday" class="tag-link">🎂 Cumpleaños</a>
                </div>
            </div>
            
            <div class="quick-links">
                <h3>Accesos Rápidos</h3>
                <div class="quick-links-grid">
                    <a href="/pages/products.html" class="quick-link">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Productos</span>
                    </a>
                    <a href="/pages/gallery.html" class="quick-link">
                        <i class="fas fa-images"></i>
                        <span>Galería</span>
                    </a>
                    <a href="/pages/blog.html" class="quick-link">
                        <i class="fas fa-newspaper"></i>
                        <span>Blog</span>
                    </a>
                    <a href="/pages/contact.html" class="quick-link">
                        <i class="fas fa-envelope"></i>
                        <span>Contacto</span>
                    </a>
                </div>
            </div>
            
            <div id="search-results" class="search-results" style="display: none;">
                <!-- Los resultados se cargan dinámicamente aquí -->
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Attach event listeners
function attachSearchListeners() {
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('search-overlay');
            if (overlay && overlay.classList.contains('active')) {
                toggleSearch();
            }
        }
    });
    
    // Click outside to close
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                toggleSearch();
            }
        });
    }
    
    // Ctrl+K or Cmd+K to open search
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleSearch();
        }
    });
}

// Toggle search overlay
function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    
    const isActive = overlay.classList.toggle('active');
    overlay.setAttribute('aria-hidden', !isActive);
    
    if (isActive) {
        const input = document.getElementById('global-search-input');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Handle search form submission
function handleSearchSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('global-search-input');
    const query = input ? input.value.trim() : '';
    
    if (query) {
        performSiteSearch(query);
    }
    
    return false;
}

// Perform site search
function performSiteSearch(query) {
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv) return;
    
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Buscando...</p>';
    
    // Simulación de resultados (en producción, esto sería una API call)
    setTimeout(() => {
        const mockResults = [
            { title: 'Bouquet de Rosas Premium', url: '/pages/products.html', type: 'Producto' },
            { title: 'Guía de Cuidado de Flores', url: '/pages/blog.html', type: 'Blog' },
            { title: 'Arreglos para Bodas', url: '/pages/products.html?occasion=wedding', type: 'Producto' },
            { title: 'Galería de Diseños', url: '/pages/gallery.html', type: 'Galería' }
        ];
        
        resultsDiv.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: #2d5016;">Resultados para "${query}"</h3>
            ${mockResults.map(result => `
                <a href="${result.url}" style="display: block; padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 0.5rem; text-decoration: none; color: #333; transition: background 0.2s;">
                    <div style="font-weight: 600; color: #2d5016;">${result.title}</div>
                    <div style="font-size: 0.75rem; color: #999; margin-top: 0.25rem;">${result.type}</div>
                </a>
            `).join('')}
            <p style="text-align: center; margin-top: 1.5rem;">
                <a href="https://www.google.com/search?q=site:flores-victoria.com ${encodeURIComponent(query)}" target="_blank" rel="noopener" style="color: #2d5016; text-decoration: underline;">Ver más resultados en Google →</a>
            </p>
        `;
    }, 500);
}

// Make functions globally available
window.toggleSearch = toggleSearch;
window.handleSearchSubmit = handleSearchSubmit;
