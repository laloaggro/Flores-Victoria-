# 🎨 Frontend Integration Guide

## Integración con Microservices

Esta guía explica cómo conectar el frontend de Flores Victoria con los microservices backend.

---

## 📦 Estructura Creada

```
frontend/src/
├── services/
│   └── api.js           # Cliente API centralizado
├── hooks/
│   └── useAPI.js        # Custom hooks para API calls
└── components/
    └── common/
        ├── LoadingSpinner.jsx    # Componente de loading
        ├── LoadingSpinner.css
        ├── ErrorMessage.jsx      # Componente de errores
        └── ErrorMessage.css
```

---

## 🔧 API Service

### Configuración

El cliente API (`services/api.js`) maneja:

- ✅ Autenticación JWT automática
- ✅ Retry logic
- ✅ Error handling global
- ✅ Timeout configuration
- ✅ Multiple environments (dev/prod)

### Uso Básico

```javascript
import APIService from './services/api';

// Login
const { token, user } = await APIService.login('email@example.com', 'password');

// Get products
const products = await APIService.getProducts({ category: 'flores' });

// Add to cart
const cart = await APIService.addToCart(productId, 2);

// Create order
const order = await APIService.createOrder({
  items: cart.items,
  shippingAddress: addressId,
});
```

---

## 🎣 Custom Hooks

### useAuth

Manejo completo de autenticación:

```jsx
import { useAuth } from './hooks/useAPI';

function App() {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <LoginForm onSubmit={login} />
      )}
    </div>
  );
}
```

### useProducts

Fetch y gestión de productos:

```jsx
import { useProducts } from './hooks/useAPI';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';

function ProductList() {
  const { data: products, loading, error, execute } = useProducts();

  if (loading) return <LoadingSpinner message="Cargando productos..." />;
  if (error) return <ErrorMessage error={error} onRetry={execute} />;

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### useCart

Gestión completa del carrito:

```jsx
import { useCart } from './hooks/useAPI';

function Cart() {
  const { cart, loading, error, addItem, updateItem, removeItem, clear } = useCart();

  const handleQuantityChange = async (itemId, quantity) => {
    await updateItem(itemId, quantity);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="cart">
      {cart.items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
          onRemove={() => removeItem(item.id)}
        />
      ))}
      <button onClick={clear}>Vaciar Carrito</button>
    </div>
  );
}
```

### useOrders

Gestión de órdenes:

```jsx
import { useOrders } from './hooks/useAPI';

