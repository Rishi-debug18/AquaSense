from pydantic import BaseModel
from typing import Optional

class MessageCreate(BaseModel):
    title: str
    body: str
    target_type: str = "ALL"
    target_area_id: Optional[str] = None
    target_household_id: Optional[str] = None
    priority: str = "normal"
