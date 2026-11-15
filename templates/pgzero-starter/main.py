# Pygame Zero handles the game loop for you.
import pgzrun

WIDTH = 640
HEIGHT = 480
TITLE = "Pygame Zero: Move the Ball"

ball_x = 320
ball_y = 240
speed = 4
color = "orange"


def draw():
    screen.fill("#101827")
    screen.draw.filled_circle((ball_x, ball_y), 25, color)
    screen.draw.text("Move with arrow keys. Space changes color.", (40, 35), fontsize=26, color="white")


def update():
    global ball_x, ball_y
    if keyboard.left:
        ball_x = ball_x - speed
    if keyboard.right:
        ball_x = ball_x + speed
    if keyboard.up:
        ball_y = ball_y - speed
    if keyboard.down:
        ball_y = ball_y + speed
    ball_x = max(25, min(WIDTH - 25, ball_x))
    ball_y = max(25, min(HEIGHT - 25, ball_y))


def on_key_down(key):
    global color, ball_x, ball_y
    if key == keys.SPACE:
        if color == "orange":
            color = "cyan"
        else:
            color = "orange"
    if key == keys.R:
        ball_x = WIDTH / 2
        ball_y = HEIGHT / 2


pgzrun.go()
