import os
import sys

from sqlalchemy import text

# Add the parent directory to sys.path
sys.path.append(os.getcwd())

from app.db.session import engine


def reset_alembic_version():
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS alembic_version"))
            conn.commit()
        print("Successfully dropped alembic_version table.")
    except Exception as e:
        print(f"Error dropping table: {e}")


if __name__ == "__main__":
    reset_alembic_version()
