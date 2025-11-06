#!/usr/bin/env python3
"""
Servidor HTTP simple con soporte correcto para UTF-8
"""
import http.server
import socketserver
import mimetypes
from pathlib import Path

class UTF8Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Agregar encoding UTF-8 para archivos de texto
        if self.path.endswith('.md') or self.path.endswith('.txt'):
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
        elif self.path.endswith('.html'):
            self.send_header('Content-Type', 'text/html; charset=utf-8')
        elif self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css; charset=utf-8')
        elif self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
        
        super().end_headers()

PORT = 8080
Handler = UTF8Handler

print(f"🚀 Servidor iniciado en http://localhost:{PORT}")
print(f"📁 Sirviendo desde: {Path.cwd()}")
print(f"✨ Con soporte UTF-8 correcto")
print(f"\n🔗 Dashboard: http://localhost:{PORT}/components-dashboard.html")
print(f"📚 Docs: http://localhost:{PORT}/js/components/COMPONENTS_README.md")
print(f"\nPresiona Ctrl+C para detener el servidor\n")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido")
