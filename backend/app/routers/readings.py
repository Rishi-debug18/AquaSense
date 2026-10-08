"""
ESP32 Readings Ingestion Router — AquaSense
Accepts sensor data from real ESP32 hardware OR the demo simulator.
The exact same endpoint is used by both — no code change needed to switch.
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from datetime import datetime
from typing import Optional
import uuid

from app.database import get_db
from app.models.area import (
    WaterReading, PipelineReading, Pipeline, Device
)
from app.models.household import Household
from app.services.anomaly_engine import check_anomaly, get_today_consumption
from app.services.leakage_engine import check_leakage
from app.services.alert_service import create_alert
from app.websocket.manager import manager

router = APIRouter(prefix="", tags=["IoT / ESP32"])


async def _authenticate_device(device_code: str, token: str, db: AsyncSession) -> Device:
    """Authenticate a device by code and token."""
    stmt = select(Device).where(Device.device_code == device_code)
    result = await db.execute(stmt)
    device = result.scalars().first()

    if not device:
        raise HTTPException(status_code=401, detail=f"Unknown device: {device_code}")

    if device.device_token and token and device.device_token != token:
        raise HTTPException(status_code=401, detail="Invalid device token")

    return device


@router.post("/readings", status_code=201)
async def submit_reading(
    body: dict,
    x_device_token: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    ESP32 / Simulator data ingestion endpoint.
    
    Request body:
    {
        "device_id": "ESP32-H102",
        "pulse_count": 15240,
        "flow_rate_lpm": 4.2,
        "volume_litre": 338.7,
        "sensor_type": "MAIN",  // optional
        "timestamp": "2026-08-29T20:30:00Z"  // optional
    }
    """
    device_code = body.get("device_id", "").strip()
    if not device_code:
        raise HTTPException(status_code=400, detail="device_id is required")

    pulse_count = body.get("pulse_count", 0)
    flow_rate = body.get("flow_rate_lpm", 0.0)
    volume = body.get("volume_litre", 0.0)
    sensor_type = body.get("sensor_type", "MAIN").upper()
    is_simulated = body.get("is_simulated", False)

    # Validate values
    if pulse_count < 0 or flow_rate < 0 or volume < 0:
        raise HTTPException(status_code=400, detail="Sensor values cannot be negative")

    if flow_rate > 1000:
        raise HTTPException(status_code=400, detail=f"Flow rate {flow_rate} L/min seems unreasonably high")

    if volume > 10000:
        raise HTTPException(status_code=400, detail=f"Volume {volume} L per reading seems unreasonably high")

    if sensor_type not in ("MAIN", "INLET", "OUTLET"):
        raise HTTPException(status_code=400, detail=f"Invalid sensor_type: {sensor_type}")

    # Authenticate device
    device = await _authenticate_device(device_code, x_device_token, db)

    # Get household
    if not device.household_id:
        raise HTTPException(status_code=422, detail="Device is not assigned to a household")

    hh_stmt = select(Household).where(Household.id == device.household_id)
    hh_result = await db.execute(hh_stmt)
    household = hh_result.scalars().first()
    if not household:
        raise HTTPException(status_code=422, detail="Household not found for device")

    # Parse timestamp
    ts_raw = body.get("timestamp")
    if ts_raw:
        try:
            reading_ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
        except ValueError:
            reading_ts = datetime.utcnow()
    else:
        reading_ts = datetime.utcnow()

    # Store reading
    reading = WaterReading(
        id=uuid.uuid4(),
        device_id=device.id,
        household_id=household.id,
        reading_ts=reading_ts,
        pulse_count=int(pulse_count),
        flow_rate_lpm=float(flow_rate),
        volume_litre=float(volume),
        sensor_type=sensor_type,
        is_simulated=is_simulated,
    )
    db.add(reading)

    # Update device last_seen
    device.last_seen = datetime.utcnow()
    device.status = "online"

    await db.commit()

    # Run anomaly check
    today_total = await get_today_consumption(str(household.id), db)
    anomaly = await check_anomaly(str(household.id), today_total, db)

    # Create alert if anomalous
    if anomaly["status"] in ("HIGH", "VERY_HIGH", "ANOMALY"):
        alert_type = "HIGH_USAGE" if anomaly["status"] == "HIGH" else "VERY_HIGH_USAGE"
        await create_alert(
            household_id=str(household.id),
            alert_type=alert_type,
            severity="warning" if anomaly["status"] == "HIGH" else "critical",
            title=f"{'High' if anomaly['status'] == 'HIGH' else 'Very High'} Water Consumption",
            message=(
                f"Household {household.house_number}: Today's consumption ({today_total:.0f} L) "
                f"is {anomaly['percentage_change']:.0f}% above the 30-day average "
                f"({anomaly['baseline_litres_per_day']:.0f} L/day)."
            ),
            db=db,
        )

    # Broadcast via WebSocket
    payload = {
        "event": "reading_update",
        "household_id": str(household.id),
        "house_number": household.house_number,
        "flow_rate_lpm": float(flow_rate),
        "volume_litre": float(volume),
        "today_total_litre": round(today_total, 2),
        "usage_status": anomaly["status"],
        "timestamp": reading_ts.isoformat(),
        "is_simulated": is_simulated,
    }
    await manager.broadcast_to_room(f"household_{household.id}", payload)
    await manager.broadcast_to_room("admin", payload)

    return {
        "status": "accepted",
        "reading_id": str(reading.id),
        "household": household.house_number,
        "today_total_litre": round(today_total, 2),
        "usage_status": anomaly["status"],
    }


