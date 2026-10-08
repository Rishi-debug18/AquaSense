"""Admin analytics router — system-wide overview and charts."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta

from app.database import get_db
from app.auth.dependencies import require_admin
from app.models.user import User
from app.models.household import Household
from app.models.area import (
    Area, Device, WaterReading, Bill, Alert, Pipeline
)

router = APIRouter(prefix="/admin", tags=["Admin - Analytics"])


@router.get("/analytics/overview")
async def get_overview(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Total households
    total_hh = (await db.execute(select(func.count(Household.id)))).scalar() or 0

    # Active meters (online devices)
    offline_cutoff = datetime.utcnow() - timedelta(minutes=15)
    online_devices = (await db.execute(
        select(func.count(Device.id)).where(Device.last_seen >= offline_cutoff)
    )).scalar() or 0
    offline_devices = (await db.execute(
        select(func.count(Device.id)).where(
            (Device.last_seen < offline_cutoff) | (Device.last_seen == None)
        )
    )).scalar() or 0

    # Today's total consumption
    today_consumption = (await db.execute(
        select(func.sum(WaterReading.volume_litre)).where(
            and_(
                WaterReading.reading_ts >= today_start,
                WaterReading.sensor_type == "MAIN",
            )
        )
    )).scalar() or 0.0

    # High usage households
    high_usage = (await db.execute(
        select(func.count(Alert.id)).where(
            and_(
                Alert.alert_type.in_(["HIGH_USAGE", "VERY_HIGH_USAGE"]),
                Alert.is_dismissed == False,
                Alert.created_at >= today_start,
            )
        )
    )).scalar() or 0

    # Leakage alerts
    leak_alerts = (await db.execute(
        select(func.count(Alert.id)).where(
            and_(
                Alert.alert_type.in_(["POSSIBLE_LEAK", "CRITICAL_LEAK"]),
                Alert.is_dismissed == False,
            )
        )
    )).scalar() or 0

    # Bills generated
    bills_count = (await db.execute(select(func.count(Bill.id)))).scalar() or 0
    total_billing = (await db.execute(
        select(func.sum(Bill.total_amount)).where(
            Bill.status.in_(["generated", "sent", "overdue"])
        )
    )).scalar() or 0.0

    return {
        "total_households": total_hh,
        "active_meters": online_devices,
        "offline_devices": offline_devices,
        "today_consumption_litre": round(today_consumption, 2),
        "high_usage_alerts": high_usage,
        "leakage_alerts": leak_alerts,
        "bills_generated": bills_count,
        "total_billing_amount": round(total_billing, 2),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/analytics/consumption-trend")
async def get_consumption_trend(
    days: int = Query(default=30, ge=7, le=90),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Daily system-wide consumption for the last N days."""
    from sqlalchemy import text
    since = datetime.utcnow() - timedelta(days=days)
    sql = text("""
        SELECT date_trunc('day', reading_ts) as day,
               SUM(volume_litre) as total_litre
        FROM water_readings
        WHERE sensor_type = 'MAIN' AND reading_ts >= :since
        GROUP BY 1 ORDER BY 1
    """)
    result = await db.execute(sql, {"since": since})
    rows = result.fetchall()
    return [{"date": row[0].strftime("%Y-%m-%d"), "consumption_litre": round(row[1] or 0, 2)} for row in rows]


@router.get("/analytics/area-comparison")
async def get_area_comparison(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Per-area consumption and household stats."""
    areas = (await db.execute(select(Area))).scalars().all()
    result = []
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)

    for area in areas:
        hh_count = (await db.execute(
            select(func.count(Household.id)).where(Household.area_id == area.id)
        )).scalar() or 0

        month_consumption = (await db.execute(
            select(func.sum(WaterReading.volume_litre)).where(
                and_(
                    WaterReading.reading_ts >= month_start,
                    WaterReading.sensor_type == "MAIN",
                )
            )
        )).scalar() or 0.0

        result.append({
            "area_id": str(area.id),
            "area_name": area.name,
            "total_households": hh_count,
            "population": area.total_population,
            "month_consumption_litre": round(month_consumption, 2),
            "avg_per_household": round(month_consumption / hh_count, 2) if hh_count else 0,
        })

    return result


@router.get("/analytics/top-consumers")
async def get_top_consumers(
    limit: int = Query(default=10, ge=1, le=50),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Top consuming households (last 30 days)."""
    from sqlalchemy import text
    since = datetime.utcnow() - timedelta(days=30)
    sql = text("""
        SELECT wr.household_id, h.house_number, a.name as area_name,
               SUM(wr.volume_litre) as total_litre, h.resident_count
        FROM water_readings wr
        JOIN households h ON h.id = wr.household_id
        JOIN areas a ON a.id = h.area_id
        WHERE wr.sensor_type = 'MAIN' AND wr.reading_ts >= :since
        GROUP BY wr.household_id, h.house_number, a.name, h.resident_count
        ORDER BY total_litre DESC
        LIMIT :limit
    """)
    result = await db.execute(sql, {"since": since, "limit": limit})
    rows = result.fetchall()
    return [
        {
            "household_id": str(row[0]),
            "house_number": row[1],
            "area": row[2],
            "total_litre_30d": round(row[3] or 0, 2),
            "avg_daily_litre": round((row[3] or 0) / 30, 2),
            "resident_count": row[4],
        }
        for row in rows
    ]
