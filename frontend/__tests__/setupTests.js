// Configuración de pruebas para simular el entorno del navegador

// Verificar si window está disponible
if (typeof window === 'undefined') {
  global.window = {};
}

// Verificar si document está disponible
if (typeof document === 'undefined') {
  global.document = {
    createElement: (tag) => {
      if (tag === 'div') {
        return {
          style: {},
          classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
          },
          setAttribute: () => {},
          getAttribute: () => null,
          addEventListener: () => {},
          removeEventListener: () => {},
          querySelector: () => null,
          querySelectorAll: () => []
        };
      }
      return {};
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}

// Mock de localStorage
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

// Mock de sessionStorage
if (typeof sessionStorage === 'undefined') {
  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200
  })
);

// Mock de URL
global.URL = class {
  constructor(url) {
    this.url = url;
  }
  toString() {
    return this.url;
  }
};

// Registrar elementos personalizados
if (typeof customElements === 'undefined') {
  global.customElements = {
    define: (name, constructor) => {
      // Registrar el elemento personalizado
      global.customElements.registry = global.customElements.registry || {};
      global.customElements.registry[name] = constructor;
    },
    get: (name) => {
      // Devolver el constructor si está registrado
      return global.customElements.registry && global.customElements.registry[name];
    }
  };
}