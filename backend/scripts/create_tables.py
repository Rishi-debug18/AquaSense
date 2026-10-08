"""
Create all database tables using SQLAlchemy create_all.
Run this INSTEAD of 'alembic upgrade head' for the initial setup.
Usage: python scripts/create_tables.py
"""
import asyncio
import sys
import os

# Add parent directory to path so we can import 'app'
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine
from app.database import Base
from app.config import settings

# Import ALL models so SQLAlchemy knows about them
import app.models  # noqa: F401


async def create_tables():
    print(f"[AquaSense] Connecting to: {settings.DATABASE_URL}")
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        print("[AquaSense] Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("[AquaSense] [OK] All tables created successfully!")


if __name__ == "__main__":
    asyncio.run(create_tables())
