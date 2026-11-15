"""Exercise the distributed game loop without a display or wall-clock sleeps."""
import asyncio
import ast
import inspect
import pathlib
import sys
import types
import os
os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
import pygame

ROOT = pathlib.Path(__file__).resolve().parents[1]
source = (ROOT / 'templates/breakout/main.py').read_text()
snapshots = []
mode = 'play'
class Finished(Exception):
    pass

def events():
    state = inspect.currentframe().f_back.f_locals
    if mode == 'restart':
        return [pygame.event.Event(pygame.KEYDOWN, key=pygame.K_r)]
    if not state['launched']:
        return [pygame.event.Event(pygame.KEYDOWN, key=pygame.K_SPACE)]
    return []

def held_keys():
    state = inspect.currentframe().f_back.f_locals
    target = state['ball_x'] if mode == 'play' else 0
    center = state['paddle_x'] + 48
    return {pygame.K_LEFT: target < center - 5, pygame.K_RIGHT: target > center + 5}

async def frame(delay):
    state = inspect.currentframe().f_back.f_locals
    snapshots.append({key: state[key] for key in ['score','lives','ball_x','ball_y','paddle_x','launched']})
    assert 0 <= state['paddle_x'] <= 544
    if mode == 'restart' or state['lives'] == 0 or not state['bricks'] or len(snapshots) >= 12000:
        raise Finished()

pygame.event.get = events
pygame.key.get_pressed = held_keys
asyncio.sleep = frame
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
