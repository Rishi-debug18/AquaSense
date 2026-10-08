from sqlalchemy import Column, String, DateTime, Float, Boolean, ForeignKey, BigInteger, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base

class WaterReading(Base):
    __tablename__ = "water_readings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id"), nullable=False)
    household_id = Column(UUID(as_uuid=True), ForeignKey("households.id"), nullable=False)
    reading_ts = Column(DateTime(timezone=True), nullable=False)
    pulse_count = Column(BigInteger, default=0)
    flow_rate_lpm = Column(Float, default=0.0)
    volume_litre = Column(Float, default=0.0)
    sensor_type = Column(String, default="MAIN")
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('ix_water_readings_household_ts', 'household_id', 'reading_ts'),
        Index('ix_water_readings_device_ts', 'device_id', 'reading_ts'),
    )
