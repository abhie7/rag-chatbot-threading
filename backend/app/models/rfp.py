from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId

class Document(BaseModel):
    document_uuid: str = Field(default_factory=lambda: str(ObjectId()))
    filename: str
    content_type: str
    file_size: int
    minio_bucket: str
    minio_object_name: str
    minio_etag: str
    upload_date: datetime = Field(default_factory=datetime.now)
    vector_store_uuid: str
    summary: str
    past_summaries: list = []
    chat_history: list = []
    created_at: datetime = Field(default_factory=datetime.now)
    last_accessed: datetime = Field(default_factory=datetime.now)

    class Config:
        # Allow reading from MongoDB ObjectIds
        json_encoders = {
            ObjectId: str
        }
