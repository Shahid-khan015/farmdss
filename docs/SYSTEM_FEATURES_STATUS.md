# System Features Status (Entire System)

Last updated: 2026-04-03

This document describes **what the product does** and **how it works inside**: user actions, HTTP calls, backend steps, database behavior, responses, and UI updates. Use it to **rebuild a feature** or **extend the system** without guessing.

**How to read each feature block**

- **Purpose**: why it exists.
- **Logic**: ordered steps (no vague “processes data”).
- **Flow**: one-line pipeline.
- **Example**: concrete request/response shapes.
- **Edge cases**: failures and how the system reacts.

**URL convention**

- Most REST resources live under **`/api/v1/...`** (see `settings.API_V1_PREFIX` in the backend).
- Auth is **`/api/v1/auth/...`**.
- Field-operation **sessions** and **alerts** use **`/api/v1/sessions/...`** and **`/api/v1/alerts/...`** (mounted separately in `app/main.py`).

---

## Implemented Features (with internal logic)

### Feature: Platform API, routing, and configuration

#### Purpose

Provide a single HTTP service for the mobile/web app: versioned routes, settings from environment, and predictable JSON error shapes.

#### Logic

1. **Startup**: FastAPI loads `app.config.settings` from `.env` (database URL, debug flags, IoT feature toggles, etc.).
2. **Router mounting** (`app/main.py`):
   - Core DSS API: `api_router` → prefix `/api/v1` (tractors, implements, tires, operating conditions, simulations, IoT).
   - Auth: `auth_router` → prefix `/api/v1`.
   - Sessions + wages + reports: separate routers included with their own prefixes.
3. **Database**: SQLAlchemy `Session` per request via `get_db`; commits happen inside route handlers or services.
4. **SQLite vs Postgres**: In development, the project may use SQLite for convenience; production typically uses Postgres. The same SQLAlchemy models apply to both where types are portable (e.g. `JSON` instead of Postgres-only `JSONB` in some models).

#### Flow

**Deploy / run server** → **FastAPI loads settings + routers** → **Client calls `/api/v1/...`** → **Matching route runs** → **DB session used if needed** → **JSON response or HTTP error** → **Client updates UI from response**

#### Example

- `GET https://api.example.com/health` → `200` body `{ "ok": true }`.

#### Edge cases

- Misconfigured `DATABASE_URL`: app may fail on startup or first DB access; fix env and restart.

---

### Feature: CORS for browser / Expo web clients

#### Purpose

Allow the frontend (e.g. Expo dev server on `http://localhost:8081`) to call the API from a browser without the browser blocking the response.

#### Logic

1. **Middleware order**: `CORSMiddleware` wraps the app early in `create_app()`.
2. **Allowed origins**: Listed in `Settings.CORS_ORIGINS` (e.g. localhost ports for Expo web). The browser sends `Origin`; the middleware echoes **`Access-Control-Allow-Origin`** for allowed origins.
3. **Credentials**: `allow_credentials=True` is used so cookies/Authorization headers are permitted; **wildcard `*` cannot be combined with credentials**, so explicit origin lists are required.

#### Flow

**Browser preflight (OPTIONS)** → **CORS middleware adds headers** → **Actual GET/POST** → **Response includes CORS headers** → **XHR/fetch succeeds** → **UI renders response**

#### Example

- Origin `http://localhost:8081` calls `GET http://localhost:8000/api/v1/iot/latest?device_id=default` → response includes `Access-Control-Allow-Origin: http://localhost:8081`.

#### Edge cases

- Origin not in list: browser blocks with a CORS error even if the API returned 200 (because headers were missing). Add the origin to `CORS_ORIGINS` or use a reverse proxy same-origin setup.

---

### Feature: Health check

#### Purpose

Give load balancers and developers a simple “is the process up?” endpoint without touching the database.

#### Logic

1. **Route**: `GET /health` in `app/main.py`.
2. **Processing**: Returns a static JSON object; no DB query.

#### Flow

**User or probe hits `/health`** → **No DB** → **`{ "ok": true }`** → **Caller treats service as live**

#### Example

- `GET /health` → `200` `{ "ok": true }`.

