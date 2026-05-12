# CivicSync — frontend

Next.js (App Router) client for **CivicSync**: citizen flows, grievance submission, and admin dashboards.

**Documentation:** [repository root README](../../README.md)

## Local development

From this directory:

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Ensure `NEXT_PUBLIC_API_BASE` points at your FastAPI base URL (e.g. `http://localhost:8000/api/v1`).

## Production build

```bash
npm run build
npm run start
```

Docker builds are defined in `Dockerfile` at this level; full stack runs via `docker compose` in the parent directory.
