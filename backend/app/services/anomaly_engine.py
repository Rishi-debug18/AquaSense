"""
Anomaly Detection Engine — AquaSense
Rule-based consumption anomaly detection.
NOTE: This is RULE-BASED detection, NOT machine learning.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from datetime import datetime, timedelta

from app.models.area import WaterReading
from app.config import settings


async def get_30day_baseline(household_id: str, db: AsyncSession) -> float:
    """Return average daily consumption in litres over the last 30 days."""
    end = datetime.utcnow()
    start = end - timedelta(days=30)

    stmt = select(func.sum(WaterReading.volume_litre)).where(
        and_(
            WaterReading.household_id == household_id,
            WaterReading.sensor_type == "MAIN",
            WaterReading.reading_ts >= start,
            WaterReading.reading_ts <= end,
        )
    )
    result = await db.execute(stmt)
    total = result.scalar() or 0.0
    return round(total / 30, 2)


async def get_today_consumption(household_id: str, db: AsyncSession) -> float:
    """Return today's total consumption in litres."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    stmt = select(func.sum(WaterReading.volume_litre)).where(
        and_(
            WaterReading.household_id == household_id,
            WaterReading.sensor_type == "MAIN",
            WaterReading.reading_ts >= today_start,
        )
    )
    result = await db.execute(stmt)
    return result.scalar() or 0.0


async def check_anomaly(
    household_id: str,
    current_daily_litres: float,
    db: AsyncSession,
) -> dict:
    """
    Rule-based anomaly detection.
    Compares today's consumption against 30-day daily average.
    
    Returns: {
        status: NORMAL | HIGH | VERY_HIGH | ANOMALY,
        baseline_litres_per_day: float,
        current_litres: float,
        percentage_change: float,
        detection_method: "RULE_BASED"  (clearly labelled, not ML)
    }
    """
    baseline = await get_30day_baseline(household_id, db)

    if baseline < 10:
        # Not enough history for comparison
        return {
            "status": "NORMAL",
            "baseline_litres_per_day": baseline,
            "current_litres": current_daily_litres,
            "percentage_change": 0.0,
            "detection_method": "RULE_BASED",
            "note": "Insufficient history for comparison",
        }

    pct_change = ((current_daily_litres - baseline) / baseline) * 100

    high_thresh = settings.HIGH_USAGE_THRESHOLD_PERCENT
    very_high_thresh = settings.VERY_HIGH_USAGE_THRESHOLD_PERCENT

    if pct_change >= very_high_thresh:
        status = "VERY_HIGH" if pct_change < 200 else "ANOMALY"
    elif pct_change >= high_thresh:
        status = "HIGH"
    else:
        status = "NORMAL"

    return {
        "status": status,
        "baseline_litres_per_day": baseline,
        "current_litres": current_daily_litres,
        "percentage_change": round(pct_change, 1),
        "detection_method": "RULE_BASED",
        "thresholds": {
            "high_pct": high_thresh,
            "very_high_pct": very_high_thresh,
        },
    }
