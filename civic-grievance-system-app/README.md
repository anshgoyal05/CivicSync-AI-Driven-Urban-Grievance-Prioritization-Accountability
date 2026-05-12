# CivicSync — application package

This directory contains the **CivicSync** stack: **Next.js** frontend, **FastAPI** backend, and **`docker-compose.yml`**.

**Full product and technical documentation** → [`../README.md`](../README.md)

## Run from this folder

```bash
docker compose up --build -d
```

- App: [http://localhost:3000](http://localhost:3000)  
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)  

Create an admin:

```bash
docker compose exec backend python scripts/create_admin.py "Admin" "admin@example.com" "YourSecurePassword!"
```

Environment templates: `backend/.env.example`, `frontend/.env.local.example`.
