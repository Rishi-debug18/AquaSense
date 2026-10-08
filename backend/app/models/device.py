from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_code = Column(String, unique=True, index=True, nullable=False)
    household_id = Column(UUID(as_uuid=True), ForeignKey("households.id"), nullable=False)
    firmware_version = Column(String, nullable=True)
    last_seen = Column(DateTime, nullable=True)
    status = Column(String, default="offline")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    household = relationship("Household")
