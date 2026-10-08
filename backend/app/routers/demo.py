"""Demo simulator router — controls demo sensor simulation."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db, async_session_maker
from app.auth.dependencies import require_admin
from app.models.user import User
from app.models.household import Household
from app.models.area import Device, Pipeline
from app.services import simulator_service

router = APIRouter(prefix="/demo", tags=["Demo Simulator"])


@router.post("/simulate/start")
async def start_simulation(
    body: dict,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Start sensor simulation for a household."""
    household_id = body.get("household_id", "").strip()
    if not household_id:
        raise HTTPException(status_code=400, detail="household_id required")

    # Resolve by house_number or UUID
    if household_id.startswith("H-"):
        stmt = select(Household).where(Household.house_number == household_id)
    else:
        stmt = select(Household).where(Household.id == household_id)
    result = await db.execute(stmt)
    hh = result.scalars().first()
    if not hh:
        raise HTTPException(status_code=404, detail="Household not found")

    # Get device
    dev_q = await db.execute(select(Device).where(Device.household_id == hh.id).limit(1))
    device = dev_q.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="No device found for household")

    # Determine category based on house number
    num = int(hh.house_number.replace("H-", "").strip())
    category = "normal"
    if num % 7 == 0:
        category = "very_high"
    elif num % 4 == 0:
        category = "high"
    elif num % 13 == 0:
        category = "anomaly"

    category_override = body.get("category")
    if category_override and category_override in ("normal", "high", "very_high", "anomaly"):
        category = category_override

    started = simulator_service.start_simulation(
        household_id=str(hh.id),
        device_id=str(device.id),
        db_factory=async_session_maker,
        category=category,
    )

    return {
        "status": "started" if started else "already_running",
        "household": hh.house_number,
        "device": device.device_code,
        "category": category,
    }


@router.post("/simulate/stop")
async def stop_simulation(
    body: dict,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Stop a running simulation."""
    household_id = body.get("household_id", "").strip()
    if household_id.startswith("H-"):
        stmt = select(Household).where(Household.house_number == household_id)
        result = await db.execute(stmt)
        hh = result.scalars().first()
        if hh:
            household_id = str(hh.id)

    stopped = simulator_service.stop_simulation(household_id)
    return {"status": "stopped" if stopped else "not_running"}


@router.post("/simulate/leak")
async def simulate_leak(
    body: dict,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Trigger a leakage simulation on a pipeline."""
    pipeline_code = body.get("pipeline_id", "P-001")
    duration = float(body.get("duration_seconds", 120))

    # Resolve by code or UUID
    if pipeline_code.startswith("P-"):
        stmt = select(Pipeline).where(Pipeline.pipeline_code == pipeline_code)
    else:
        stmt = select(Pipeline).where(Pipeline.id == pipeline_code)
    result = await db.execute(stmt)
    pipeline = result.scalars().first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    started = simulator_service.start_leak_simulation(
        pipeline_id=str(pipeline.id),
        duration_seconds=duration,
        db_factory=async_session_maker,
    )

    return {
        "status": "started" if started else "already_running",
        "pipeline": pipeline.pipeline_code,
        "duration_seconds": duration,
    }


@router.get("/simulate/status")
async def simulation_status(admin: User = Depends(require_admin)):
    """Return current simulation state."""
    return simulator_service.get_simulation_status()
