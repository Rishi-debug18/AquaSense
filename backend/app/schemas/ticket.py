from pydantic import BaseModel
class TicketBase(BaseModel):
    description: str
