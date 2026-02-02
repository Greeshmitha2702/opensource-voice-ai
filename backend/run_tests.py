from __future__ import annotations

import os
import sys


def main() -> int:
    """Docker-friendly test runner.

    Usage:
      python backend/run_tests.py
      python backend/run_tests.py -k tts

    It simply invokes pytest and returns the same exit code.
    """

    try:
        import pytest  # type: ignore
    except Exception:
        print("pytest is not installed. Did you install backend requirements?")
        return 2

    # Make sure repo root is on sys.path so `import backend...` works.
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if repo_root not in sys.path:
        sys.path.insert(0, repo_root)

    backend_dir = os.path.abspath(os.path.dirname(__file__))
    config_path = os.path.join(backend_dir, "pytest.ini")
    tests_path = os.path.join(backend_dir, "tests")

    args = ["-c", config_path, "--rootdir", backend_dir, tests_path, *sys.argv[1:]]
    return int(pytest.main(args))


if __name__ == "__main__":
    raise SystemExit(main())
