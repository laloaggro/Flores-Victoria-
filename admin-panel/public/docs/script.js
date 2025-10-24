// Flores Victoria - Documentation Interactive Scripts

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle?.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}

// Navigation & Section Management
const navLinks = document.querySelectorAll('.sidebar-nav a[data-section]');
const sections = document.querySelectorAll('.doc-section');

// Set initial active section from URL hash or default to overview
const initialSection = window.location.hash.slice(1) || 'overview';
showSection(initialSection);

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Update URL hash
        window.location.hash = targetSection;
        
        // Show section
        showSection(targetSection);
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
    
    // Update active nav link
    navLinks.forEach(link => {
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Handle browser back/forward
window.addEventListener('hashchange', () => {
    const section = window.location.hash.slice(1) || 'overview';
    showSection(section);
});

// Copy Code Functionality
const copyButtons = document.querySelectorAll('.copy-btn');

copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const targetId = button.getAttribute('data-clipboard-target');
        const codeElement = document.querySelector(targetId);
        
        if (!codeElement) return;
        
        const code = codeElement.textContent;
        
        try {
            await navigator.clipboard.writeText(code);
            
            // Visual feedback
            const originalText = button.textContent;
            button.textContent = '✓ Copiado';
            button.style.background = 'rgba(76, 175, 80, 0.3)';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            button.textContent = '✗ Error';
            setTimeout(() => {
                button.textContent = 'Copiar';
            }, 2000);
        }
    });
});

// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if it's a navigation link (handled above)
        if (this.hasAttribute('data-section')) return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Search Functionality (simple client-side)
function initSearch() {
    const searchInput = document.getElementById('docs-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        if (query.length < 2) {
            clearSearchResults();
            return;
        }
        
        searchContent(query);
    });
}

function searchContent(query) {
    const results = [];
    
    sections.forEach(section => {
        const title = section.querySelector('h2')?.textContent || '';
        const content = section.textContent.toLowerCase();
        
        if (content.includes(query)) {
            results.push({
                section: section.id,
                title: title,
                snippet: getSnippet(section.textContent, query)
            });
        }
    });
    
    displaySearchResults(results);
}

function getSnippet(text, query) {
    const index = text.toLowerCase().indexOf(query);
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + 100);
    return '...' + text.slice(start, end) + '...';
}

function displaySearchResults(results) {
    // Implementation for search results display
    console.log('Search results:', results);
}

function clearSearchResults() {
    // Clear search results
}

// Table of Contents Generator
function generateTOC() {
    const activeSection = document.querySelector('.doc-section.active');
    if (!activeSection) return;
    
    const headings = activeSection.querySelectorAll('h3, h4');
    const tocContainer = document.getElementById('toc');
    
    if (!tocContainer || headings.length === 0) return;
    
    tocContainer.innerHTML = '<h4>En esta página:</h4><ul></ul>';
    const list = tocContainer.querySelector('ul');
    
    headings.forEach((heading, index) => {
        const id = heading.id || `heading-${index}`;
        if (!heading.id) heading.id = id;
        
        const li = document.createElement('li');
        li.className = heading.tagName.toLowerCase();
        
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = heading.textContent;
        
        li.appendChild(a);
        list.appendChild(li);
    });
}

// Highlight active section in TOC based on scroll
function highlightActiveTOC() {
    const headings = document.querySelectorAll('.doc-section.active h3, .doc-section.active h4');
    const tocLinks = document.querySelectorAll('#toc a');
    
    let currentActive = null;
    
    headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100 && rect.top >= -100) {
            currentActive = heading.id;
        }
    });
    
    tocLinks.forEach(link => {
        const href = link.getAttribute('href').slice(1);
        if (href === currentActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('docs-search')?.focus();
    }
    
    // Esc to close search
    if (e.key === 'Escape') {
        clearSearchResults();
        document.getElementById('docs-search')?.blur();
    }
});

// Print-friendly formatting
window.addEventListener('beforeprint', () => {
    // Show all sections when printing
    sections.forEach(section => {
        section.style.display = 'block';
    });
});

window.addEventListener('afterprint', () => {
    // Restore normal display
    sections.forEach(section => {
        if (!section.classList.contains('active')) {
            section.style.display = 'none';
        }
    });
});

// Analytics (placeholder for future implementation)
function trackPageView(section) {
    // Send analytics event
    console.log('Page view:', section);
}

// Code Syntax Highlighting (using highlight.js if available)
function initSyntaxHighlighting() {
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
}

// External Link Handler
document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
});

// Lazy Load Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Performance monitoring
const perfData = {
    pageLoad: performance.now(),
    interactions: 0
};

document.addEventListener('click', () => {
    perfData.interactions++;
});

// Accessibility: Skip to content
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Saltar al contenido';
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    generateTOC();
    initSyntaxHighlighting();
    initLazyLoading();
    addSkipLink();
    
    // Track initial page view
    trackPageView(window.location.hash.slice(1) || 'overview');
});

// Scroll listener for TOC highlighting
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(highlightActiveTOC, 50);
});

// Export for debugging
window.docsApp = {
    showSection,
    generateTOC,
    perfData
};

console.log('%c📚 Flores Victoria Documentation', 'font-size: 20px; font-weight: bold; color: #E91E63;');
console.log('%cDocumentación cargada correctamente', 'color: #4CAF50;');
console.log('Atajos de teclado:', {
    'Ctrl/Cmd + K': 'Buscar',
    'Esc': 'Cerrar búsqueda'
});
