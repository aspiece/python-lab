# Classic Breakout
A playable Python learning example inspired by the classic brick-breaking game. This is new example code, not the original Atari source.

## Play
Select main.py and press Run. Click the game to use the left and right arrow keys. Press Space to launch and R to restart. Touch buttons also work. Use Stop or Close game to return to your code. Your work saves like other Python Lab projects.

## 1. Paddle movement
Find PADDLE_SPEED and PADDLE_WIDTH. Predict how a wider paddle changes the game. Change one value and test. Explain how max() and min() keep the paddle inside the screen.

## 2. Ball and walls
Find BALL_SPEED and the wall checks. Predict which speed changes sign at a side wall. Try speeds from 2 to 6. Very large speeds can jump past objects between frames.

## 3. Bricks and collisions
Find make_bricks() and touches_brick(). Change the brick colors. Predict the number of bricks from the two ranges. Try fewer rows or columns, keeping them inside the screen. Explain why the loop checks a copy of the list before removing a brick.

## 4. Score, lives, and restart
Find where score and lives change. Give each brick 20 points. Add a different starting number of lives; update both the starting and restart values. Test missing the paddle, losing all lives, and restarting.

## How drawing works
Python Lab includes lab_graphics; you do not install anything. It is a small canvas module, not Pygame. The drawing area is 640 by 480 pixels, with (0, 0) at the top left. clear(), rectangle(), circle(), and text() build a picture. await screen.frame() displays it and lets the browser process keys. Keep that line inside the loop so the game stays responsive.

Use Run for this interactive example. Debug Trace is for short, non-interactive programs and does not replay the game. To inspect a value, add an occasional print() or display it with screen.text(). Downloaded code needs Python Lab's graphics module and browser runner; it will not run as a normal desktop Pygame program.
