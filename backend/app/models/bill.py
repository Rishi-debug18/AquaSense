from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base

class Bill(Base):
    __tablename__ = "bills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bill_number = Column(String, unique=True, index=True, nullable=False)
    household_id = Column(UUID(as_uuid=True), ForeignKey("households.id"), nullable=False)
    tariff_id = Column(UUID(as_uuid=True), ForeignKey("tariffs.id"), nullable=False)
    billing_period = Column(String, nullable=False)
    billing_period_start = Column(Date, nullable=False)
    billing_period_end = Column(Date, nullable=False)
    opening_reading_litre = Column(Float, default=0.0)
    closing_reading_litre = Column(Float, default=0.0)
    total_consumption_litre = Column(Float, default=0.0)
    total_consumption_m3 = Column(Float, default=0.0)
    base_charge = Column(Float, default=0.0)
    water_charge = Column(Float, default=0.0)
    other_charge = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    slab_breakdown = Column(JSON, nullable=True)
    status = Column(String, default="draft")
    generated_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(Date, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
