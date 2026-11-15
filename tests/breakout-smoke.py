"""Exercise the distributed game loop without a display or wall-clock sleeps."""
import asyncio
import ast
import inspect
import pathlib
import sys
import types

ROOT = pathlib.Path(__file__).resolve().parents[1]
source = (ROOT / 'templates/breakout/main.py').read_text()
snapshots = []
mode = 'play'
class Finished(Exception):
    pass

def keys():
    state = inspect.currentframe().f_back.f_locals
    if mode == 'restart':
        return {'r'}
    pressed = {'Space'}
    target = state['ball_x'] if mode == 'play' else 0
    center = state['paddle_x'] + 48
    if target < center - 5:
        pressed.add('ArrowLeft')
    elif target > center + 5:
        pressed.add('ArrowRight')
    return pressed

async def frame():
    state = inspect.currentframe().f_back.f_locals
    snapshots.append({key: state[key] for key in ['score','lives','ball_x','ball_y','paddle_x','launched']})
    assert 0 <= state['paddle_x'] <= 544
    if mode == 'restart' or state['lives'] == 0 or not state['bricks'] or len(snapshots) >= 12000:
        raise Finished()

screen = types.ModuleType('lab_graphics')
screen.keys = keys
screen.frame = frame
for name in ['clear', 'text', 'rectangle', 'circle']:
    setattr(screen, name, lambda *args: None)
sys.modules['lab_graphics'] = screen
namespace = {'__name__': 'test_game'}
# The module has a top-level await branch, so evaluate its coroutine explicitly.
async def load():
    result = eval(compile(source, 'main.py', 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT), namespace)
    await result
asyncio.run(load())
assert len(namespace['make_bricks']()) == 50
assert namespace['touches_brick'](22, 60, [22,60,'red'])
assert namespace['touches_brick'](15, 60, [22,60,'red'])
assert not namespace['touches_brick'](14, 60, [22,60,'red'])
async def run():
    try:
        await namespace['main']()
    except Finished:
        pass
asyncio.run(run())
assert max(s['score'] for s in snapshots) > 0, 'No bricks hit / score awarded'
assert any(s['ball_y'] < 100 for s in snapshots), 'Ball did not travel to bricks'
mode = 'miss'
snapshots.clear()
asyncio.run(run())
assert snapshots[-1]['lives'] == 0, 'Misses did not lead to game over'
mode = 'restart'
snapshots.clear()
asyncio.run(run())
assert snapshots[-1]['score'] == 0 and snapshots[-1]['lives'] == 3
print('Breakout: bricks, collision boundaries, paddle bounds, launch, scoring, life loss and restart passed.')
