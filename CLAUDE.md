# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Decision Support System (DSS) for tractor–implement matching in Indian agriculture. A FastAPI + PostgreSQL backend implements agricultural-engineering performance models (draft, traction, slip, ballast, fuel, field capacity) and ingests live IoT telemetry from Adafruit IO; an Expo/React Native app is the client. Roles: `farmer`, `operator`, `owner`, `researcher`.

Monorepo layout: `backend/` (FastAPI), `frontend/` (Expo), `docs/`, `scripts/`, `docker-compose.yml` (Postgres only).

## Commands

### Backend (run from `backend/`, Python **3.9**)

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

alembic upgrade head                                        # migrations
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000    # API; docs at /docs, health at /health

pytest                                                       # all tests
pytest tests/test_legacy_algorithms.py                       # one file
pytest tests/test_legacy_algorithms.py::test_draft_force_matches_dss_equation   # one test
pytest -k "ballast"                                          # by name
```

Postgres via `docker compose up -d` from the repo root (db `tractor_dss`, user `postgres`).

There is no linter or formatter configured in this repo.

### Frontend (run from `frontend/`)

```powershell
npm install
npm start          # expo start
npm run android    # expo run:android
npm run web
npm run typecheck  # tsc --noEmit; currently clean, keep it that way
```

No test runner or linter is configured on the frontend; `typecheck` is the only
automated gate.

### Local scripts (from `backend/`)

- `python scripts/mock_iot_simulator.py --help` — feeds synthetic or real Adafruit rows through the **in-process** pipeline (`process_iot_data` → `ingest_reading`). There is no HTTP ingest endpoint; this is the only way to inject IoT data locally.
- `python scripts/smoke_test_api.py`, `python scripts/legacy_regression_cases.py` — hit a running API on `127.0.0.1:8000`.

## Environment gotchas

- **Python 3.9.** Every module starts with `from __future__ import annotations`, so `X | None` and `list[...]` appear in annotations, but must not be used at runtime (no `match`, no runtime PEP 604 unions).
- **SQLite fallback:** `app/database.py` silently falls back to `sqlite:///./tractor_dss.db` when Postgres is unreachable **and** `DEBUG=True`, and `main.py` then runs `Base.metadata.create_all` instead of migrations. A "working" app therefore doesn't prove Postgres or Alembic is healthy — check `engine.url` when debugging schema issues.
- **Startup seeding:** `seed_library_if_empty` inserts a catalogue of library tractors/implements (`is_library=True`) on every startup if none exist.
- `backend/.env` and `frontend/.env` are committed and contain real-shaped config; `.env.example` files referenced in the READMEs do not exist.
- Frontend `api.ts` rewrites `localhost` → `10.0.2.2` on Android unless `EXPO_PUBLIC_ANDROID_USE_ADB_REVERSE=true`, and downgrades `https://localhost` to `http`. Restart Expo after editing `.env`.

## Backend architecture

Two route trees are mounted, and they do not follow the same convention:

- `app/api/v1/` — the "v1 REST" tree. `api.py` aggregates `tractors`, `tires`, `implements`, `operating-conditions`, `simulations`, `iot`; mounted in `main.py` under `settings.API_V1_PREFIX`. These routers declare **no** prefix of their own.
- `app/routes/` — later feature routers that **hard-code their full path** (`/api/v1/sessions`, `/api/v1/alerts`, `/api/v1/reports`, `/api/v1/operation-charges`) and are mounted with no prefix. `auth.py` is the exception: prefix `/auth`, mounted under `API_V1_PREFIX`.
- `app/routes/wages.py` still exists but is **deliberately not mounted** — superseded by `operation_charges.py`.

Layering inside the v1 tree is `routes → crud (CRUDBase generic) → models`, with Pydantic schemas in `app/schemas/`. The `app/routes/` feature routers mostly skip CRUD and query the ORM directly, delegating logic to `app/services/`.

Auth is JWT bearer via `app/middleware/auth.py`: `get_current_user` (requires `type == "access"`) and `require_role([...])` as a dependency factory. Access/refresh tokens are also persisted in `user_sessions`.

**Known auth bug:** the JWT payload varies only per whole second, so two logins for the same user inside one second mint an identical token and violate `uq_user_sessions_access_token` (500). It shows up as "register then immediately log in" failing. Add a `jti`/issued-at nonce to fix.

### Simulation engine (`app/core/`) — the heart of the project

Three DSS modes, keyed by `SimulationCombinationType`:

| Mode | Module | Entry point |
|---|---|---|
| `single` | `legacy_algorithms.py` (DSS Section 3) | `calculate_legacy_performance` |
| `passive_passive` | `combi_algorithms.py` (Section 4) | `calculate_passive_passive_performance` |
| `active_passive` | `combi_algorithms.py` (Section 5) | `calculate_active_passive_performance` |

All three share `dss_shared.py`.

`dss_shared.py` holds the primitives all three modes share — the single Eq. 3.1 draft kernel, geometry terms, wheel response, field capacity, the power/fuel chain, the result envelope, and the numeric-safety guards (`require_positive`, `safe_div`, `safe_sqrt`, …). It must **not** import from `legacy_algorithms` or `combi_algorithms`; they import from it. `combi_algorithms` builds on `legacy_algorithms` rather than duplicating the math; it adds combined/effective draft, the combination axle-load moment balances and the PTO rotor sub-model. `performance_calculator.py` is a thin adapter mapping `PerformanceInputs` → `LegacyInputs`.

