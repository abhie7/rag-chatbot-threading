from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, Document as BeanieDocument
from app.models.user import User
from typing import Type
import os
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from datetime import datetime



client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client.rfp_db
async def init_db():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    database = client.rfp_db
    await init_beanie(database=database, document_models=[User, Document])

class Document(BeanieDocument, BaseModel):
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
    past_summaries: list = Field(default_factory=list)
    chat_history: list = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    last_accessed: datetime = Field(default_factory=datetime.now)


async def save_document(document):
    try:
        user_uuid = document["user_uuid"]

        # Save to documents collection
        documents_collection = db[f"{user_uuid}.documents"]
        doc_result = await documents_collection.insert_one(document)

        # Update user's documents array
        users_collection = db.users
        await users_collection.update_one(
            {"user_uuid": user_uuid},
            {
                "$push": {
                    "documents": {
                        "document_hash": document["document_hash"],
                        "filename": document["filename"],
                        "created_at": document["created_at"]
                    }
                }
            }
        )

        return str(doc_result.inserted_id)
    except Exception as e:
        print(f"Error saving document: {str(e)}")
        raise

async def get_document(user_uuid: str, document_hash: str):
    try:
        collection_name = f"{user_uuid}.documents"
        document_collection = db[collection_name]
        document = await document_collection.find_one({"document_hash": document_hash})
        if document:
            document["_id"] = str(document["_id"])
        return document
    except Exception as e:
        print(f"Error retrieving document: {str(e)}")
        raise