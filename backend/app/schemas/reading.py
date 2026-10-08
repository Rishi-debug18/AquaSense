from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ReadingCreate(BaseModel):
    device_id: Optional[str] = None
    pulse_count: int
    flow_rate_lpm: float
    volume_litre: float
    sensor_type: str = "MAIN"
    timestamp: Optional[datetime] = None

class PipelineReadingCreate(BaseModel):
    pipeline_code: str
    inlet_volume: float
    outlet_volume: float
    timestamp: Optional[datetime] = None
