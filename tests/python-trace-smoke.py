"""Integration tests for Python Lab's replayable, bounded line tracer."""
import ast
import json
import tempfile
from pathlib import Path

HELPER = Path(__file__).resolve().parent.parent / "python-trace-helper.py"
HELPER_SOURCE = HELPER.read_text(encoding="utf8")
ast.parse(HELPER_SOURCE)


def execute_trace(files, main="main.py", answers=None, max_steps=450):
    root = Path(tempfile.mkdtemp(prefix="pl-debug-test-"))
    for name, source in files.items():
        target = root / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(source, encoding="utf8")
    namespace = {
        "__pl_trace_root": str(root),
        "__pl_trace_file": main,
        "__pl_trace_inputs": answers or [],
        "__pl_trace_args": [],
        "__pl_trace_limit": max_steps,
    }
    exec(compile(HELPER_SOURCE, str(HELPER), "exec"), namespace)
    result = json.loads(namespace["__pl_trace_result_json"])
    assert not root.exists(), "Temporary debug workspace was not cleaned up"
    return result


def test_loops_and_locals():
    result = execute_trace(
        {"main.py": "total = 0\nfor x in range(3):\n    total += x\nprint(total)\n"}
    )
    assert not result["error"], result["error"]
    assert len(result["frames"]) >= 5
    assert any("total" in frame["locals"] for frame in result["frames"])
    assert "3" in result["output"]
    assert result["frames"][-1]["function"] == "<completed>"
    assert "3" in result["frames"][-1]["output"]


def test_entered_input():
    result = execute_trace(
        {"main.py": 'name = input("Name? ")\nprint("Hello " + name)\n'},
        answers=["Alex"],
    )
    assert not result["error"], result["error"]
    assert "Name? Alex" in result["output"]
    assert "Hello Alex" in result["output"]


def test_missing_input_message():
    result = execute_trace({"main.py": 'name = input("Name? ")\nprint(name)\n'})
    assert "Add an answer" in result["error"], result["error"]


def test_project_imports():
    result = execute_trace(
        {
            "main.py": "from helper import add\nprint(add(2, 3))\n",
            "helper.py": "def add(a,b):\n    return a + b\n",
        }
    )
    assert not result["error"], result["error"]
    assert any(frame["file"] == "helper.py" for frame in result["frames"])
    assert "5" in result["output"]


def test_trace_limit():
    result = execute_trace(
        {"main.py": "value = 0\nwhile True:\n    value += 1\n"},
        max_steps=15,
    )
    assert result["truncated"] and len(result["frames"]) == 15
    assert "step" in result["error"].lower()


def test_exception_report():
    result = execute_trace({"main.py": "print(1 / 0)\n"})
    assert "ZeroDivisionError" in result["error"]


if __name__ == "__main__":
    for name in sorted(n for n in globals() if n.startswith("test_")):
        globals()[name]()
        print(name + ": passed")
    print("Recorded Python trace integration tests passed.")
