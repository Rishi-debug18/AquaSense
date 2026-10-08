from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base

class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    area_id = Column(UUID(as_uuid=True), ForeignKey("areas.id"), nullable=False)
    pipeline_code = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    inlet_device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id"), nullable=True)
    outlet_device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id"), nullable=True)
    leak_threshold_percent = Column(Float, default=5.0)
    status = Column(String, default="normal")
    created_at = Column(DateTime, default=datetime.utcnow)
