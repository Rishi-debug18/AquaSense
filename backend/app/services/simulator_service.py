"""
Demo Simulator Service — AquaSense
Generates realistic sensor readings for demonstration without physical ESP32 hardware.

The simulator uses the EXACT SAME database schema and API pipeline as real hardware.
Switching to real ESP32 requires zero code changes to the simulator — just stop it.
"""
import asyncio
import uuid
import math
import random
from datetime import datetime
from typing import Dict
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.area import WaterReading, PipelineReading, Pipeline, Device
from app.services.anomaly_engine import check_anomaly, get_today_consumption
from app.services.leakage_engine import check_leakage
from app.services.alert_service import create_alert
from app.websocket.manager import manager

# Track active simulation tasks
_active_simulations: Dict[str, asyncio.Task] = {}
_active_leak_simulations: Dict[str, asyncio.Task] = {}


def _get_realistic_flow_lpm(hour: int, minute: int, category: str = "normal") -> float:
    """
    Generate realistic flow rate based on time of day and household category.
    Follows real-world consumption patterns.
    """
    # Time-of-day multipliers (peak morning and evening)
    time_factor = (
        0.02 if 0 <= hour < 5 else      # Night — near zero
        0.4 if 5 <= hour < 6 else       # Early morning
        1.0 if 6 <= hour < 9 else       # Morning peak
        0.5 if 9 <= hour < 12 else      # Mid-morning
        0.6 if 12 <= hour < 14 else     # Lunch
        0.3 if 14 <= hour < 17 else     # Afternoon low
        1.0 if 17 <= hour < 21 else     # Evening peak
        0.3 if 21 <= hour < 23 else     # Late evening
        0.05                             # Late night
    )

    base_flow = {
        "normal": 2.5,
        "high": 5.0,
        "very_high": 9.0,
        "anomaly": 12.0,
    }.get(category, 2.5)

    # Add realistic noise (±15%)
    noise = random.uniform(0.85, 1.15)
    flow = base_flow * time_factor * noise

    # Occasional zero readings (tap closed)
    if random.random() < 0.15:
        flow = 0.0

    return round(max(0.0, flow), 2)


async def _simulation_loop(
    household_id: str,
    device_id: str,
    db_factory,
    interval_seconds: float = 10.0,
    category: str = "normal",
):
    """Core simulation loop — runs until cancelled."""
    pulse_count = 0

    while True:
        try:
            now = datetime.utcnow()
            flow_lpm = _get_realistic_flow_lpm(now.hour, now.minute, category)
            volume_this_interval = flow_lpm * (interval_seconds / 60.0)
            pulse_this_interval = int(volume_this_interval * 7.5)  # 7.5 pulses/litre
            pulse_count += pulse_this_interval

            async with db_factory() as db:
                reading = WaterReading(
                    id=uuid.uuid4(),
                    device_id=device_id,
                    household_id=household_id,
                    reading_ts=now,
                    pulse_count=pulse_count,
                    flow_rate_lpm=flow_lpm,
                    volume_litre=round(volume_this_interval, 4),
                    sensor_type="MAIN",
                    is_simulated=True,
                )
                db.add(reading)

                # Update device last_seen
                from sqlalchemy.future import select
                dev_stmt = select(Device).where(Device.id == device_id)
                dev_r = await db.execute(dev_stmt)
                dev = dev_r.scalars().first()
                if dev:
                    dev.last_seen = now
                    dev.status = "online"

                await db.commit()

                # Check anomaly
                today_total = await get_today_consumption(household_id, db)
                anomaly = await check_anomaly(household_id, today_total, db)

                # Broadcast to WebSocket
                payload = {
                    "event": "reading_update",
                    "household_id": household_id,
                    "flow_rate_lpm": flow_lpm,
                    "volume_litre": round(volume_this_interval, 4),
                    "today_total_litre": round(today_total, 2),
                    "usage_status": anomaly["status"],
                    "timestamp": now.isoformat(),
                    "is_simulated": True,
                }
                await manager.broadcast_to_room(f"household_{household_id}", payload)
                await manager.broadcast_to_room("admin", {
                    "event": "reading_update",
                    "household_id": household_id,
                    **payload,
                })

        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[Simulator] Error for household {household_id}: {e}")

        await asyncio.sleep(interval_seconds)


