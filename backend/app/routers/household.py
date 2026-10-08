"""
Household self-service router — AquaSense
All endpoints require role=household and return only data for the authenticated user's household.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta
from typing import Optional, List
import uuid

from app.database import get_db
from app.auth.dependencies import require_household, get_household_for_user
from app.models.user import User
from app.models.household import Household
from app.models.area import (
    WaterReading, Bill, Alert, Message, MessageRecipient,
    Feedback, SupportTicket, Notification, Device
)
from app.services.anomaly_engine import check_anomaly, get_today_consumption, get_30day_baseline
from app.services.ai_feedback_service import process_feedback, create_support_ticket_from_feedback

router = APIRouter(prefix="/household", tags=["Household"])


@router.get("/me")
async def get_my_household(
    current_user: User = Depends(require_household),
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    """Dashboard data for the authenticated household."""
    today_total = await get_today_consumption(str(household.id), db)

    # Monthly consumption
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    stmt = select(func.sum(WaterReading.volume_litre)).where(
        and_(
            WaterReading.household_id == household.id,
            WaterReading.sensor_type == "MAIN",
            WaterReading.reading_ts >= month_start,
        )
    )
    result = await db.execute(stmt)
    month_total = round(result.scalar() or 0.0, 2)

    # Latest reading / flow rate
    latest_stmt = select(WaterReading).where(
        WaterReading.household_id == household.id
    ).order_by(desc(WaterReading.reading_ts)).limit(1)
    latest_r = await db.execute(latest_stmt)
    latest = latest_r.scalars().first()

    # Device status
    dev_stmt = select(Device).where(Device.household_id == household.id).limit(1)
    dev_r = await db.execute(dev_stmt)
    device = dev_r.scalars().first()

    device_status = "OFFLINE"
    last_updated = None
    if device and device.last_seen:
        minutes_ago = (datetime.utcnow() - device.last_seen).total_seconds() / 60
        device_status = "ONLINE" if minutes_ago < 15 else "OFFLINE"
        last_updated = device.last_seen.isoformat()

    # Anomaly check
    anomaly = await check_anomaly(str(household.id), today_total, db)

    # Latest bill estimate
    current_period = datetime.utcnow().strftime("%Y-%m")
    bill_stmt = select(Bill).where(
        and_(Bill.household_id == household.id, Bill.billing_period == current_period)
    ).limit(1)
    bill_r = await db.execute(bill_stmt)
    current_bill = bill_r.scalars().first()

    # Unread alert count
    unread_alerts_stmt = select(func.count(Alert.id)).where(
        and_(Alert.household_id == household.id, Alert.is_read == False)
    )
    ua_r = await db.execute(unread_alerts_stmt)
    unread_alerts = ua_r.scalar() or 0

    # Area name
    area_name = household.area.name if household.area else "Unknown"

    return {
        "house_number": household.house_number,
        "area": area_name,
        "resident_count": household.resident_count,
        "address": household.address,
        "installation_date": household.installation_date.isoformat() if household.installation_date else None,
        "today_consumption_litre": round(today_total, 2),
        "month_consumption_litre": month_total,
        "flow_rate_lpm": latest.flow_rate_lpm if latest else 0.0,
        "device_status": device_status,
        "device_code": device.device_code if device else None,
        "last_updated": last_updated,
        "usage_status": anomaly["status"],
        "baseline_litres_per_day": anomaly.get("baseline_litres_per_day", 0),
        "percentage_change": anomaly.get("percentage_change", 0),
        "estimated_bill": current_bill.total_amount if current_bill else None,
        "billing_period": current_period,
        "unread_alerts": unread_alerts,
    }


@router.get("/me/history")
async def get_consumption_history(
    period: str = Query(default="7d", pattern="^(24h|7d|30d|3m|6m)$"),
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    """Consumption history for chart rendering. Period: 24h|7d|30d|3m|6m"""
    now = datetime.utcnow()

    if period == "24h":
        since = now - timedelta(hours=24)
        group_format = "hour"
    elif period == "7d":
        since = now - timedelta(days=7)
        group_format = "day"
    elif period == "30d":
        since = now - timedelta(days=30)
        group_format = "day"
    elif period == "3m":
        since = now - timedelta(days=90)
        group_format = "day"
    else:  # 6m
        since = now - timedelta(days=180)
        group_format = "day"

    from sqlalchemy import text
    if group_format == "hour":
        sql = text("""
            SELECT date_trunc('hour', reading_ts) as period,
                   SUM(volume_litre) as total_litre
            FROM water_readings
            WHERE household_id = :hid
              AND sensor_type = 'MAIN'
              AND reading_ts >= :since
            GROUP BY 1
            ORDER BY 1
        """)
    else:
        sql = text("""
            SELECT date_trunc('day', reading_ts) as period,
                   SUM(volume_litre) as total_litre
            FROM water_readings
            WHERE household_id = :hid
              AND sensor_type = 'MAIN'
              AND reading_ts >= :since
            GROUP BY 1
            ORDER BY 1
        """)

    result = await db.execute(sql, {"hid": str(household.id), "since": since})
    rows = result.fetchall()

    return {
        "period": period,
        "data": [
            {
                "date": row[0].strftime("%Y-%m-%d %H:%M" if group_format == "hour" else "%Y-%m-%d"),
                "consumption_litre": round(row[1] or 0, 2),
            }
            for row in rows
        ],
    }


@router.get("/me/bills")
async def get_my_bills(
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    """List all bills for this household."""
    stmt = select(Bill).where(
        Bill.household_id == household.id
    ).order_by(desc(Bill.billing_period))
    result = await db.execute(stmt)
    bills = result.scalars().all()

    return [
        {
            "id": str(b.id),
            "bill_number": b.bill_number,
            "billing_period": b.billing_period,
            "total_consumption_litre": b.total_consumption_litre,
            "total_consumption_m3": b.total_consumption_m3,
            "total_amount": b.total_amount,
            "status": b.status,
            "generated_at": b.generated_at.isoformat() if b.generated_at else None,
            "due_date": b.due_date.isoformat() if b.due_date else None,
        }
        for b in bills
    ]


@router.get("/me/bills/{bill_id}")
async def get_bill_detail(
    bill_id: str,
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    """Full bill detail with complete slab breakdown for transparent billing."""
    stmt = select(Bill).where(
        and_(Bill.id == bill_id, Bill.household_id == household.id)
    )
    result = await db.execute(stmt)
    bill = result.scalars().first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    return {
        "id": str(bill.id),
        "bill_number": bill.bill_number,
        "household_id": str(household.id),
        "house_number": household.house_number,
        "area": household.area.name if household.area else "",
        "billing_period": bill.billing_period,
        "billing_period_start": bill.billing_period_start.isoformat() if bill.billing_period_start else None,
        "billing_period_end": bill.billing_period_end.isoformat() if bill.billing_period_end else None,
        "opening_reading_litre": bill.opening_reading_litre,
        "closing_reading_litre": bill.closing_reading_litre,
        "total_consumption_litre": bill.total_consumption_litre,
        "total_consumption_m3": bill.total_consumption_m3,
        "base_charge": bill.base_charge,
        "water_charge": bill.water_charge,
        "other_charge": bill.other_charge,
        "total_amount": bill.total_amount,
        "slab_breakdown": bill.slab_breakdown or [],
        "status": bill.status,
        "generated_at": bill.generated_at.isoformat() if bill.generated_at else None,
        "due_date": bill.due_date.isoformat() if bill.due_date else None,
        "paid_at": bill.paid_at.isoformat() if bill.paid_at else None,
    }


@router.get("/me/alerts")
async def get_my_alerts(
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Alert).where(
        and_(Alert.household_id == household.id, Alert.is_dismissed == False)
    ).order_by(desc(Alert.created_at)).limit(50)
    result = await db.execute(stmt)
    alerts = result.scalars().all()

    return [
        {
            "id": str(a.id),
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "is_read": a.is_read,
            "created_at": a.created_at.isoformat(),
        }
        for a in alerts
    ]


@router.patch("/me/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Alert).where(and_(Alert.id == alert_id, Alert.household_id == household.id))
    result = await db.execute(stmt)
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    await db.commit()
    return {"status": "ok"}


@router.get("/me/messages")
async def get_my_messages(
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(MessageRecipient, Message).join(
        Message, MessageRecipient.message_id == Message.id
    ).where(
        MessageRecipient.household_id == household.id
    ).order_by(desc(Message.created_at)).limit(50)
    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "id": str(mr.id),
            "message_id": str(msg.id),
            "title": msg.title,
            "body": msg.body,
            "priority": msg.priority,
            "is_read": mr.is_read,
            "read_at": mr.read_at.isoformat() if mr.read_at else None,
            "created_at": msg.created_at.isoformat(),
        }
        for mr, msg in rows
    ]


@router.patch("/me/messages/{recipient_id}/read")
async def mark_message_read(
    recipient_id: str,
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.area import MessageRecipient as MR
    stmt = select(MR).where(and_(MR.id == recipient_id, MR.household_id == household.id))
    result = await db.execute(stmt)
    mr = result.scalars().first()
    if not mr:
        raise HTTPException(status_code=404, detail="Message not found")
    mr.is_read = True
    mr.read_at = datetime.utcnow()
    await db.commit()
    return {"status": "ok"}


@router.get("/me/notifications")
async def get_my_notifications(
    household: Household = Depends(get_household_for_user),
    current_user: User = Depends(require_household),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Notification).where(
        Notification.user_id == current_user.id
    ).order_by(desc(Notification.created_at)).limit(30)
    result = await db.execute(stmt)
    notifs = result.scalars().all()

    return [
        {
            "id": str(n.id),
            "type": n.type,
            "title": n.title,
            "body": n.body,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
        }
        for n in notifs
    ]


@router.post("/me/feedback")
async def submit_feedback(
    body: dict,
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a message to the AI feedback assistant."""
    user_message = body.get("message", "").strip()
    conversation_history = body.get("conversation_history", [])
    feedback_id = body.get("feedback_id")

    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    # Process with AI service
    ai_result = await process_feedback(
        household_id=str(household.id),
        user_message=user_message,
        conversation_history=conversation_history,
        db=db,
    )

    # Save or update feedback session
    if feedback_id:
        stmt = select(Feedback).where(
            and_(Feedback.id == feedback_id, Feedback.household_id == household.id)
        )
        result = await db.execute(stmt)
        feedback = result.scalars().first()
        if feedback:
            convo = feedback.conversation or []
            convo.append({"role": "user", "content": user_message, "timestamp": datetime.utcnow().isoformat()})
            convo.append({"role": "ai", "content": ai_result["response"], "timestamp": datetime.utcnow().isoformat()})
            feedback.conversation = convo
            feedback.category = ai_result["category"]
    else:
        feedback = Feedback(
            id=uuid.uuid4(),
            household_id=household.id,
            category=ai_result["category"],
            description=user_message,
            conversation=[
                {"role": "user", "content": user_message, "timestamp": datetime.utcnow().isoformat()},
                {"role": "ai", "content": ai_result["response"], "timestamp": datetime.utcnow().isoformat()},
            ],
            ai_response=ai_result["response"],
        )
        db.add(feedback)

    await db.commit()
    await db.refresh(feedback)

    return {
        "feedback_id": str(feedback.id),
        "response": ai_result["response"],
        "category": ai_result["category"],
        "offer_ticket": ai_result.get("offer_ticket", False),
        "disclaimer": ai_result.get("disclaimer", ""),
    }


@router.post("/me/feedback/{feedback_id}/ticket")
async def create_ticket(
    feedback_id: str,
    household: Household = Depends(get_household_for_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a support ticket from a feedback session."""
    stmt = select(Feedback).where(
        and_(Feedback.id == feedback_id, Feedback.household_id == household.id)
    )
    result = await db.execute(stmt)
    feedback = result.scalars().first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    ticket_number = await create_support_ticket_from_feedback(
        feedback_id=feedback_id,
        household_id=str(household.id),
        category=feedback.category,
        description=feedback.description,
        db=db,
    )
    return {"ticket_number": ticket_number, "status": "open"}