---

### Feature: User authentication (register, login, JWT, profile)

#### Purpose

Identify who is calling protected APIs (owner, operator, farmer roles) and issue tokens so the client does not send passwords on every request.

#### Logic

1. **Register** (`POST /api/v1/auth/register`):  
   - Body validated by Pydantic (`RegisterRequest`).  
   - Password is hashed (e.g. bcrypt via `hash_password`).  
   - User (+ optional profile) rows inserted; duplicate email/phone may raise `IntegrityError` → HTTP error.
2. **Login** (`POST /api/v1/auth/login`):  
   - Email/phone + password checked with `verify_password`.  
   - On success: `create_access_token` and `create_refresh_token` return JWT strings; refresh token may be persisted (`UserSession`) with metadata (IP, user agent).
3. **Authenticated requests**:  
   - Client sends `Authorization: Bearer <access_token>`.  
   - `get_current_user` / `require_role` decode and validate JWT, load `User` from DB, inject as `Depends(...)`.
4. **Token refresh** (`POST /api/v1/auth/refresh`):  
   - Validates refresh token; issues new access token with same security helpers.
5. **Profile**: read/update profile fields stored in `UserProfile` linked to `User`.

#### Flow

**User submits credentials** → **`POST /api/v1/auth/login`** → **Verify password + issue tokens** → **DB stores refresh session if configured** → **Response returns tokens** → **Client stores tokens (secure storage)** → **Later calls add `Authorization` header** → **Middleware dependency loads `User`** → **Route runs with role checks**

#### Example

- **Input**: `POST /api/v1/auth/login` `{ "email": "op@farm.com", "password": "secret" }`  
- **Output**: `200` `{ "access_token": "eyJ...", "refresh_token": "...", "token_type": "Bearer", ... }`

#### Edge cases

- Wrong password: `401` with clear detail (do not leak whether email exists).
- Expired access token: `401`; client should refresh or redirect to login.
- Calling owner-only route as operator: `403` from `require_role`.

---

### Feature: Tractor CRUD and library vs custom tractors

#### Purpose

Store tractor specifications used by simulations and field workflows; separate **seed/library** machines from **user-owned** machines via `is_library`.

#### Logic

1. **List** `GET /api/v1/tractors`:  
   - Query params: search `q`, `manufacturer`, `drive_mode`, `is_library`, `filter_type` (`library` / `custom` overrides `is_library`), `sort` (`name` or `power`), `limit`, `offset`.  
   - `tractor_crud.list` builds a SQLAlchemy query with filters and ordering.  
   - Response is **paginated**: `{ total, items, limit, offset }`.
2. **Get** `GET /api/v1/tractors/{id}`:  
   - Loads tractor **with related tire specification(s)** for-detail views and validation elsewhere (`get_with_tires`).
3. **Create** `POST /api/v1/tractors`:  
   - **Requires role** `owner` (see route).  
   - Body may include nested `tire_specification`; tractor fields and tires are written in one transaction pattern (tractor first, then tires).
4. **Update** `PATCH /api/v1/tractors/{id}`:  
   - Partial update of allowed fields.
5. **Delete** `DELETE /api/v1/tractors/{id}`:  
   - Removes row if business rules allow (FK constraints may block if simulations reference it — depends on DB schema on delete).

#### Flow

**User opens tractor list** → **`GET /api/v1/tractors?...`** → **CRUD builds SQL + pagination** → **Postgres/SQLite returns rows** → **Pydantic `TractorRead` serialization** → **UI shows cards/list**  
**User taps tractor** → **`GET /api/v1/tractors/{id}`** → **Joined tire data** → **Detail screen**

#### Example

- `GET /api/v1/tractors?filter_type=library&limit=20&offset=0`  
- **Output**: `{ "total": 5, "items": [ { "id": "...", "name": "...", "is_library": true, ... } ], "limit": 20, "offset": 0 }`

#### Edge cases

- Invalid UUID in path: **422**.
- Tractor not found: **404**.
- Missing auth on protected routes: **401**.

---

### Feature: Compatible implements for a tractor

#### Purpose

