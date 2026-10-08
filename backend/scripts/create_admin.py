"""
Create the admin user.
Usage: python scripts/create_admin.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.user import User
from app.auth.password import hash_password
import uuid
from datetime import datetime


ADMIN_EMAIL = "admin@aquasense.demo"
ADMIN_PASSWORD = "AquaSense@Admin2026"
ADMIN_FULL_NAME = "AquaSense Administrator"


async def create_admin():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        from sqlalchemy.future import select
        existing = await session.execute(select(User).where(User.email == ADMIN_EMAIL))
        if existing.scalars().first():
            print(f"[AquaSense] Admin already exists: {ADMIN_EMAIL}")
            return

        admin = User(
            id=uuid.uuid4(),
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role="admin",
            full_name=ADMIN_FULL_NAME,
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow(),
        )
        session.add(admin)
        await session.commit()
        print(f"[AquaSense] [OK] Admin user created: {ADMIN_EMAIL}")
        print(f"[AquaSense]    Password: {ADMIN_PASSWORD}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_admin())