async def _leak_simulation_loop(
    pipeline_id: str,
    duration_seconds: float,
    db_factory,
    leak_percent: float = 20.0,
):
    """Simulate a leakage event on a pipeline."""
    end_time = asyncio.get_event_loop().time() + duration_seconds

    while asyncio.get_event_loop().time() < end_time:
        try:
            now = datetime.utcnow()
            inlet = round(random.uniform(80, 120), 2)
            # Simulate loss: outlet is less by leak_percent (+/- noise)
            loss = inlet * (leak_percent / 100) * random.uniform(0.85, 1.15)
            outlet = round(max(0, inlet - loss), 2)

            result = check_leakage(inlet, outlet, threshold_percent=5.0)

            async with db_factory() as db:
                pr = PipelineReading(
                    id=uuid.uuid4(),
                    pipeline_id=pipeline_id,
                    reading_ts=now,
                    inlet_volume=inlet,
                    outlet_volume=outlet,
                    difference=result["difference"],
                    difference_percent=result["difference_percent"],
                    possible_leak=result["possible_leak"],
                    is_simulated=True,
                )
                db.add(pr)

                if result["possible_leak"]:
                    # Update pipeline status
                    from sqlalchemy.future import select
                    pip_stmt = select(Pipeline).where(Pipeline.id == pipeline_id)
                    pip_r = await db.execute(pip_stmt)
                    pip = pip_r.scalars().first()
                    if pip:
                        pip.status = result["status"]

                await db.commit()

                # Broadcast
                await manager.broadcast_to_room("admin", {
                    "event": "pipeline_update",
                    "pipeline_id": pipeline_id,
                    "inlet_volume": inlet,
                    "outlet_volume": outlet,
                    "difference": result["difference"],
                    "difference_percent": result["difference_percent"],
                    "possible_leak": result["possible_leak"],
                    "status": result["status"],
                    "timestamp": now.isoformat(),
                    "is_simulated": True,
                })

        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[LeakSimulator] Error for pipeline {pipeline_id}: {e}")

        await asyncio.sleep(15)

    # Reset pipeline status after simulation ends
    try:
        async with db_factory() as db:
            from sqlalchemy.future import select
            pip_stmt = select(Pipeline).where(Pipeline.id == pipeline_id)
            pip_r = await db.execute(pip_stmt)
            pip = pip_r.scalars().first()
            if pip:
                pip.status = "normal"
            await db.commit()
    except Exception:
        pass

    _active_leak_simulations.pop(pipeline_id, None)


def start_simulation(household_id: str, device_id: str, db_factory, category: str = "normal"):
    """Start a simulation background task for a household."""
    if household_id in _active_simulations:
        return False  # Already running

    task = asyncio.create_task(
        _simulation_loop(household_id, device_id, db_factory, interval_seconds=10.0, category=category)
    )
    _active_simulations[household_id] = task
    return True


def stop_simulation(household_id: str) -> bool:
    """Stop a running simulation."""
    task = _active_simulations.pop(household_id, None)
    if task:
        task.cancel()
        return True
    return False


def start_leak_simulation(pipeline_id: str, duration_seconds: float, db_factory) -> bool:
    """Start a pipeline leak simulation."""
    if pipeline_id in _active_leak_simulations:
        return False

    task = asyncio.create_task(
        _leak_simulation_loop(pipeline_id, duration_seconds, db_factory)
    )
    _active_leak_simulations[pipeline_id] = task
    return True


def get_simulation_status() -> dict:
    """Return current simulation state."""
    return {
        "active_household_simulations": list(_active_simulations.keys()),
        "active_leak_simulations": list(_active_leak_simulations.keys()),
    }
