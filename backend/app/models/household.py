from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base, GUID


class Household(Base):
    __tablename__ = "households"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    area_id = Column(GUID(), ForeignKey("areas.id"), nullable=False)
    house_number = Column(String(20), unique=True, nullable=False, index=True)
    resident_count = Column(Integer, default=1)
    address = Column(Text, nullable=True)
    installation_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="household", uselist=False)
    area = relationship("Area", backref="households")
    meters = relationship("Meter", back_populates="household", cascade="all, delete-orphan")
    devices = relationship("Device", back_populates="household")
    water_readings = relationship("WaterReading", back_populates="household")
    bills = relationship("Bill", back_populates="household")
    alerts = relationship("Alert", back_populates="household")
    message_recipients = relationship("MessageRecipient", back_populates="household")
    feedback = relationship("Feedback", back_populates="household")
    support_tickets = relationship("SupportTicket", back_populates="household")
