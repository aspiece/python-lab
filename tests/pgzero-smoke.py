"""Exercise the actual pgzero package with the browser loop adapter."""
import ast
import asyncio
import os
import pathlib
import sys
import time
import types
os.environ['SDL_VIDEODRIVER'] = 'dummy'
os.environ['SDL_AUDIODRIVER'] = 'dummy'
import pygame
ROOT = pathlib.Path(__file__).resolve().parents[1]
class Finished(Exception):
    pass
js = types.ModuleType('js')
js.performance = types.SimpleNamespace(now=lambda: time.monotonic() * 1000)
js.window = types.SimpleNamespace(gameHeartbeat=time.monotonic() * 1000)
sys.modules['js'] = js
frames = 0
positions = []
async def next_frame(delay):
    global frames
    frames = frames + 1
    module = sys.modules['__main__']
    positions.append(module.ball_x)
    if frames == 1:
        pygame.event.post(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RIGHT, mod=0))
        pygame.event.post(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_SPACE, mod=0))
    if frames == 4:
        pygame.event.post(pygame.event.Event(pygame.KEYUP, key=pygame.K_RIGHT, mod=0))
    if frames == 6:
        assert module.color == 'cyan', 'on_key_down did not receive Space'
        assert positions[3] > positions[0], 'keyboard state did not move ball'
        assert positions[5] == positions[4], 'KEYUP did not release key'
        assert pygame.display.get_surface().get_size() == (640,480)
        raise Finished()
asyncio.sleep = next_frame
namespace = {'__game_code':(ROOT/'templates/pgzero-starter/main.py').read_text(), '__game_mode':'pgzero', '__game_filename':str(ROOT/'templates/pgzero-starter/main.py'), '__game_args':[]}
async def run():
    try:
        await eval(compile((ROOT/'pygame-support.py').read_text(),'pygame-support.py','exec',flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT),namespace)
    except Finished:
        pass
asyncio.run(run())
assert frames == 6
assert not pygame.display.get_init(), 'Display did not close after execution'
print('Real Pygame Zero: draw/update, key events, held keyboard, key release and cleanup passed.')
