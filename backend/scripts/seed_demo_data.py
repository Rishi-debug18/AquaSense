"""
Full Demo Data Seed Script — AquaSense
Generates 90 days of realistic water consumption data for ~550 households across 5 areas.

DEMO DATA — Not actual measurements.
Run: python scripts/seed_demo_data.py
"""
import asyncio
import sys
import os
import uuid
import random
from datetime import datetime, timedelta, date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.auth.password import hash_password

from app.config import settings
from app.database import Base
from app.models.user import User
from app.models.household import Household
from app.models.area import (
    Area, Meter, Device, WaterReading,
    Pipeline, PipelineReading,
    Tariff, TariffSlab, Bill,
    Alert, Message, MessageRecipient,
    Feedback, SupportTicket, Notification,
    AuditLog, SystemSetting
)


# ─── Configuration ─────────────────────────────────────────────────────────
AREAS = [
    {"name": "Kumpare", "description": "Main residential area near the river", "population": 420},
    {"name": "Vangaon", "description": "Central market district", "population": 480},
    {"name": "Area-C", "description": "Eastern residential zone", "population": 310},
    {"name": "Area-D", "description": "Western residential zone", "population": 450},
    {"name": "Area-E", "description": "Southern extension area", "population": 365},
]

HOUSEHOLDS_PER_AREA = 110  # 5 × 110 = 550 total
DAYS_OF_DATA = 90
READINGS_PER_DAY = 24  # hourly

# Category distribution
CATEGORY_WEIGHTS = {
    "normal": 0.70,
    "high": 0.15,
    "very_high": 0.10,
    "anomaly": 0.05,
}

# Daily base consumption in litres by category
DAILY_CONSUMPTION = {
    "normal": (150, 350),
    "high": (500, 900),
    "very_high": (1000, 1800),
    "anomaly": (200, 1800),  # spikes randomly
}


def get_hourly_distribution():
    """Returns 24 hourly multipliers summing to ~1.0"""
    pattern = [
        0.005, 0.003, 0.002, 0.002, 0.003, 0.02,   # 0-5 AM
        0.08, 0.10, 0.09, 0.05, 0.04, 0.04,         # 6-11 AM
        0.05, 0.04, 0.03, 0.03, 0.04, 0.07,         # 12-17 PM
        0.09, 0.10, 0.09, 0.06, 0.04, 0.02,         # 18-23 PM
    ]
    total = sum(pattern)
    return [p / total for p in pattern]


HOURLY_DIST = get_hourly_distribution()


def pick_category() -> str:
    r = random.random()
    cumulative = 0.0
    for cat, weight in CATEGORY_WEIGHTS.items():
        cumulative += weight
        if r <= cumulative:
            return cat
    return "normal"


def get_daily_litre(category: str, day_index: int, is_anomaly_day: bool = False) -> float:
    lo, hi = DAILY_CONSUMPTION[category]
    base = random.uniform(lo, hi)

    # Anomaly households get sudden spikes on random days
    if category == "anomaly" and is_anomaly_day:
        base = random.uniform(1200, 2500)

    # Weekend slightly higher
    return round(base * random.uniform(0.9, 1.1), 2)


