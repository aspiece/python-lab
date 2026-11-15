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
This version uses real Pygame Community Edition. Python Lab loads it for you. Leave Run mode on Auto, or select Pygame. The drawing area is 640 by 480 pixels, with (0, 0) at the top left. pygame.draw.rect() draws a rectangle, pygame.draw.circle() draws the ball, and pygame.display.flip() displays the frame.

Keep await asyncio.sleep(1 / 60) inside the loop. It lets the browser draw and read keys. A blocking loop will stop with a message explaining how to fix it. Debug Trace does not replay games; use Run and print() for debugging. Runtime errors appear in the Terminal.

The browser game runner currently transfers your Python and other text files. Uploaded pictures and audio files are not supported by Python Lab's file tools yet. Start with shapes and the built-in font. The first game may take a little longer to load. Nothing needs to be installed on your computer.

To run this example on a desktop with Python and pygame-ce installed, replace the final await main() with asyncio.run(main()). Existing saved projects keep their original code.
