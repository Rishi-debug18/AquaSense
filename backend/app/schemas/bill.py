from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from uuid import UUID

class BillDetail(BaseModel):
    id: UUID
    bill_number: str
    billing_period: str
    billing_period_start: date
    billing_period_end: date
    opening_reading_litre: float
    closing_reading_litre: float
    total_consumption_litre: float
    total_consumption_m3: float
    base_charge: float
    water_charge: float
    other_charge: float
    total_amount: float
    status: str
    due_date: date
    slab_breakdown: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True
