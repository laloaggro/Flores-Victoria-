// Health check endpoint for frontend
// This file should be included in the HTML to provide a /health endpoint

// Create a simple health check response
const healthStatus = {
  status: 'OK',
  service: 'frontend',
  timestamp: new Date().toISOString(),
};

// If we're at the health endpoint, return the health status
if (window.location.pathname === '/health') {
  document.body.innerHTML = `<pre>${JSON.stringify(healthStatus, null, 2)}</pre>`;
}
