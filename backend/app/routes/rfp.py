from fastapi import APIRouter, Body, HTTPException
from fastapi.encoders import jsonable_encoder
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from minio import Minio
from pydantic import BaseModel

from app.services.vector_store import get_summary, save_faiss_index
from app.services.minio_handler import MinioHandler
from app.services.utils import convert_to_llamaindex_document, get_time, hash_document_text, parse_pdf_to_md, recursive_split_text
from app.database import save_document

import os
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()
# client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
# db = client[os.getenv("MONGO_DB")]

minio_client = Minio(
    os.getenv("MINIO_ENDPOINT"),
    access_key=os.getenv("MINIO_ACCESS_KEY"),
    secret_key=os.getenv("MINIO_SECRET_KEY"),
    secure=True
)

class RfpPayload(BaseModel):
    user_uuid: str
    bucket: str
    object_name: str
    url: str
    etag: str
    filename: str
    file_size: int
    content_type: str
    upload_date: str

@router.post("/process_rfp")
async def process_rfp(payload: RfpPayload):
    
    if not payload.user_uuid:
        raise HTTPException(status_code=400, detail="User UUID is required")
    
    try:
        print(f"[Process RFP][{await get_time()}] Hit AA gaya")
        user_uuid = payload.user_uuid
        bucket = payload.bucket
        object_name = payload.object_name
        url = payload.url
        etag = payload.etag
        filename = payload.filename
        file_size = payload.file_size
        content_type = payload.content_type
        upload_date = payload.upload_date

        minio_handler = MinioHandler()
        
        base_db_path=os.getenv('BASE_DB_PATH')
        # local directory where the file will be saved
        local_dir=os.getenv('LOCAL_DIR')
        local_file_path = os.path.join(local_dir, os.path.basename(object_name))    # full path by appending the object_name

        try:
            # download file
            minio_handler.download_file(
                bucket_name=bucket,
                object_name=object_name,
                local_file_path=local_file_path
            )
            
            # get extracted pdf text in md format
            md_text = await parse_pdf_to_md(local_file_path)
            
            # generate a document hash
            doc_hash = await hash_document_text(md_text)
            print(f"[Process RFP][{await get_time()}] Document hash: {doc_hash}")

            doc_db_folder = os.path.join(base_db_path, doc_hash)
            print(f"[Process RFP][{await get_time()}] Document DB folder: {doc_db_folder}")
            
            if not os.path.exists(doc_db_folder):
                chunks = await recursive_split_text(md_text)
                documents = await convert_to_llamaindex_document(chunks, local_file_path)
                await save_faiss_index(documents=documents, db_path=doc_db_folder)
            else:
                print(f"[Process RFP][{await get_time()}] Vector DB for already exists at {doc_db_folder}")
        finally:
            if os.path.exists(local_file_path):
                os.remove(local_file_path)
                print(f"[Process RFP][{await get_time()}] Deleted temp file: {local_file_path}")
        
        summary = await get_summary(md_text)
                
        document = {
            "user_uuid": user_uuid,
            "document_hash": doc_hash,
            "vector_store_uuid": doc_hash,
            "filename": filename,
            "content_type": content_type,
            "file_size": file_size,
            "minio_bucket": bucket,
            "minio_object_name": object_name,
            "minio_etag": etag,
            "minio_url": url,
            "upload_date": upload_date,
            "summary": summary,
            "past_summaries": [],
            "chat_history": [],
            "created_at": datetime.now(),
            "last_accessed": datetime.now()
        }

        insertion_id = await save_document(document)

        if isinstance(insertion_id, ObjectId):
            insertion_id = str(insertion_id)

        print(f"[Process RFP][{await get_time()}] Mongo Document Saved", insertion_id)
        
        return jsonable_encoder({**document, "_id": insertion_id})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query_rfp")
async def query_rfp_route(
    document_uuid: str = Body(...),
    query: str = Body(...)
):
    try:
        ...
        return {"response": ...}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

