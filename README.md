## Browser simulated terminal (GitHub Pages)

The public website now accepts a subset of commands directly in its terminal input field: `help`, `python FILE.py [args]`, `python -m pytest`, `pytest`, `ls`/`dir`, `pwd`, `cat FILE`, `touch FILE`, `clear`/`cls`. Command history: Up/Down arrows. Python code executes using Pyodide. `pip install`, directory navigation, and arbitrary system commands are not fully supported.

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
Live interactive terminal; complete workspace file manager (including CSV/image/binary files); per-project archives; test/run configurations; reliable CS50P package catalog; classroom assignment templates.


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