function OrderHistory() {
  const {
    data: orders,
    loading,
    error,
  } = useOrders({
    status: 'completed',
    limit: 10,
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="orders">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

### useAPI (Generic)

Hook genérico para cualquier API call:

```jsx
import { useAPI } from './hooks/useAPI';
import APIService from './services/api';

function ProductDetail({ productId }) {
  const {
    data: product,
    loading,
    error,
    execute,
  } = useAPI(() => APIService.getProduct(productId), null, true);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={execute} />;

  return <ProductDetailView product={product} />;
}
```

---

## 🎨 UI Components

### LoadingSpinner

Componente flexible para estados de carga:

```jsx
import LoadingSpinner from './components/common/LoadingSpinner';

// Básico
<LoadingSpinner />

// Con mensaje
<LoadingSpinner message="Procesando pago..." />

// Tamaños
<LoadingSpinner size="small" />
<LoadingSpinner size="medium" />
<LoadingSpinner size="large" />

// Colores
<LoadingSpinner color="primary" />
<LoadingSpinner color="success" />
<LoadingSpinner color="warning" />
<LoadingSpinner color="danger" />

// Full page
<LoadingSpinner fullPage message="Cargando aplicación..." />
```

### ErrorMessage

Componente para mostrar errores:

```jsx
import ErrorMessage from './components/common/ErrorMessage';

// Básico
<ErrorMessage error="Algo salió mal" />

// Con título custom
<ErrorMessage
  error="No se pudo procesar el pago"
  title="Error de Pago"
/>

// Con retry
<ErrorMessage
  error={error}
  onRetry={() => execute()}
/>

// Con dismiss
<ErrorMessage
  error={error}
  onDismiss={() => setError(null)}
/>

// Variantes
<ErrorMessage error={error} variant="danger" />
<ErrorMessage error={error} variant="warning" />
<ErrorMessage error={error} variant="info" />
```

---

## 🔐 Autenticación

### Flow de Autenticación

1. **Login:**

   ```javascript
   const { user, token } = await APIService.login(email, password);
   // Token se guarda automáticamente en localStorage
   ```

2. **Request con Token:**

   ```javascript
   // El interceptor agrega automáticamente el header:
   // Authorization: Bearer <token>
   const products = await APIService.getProducts();
   ```

3. **Token Expirado (401):**

   ```javascript
   // El interceptor maneja automáticamente:
   // 1. Limpia localStorage
   // 2. Redirige a /login
   ```

4. **Logout:**
   ```javascript
   APIService.logout();
   // Limpia token y redirige a login
   ```

### Protected Routes

```jsx
import { useAuth } from './hooks/useAPI';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
}

// Uso en routes
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

---

## 🌐 Environment Configuration

### Development

```javascript
// .env.development
REACT_APP_CART_API=http://localhost:3001
REACT_APP_PRODUCT_API=http://localhost:3002
REACT_APP_AUTH_API=http://localhost:3003
REACT_APP_USER_API=http://localhost:3004
REACT_APP_ORDER_API=http://localhost:3005
```

### Production

```javascript
// .env.production
REACT_APP_CART_API=https://api.flores-victoria.com/cart
REACT_APP_PRODUCT_API=https://api.flores-victoria.com/product
REACT_APP_AUTH_API=https://api.flores-victoria.com/auth
REACT_APP_USER_API=https://api.flores-victoria.com/user
REACT_APP_ORDER_API=https://api.flores-victoria.com/order
```

---

## 🚀 Ejemplos Completos

### Login Page

```jsx
import { useState } from 'react';
import { useAuth } from './hooks/useAPI';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';

function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect handled by useAuth
    } catch (err) {
      // Error handled by useAuth
    }
  };

  return (
    <div className="login-page">
      <h1>Iniciar Sesión</h1>

      {error && <ErrorMessage error={error} />}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner size="small" /> : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
```

### Product Catalog

```jsx
import { useState } from 'react';
import { useProducts, useCart } from './hooks/useAPI';
import { useDebounce } from './hooks/useAPI';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';

function ProductCatalog() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const {
    data: products,
    loading,
    error,
    execute: refreshProducts,
  } = useProducts({ search: debouncedSearch });

  const { addItem } = useCart();

  const handleAddToCart = async (productId) => {
    try {
      await addItem(productId, 1);
      alert('Producto agregado al carrito');
    } catch (err) {
      alert('Error al agregar al carrito');
    }
  };

  return (
    <div className="catalog">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar productos..."
      />

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onRetry={refreshProducts} />}

      <div className="product-grid">
        {products?.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={() => handleAddToCart(product.id)}>Agregar al Carrito</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Checkout Flow

```jsx
import { useState } from 'react';
import { useCart } from './hooks/useAPI';
import APIService from './services/api';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';

function Checkout() {
  const { cart, loading: cartLoading } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressId, setAddressId] = useState('');

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create order
      const order = await APIService.createOrder({
        items: cart.items,
        shippingAddress: addressId,
        paymentMethod: 'credit_card',
      });

      // Clear cart
      await APIService.clearCart();

      // Redirect to success
      window.location.href = `/orders/${order.id}/success`;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la orden');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="checkout">
      <h1>Finalizar Compra</h1>

      {error && <ErrorMessage error={error} />}

      <div className="cart-summary">
        <h2>Resumen del Pedido</h2>
        {cart.items.map((item) => (
          <div key={item.id}>
            {item.product.name} x {item.quantity} = ${item.subtotal}
          </div>
        ))}
        <div className="total">Total: ${cart.total}</div>
      </div>

      <div className="shipping-form">
        {/* Address selection form */}
        <select value={addressId} onChange={(e) => setAddressId(e.target.value)}>
          <option value="">Selecciona dirección</option>
          {/* Map addresses */}
        </select>
      </div>

      <button onClick={handleCheckout} disabled={loading || !addressId} className="checkout-button">
        {loading ? <LoadingSpinner size="small" color="white" /> : 'Confirmar Pedido'}
      </button>
    </div>
  );
}
```

---

## 🔍 Debugging

### Network Errors

```javascript
// Ver todas las requests en consola
axios.interceptors.request.use((request) => {
  console.log('Starting Request', request);
  return request;
});

axios.interceptors.response.use((response) => {
  console.log('Response:', response);
  return response;
});
```

### Health Check

```jsx
import { useHealthCheck } from './hooks/useAPI';

function SystemStatus() {
  const { health, checking } = useHealthCheck(30000); // Check every 30s

  return (
    <div className="system-status">
      <h3>System Status</h3>
      {Object.entries(health).map(([service, status]) => (
        <div key={service}>
          {service}: {status.status === 'healthy' ? '✅' : '❌'}
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Checklist

- [ ] API client configurado en `services/api.js`
- [ ] Custom hooks creados en `hooks/useAPI.js`
- [ ] Loading spinner component
- [ ] Error message component
- [ ] Environment variables configuradas
- [ ] Authentication flow implementado
- [ ] Protected routes setup
- [ ] Health check monitoring
- [ ] Error boundaries implemented
- [ ] Loading states en todas las requests

---

**¡Frontend integrado con microservices!** 🎉
