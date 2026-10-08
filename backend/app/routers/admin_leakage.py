"""Combined admin router file — leakage, alerts, tickets, settings, audit, reports."""
import io
import csv
import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, and_

from app.database import get_db
from app.auth.dependencies import require_admin
from app.models.user import User
from app.models.area import (
    Pipeline, PipelineReading, Alert, SupportTicket, SystemSetting, AuditLog, Bill
)

# ─────────────────────────────────────────────────────────────────────────────
# Leakage Router
# ─────────────────────────────────────────────────────────────────────────────
leakage_router = APIRouter(prefix="/admin", tags=["Admin - Leakage"])


@leakage_router.get("/pipelines")
async def list_pipelines(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pipeline))
    pipelines = result.scalars().all()

    data = []
    for p in pipelines:
        latest_q = await db.execute(
            select(PipelineReading)
            .where(PipelineReading.pipeline_id == p.id)
            .order_by(desc(PipelineReading.reading_ts))
            .limit(1)
        )
        latest = latest_q.scalars().first()
        data.append({
            "id": str(p.id),
            "pipeline_code": p.pipeline_code,
            "area_id": str(p.area_id),
            "description": p.description,
            "status": p.status,
            "leak_threshold_percent": p.leak_threshold_percent,
            "latest": {
                "inlet_volume": latest.inlet_volume,
                "outlet_volume": latest.outlet_volume,
                "difference": latest.difference,
                "difference_percent": latest.difference_percent,
                "possible_leak": latest.possible_leak,
                "reading_ts": latest.reading_ts.isoformat(),
            } if latest else None,
        })
    return data


@leakage_router.get("/pipelines/{pipeline_id}/history")
async def pipeline_history(
    pipeline_id: str,
    hours: int = Query(default=24, ge=1, le=168),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(hours=hours)
    stmt = (
        select(PipelineReading)
        .where(
            and_(
                PipelineReading.pipeline_id == pipeline_id,
                PipelineReading.reading_ts >= since,
            )
        )
        .order_by(PipelineReading.reading_ts)
    )
    result = await db.execute(stmt)
    readings = result.scalars().all()
    return [
        {
            "reading_ts": r.reading_ts.isoformat(),
            "inlet_volume": r.inlet_volume,
            "outlet_volume": r.outlet_volume,
            "difference": r.difference,
            "difference_percent": r.difference_percent,
            "possible_leak": r.possible_leak,
        }
        for r in readings
    ]


@leakage_router.get("/leakage/alerts")
async def leakage_alerts(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Alert)
        .where(
            and_(
                Alert.alert_type.in_(["POSSIBLE_LEAK", "CRITICAL_LEAK"]),
                Alert.is_dismissed == False,
            )
        )
        .order_by(desc(Alert.created_at))
    )
    result = await db.execute(stmt)
    alerts = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "created_at": a.created_at.isoformat(),
        }
        for a in alerts
    ]


# ─────────────────────────────────────────────────────────────────────────────
# Alerts Router
# ─────────────────────────────────────────────────────────────────────────────
alerts_router = APIRouter(prefix="/admin", tags=["Admin - Alerts"])


@alerts_router.get("/alerts")
async def list_alerts(
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Alert).where(Alert.is_dismissed == False)
    if alert_type:
        stmt = stmt.where(Alert.alert_type == alert_type)
    if severity:
        stmt = stmt.where(Alert.severity == severity)
    stmt = stmt.order_by(desc(Alert.created_at)).offset((page - 1) * per_page).limit(per_page)

    total_stmt = select(func.count(Alert.id)).where(Alert.is_dismissed == False)
    total = (await db.execute(total_stmt)).scalar() or 0

    result = await db.execute(stmt)
    alerts = result.scalars().all()
    return {
        "total": total,
        "data": [
            {
                "id": str(a.id),
                "household_id": str(a.household_id) if a.household_id else None,
                "pipeline_id": str(a.pipeline_id) if a.pipeline_id else None,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "title": a.title,
                "message": a.message,
                "is_read": a.is_read,
                "created_at": a.created_at.isoformat(),
            }
            for a in alerts
        ],
    }


