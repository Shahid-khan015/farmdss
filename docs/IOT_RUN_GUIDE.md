# IoT + full stack run guide

This project runs **FastAPI + PostgreSQL** for data ingestion and **Expo (React Native)** for the dashboard. IoT data can enter via **Adafruit IO HTTP polling** and/or **MQTT**; both paths use the same normalization and ingestion pipeline.

---

## 1. Prerequisites

- **Python 3.10+** (3.9 may work; CI targets modern Python)
- **Node.js** + **npm** (or yarn) for the frontend
- **PostgreSQL** running locally or remotely, with a database created for this app (e.g. `tractor_dss`)
- **Adafruit IO** account, username, and **AIO Key** (Dashboard → **My Key**)

---

## 2. Backend setup

### 2.1 Install dependencies

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### 2.2 Configure environment

Copy or edit `backend/.env`. Use **placeholders** in documentation; never commit real secrets.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DEBUG` | `True` in dev (SQLite fallback only if Postgres fails in DEBUG mode) |
| `AIO_USERNAME` | Adafruit IO username |
| `AIO_KEY` | Adafruit IO key |
| `IOT_DEFAULT_DEVICE_ID` | Device id stored on readings (default `default`; match mobile `device_id` query) |
| `IOT_HTTP_POLL_INTERVAL_SEC` | Poll cadence; **minimum 5 seconds** is enforced in code |
| `IOT_HTTP_POLL_LIMIT` | Max data points fetched per feed per poll |
| `ENABLE_IOT_HTTP_POLLER` | `True` to start background HTTP polling on API startup |
| `ENABLE_IOT_MQTT` | `True` to start MQTT subscriber thread |
| `IOT_MQTT_BROKER` / `IOT_MQTT_PORT` | Usually `io.adafruit.com` and `1883` |

### 2.3 Database migrations

Ensure Postgres matches `DATABASE_URL`, then:

```powershell
cd backend
alembic upgrade head
```

This creates the `iot_readings` table (among others). Without this step, IoT ingestion will fail when writing to the DB.

### 2.4 Run the API

```powershell
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

- `http://localhost:8000/health` → `{"ok": true}`

IoT latest (after data exists):

- `http://localhost:8000/api/v1/iot/latest?device_id=default`

---

## 3. Adafruit IO checklist

1. **Feeds** exist for each key your app expects (see `app/services/normalizer.py` → `FEEDS`).
2. **Data** is actually arriving (dashboard graphs or API).
3. **Credentials** in `backend/.env` match the account that owns the feeds.
4. If you use **MQTT**, feeds should publish to topics your subscriber uses (see `app/services/transports/mqtt_subscriber.py` — `username/feeds/<slug>/json`).

If the poller is enabled but **no rows** appear in Postgres:

- Confirm `ENABLE_IOT_HTTP_POLLER=True`, `AIO_USERNAME`, and `AIO_KEY`.
- Watch API logs for Adafruit HTTP errors.
- Call Adafruit REST manually (with `X-AIO-Key`) to verify the feed slug and data.

---

## 4. Frontend setup

### 4.1 API URL

In `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

- **Emulator on same machine:** `http://localhost:8000/api/v1` is often fine for Android emulator; iOS simulator may need `http://127.0.0.1:8000/api/v1`.
- **Physical device:** use your PC’s LAN IP, e.g. `http://192.168.1.50:8000/api/v1`, and keep `uvicorn` bound to `0.0.0.0`.

Restart Expo after changing `.env`.

### 4.2 Install and run

```powershell
cd frontend
npm install
npx expo start
```

Open the app → **IoT** tab for the dashboard (latest metrics, GPS panel, alerts, refresh, map).

---

## 5. End-to-end verification

| Step | What to check |
|------|----------------|
| 1 | `alembic upgrade head` completed without errors |
| 2 | Backend running; `/health` OK |
| 3 | Adafruit sending data; poller or MQTT enabled as desired |
| 4 | `GET /api/v1/iot/latest?device_id=default` returns `feeds[]` with `feed_key`, `numeric_value` or `raw_value`, `status_label`, `lat`/`lon` for GPS |
| 5 | App `EXPO_PUBLIC_API_URL` points at the same API |
| 6 | IoT tab shows non-placeholder values after a short wait (poll interval ≥ 5s) |

---

## 6. Operating modes (summary)

| Mode | What to set |
|------|-------------|
| **HTTP polling only** | `ENABLE_IOT_HTTP_POLLER=True`, `ENABLE_IOT_MQTT=False` |
| **MQTT only** | `ENABLE_IOT_MQTT=True`, HTTP poller optional |
| **Both** | Both `True` (ensure dedup via `adafruit_id` / synthetic MQTT ids behaves as you expect) |
| **API only (no background ingest)** | Both `False`; ingest only if you add another worker or manual pipeline |

---

## 7. Security notes

- Do **not** commit `backend/.env` or `frontend/.env` with real keys.
- If an Adafruit key was exposed, **rotate it** in the Adafruit IO dashboard.
- In production, use TLS for the API, restrict CORS, and store secrets in a proper secret manager.

---

## 8. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Empty `iot_readings` / empty latest | Migrations not run, wrong `DATABASE_URL`, or poller disabled / bad Adafruit credentials |
| Frontend “Network Error” | Wrong `EXPO_PUBLIC_API_URL`, firewall, or device using `localhost` instead of host IP |
| Duplicate or missing MQTT rows | Topic shape vs subscriber; MQTT messages may use synthetic ids (see normalizer) |
| 422 / validation errors on `/iot/history` | Missing or invalid `feed_key` query param |

For deeper debugging, enable logging and inspect Adafruit HTTP responses and SQL errors in the backend console.