Suggest implements that **fit** a tractor (PTO range, hitch type, ownership/library rules) so the UI can filter long implement lists.

#### Logic

1. **Request**: `GET /api/v1/tractors/{tractor_id}/compatible-implements`.
2. **Load tractor**: If missing → **404**.
3. **`get_compatible_implements`** (`app/services/matching_service.py`):  
   - **Library tractor** (`owner_id is None`): only **`is_library` implements**.  
   - **Owned tractor**: **library implements OR same `owner_id`**.  
   - If tractor has **no** hitch/PTO/capacity fields set → returns all rows passing the ownership filter (no mechanical filter).  
   - Else: filter implements where `hitch_type` matches or implement hitch is null;  
     and if `pto_rpm_required` exists on implement, it must be ≤ tractor `pto_rpm_max` (when set).
4. **Response**: List of `ImplementRead` models.

#### Flow

**User opens “pick implement” after selecting tractor** → **`GET .../compatible-implements`** → **SQL filter in Python/SQLAlchemy** → **DB returns rows** → **JSON list** → **UI shows compatible items only**

#### Example

- Tractor `pto_rpm_max = 1000`, hitch `three_point`.  
- Implement A: `pto_rpm_required=540`, `hitch_type=three_point` → **included**.  
- Implement B: `pto_rpm_required=1200` → **excluded**.

#### Edge cases

- Tractor with all compatibility fields null → **many** implements returned (by design).

---

### Feature: Tire specification CRUD (per tractor)

#### Purpose

Store front/rear tire geometry and rolling radius data **required** by the legacy DSS performance *math* (simulation refuses to run if key tire numbers are missing).

#### Logic

1. **Routes** under `/api/v1/tractors/.../tires` and `/api/v1/tires/...` (see `tires_router` mounting — tires router may embed tractor id in path).
2. **Create/update**: Upsert-style operations attach **`tractor_id`** foreign key.
3. **Read**: By tractor id for simulation pipeline (`tire_crud.get_by_tractor_id`).
4. **Simulation use**: Rolling radius may come from `front_rolling_radius` / `rear_rolling_radius` mm fields, or fallback to static loaded radius or tractor `rear_wheel_rolling_radius` with strict 422 if still missing.

#### Flow

**User saves tire form** → **`POST`/`PATCH` tires endpoint** → **Validate Pydantic schema** → **INSERT/UPDATE tire row** → **`TractorRead` or tire read model** → **Detail screen shows specs**

#### Example

- Tire row contains `front_overall_diameter`, `rear_overall_diameter`, `front_section_width`, `rear_section_width`, radii in mm.

#### Edge cases

- Simulation run without tires: **422** `"Tractor is missing tire specifications"`.
- Missing rear radius chain: **422** with explicit field names in error message.

---

### Feature: Implement CRUD and library implements

#### Purpose

Store implement physical and ASAE draft parameters used in simulation (width, weight, draft coefficients, etc.).

#### Logic

Same pattern as tractors:

1. `GET /api/v1/implements` with query filters + pagination via `implement_crud.list`.
2. `GET /api/v1/implements/{id}` for detail.
3. `POST` / `PATCH` / `DELETE` for owner-managed records; **`is_library`** marks catalog entries.

#### Flow

**User opens implement module** → **List GET** → **Paginated JSON** → **User edits** → **PATCH** → **Row updated** → **UI refetch or optimistic update**

#### Example

- Implement carries `asae_param_a`, `asae_param_b`, `asae_param_c` used directly in calculator (names aligned with legacy DSS).

#### Edge cases

- Simulation with missing `asae_param_*`: **422** listing missing implement fields.

---

### Feature: Operating condition presets

#### Purpose

Reuse saved “field condition bundles” (cone index, depth, speed, field size, soil enums) so users do not retype them for every simulation.

#### Logic

1. `GET /api/v1/operating-conditions` — list + search + pagination.
2. `GET /api/v1/operating-conditions/{id}` — single preset.
3. `POST` / `PATCH` / `DELETE` — standard CRUD.
4. **Simulation integration**: If `SimulationRunRequest` includes `operating_conditions_preset_id`, the run route **reads preset row** and **copies** numeric + enum fields into the calculator inputs for that run (it does not mutate the preset).

