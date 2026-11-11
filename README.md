# Python Lab

A free browser-based Python workspace for students to write, run, debug, and test Python without a local installation.

**Open Python Lab:** https://ide.geneseelearninglab.com/

**Classification:** K–12 Educational Resource — Computer Science / Programming Instruction  
**Educational purpose and network-admin information:** https://ide.geneseelearninglab.com/about.html

## School network filtering / Lightspeed Filter

Python Lab is a classroom programming tool for students to write, run, test, and debug Python code. It is **not** a gaming, social networking, or chat website. For school IT review, the intended category is **Education / K–12 Educational Resources / Computer Science**.

If a school-managed device displays a Lightspeed block page, a district Lightspeed Filter administrator should use **Access Checker** (or **AccessScan**, where available) to identify the actual blocked URL, category, and policy, then evaluate recategorization or an approved allow rule. The retired Lightspeed Archive lookup is no longer available. Changing HTML labels does not automatically change district filtering policy.

- **Learning site:** `https://ide.geneseelearninglab.com/`
- **Educational description:** `https://ide.geneseelearninglab.com/about.html`
- **Supporting static code and libraries:** The editor and Python runtime load packages from `https://cdn.jsdelivr.net/`, including Monaco, JSZip, and Pyodide. Some optional Python packages may also require additional downloads. Investigate which exact asset URLs are being blocked rather than broadly approving a CDN without review.
- **Student work:** Projects are stored in that browser profile using IndexedDB; the site does not offer accounts or automatic cloud synchronization.
- **Source for technical review:** This public repository.

Classroom allowlisting must be approved by the district. Students should not attempt to bypass school filtering controls.

## What students can do

- Write Python using the Monaco editor, code completion, indentation, multiple files, and Explorer folders.
- Run Python with Pyodide and respond to interactive `input()` prompts.
- Practice basic terminal commands, including navigation and file management, in a **simulated** command line.
- Run `pytest` on their own test files and review test results.
- Use Debug Trace to record variable values, follow the executed lines, and inspect program output.
- Create and switch between separately saved local projects.
- Import a project ZIP or download individual files.
- Browse a small **Templates** gallery with general Python examples and tracing activities.
- Share a **general starter-template link** in Canvas. The link creates a separate project on the student's device; it does not include student answers.

## Current starter templates

The gallery groups the available student activities into four categories: **Getting Started**, **Python Skills**, **Loops & Tracing**, and **Practice Challenges**. Use the category dropdown or search to find a starter. Some examples include:

1. Hello, Python!
2. Loops and Lists
3. Functions and Tests
4. Trace a While Loop
5. Trace a For Loop
6. Trace Break and Continue
7. Trace Nested Loops

Open **Templates** in the top toolbar or use **Commands → Browse Python Starter Templates**. These activities generate a new folder without replacing an existing project or file.

## CS50P labs have been removed

The previous **41 CS50P problem-set starter labs**, the related starter gallery, and the **Move to Codespaces** handoff guide have been removed from Python Lab. The general Python editor, debugger, test runner, and classroom templates remain available.

**Existing student work is preserved.** Upgrading the website does not delete a browser's saved projects or folders, including projects created from the old CS50P starters. Those projects can still be opened, edited, tested, and exported. However, **previously shared CS50P starter URLs can no longer create a new CS50P lab**. Replace those links in Canvas if they are still in use.

The separate [CS50 Learning Companion](https://github.com/aspiece/cs50-learning-companion) VS Code extension remains unchanged. It continues to support CS50P coursework in GitHub Codespaces.

## Saving work safely

Python Lab saves projects using **IndexedDB** in the current browser profile. This is not a cloud account, and work does not automatically follow a student to another device. Existing browser data is not modified as part of the CS50 lab removal.

Students should export their projects before clearing site storage, switching devices, or using a private/incognito window. Classroom assignment links contain a starter ID and a random key, not a copy of the student's work or a shared cloud document.

The browser terminal is a simulation, **not** an authenticated remote machine. Python runs locally in the browser with Pyodide and browser security limits; some third-party Python modules and system-dependent programs may not work.

## Running and developing

This is a static GitHub Pages site. Open `index.html` using a local HTTP server to develop.

Main files:

- `index.html` — editor, menus, projects, templates, and debug panels
- `app.js` — workspace and editor interactions
- `classroom-templates.js` — organized student starter activities
- `project-store.js` — local project persistence and migration
- `python-worker.js` — browser Python runtime
- `browser-terminal.js` — terminal interactions
- `debugger.js`, `python-tracer.js`, and `python-trace-helper.py` — trace playback
- `styles.css` — responsive UI

The GitHub Actions workflow runs the JavaScript, terminal, debugger, project storage, classroom template, and Python tracing checks on updates.

## License

See [LICENSE](LICENSE).

## Student help and backups

The **Help & Backup** toolbar action provides a short searchable Python reference, a one-click ZIP export of the current project, and a connection check for core editor/runtime assets. The ZIP includes supported text files and folders, and can be restored through **Import ZIP**. It does not upload work to a server. Backup does not replace local autosave; students should download it before switching devices or clearing site data.

The connection check tests the site's own worker and CDN assets used for Monaco and JSZip. An error points to a possible network/filter issue but does not diagnose the district policy itself. Never use this tool to bypass filtering.

Template entries now distinguish examples, tracing exercises, and challenges by difficulty while preserving existing starter IDs and links.

## Student interface

Less-used file actions are grouped in the **Project** menu. Run stays visible. Debug Trace now prompts students to predict the next change before stepping through the recorded execution.

## Trace table and beginner assignments

The **Debug Trace** tab now uses a scrollable step table inside the existing bottom panel (no automatic resizing). Each row shows the step number, source line, code about to execute, local variables **before** the line runs, and program output so far. Click a row to inspect that step and highlight the matching source line. The trace is a replay of recorded execution, not an interactive paused process.

All 21 starter templates use expanded assignments (for example, `total = total + points` rather than `total += points`). The test suite checks every generated `.py` starter to prevent those compound operators from returning. These updates do not rewrite previously saved student projects.