Important conventions when touching this code:

- The formulas are transcribed from `docs/Simulation for DSS _Sahid.docx`. **`docs/SIMULATION_ENGINE_FORMULAS.md` is the authoritative map from code to document**, tagging every formula `DSS-EXACT | DSS-AMBIGUOUS | IMPLEMENTATION-ASSUMPTION | LEGACY | EXTERNAL-MODEL`. Read it before changing any formula, and update it when you do.
- The document's equations are embedded objects, not text: Sections 4–5 as PNGs, Section 3 as WMF/OLE. The WMF renderer garbles them — parse the WMF `ExtTextOut` records (glyph + x/y) to read Section 3 reliably.
- **Eq. 3.1 is `D = F*(A + B*S + C*S^2)*W*T` with `W` in m, `T` in **cm** and `D` in N — there is no divisor on `T`.** This is the ASABE D497 draft model. An earlier transcription carried a `/10`, which made every draft (and so every axle load, slip, power, fuel and ballast figure) 10× too small: the slip solver then converged on its first 2% trial step for every input, pinning TE near 10% and reporting "Underloaded" for every pairing, so the DSS could not match tractors to implements at all. Do not reintroduce it. `Yd = (2/3)*(T/100)` is a separate, genuine cm→m conversion.
- **One wheel-numeric model, everywhere**: Section 3's `Bn = CI*b*d/Wd` (`legacy_algorithms.mobility_number`), on both axles in all three modes. What differs between modes is the *axle load* it is evaluated at, not the formula. `legacy_algorithms.wheel_response` hard-wires the front model and takes no callable so it cannot drift.
- Section 4's `Bn'` (`mobility_number_passive_passive`) is **retained but drives nothing** — it is dimensionally invalid (m²/kN, scales as `W^-1.5`), reported only as the `dss_section4_wheel_numeric` diagnostic. Do not wire it back into the traction chain. See `SIMULATION_ENGINE_FORMULAS.md` B5/B6.
- **Combi axle loads use Eq. 3.5/3.6 generalised to N tools**, not the Section 4/5 restatement — that restatement uses geometrically wrong moment arms and the opposite draft sign, and disagrees with the validated Section 3 balance by ~21%. `_combined_axle_load_shared` carries the derivation in its docstring.
- A passive-passive run with a null second tool and `ki = 0` must reduce **exactly** to the single-implement result. `test_passive_passive_reduces_exactly_to_the_single_implement_result` pins this; it is the strongest consistency check on the combi path.
- Magic numbers live in `app/core/constants.py` — none may be re-declared inline. Range/plausibility checks, confidence, status and recommendation text live in `app/core/engineering_validation.py`.
- `tests/test_dss_shared.py`, `tests/test_legacy_algorithms.py` and `tests/test_combi_algorithms.py` assert formulas symbol-for-symbol against the document. A failing test here usually means the formula changed, not that the test is stale. Where the engine deliberately departs from the document, the test says why (e.g. `test_section4_wheel_numeric_is_dimensionally_inconsistent`).

`routes/simulations.py` (~660 lines) is the orchestrator: it resolves tractor/tires/implement(s) and either a saved operating-conditions preset or inline payload values, validates required fields with explicit 422s, dispatches to the right engine, persists a `Simulation`, and also serves CSV/PDF export.

### IoT pipeline

Ingestion is **in-process only**, started from `main.py` startup hooks behind `ENABLE_IOT_HTTP_POLLER` / `ENABLE_IOT_MQTT` (both need `AIO_USERNAME` + `AIO_KEY`), each on a daemon thread stopped via `app.state.iot_transport_stop`.

```
transports/{http_poller,mqtt_subscriber}.py
  → services/normalizer.py      canonical feed_key ↔ Adafruit slug (FEEDS/FEED_UNITS), parsing, adafruit_id
  → services/ingestion_pipeline.py  dedup by adafruit_id, attach to the active GPS-tracked session, persist
  → services/alert_engine.py    feed value vs session preset thresholds → IoTAlert (normal/warning/critical)
  → services/iot_query.py       read side for /iot/latest and /iot/history
```

`FEEDS` in `normalizer.py` hard-codes the `abhixs/feeds/...` Adafruit paths — that is the single source of truth for which feed keys exist, and `alert_engine.FEED_TO_PARAMETER` maps them onto `session_preset_values` rows.

### Sessions, costing, reports

`OperationSession` (table `sessions`) is a real field operation with operator/owner/farmer users, GPS tracking, preset values, alerts and observations (`app/models/session.py`). Around it:

- `field_area_service.py` — reconstructs worked area from the session's GPS readings.
- `operation_cost_service.py` — bills a session from the owner's `OperationCharge` (per-hectare, or per-hour for `threshing`/`grading`).
- `report_service.py` / `export_service.py` — session summary reports and CSV/PDF export (ReportLab).

## Migrations

Alembic lives in `backend/alembic/`; `alembic.ini` has a placeholder URL and `env.py` resolves the real one from settings. The chain is linear but **not alphabetical** — check `down_revision` when adding a revision rather than assuming the newest filename is head.
