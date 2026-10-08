"""
Alert Service — AquaSense
Central service for creating alerts and notifications.
"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.area import Alert


async def create_alert(
    alert_type: str,
    severity: str,
    title: str,
    message: str,
    db: AsyncSession,
    household_id: Optional[str] = None,
    pipeline_id: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> Alert:
    """Create an alert record in the database."""
    alert = Alert(
        id=uuid.uuid4(),
        household_id=household_id,
        pipeline_id=pipeline_id,
        alert_type=alert_type,
        severity=severity,
        title=title,
        message=message,
        metadata_=metadata,
        is_read=False,
        is_dismissed=False,
    )
    db.add(alert)
    # Note: caller is responsible for committing
    return alert
