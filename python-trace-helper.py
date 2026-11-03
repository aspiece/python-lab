"""Record a bounded, replayable trace of beginner Python code.

This is deliberately not a paused process: it executes the program in full once,
and the UI later replays the recorded line/locals snapshots.
"""
import builtins
import contextlib
import io
import json
import os
import shutil
import sys
import traceback

_root = __pl_trace_root
_file = __pl_trace_file
_path = os.path.join(_root, _file)
_cwd = os.path.dirname(_path)
_inputs = iter(__pl_trace_inputs)
_output = io.StringIO()
_frames = []
_error = ""
_truncated = False
_old_input = builtins.input
_old_trace = sys.gettrace()
_old_argv = sys.argv[:]
_old_path = sys.path[:]
_old_cwd = os.getcwd()
_max_steps = __pl_trace_limit


class _TraceLimit(Exception):
    pass


class _TraceInputMissing(Exception):
    pass


def _debug_input(prompt=""):
    _output.write(str(prompt))
    try:
        value = next(_inputs)
    except StopIteration:
        raise _TraceInputMissing(
            "Program requested more input. Add an answer in Debug Inputs "
            "(one per line) and run Trace again."
        )
    _output.write(str(value) + "\n")
    return str(value)


def _safe_repr(value):
    try:
        result = repr(value)
        return result[:160] + ("…" if len(result) > 160 else "")
    except Exception:
        return "<unavailable>"


def _in_project(frame):
    return frame.f_code.co_filename.startswith(_root + os.sep)


def _tracer(frame, event, arg):
    if not _in_project(frame):
        return _tracer
    if event == "line":
        if len(_frames) >= _max_steps:
            raise _TraceLimit()
        depth = 0
        parent = frame.f_back
        while parent:
            if _in_project(parent):
                depth += 1
            parent = parent.f_back
        values = {}
        for key, value in list(frame.f_locals.items())[:40]:
            if not str(key).startswith("__"):
                values[str(key)[:64]] = _safe_repr(value)
        _frames.append(
            {
                "file": os.path.relpath(frame.f_code.co_filename, _root).replace("\\", "/"),
                "line": frame.f_lineno,
                "function": frame.f_code.co_name,
                "depth": depth,
                "locals": values,
                "output": _output.getvalue()[-2000:],
            }
        )
    return _tracer


try:
    os.chdir(_cwd)
    sys.path[:0] = [_cwd, _root]
    sys.argv = [_path] + list(__pl_trace_args)
    builtins.input = _debug_input
    with contextlib.redirect_stdout(_output), contextlib.redirect_stderr(_output):
        try:
            sys.settrace(_tracer)
            with open(_path, encoding="utf-8") as fp:
                source = fp.read()
            exec(compile(source, _path, "exec"), {"__name__": "__main__", "__file__": _path})
        finally:
            sys.settrace(_old_trace)
except _TraceLimit:
    _truncated = True
    _error = "Trace stopped after " + str(_max_steps) + " steps. Check for long or infinite loops."
except BaseException as exc:
    _error = "".join(traceback.format_exception_only(type(exc), exc)).strip()[:1200]
finally:
    sys.settrace(_old_trace)
    builtins.input = _old_input
    sys.argv = _old_argv
    sys.path[:] = _old_path
    os.chdir(_old_cwd)
    # Clean project modules loaded from the temporary trace tree.
    for _modname, _module in list(sys.modules.items()):
        if getattr(_module, "__file__", "") and str(
            getattr(_module, "__file__", "")
        ).startswith(_root + os.sep):
            sys.modules.pop(_modname, None)
    try:
        shutil.rmtree(_root)
    except Exception:
        pass

__pl_trace_result_json = json.dumps(
    {
        "frames": _frames,
        "error": _error,
        "truncated": _truncated,
        "output": _output.getvalue()[-4000:],
    }
)
