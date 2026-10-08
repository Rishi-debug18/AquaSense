from pydantic import BaseModel
class PipelineBase(BaseModel):
    pipeline_code: str
