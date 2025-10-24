export function HealthBadge({ status = 'OK' }) {
  const healthy = String(status).toUpperCase() === 'OK';
  const color = healthy ? '#16a34a' : '#dc2626';
  const bg = healthy ? '#dcfce7' : '#fee2e2';
  const text = healthy ? 'OK' : 'DOWN';
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    borderRadius: '9999px',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif',
    fontSize: '12px',
    fontWeight: 600,
    color,
    backgroundColor: bg,
    border: `1px solid ${color}33`
  };
  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
    boxShadow: healthy ? '0 0 8px #16a34a66' : '0 0 8px #dc262666'
  };
  return (
    <span style={style}>
      <span style={dotStyle} />
      <span>{text}</span>
    </span>
  );
}
