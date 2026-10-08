from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text, Float, BigInteger, JSON, Date, Index
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base, GUID


class Area(Base):
    __tablename__ = "areas"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    total_population = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    pipelines = relationship("Pipeline", back_populates="area")


class Meter(Base):
    __tablename__ = "meters"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    household_id = Column(GUID(), ForeignKey("households.id"), nullable=False)
    meter_code = Column(String(50), unique=True, nullable=False, index=True)
    device_id = Column(GUID(), ForeignKey("devices.id"), nullable=True)
    installed_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    household = relationship("Household", back_populates="meters")
    device = relationship("Device", backref="meter", uselist=False)


class Device(Base):
    __tablename__ = "devices"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    device_code = Column(String(50), unique=True, nullable=False, index=True)
    household_id = Column(GUID(), ForeignKey("households.id"), nullable=True)
    firmware_version = Column(String(20), default="1.0.0")
    last_seen = Column(DateTime, nullable=True)
    status = Column(String(20), default="unknown")  # online / offline / unknown
    device_token = Column(String(100), nullable=True, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    household = relationship("Household", back_populates="devices")
    water_readings = relationship("WaterReading", back_populates="device")


class WaterReading(Base):
    __tablename__ = "water_readings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    device_id = Column(GUID(), ForeignKey("devices.id"), nullable=False)
    household_id = Column(GUID(), ForeignKey("households.id"), nullable=False)
    reading_ts = Column(DateTime, nullable=False, index=True)
    pulse_count = Column(BigInteger, default=0)
    flow_rate_lpm = Column(Float, default=0.0)
    volume_litre = Column(Float, default=0.0)
    sensor_type = Column(String(10), default="MAIN")  # MAIN / INLET / OUTLET
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="water_readings")
    household = relationship("Household", back_populates="water_readings")

    __table_args__ = (
        Index("ix_water_readings_hh_ts", "household_id", "reading_ts"),
        Index("ix_water_readings_dev_ts", "device_id", "reading_ts"),
    )


