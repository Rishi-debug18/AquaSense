from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.database import Base

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String, unique=True, index=True, nullable=False)
    feedback_id = Column(UUID(as_uuid=True), ForeignKey("feedbacks.id"), nullable=True)
    household_id = Column(UUID(as_uuid=True), ForeignKey("households.id"), nullable=False)
    assigned_admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    category = Column(String, nullable=False)
    priority = Column(String, default="normal")
    status = Column(String, default="open")
    description = Column(String, nullable=False)
    admin_notes = Column(String, nullable=True)
    resolution = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
