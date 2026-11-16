# Python Assessment 2 — Choose Your Challenge

Choose **one** challenge. Complete the starter code in Python Lab, predict your trace values **before** using Debug Trace, and submit the downloaded assessment ZIP to Google Forms.

## Option A — Pong: Ball Movement
Open `pong_logic.py`. The ball begins at position 4, moving right (`direction = 1`). The left wall is at 0 and the right wall at 10. The provided loop simulates three frames, moving 3 units per frame.

Complete two sections:
1. Update `ball_x` by adding `direction * 3`.
2. Write `if`, `elif`, and `else` statements:
   - At or beyond 10, set direction to -1 and status to "Right bounce".
   - At or below 0, set direction to 1 and status to "Left bounce".
   - Otherwise, set status to "Moving".

The starter handles the player's name, loop, and output. Test the three frames. Trace **ball_x after each frame**.

## Option B — Music: Playlist DJ
Open `playlist_dj.py`. Three song ratings are provided: 5, 3, and 5.

Complete two sections:
1. When a song has rating 5, increase `favorites` by 1 using `favorites = favorites + 1`.
2. Write `if`, `elif`, and `else` statements:
   - Rating 5: label "Favorite".
   - Rating 4: label "Recommended".
   - All other ratings: label "Skip".

The starter handles the DJ name, loop, and output. Trace **favorites after each song**.

## Predict → Debug → Reflect
Before recording a Debug Trace, fill out and lock your predictions in the Assessment panel.

| Iteration | Value examined | Running variable before | Running variable after |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

Then record the actual values using Debug Trace and write a short reflection comparing them.

## Submit
Use **Download Assessment ZIP** to download your Python program and `trace_results.txt` together. Upload the ZIP to Google Forms and paste your completed Python code into the paragraph box.