#### Flow

**User chooses “Preset mode” in simulation setup** → **Frontend sends `operating_conditions_preset_id`** → **Backend loads preset** → **Maps fields to internal variables** → **Runs calculator** → **Persists simulation** → **Result screen**

#### Example

- Preset `"Heavy clay spring"` has `cone_index=1800`, `depth=18`, `speed=4.5`, etc.

#### Edge cases

- Invalid preset id on run: **404** `"Preset not found"`.

---

### Feature: Run simulation (DSS performance run)

#### Purpose

Compute drawbar power, slip, traction efficiency, fuel-related outputs, recommendations, etc., from **tractor + implement + tires + operating conditions**, and **save** a `Simulation` row for history/compare.

#### Logic

1. **Trigger**: User taps **Run Simulation**; frontend sends `POST /api/v1/simulations/run` with JSON `SimulationRunRequest` (`tractor_id`, `implement_id`, either **preset id** **or** inline condition fields).
2. **Load entities**:  
   - `tractor_crud.get_with_tires`  
   - `implement_crud.get`  
   - `tire_crud.get_by_tractor_id`  
   - Optional `operating_condition_crud.get` for preset mode.
3. **Field validation (422)**: Explicit lists of required tractor, implement, tire, and condition fields; each missing key name is returned in the error detail (fast fail before math).
4. **Unit normalization**: e.g. tire diameters converted mm → meters; rolling radius resolved from primary/fallback fields (see route).
5. **Build `PerformanceInputs`**: Single typed structure passed into `calculate_performance` in `app/core/performance_calculator.py`.
6. **Calculator**: Runs the legacy-ordered pipeline (iterate slip, compute draft, motion resistance, utilization, etc.). Returns a **results dict** + messages; non-convergence may still return last-iteration numbers with a clear status string (per product decision).
7. **Persist**: Creates `Simulation` row with inputs snapshot + **`results` JSON** (metrics + recommendations).
8. **Response**: `SimulationRead` including ids and stored results.

#### Flow

**User action: Run** → **`POST /api/v1/simulations/run`** → **Load tractor/implement/tires/conditions** → **Validate** → **`calculate_performance`** → **`INSERT simulation`** → **`201` + `SimulationRead`** → **UI navigates to result screen**

#### Example

**Input** (custom mode, simplified):

```json
{
  "tractor_id": "uuid-tractor",
  "implement_id": "uuid-implement",
  "cone_index": 1200,
  "depth": 15,
  "speed": 5,
  "field_area": 2,
  "field_length": 200,
  "field_width": 100,
  "number_of_turns": 10,
  "soil_texture": "Medium",
  "soil_hardness": "Firm"
}
```

**Output** (conceptually): `SimulationRead` with `id`, timestamps, and `results` containing e.g. draft (kN), slip (%), traction efficiency, fuel-related fields, `load_status`, `status_message`, `recommendations` list.

#### Edge cases

- Missing tires or required tire fields: **422** before any heavy math.
- Invalid `soil_texture` string: **422** `"Invalid soil_texture ..."`.
- DB error on insert: **500** (rare; logged server-side).

---

### Feature: Simulation history, detail, delete, compare

#### Purpose

Let users revisit past runs and place two or more runs side by side (client-driven compare using returned JSON).

#### Logic

1. **List** `GET /api/v1/simulations?tractor_id=&implement_id=&limit=&offset=`  
   - Optional filters; returns paginated `SimulationRead` items.
2. **Get** `GET /api/v1/simulations/{id}` — full row including stored `results` JSON.
3. **Delete** `DELETE /api/v1/simulations/{id}` — removes history entry (subject to FK/permissions if added later).
4. **Compare** `GET /api/v1/simulations/compare?ids=...&ids=...`  
   - For each id, `simulation_crud.get`; collects found rows; if none found → **404**; else returns **array** of `SimulationRead`.  
   - **No server-side diff math** — frontend decides how to render tables/charts.

#### Flow

