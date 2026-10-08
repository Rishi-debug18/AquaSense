from pydantic import BaseModel
class AuditBase(BaseModel):
    action: str
