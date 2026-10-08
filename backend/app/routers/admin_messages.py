"""Admin messaging router."""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from datetime import datetime

from app.database import get_db
from app.auth.dependencies import require_admin
from app.models.user import User
from app.models.household import Household
from app.models.area import Message, MessageRecipient, Area
from app.websocket.manager import manager

router = APIRouter(prefix="/admin", tags=["Admin - Messaging"])


@router.post("/messages")
async def send_message(
    body: dict,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    title = body.get("title", "")
    message_body = body.get("body", "")
    target_type = body.get("target_type", "ALL").upper()
    target_area_id = body.get("target_area_id")
    target_household_id = body.get("target_household_id")
    priority = body.get("priority", "normal").lower()

    msg = Message(
        id=uuid.uuid4(),
        sender_id=admin.id,
        title=title,
        body=message_body,
        target_type=target_type,
        target_area_id=target_area_id,
        priority=priority,
    )
    db.add(msg)
    await db.flush()

    # Determine recipients
    if target_type == "ALL":
        stmt = select(Household).where(Household.is_active == True)
    elif target_type == "AREA" and target_area_id:
        stmt = select(Household).where(
            Household.area_id == target_area_id,
            Household.is_active == True,
        )
    elif target_type == "HOUSEHOLD" and target_household_id:
        stmt = select(Household).where(Household.id == target_household_id)
    else:
        stmt = select(Household).where(Household.is_active == True)

    result = await db.execute(stmt)
    households = result.scalars().all()

    recipient_count = 0
    for hh in households:
        db.add(MessageRecipient(
            id=uuid.uuid4(),
            message_id=msg.id,
            household_id=hh.id,
            is_read=False,
        ))
        recipient_count += 1

        # Push WebSocket notification
        await manager.broadcast_to_room(f"household_{hh.id}", {
            "event": "new_message",
            "title": title,
            "body": message_body,
            "priority": priority,
            "message_id": str(msg.id),
            "timestamp": datetime.utcnow().isoformat(),
        })

    await db.commit()

    return {
        "message_id": str(msg.id),
        "recipient_count": recipient_count,
        "status": "sent",
    }


@router.get("/messages")
async def list_sent_messages(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Message).order_by(desc(Message.created_at)).limit(50)
    result = await db.execute(stmt)
    messages = result.scalars().all()

    return [
        {
            "id": str(m.id),
            "title": m.title,
            "body": m.body,
            "target_type": m.target_type,
            "priority": m.priority,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]
