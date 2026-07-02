# Sensor Dashboard v2

React + Vite + TypeScript + Tailwind + Zustand + IndexedDB dashboard for ESP32 sensor data stored in Supabase.

---

## Quick start

```bash
cp .env.example .env   # fill in your Supabase credentials
npm install
npm run dev
```

Open http://localhost:5173

---

## .env variables

| Variable | Where to find |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |
| `VITE_BASE_URL` | `/` for custom domain, `/<repo-name>/` for GitHub Pages |

---

## Supabase setup

### sensor_data table (already exists)
```sql
create table sensor_data (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  temperature float8 not null
);

-- ESP32 can insert without auth
create policy "ESP32 insert policy" on sensor_data
  for insert to anon with check (true);

-- Only authenticated users can read
create policy "Admin select policy" on sensor_data
  for select to authenticated using (true);
```

### feedback table (create if you want the Feedback form to work)
```sql
create table feedback (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  type text not null,
  message text not null,
  user_email text
);

-- Authenticated users can insert feedback
create policy "Auth insert feedback" on feedback
  for insert to authenticated with check (true);

-- Only authenticated users can read feedback
create policy "Auth select feedback" on feedback
  for select to authenticated using (true);
```

---

## Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. Go to **Settings → Secrets and variables → Actions** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Go to **Settings → Pages → Source** and select **GitHub Actions**.
4. Push to `main` branch — the workflow deploys automatically.

> The workflow sets `VITE_BASE_URL=/<repo-name>/` automatically.

---

## Architecture (FSD)

```
src/
├── app/
│   ├── store/        # Zustand slices (auth, sensor, settings, ui)
│   ├── providers/    # Theme sync + Supabase auth listener
│   └── App.tsx       # Auth gate
├── pages/
│   ├── LoginPage/
│   └── DashboardPage/
├── widgets/          # Composite UI blocks
│   ├── Header/       # Refresh + last updated + nav actions
│   ├── SensorTable/  # Paginated table with copy & threshold highlight
│   ├── TemperatureChart/ # recharts with Today/Yesterday/Range filter
│   └── StorageIndicator/ # IndexedDB usage meter
├── features/
│   ├── auth/         # LoginForm, LogoutModal
│   ├── sensor-data/  # Supabase fetch + merge logic
│   ├── settings/     # SettingsModal (theme, threshold, clear, password)
│   └── feedback/     # FeedbackModal → writes to Supabase feedback table
├── entities/
│   └── sensor-reading/model/types.ts
└── shared/
    ├── config/       # PAGE_SIZE, DB_NAME, etc.
    ├── lib/          # supabase client, IndexedDB helpers (idb)
    └── ui/           # Modal
```

### Local cache (IndexedDB)
- All historical data is stored in IndexedDB (`sensor-dashboard-v2` database).
- Clicking **Refresh** fetches the latest 500 records from Supabase, merges by `id` (deduplication), and saves to IndexedDB.
- The table and chart always read from the **local cache**, not from Supabase directly.
- This means data persists offline between sessions.

### State management
| Store | Persisted | Content |
|---|---|---|
| `useAuthStore` | — | Supabase user |
| `useSensorStore` | — | records in memory (loaded from IDB) |
| `useSettingsStore` | localStorage | theme, highTempThreshold |
| `useUIStore` | — | modal open/close flags |