**User opens History** → **`GET /api/v1/simulations`** → **DB query + pagination** → **List UI** → **User selects detail** → **`GET /api/v1/simulations/{id}`** → **Parse `results` JSON for metrics**  
**User picks 2–3 runs** → **`GET /api/v1/simulations/compare?ids=`** → **Array returned** → **Compare screen**

#### Example

- `GET /api/v1/simulations/compare?ids=aaa&ids=bbb` → `[ {...}, {...} ]`

#### Edge cases

- Unknown id in compare list: that id skipped; if **all** invalid → **404** `"No simulations found for given ids"`.

---

### Feature: IoT readings storage (telemetry history in DB)

#### Purpose

Persist time-series and event payloads from devices (soil moisture, cone index, GPS, etc.) for dashboards, maps, and optional session linkage.

#### Logic

1. **Table** `iot_readings` holds: `feed_key`, `device_id`, `raw_value`, `numeric_value`, `unit`, lat/lon, `device_timestamp`, optional `session_id`, dedup key (e.g. `adafruit_id`), timestamps.
2. **Write path**: Ingestion service inserts rows; may **dedupe** by upstream id to avoid duplicates when transports retry.
3. **Read path**: Query services aggregate “latest per feed” or “history windows”.

#### Flow

**Device or cloud broker sends data** → **Transport receives payload** → **Normalizer maps to canonical `feed_key` + numeric** → **INSERT (or skip if duplicate)** → **Optional alert evaluation** → **Dashboard reads via `/iot/latest` or `/iot/history`**

#### Example

- Row: `feed_key="soil_moisture"`, `numeric_value=42.1`, `unit="%"`, `device_timestamp=...`

#### Edge cases

- Malformed payload: may be dropped or stored as `raw_value` only depending on normalizer rules.

---

### Feature: IoT ingestion transports (HTTP poller + MQTT subscriber)

#### Purpose

Bring data from external systems (e.g. Adafruit IO) into your DB without coupling the API request/response path to vendor APIs.

#### Logic

1. **Feature flags** in settings: `ENABLE_IOT_HTTP_POLLER`, `ENABLE_IOT_MQTT`, plus credentials (`AIO_USERNAME`, `AIO_KEY`).
2. **On app startup** (`app/main.py`): If enabled, start **background threads** (daemon threads) that loop forever until app shutdown sets a `threading.Event` stop flag.
3. **HTTP poller**: On an interval (`IOT_HTTP_POLL_INTERVAL_SEC`), calls vendor REST, parses responses, passes into shared **ingestion** pipeline (same code path as MQTT).
4. **MQTT subscriber**: Connects to broker (`IOT_MQTT_BROKER`), subscribes to topics, on message runs the same parser → ingestion.
5. **No duplicate business logic**: Both paths funnel through normalizer + persistence + alert hook.

#### Flow

**Timer or broker message** → **Transport thread** → **Fetch/receive raw JSON** → **Normalize** → **Persist IoTReading** → **(Optional) alert status computation** → **Next poll/message**

#### Example

- Poll every 7s; limit last N data points per request (`IOT_HTTP_POLL_LIMIT`).

#### Edge cases

- Wrong API key: poller logs errors; may get empty data until fixed.
- MQTT disconnect: reconnect loop attempts continue.

---

### Feature: IoT API — latest values per feed

#### Purpose

One fast request returning the **newest** reading for each known feed for a device — ideal for dashboard tiles.

#### Logic

1. **Request**: `GET /api/v1/iot/latest?device_id=default` (or specific device id string).
2. **`get_latest_per_feed`**: SQL/query layer finds latest row per canonical `feed_key` for that `device_id`.
3. **Response shaping**: For each known feed in `FEEDS`, build `LatestFeedReading`: if no row, return nulls + `status_label="normal"`; else attach `numeric_value`, `raw_value`, coordinates, timestamp.
4. **Status label**: `get_status_label(feed_key, numeric_value)` maps value to human status (**normal / warning / critical**) using in-code thresholds.

#### Flow

**Dashboard mount** → **`GET /api/v1/iot/latest`** → **SQL “latest per feed”** → **Map rows → DTO** → **`IotLatestResponse` JSON** → **UI renders tiles with colors**

