/**
 * Google OAuth Integration
 * Maneja la autenticación con Google Sign-In
 */

(function () {
  'use strict';

  // Configuración de Google OAuth
  const GOOGLE_CONFIG = {
    clientId: '1056735978033-7taftkj0t3fhg3sbc1eog43dh7rqt2ck.apps.googleusercontent.com', // Reemplazar con tu Client ID real
    redirectUri: `${globalThis.location.origin}/pages/login.html`,
    scope: 'email profile',
  };

  class GoogleAuth {
    constructor() {
      this.isInitialized = false;
      this.isScriptLoaded = false;
    }

    /**
     * Cargar el script de Google Sign-In
     */
    loadGoogleScript() {
      return new Promise((resolve, reject) => {
        if (this.isScriptLoaded) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          this.isScriptLoaded = true;
          console.log('✅ Google Sign-In script cargado');
          resolve();
        };

        script.onerror = () => {
          console.error('❌ Error cargando Google Sign-In script');
          reject(new Error('No se pudo cargar Google Sign-In'));
        };

        document.head.appendChild(script);
      });
    }

    /**
     * Inicializar Google Sign-In
     */
    async initialize() {
      if (this.isInitialized) {
        return;
      }

      try {
        await this.loadGoogleScript();

        // Esperar a que google esté disponible
        await this.waitForGoogle();

        // Inicializar Google Identity Services
        if (globalThis.google && globalThis.google.accounts) {
          globalThis.google.accounts.id.initialize({
            client_id: GOOGLE_CONFIG.clientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          this.isInitialized = true;
          console.log('✅ Google Sign-In inicializado');
        }
      } catch (error) {
        console.error('❌ Error inicializando Google Sign-In:', error);
        throw error;
      }
    }

    /**
     * Esperar a que el objeto google esté disponible
     */
    waitForGoogle(timeout = 5000) {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkGoogle = () => {
          if (globalThis.google && globalThis.google.accounts) {
            resolve();
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout esperando Google API'));
          } else {
            setTimeout(checkGoogle, 100);
          }
        };

        checkGoogle();
      });
    }

    /**
     * Manejar la respuesta de credenciales de Google
     */
    async handleCredentialResponse(response) {
      try {
        console.log('🔐 Procesando credencial de Google...');

        // Decodificar el JWT de Google
        const credential = this.parseJwt(response.credential);

        console.log('📧 Usuario:', credential.email);

        // Enviar al backend para autenticación
        const result = await this.authenticateWithBackend({
          googleId: credential.sub,
          email: credential.email,
          name: credential.name,
          picture: credential.picture,
        });

        if (result.success) {
          // Guardar sesión
          if (globalThis.AuthService) {
            localStorage.setItem('flores-victoria-token', result.token);
            localStorage.setItem('flores-victoria-user', JSON.stringify(result.user));

            // Disparar evento de cambio de autenticación
            globalThis.dispatchEvent(
              new CustomEvent('authChange', {
                detail: { authenticated: true, user: result.user },
              })
            );
          }

          // Redirigir
          const returnUrl =
            new URLSearchParams(globalThis.location.search).get('return') || '/index.html';
          globalThis.location.href = returnUrl;
        } else {
          throw new Error(result.error || 'Error en autenticación con Google');
        }
      } catch (error) {
        console.error('❌ Error en autenticación con Google:', error);
        throw error;
      }
    }

    /**
     * Autenticar con el backend
     */
    async authenticateWithBackend(userData) {
      try {
        const response = await fetch('http://localhost:3000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error en el servidor');
        }

        return {
          success: true,
          token: data.data.token,
          user: data.data.user,
        };
      } catch (error) {
        console.error('Error comunicándose con el backend:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    }

    /**
     * Mostrar el prompt de Google Sign-In
     */
    async signIn() {
      try {
        if (!this.isInitialized) {
          await this.initialize();
        }

        // Mostrar el prompt de One Tap
        if (globalThis.google && globalThis.google.accounts && globalThis.google.accounts.id) {
          globalThis.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              console.log('❌ Prompt no mostrado:', notification.getNotDisplayedReason());
              // Si One Tap no se muestra, usar el botón alternativo
              this.renderButton();
            }
            if (notification.isSkippedMoment()) {
              console.log('⏭️ Usuario saltó el prompt');
            }
          });
        }
      } catch (error) {
        console.error('Error iniciando Google Sign-In:', error);
        throw error;
      }
    }

    /**
     * Renderizar botón de Google Sign-In (alternativo)
     */
    renderButton(elementId = 'googleSignInButton') {
      const buttonDiv = document.getElementById(elementId);
      if (!buttonDiv) {
        console.warn('Elemento del botón de Google no encontrado');
        return;
      }

      if (globalThis.google && globalThis.google.accounts && globalThis.google.accounts.id) {
        globalThis.google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: buttonDiv.offsetWidth,
        });
      }
    }

    /**
     * Decodificar JWT (solo para debugging, no validar en frontend)
     */
    parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Error decodificando JWT:', error);
        return null;
      }
    }

    /**
     * Cerrar sesión de Google
     */
    signOut() {
      if (globalThis.google && globalThis.google.accounts && globalThis.google.accounts.id) {
        globalThis.google.accounts.id.disableAutoSelect();
        console.log('✅ Google Sign-In: auto-select deshabilitado');
      }
    }
  }

  // Crear instancia global
  globalThis.GoogleAuth = new GoogleAuth();

  // Log de carga
  console.log('✅ GoogleAuth cargado y disponible');
})();
