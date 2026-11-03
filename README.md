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

The bottom terminal panel can be resized by dragging the horizontal divider or collapsed with its arrow control. Use **Project ZIP** to export the workspace and **Import ZIP** (or the Command Palette) to restore a backup. Text files such as .txt, .csv, .json, and .md may be kept alongside Python files.

**Storage note:** Autosave still uses this browser's localStorage. It is not a cloud account or a durable backup. Export your Project ZIP regularly, especially before clearing browser data or changing devices.

**Runtime note:** The public GitHub Pages site still uses Pyodide and a simulated shell. Python's input() is implemented by replaying the program after each answer; this is not true paused execution and can repeat file writes or other side effects. The local-only terminal backend offers a real shell but must never be exposed as a public student server.

---

## Project management (browser edition)

In Explorer, **right-click a file or folder** to **Rename**, **Move** (enter a full project-relative destination path), or **Delete** (requires confirmation). Renaming or moving a folder updates its nested files and directories, including the open editor's path. The destination parent folder must already exist. Deleting a folder removes everything inside it and cannot be undone.

Use **Project ZIP** to export all project files and empty directories as a ZIP backup, and **Import ZIP** to restore a previous backup. **Download File** still exports only the currently open Python source file. ZIP generation requires the JSZip library to load from jsDelivr.

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
