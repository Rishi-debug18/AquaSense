from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class TariffSlab(Base):
    __tablename__ = "tariff_slabs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tariff_id = Column(UUID(as_uuid=True), ForeignKey("tariffs.id"), nullable=False)
    min_units = Column(Float, nullable=False)
    max_units = Column(Float, nullable=True)
    rate_per_unit = Column(Float, nullable=False)
    display_order = Column(Integer, default=0)