#### Example

**Output** (simplified):

```json
{
  "device_id": "default",
  "feeds": [
    {
      "feed_key": "soil_moisture",
      "numeric_value": 41.2,
      "unit": "%",
      "status_label": "normal",
      "device_timestamp": "2026-04-03T12:00:00Z"
    }
  ]
}
```

#### Edge cases

- New device id with no rows: all feeds exist as placeholders with empty values (still 200).

---

### Feature: IoT API — history time series

#### Purpose

Power charts, scrolling logs, and GPS trace retrieval for a single feed over a time window.

#### Logic

1. **Request**: `GET /api/v1/iot/history?feed_key=...&device_id=&session_id=&start=&end=&limit=&offset=`.
2. **Validate `feed_key`**: Must be in canonical `FEEDS`; unknown → **400**.
3. **`get_history`**: Count + page query ordered by time descending (implementation in `app/services/iot_query.py`).
4. **Map** each ORM row to `IotHistoryItem` (string UUIDs where schema uses str).

#### Flow

**User opens chart** → **`GET /api/v1/iot/history?feed_key=soil_moisture&limit=200`** → **Filtered SQL** → **`IotHistoryResponse` with total** → **Chart component plots points**

#### Example

- `feed_key=gpsloc` + `session_id=...` to reconstruct path for one field session.

#### Edge cases

- `limit` above max (5000): clamped by FastAPI `Query(..., le=5000)`.

---

### Feature: Field operation sessions (operator “active session”)

#### Purpose

Track real-world work: which tractor/implement, operator, farmer client, GPS flag, optional preset thresholds — distinct from **DSS simulation** rows.

#### Logic

1. **Start** `POST /api/v1/sessions/start` (role `operator`):  
   - Validates tractor exists; blocks if operator already has **active** session.  
   - Optionally loads implement, copies working width onto session.  
   - Inserts `OperationSession` (`status="active"`).  
   - Inserts `SessionPresetValue` rows for monitoring thresholds from request body.  
   - Returns `SessionResponse` (UUID fields serialized as strings in JSON).
2. **Active list** `GET /api/v1/sessions/active`:  
   - Filters by caller role (operator sees own; owner sees tractors they own; farmer sees client_farmer linkage).
3. **Detail** `GET /api/v1/sessions/{session_id}`:  
   - Loads session + related presets + alerts; computes duration minutes; access check helper enforces ownership/farmer/tractor owner rules.
4. **Stop / pause / resume**: Updates `status` and `ended_at`; may finalize area via `field_area_service`.

#### Flow

**Operator taps Start** → **`POST /api/v1/sessions/start` + JWT** → **DB INSERT session + presets** → **`201` session object** → **Active Session UI**  
**Poll active** → **`GET /api/v1/sessions/active`** → **List** → **Badge on dashboard**

#### Example

**Input**:

```json
{
  "tractor_id": "uuid",
  "implement_id": "uuid",
  "operation_type": "Tillage",
  "gps_tracking_enabled": true,
  "preset_values": []
}
```

#### Edge cases

- Operator already active: **400** `"Operator already has an active session"`.
- Invalid UUID path on GET: **422**.
- Duration math normalizes **timezone-aware vs naive** datetimes before subtraction (session detail / area summary).

---

### Feature: Wage records and fuel logs (financial ops)

#### Purpose

Attach money and fuel accounting to tractors and optionally to field sessions (`OperationSession`).

#### Logic

1. Routes under `/api/v1/...` in `app/routes/wages.py` with **auth + role** gates.
2. **Wage**: Creates `WageRecord` linked to `session_id`, `operator_id`; `compute_wage` service derives totals from rate + area/hours when applicable.
3. **Fuel**: `FuelLogCreate` inserts `FuelLog` with litres and optional cost fields.

#### Flow

**Owner submits wage or fuel form** → **Authenticated POST** → **INSERT row** → **Response DTO** → **Reports UI updates**

#### Edge cases

- Dispute flow may set flags on wage records (see routes for dispute endpoints).

---

### Feature: Reports API

#### Purpose

