from pydantic import BaseModel
class AreaBase(BaseModel):
    name: str
    description: str