class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    area_id = Column(GUID(), ForeignKey("areas.id"), nullable=False)
    pipeline_code = Column(String(20), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    inlet_device_id = Column(GUID(), ForeignKey("devices.id"), nullable=True)
    outlet_device_id = Column(GUID(), ForeignKey("devices.id"), nullable=True)
    leak_threshold_percent = Column(Float, default=5.0)
    status = Column(String(20), default="normal")  # normal / possible_leak / critical_leak / offline
    created_at = Column(DateTime, default=datetime.utcnow)

    area = relationship("Area", back_populates="pipelines")
    readings = relationship("PipelineReading", back_populates="pipeline")


class PipelineReading(Base):
    __tablename__ = "pipeline_readings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    pipeline_id = Column(GUID(), ForeignKey("pipelines.id"), nullable=False)
    reading_ts = Column(DateTime, nullable=False)
    inlet_volume = Column(Float, default=0.0)
    outlet_volume = Column(Float, default=0.0)
    difference = Column(Float, default=0.0)
    difference_percent = Column(Float, default=0.0)
    possible_leak = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    pipeline = relationship("Pipeline", back_populates="readings")

    __table_args__ = (
        Index("ix_pipeline_readings_pip_ts", "pipeline_id", "reading_ts"),
    )


class Tariff(Base):
    __tablename__ = "tariffs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=False)
    base_charge = Column(Float, default=0.0)
    effective_from = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    slabs = relationship("TariffSlab", back_populates="tariff", order_by="TariffSlab.display_order")
    bills = relationship("Bill", back_populates="tariff")


class TariffSlab(Base):
    __tablename__ = "tariff_slabs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    tariff_id = Column(GUID(), ForeignKey("tariffs.id"), nullable=False)
    min_units = Column(Float, default=0.0)
    max_units = Column(Float, nullable=True)  # None = unlimited
    rate_per_unit = Column(Float, nullable=False)
    display_order = Column(Integer, default=0)

    tariff = relationship("Tariff", back_populates="slabs")


class Bill(Base):
    __tablename__ = "bills"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    bill_number = Column(String(50), unique=True, nullable=False)
    household_id = Column(GUID(), ForeignKey("households.id"), nullable=False)
    tariff_id = Column(GUID(), ForeignKey("tariffs.id"), nullable=True)
    billing_period = Column(String(7), nullable=False)  # "2026-08"
    billing_period_start = Column(Date, nullable=True)
    billing_period_end = Column(Date, nullable=True)
    opening_reading_litre = Column(Float, default=0.0)
    closing_reading_litre = Column(Float, default=0.0)
    total_consumption_litre = Column(Float, default=0.0)
    total_consumption_m3 = Column(Float, default=0.0)
    base_charge = Column(Float, default=0.0)
    water_charge = Column(Float, default=0.0)
    other_charge = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    slab_breakdown = Column(JSON, nullable=True)  # list of slab calculation details
    status = Column(String(20), default="draft")  # draft/generated/sent/paid/overdue/cancelled
    generated_at = Column(DateTime, nullable=True)
    due_date = Column(Date, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    household = relationship("Household", back_populates="bills")
    tariff = relationship("Tariff", back_populates="bills")

    __table_args__ = (
        Index("ix_bills_household_period", "household_id", "billing_period"),
    )


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    household_id = Column(GUID(), ForeignKey("households.id"), nullable=True)
    pipeline_id = Column(GUID(), ForeignKey("pipelines.id"), nullable=True)
    alert_type = Column(String(30), nullable=False)
    severity = Column(String(10), default="info")  # info / warning / critical
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    metadata_ = Column("metadata", JSON, nullable=True)
    is_read = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    household = relationship("Household", back_populates="alerts")


class Message(Base):
    __tablename__ = "messages"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    sender_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    target_type = Column(String(20), default="ALL")  # ALL / AREA / HOUSEHOLD
    target_area_id = Column(GUID(), ForeignKey("areas.id"), nullable=True)
    priority = Column(String(10), default="normal")  # low / normal / high / urgent
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User")
    recipients = relationship("MessageRecipient", back_populates="message")


class MessageRecipient(Base):
    __tablename__ = "message_recipients"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    message_id = Column(GUID(), ForeignKey("messages.id"), nullable=False)
    household_id = Column(GUID(), ForeignKey("households.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("Message", back_populates="recipients")
    household = relationship("Household", back_populates="message_recipients")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    household_id = Column(GUID(), ForeignKey("households.id"), nullable=False)
    category = Column(String(30), default="GENERAL")
    description = Column(Text, nullable=False)
    conversation = Column(JSON, default=list)  # [{role, content, timestamp}]
    ai_response = Column(Text, nullable=True)
    status = Column(String(20), default="open")  # open / resolved
    created_at = Column(DateTime, default=datetime.utcnow)

    household = relationship("Household", back_populates="feedback")
    support_ticket = relationship("SupportTicket", back_populates="feedback", uselist=False)


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String(30), unique=True, nullable=False)
    feedback_id = Column(GUID(), ForeignKey("feedback.id"), nullable=True)
    household_id = Column(GUID(), ForeignKey("households.id"), nullable=False)
    assigned_admin_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    category = Column(String(30), default="GENERAL")
    priority = Column(String(10), default="normal")  # low / normal / high / urgent
    status = Column(String(20), default="open")  # open / in_progress / resolved / closed
    description = Column(Text, nullable=False)
    admin_notes = Column(Text, nullable=True)
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    household = relationship("Household", back_populates="support_tickets")
    feedback = relationship("Feedback", back_populates="support_ticket")
    assigned_admin = relationship("User", foreign_keys=[assigned_admin_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    type = Column(String(30), nullable=False)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

    __table_args__ = (
        Index("ix_notifications_user", "user_id", "is_read"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=True)
    target_id = Column(String(100), nullable=True)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="general")
    updated_by = Column(GUID(), ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
