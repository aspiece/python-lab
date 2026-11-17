"""Browser execution adapter. Uses the real pygame-ce and pgzero packages."""
import ast
import asyncio
import builtins
import inspect
import os
import sys
import time
import types
import pygame
from js import performance, window

# A student loop without an await must fail with guidance rather than freeze
# the editor indefinitely. Normal awaited frames allow the JS heartbeat to run.
_guard_lines = 0

def _responsive_trace(frame, event, arg):
    global _guard_lines
    _guard_lines = _guard_lines + 1
    if _guard_lines % 1000 == 0:
        if performance.now() - window.gameHeartbeat > 2000:
            raise RuntimeError("This game loop blocked the browser. In Pygame, keep await asyncio.sleep(1 / 60) inside your loop. In Pygame Zero, return from update() and draw() each frame.")
    return _responsive_trace


def _game_input(prompt=""):
    raise RuntimeError("input() is not available in the game view. Use keyboard events, or run this file in Python mode for terminal input.")


async def _run_pgzero(module):
    # Pygame Zero 1.2.1's own event adapters, keyboard, scheduler and drawing
    # methods are retained; only its blocking loop is replaced by awaited frames.
    from pgzero.game import PGZeroGame
    from pgzero.clock import clock
    game = PGZeroGame(module)
    game.reinit_screen()
    game.load_handlers()
    update = game.get_update_func()
    draw = game.get_draw_func()
    previous = time.monotonic()
    while True:
        now = time.monotonic()
        dt = min(now - previous, 0.1)
        previous = now
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return
            if event.type == pygame.KEYDOWN:
                game.keyboard._press(event.key)
            elif event.type == pygame.KEYUP:
                game.keyboard._release(event.key)
            game.dispatch_event(event)
        clock.tick(dt)
        if update:
            update(dt)
        game.reinit_screen()
        draw()
        pygame.display.flip()
        await asyncio.sleep(1 / 60)


async def _execute_game():
    module = types.ModuleType('__main__')
    module.__file__ = __game_filename
    sys.modules['__main__'] = module
    sys.path.insert(0, os.getcwd())
    sys.argv = [__game_filename] + list(__game_args)
    old_input = builtins.input
    builtins.input = _game_input
    try:
        if __game_mode == 'pgzero':
            # Supports normal "import pgzrun; pgzrun.go()" student files.
            sys._pgzrun = True
            from pgzero.runner import prepare_mod
            from pgzero.game import PGZeroGame
            # Browser canvases have no desktop window icon. SDL's WASM image
            # loader cannot read pgzero's BytesIO default icon on this build.
            PGZeroGame.show_default_icon = staticmethod(lambda: None)
            module.ICON = None
            from pgzero.loaders import ImageLoader, SoundLoader
            if "webp" not in ImageLoader.EXTNS:
                ImageLoader.EXTNS = list(ImageLoader.EXTNS) + ["webp"]
            if "mp3" not in SoundLoader.EXTNS:
                SoundLoader.EXTNS = list(SoundLoader.EXTNS) + ["mp3"]
            prepare_mod(module)
        sys.settrace(_responsive_trace)
        result = eval(compile(__game_code, __game_filename, 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT), module.__dict__)
        if inspect.isawaitable(result):
            await result
        if __game_mode == 'pgzero':
            await _run_pgzero(module)
    except SystemExit:
        pass
    finally:
        sys.settrace(None)
        builtins.input = old_input
        pygame.quit()

await _execute_game()
