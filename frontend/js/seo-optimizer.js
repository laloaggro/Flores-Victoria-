/* ========================================
   OPTIMIZACIONES SEO AUTOMÁTICAS
   - Meta tags dinámicos
   - Structured Data (JSON-LD)
   - Sitemap automático
   - Alt texts inteligentes
   ======================================== */

class SEOOptimizer {
    constructor() {
        this.siteConfig = {
            siteName: 'Arreglos Victoria',
            siteUrl: 'https://arreglosvictoria.cl',
            description: 'Florería familiar en Recoleta con más de 20 años de experiencia. Flores naturales y arreglos florales para todas las ocasiones.',
            image: '/images/og-image.jpg',
            logo: '/images/logo.png',
            phone: '+56 2 1234 5678',
            address: 'Av. Recoleta 1234, Santiago, Chile',
            businessHours: 'Mo-Su 09:00-21:00',
            priceRange: '$$'
        };
        
        this.init();
    }

    init() {
        this.addStructuredData();
        this.optimizeMetaTags();
        this.generateBreadcrumbs();
        this.optimizeImages();
        this.setupSocialSharing();
    }

    addStructuredData() {
        // Datos estructurados de la empresa local
        const localBusiness = {
            "@context": "https://schema.org",
            "@type": "Florist",
            "name": this.siteConfig.siteName,
            "description": this.siteConfig.description,
            "url": this.siteConfig.siteUrl,
            "logo": this.siteConfig.siteUrl + this.siteConfig.logo,
            "image": this.siteConfig.siteUrl + this.siteConfig.image,
            "telephone": this.siteConfig.phone,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Recoleta 1234",
                "addressLocality": "Santiago",
                "addressRegion": "Región Metropolitana",
                "postalCode": "8420000",
                "addressCountry": "CL"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": -33.4372,
                "longitude": -70.6506
            },
            "openingHours": this.siteConfig.businessHours,
            "priceRange": this.siteConfig.priceRange,
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": -33.4372,
                    "longitude": -70.6506
                },
                "geoRadius": "50000"
            }
        };

        // Datos de la página específica
        const currentPage = this.getCurrentPageType();
        let pageStructuredData = null;

        switch (currentPage.type) {
            case 'product':
                pageStructuredData = this.generateProductSchema(currentPage.data);
                break;
            case 'article':
                pageStructuredData = this.generateArticleSchema(currentPage.data);
                break;
            case 'catalog':
                pageStructuredData = this.generateCatalogSchema();
                break;
        }

        // Insertar JSON-LD
        this.insertJSONLD('local-business', localBusiness);
        if (pageStructuredData) {
            this.insertJSONLD('page-data', pageStructuredData);
        }
    }

    getCurrentPageType() {
        const path = window.location.pathname;
        const title = document.title;
        
        if (path.includes('product') || path.includes('catalog')) {
            return { type: 'product', data: this.extractProductData() };
        } else if (path.includes('blog') || path.includes('article')) {
            return { type: 'article', data: this.extractArticleData() };
        } else if (path.includes('catalog')) {
            return { type: 'catalog', data: {} };
        }
        
        return { type: 'page', data: {} };
    }

    generateProductSchema(productData) {
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": productData.name || document.title,
            "description": productData.description || this.extractMetaDescription(),
            "image": productData.images || this.extractPageImages(),
            "brand": {
                "@type": "Brand",
                "name": this.siteConfig.siteName
            },
            "offers": {
                "@type": "Offer",
                "priceCurrency": "CLP",
                "price": productData.price || "0",
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": "Organization",
                    "name": this.siteConfig.siteName
                }
            },
            "category": "Arreglos Florales"
        };
    }

    generateCatalogSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Catálogo de Arreglos Florales",
            "description": "Descubre nuestra colección completa de hermosos arreglos florales para cada ocasión especial",
            "url": window.location.href,
            "mainEntity": {
                "@type": "ItemList",
                "name": "Arreglos Florales",
                "description": "Colección de arreglos florales premium",
                "numberOfItems": this.countProducts()
            }
        };
    }

    optimizeMetaTags() {
        // Title tag dinámico
        this.optimizeTitle();
        
        // Meta description
        this.optimizeMetaDescription();
        
        // Open Graph tags
        this.addOpenGraphTags();
        
        // Twitter Card tags
        this.addTwitterCardTags();
        
        // Canonical URL
        this.addCanonicalURL();
        
        // Hreflang (para futuro soporte multiidioma)
        this.addHreflang();
    }

    optimizeTitle() {
        const currentTitle = document.title;
        const siteName = this.siteConfig.siteName;
        
        if (!currentTitle.includes(siteName)) {
            document.title = `${currentTitle} | ${siteName}`;
        }
        
        // Verificar longitud óptima (50-60 caracteres)
        if (document.title.length > 60) {
            const shortTitle = currentTitle.substring(0, 45) + '...' + ` | ${siteName}`;
            document.title = shortTitle;
        }
    }

    optimizeMetaDescription() {
        let description = this.extractMetaDescription();
        
        if (!description || description.length < 120) {
            description = this.generateSmartDescription();
        }
        
        // Verificar longitud óptima (150-160 caracteres)
        if (description.length > 160) {
            description = description.substring(0, 157) + '...';
        }
        
        this.updateMetaTag('description', description);
    }

    generateSmartDescription() {
        const h1 = document.querySelector('h1');
        const firstP = document.querySelector('main p, article p');
        
        let description = this.siteConfig.description;
        
        if (h1 && firstP) {
            description = `${h1.textContent}. ${firstP.textContent}`.substring(0, 160);
        }
        
        return description;
    }

    addOpenGraphTags() {
        const ogTags = {
            'og:title': document.title,
            'og:description': this.extractMetaDescription(),
            'og:url': window.location.href,
            'og:type': 'website',
            'og:site_name': this.siteConfig.siteName,
            'og:image': this.getPageImage(),
            'og:locale': 'es_CL'
        };
        
        Object.entries(ogTags).forEach(([property, content]) => {
            this.updateMetaProperty(property, content);
        });
    }

    addTwitterCardTags() {
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': document.title,
            'twitter:description': this.extractMetaDescription(),
            'twitter:image': this.getPageImage()
        };
        
        Object.entries(twitterTags).forEach(([name, content]) => {
            this.updateMetaTag(name, content);
        });
    }

    generateBreadcrumbs() {
        const path = window.location.pathname;
        const breadcrumbs = this.parseBreadcrumbs(path);
        
        if (breadcrumbs.length > 1) {
            const breadcrumbSchema = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumbs.map((crumb, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": crumb.name,
                    "item": this.siteConfig.siteUrl + crumb.url
                }))
            };
            
            this.insertJSONLD('breadcrumbs', breadcrumbSchema);
            this.createBreadcrumbHTML(breadcrumbs);
        }
    }

    parseBreadcrumbs(path) {
        const segments = path.split('/').filter(Boolean);
        const breadcrumbs = [{ name: 'Inicio', url: '/' }];
        
        const pathMap = {
            'pages': 'Páginas',
            'products': 'Productos',
            'catalog': 'Catálogo',
            'contact': 'Contacto',
            'about': 'Nosotros'
        };
        
        let currentPath = '';
        segments.forEach(segment => {
            currentPath += '/' + segment;
            const name = pathMap[segment] || this.capitalizeFirst(segment.replace('-', ' '));
            breadcrumbs.push({ name, url: currentPath });
        });
        
        return breadcrumbs;
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Generar alt text si falta
            if (!img.alt) {
                img.alt = this.generateAltText(img);
            }
            
            // Añadir loading lazy si no está presente
            if (!img.loading) {
                img.loading = 'lazy';
            }
            
            // Verificar dimensiones
            if (!img.width || !img.height) {
                img.style.aspectRatio = '16/9'; // Ratio por defecto
            }
        });
    }

    generateAltText(img) {
        const src = img.src;
        const filename = src.split('/').pop().split('.')[0];
        const pageTitle = document.title;
        
        // Lógica inteligente para generar alt text
        if (filename.includes('logo')) {
            return `Logo de ${this.siteConfig.siteName}`;
        } else if (filename.includes('product') || filename.includes('ramo')) {
            return `Arreglo floral - ${this.siteConfig.siteName}`;
        } else {
            return `Imagen relacionada con ${pageTitle}`;
        }
    }

    // Métodos auxiliares
    extractMetaDescription() {
        const meta = document.querySelector('meta[name="description"]');
        return meta ? meta.content : '';
    }

    extractPageImages() {
        const images = Array.from(document.querySelectorAll('img[src]'));
        return images.map(img => this.siteConfig.siteUrl + img.src);
    }

    getPageImage() {
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) return ogImage.content;
        
        const firstImg = document.querySelector('main img, article img');
        if (firstImg) return this.siteConfig.siteUrl + firstImg.src;
        
        return this.siteConfig.siteUrl + this.siteConfig.image;
    }

    countProducts() {
        return document.querySelectorAll('.product-card, [class*="product"]').length;
    }

    insertJSONLD(id, data) {
        let script = document.getElementById(id);
        if (!script) {
            script = document.createElement('script');
            script.id = id;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(data, null, 2);
    }

    updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    updateMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.property = property;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    addCanonicalURL() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = window.location.href.split('?')[0];
    }

    addHreflang() {
        let hreflang = document.querySelector('link[rel="alternate"][hreflang="es"]');
        if (!hreflang) {
            hreflang = document.createElement('link');
            hreflang.rel = 'alternate';
            hreflang.hreflang = 'es';
            hreflang.href = window.location.href;
            document.head.appendChild(hreflang);
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    extractProductData() {
        // Extraer datos del producto de la página
        const name = document.querySelector('h1')?.textContent || '';
        const price = document.querySelector('[class*="price"]')?.textContent?.replace(/[^0-9]/g, '') || '0';
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
        
        return { name, price, description, images };
    }

    extractArticleData() {
        return {
            title: document.querySelector('h1')?.textContent || '',
            description: document.querySelector('meta[name="description"]')?.content || '',
            publishDate: new Date().toISOString(),
            author: this.siteConfig.siteName
        };
    }

    setupSocialSharing() {
        // Configurar botones de compartir si existen
        const shareButtons = document.querySelectorAll('[data-share]');
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = button.dataset.share;
                this.shareToSocial(platform);
            });
        });
    }

    shareToSocial(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const description = encodeURIComponent(this.extractMetaDescription());
        
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            whatsapp: `https://wa.me/?text=${title} ${url}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${description}`
        };
        
        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    new SEOOptimizer();
});

export { SEOOptimizer };