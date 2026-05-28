# CivicSync — application package

Next.js frontend (v0 UI + API integration) and FastAPI backend, orchestrated with Docker Compose.

**Full product documentation** → [`../README.md`](../README.md)

## Project layout

```text
civic-grievance-system-app/
├── backend/                 # FastAPI, PostgreSQL, AI pipeline
├── frontend/                # Next.js app (v0 marketing UI + wired routes)
│   ├── app/                 # App Router pages
│   │   ├── page.tsx         # Landing (v0)
│   │   ├── login/           # Auth UI (v0) + API hook
│   │   ├── dashboard/       # Admin-style demo UI (v0, mock data)
│   │   ├── admin/           # Full admin console (maps, charts, API)
│   │   ├── submit/          # Citizen grievance form
│   │   └── grievances/      # List + detail
│   ├── components/          # v0 UI (navbar, glass-card, shadcn/ui)
│   ├── lib/                 # api.ts, auth.tsx, types.ts
│   └── components/civic-ui.tsx  # Legacy form primitives for functional pages
└── docker-compose.yml
```

## Run locally

**1. Backend + database (Docker)**

```bash
docker compose up --build -d
```

**2. Frontend (development)**

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Create an admin user

```bash
docker compose exec backend python scripts/create_admin.py "Admin" "admin@example.com" "YourSecurePassword!"
```

## Routes

| Path | Purpose |
|------|---------|
| `/` | Marketing landing |
| `/login` | Login & register |
| `/submit` | Submit grievance (citizen, auth required) |
| `/grievances` | Your complaints |
| `/grievances/[id]` | Complaint detail |
| `/admin` | Admin dashboard (maps, filters, analytics) |
| `/dashboard` | v0 demo dashboard (static mock data) |

Environment templates: `backend/.env.example`, `frontend/.env.local.example`.

## Google Sign-In (optional)

1. Create an OAuth **Web client** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Add authorized origin: `http://localhost:3000`
3. Set the same Client ID in both places:

```bash
# frontend/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# backend/.env or docker-compose
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

4. Rebuild/restart backend and frontend.

**Create admin (note: use single quotes so `!` in password does not break zsh):**

```bash
docker compose exec backend python scripts/create_admin.py 'Admin' 'admin@example.com' 'YourPassword123!'
```
