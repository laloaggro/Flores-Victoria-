/**
 * @fileoverview State Management Store
 * @description Store centralizado reactivo para estado del frontend
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Crea un store reactivo minimalista (similar a Zustand)
 * @param {Function} createState - Función que retorna el estado inicial
 * @returns {Object} Store con métodos get, set, subscribe
 */
const createStore = (createState) => {
  let state;
  const listeners = new Set();

  /**
   * Obtiene el estado actual
   * @returns {Object} Estado
   */
  const getState = () => state;

  /**
   * Actualiza el estado
   * @param {Object|Function} partial - Estado parcial o función que retorna estado parcial
   * @param {boolean} replace - Si true, reemplaza todo el estado
   */
  const setState = (partial, replace = false) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;

    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = replace ? nextState : { ...state, ...nextState };

      // Notificar a todos los listeners
      listeners.forEach((listener) => {
        listener(state, previousState);
      });
    }
  };

  /**
   * Suscribe un listener a cambios de estado
   * @param {Function} listener - Función llamada en cada cambio
   * @returns {Function} Función para desuscribirse
   */
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  /**
   * Destruye el store
   */
  const destroy = () => {
    listeners.clear();
  };

  // API que se pasa al createState
  const api = { getState, setState, subscribe, destroy };

  // Inicializar estado
  state = createState(setState, getState, api);

  return api;
};

// ================================================
// CART STORE
// ================================================

const cartStore = createStore((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  // Computed
  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  // Actions
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.productId === product.id);

      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
        return { items: newItems };
      }

      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.image || product.images?.[0],
            quantity,
            stock: product.stock,
          },
        ],
      };
    });

    // Persistir en localStorage
    localStorage.setItem('cart', JSON.stringify(get().items));

    // Emitir evento
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: get() }));
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));

    localStorage.setItem('cart', JSON.stringify(get().items));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: get() }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      return get().removeItem(productId);
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }));

    localStorage.setItem('cart', JSON.stringify(get().items));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: get() }));
  },

  clearCart: () => {
    set({ items: [] });
    localStorage.removeItem('cart');
    window.dispatchEvent(new CustomEvent('cart:cleared'));
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        set({ items: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('[CartStore] Error loading from storage:', error);
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ================================================
// USER STORE
// ================================================

const userStore = createStore((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user, token = null) => {
    set({
      user,
      token: token || get().token,
      isAuthenticated: !!user,
      error: null,
    });

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('authToken', token);
      }
    }

    window.dispatchEvent(new CustomEvent('user:changed', { detail: { user } }));
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');

    window.dispatchEvent(new CustomEvent('user:logout'));
  },

  updateProfile: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));

    const user = get().user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  loadFromStorage: () => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');

      if (userStr && token) {
        set({
          user: JSON.parse(userStr),
          token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('[UserStore] Error loading from storage:', error);
      get().logout();
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ================================================
// WISHLIST STORE
// ================================================

const wishlistStore = createStore((set, get) => ({
  items: [],
  isLoading: false,

  // Computed
  get count() {
    return this.items.length;
  },

  // Actions
  addItem: (product) => {
    set((state) => {
      if (state.items.some((item) => item.productId === product.id)) {
        return state;
      }

      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.image || product.images?.[0],
            addedAt: new Date().toISOString(),
          },
        ],
      };
    });

    localStorage.setItem('wishlist', JSON.stringify(get().items));
    window.dispatchEvent(new CustomEvent('wishlist:updated', { detail: get() }));
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));

    localStorage.setItem('wishlist', JSON.stringify(get().items));
    window.dispatchEvent(new CustomEvent('wishlist:updated', { detail: get() }));
  },

  toggle: (product) => {
    const exists = get().items.some((item) => item.productId === product.id);
    if (exists) {
      get().removeItem(product.id);
    } else {
      get().addItem(product);
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.productId === productId);
  },

  clearWishlist: () => {
    set({ items: [] });
    localStorage.removeItem('wishlist');
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        set({ items: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('[WishlistStore] Error loading from storage:', error);
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
}));

// ================================================
// UI STORE
// ================================================

const uiStore = createStore((set) => ({
  theme: 'light',
  sidebarOpen: false,
  modalOpen: null,
  notifications: [],
  searchQuery: '',
  filters: {},

  // Actions
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },

  toggleTheme: () => {
    const newTheme = uiStore.getState().theme === 'light' ? 'dark' : 'light';
    uiStore.getState().setTheme(newTheme);
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  openModal: (modalId) => set({ modalOpen: modalId }),
  closeModal: () => set({ modalOpen: null }),

  addNotification: (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remover después de duration (default 5s)
    if (notification.duration !== 0) {
      setTimeout(() => {
        uiStore.getState().removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () => set({ filters: {} }),

  loadFromStorage: () => {
    const theme = localStorage.getItem('theme') || 'light';
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  },
}));

// ================================================
// INICIALIZACIÓN
// ================================================

/**
 * Inicializa todos los stores desde localStorage
 */
const initializeStores = () => {
  cartStore.getState().loadFromStorage();
  userStore.getState().loadFromStorage();
  wishlistStore.getState().loadFromStorage();
  uiStore.getState().loadFromStorage();
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStores);
} else {
  initializeStores();
}

// ================================================
// HELPERS
// ================================================

/**
 * Hook para suscribirse a cambios de un store con selector
 * @param {Object} store - Store
 * @param {Function} selector - Función selectora
 * @param {Function} callback - Callback cuando cambia el valor seleccionado
 * @returns {Function} Función para desuscribirse
 */
const subscribeWithSelector = (store, selector, callback) => {
  let currentValue = selector(store.getState());

  return store.subscribe((state) => {
    const newValue = selector(state);
    if (!Object.is(newValue, currentValue)) {
      const previousValue = currentValue;
      currentValue = newValue;
      callback(newValue, previousValue);
    }
  });
};

/**
 * Combina múltiples stores en uno
 * @param {Object} stores - Objeto con stores
 * @returns {Object} Store combinado
 */
const combineStores = (stores) => {
  const combined = {};

  for (const [key, store] of Object.entries(stores)) {
    combined[key] = store.getState();
  }

  return {
    getState: () => {
      const state = {};
      for (const [key, store] of Object.entries(stores)) {
        state[key] = store.getState();
      }
      return state;
    },
    subscribe: (listener) => {
      const unsubscribes = Object.values(stores).map((store) =>
        store.subscribe(() => listener(combineStores(stores).getState()))
      );
      return () => unsubscribes.forEach((unsub) => unsub());
    },
  };
};

// ================================================
// EXPORTS
// ================================================

// Exportar para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createStore,
    cartStore,
    userStore,
    wishlistStore,
    uiStore,
    initializeStores,
    subscribeWithSelector,
    combineStores,
  };
}

// Exponer globalmente
window.Store = {
  createStore,
  cart: cartStore,
  user: userStore,
  wishlist: wishlistStore,
  ui: uiStore,
  initialize: initializeStores,
  subscribeWithSelector,
  combineStores,
};
