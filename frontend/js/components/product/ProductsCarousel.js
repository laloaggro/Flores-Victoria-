// ProductsCarousel - simple, fast, responsive carousel of products (up to 20)
import { API_ENDPOINTS } from '../../config/api.js';
import { http } from '../../utils/httpClient.js';
import { formatPrice } from '../utils/utils.js';

class ProductsCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.products = [];
  }

  connectedCallback() {
    this.renderSkeleton();
    this.loadProducts();
  }

  renderSkeleton() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; width:100%; }
        .carousel { position: relative; }
        .title { display:flex; align-items:center; justify-content:space-between; margin: 0 0 1rem; }
        .title h2 { font-size:1.5rem; margin:0; }
        .helper { color:#777; font-size:.9rem; margin:.25rem 0 1rem; }
        .track-wrapper { position: relative; overflow: hidden; }
        .track {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: 220px;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 8px 4px 12px;
          scrollbar-width: thin;
        }
        .track::-webkit-scrollbar { height: 8px; }
        .track::-webkit-scrollbar-thumb { background: #c9c9c9; border-radius: 8px; }
        .card { scroll-snap-align: start; border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff; }
        .thumb { width:100%; height:150px; object-fit:cover; display:block; }
        .info { padding:10px; }
        .name { font-size:1rem; margin:0 0 6px; color:#333; }
        .price { color:#4caf50; font-weight:700; }
        .nav { position:absolute; top:50%; transform:translateY(-50%); z-index:2; display:flex; gap:8px; width:100%; pointer-events:none; }
        .btn { pointer-events:auto; border:none; background:rgba(0,0,0,.5); color:#fff; width:36px; height:36px; border-radius:999px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .btn:hover { background:rgba(0,0,0,.7); }
        .btn[disabled] { opacity:.4; cursor:default; }
        .left { position:absolute; left:6px; }
        .right { position:absolute; right:6px; }
        @media (max-width: 480px) {
          .track { grid-auto-columns: 70%; }
        }
      </style>
      <div class="carousel">
        <div class="title">
          <h2>${this.getAttribute('title') || 'Recomendados para ti'}</h2>
          <small style="color:#666">hasta 20 productos</small>
        </div>
        <div class="helper" id="helper" aria-live="polite">Desliza para ver más →</div>
        <div class="track-wrapper">
          <div class="nav">
            <button class="btn left" aria-label="Anterior" title="Anterior" disabled>◀</button>
            <button class="btn right" aria-label="Siguiente" title="Siguiente">▶</button>
          </div>
          <div class="track" id="track" role="region" aria-roledescription="carrusel" tabindex="0" aria-label="${this.getAttribute('title') || 'Carrusel de productos'}">
            ${Array.from({ length: 6 })
              .map(() => this.skeletonCard())
              .join('')}
          </div>
        </div>
      </div>
    `;

    const left = this.shadowRoot.querySelector('.btn.left');
    const right = this.shadowRoot.querySelector('.btn.right');
    const track = this.shadowRoot.getElementById('track');
    const helper = this.shadowRoot.getElementById('helper');

    const hideHelper = () => {
      if (helper) helper.style.display = 'none';
    };
    const onAnyNav = () => {
      hideHelper();
      this.updateNavState();
    };

    left.addEventListener('click', () => {
      this.scrollBy(-1);
      onAnyNav();
    });
    right.addEventListener('click', () => {
      this.scrollBy(1);
      onAnyNav();
    });

    track.addEventListener('scroll', () => this.updateNavState());
    track.addEventListener('wheel', hideHelper, { passive: true });
    track.addEventListener('touchstart', hideHelper, { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.scrollBy(1);
        onAnyNav();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.scrollBy(-1);
        onAnyNav();
      }
    });
  }

  skeletonCard() {
    return `
      <div class="card" aria-busy="true">
        <div style="width:100%;height:150px;background:linear-gradient(90deg,#eee,#f5f5f5,#eee);animation:sh 1.2s infinite;"></div>
        <div class="info">
          <div style="height:16px;background:#eee;border-radius:4px;margin:4px 0 8px;"></div>
          <div style="height:14px;width:60%;background:#f0f0f0;border-radius:4px;"></div>
        </div>
      </div>
      <style>@keyframes sh{0%{background-position:-200px 0}100%{background-position:200px 0}}</style>
    `;
  }

  async loadProducts() {
    try {
      // Try featured first, then fallback
      const limit = parseInt(this.getAttribute('limit') || '20', 10);
      const urlFeatured = `${API_ENDPOINTS.PRODUCTS.GET_ALL}?limit=${limit}&featured=true`;
      let data = await http.get(urlFeatured);
      let products = Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data)
          ? data
          : [];

      if (!products.length) {
        const url = `${API_ENDPOINTS.PRODUCTS.GET_ALL}?limit=${limit}`;
        data = await http.get(url);
        products = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [];
      }

      this.products = products.slice(0, limit);
      this.renderCards();
    } catch (e) {
      console.error('[ProductsCarousel] Error cargando productos', e);
      this.shadowRoot.getElementById('track').innerHTML = `
        <div style="padding:1rem;color:#f44336;">No se pudieron cargar los productos.</div>
      `;
    }
  }

  normalizeImage(url) {
    let v = url || '/images/placeholder.svg';
    if (v.startsWith('./')) v = v.substring(1);
    if (v.startsWith('http')) return v;
    if (!v.startsWith('/')) {
      // if only filename, assume productos folder
      if (!v.includes('/')) {
        v = `/images/productos/${v}`;
      } else {
        v = `/${v}`;
      }
    }
    return v;
  }

  imageFor(p) {
    if (p?.images && Array.isArray(p.images) && p.images.length) {
      return this.normalizeImage(p.images[0]);
    }
    if (p?.image_url) {
      return this.normalizeImage(p.image_url);
    }
    if (p?.image) {
      return this.normalizeImage(p.image);
    }
    return '/images/placeholder.svg';
  }

  renderCards() {
    const track = this.shadowRoot.getElementById('track');
    if (!this.products.length) {
      track.innerHTML = `
        <div style="padding:1rem;color:#666;">No hay productos para mostrar.</div>
      `;
      return;
    }
    track.innerHTML = this.products
      .map((p) => {
        const img = this.imageFor(p);
        const priceHtml = isNaN(parseFloat(p.price))
          ? 'Precio a consultar'
          : formatPrice(parseFloat(p.price));
        return `
          <div class="card" data-id="${p.id}">
            <img class="thumb" src="${img}" alt="${p.name}" loading="lazy" decoding="async" onerror="this.src='/images/placeholder.svg';this.onerror=null;">
            <div class="info">
              <h3 class="name">${p.name}</h3>
              <div class="price">${priceHtml}</div>
            </div>
          </div>
        `;
      })
      .join('');

    // Click to open detail modal if products-component exists on page
    track.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const pc = document.querySelector('products-component');
        if (pc && typeof pc.openProductModal === 'function') {
          pc.openProductModal(id);
        }
      });
    });

    // Update nav state after rendering
    this.updateNavState();
  }

  scrollBy(direction) {
    const track = this.shadowRoot.getElementById('track');
    const card = track.querySelector('.card');
    const step = card ? (card.clientWidth + 16) * 2 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  updateNavState() {
    const track = this.shadowRoot.getElementById('track');
    const left = this.shadowRoot.querySelector('.btn.left');
    const right = this.shadowRoot.querySelector('.btn.right');
    if (!track || !left || !right) return;
    const atStart = track.scrollLeft <= 2;
    const atEnd = Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth - 2;
    left.disabled = atStart;
    right.disabled = atEnd;
  }
}

if (!customElements.get('products-carousel')) {
  customElements.define('products-carousel', ProductsCarousel);
}

export default ProductsCarousel;
