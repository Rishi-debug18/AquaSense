"""Admin households router."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, desc, or_
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app.auth.dependencies import require_admin
from app.models.user import User
from app.models.household import Household
from app.models.area import WaterReading, Bill, Alert, Device, Area

from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/admin", tags=["Admin - Households"])


@router.get("/households")
async def list_households(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=200),
    search: Optional[str] = None,
    area_id: Optional[str] = None,
    status: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Paginated, searchable list of all households with real-time stats."""
    stmt = select(Household).options(selectinload(Household.area))

    if search:
        stmt = stmt.where(Household.house_number.ilike(f"%{search}%"))
    if area_id:
        stmt = stmt.where(Household.area_id == area_id)

    # Count total
    count_stmt = select(func.count(Household.id))
    if search:
        count_stmt = count_stmt.where(Household.house_number.ilike(f"%{search}%"))
    if area_id:
        count_stmt = count_stmt.where(Household.area_id == area_id)

    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = stmt.order_by(Household.house_number).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    households = result.scalars().all()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)

    data = []
    for hh in households:
        # Today consumption
        today_q = await db.execute(
            select(func.sum(WaterReading.volume_litre)).where(
                and_(
                    WaterReading.household_id == hh.id,
                    WaterReading.sensor_type == "MAIN",
                    WaterReading.reading_ts >= today_start,
                )
            )
        )
        today_litre = round(today_q.scalar() or 0.0, 2)

        # Month consumption
        month_q = await db.execute(
            select(func.sum(WaterReading.volume_litre)).where(
                and_(
                    WaterReading.household_id == hh.id,
                    WaterReading.sensor_type == "MAIN",
                    WaterReading.reading_ts >= month_start,
                )
            )
        )
        month_litre = round(month_q.scalar() or 0.0, 2)

        # Device status
        dev_q = await db.execute(
            select(Device).where(Device.household_id == hh.id).limit(1)
        )
        device = dev_q.scalars().first()
        device_status = "offline"
        if device and device.last_seen:
            mins = (datetime.utcnow() - device.last_seen).total_seconds() / 60
            device_status = "online" if mins < 15 else "offline"

        # Leakage alert
        leak_q = await db.execute(
            select(func.count(Alert.id)).where(
                and_(
                    Alert.household_id == hh.id,
                    Alert.alert_type.in_(["POSSIBLE_LEAK", "CRITICAL_LEAK"]),
                    Alert.is_dismissed == False,
                )
            )
        )
        has_leak = (leak_q.scalar() or 0) > 0

        # Determine usage status (simplified)
        usage_status = "NORMAL"
        if today_litre > 1000:
            usage_status = "VERY_HIGH"
        elif today_litre > 600:
            usage_status = "HIGH"

        area_name = hh.area.name if hh.area else "Unknown"

        row = {
            "id": str(hh.id),
            "house_number": hh.house_number,
            "area": area_name,
            "area_id": str(hh.area_id),
            "resident_count": hh.resident_count,
            "today_consumption_litre": today_litre,
            "month_consumption_litre": month_litre,
            "avg_daily_litre": round(month_litre / max(1, datetime.utcnow().day), 2),
            "usage_status": usage_status,
            "device_status": device_status,
            "leakage_alert": has_leak,
            "is_active": hh.is_active,
        }
        data.append(row)

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "data": data,
    }


@router.get("/households/{household_id}")
async def get_household_detail(
    household_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Full household detail for admin view."""
    stmt = select(Household).options(selectinload(Household.area)).where(Household.id == household_id)
    result = await db.execute(stmt)
    hh = result.scalars().first()
    if not hh:
        raise HTTPException(status_code=404, detail="Household not found")

    # Device
    dev_q = await db.execute(select(Device).where(Device.household_id == hh.id).limit(1))
    device = dev_q.scalars().first()

    device_status = "offline"
    if device and device.last_seen:
        mins = (datetime.utcnow() - device.last_seen).total_seconds() / 60
        device_status = "online" if mins < 15 else "offline"

    # Stats
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
    three_month_start = datetime.utcnow() - timedelta(days=90)

    async def sum_consumption(since):
        q = await db.execute(
            select(func.sum(WaterReading.volume_litre)).where(
                and_(WaterReading.household_id == hh.id, WaterReading.sensor_type == "MAIN", WaterReading.reading_ts >= since)
            )
        )
        return round(q.scalar() or 0.0, 2)

    today = await sum_consumption(today_start)
    month = await sum_consumption(month_start)
    three_month = await sum_consumption(three_month_start)
    baseline = round(three_month / 90, 2)

    # Bills
    bills_q = await db.execute(
        select(Bill).where(Bill.household_id == hh.id).order_by(desc(Bill.billing_period)).limit(6)
    )
    bills = bills_q.scalars().all()

    # Alerts
    alerts_q = await db.execute(
        select(Alert).where(Alert.household_id == hh.id).order_by(desc(Alert.created_at)).limit(10)
    )
    alerts = alerts_q.scalars().all()

    return {
        "id": str(hh.id),
        "house_number": hh.house_number,
        "area": hh.area.name if hh.area else "",
        "area_id": str(hh.area_id),
        "resident_count": hh.resident_count,
        "address": hh.address,
        "installation_date": hh.installation_date.isoformat() if hh.installation_date else None,
        "is_active": hh.is_active,
        "device": {
            "device_code": device.device_code if device else None,
            "status": device_status,
            "last_seen": device.last_seen.isoformat() if device and device.last_seen else None,
            "firmware_version": device.firmware_version if device else None,
        } if device else None,
        "consumption": {
            "today_litre": today,
            "month_litre": month,
            "three_month_litre": three_month,
            "baseline_daily_litre": baseline,
        },
        "bills": [
            {
                "id": str(b.id),
                "bill_number": b.bill_number,
                "billing_period": b.billing_period,
                "total_amount": b.total_amount,
                "status": b.status,
            }
            for b in bills
        ],
        "alerts": [
            {
                "id": str(a.id),
                "alert_type": a.alert_type,
                "severity": a.severity,
                "title": a.title,
                "message": a.message,
                "created_at": a.created_at.isoformat(),
            }
            for a in alerts
        ],
    }
