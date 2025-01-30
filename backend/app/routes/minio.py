from fastapi import APIRouter, Form, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from minio import Minio
from minio.error import S3Error
from app.services.auth import AuthService
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

minio_client = Minio(
    os.getenv("MINIO_ENDPOINT"),
    access_key=os.getenv("MINIO_ACCESS_KEY"),
    secret_key=os.getenv("MINIO_SECRET_KEY"),
    secure=True
)

# @router.post("/upload_file")
# async def upload_file(
#     file: UploadFile = File(...),
#     bucket: str = "rfp-automation",
#     folder_name: str = "/uploaded-files/",
#     current_user: dict = Depends(AuthService.get_current_user)
# ):
#     try:
#         content = await file.read()
#         object_name = f"{folder_name}{file.filename}"
        
#         result = minio_client.put_object(
#             bucket,
#             object_name,
#             content,
#             length=len(content),
#             content_type=file.content_type
#         )

#         return {
#             "object_name": object_name,
#             "etag": result.etag,
#             "bucket": bucket
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/get_presigned_url")
async def get_presigned_url(
    bucket: str,
    object_name: str,
    expiry_seconds: int = 3600,
    # current_user: dict = Depends(AuthService.get_current_user)
):
    try:
        url = minio_client.presigned_get_object(
            bucket,
            object_name,
            expires=expiry_seconds
        )
        return JSONResponse(content={"url": url})
    except S3Error as exc:
        raise HTTPException(status_code=500, detail=f"Minio error: {exc}")

