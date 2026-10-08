"""
Billing Engine — AquaSense
Calculates water bills based on tiered tariff slabs.
All calculations are transparent and stored in full detail on the Bill record.
"""
from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from typing import Optional
import uuid

from app.models.area import Bill, Tariff, TariffSlab, WaterReading
from app.models.household import Household


def _calculate_slab_charges(total_m3: float, tariff: Tariff) -> dict:
    """
    Apply progressive tariff slabs to consumption in m³.
    Returns full breakdown for transparent billing.
    """
    slabs = sorted(tariff.slabs, key=lambda s: s.display_order)
    water_charge = 0.0
    slab_breakdown = []
    remaining = total_m3

    for slab in slabs:
        if remaining <= 0:
            break

        slab_min = slab.min_units
        slab_max = slab.max_units  # None = unlimited

        if slab_max is None:
            applicable = remaining
        else:
            slab_capacity = slab_max - slab_min
            applicable = min(remaining, slab_capacity)

        if applicable <= 0:
            continue

        amount = round(applicable * slab.rate_per_unit, 2)
        water_charge += amount
        remaining -= applicable

        max_label = f"{slab_max} m³" if slab_max else "and above"
        slab_breakdown.append({
            "range": f"{slab_min}–{max_label}",
            "units_m3": round(applicable, 4),
            "rate_per_unit": slab.rate_per_unit,
            "amount": amount,
        })

    return {
        "water_charge": round(water_charge, 2),
        "slab_breakdown": slab_breakdown,
    }


async def get_active_tariff(db: AsyncSession) -> Optional[Tariff]:
    """Return the currently active tariff with slabs loaded."""
    stmt = select(Tariff).where(Tariff.is_active == True)
    result = await db.execute(stmt)
    tariff = result.scalars().first()
    if tariff:
        # eager load slabs
        stmt2 = select(TariffSlab).where(TariffSlab.tariff_id == tariff.id).order_by(TariffSlab.display_order)
        r2 = await db.execute(stmt2)
        tariff.slabs = r2.scalars().all()
    return tariff


async def calculate_bill(
    household_id: str,
    billing_period: str,  # "2026-08"
    db: AsyncSession,
) -> dict:
    """
    Calculate the bill for a household for a given billing_period.
    Returns full breakdown without persisting.
    billing_period format: "YYYY-MM"
    """
    year, month = int(billing_period[:4]), int(billing_period[5:7])
    period_start = date(year, month, 1)
    if month == 12:
        period_end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        period_end = date(year, month + 1, 1) - timedelta(days=1)

    # Get total consumption for period
    stmt = select(func.sum(WaterReading.volume_litre)).where(
        and_(
            WaterReading.household_id == household_id,
            WaterReading.sensor_type == "MAIN",
            WaterReading.reading_ts >= datetime.combine(period_start, datetime.min.time()),
            WaterReading.reading_ts <= datetime.combine(period_end, datetime.max.time()),
        )
    )
    result = await db.execute(stmt)
    total_litre = result.scalar() or 0.0
    total_m3 = round(total_litre / 1000, 4)

    # Get opening/closing readings
    open_stmt = select(func.min(WaterReading.volume_litre)).where(
        WaterReading.household_id == household_id,
        WaterReading.reading_ts >= datetime.combine(period_start, datetime.min.time()),
    )
    close_stmt = select(func.max(WaterReading.volume_litre)).where(
        WaterReading.household_id == household_id,
        WaterReading.reading_ts <= datetime.combine(period_end, datetime.max.time()),
    )
    open_r = await db.execute(open_stmt)
    close_r = await db.execute(close_stmt)
    opening = open_r.scalar() or 0.0
    closing = close_r.scalar() or 0.0

    tariff = await get_active_tariff(db)
    if not tariff:
        return {
            "error": "No active tariff configured",
            "total_consumption_litre": total_litre,
            "total_consumption_m3": total_m3,
            "total_amount": 0.0,
        }

    slab_result = _calculate_slab_charges(total_m3, tariff)

    base_charge = round(tariff.base_charge, 2)
    water_charge = slab_result["water_charge"]
    other_charge = 0.0
    total_amount = round(base_charge + water_charge + other_charge, 2)

    return {
        "billing_period": billing_period,
        "billing_period_start": period_start.isoformat(),
        "billing_period_end": period_end.isoformat(),
        "opening_reading_litre": round(opening, 2),
        "closing_reading_litre": round(closing, 2),
        "total_consumption_litre": round(total_litre, 2),
        "total_consumption_m3": total_m3,
        "tariff_id": str(tariff.id),
        "tariff_name": tariff.name,
        "base_charge": base_charge,
        "water_charge": water_charge,
        "other_charge": other_charge,
        "total_amount": total_amount,
        "slab_breakdown": slab_result["slab_breakdown"],
    }


async def generate_monthly_bills(billing_period: str, db: AsyncSession) -> list:
    """
    Generate bills for ALL households for a given billing_period.
    Skips households that already have a bill for the period.
    """
    year, month = int(billing_period[:4]), int(billing_period[5:7])

    # Get all active households
    stmt = select(Household).where(Household.is_active == True)
    result = await db.execute(stmt)
    households = result.scalars().all()

    generated = []
    for hh in households:
        # Check if bill already exists
        existing = await db.execute(
            select(Bill).where(
                and_(Bill.household_id == hh.id, Bill.billing_period == billing_period)
            )
        )
        if existing.scalars().first():
            continue

        calc = await calculate_bill(str(hh.id), billing_period, db)
        if "error" in calc:
            continue

        bill_number = f"BILL-{billing_period.replace('-','')}-{hh.house_number}"
        bill = Bill(
            id=uuid.uuid4(),
            bill_number=bill_number,
            household_id=hh.id,
            tariff_id=calc["tariff_id"],
            billing_period=billing_period,
            billing_period_start=date.fromisoformat(calc["billing_period_start"]),
            billing_period_end=date.fromisoformat(calc["billing_period_end"]),
            opening_reading_litre=calc["opening_reading_litre"],
            closing_reading_litre=calc["closing_reading_litre"],
            total_consumption_litre=calc["total_consumption_litre"],
            total_consumption_m3=calc["total_consumption_m3"],
            base_charge=calc["base_charge"],
            water_charge=calc["water_charge"],
            other_charge=calc["other_charge"],
            total_amount=calc["total_amount"],
            slab_breakdown=calc["slab_breakdown"],
            status="generated",
            generated_at=datetime.utcnow(),
            due_date=date(year, month, 20) if month <= 12 else date(year + 1, 1, 20),
        )
        db.add(bill)
        generated.append(bill_number)

    await db.commit()
    return generated
