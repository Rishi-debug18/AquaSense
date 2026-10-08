from pydantic import BaseModel
class SettingsBase(BaseModel):
    key: str
