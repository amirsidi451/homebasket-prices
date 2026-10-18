"""Serve static files on this computer only; no receipt uploads or server processing."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
import webbrowser
root=Path(__file__).resolve().parent
def main():
 try:
  server=ThreadingHTTPServer(("127.0.0.1",8787),partial(SimpleHTTPRequestHandler,directory=str(root)))
 except OSError:
  print("Port 8787 is busy. Close the previous HomeBasket window and try again.")
  return
 print("HomeBasket: http://127.0.0.1:8787/ — keep this window open. Ctrl+C stops it.")
 webbrowser.open("http://127.0.0.1:8787/")
 try: server.serve_forever()
 except KeyboardInterrupt: pass
 finally: server.server_close()
if __name__=="__main__":main()
