/**
 * Loading Spinner Component
 * Componente reutilizable para mostrar estados de carga
 */

import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  fullPage = false,
  message = 'Cargando...',
}) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;

  const spinner = (
    <div className={`loading-spinner ${sizeClass} ${colorClass}`}>
      <div className="spinner"></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-fullpage">{spinner}</div>;
  }

  return spinner;
};

export default LoadingSpinner;
