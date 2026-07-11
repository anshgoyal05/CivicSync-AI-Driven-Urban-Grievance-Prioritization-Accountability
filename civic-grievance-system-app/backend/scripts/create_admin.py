from __future__ import annotations

import os
import sys

from sqlalchemy.orm import Session

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402
from app.services.auth import get_user_by_email, hash_password  # noqa: E402


def main() -> int:
    if len(sys.argv) != 4:
        print("Usage: python scripts/create_admin.py <name> <email> <password>")
        return 2

    name, email, password = sys.argv[1], sys.argv[2], sys.argv[3]
    db: Session = SessionLocal()
    try:
        existing = get_user_by_email(db, email)
        if existing:
            existing.role = "admin"
            existing.password_hash = hash_password(password)
            db.add(existing)
            db.commit()
            print(f"Promoted existing user to admin and updated password: {existing.email}")
            return 0

        user = User(name=name.strip(), email=email.lower(), password_hash=hash_password(password), role="admin")
        db.add(user)
        db.commit()
        print(f"Created admin user: {email}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())

