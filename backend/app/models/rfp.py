from beanie import Document
from pydantic import BaseModel
from datetime import datetime
import uuid

class RFP(Document):
    document_uuid: str = str(uuid.uuid4())
    user_uuid: str
    filename: str
    created_at: datetime = datetime.now()
    last_accessed: datetime = datetime.now()
    summary: str

    class Settings:
        name = "rfps"

class RFPResponse(BaseModel):
    document_uuid: str
    filename: str
    summary: str
    vector_store_uuid: str