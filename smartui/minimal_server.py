from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def do_GET(self):
        try:
            # Convert URL path to filesystem path
            path = self.translate_path(self.path)
            
            # Check if path exists and is a file
            if os.path.exists(path) and os.path.isfile(path):
                return super().do_GET()
            else:
                self.send_error(404, f"File not found: {self.path}")
        except Exception as e:
            print(f"Error serving {self.path}: {str(e)}")
            self.send_error(500, f"Internal server error: {str(e)}")

port = 5000
print(f"Starting server on port {port}...")
print(f"Serving files from: {os.getcwd()}")
httpd = HTTPServer(('localhost', port), CORSRequestHandler)
print(f"Server running at http://localhost:{port}")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nShutting down server...")
    httpd.server_close()
    sys.exit(0) 