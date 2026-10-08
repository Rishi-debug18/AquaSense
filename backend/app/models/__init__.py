# Import all models so Alembic can discover them
from app.models.user import User
from app.models.household import Household
from app.models.area import (
    Area, Meter, Device, WaterReading,
    Pipeline, PipelineReading,
    Tariff, TariffSlab, Bill,
    Alert, Message, MessageRecipient,
    Feedback, SupportTicket, Notification,
    AuditLog, SystemSetting
)

__all__ = [
    "User", "Household", "Area", "Meter", "Device",
    "WaterReading", "Pipeline", "PipelineReading",
    "Tariff", "TariffSlab", "Bill",
    "Alert", "Message", "MessageRecipient",
    "Feedback", "SupportTicket", "Notification",
    "AuditLog", "SystemSetting",
]
