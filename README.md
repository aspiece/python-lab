# CS50P: Bring Files Your Code Needs

Every CS50P `README.md` now reminds students to bring any other files their code reads into the matching folder in CS50 Codespaces. These can include an input CSV, a picture, another Python module, or a file they made themselves. Keep the original file names so the code can find them.

Some problems now have a list of CS50 sample files and direct links to get them:

- **Pizza Py:** `sicilian.csv` and `regular.csv` (sample menus).
- **Scourgify:** `before.csv` (sample input; the code makes `after.csv`).
- **CS50 P-Shirt:** `shirt.png` (shirt picture), plus sample photos from `muppets.zip` when testing.
- **CS50 Shirtificate:** `shirtificate.png` (shirt picture; the generated PDF does not need to be submitted).
- **Lines of Code:** A second Python file the student chooses to count.

The **CS50 Submit** panel shows these supporting files in a separate section. **Files needed to run or test a program are not always files that CS50 expects students to submit.** Students should follow the official task page for the final file list. Keep the Python Lab `README.md` as a local help sheet.

---

# Student Guides: Read the README First

The **41 CS50P starter problems** now keep the full writing steps, self-check questions, word help, and CS50 Codespaces instructions in each assignment's `README.md`. The `.py` files stay short, with only a few TODO notes and any starter code needed to begin. The student directions use short sentences and common words for a **7th–8th grade reading level**.

**CS50 Codespaces transfer:** Move only the Python code file or files needed for the problem into its matching folder. For example, `indoor/indoor.py` needs only `indoor.py`, while `test_fuel/` needs both `fuel.py` and `test_fuel.py`. The Python Lab `README.md` is a **help sheet**, not a file students need to send to CS50. Also copy any data, images, or other Python files your program needs to run. The starter README now lists known CS50 sample files and where to get them. Do not send extra files unless the official problem asks for them. The **CS50 Submit** panel lists only Python files.

Each student's README includes a link to the full CS50 task, plain-language steps, short definitions, ideas for testing, and links/commands for Codespaces. The official CS50 instructions remain the final source for submission rules.

---

# File Downloads and Browser Terminal (November 2026)

**Download individual files** from the Explorer: right-click a file and select **Download File**. Files download under their own filenames, not entire folder paths. The context-menu action appears for files only; there are no Project ZIP, Submission ZIP, or CS50 Assignment ZIP download buttons. Existing ZIP archives can still be imported.

**Supported simulated CLI commands:** `help`, `pwd`, `whoami`, `ls`/`dir`, `tree`, `cd`, `mkdir [-p]`, `rmdir`, `touch`, `cat`/`type`, `echo`, `cp`, `mv`, `rm`, `clear`/`cls`, `python`/`python3` (files or `-c`), and `pytest`/`python -m pytest` (optionally with a test file or folder). File paths can be quoted and are resolved relative to the terminal working directory. Pytest is scoped to the working folder or selected test paths, rather than unintentionally running other assignments.

The terminal is **not an unrestricted system shell**: commands such as `pip install`, `submit50`, and `check50` require an appropriate external environment or special handling. `pip list` explains that full package listing is not available, while the official Python `cs50` package is automatically provisioned where browser dependencies allow. Direct CS50 submissions still require the official authenticated Codespace.

---

# CS50 Python Library and Official Submission Handoff

Python Lab now has a **CS50 Submit** handoff panel. It does **not** send files or user credentials to CS50; a submission is not complete until the official `submit50` tool reports success in a real authenticated Codespace.

