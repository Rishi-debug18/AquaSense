from sqlalchemy import Column, String, DateTime, Float, Boolean, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.database import Base

class PipelineReading(Base):
    __tablename__ = "pipeline_readings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pipeline_id = Column(UUID(as_uuid=True), ForeignKey("pipelines.id"), nullable=False)
    reading_ts = Column(DateTime, nullable=False)
    inlet_volume = Column(Float, default=0.0)
    outlet_volume = Column(Float, default=0.0)
    difference = Column(Float, default=0.0)
    difference_percent = Column(Float, default=0.0)
    possible_leak = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('ix_pipeline_readings_pipeline_ts', 'pipeline_id', 'reading_ts'),
    )
