from pydantic import BaseModel
class DeviceBase(BaseModel):
    device_code: str
