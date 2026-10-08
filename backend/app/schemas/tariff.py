from pydantic import BaseModel
class TariffBase(BaseModel):
    name: str
