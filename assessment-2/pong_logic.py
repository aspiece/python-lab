# Pong — Ball Movement
# Read README.md for instructions.
name = input("Player name: ").strip()
ball_x = 4
direction = 1

for frame in range(3):
    # TODO 1: Update ball_x using direction and 3 units.

    # TODO 2: Write if, elif, else for wall bounces.
    # Set direction and status as described in README.
    status = ""

    print("Position:", ball_x, "Status:", status)

print("Player:", name)
