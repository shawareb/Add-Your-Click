import hmac
import json
import os
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "counter.db"
RESET_PASSWORD = os.environ.get("RESET_PASSWORD", "Shawareb")


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS counter (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                value INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        connection.execute("INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0)")
        connection.commit()


def get_count() -> int:
    with sqlite3.connect(DB_PATH, timeout=30) as connection:
        row = connection.execute("SELECT value FROM counter WHERE id = 1").fetchone()

    if row is None:
        return 0

    return int(row[0])


def increment_count() -> int:
    with sqlite3.connect(DB_PATH, timeout=30) as connection:
        connection.execute("BEGIN IMMEDIATE")
        connection.execute("UPDATE counter SET value = value + 1 WHERE id = 1")
        row = connection.execute("SELECT value FROM counter WHERE id = 1").fetchone()
        connection.commit()

    if row is None:
        return 0

    return int(row[0])


def reset_count() -> int:
    with sqlite3.connect(DB_PATH, timeout=30) as connection:
        connection.execute("BEGIN IMMEDIATE")
        connection.execute("UPDATE counter SET value = 0 WHERE id = 1")
        row = connection.execute("SELECT value FROM counter WHERE id = 1").fetchone()
        connection.commit()

    if row is None:
        return 0

    return int(row[0])


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def _send_json(self, status_code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_request_body(self) -> bytes:
        content_length = self.headers.get("Content-Length")
        if not content_length:
            return b""

        try:
            size = int(content_length)
        except ValueError:
            return b""

        if size > 0:
            return self.rfile.read(size)

        return b""

    def _read_json_body(self) -> dict:
        raw_body = self._read_request_body()
        if not raw_body:
            return {}

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return {}

        if isinstance(payload, dict):
            return payload

        return {}

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/count":
            try:
                self._send_json(200, {"count": get_count()})
            except sqlite3.Error:
                self._send_json(500, {"error": "Database error while reading counter"})
            return

        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        body = self._read_json_body()

        try:
            if path == "/api/click":
                self._send_json(200, {"count": increment_count()})
                return

            if path == "/api/reset":
                password = str(body.get("password", ""))
                if not hmac.compare_digest(password, RESET_PASSWORD):
                    self._send_json(401, {"error": "Invalid password"})
                    return

                self._send_json(200, {"count": reset_count()})
                return

            self._send_json(404, {"error": "Not found"})
        except sqlite3.Error:
            self._send_json(500, {"error": "Database error while updating counter"})


def run() -> None:
    init_db()

    host = os.environ.get("APP_HOST", "0.0.0.0")
    port = int(os.environ.get("APP_PORT", "4173"))

    server = ThreadingHTTPServer((host, port), AppHandler)
    print(f"Server running on {host}:{port}")
    print(f"Open locally: http://127.0.0.1:{port}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run()
