# Python Assessment 2 — Choose Your Challenge

Choose **one** challenge. Complete the starter code in Python Lab, predict your trace values **before** using Debug Trace, and submit the downloaded assessment ZIP to Google Forms.

## Option A — Pong: Ball Movement
Open `pong_logic.py`. The ball begins at position 4, moving right (`direction = 1`). The left wall is at 0 and the right wall at 10. Your loop must simulate three frames, moving 3 units per frame.

Complete two sections:
1. Write a `for` loop that repeats three times, then update `ball_x` by adding `direction * 3` inside the loop.
2. Write `if`, `elif`, and `else` statements:
   - At or beyond 10, set direction to -1 and status to "Right bounce".
   - At or below 0, set direction to 1 and status to "Left bounce".
   - Otherwise, set status to "Moving".

The starter provides the player's name and initial variables. Write the loop and print each frame's position and status. Test the three frames. Trace **ball_x after each frame**.

## Option B — Music: Playlist DJ
Open `playlist_dj.py`. Three song ratings are provided: 5, 3, and 5.

Complete two sections:
1. Write a `for` loop that processes all three songs, retrieves each rating, and increases `favorites` by 1 for a rating of 5.
2. Write `if`, `elif`, and `else` statements:
   - Rating 5: label "Favorite".
   - Rating 4: label "Recommended".
   - All other ratings: label "Skip".

The starter provides the DJ name, song list, and ratings. Write the loop and print each song's label. Trace **favorites after each song**.

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
