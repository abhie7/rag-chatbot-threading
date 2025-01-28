from fastapi import APIRouter, Body, HTTPException, Depends, UploadFile, File
from app.models.rfp import RFPResponse
from app.services.rfp_summarizer import process_rfp
from app.services.vector_store import create_vector_store, query_vector_store
from app.services.auth import AuthService
from datetime import datetime
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from minio import Minio
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB")]

minio_client = Minio(
    os.getenv("MINIO_END_POINT"),
    access_key=os.getenv("MINIO_ACCESS_KEY"),
    secret_key=os.getenv("MINIO_SECRET_KEY"),
    secure=os.getenv("MINIO_USE_SSL") == "true"
)

@router.post("/process_rfp", response_model=RFPResponse)
async def process_rfp_route(
    file: UploadFile = File(...),
    current_user: dict = Depends(AuthService.get_current_user)
):
    try:
        # Upload file to Minio
        bucket_name = "rfp-automation"
        object_name = f"uploaded-files/{file.filename}"
        content = await file.read()
        minio_client.put_object(
            bucket_name,
            object_name,
            content,
            length=len(content),
            content_type=file.content_type
        )

        # Process the RFP
        text = content.decode("utf-8")
        vector_store_uuid = await create_vector_store(text)
        summary = await process_rfp(text)

        # Create document in MongoDB
        document = {
            "document_uuid": str(ObjectId()),
            "user_uuid": current_user["user_uuid"],
            "filename": file.filename,
            "file_type": file.content_type,
            "minio_bucket": bucket_name,
            "minio_object_name": object_name,
            "vector_store_uuid": vector_store_uuid,
            "summary": summary,
            "past_summaries": [],
            "chat_history": [],
            "created_at": datetime.now(),
            "last_accessed": datetime.now()
        }

        result = await db[f"{current_user['user_uuid']}.documents"].insert_one(document)

        return RFPResponse(
            document_uuid=document["document_uuid"],
            filename=file.filename,
            summary=summary,
            vector_store_uuid=vector_store_uuid
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query_rfp")
async def query_rfp_route(
    document_uuid: str = Body(...),
    query: str = Body(...),
    current_user: dict = Depends(AuthService.get_current_user)
):
    try:
        document = await db[f"{current_user['user_uuid']}.documents"].find_one({"document_uuid": document_uuid})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        vector_store_uuid = document["vector_store_uuid"]
        response = await query_vector_store(vector_store_uuid, query)

        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))