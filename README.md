# Python Lab

A free browser-based Python IDE with a VS Code-style code editor and local Python execution using Monaco Editor and Pyodide.

## Features
- Python syntax highlighting and automatic indentation
- Run and stop Python code entirely in your browser
- Output and error console
- Program Input pane for supplying answers to `input()`, one line at a time
- Automatic local saving, open `.py` files, and download code
- No account or server backend

## Run locally
From the project folder run:
```bash
python -m http.server 8000
```
Open http://localhost:8000. Python and editor dependencies load from jsDelivr and require an internet connection on first use.

## GitHub Pages deployment
In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**. Choose **main** and **/(root)**, then click **Save**. Once deployed the site URL is https://aspiece.github.io/python-lab/.

## Limitations
- One editable Python file at a time
- Browser storage is device-specific and may be deleted: download important work
- `input()` uses pre-entered answers, rather than live prompts
- Browser Python does not provide unrestricted operating system or filesystem access
- Long-running code may need the Stop button to restart the worker
- Classroom features are planned for future releases
