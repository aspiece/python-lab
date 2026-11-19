/* Python Lab classroom templates; no CS50 problem-set starter catalog. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let install=null;
 const legacy={
  "breakout": {"title": "Classic Breakout", "description": "Play and customize a brick-breaking game using Pygame CE.", "files": {"main.py": "# Classic Breakout: a playable example to change and test.\n# Read README.md for four coding checkpoints.\nimport asyncio\nimport pygame\n\nWIDTH = 640\nHEIGHT = 480\nPADDLE_WIDTH = 96\nPADDLE_SPEED = 7\nBALL_SPEED = 4\n\n\ndef make_bricks():\n    bricks = []\n    colors = [\"#fb7185\", \"#fb923c\", \"#facc15\", \"#4ade80\", \"#38bdf8\"]\n    for row in range(5):\n        for column in range(10):\n            bricks.append([22 + column * 60, 60 + row * 26, colors[row]])\n    return bricks\n\n\ndef touches_brick(x, y, brick):\n    # The ball has a radius of 7 pixels.\n    nearest_x = max(brick[0], min(x, brick[0] + 56))\n    nearest_y = max(brick[1], min(y, brick[1] + 20))\n    return (x - nearest_x) ** 2 + (y - nearest_y) ** 2 <= 49\n\n\ndef draw_text(screen, font, message, x, y):\n    screen.blit(font.render(message, True, \"white\"), (x, y))\n\n\nasync def main():\n    pygame.init()\n    screen = pygame.display.set_mode((WIDTH, HEIGHT))\n    font = pygame.font.Font(None, 28)\n    paddle_x = (WIDTH - PADDLE_WIDTH) / 2\n    ball_x = WIDTH / 2\n    ball_y = 413\n    speed_x = BALL_SPEED\n    speed_y = -BALL_SPEED\n    score = 0\n    lives = 3\n    launched = False\n    bricks = make_bricks()\n\n    while True:\n        pressed = set()\n        for event in pygame.event.get():\n            if event.type == pygame.QUIT:\n                return\n            if event.type == pygame.KEYDOWN:\n                if event.key == pygame.K_SPACE:\n                    pressed.add(\"Space\")\n                if event.key == pygame.K_r:\n                    pressed.add(\"r\")\n        held = pygame.key.get_pressed()\n        if held[pygame.K_LEFT]:\n            pressed.add(\"ArrowLeft\")\n        if held[pygame.K_RIGHT]:\n            pressed.add(\"ArrowRight\")\n        if \"r\" in pressed:\n            bricks = make_bricks()\n            score = 0\n            lives = 3\n            launched = False\n            speed_x = BALL_SPEED\n            speed_y = -BALL_SPEED\n\n        if \"ArrowLeft\" in pressed:\n            paddle_x = paddle_x - PADDLE_SPEED\n        if \"ArrowRight\" in pressed:\n            paddle_x = paddle_x + PADDLE_SPEED\n        paddle_x = max(0, min(WIDTH - PADDLE_WIDTH, paddle_x))\n\n        if lives > 0 and len(bricks) > 0:\n            if not launched:\n                ball_x = paddle_x + PADDLE_WIDTH / 2\n                ball_y = 413\n                if \"Space\" in pressed:\n                    launched = True\n            else:\n                previous_y = ball_y\n                ball_x = ball_x + speed_x\n                ball_y = ball_y + speed_y\n                if ball_x <= 7 or ball_x >= WIDTH - 7:\n                    speed_x = -speed_x\n                    ball_x = max(7, min(WIDTH - 7, ball_x))\n                if ball_y <= 7:\n                    speed_y = abs(speed_y)\n                    ball_y = 7\n                if speed_y > 0 and previous_y + 7 <= 430 and ball_y + 7 >= 430:\n                    if paddle_x - 7 <= ball_x <= paddle_x + PADDLE_WIDTH + 7:\n                        ball_y = 423\n                        speed_y = -abs(speed_y)\n                        # Hitting near an edge changes the ball's direction.\n                        speed_x = (ball_x - (paddle_x + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2) * BALL_SPEED\n                for brick in bricks[:]:\n                    if touches_brick(ball_x, ball_y, brick):\n                        bricks.remove(brick)\n                        score = score + 10\n                        if previous_y + 7 <= brick[1] or previous_y - 7 >= brick[1] + 20:\n                            speed_y = -speed_y\n                        else:\n                            speed_x = -speed_x\n                        break\n                if ball_y > HEIGHT + 7:\n                    lives = lives - 1\n                    launched = False\n                    speed_x = BALL_SPEED\n                    speed_y = -BALL_SPEED\n\n        screen.fill(\"#101827\")\n        draw_text(screen, font, \"Score: \" + str(score), 20, 30)\n        draw_text(screen, font, \"Lives: \" + str(lives), 525, 30)\n        for brick in bricks:\n            pygame.draw.rect(screen, brick[2], (brick[0], brick[1], 56, 20))\n        pygame.draw.rect(screen, \"#e2e8f0\", (paddle_x, 430, PADDLE_WIDTH, 12))\n        pygame.draw.circle(screen, \"white\", (round(ball_x), round(ball_y)), 7)\n        if lives == 0:\n            draw_text(screen, font, \"Game over. Press R to restart.\", 155, 270)\n        elif len(bricks) == 0:\n            draw_text(screen, font, \"You cleared the wall! Press R.\", 155, 270)\n        elif not launched:\n            draw_text(screen, font, \"Move with arrows. Space to launch.\", 150, 300)\n        pygame.display.flip()\n        await asyncio.sleep(1 / 60)\n\n\nif __name__ == \"__main__\":\n    await main()\n", "README.md": "# Classic Breakout\nA playable Python learning example inspired by the classic brick-breaking game. This is new example code, not the original Atari source.\n\n## Play\nSelect main.py and press Run. Click the game to use the left and right arrow keys. Press Space to launch and R to restart. Touch buttons also work. Use Stop or Close game to return to your code. Your work saves like other Python Lab projects.\n\n## 1. Paddle movement\nFind PADDLE_SPEED and PADDLE_WIDTH. Predict how a wider paddle changes the game. Change one value and test. Explain how max() and min() keep the paddle inside the screen.\n\n## 2. Ball and walls\nFind BALL_SPEED and the wall checks. Predict which speed changes sign at a side wall. Try speeds from 2 to 6. Very large speeds can jump past objects between frames.\n\n## 3. Bricks and collisions\nFind make_bricks() and touches_brick(). Change the brick colors. Predict the number of bricks from the two ranges. Try fewer rows or columns, keeping them inside the screen. Explain why the loop checks a copy of the list before removing a brick.\n\n## 4. Score, lives, and restart\nFind where score and lives change. Give each brick 20 points. Add a different starting number of lives; update both the starting and restart values. Test missing the paddle, losing all lives, and restarting.\n\n## How drawing works\nThis version uses real Pygame Community Edition. Python Lab loads it for you. Leave Run mode on Auto, or select Pygame. The drawing area is 640 by 480 pixels, with (0, 0) at the top left. pygame.draw.rect() draws a rectangle, pygame.draw.circle() draws the ball, and pygame.display.flip() displays the frame.\n\nKeep await asyncio.sleep(1 / 60) inside the loop. It lets the browser draw and read keys. A blocking loop will stop with a message explaining how to fix it. Debug Trace does not replay games; use Run and print() for debugging. Runtime errors appear in the Terminal.\n\nThe browser game runner currently transfers your Python and other text files. Uploaded pictures and audio files are not supported by Python Lab's file tools yet. Start with shapes and the built-in font. The first game may take a little longer to load. Nothing needs to be installed on your computer.\n\nTo run this example on a desktop with Python and pygame-ce installed, replace the final await main() with asyncio.run(main()). Existing saved projects keep their original code.\n"}},
  "pgzero-starter": {"title": "Pygame Zero: Move the Ball", "description": "Start with draw(), update(), and keyboard events.", "files": {"main.py": "# Pygame Zero handles the game loop for you.\nimport pgzrun\n\nWIDTH = 640\nHEIGHT = 480\nTITLE = \"Pygame Zero: Move the Ball\"\n\nball_x = 320\nball_y = 240\nspeed = 4\ncolor = \"orange\"\n\n\ndef draw():\n    screen.fill(\"#101827\")\n    screen.draw.filled_circle((ball_x, ball_y), 25, color)\n    screen.draw.text(\"Move with arrow keys. Space changes color.\", (40, 35), fontsize=26, color=\"white\")\n\n\ndef update():\n    global ball_x, ball_y\n    if keyboard.left:\n        ball_x = ball_x - speed\n    if keyboard.right:\n        ball_x = ball_x + speed\n    if keyboard.up:\n        ball_y = ball_y - speed\n    if keyboard.down:\n        ball_y = ball_y + speed\n    ball_x = max(25, min(WIDTH - 25, ball_x))\n    ball_y = max(25, min(HEIGHT - 25, ball_y))\n\n\ndef on_key_down(key):\n    global color, ball_x, ball_y\n    if key == keys.SPACE:\n        if color == \"orange\":\n            color = \"cyan\"\n        else:\n            color = \"orange\"\n    if key == keys.R:\n        ball_x = WIDTH / 2\n        ball_y = HEIGHT / 2\n\n\npgzrun.go()\n", "README.md": "# Pygame Zero: Move the Ball\nSelect main.py and press Run. Auto mode recognizes import pgzrun. For a Pygame Zero file with no imports, choose Pygame Zero beside Run.\n\nClick the game and use the arrow keys. Space changes the ball's color; R returns it to the middle. The touch controls move left and right, change color (Launch), and reset (Restart).\n\n## 1. Read the drawing\nFind draw(). Change the background and ball radius. Predict what changes before you run.\n\n## 2. Change movement\nFind update(). Change speed from 4 to 2, then to 6. Explain why the position changes a little each frame. Keep update() short: do not put a forever loop inside it.\n\n## 3. Respond to keys\nFind on_key_down(). Change the two colors. Add another key action using keys.UP or keys.DOWN.\n\n## 4. Make a challenge\nDraw a target circle. Decide when the ball reaches it and display a success message. Test the edges of your target.\n\n## How it runs\nPython Lab loads the real pygame-ce and pgzero libraries. Pygame Zero supplies screen, keyboard, keys, Rect, Actor, clock, and other helpers. You write draw(), update(), and event handlers; the browser adapter calls them without blocking the page. Standard pgzrun.go() files work here and on a desktop with Pygame Zero installed.\n\nUse Run rather than Debug Trace. Errors appear in the Terminal. Close game or Stop returns to editing. The first load can take longer while packages download.\n\nThis first version supports projects made from Python and text files, shapes, and the built-in font. Python Lab does not yet import image/audio assets. Audio and tone generation are not verified in the browser. Desktop-only libraries and blocking game loops are not supported. No student installation is needed.\n"}},
  "hello-world": {
    "title": "Hello, Python!",
    "description": "Variables, input, simple strings, and output.",
    "files": {
      "main.py": "# Change the greeting and try your own name.\nname = input(\"What is your name? \")\nprint(\"Hello, \" + name + \"!\")\n",
      "README.md": "# Hello, Python!\nRun main.py. Change the greeting, add a second question, and print both answers.\n"
    }
  },
  "loops-lists": {
    "title": "Loops and Lists",
    "description": "Practice lists, for loops, and accumulating totals.",
    "files": {
      "main.py": "# Predict the output, then run the code.\nscores = [8, 10, 7, 9]\ntotal = 0\nfor score in scores:\n    total = total + score\n    print(\"Added\", score, \"; running total =\", total)\nprint(\"Average =\", round(total / len(scores), 1))\n",
      "README.md": "# Loops and Lists\nSet a breakpoint inside the for loop, then record a trace. Observe how total changes.\nChallenge: find the highest score without using max().\n"
    }
  },
  "functions-tests": {
    "title": "Functions and Tests",
    "description": "Write functions and run pytest with sample tests.",
    "files": {
      "main.py": "def square(number):\n    return number * number\n\n\ndef is_even(number):\n    return number % 2 == 0\n\n\nif __name__ == \"__main__\":\n    print(square(5))\n    print(is_even(6))\n",
      "test_main.py": "from main import square, is_even\n\n\ndef test_square():\n    assert square(4) == 16\n    assert square(-3) == 9\n\n\ndef test_is_even():\n    assert is_even(8)\n    assert not is_even(7)\n",
      "README.md": "# Functions and Tests\nRun main.py, then choose Tests to run test_main.py. Change a function deliberately and look at the failed test.\n"
    }
  }
};
 const tracing={
  'practice-route-tag': {
   title:'Validate a Route Tag',
   folderName:'practice-route-tag',
   description:'Use a Boolean flag to enforce what can follow the first digit.',
   code:"def is_route_tag(tag):\n    if len(tag) < 2 or tag[0] != \"@\" or not tag[1].isalpha():\n        return False\n\n    seen_digit = False\n    for char in tag[2:]:\n        if char.isdigit():\n            # Before updating seen_digit, check for a first digit of 0.\n            seen_digit = True\n        elif char.isalpha():\n            # Use seen_digit to decide whether a letter can still appear.\n            pass\n        else:\n            return False\n\n    return True\n\nprint(is_route_tag(input(\"Route tag: \")))\n",
   task:"A route tag starts with @ and a letter, then can switch from letters to digits. Once digits start, letters may no longer appear. The first digit cannot be 0. Add these two checks to the starter. Predict and test @ab4, @ab40, @ab4c, @ab04, and @ab. Explain why a later zero can pass."
  },
  'practice-points-goal': {
   title:"Points Toward a Goal",
   folderName:"practice-points-goal",
   description:"Update the total only for accepted input.",
   code:"goal = 10\ntotal = 0\nwhile total < goal:\n    points = int(input(\"Points (2 or 4): \"))\n    if points in (2, 4):\n        total = total + points\n    print(\"Total:\", total)\nprint(\"Points past goal:\", total - goal)\n",
   task:"Trace the inputs 4, 3, 4, 2. For each pass record the input, whether it is accepted, and the total after the pass.",
   challenge:"Run the trace sequence. Then test 4, 4, 4. Change the goal to 12 and make a new test. Explain why 3 leaves the total alone."
  },
  'practice-mark-capitals': {
   title:"Mark the Capitals",
   folderName:"practice-mark-capitals",
   description:"Build a string one character at a time.",
   code:"message = \"Go Team!\"\nresult = \"\"\nfor char in message:\n    if char.isupper():\n        result = result + \"[\" + char.lower() + \"]\"\n    else:\n        result = result + char\nprint(result)\n",
   task:"Trace the first four characters: G, o, a space, and T. Record the character, the piece added, and the result so far.",
   challenge:"Run the example. Try Hi, Sam! and a message with zero capital letters. Change brackets to parentheses and predict the new output before running."
  },
  'practice-filter-message': {
   title:"Filter a Message",
   folderName:"practice-filter-message",
   description:"Skip characters while keeping the original text.",
   code:"message = \"X-ray x2!\"\nskip = \"xy\"\nresult = \"\"\nfor char in message:\n    if char.lower() in skip:\n        continue\n    result = result + char\nprint(result)\n",
   task:"Trace X, the dash, and r. Record the original character, the lowercase version, and whether the pass adds anything.",
   challenge:"Run the example. Try MIX, then try an empty message. Rewrite the loop with not in and no continue. Check that the output stays the same."
  },
  'practice-club-code': {
   title:"Validating Input",
   folderName:"practice-club-code",
   description:"Check several rules in a Boolean function.",
   code:"def is_club_code(code):\n    if not 3 <= len(code) <= 6 or code[:1] != \"@\":\n        return False\n    seen_digit = False\n    for char in code[1:]:\n        if char.isdigit():\n            if seen_digit:\n                return False\n            seen_digit = True\n        elif not char.isalpha():\n            return False\n    return True\n\nprint(is_club_code(input(\"Club code: \")))\n",
   task:"Trace @a2b and @a22. Start with the length and prefix checks, then track each character and seen_digit.",
   challenge:"Test @ab, @a2b, @a22, @a!, @a, @abcdef, and ab2. Then change the rule so a digit is required and retest @ab and @a2b."
  },
  'practice-supply-lookup': {
   title:"Dictionary Lookups",
   folderName:"practice-supply-lookup",
   description:"Look up a value by its key.",
   code:"supplies = {\"pencil\": 12, \"marker\": 5, \"ruler\": 3}\nitem = input(\"Supply: \").lower()\nif item in supplies:\n    print(\"In stock:\", supplies[item])\nelse:\n    print(\"Item not found\")\n",
   task:"Trace MARKER and glue. Record the normalized key, whether it exists, and what prints.",
   challenge:"Test pencil, MARKER, and glue. Add eraser with a count of 0. Explain why eraser should report 0 and an unknown item should report Item not found."
  },
  'trace-while-loops': {
   title:'Trace a While Loop',
   folderName:'trace-while-loops',
   description:'Track the condition, output, and next value in a countdown.',
   code:'number = 3\nwhile number > 0:\n    print(number)\n    number = number - 1\n',
   task:'Record the number, whether the condition is true, what prints, and the next number. Include the final check.'
  },
  'trace-for-loops': {
   title:'Trace a For Loop',
   folderName:'trace-for-loops',
   description:'Watch the loop variable and running total change.',
   code:'total = 0\nfor number in range(1, 6, 2):\n    total = total + number\nprint(total)\n',
   task:'Write down the values from range(). Record the total before and after each addition.'
  },
  'trace-break-continue': {
   title:'Trace Break and Continue',
   folderName:'trace-break-continue',
   description:'Compare skipping a pass with stopping a loop.',
   code:'for i in range(5):\n    if i == 2:\n        continue\n    print(i)\nprint("Done")\n',
   task:'Trace continue first. Then change continue to break, predict what will print, and record a new trace.'
  },
  'trace-nested-loops': {
   title:'Trace Nested Loops',
   folderName:'trace-nested-loops',
   description:'Track each row and column in the order they print.',
   code:'for row in range(2):\n    for column in range(3):\n        print(row, column)\n',
   task:'Record the pairs in print order. Watch when column starts over.'
  },
  "trace-boss-battle": {
   title:"Boss Battle",
   folderName:"trace-boss-battle",
   description:"How many hits will the boss take? What is its final health?",
   code:"health = 10\nwhile health > 0:\n    health = health - 3\n    print(health)\n",
   task:"How many hits will the boss take? What is its final health?",
   challenge:"Change the damage from 3 to 4. Predict and test how many hits it takes."
  },
  "trace-track-countdown": {
   title:"Track Countdown",
   folderName:"trace-track-countdown",
   description:"Which countdown values will print?",
   code:"seconds = 12\nwhile seconds > 0:\n    print(seconds)\n    seconds = seconds - 3\n",
   task:"Which countdown values will print?",
   challenge:"Change the loop so it also prints 0. Predict and test what happens when seconds starts at 0."
  },
  "trace-xp-tracker": {
   title:"XP Tracker",
   folderName:"trace-xp-tracker",
   description:"Predict the running XP total after each round.",
   code:"total_xp = 0\nfor xp in range(10, 41, 10):\n    total_xp = total_xp + xp\n    print(total_xp)\n",
   task:"Predict the running XP total after each round.",
   challenge:"Change the range so there is a fifth round worth 50 XP. Predict and test the new final total."
  },
  "trace-beat-counter": {
   title:"Beat Counter",
   folderName:"trace-beat-counter",
   description:"Which beat numbers will print?",
   code:"for beat in range(1, 9):\n    print(beat)\n",
   task:"Which beat numbers will print?",
   challenge:"Change the range so it prints only beats 2, 4, 6, and 8."
  },
  "trace-loot-scanner": {
   title:"Loot Scanner",
   folderName:"trace-loot-scanner",
   description:"Which items are collected? What is skipped, and what ends the search?",
   code:"loot = [\"coins\", \"broken sword\", \"potion\", \"legendary shield\", \"gem\"]\nfor item in loot:\n    if item == \"broken sword\":\n        continue\n    if item == \"legendary shield\":\n        break\n    print(\"Collected:\", item)\n",
   task:"Which items are collected? What is skipped, and what ends the search?",
   challenge:"Move the legendary shield before the potion. Predict and test which items are collected now."
  },
  "trace-playlist-preview": {
   title:"Playlist Preview",
   folderName:"trace-playlist-preview",
   description:"Which tracks play? Where does the preview stop?",
   code:"playlist = [\"Opening Beat\", \"skip\", \"Bass Drop\", \"end\", \"Encore\"]\nfor track in playlist:\n    if track == \"skip\":\n        continue\n    if track == \"end\":\n        break\n    print(\"Playing:\", track)\n",
   task:"Which tracks play? Where does the preview stop?",
   challenge:"Move end to the last spot. Predict and test which tracks play now."
  },
  "trace-enemy-waves": {
   title:"Enemy Waves",
   folderName:"trace-enemy-waves",
   description:"How many enemies spawn? When does the enemy number restart?",
   code:"for wave in range(1, 3):\n    for enemy in range(1, 4):\n        print(\"Wave\", wave, \"Enemy\", enemy)\n",
   task:"How many enemies spawn? When does the enemy number restart?",
   challenge:"Change the inner loop to spawn four enemies per wave. Predict and test the new total."
  },
  "trace-drum-machine": {
   title:"Drum Machine",
   folderName:"trace-drum-machine",
   description:"How many beats print? When does the beat number restart?",
   code:"for measure in range(1, 3):\n    for beat in range(1, 5):\n        print(\"Measure\", measure, \"Beat\", beat)\n",
   task:"How many beats print? When does the beat number restart?",
   challenge:"Change the inner loop to print three beats per measure. Predict and test the new total."
  }
 };
 function tracingStarter(id){
  if(!Object.hasOwn(tracing,id))return null;
  const {title,folderName,description,code,task,challenge}=tracing[id];
  const directions=[
   '# '+title,
   ...(id.startsWith('trace-')?['![Loop steps for '+title+'](assets/loop-guides/'+id+'.png)']:[]),
   'Predict the output in your student notes before you run the code.',
   task,
   'Select main.py and click Run to see the output.',
   'To trace, choose Debug → Record Trace, then use Next to step through the code.',
   'Compare the trace with your prediction. Record the actual output in your notes.',
   ...(challenge?['Change and test: '+challenge]:[])
  ].join('\n\n');
  return {id,title,folderName,description,entryFile:'main.py',files:{'main.py':code,'README.md':directions+'\n'}};
 }

 const difficultyFor=id=>id==='hello-world'?'Beginner':id.startsWith('practice-')?'Challenge':id.includes('nested')||id.includes('break')?'Intermediate':'Beginner';
 const groups=[{id:"start",title:"Getting Started"},{id:"skills",title:"Python Skills"},{id:"loops",title:"Loops & Tracing"},{id:"challenges",title:"Practice Challenges"}];
 function categoryFor(id){
  if(id==="hello-world")return "start";
  if(["loops-lists","functions-tests","practice-mark-capitals","practice-filter-message","practice-supply-lookup"].includes(id))return "skills";
  if(id.startsWith("trace-"))return "loops";
  return "challenges";
 }
 function catalog(){
  const originals=Object.keys(legacy).map(id=>({
   id,title:legacy[id].title,description:legacy[id].description,category:categoryFor(id),difficulty:difficultyFor(id),
   filename:'main.py',folderName:id,entryFile:'main.py'
  }));
  const traces=Object.keys(tracing).map(id=>({
   id,title:tracing[id].title,description:tracing[id].description,category:categoryFor(id),difficulty:difficultyFor(id),
   filename:'main.py',folderName:id,entryFile:'main.py'
  }));
  return [...originals,...traces];
 }
 const privateAssessments={
  'python-skills-pong':{
   id:'python-skills-pong',title:'Pong Scoreboard Challenge',folderName:'python-skills-pong',entryFile:'main.py',
   files:{
    'README.md':`# Python Skills & Problem-Solving Assessment
## Option A: Pong Scoreboard

**Your task:** Complete a simple scoreboard for three rounds of Pong. Write your own loop and conditional statements.

### Requirements
1. Ask for three whole-number scores using a \`for\` loop.
2. Add each score to \`total\` using ordinary assignment.
3. After the loop, use \`if\`, \`elif\`, and \`else\` to set \`rank\`:
   - **Champion**: total is 20 or higher
   - **Competitor**: total is 10 through 19
   - **Rookie**: total is below 10
4. Print the player name, total score, and rank.

The starter provides the name prompt and initial variable. Write the loop and classification yourself.

### Test your work
Try three different sets of scores:
- 3, 4, 2: Rookie (total 9)
- 5, 5, 5: Competitor (total 15)
- 8, 7, 5: Champion (total 20, boundary case)

### Submit
1. Save \`main.py\`.
2. Use Python Lab's file Download action to download the completed \`.py\` file.
3. Upload that file to the Google Form.
4. Paste the entire Python code into the paragraph response.
5. In the Form, report whether your three test cases passed and explain how your conditions choose the rank.
`,
    'main.py':`# Pong Scoreboard
# Read README.md before starting.

player = input("Player name: ").strip()
total = 0

# TODO 1: Write a for loop to ask for 3 round scores.
# TODO 2: Add each score to total.

# TODO 3: Write if, elif, and else to set rank.

# TODO 4: Print player, total, and rank.
`
   }
  },
  'python-skills-music':{
   id:'python-skills-music',title:'Music Listening Tracker Challenge',folderName:'python-skills-music',entryFile:'main.py',
   files:{
    'README.md':`# Python Skills & Problem-Solving Assessment
## Option B: Music Listening Tracker

**Your task:** Complete a tracker for three music-listening sessions. Write your own loop and conditional statements.

### Requirements
1. Ask for three whole-number listening times using a \`for\` loop.
2. Add each number of minutes to \`total\` using ordinary assignment.
3. After the loop, use \`if\`, \`elif\`, and \`else\` to set \`level\`:
   - **Superfan**: total is 60 or higher
   - **Regular**: total is 30 through 59
   - **Casual**: total is below 30
4. Print the listener name, total minutes, and level.

The starter provides the name prompt and initial variable. Write the loop and classification yourself.

### Test your work
Try three different sets of minutes:
- 5, 10, 10: Casual (total 25)
- 10, 15, 15: Regular (total 40)
- 20, 20, 20: Superfan (total 60, boundary case)

### Submit
1. Save \`main.py\`.
2. Use Python Lab's file Download action to download the completed \`.py\` file.
3. Upload that file to the Google Form.
4. Paste the entire Python code into the paragraph response.
5. In the Form, report whether your three test cases passed and explain how your conditions choose the level.
`,
    'main.py':`# Music Listening Tracker
# Read README.md before starting.

listener = input("Listener name: ").strip()
total = 0

# TODO 1: Write a for loop to ask for 3 listening times.
# TODO 2: Add each time to total.

# TODO 3: Write if, elif, and else to set level.

# TODO 4: Print listener, total, and level.
`
   }
  }
 };
 function get(id){
  if(Object.hasOwn(privateAssessments,id))return JSON.parse(JSON.stringify(privateAssessments[id]));
  const trace=tracingStarter(id);
  if(trace)return trace;
  const item=legacy[id];
  return item?{id,folderName:id,entryFile:'main.py',...JSON.parse(JSON.stringify(item))}:null;
 }
 function show(){
  render();
  const dialog=$('templatesDialog');
  if(dialog?.showModal&&!dialog.open)dialog.showModal();
 }
 function assignmentUrl(id){
  if(!get(id))throw Error('Unknown starter project');
  const url=new URL(window.location.href);
  url.search='';url.hash='';
  url.searchParams.set('starter',id);
  url.searchParams.set('assignment',Math.random().toString(36).slice(2,12));
  return url.toString();
 }
 async function copyLink(item,button){
  const link=assignmentUrl(item.id);
  try{
   if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(link);
    button.textContent='Copied for Canvas';
    return;
   }
  }catch{}
  const result=prompt('Copy this starter link into Canvas:',link);
  if(result!==null)button.textContent='Link available';
 }
 function render(){
  const host=$('templateGallery');if(!host)return;
  host.textContent='';
  const q=String($('templateSearch')?.value||'').trim().toLowerCase();
  const all=catalog();
  const category=$('templateCategory')?.value||'all';
  const found=all.filter(item=>(category==='all'||item.category===category)&&(!q||
   [item.title,item.description,item.filename,groups.find(g=>g.id===item.category)?.title||''].some(value=>value.toLowerCase().includes(q))));
  const count=$('templateCount');
  if(count)count.textContent='Showing '+found.length+' of '+all.length+' templates';
  if(!found.length){
   const p=document.createElement('p');
   p.className='analysis-empty';
   p.textContent='No matching templates. Try a different search.';
   host.append(p);return;
  }
  let previousCategory='';
  const ordered=groups.flatMap(group=>found.filter(item=>item.category===group.id));
  for(const item of ordered){
   if(item.category!==previousCategory){
    const heading=document.createElement('h4');heading.className='template-group-heading';
    heading.textContent=groups.find(group=>group.id===item.category)?.title||'More Templates';
    host.append(heading);previousCategory=item.category;
   }
   const card=document.createElement('div');card.className='template-option';
   const start=document.createElement('button');start.className='template-choice';
   const label=document.createElement('strong');label.textContent=item.title;
   const level=document.createElement('span');level.className='template-level';level.textContent=item.difficulty+' · '+(item.id.startsWith('trace-')?'Predict & trace':item.id.startsWith('practice-')?'Practice challenge':'Explore an example');
   const filename=document.createElement('span');filename.className='template-filename';
   filename.textContent=item.folderName+'/main.py';
   const description=document.createElement('span');description.textContent=item.description;
   start.append(label,level,description,filename);
   start.title='Open '+item.title+' as a new saved project';
   start.onclick=async()=>{
    if(start.disabled)return;
    start.disabled=true;
    try{
     const installed=await install?.(get(item.id));
     if(installed)$('templatesDialog')?.close?.();
    }catch(error){console.error('Template could not be opened',error);}
    finally{start.disabled=false;}
   };
   const actions=document.createElement('div');actions.className='template-card-actions';
   const share=document.createElement('button');share.className='template-link';
   share.textContent='Copy starter link';
   share.title='Share this starter project in Canvas';
   share.onclick=()=>copyLink(item,share);
   actions.append(share);
   card.append(start,actions);host.append(card);
  }
 }
 function attach(callback){install=callback;render();}
 $('templateBtn')?.addEventListener('click',show);
 $('templateClose')?.addEventListener('click',()=>$('templatesDialog')?.close?.());
 $('templateSearch')?.addEventListener('input',render);
 $('templateCategory')?.addEventListener('change',render);
 window.pythonLabTemplates={attach,show,get,assignmentUrl,render,catalog};
})();
