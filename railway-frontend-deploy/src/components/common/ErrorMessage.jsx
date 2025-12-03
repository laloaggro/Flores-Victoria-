/**
 * Error Message Component
 * Componente para mostrar errores de forma amigable
 */

// import eliminado: React no usado
import './ErrorMessage.css';

const ErrorMessage = ({
  error,
  title = 'Error',
  onRetry = null,
  onDismiss = null,
  variant = 'danger',
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`error-message error-${variant}`}>
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-text">
          <h4 className="error-title">{title}</h4>
          <p className="error-description">{errorMessage}</p>
        </div>
      </div>

      <div className="error-actions">
        {onRetry && (
          <button onClick={onRetry} className="error-button error-button-retry">
            Reintentar
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="error-button error-button-dismiss">
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
