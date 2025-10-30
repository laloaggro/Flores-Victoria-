/**
 * Custom Hooks para manejo de API calls
 * Incluye: loading states, error handling, retry logic
 */

import { useState, useEffect, useCallback } from 'react';
import APIService from '../services/api';

/**
 * Hook genérico para API calls con loading y error states
 */
export const useAPI = (apiFunc, initialData = null, immediate = false) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return { data, loading, error, execute, reset };
};

/**
 * Hook para productos
 */
export const useProducts = (params = {}, immediate = true) => {
  return useAPI(() => APIService.getProducts(params), [], immediate);
};

/**
 * Hook para producto individual
 */
export const useProduct = (id, immediate = true) => {
  return useAPI(() => APIService.getProduct(id), null, immediate);
};

/**
 * Hook para carrito
 */
export const useCart = (immediate = true) => {
  const { data, loading, error, execute, reset } = useAPI(
    APIService.getCart,
    null,
    immediate
  );

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      await APIService.addToCart(productId, quantity);
      execute(); // Refresh cart
    },
    [execute]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      await APIService.updateCartItem(itemId, quantity);
      execute(); // Refresh cart
    },
    [execute]
  );

  const removeItem = useCallback(
    async (itemId) => {
      await APIService.removeFromCart(itemId);
      execute(); // Refresh cart
    },
    [execute]
  );

  const clear = useCallback(async () => {
    await APIService.clearCart();
    execute(); // Refresh cart
  }, [execute]);

  return {
    cart: data,
    loading,
    error,
    refresh: execute,
    addItem,
    updateItem,
    removeItem,
    clear,
    reset,
  };
};

/**
 * Hook para órdenes
 */
export const useOrders = (params = {}, immediate = true) => {
  return useAPI(() => APIService.getOrders(params), [], immediate);
};

/**
 * Hook para orden individual
 */
export const useOrder = (id, immediate = true) => {
  return useAPI(() => APIService.getOrder(id), null, immediate);
};

/**
 * Hook para autenticación
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      APIService.getProfile()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { user: userData } = await APIService.login(email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { user: newUser } = await APIService.register(userData);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    APIService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      try {
        setLoading(true);
        setError(null);
        const updatedUser = await APIService.updateProfile(updates);
        setUser(updatedUser);
        return updatedUser;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Profile update failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };
};

/**
 * Hook para retry logic
 */
export const useRetry = (maxRetries = 3, delay = 1000) => {
  const [retries, setRetries] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(
    async (func) => {
      let lastError;

      for (let i = 0; i <= maxRetries; i++) {
        try {
          setIsRetrying(i > 0);
          setRetries(i);
          const result = await func();
          setIsRetrying(false);
          return result;
        } catch (error) {
          lastError = error;
          if (i < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
          }
        }
      }

      setIsRetrying(false);
      throw lastError;
    },
    [maxRetries, delay]
  );

  return { retry, retries, isRetrying };
};

/**
 * Hook para debounce (búsqueda, etc.)
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para health check de servicios
 */
export const useHealthCheck = (interval = 30000) => {
  const [health, setHealth] = useState({});
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      setChecking(true);
      const results = await APIService.checkHealth();
      setHealth(results);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const intervalId = setInterval(checkHealth, interval);
    return () => clearInterval(intervalId);
  }, [checkHealth, interval]);

  return { health, checking, checkHealth };
};