1. Open or edit a CS50P problem in the Python Lab editor.
2. Click **CS50 Submit**, use the new entry in **CS50P Starters**, or open **Prepare Official CS50 Submission** in the Command Palette.
3. Choose the assignment. The panel displays the official instructions link and the `check50` and `submit50` commands constructed from the course's 2022 CS50P problem slug. **Always double-check the exact slug against the current assignment instructions**, which are authoritative.
4. Right-click each assignment source file in Explorer and select **Download File**. Upload these individual files into the correct folder in your CS50 Codespace. Different versions such as `indoor/` and `indoor-2/` are kept separate in the browser; download the specific files you want to transfer. Downloading is **not** an official submission.
5. Open **[CS50 Codespaces](https://cs50.dev/)** with your own authorized GitHub account, upload/extract the assignment folder, open its directory, and run the copied commands there. Verify submission at the official terminal/gradebook. Harvard's [submit50 documentation](https://cs50.readthedocs.io/submit50/) explains its authorization and real Git operations.

**CS50 Python loads automatically.** On every new Python Lab browser runtime, Pyodide attempts to preload the official `cs50==9.5.0` Python package using `micropip` and verifies `import cs50` before marking the runtime ready. Students never need to click Install or run a pip command. Browsers cache downloaded packages, although a restarted sandbox still initializes its own Python environment. The CS50 Submit panel reports whether the package loaded. If a WebAssembly-incompatible dependency or network restriction prevents loading, Python Lab reports that limitation and continues to support regular Python. The initial load can take longer because CS50 pulls in additional dependencies; subsequent downloads may benefit from browser caching. This is **automatic provisioning, not an offline-embedded library or a guarantee of full compatibility**. The `cs50` Python library remains distinct from the `submit50` command-line tool; neither direct GitHub OAuth nor automatic official CS50 submissions is implemented.

Do not enter personal GitHub access tokens, passwords, or authentication codes into the simulated Python Lab terminal.

---

# CS50P starters: guided, exception-free, assignment-named folders

All 41 **CS50P Starters** now put their full plan and test tips in `README.md`. The Python files keep short TODO comments and starter code. The student README uses brief steps, plain-language definitions, and a link to the official CS50 problem.

Select **Indoor Voice** to create `indoor/indoor.py` (plus `indoor/README.md`). Choosing the same assignment again creates `indoor-2/indoor.py` without overwriting the first. Other assignments follow their official problem slugs, for example `test_fuel/test_fuel.py`, with the related `fuel.py` in the same folder.

The generated starter **does not throw a forced NotImplementedError**. Empty functions and methods use `pass` so students can fill in the logic themselves. Unfinished pytest functions use `pytest.skip(...)` until the student adds meaningful assertions, avoiding falsely passing tests.

Canvas starter links retain their identifiers; an assignment opened in a separate student project is named after its problem folder (such as `indoor`) and stores `indoor.py` at that project root. Older student projects and folders are not automatically renamed or modified. The public starter code contains no working solutions from the private instructor reference repository.

---

## Reference-aligned CS50P scaffolds and spacing

The CS50P starter gallery retains all 41 existing problem links and filenames. The original, unsolved starter scaffolds now better reflect the expected shape of reference implementations:

- Top-level exercises begin as top-level scripts rather than being forced into a main() wrapper.
- Where useful, students receive the expected function/class signatures and import statements, without implementations or completed test assertions.
- Example test files include empty, descriptively named pytest functions. They must be completed by students.
- Later exercises needing CSV libraries, regular expressions, Pillow, inflect, validators, or fpdf2 include the corresponding import statements and a README note about browser limitations.

The **CS50P Starters** menu now uses a two-column card grid on larger screens and a single column on phones, with consistent padding, card actions, and scrollable problem-set sections.

**Student privacy and course integrity:** Python Lab does not fetch the instructor's private reference repository in student browsers and does not distribute its working solutions. The scaffolds are authored for Python Lab as unsolved learning aids.

---

# CS50P Starter Code Gallery — 41 Problems (November 2026)

Python Lab's **CS50P Starters** gallery contains **41 original, unsolved scaffolds** corresponding to every assignment listed in [Harvard's CS50 Introduction to Programming with Python Problem Sets 0–8](https://cs50.harvard.edu/python/psets/).

The gallery is grouped by problem set, with search and a dropdown filter:

| Problem set | Topic | Problems |
| --- | --- | ---: |
| 0 | Functions, Variables | 5 |
| 1 | Conditionals | 5 |
| 2 | Loops | 5 |
| 3 | Exceptions | 4 |
| 4 | Libraries | 6 |
| 5 | Unit Tests | 4 |
| 6 | File I/O | 4 |
| 7 | Regular Expressions | 5 |
| 8 | Object-Oriented Programming | 3 |

### Starter creation

Select **CS50P Starters**, choose a problem, and click its card. The workspace creates a **separate folder named for the official assignment slug**, with its expected Python file (such as `indoor/indoor.py`), short TODO hints, and a README with the full steps.

Problem Set 5 includes both the student's implementation module (for example, fuel.py) and its test_fuel.py file, which opens automatically. Later assignments that require testing include matching unsolved test-file scaffolds. Students must complete the TODOs and create their own test assertions. Function stubs use `pass`, and uncompleted pytest stubs are explicitly skipped. This library does **not** include completed solutions or answer keys.

Open **Official instructions** from a problem card or select **Copy assignment link** to share a reusable student starter link through Canvas. Returning to the same link in the same browser profile reopens that student's saved assignment.

### Environment limitations

These are **Python Lab-authored, unofficial** starter files, not exact copies of starter files distributed by Harvard. The official problem pages remain the definitive specifications. Some assignments require external libraries (such as emoji, pyfiglet, inflect, requests, Pillow, or fpdf2), images, CSVs, internet APIs, or a real operating-system shell. GitHub Pages cannot guarantee all of those capabilities; affected starter READMEs include an environment note.

Official check50, submit50, and CS50 grading are not included in Python Lab. Students doing CS50 coursework must follow Harvard's [Academic Honesty](https://cs50.harvard.edu/python/honesty/) requirements and use authorized testing and submission environments.

---

## Editor-style terminal input (November 2026)

The public GitHub Pages terminal now has an inline **native text editor at the active `$` prompt**, using the same monospace font sizing and cursor behavior as the code workspace.

- Click the prompt and type directly. Click inside your command to reposition the caret, highlight text with the mouse or Shift+arrow keys, and use normal copy/paste, cut, and undo/redo.
- **Enter** runs the current simulated command or submits one Python `input()` answer. **Shift+Enter** adds a newline while preparing a longer command.
- **Up/Down** recalls simulated shell history. **Tab** completes shell command/file names; when answering a Python prompt, Tab inserts spaces.
- **Ctrl/Cmd+L** clears output, while **Ctrl/Cmd+C** copies selected input text or interrupts the current input when nothing is selected.
- Python `input("...")` prompts appear immediately beside the editable input field, rather than in a separate text box.

The command output above the prompt remains read-only but selectable and copyable. This interface does not grant a real system shell or remove Pyodide's replay-based Python input limitation. The optional localhost backend still uses its own real xterm terminal.

---

# Phase 5 — Student Projects and Classroom Workflow

Python Lab now supports **multiple named local projects**. Use the project selector beside the Python Lab title to open, create, rename, or delete projects. Files, folders, open editor tabs, cursor state where supported, and breakpoints are saved separately per project.

## Where student work is saved

- Python Lab primarily saves projects in **IndexedDB in the current browser profile**. Existing work from the original Python Lab localStorage workspace is migrated into the first project automatically.
- If IndexedDB is unavailable, the app attempts a limited localStorage fallback. When browser storage is blocked altogether, the app warns that work is temporary.
- **This is not cloud synchronization or a school-account login.** Work does not automatically transfer between school computers, home computers, phones, private browsing sessions, or different browsers. Students should periodically download their important individual files using **Explorer → right-click file → Download File**, especially on shared school computers.
- The application does not send student source files or project contents to a Python Lab server. Browser execution may still make network requests if student code does so.

## Canvas assignment workflow

1. A teacher opens **Templates** and chooses **Copy assignment link** beside an original starter example. The link contains only a starter template identifier and a random classroom-link key, not a student's files or identity. Paste that link into Canvas.
2. A student opens the link, confirms the new project, and works in Python Lab. Returning through the **same link on the same browser profile** reopens that saved project rather than creating a duplicate.
3. The student right-clicks each required source file in Explorer, selects **Download File**, and uploads the downloaded files through Canvas. Python Lab does **not** directly submit to Canvas or report a grade.
4. The teacher can open the downloaded source files individually; **Import ZIP** remains available for older ZIP archives. Imported files are limited to supported text formats.

Project sharing is **starter-only**. Do not use a starter link as a way to collect student answers or distribute private grading data. The original CS50P-style example is not an official Harvard assignment. Use the official CS50 environment for check50 and submit50.

Cloud persistence with Google or Microsoft accounts and Canvas-authenticated assignment hand-in would require a separately approved, privacy-reviewed authenticated backend. It is not part of this static GitHub Pages release.

---

# Phase 4 — Recorded Debug Traces and Classroom Starter Projects

Python Lab now includes a beginner-friendly **Debug Trace** panel. Click **Debug** (or use the Command Palette) to record a trace of the selected Python script. Enter any input answers one per line. The program executes once inside a temporary Pyodide project copy; the editor then replays the recorded line-by-line snapshots.

To inspect a trace:

1. Click the editor's line-number gutter or press **F9** to add a breakpoint (red dot).
2. Choose **Debug → Record Trace** and enter any required inputs. The tracer records at most **450 line events** to guard against runaway loops.
3. Use **Next** or **F11** to advance one recorded line, **Back** to revisit earlier snapshots, and **Step Over** or **F10** to skip nested function frames. **Continue** jumps to the next breakpoint or the final snapshot.
4. Inspect the local variables and output-so-far panels. Variables reflect the moment **before** the highlighted Python line executes.

**This is recorded trace playback, not a live paused debugger.** Breakpoints mark positions in the recorded history rather than interrupting execution. Back does not undo side effects. Each trace executes code once in a temporary project directory, but imported packages, network requests, and external effects are not sandboxed. The trace cap limits ordinary Python loops; code that blocks inside native libraries may still require **Stop**. Existing saved project files are not replaced by trace results. The trace uses Pyodide and supports project-relative imports, but is not a replacement for VS Code's full debugger.

### Beginner starter gallery

Select **Templates** or **Create Starter Project** from the Command Palette to create a separately named project folder with starter files. Available examples: Hello Python, Loops and Lists, Functions and Tests, and CS50P-style Practice. Repeated imports create suffixed folders such as hello-world-2 instead of overwriting student work.

The CS50P-style sample is an original practice exercise, **not** an official Harvard CS50 problem set or submission environment.

---

## Phase 3 — Smart Python editor (GitHub Pages)

Python Lab now provides lightweight Python IntelliSense in Monaco: Python keywords, common built-in functions with hover help, reusable code snippets (for loops, conditionals, functions, classes, try/except, and file access), and simple project identifier completion. These suggestions are intended as beginner assistance, **not** a complete Python language server or static type checker.

### Python Problems panel

The **Problems** tab automatically checks project .py files with the Python **ast.parse** parser in the Pyodide worker after editing settles. Syntax errors are underlined in Monaco and listed by file, line, and column. Select a problem to jump directly to its location. This checks Python grammar and indentation; it does not detect all runtime errors, logic mistakes, type errors, or undefined variables. Diagnostics are skipped for exceptionally large Python files.

### Test Results panel

Use **▶ Tests**, the Command Palette's **Run Tests**, or the simulated `python -m pytest` command to run the project's test_*.py files. The **Test Results** tab shows individual passed, failed, skipped, and collection-error cases, with clickable file locations and failure details when pytest supplies them. The terminal remains available for the full pytest log.

**Limitations:** pytest runs in Pyodide and may not support packages or plugins needing native binaries, filesystem permissions, or external services. The public site's input() simulation still replays the script after answers, as described below. Students should use the official CS50 environment for check50/submit50 and official grading.

---

## Phase 2 — Enhanced browser terminal (GitHub Pages)

Python Lab now uses **xterm.js** to render a VS Code-style simulated terminal in the public GitHub Pages app. The terminal supports command history (↑/↓), backspace and cursor navigation, basic Tab completion, clear screen (Ctrl+L), and Ctrl+C to stop a running Python program. If xterm.js cannot load, the previous HTML-based terminal remains available.

Supported browser commands include:

- Run: `python FILE.py [args]`, `python -c "CODE"`, `python -m pytest`, `pytest`
- Navigate: `pwd`, `ls`, `tree`, `cd`, `mkdir -p`
- Files: `cat`, `touch`, `cp`, `rm`
- Other: `echo`, `whoami`, `clear`, `help`

These are **simulated commands** mapped to the workspace. They do not invoke a real operating-system shell. Native CLI tools (for example, `submit50`, `check50`, a full `pip install` workflow, or arbitrary shell processes) remain unavailable on the static public site.

### Input behavior

Python prompts such as `input("Name: ")` now render without an unwanted newline; typing occurs at that prompt. On each input response, the browser reruns the program using the previously collected answers. The terminal suppresses repeated output when it matches the previous run and resets local workspace file contents to the run's original snapshot, reducing duplicated file writes. **This is not a truly paused Python process**: random data, clock values, external requests, irreversible side effects, and import-time state can still change or repeat. Use a real Python environment for coursework that relies on those semantics.

The simulated terminal is independent of the optional localhost backend. The backend continues to provide the real shell only when the app runs locally at http://127.0.0.1:8000. Do not expose the localhost backend to the public internet.

---

# Python Lab — VS Code-inspired browser workspace

Public site: https://aspiece.github.io/python-lab/

## Workspace shortcuts (Phase 1)

| Shortcut | Action |
| --- | --- |
| Ctrl/Cmd+P | Quick Open: switch to a project file |
| Ctrl/Cmd+Shift+P | Command Palette |
| Ctrl/Cmd+B | Show or hide Explorer |
| Ctrl/Cmd+Backtick | Focus the browser terminal |
| Ctrl/Cmd+Tab | Next open editor tab |
| Ctrl/Cmd+W | Close current editor tab (at least one stays open) |
| Ctrl/Cmd+S | Save workspace in this browser |
| Ctrl/Cmd+Shift+S | Download the current file |
| Ctrl/Cmd+Enter | Run the selected Python file |

The editor now keeps a separate Monaco model per open file, preserving normal undo history when switching between files, as well as cursor position and view state. Open files appear in closable tabs. Explorer supports nested folders, file and folder creation, and rename/move/delete from the right-click menu. On narrow screens, use the Explorer icon in the left rail to open the file tree.

The bottom terminal panel can be resized by dragging the horizontal divider or collapsed with its arrow control. Right-click a file in Explorer to download it, and use **Import ZIP** (or the Command Palette) to restore an older ZIP backup. Text files such as .txt, .csv, .json, and .md may be kept alongside Python files.

**Storage note:** Autosave still uses this browser's localStorage. It is not a cloud account or a durable backup. Download important files individually from Explorer before clearing browser data or changing devices.

**Runtime note:** The public GitHub Pages site still uses Pyodide and a simulated shell. Python's input() is implemented by replaying the program after each answer; this is not true paused execution and can repeat file writes or other side effects. The local-only terminal backend offers a real shell but must never be exposed as a public student server.

---

## Project management (browser edition)

In Explorer, **right-click a file or folder** to **Rename**, **Move** (enter a full project-relative destination path), or **Delete** (requires confirmation). Renaming or moving a folder updates its nested files and directories, including the open editor's path. The destination parent folder must already exist. Deleting a folder removes everything inside it and cannot be undone.

Use **Explorer → right-click a file → Download File** to save that exact `.py`, `.txt`, `.csv`, `.json` or `.md` file to your computer. There are no longer ZIP export buttons. **Import ZIP** remains available for existing ZIP archives and uses JSZip from jsDelivr.

This workspace lives in the current browser's local storage, so downloading project backups is recommended. The public site still uses a simulated terminal and replay-based input.

## Project folders (browser edition)

Create folders using **+ New folder** in Explorer or terminal commands:

```text
mkdir week0
cd week0
touch hello.py
ls
pwd
cd ..
mkdir -p week1/tests
```

Folders appear in Explorer and are saved in browser local storage alongside Python files. Click a folder to make it your current terminal directory. Use **+ Add file** and specify `week0/hello.py` to organize a new file; nested directories are mirrored in Pyodide's virtual filesystem so Python scripts can access project-relative files. `ls` lists the current directory (or a specified directory). This is a simulated filesystem, not your computer's real filesystem. Keep backups by downloading important files.

## Browser simulated terminal (GitHub Pages)

The public website accepts a subset of simulated shell commands in the terminal: `help`, `python FILE.py [args]`, `python -m pytest`, `pytest`, `ls`/`dir`, `pwd`, `cat FILE`, `touch FILE`, `clear`/`cls`. Command history: Up/Down arrows. Python code executes using Pyodide. Directory navigation works in the simulated project workspace; direct `pip install` and arbitrary system commands are not supported.

**Interactive input limitation:** Python `input()` currently uses a replay strategy: each additional answer re-executes the Python script with accumulated answers. This is NOT a true paused process and may repeat side effects; a future implementation needs a different runtime strategy. Do not use it for coursework relying on nondeterminism or persistent file side effects.

# Python Lab

A free, browser-based Python IDE powered by Monaco Editor and Pyodide. Public site: https://aspiece.github.io/python-lab/

## Current features
- Run Python in a Web Worker, with visible initialization errors, status and Stop
- Syntax highlighting, local autosave, Python file import/export
- Multiple editable Python source files in browser storage
- Terminal-style input prompt: type a response in the terminal and press Enter when the program asks for input (initial implementation replays the program with prior answers, so code with side effects may run more than once)
- Command-line arguments for `sys.argv`
- Test button to run `test_*.py` files with `pytest`
- Attempts to install several pure-Python CS50P libraries (emoji, pyfiglet, inflect, requests, validators, tabulate, cowsay); Pyodide includes pytest and Pillow

## CS50P compatibility
**Not an equivalent replacement for CS50 Codespaces.** Simple exercises can run here, and more CS50P features are being added. However browser restrictions mean:
- Input is entered in the terminal when requested, but currently uses replay rather than a suspended process; programs with side effects, random values, persistent state, or file writes can behave differently than native Python
- Network calls (including requests to external APIs) depend on CORS and may fail
- Some packages with native dependencies are unavailable
- Work is stored locally in the browser; download and back up important files
- `check50`, `submit50`, and other external CLI tools are **not supported**
- CS50P final projects might need filesystem, packages, or system facilities not available in Pyodide

For official grading and submission, use https://cs50.dev/ as directed by CS50.

## Troubleshooting
If **Run** remains disabled, wait for Python initialization to finish. The browser needs access to jsDelivr to download the Python WebAssembly runtime. Open your browser's developer console for errors or reload with Ctrl+Shift+R. If the worker fails, the interface will display the error.

## Local development
```bash
python -m http.server 8000
```
Open http://localhost:8000. Do not open `index.html` directly from the filesystem.

## Hosting
GitHub Pages: Settings → Pages → Deploy from branch → main → /(root).

## Roadmap
Live interactive terminal; binary file support; test/run configurations; reliable CS50P package catalog; classroom assignment templates.


## Local real terminal (CS50P)

The public GitHub Pages website remains browser-only. For actual terminal input, Python CLI tools, pip and pytest, run the local backend:

1. Install Python 3.12+ (on Windows check **Add Python to PATH**).
2. Download this repository (Code → Download ZIP) or run `git clone https://github.com/aspiece/python-lab.git`.
3. Open a terminal inside the repository folder.
4. On Windows:
   ```powershell
   py -m venv .venv
   .venv\\Scripts\\activate
   python -m pip install -r requirements.txt
   python server.py
   ```
   On macOS/Linux:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   python -m pip install -r requirements.txt
   python server.py
   ```
5. Open **http://127.0.0.1:8000** (not the GitHub Pages URL).
6. Type commands in the terminal: `python main.py`, `python -m pytest -q`, `python -m pip install pytest`, `dir` (Windows), `ls` (macOS/Linux). Run and Tests sync the current editor workspace to a temporary terminal directory.

**Important:** This locally bound development backend launches real shell commands with your computer's permissions. It is **not sandboxed**. Run only on a machine you control. Do not expose port 8000 to the internet, reverse proxy it, disable the localhost restriction, or use it as a public student server. Each connection uses an ephemeral workspace deleted on disconnect; files written only in the terminal will not automatically sync back into the editor. A production classroom deployment requires per-user isolated containers or microVMs, access controls, and resource limits.

If the shell does not start on Windows, confirm `pywinpty` installed successfully in your virtual environment. An internet connection is still required for the editor and runtime CDN assets.
