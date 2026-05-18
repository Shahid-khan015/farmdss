#!/usr/bin/env python3
"""
Launcher for backend/scripts/mock_iot_direct.py (transport-only IoT mock).

Uses PostgreSQL only (DATABASE_URL); run with the same env as the API.

From repo root:

  backend\\.venv\\Scripts\\python.exe scripts/mock_iot_direct.py --dry-run --once

From backend (so backend/.env is picked up by Settings):

  cd backend
  .venv\\Scripts\\python.exe scripts/mock_iot_direct.py
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
_BACKEND_SCRIPT = _ROOT / "backend" / "scripts" / "mock_iot_direct.py"


def main() -> None:
    if not _BACKEND_SCRIPT.is_file():
        print(f"Expected script at {_BACKEND_SCRIPT}", file=sys.stderr)
        sys.exit(1)
    raise SystemExit(subprocess.call([sys.executable, str(_BACKEND_SCRIPT), *sys.argv[1:]]))


if __name__ == "__main__":
    main()
