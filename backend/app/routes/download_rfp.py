from fastapi import APIRouter, Body, HTTPException
import os
from dotenv import load_dotenv

from pydantic import BaseModel
from app.services.md_to_docx_downloader import save_summary_to_files
from app.services.minio_handler import MinioHandler

load_dotenv()

router = APIRouter()

class DownloadRfpPayload(BaseModel):
    summary: str
    filename: str
    document_hash: str
    user_uuid: str

@router.post("/download_rfp_file")
async def upload_file(payload: DownloadRfpPayload = Body(...)):
    try:
        summary = payload.summary
        filename = payload.filename
        document_hash = payload.document_hash
        user_uuid = payload.user_uuid

        docx_output_path = await save_summary_to_files(summary, f"{os.getenv('OUTPUT_DIR')}/{user_uuid}/{document_hash}", filename, document_hash)
        print(f"Document saved to: {docx_output_path}")

        result = MinioHandler().upload_file(
            bucket_name=os.getenv("MINIO_BUCKET_NAME"),
            object_name=f"downloads/{user_uuid}/{document_hash}/{filename}.docx",
            local_file_path=docx_output_path
        )
        print(f"File uploaded to MinIO with ETag: {result}")

        return {
            "document_hash": document_hash,
            "object_name": f"{document_hash}/{filename}.docx",
            "etag": result,
            "bucket": os.getenv("MINIO_BUCKET_NAME")
        }

    except Exception as e:
        print(f"Error in upload_file: {e}")
        raise HTTPException(status_code=500, detail=str(e))