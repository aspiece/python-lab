"""Local-only PTY backend for Python Lab. NOT for internet exposure."""
import asyncio, json, os, pathlib, secrets, shutil, sys, tempfile
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

ROOT = pathlib.Path(__file__).resolve().parent
WORKSPACE = ROOT / ".python-lab-workspace"
WORKSPACE.mkdir(exist_ok=True)
TOKEN = secrets.token_urlsafe(24)

@asynccontextmanager
async def lifespan(app):
    print("Python Lab local backend ready: http://127.0.0.1:8000")
    yield

app = FastAPI(lifespan=lifespan)
@app.get("/api/terminal-config")
def config():
    return {"terminal": True}

@app.websocket("/api/terminal")
async def terminal(ws: WebSocket):
    origin = ws.headers.get("origin", "")
    if origin not in ("http://127.0.0.1:8000", "http://localhost:8000"):
        await ws.close(code=1008)
        return
    await ws.accept()
    folder = pathlib.Path(tempfile.mkdtemp(prefix="session-", dir=WORKSPACE))
    proc = None
    reader_task = None
    try:
        if os.name == "nt":
            from winpty import PtyProcess
            shell = os.environ.get("COMSPEC", "cmd.exe")
            proc = PtyProcess.spawn(shell, cwd=str(folder), dimensions=(30, 100))
            async def read():
                while proc.isalive():
                    chunk = await asyncio.to_thread(proc.read, 8192)
                    if chunk:
                        await ws.send_text(json.dumps({"type":"output", "data":chunk}))
        else:
            import pty, fcntl, termios, struct, signal
            pid, fd = pty.fork()
            if pid == 0:
                os.chdir(folder)
                os.environ["TERM"] = "xterm-256color"
                os.execvp(os.environ.get("SHELL", "/bin/sh"), [os.environ.get("SHELL", "/bin/sh"), "-i"])
            proc = (pid, fd)
            async def read():
                while True:
                    try:
                        chunk = await asyncio.to_thread(os.read, fd, 8192)
                    except OSError:
                        break
                    if chunk:
                        await ws.send_text(json.dumps({"type":"output", "data":chunk.decode("utf-8", "replace")}))
        reader_task = asyncio.create_task(read())
        while True:
            raw = await ws.receive_text()
            data = json.loads(raw)
            if data.get("type") == "input":
                content = str(data.get("data", ""))[:8192]
                if os.name == "nt":
                    proc.write(content)
                else:
                    os.write(proc[1], content.encode())
            elif data.get("type") == "files":
                files = data.get("files", {})
                for name, body in list(files.items())[:64]:
                    if (isinstance(name, str) and pathlib.PurePath(name).name == name
                            and name not in (".", "..") and isinstance(body, str)
                            and len(body.encode()) < 1024 * 1024):
                        (folder / name).write_text(body, encoding="utf-8")
                await ws.send_text(json.dumps({"type":"synced"}))
            elif data.get("type") == "resize":
                rows = max(5,min(100,int(data.get("rows",25))))
                cols = max(20,min(240,int(data.get("cols",80))))
                if os.name == "nt":
                    proc.setwinsize(rows, cols)
                else:
                    fcntl.ioctl(proc[1], termios.TIOCSWINSZ, struct.pack("HHHH",rows,cols,0,0))
    except (WebSocketDisconnect, OSError, ValueError):
        pass
    finally:
        if os.name == "nt" and proc is not None:
            proc.terminate()
        elif proc is not None:
            import signal
            try: os.kill(proc[0], signal.SIGHUP)
            except ProcessLookupError: pass
            try: os.close(proc[1])
            except OSError: pass
        if reader_task:
            reader_task.cancel()
        shutil.rmtree(folder, ignore_errors=True)

app.mount("/", StaticFiles(directory=ROOT, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, ws="websockets")
