from fastapi import APIRouter, HTTPException
from app.database import get_document

router = APIRouter()

@router.get("/get_document/{user_uuid}/{document_hash}")
async def get_document_route(user_uuid: str, document_hash: str):
    try:
        document = await get_document(user_uuid, document_hash)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))