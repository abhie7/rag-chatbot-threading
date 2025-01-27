from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Body
from app.models.rfp import RFP, RFPResponse
from app.services.rfp_summarizer import process_rfp
from app.services.vector_store import create_vector_store, query_vector_store
from app.services.auth import AuthService
from fastapi.responses import FileResponse
from datetime import datetime
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB")]

@router.post("/process_rfp", response_model=RFPResponse)
async def process_rfp_route(
    file: UploadFile = File(...),
    current_user: dict = Depends(AuthService.get_current_user)
):
    try:
        # Save uploaded file
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Process the RFP
        with open(file_path, "r") as f:
            text = f.read()

        vector_store_uuid = await create_vector_store(text)
        summary = await process_rfp(text)

        # Create document in MongoDB
        document = {
            "document_uuid": str(ObjectId()),
            "user_uuid": current_user["user_uuid"],
            "filename": file.filename,
            "file_type": file.content_type,
            "original_text": text,
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