# Python Assessment 2 — Choose Your Challenge

**Choose ONE:** Gaming (Player Score Tracker) or Music (Listening Tracker). Open only the matching starter file. Do not change the other theme.

## Learning target
Use a loop, an accumulator, string input, and if/elif/else to process three values and classify the total.

## Option A: Gaming
Complete `game_tracker.py`.
1. Ask for a gamer tag (already provided).
2. Collect three integer round scores (loop provided).
3. Update `total` inside the loop using ordinary assignment.
4. Write an `if` / `elif` / `else` structure that sets `rank`:
   - Pro: 250 or more
   - Skilled: 150–249
   - Beginner: below 150
5. Print the name, total, and rank (provided).

Test with **80, 90, 95**. The total should be **265** and the rank **Pro**.

## Option B: Music
Complete `music_tracker.py`.
1. Ask for a playlist name (already provided).
2. Collect three integer listening times in minutes (loop provided).
3. Update `total` inside the loop using ordinary assignment.
4. Write an `if` / `elif` / `else` structure that sets `level`:
   - Superfan: 120 or more
   - Regular Listener: 60–119
   - Casual Listener: below 60
5. Print the name, total minutes, and level (provided).

Test with **45, 40, 50**. The total should be **135** and the level **Superfan**.

## Code trace — predict before running
For your selected theme, record the running value of `total` after each loop iteration. Then run the program and check your predictions.

| Iteration | Value entered | Predicted total |
|---|---|---|
| 1 | First test value | |
| 2 | Second test value | |
| 3 | Third test value | |

Enter your three predicted totals into the Google Form.

## Submit
1. Save your completed `.py` file.
2. Download the file from Python Lab. Browser storage is local to this device.
3. Upload the `.py` file to the assessment Google Form.
4. Paste your complete Python code into the Form's paragraph field.

**Do not use compound assignment operators (`+=`) or f-strings.** Use `total = total + value` and regular `print()` calls.

**Teacher note:** This folder is review-only and must not be added to the Templates gallery. Do not expose it in the live student launcher until approved.
