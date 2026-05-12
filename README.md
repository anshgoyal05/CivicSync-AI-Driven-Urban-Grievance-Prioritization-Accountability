# CivicSync: AI-Driven Urban Grievance Prioritization & Accountability

**CivicSync** is a full-stack platform for urban civic operations: citizens submit grievances with optional photos; **AI ranks urgency** from text and imagery; cases route to departments with **transparent predictions**, **admin workflows**, and **audit trails** so resolutions stay traceable.

Designed for **Indian urban governance** contexts—state → city → locality coverage, regional data, and dashboards suited to municipal-scale intake.

---

## Why CivicSync

| Challenge | How CivicSync addresses it |
|-----------|----------------------------|
| Uneven triage across wards | ML-assisted **priority labels** (Low → Critical) with confidence and short **explanations** |
| Photo-only or vague reports | **Text + image** signals fused (TF‑IDF / regression + vision severity) |
| Accountability gaps | **Status transitions** (Pending → In Progress → Resolved) with **audit logs** |
| Operational blind spots | **Analytics** (by priority, trends) and **CSV export** for reporting |

---

## Capabilities

### Citizens

- Secure **registration** and **JWT-based login**
- **Submit grievances**: title, description, category, **State → City → Sector** (dynamic regions), optional **image** with preview
- **AI prediction** on submit: priority, confidence, human-readable explanation
- **History** and **detail** views: status, assigned department, AI rationale, attachments

### Administrators

- **Role-based** admin console
- **Filters**: geography (state / city / sector), priority, status, department, text search
- Optional **coordinates** with map link where captured
- **Status updates** with immutable **audit log** entries
- **Analytics**: complaints by priority, monthly patterns
- **Export** grievances as CSV

### Security & operations

- Strong password hashing, JWT sessions, RBAC  
- Upload validation (type, size), API **rate limiting**, structured logging  

---

## Architecture

```text
┌─────────────┐     HTTPS/API      ┌─────────────┐      ┌──────────────┐
│  Next.js    │ ◄──────────────► │   FastAPI   │ ◄──► │  PostgreSQL   │
│  (App Router)│                   │   REST API   │      │  + Alembic    │
└─────────────┘                   └──────┬──────┘      └──────────────┘
                                         │
                                  AI pipeline
                          (text LR + CLIP-style image → fused priority)
```

Application code lives under **`civic-grievance-system-app/`** (frontend, backend, Docker Compose).

---

## Tech stack

| Layer | Stack |
|------|--------|
| **Web app** | Next.js (App Router), React, Tailwind CSS, Axios, Recharts, react-hook-form, Zod |
| **API** | FastAPI, SQLAlchemy, Alembic, SlowAPI, Structlog |
| **Data** | PostgreSQL |
| **AI — text** | TF‑IDF + logistic regression (training data: `backend/app/ai/sample_grievances.csv`; models generated at startup if missing) |
| **AI — image** | Zero-shot severity via CLIP-style prompts → score + explanation |
| **Fusion** | Weighted blend + keyword hazard cues → **Low / Medium / High / Critical** |
| **Deploy** | Docker Compose (Postgres + API + web) |

---

## Repository layout

```text
.
├── README.md
├── .gitignore
└── civic-grievance-system-app/
    ├── docker-compose.yml
    ├── backend/          # FastAPI, migrations, AI, uploads
    └── frontend/         # Next.js citizen + admin UI
```

---

## Quick start (Docker — recommended)

**Prerequisite:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

From the **`civic-grievance-system-app`** directory:

```bash
cd civic-grievance-system-app
docker compose up --build -d
```

| Service | URL |
|---------|-----|
| Web app | [http://localhost:3000](http://localhost:3000) |
| OpenAPI (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |

**Create an admin user** (example):

```bash
docker compose exec backend python scripts/create_admin.py "Admin" "admin@example.com" "YourSecurePassword!"
```

Sign in at `/login`, then open **`/admin`**.

---

## Local development (without Docker)

### Backend

```bash
cd civic-grievance-system-app/backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Point `DATABASE_URL` in `.env` at a running PostgreSQL instance, then:

```bash
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd civic-grievance-system-app/frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE` in `.env.local` (e.g. `http://localhost:8000/api/v1`).

---

## Environment variables

### Backend (`civic-grievance-system-app/backend/.env`)

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Long random string for signing tokens |
| `DATABASE_URL` | e.g. `postgresql+psycopg2://user:pass@host:5432/dbname` |
| `CORS_ALLOW_ORIGINS` | Comma-separated origins, e.g. `http://localhost:3000` |
| `RATE_LIMIT_PER_MINUTE` | Default `60` |
| `MAX_UPLOAD_MB` | Default `8` |

### Frontend (`civic-grievance-system-app/frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE` | Public API base URL, e.g. `http://localhost:8000/api/v1` |

Use **`.env.example`** / **`.env.local.example`** as templates. Do **not** commit real secrets.

---

## API overview

Interactive docs: **`/docs`** and **`/openapi.json`** on the backend host.

Base path: **`/api/v1`**

| Area | Examples |
|------|----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Regions | `GET /regions` |
| Grievances | `POST /grievances` (multipart; optional `image`), `GET /grievances/my`, `GET /grievances/{id}` |
| Admin | `GET /admin/grievances`, `PATCH /admin/grievances/{id}/status`, `GET /admin/grievances/export` |
| Analytics | `GET /analytics` |

---

## Database model (summary)

Managed with Alembic (`backend/alembic/`).

| Table | Role |
|-------|------|
| `users` | Identity, email, password hash, role |
| `grievances` | Case data, region fields, uploads, AI outputs, department, status |
| `audit_logs` | Status change history (who/when/old/new) |

---

## AI pipeline (summary)

1. **Text**: Vectorizer + classifier trained from sample civic text; artifacts under `backend/app/ai/models/` when generated.  
2. **Image**: Severity signal from vision prompts suitable for civic scenes.  
3. **Fusion**: Combined score plus keyword-based risk adjustments → final priority tier.

---

## Deployment notes

- **Single VM**: use `civic-grievance-system-app/docker-compose.yml`.  
- **Cloud**: host PostgreSQL on a managed service; build and publish **backend** and **frontend** images; set production `SECRET_KEY`, `DATABASE_URL`, `CORS_ALLOW_ORIGINS`, and `NEXT_PUBLIC_API_BASE` to your public API URL.  
- **File storage**: uploads use a Docker volume by default; swap in object storage by extending `backend/app/services/storage.py` if needed.

---

## License

Specify your license here (for example MIT, Apache-2.0, or proprietary).
