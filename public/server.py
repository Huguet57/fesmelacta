import os
import http.server
import socketserver

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_response(self, code, message=None):
        """Custom send_response to avoid adding default headers."""
        self.log_request(code)
        self.send_response_only(code, message)
        # Here, we avoid calling end_headers to control when headers are sent

    def send_cors_headers(self):
        """Method to send CORS headers."""
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow all origins
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def end_headers(self):
        """Override end_headers to add CORS headers."""
        self.send_cors_headers()
        super().end_headers()

    def do_OPTIONS(self):
        """Method to handle OPTIONS requests."""
        self.send_response(200)  # Respond with 200 OK
        self.send_cors_headers()
        self.end_headers()

# Get port from the PORT environment variable
PORT = int(os.getenv('PORT', '8080'))

handler_object = MyHttpRequestHandler

with socketserver.TCPServer(("", PORT), handler_object) as httpd:
    print("Server started on port: " + str(PORT))
    httpd.serve_forever()