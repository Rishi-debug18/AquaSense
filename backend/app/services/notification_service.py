"""Notification service — create in-app notifications for households."""
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.area import Notification


async def create_notification(
    db: AsyncSession,
    household_id: str,
    title: str,
    body: str,
    notification_type: str = "INFO",
    reference_id: str = None,
    reference_type: str = None,
) -> Notification:
    """Create a new notification for a household."""
    notification = Notification(
        id=uuid.uuid4(),
        household_id=household_id,
        title=title,
        body=body,
        notification_type=notification_type,
        reference_id=reference_id,
        reference_type=reference_type,
        is_read=False,
        created_at=datetime.utcnow(),
    )
    db.add(notification)
    # Note: caller must commit the session
    return notification
