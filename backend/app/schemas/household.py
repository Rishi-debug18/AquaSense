from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HouseholdDashboard(BaseModel):
    house_number: str
    area: str
    residents: int
    today_consumption: float
    month_consumption: float
    estimated_bill: float
    usage_status: str
    flow_rate: float
    device_status: str
    last_updated: datetime
