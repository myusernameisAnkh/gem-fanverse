"""Standard-library local preview. Run with Python 3; press Ctrl+C to stop."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import webbrowser

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description="Preview GEMVERSE locally")
parser.add_argument("--port", type=int, default=8000)
parser.add_argument("--no-open", action="store_true")
args = parser.parse_args()
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
try:
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
except OSError as error:
    raise SystemExit(f"Cannot open port {args.port}: {error}. Try --port 8001.")
url = f"http://localhost:{args.port}/"
print(f"GEMVERSE: {url}\nPress Ctrl+C to stop.")
if not args.no_open:
    webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nPreview stopped.")
finally:
    server.server_close()
