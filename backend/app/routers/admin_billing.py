"""Admin billing router — bill management, tariff configuration."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.auth.dependencies import require_admin
from app.models.user import User
from app.models.area import Bill, Tariff, TariffSlab
from app.services.billing_engine import generate_monthly_bills, calculate_bill
import uuid

router = APIRouter(prefix="/admin", tags=["Admin - Billing"])


@router.get("/bills")
async def list_bills(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50),
    period: Optional[str] = None,
    status: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Bill)
    if period:
        stmt = stmt.where(Bill.billing_period == period)
    if status:
        stmt = stmt.where(Bill.status == status)
    stmt = stmt.order_by(desc(Bill.created_at)).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    bills = result.scalars().all()

    total = (await db.execute(select(func.count(Bill.id)))).scalar() or 0

    return {
        "total": total,
        "data": [
            {
                "id": str(b.id),
                "bill_number": b.bill_number,
                "household_id": str(b.household_id),
                "billing_period": b.billing_period,
                "total_consumption_m3": b.total_consumption_m3,
                "total_amount": b.total_amount,
                "status": b.status,
                "generated_at": b.generated_at.isoformat() if b.generated_at else None,
            }
            for b in bills
        ],
    }


@router.post("/bills/generate")
async def generate_bills(
    body: dict,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    period = body.get("billing_period", datetime.utcnow().strftime("%Y-%m"))
    generated = await generate_monthly_bills(period, db)
    return {"billing_period": period, "generated_count": len(generated), "bills": generated[:20]}


@router.get("/tariffs")
async def list_tariffs(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Tariff).order_by(desc(Tariff.created_at)))
    tariffs = result.scalars().all()
    out = []
    for t in tariffs:
        slabs_q = await db.execute(select(TariffSlab).where(TariffSlab.tariff_id == t.id).order_by(TariffSlab.display_order))
        slabs = slabs_q.scalars().all()
        out.append({
            "id": str(t.id),
            "name": t.name,
            "description": t.description,
            "is_active": t.is_active,
            "base_charge": t.base_charge,
            "effective_from": t.effective_from.isoformat() if t.effective_from else None,
            "notes": t.notes,
            "slabs": [
                {"min_units": s.min_units, "max_units": s.max_units, "rate_per_unit": s.rate_per_unit, "display_order": s.display_order}
                for s in slabs
            ],
        })
    return out


@router.post("/tariffs")
async def create_tariff(
    body: dict,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    tariff = Tariff(
        id=uuid.uuid4(),
        name=body["name"],
        description=body.get("description"),
        base_charge=float(body.get("base_charge", 0)),
        notes=body.get("notes"),
    )
    db.add(tariff)
    await db.flush()

    for i, slab in enumerate(body.get("slabs", [])):
        db.add(TariffSlab(
            id=uuid.uuid4(),
            tariff_id=tariff.id,
            min_units=float(slab["min_units"]),
            max_units=float(slab["max_units"]) if slab.get("max_units") else None,
            rate_per_unit=float(slab["rate_per_unit"]),
            display_order=i,
        ))

    await db.commit()
    return {"id": str(tariff.id), "status": "created"}


@router.post("/tariffs/{tariff_id}/activate")
async def activate_tariff(
    tariff_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Deactivate all others
    all_t = (await db.execute(select(Tariff))).scalars().all()
    for t in all_t:
        t.is_active = False

    stmt = select(Tariff).where(Tariff.id == tariff_id)
    result = await db.execute(stmt)
    tariff = result.scalars().first()
    if not tariff:
        raise HTTPException(status_code=404, detail="Tariff not found")
    tariff.is_active = True
    await db.commit()
    return {"status": "activated", "tariff_id": tariff_id}
