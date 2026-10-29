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
