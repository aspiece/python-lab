# Classic Breakout: a playable example to change and test.
# Read README.md for four coding checkpoints.
import asyncio
import pygame

WIDTH = 640
HEIGHT = 480
PADDLE_WIDTH = 96
PADDLE_SPEED = 7
BALL_SPEED = 4


def make_bricks():
    bricks = []
    colors = ["#fb7185", "#fb923c", "#facc15", "#4ade80", "#38bdf8"]
    for row in range(5):
        for column in range(10):
            bricks.append([22 + column * 60, 60 + row * 26, colors[row]])
    return bricks


def touches_brick(x, y, brick):
    # The ball has a radius of 7 pixels.
    nearest_x = max(brick[0], min(x, brick[0] + 56))
    nearest_y = max(brick[1], min(y, brick[1] + 20))
    return (x - nearest_x) ** 2 + (y - nearest_y) ** 2 <= 49


def draw_text(screen, font, message, x, y):
    screen.blit(font.render(message, True, "white"), (x, y))


async def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    font = pygame.font.Font(None, 28)
    paddle_x = (WIDTH - PADDLE_WIDTH) / 2
    ball_x = WIDTH / 2
    ball_y = 413
    speed_x = BALL_SPEED
    speed_y = -BALL_SPEED
    score = 0
    lives = 3
    launched = False
    bricks = make_bricks()

    while True:
        pressed = set()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    pressed.add("Space")
                if event.key == pygame.K_r:
                    pressed.add("r")
        held = pygame.key.get_pressed()
        if held[pygame.K_LEFT]:
            pressed.add("ArrowLeft")
        if held[pygame.K_RIGHT]:
            pressed.add("ArrowRight")
        if "r" in pressed:
            bricks = make_bricks()
            score = 0
            lives = 3
            launched = False
            speed_x = BALL_SPEED
            speed_y = -BALL_SPEED

        if "ArrowLeft" in pressed:
            paddle_x = paddle_x - PADDLE_SPEED
        if "ArrowRight" in pressed:
            paddle_x = paddle_x + PADDLE_SPEED
        paddle_x = max(0, min(WIDTH - PADDLE_WIDTH, paddle_x))

        if lives > 0 and len(bricks) > 0:
            if not launched:
                ball_x = paddle_x + PADDLE_WIDTH / 2
                ball_y = 413
                if "Space" in pressed:
                    launched = True
            else:
                previous_y = ball_y
                ball_x = ball_x + speed_x
                ball_y = ball_y + speed_y
                if ball_x <= 7 or ball_x >= WIDTH - 7:
                    speed_x = -speed_x
                    ball_x = max(7, min(WIDTH - 7, ball_x))
                if ball_y <= 7:
                    speed_y = abs(speed_y)
                    ball_y = 7
                if speed_y > 0 and previous_y + 7 <= 430 and ball_y + 7 >= 430:
                    if paddle_x - 7 <= ball_x <= paddle_x + PADDLE_WIDTH + 7:
                        ball_y = 423
                        speed_y = -abs(speed_y)
                        # Hitting near an edge changes the ball's direction.
                        speed_x = (ball_x - (paddle_x + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2) * BALL_SPEED
                for brick in bricks[:]:
                    if touches_brick(ball_x, ball_y, brick):
                        bricks.remove(brick)
                        score = score + 10
                        if previous_y + 7 <= brick[1] or previous_y - 7 >= brick[1] + 20:
                            speed_y = -speed_y
                        else:
                            speed_x = -speed_x
                        break
                if ball_y > HEIGHT + 7:
                    lives = lives - 1
                    launched = False
                    speed_x = BALL_SPEED
                    speed_y = -BALL_SPEED

        screen.fill("#101827")
        draw_text(screen, font, "Score: " + str(score), 20, 30)
        draw_text(screen, font, "Lives: " + str(lives), 525, 30)
        for brick in bricks:
            pygame.draw.rect(screen, brick[2], (brick[0], brick[1], 56, 20))
        pygame.draw.rect(screen, "#e2e8f0", (paddle_x, 430, PADDLE_WIDTH, 12))
        pygame.draw.circle(screen, "white", (round(ball_x), round(ball_y)), 7)
        if lives == 0:
            draw_text(screen, font, "Game over. Press R to restart.", 155, 270)
        elif len(bricks) == 0:
            draw_text(screen, font, "You cleared the wall! Press R.", 155, 270)
        elif not launched:
            draw_text(screen, font, "Move with arrows. Space to launch.", 150, 300)
        pygame.display.flip()
        await asyncio.sleep(1 / 60)


if __name__ == "__main__":
    await main()