Aggregate operational data for owner dashboards (exact metrics depend on `app/routes/reports.py` implementation).

#### Logic

1. **Authenticated** endpoints query sessions, area, wages, or implements as needed and return summary JSON for charts/tables.

#### Flow

**User opens Report screen** → **`GET /api/v1/reports/...`** → **SQL aggregations** → **JSON summary** → **UI charts**

---

### Feature: Frontend (Expo React Native) — structure and data flow

#### Purpose

Give users mobile (and web) UI for DSS + IoT + sessions with minimal duplicated business logic (especially **no simulation math on device**).

#### Logic

1. **Config**: `EXPO_PUBLIC_API_URL` in `frontend/.env` points to backend base (e.g. `http://localhost:8000`).
2. **HTTP**: Axios instance in `frontend/src/services/*` builds URLs under `/api/v1/...`, attaches Authorization header from secure storage when logged in, normalizes errors.
3. **Caching**: React Query (`useQuery`, `useMutation`) keys per resource; `invalidateQueries` after mutations (e.g. after create tractor).
4. **Navigation**: Tab navigator + stack screens (`TractorList` → `TractorDetail` → `SimulationSetup` → `SimulationResult`).
5. **Simulation UI**: Collects ids and numbers, **POST `/simulations/run`**, navigates with returned simulation `id`, then **GET** detail to render metrics components (`ResultsDisplay`, etc.).
6. **IoT UI**: Polls `GET /iot/latest` on interval via hooks (`useIoTDashboard`); history/charts use `/iot/history`.

#### Flow

**User gesture** → **React event handler** → **service function (axios)** → **API** → **JSON** → **React Query cache update** → **Components re-render**

#### Example

- Run simulation: `mutateAsync({ tractor_id, implement_id, ... })` → receive `{ id }` → `navigate('SimulationResult', { id })`.

#### Edge cases

- Network offline: axios error → `ErrorMessage` component or toast.
- 422 validation: show server `detail` string in UI.

---

## Partially Implemented / In Progress (what works vs missing)

### Feature: Persistent alert lifecycle beyond status labels

#### Purpose

Record alerts in DB, acknowledge them, and audit history.

#### Logic **today**

- IoT latest/history attach a **computed `status_label`** from `alert_engine` thresholds.
- Session module includes alert acknowledgement route under `/api/v1/alerts/...` tied to `IoTAlert` rows when session-linked.

#### Logic **missing / incomplete**

- Full standalone alert browser, notification channels, multi-channel delivery, and rich alert policy UI (see older notes in this doc section).

---

### Feature: WebSocket live IoT push

#### Purpose

Avoid polling by pushing new readings to clients instantly.

#### Logic **today**

- Hook placeholder exists in ingestion (`broadcast_update` no-op or stub).

#### Logic **missing**

- Real WebSocket endpoint, channel auth, and fan-out to subscribed clients.

---

### Feature: In-app GPS map polyline

#### Purpose

Show path on device map without opening external apps.

#### Logic **today**

- GPS readings retrievable via IoT history or session GPS path endpoint; external map deep link may exist.

#### Logic **missing**

- Native map view + polyline rendering fully polished.

---

## Not Yet Implemented (Planned / Next)

*(High-level backlog — implement by following the same Flow template above when built.)*

- Centralized alert policy storage + admin UI
- Production secrets manager integration
- Load testing for high-frequency MQTT ingest
- CI contract tests for `/simulations/run` golden outputs vs legacy DSS fixtures

---

## Quick Capability Matrix

| Area | Current Status |
|------|----------------|
| Tractor CRUD | Implemented |
| Implement CRUD | Implemented |
| Tire CRUD | Implemented |
| Operating Condition Preset CRUD | Implemented |
| Simulation run/list/get/delete/compare | Implemented |
| IoT latest/history APIs | Implemented |
| IoT HTTP ingest | Implemented |
| IoT MQTT ingest | Implemented |
| Auth (JWT) + roles | Implemented |
| Field sessions / wages | Implemented (core APIs) |
| Alert persistence/ack workflow | Partial (session-linked) |
| WebSocket live push | Pending |
| In-app IoT map rendering | Partial |