@alerts_router.patch("/alerts/{alert_id}/dismiss")
async def dismiss_alert(
    alert_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_dismissed = True
    await db.commit()
    return {"status": "dismissed"}


@alerts_router.patch("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    await db.commit()
    return {"status": "read"}


# ─────────────────────────────────────────────────────────────────────────────
# Support Tickets Router
# ─────────────────────────────────────────────────────────────────────────────
tickets_router = APIRouter(prefix="/admin", tags=["Admin - Support Tickets"])


@tickets_router.get("/tickets")
async def list_tickets(
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SupportTicket)
    if status:
        stmt = stmt.where(SupportTicket.status == status)
    if category:
        stmt = stmt.where(SupportTicket.category == category)
    if priority:
        stmt = stmt.where(SupportTicket.priority == priority)

    total = (await db.execute(select(func.count(SupportTicket.id)))).scalar() or 0
    stmt = stmt.order_by(desc(SupportTicket.created_at)).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    tickets = result.scalars().all()

    return {
        "total": total,
        "data": [
            {
                "id": str(t.id),
                "ticket_number": t.ticket_number,
                "household_id": str(t.household_id),
                "category": t.category,
                "priority": t.priority,
                "status": t.status,
                "description": t.description,
                "admin_notes": t.admin_notes,
                "resolution": t.resolution,
                "created_at": t.created_at.isoformat(),
                "updated_at": t.updated_at.isoformat(),
            }
            for t in tickets
        ],
    }


@tickets_router.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SupportTicket).where(SupportTicket.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {
        "id": str(ticket.id),
        "ticket_number": ticket.ticket_number,
        "household_id": str(ticket.household_id),
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status,
        "description": ticket.description,
        "admin_notes": ticket.admin_notes,
        "resolution": ticket.resolution,
        "created_at": ticket.created_at.isoformat(),
        "updated_at": ticket.updated_at.isoformat(),
    }


@tickets_router.put("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    body: dict,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SupportTicket).where(SupportTicket.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    for field in ("status", "admin_notes", "resolution", "priority"):
        if field in body:
            setattr(ticket, field, body[field])
    ticket.assigned_admin_id = admin.id
    ticket.updated_at = datetime.utcnow()
    await db.commit()
    return {"status": "updated", "ticket_number": ticket.ticket_number}


# ─────────────────────────────────────────────────────────────────────────────
# System Settings Router
# ─────────────────────────────────────────────────────────────────────────────
settings_router = APIRouter(prefix="/admin", tags=["Admin - Settings"])


@settings_router.get("/settings")
async def get_settings(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SystemSetting).order_by(SystemSetting.category, SystemSetting.key)
    )
    settings_list = result.scalars().all()
    return [
        {
            "key": s.key,
            "value": s.value,
            "description": s.description,
            "category": s.category,
            "updated_at": s.updated_at.isoformat(),
        }
        for s in settings_list
    ]


@settings_router.put("/settings/{key}")
async def update_setting(
    key: str,
    body: dict,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SystemSetting).where(SystemSetting.key == key)
    result = await db.execute(stmt)
    setting = result.scalars().first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    setting.value = str(body.get("value", ""))
    setting.updated_by = admin.id
    setting.updated_at = datetime.utcnow()
    await db.commit()
    return {"key": key, "value": setting.value, "status": "updated"}


# ─────────────────────────────────────────────────────────────────────────────
# Audit Log Router
# ─────────────────────────────────────────────────────────────────────────────
audit_router = APIRouter(prefix="/admin", tags=["Admin - Audit"])


@audit_router.get("/audit")
async def get_audit_log(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count(AuditLog.id)))).scalar() or 0
    stmt = (
        select(AuditLog)
        .order_by(desc(AuditLog.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    result = await db.execute(stmt)
    logs = result.scalars().all()
    return {
        "total": total,
        "data": [
            {
                "id": str(l.id),
                "user_id": str(l.user_id) if l.user_id else None,
                "action": l.action,
                "target_type": l.target_type,
                "target_id": l.target_id,
                "old_value": l.old_value,
                "new_value": l.new_value,
                "ip_address": l.ip_address,
                "created_at": l.created_at.isoformat(),
            }
            for l in logs
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Reports Router
# ─────────────────────────────────────────────────────────────────────────────
reports_router = APIRouter(prefix="/admin", tags=["Admin - Reports"])


@reports_router.get("/reports/billing")
async def billing_report(
    period: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Export billing data as CSV."""
    stmt = select(Bill)
    if period:
        stmt = stmt.where(Bill.billing_period == period)
    stmt = stmt.order_by(Bill.billing_period.desc())
    result = await db.execute(stmt)
    bills = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Bill Number", "Billing Period", "Household ID",
        "Consumption Litre", "Consumption m3",
        "Base Charge (INR)", "Water Charge (INR)", "Total Amount (INR)",
        "Status", "Generated At", "Due Date",
    ])
    for b in bills:
        writer.writerow([
            b.bill_number, b.billing_period, str(b.household_id),
            b.total_consumption_litre, b.total_consumption_m3,
            b.base_charge, b.water_charge, b.total_amount,
            b.status,
            b.generated_at.strftime("%Y-%m-%d %H:%M") if b.generated_at else "",
            b.due_date.isoformat() if b.due_date else "",
        ])

    output.seek(0)
    filename = f"billing_report_{period or 'all'}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@reports_router.get("/reports/high-usage")
async def high_usage_report(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Export high usage alerts as CSV."""
    stmt = (
        select(Alert)
        .where(Alert.alert_type.in_(["HIGH_USAGE", "VERY_HIGH_USAGE"]))
        .order_by(desc(Alert.created_at))
    )
    result = await db.execute(stmt)
    alerts = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Alert ID", "Household ID", "Type", "Severity", "Message", "Created At"])
    for a in alerts:
        writer.writerow([
            str(a.id), str(a.household_id) if a.household_id else "",
            a.alert_type, a.severity, a.message,
            a.created_at.strftime("%Y-%m-%d %H:%M"),
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=high_usage_report.csv"},
    )


@reports_router.get("/reports/leakage")
async def leakage_report(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Export leakage events as CSV."""
    stmt = (
        select(PipelineReading)
        .where(PipelineReading.possible_leak == True)
        .order_by(desc(PipelineReading.reading_ts))
    )
    result = await db.execute(stmt)
    readings = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Pipeline ID", "Reading Timestamp", "Inlet Volume (L)",
        "Outlet Volume (L)", "Difference (L)", "Difference %", "Simulated",
    ])
    for r in readings:
        writer.writerow([
            str(r.pipeline_id), r.reading_ts.strftime("%Y-%m-%d %H:%M"),
            r.inlet_volume, r.outlet_volume,
            r.difference, r.difference_percent, r.is_simulated,
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leakage_report.csv"},
    )
