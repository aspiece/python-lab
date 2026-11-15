# Pygame Zero: Move the Ball
Select main.py and press Run. Auto mode recognizes import pgzrun. For a Pygame Zero file with no imports, choose Pygame Zero beside Run.

Click the game and use the arrow keys. Space changes the ball's color; R returns it to the middle. The touch controls move left and right, change color (Launch), and reset (Restart).

## 1. Read the drawing
Find draw(). Change the background and ball radius. Predict what changes before you run.

## 2. Change movement
Find update(). Change speed from 4 to 2, then to 6. Explain why the position changes a little each frame. Keep update() short: do not put a forever loop inside it.

## 3. Respond to keys
Find on_key_down(). Change the two colors. Add another key action using keys.UP or keys.DOWN.

## 4. Make a challenge
Draw a target circle. Decide when the ball reaches it and display a success message. Test the edges of your target.

## How it runs
Python Lab loads the real pygame-ce and pgzero libraries. Pygame Zero supplies screen, keyboard, keys, Rect, Actor, clock, and other helpers. You write draw(), update(), and event handlers; the browser adapter calls them without blocking the page. Standard pgzrun.go() files work here and on a desktop with Pygame Zero installed.

Use Run rather than Debug Trace. Errors appear in the Terminal. Close game or Stop returns to editing. The first load can take longer while packages download.

This first version supports projects made from Python and text files, shapes, and the built-in font. Python Lab does not yet import image/audio assets. Audio and tone generation are not verified in the browser. Desktop-only libraries and blocking game loops are not supported. No student installation is needed.