@router.post("/pipeline-readings", status_code=201)
async def submit_pipeline_reading(
    body: dict,
    x_device_token: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Dual-sensor pipeline reading for leakage detection.
    
    Request body:
    {
        "device_id": "ESP32-H102",
        "pipeline_id": "optional-pipeline-uuid",
        "inlet_volume": 100.0,
        "outlet_volume": 82.0
    }
    """
    device_code = body.get("device_id", "").strip()
    inlet = float(body.get("inlet_volume", 0.0))
    outlet = float(body.get("outlet_volume", 0.0))
    pipeline_id = body.get("pipeline_id")

    if inlet < 0 or outlet < 0:
        raise HTTPException(status_code=400, detail="Volume values cannot be negative")

    device = await _authenticate_device(device_code, x_device_token, db)

    # Find pipeline
    if pipeline_id:
        pip_stmt = select(Pipeline).where(Pipeline.id == pipeline_id)
    else:
        # Find by area
        if device.household_id:
            hh_stmt = select(Household).where(Household.id == device.household_id)
            hh_r = await db.execute(hh_stmt)
            hh = hh_r.scalars().first()
            pip_stmt = select(Pipeline).where(Pipeline.area_id == hh.area_id).limit(1) if hh else None

    if pip_stmt is None:
        raise HTTPException(status_code=422, detail="Could not identify pipeline")

    pip_r = await db.execute(pip_stmt)
    pipeline = pip_r.scalars().first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    # Run leakage detection
    result = check_leakage(
        inlet_volume=inlet,
        outlet_volume=outlet,
        threshold_percent=pipeline.leak_threshold_percent,
    )

    # Store reading
    pr = PipelineReading(
        id=uuid.uuid4(),
        pipeline_id=pipeline.id,
        reading_ts=datetime.utcnow(),
        inlet_volume=inlet,
        outlet_volume=outlet,
        difference=result["difference"],
        difference_percent=result["difference_percent"],
        possible_leak=result["possible_leak"],
        is_simulated=body.get("is_simulated", False),
    )
    db.add(pr)

    # Update pipeline status
    pipeline.status = result["status"]

    # Create alert if leakage detected
    if result["possible_leak"]:
        await create_alert(
            household_id=None,
            alert_type="POSSIBLE_LEAK",
            severity="critical" if result["status"] == "critical_leak" else "warning",
            title=f"Possible Leakage — Pipeline {pipeline.pipeline_code}",
            message=(
                f"Pipeline {pipeline.pipeline_code}: Inlet {inlet:.1f} L, Outlet {outlet:.1f} L, "
                f"Difference {result['difference']:.1f} L ({result['difference_percent']:.1f}%). "
                f"{result['note']}"
            ),
            db=db,
            pipeline_id=str(pipeline.id),
        )

    await db.commit()

    # Broadcast
    await manager.broadcast_to_room("admin", {
        "event": "pipeline_update",
        "pipeline_id": str(pipeline.id),
        "pipeline_code": pipeline.pipeline_code,
        "inlet_volume": inlet,
        "outlet_volume": outlet,
        "difference": result["difference"],
        "difference_percent": result["difference_percent"],
        "possible_leak": result["possible_leak"],
        "status": result["status"],
        "timestamp": datetime.utcnow().isoformat(),
    })

    return {
        "status": "accepted",
        "pipeline": pipeline.pipeline_code,
        "difference": result["difference"],
        "difference_percent": result["difference_percent"],
        "possible_leak": result["possible_leak"],
        "leak_status": result["status"],
        "note": result["note"],
    }


@router.get("/devices/{device_code}/status")
async def get_device_status(
    device_code: str,
    db: AsyncSession = Depends(get_db),
):
    """Check device registration and status."""
    stmt = select(Device).where(Device.device_code == device_code)
    result = await db.execute(stmt)
    device = result.scalars().first()

    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")

    minutes_since = None
    if device.last_seen:
        minutes_since = round((datetime.utcnow() - device.last_seen).total_seconds() / 60, 1)

    return {
        "device_code": device.device_code,
        "status": device.status,
        "last_seen": device.last_seen.isoformat() if device.last_seen else None,
        "minutes_since_last_reading": minutes_since,
        "firmware_version": device.firmware_version,
        "household_assigned": device.household_id is not None,
    }