async def seed(engine, session_maker):
    print("\n[AquaSense] Demo Data Seeder")
    print("=" * 50)
    print("[NOTE] DEMO DATA -- Not actual measurements\n")

    async with session_maker() as db:
        # ── Clear existing data ──────────────────────────────────────────
        print("Clearing existing data...")
        for model in [
            AuditLog, Notification, SupportTicket, Feedback,
            MessageRecipient, Message, Alert, Bill, WaterReading,
            PipelineReading, Pipeline, Meter, Device, Household,
            TariffSlab, Tariff, SystemSetting, Area, User,
        ]:
            from sqlalchemy import text
            await db.execute(text(f"DELETE FROM {model.__tablename__}"))
        await db.commit()
        print("[OK] Cleared\n")

        # ── Admin User ──────────────────────────────────────────────────
        print("Creating admin user...")
        admin = User(
            id=uuid.uuid4(),
            email="admin@aquasense.demo",
            password_hash=hash_password("AquaSense@Admin2026"),
            role="admin",
            full_name="AquaSense Administrator",
            phone="+91-9000000001",
            is_active=True,
        )
        db.add(admin)
        await db.flush()
        print("[OK] Admin: admin@aquasense.demo / AquaSense@Admin2026")

        # ── System Settings ─────────────────────────────────────────────
        print("Creating system settings...")
        settings_data = [
            ("leak_threshold_percent", "5.0", "Leakage threshold (%)", "thresholds"),
            ("high_usage_threshold_percent", "50.0", "High usage alert threshold (%)", "thresholds"),
            ("very_high_usage_threshold_percent", "100.0", "Very high usage threshold (%)", "thresholds"),
            ("device_offline_timeout_minutes", "15", "Minutes before device marked offline", "devices"),
            ("billing_day", "1", "Day of month for bill generation", "billing"),
            ("currency", "INR", "Currency code", "billing"),
            ("currency_symbol", "Rs.", "Currency symbol", "billing"),
            ("demo_mode", "true", "System is running in demo mode", "system"),
        ]
        for key, value, desc, cat in settings_data:
            s = SystemSetting(
                id=uuid.uuid4(), key=key, value=value,
                description=desc, category=cat, updated_by=admin.id
            )
            db.add(s)
        await db.flush()
        print("[OK] System settings")

        # ── Tariff ──────────────────────────────────────────────────────
        print("Creating demo tariff...")
        tariff = Tariff(
            id=uuid.uuid4(),
            name="Demo Municipal Tariff 2026",
            description="Configurable demo tariff -- Not official Maharashtra tariff rates",
            is_active=True,
            base_charge=25.0,
            effective_from=date(2026, 1, 1),
            notes="DEMO TARIFF -- Rates are configurable demonstration values only",
        )
        db.add(tariff)
        await db.flush()

        slab_data = [
            (0.0, 5.0, 3.0, 0),
            (5.0, 10.0, 5.0, 1),
            (10.0, 20.0, 8.0, 2),
            (20.0, None, 12.0, 3),
        ]
        for min_u, max_u, rate, order in slab_data:
            db.add(TariffSlab(
                id=uuid.uuid4(), tariff_id=tariff.id,
                min_units=min_u, max_units=max_u,
                rate_per_unit=rate, display_order=order
            ))
        await db.flush()
        print("[OK] Tariff: 0-5m3 @ Rs.3, 5-10m3 @ Rs.5, 10-20m3 @ Rs.8, 20+m3 @ Rs.12 + Rs.25 base")

        # ── Areas ───────────────────────────────────────────────────────
        print("Creating areas...")
        area_objs = []
        for a in AREAS:
            area = Area(
                id=uuid.uuid4(),
                name=a["name"],
                description=a["description"],
                total_population=a["population"],
            )
            db.add(area)
            area_objs.append(area)
        await db.flush()
        print(f"[OK] Areas: {[a.name for a in area_objs]}")

        # ── Households, Users, Devices, Meters ──────────────────────────
        print(f"Creating {len(area_objs) * HOUSEHOLDS_PER_AREA} households...")
        all_households = []
        household_categories = {}
        hh_number = 1

        for area in area_objs:
            for i in range(HOUSEHOLDS_PER_AREA):
                house_no = f"H-{hh_number:03d}"
                residents = random.randint(2, 7)
                category = pick_category()

                # User
                user = User(
                    id=uuid.uuid4(),
                    email=f"h{hh_number:03d}@aquasense.demo",
                    password_hash=hash_password(f"House@{hh_number:03d}Demo"),
                    role="household",
                    full_name=f"Resident {house_no}",
                    phone=f"+91-{9000000001 + hh_number}",
                    is_active=True,
                )
                db.add(user)
                await db.flush()

                # Household
                hh = Household(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    area_id=area.id,
                    house_number=house_no,
                    resident_count=residents,
                    address=f"{house_no}, {area.name}, Demo District",
                    installation_date=date(2025, random.randint(1, 12), random.randint(1, 28)),
                    is_active=True,
                )
                db.add(hh)
                await db.flush()

                # Device
                device_code = f"ESP32-{house_no.replace('-','')}"
                device_status = "online" if random.random() > 0.05 else "offline"
                device = Device(
                    id=uuid.uuid4(),
                    device_code=device_code,
                    household_id=hh.id,
                    firmware_version="1.2.0",
                    last_seen=datetime.utcnow() - timedelta(minutes=random.randint(1, 20)),
                    status=device_status,
                    device_token=f"tok-{uuid.uuid4().hex[:16]}",
                )
                db.add(device)
                await db.flush()

                # Meter
                meter = Meter(
                    id=uuid.uuid4(),
                    household_id=hh.id,
                    meter_code=f"MTR-{house_no.replace('-','')}",
                    device_id=device.id,
                    installed_at=datetime.combine(hh.installation_date, datetime.min.time()),
                    is_active=True,
                )
                db.add(meter)

                all_households.append((hh, device, category))
                household_categories[str(hh.id)] = category
                hh_number += 1

                if hh_number % 50 == 0:
                    await db.commit()
                    print(f"  ... {hh_number - 1} households created")

        await db.commit()
        print(f"[OK] {hh_number - 1} households created")

        # ── Water Readings (90 days hourly) ──────────────────────────────
        print(f"Generating {DAYS_OF_DATA} days × 24 hours of water readings...")
        total_readings = 0
        base_date = datetime.utcnow() - timedelta(days=DAYS_OF_DATA)

        # Batch insert for performance
        BATCH = 500
        batch = []

        for hh, device, category in all_households:
            # Pick anomaly days for anomaly category
            anomaly_days = set(random.sample(range(DAYS_OF_DATA), k=random.randint(3, 8))) \
                if category == "anomaly" else set()

            for day_idx in range(DAYS_OF_DATA):
                is_anomaly_day = day_idx in anomaly_days
                daily_target = get_daily_litre(category, day_idx, is_anomaly_day)

                for hour in range(24):
                    hour_fraction = HOURLY_DIST[hour]
                    hour_litre = daily_target * hour_fraction * random.uniform(0.9, 1.1)
                    if hour_litre < 0.001:
                        hour_litre = 0.0

                    flow_lpm = hour_litre / 60.0  # litres per hour → per minute estimate

                    reading_ts = base_date + timedelta(days=day_idx, hours=hour, minutes=random.randint(0, 59))

                    batch.append({
                        "id": str(uuid.uuid4()),
                        "device_id": str(device.id),
                        "household_id": str(hh.id),
                        "reading_ts": reading_ts,
                        "pulse_count": int(hour_litre * 7.5),
                        "flow_rate_lpm": round(flow_lpm, 3),
                        "volume_litre": round(hour_litre, 4),
                        "sensor_type": "MAIN",
                        "is_simulated": True,
                        "created_at": datetime.utcnow(),
                    })
                    total_readings += 1

                    if len(batch) >= BATCH:
                        from sqlalchemy import text
                        await db.execute(
                            text("""
                                INSERT INTO water_readings
                                    (id, device_id, household_id, reading_ts, pulse_count,
                                     flow_rate_lpm, volume_litre, sensor_type, is_simulated, created_at)
                                VALUES
                                    (:id, :device_id, :household_id, :reading_ts, :pulse_count,
                                     :flow_rate_lpm, :volume_litre, :sensor_type, :is_simulated, :created_at)
                            """),
                            batch
                        )
                        await db.commit()
                        batch = []

                        if total_readings % 50000 == 0:
                            print(f"  ... {total_readings:,} readings inserted")

        if batch:
            from sqlalchemy import text
            await db.execute(
                text("""
                    INSERT INTO water_readings
                        (id, device_id, household_id, reading_ts, pulse_count,
                         flow_rate_lpm, volume_litre, sensor_type, is_simulated, created_at)
                    VALUES
                        (:id, :device_id, :household_id, :reading_ts, :pulse_count,
                         :flow_rate_lpm, :volume_litre, :sensor_type, :is_simulated, :created_at)
                """),
                batch
            )
            await db.commit()

        print(f"[OK] {total_readings:,} water readings created")

        # ── Pipelines ────────────────────────────────────────────────────
        print("Creating pipelines...")
        pipelines = []
        for i, area in enumerate(area_objs):
            pip = Pipeline(
                id=uuid.uuid4(),
                area_id=area.id,
                pipeline_code=f"P-{i + 1:03d}",
                description=f"Main pipeline — {area.name}",
                leak_threshold_percent=5.0,
                status="normal",
            )
            db.add(pip)
            pipelines.append(pip)
        await db.commit()

        # ── Pipeline Readings (30 days + 5 leakage events) ───────────────
        print("Generating pipeline readings...")
        pip_readings = 0
        leak_pipeline_ids = random.sample([str(p.id) for p in pipelines], k=2)

        pipeline_batch = []
        for pip in pipelines:
            is_leaky = str(pip.id) in leak_pipeline_ids
            for day_idx in range(30):
                for hour in range(24):
                    reading_ts = datetime.utcnow() - timedelta(days=30 - day_idx, hours=23 - hour)
                    inlet = round(random.uniform(60, 120), 2)

                    # Leakage on days 20-25 for leaky pipelines
                    if is_leaky and 20 <= day_idx <= 25:
                        loss_pct = random.uniform(12, 25)
                        outlet = round(inlet * (1 - loss_pct / 100), 2)
                        if day_idx == 22 and hour == 10:
                            pip.status = "possible_leak"
                    else:
                        outlet = round(inlet * random.uniform(0.97, 1.0), 2)

                    diff = round(inlet - outlet, 4)
                    diff_pct = round((diff / inlet) * 100, 2) if inlet > 0 else 0
                    possible = diff_pct > 5.0

                    pipeline_batch.append({
                        "id": str(uuid.uuid4()),
                        "pipeline_id": str(pip.id),
                        "reading_ts": reading_ts,
                        "inlet_volume": inlet,
                        "outlet_volume": outlet,
                        "difference": diff,
                        "difference_percent": diff_pct,
                        "possible_leak": possible,
                        "is_simulated": True,
                        "created_at": datetime.utcnow(),
                    })
                    pip_readings += 1

                    if len(pipeline_batch) >= BATCH:
                        from sqlalchemy import text
                        await db.execute(
                            text("""
                                INSERT INTO pipeline_readings
                                    (id, pipeline_id, reading_ts, inlet_volume, outlet_volume,
                                     difference, difference_percent, possible_leak, is_simulated, created_at)
                                VALUES
                                    (:id, :pipeline_id, :reading_ts, :inlet_volume, :outlet_volume,
                                     :difference, :difference_percent, :possible_leak, :is_simulated, :created_at)
                            """),
                            pipeline_batch
                        )
                        await db.commit()
                        pipeline_batch = []

        if pipeline_batch:
            from sqlalchemy import text
            await db.execute(
                text("""
                    INSERT INTO pipeline_readings
                        (id, pipeline_id, reading_ts, inlet_volume, outlet_volume,
                         difference, difference_percent, possible_leak, is_simulated, created_at)
                    VALUES
                        (:id, :pipeline_id, :reading_ts, :inlet_volume, :outlet_volume,
                         :difference, :difference_percent, :possible_leak, :is_simulated, :created_at)
                """),
                pipeline_batch
            )
            await db.commit()

        await db.commit()
        print(f"[OK] {pip_readings:,} pipeline readings created")

        # ── Bills (last 3 months) ────────────────────────────────────────
        print("Generating bills...")
        bill_count = 0
        now = datetime.utcnow()

        for month_offset in range(1, 4):
            bill_month = now.month - month_offset
            bill_year = now.year
            if bill_month <= 0:
                bill_month += 12
                bill_year -= 1
            billing_period = f"{bill_year}-{bill_month:02d}"

            period_start = date(bill_year, bill_month, 1)
            if bill_month == 12:
                period_end = date(bill_year + 1, 1, 1) - timedelta(days=1)
            else:
                period_end = date(bill_year, bill_month + 1, 1) - timedelta(days=1)

            for hh, device, category in all_households:
                daily_lo, daily_hi = DAILY_CONSUMPTION[category]
                avg_daily = random.uniform(daily_lo, daily_hi)
                days_in_month = (period_end - period_start).days + 1
                total_litre = avg_daily * days_in_month
                total_m3 = total_litre / 1000

                # Calculate bill
                base = 25.0
                water_charge = 0.0
                breakdown = []
                remaining = total_m3
                slab_data_calc = [(0, 5, 3.0), (5, 10, 5.0), (10, 20, 8.0), (20, None, 12.0)]
                for (s_min, s_max, rate) in slab_data_calc:
                    if remaining <= 0:
                        break
                    cap = (s_max - s_min) if s_max else remaining
                    used = min(remaining, cap)
                    amt = round(used * rate, 2)
                    water_charge += amt
                    remaining -= used
                    max_label = f"{s_max} m³" if s_max else "and above"
                    breakdown.append({
                        "range": f"{s_min}–{max_label}",
                        "units_m3": round(used, 4),
                        "rate_per_unit": rate,
                        "amount": amt,
                    })

                total_amount = round(base + water_charge, 2)
                status = random.choice(["paid", "paid", "paid", "generated", "overdue"])
                if month_offset == 1 and status == "paid":
                    status = "generated"

                bill = Bill(
                    id=uuid.uuid4(),
                    bill_number=f"BILL-{billing_period.replace('-','')}-{hh.house_number}",
                    household_id=hh.id,
                    tariff_id=tariff.id,
                    billing_period=billing_period,
                    billing_period_start=period_start,
                    billing_period_end=period_end,
                    opening_reading_litre=0.0,
                    closing_reading_litre=round(total_litre, 2),
                    total_consumption_litre=round(total_litre, 2),
                    total_consumption_m3=round(total_m3, 4),
                    base_charge=base,
                    water_charge=round(water_charge, 2),
                    other_charge=0.0,
                    total_amount=total_amount,
                    slab_breakdown=breakdown,
                    status=status,
                    generated_at=datetime.combine(period_end, datetime.min.time()) + timedelta(days=1),
                    due_date=date(bill_year, bill_month, 20),
                )
                db.add(bill)
                bill_count += 1

                if bill_count % 200 == 0:
                    await db.commit()

        await db.commit()
        print(f"[OK] {bill_count} bills generated")

        # ── Alerts ───────────────────────────────────────────────────────
        print("Generating alerts...")
        alert_count = 0
        high_usage_hhs = [(hh, dev, cat) for hh, dev, cat in all_households if cat in ("high", "very_high", "anomaly")]

        for hh, device, category in random.sample(high_usage_hhs, min(80, len(high_usage_hhs))):
            alert = Alert(
                id=uuid.uuid4(),
                household_id=hh.id,
                alert_type="HIGH_USAGE" if category == "high" else "VERY_HIGH_USAGE",
                severity="warning" if category == "high" else "critical",
                title="High Water Consumption Detected",
                message=f"[DEMO DATA] Consumption for {hh.house_number} exceeds normal usage threshold.",
                is_read=random.choice([True, False]),
            )
            db.add(alert)
            alert_count += 1

        # Leakage alerts for leaky pipelines
        for pip in pipelines:
            if str(pip.id) in leak_pipeline_ids:
                alert = Alert(
                    id=uuid.uuid4(),
                    pipeline_id=pip.id,
                    alert_type="POSSIBLE_LEAK",
                    severity="critical",
                    title=f"Possible Leakage Detected -- Pipeline {pip.pipeline_code}",
                    message=f"[DEMO DATA] Sensor difference exceeds threshold on {pip.pipeline_code}. Inspection recommended.",
                    is_read=False,
                )
                db.add(alert)
                alert_count += 1

        # Offline device alerts
        offline_hhs = [(hh, dev, cat) for hh, dev, cat in all_households if dev.status == "offline"]
        for hh, device, category in offline_hhs[:5]:
            alert = Alert(
                id=uuid.uuid4(),
                household_id=hh.id,
                alert_type="DEVICE_OFFLINE",
                severity="warning",
                title=f"Device Offline — {hh.house_number}",
                message=f"[DEMO DATA] Meter {device.device_code} has not sent data in the last 15 minutes.",
                is_read=False,
            )
            db.add(alert)
            alert_count += 1

        await db.commit()
        print(f"[OK] {alert_count} alerts created")

        # ── Messages ─────────────────────────────────────────────────────
        print("Creating sample messages...")
        sample_messages = [
            {
                "title": "Water Supply Maintenance Notice",
                "body": "[DEMO MESSAGE] Water supply will be unavailable tomorrow (Sunday) from 10:00 AM to 3:00 PM due to scheduled pipeline maintenance. Please store sufficient water.",
                "target_type": "ALL",
                "priority": "high",
            },
            {
                "title": "Water Conservation Appeal",
                "body": "[DEMO MESSAGE] Dear residents, we are facing a seasonal water shortage. Please use water judiciously and report any visible leakage to the water authority.",
                "target_type": "ALL",
                "priority": "normal",
            },
            {
                "title": "Pipeline Work — Kumpare Area",
                "body": "[DEMO MESSAGE] Water supply to Kumpare area will be interrupted tomorrow from 9:00 AM to 1:00 PM due to ongoing pipeline repair work.",
                "target_type": "AREA",
                "priority": "high",
            },
            {
                "title": "New Tariff Structure Effective From September 2026",
                "body": "[DEMO MESSAGE] A revised water tariff structure will come into effect from September 2026. Please visit the nearest municipal office for details.",
                "target_type": "ALL",
                "priority": "normal",
            },
            {
                "title": "Water Contamination Alert — Area-E",
                "body": "[DEMO MESSAGE] URGENT: Do not consume supplied water in Area-E until further notice. Boil water before use as a precaution. Municipal team is investigating.",
                "target_type": "AREA",
                "priority": "urgent",
            },
        ]

        for i, msg_data in enumerate(sample_messages):
            msg = Message(
                id=uuid.uuid4(),
                sender_id=admin.id,
                title=msg_data["title"],
                body=msg_data["body"],
                target_type=msg_data["target_type"],
                target_area_id=area_objs[0].id if msg_data["target_type"] == "AREA" and i == 2 else (area_objs[4].id if msg_data["target_type"] == "AREA" else None),
                priority=msg_data["priority"],
            )
            db.add(msg)
            await db.flush()

            # Add recipients
            target_hhs = all_households if msg_data["target_type"] == "ALL" else [
                (hh, dev, cat) for hh, dev, cat in all_households
                if str(hh.area_id) == str(msg.target_area_id)
            ] if msg.target_area_id else []

            for hh, dev, cat in target_hhs[:200]:  # limit for seeding speed
                db.add(MessageRecipient(
                    id=uuid.uuid4(),
                    message_id=msg.id,
                    household_id=hh.id,
                    is_read=random.choice([True, False]),
                ))

        await db.commit()
        print(f"[OK] {len(sample_messages)} messages created")

        # ── Support Tickets ───────────────────────────────────────────────
        print("Creating sample support tickets...")
        ticket_categories = ["BILLING", "METER", "HIGH_USAGE", "LEAKAGE", "WATER_SUPPLY", "GENERAL"]
        statuses = ["open", "open", "in_progress", "in_progress", "resolved", "closed"]

        for i in range(10):
            hh, dev, cat = random.choice(all_households)
            category = random.choice(ticket_categories)
            status = statuses[i % len(statuses)]
            ticket = SupportTicket(
                id=uuid.uuid4(),
                ticket_number=f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{i + 1:04d}",
                household_id=hh.id,
                assigned_admin_id=admin.id if status in ("in_progress", "resolved", "closed") else None,
                category=category,
                priority=random.choice(["low", "normal", "high"]),
                status=status,
                description=f"[DEMO TICKET] Sample {category.lower()} issue reported by household {hh.house_number}.",
                admin_notes="[DEMO] Admin has reviewed this ticket." if status != "open" else None,
                resolution="[DEMO] Issue has been resolved." if status in ("resolved", "closed") else None,
            )
            db.add(ticket)

        await db.commit()
        print("[OK] 10 support tickets created")

        # ── Summary ──────────────────────────────────────────────────────
        print("\n" + "=" * 50)
        print("[OK] AquaSense Demo Data Seeding Complete!")
        print("=" * 50)
        print(f"[OK] Areas:            {len(area_objs)}")
        print(f"[OK] Households:       {hh_number - 1}")
        print(f"[OK] Users:            {hh_number} (incl. 1 admin)")
        print(f"[OK] Devices:          {hh_number - 1}")
        print(f"[OK] Water readings:   {total_readings:,}")
        print(f"[OK] Pipeline readings:{pip_readings:,}")
        print(f"[OK] Bills generated:  {bill_count}")
        print(f"[OK] Alerts:           {alert_count}")
        print(f"[OK] Messages:         {len(sample_messages)}")
        print(f"[OK] Support tickets:  10")
        print("\n[INFO] Demo Credentials:")
        print("   Admin:   admin@aquasense.demo     / AquaSense@Admin2026")
        print("   House:   h102@aquasense.demo      / House@102Demo")
        print("   House:   h001@aquasense.demo      / House@001Demo")
        print("\n[NOTE] All data is DEMO DATA -- Not actual measurements")
        print("=" * 50)


async def main():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_maker = async_sessionmaker(engine, expire_on_commit=False)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await seed(engine, session_maker)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
