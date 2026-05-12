#!/usr/bin/env sh
set -e

echo "Waiting for database..."
python - <<'PY'
import os, time
import psycopg2

url = os.environ.get("DATABASE_URL", "")
if "postgresql" not in url:
    raise SystemExit("DATABASE_URL must be set to PostgreSQL URL")

# convert SQLAlchemy URL -> psycopg2 DSN
dsn = url.replace("postgresql+psycopg2://", "postgresql://")

for i in range(60):
    try:
        conn = psycopg2.connect(dsn)
        conn.close()
        print("Database is ready.")
        raise SystemExit(0)
    except Exception:
        time.sleep(1)

raise SystemExit("Database not ready after 60s")
PY

echo "Running migrations..."
alembic upgrade head

echo "Starting API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

