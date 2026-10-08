from pydantic import BaseModel
class FeedbackBase(BaseModel):
    description: str
