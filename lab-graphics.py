"""Small browser canvas API for Python Lab (not pygame)."""
import asyncio
import json
from lab_canvas import send_frame, read_keys

_commands = []

def keys():
    """Return the currently held keys: ArrowLeft, ArrowRight, Space, r."""
    return set(json.loads(read_keys()))

def clear(color="#101827"):
    _commands.clear()
    _commands.append(["clear", color])

def rectangle(x, y, width, height, color):
    _commands.append(["rect", x, y, width, height, color])

def circle(x, y, radius, color):
    _commands.append(["circle", x, y, radius, color])

def text(message, x, y, color="white", size=20):
    _commands.append(["text", str(message), x, y, color, size])

async def frame(fps=60):
    """Show the drawing and yield so input and Stop stay responsive."""
    send_frame(json.dumps(_commands))
    await asyncio.sleep(1 / max(1, min(60, fps)))
