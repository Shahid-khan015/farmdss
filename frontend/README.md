## Frontend (Expo React Native) - Tractor DSS

### 1) Install

From `frontend/`:

```powershell
npm install
```

### 2) Configure env

Set API base URL in `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3) Run

From `frontend/`:

```powershell
npm start
```

Open in **Expo Go** or run:

```powershell
npm run android
```

### Notes (Windows + Expo)

If testing on a physical phone, your API URL must be reachable from the phone.
You may need to replace `localhost` with your PC’s LAN IP, e.g.:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api/v1
```

