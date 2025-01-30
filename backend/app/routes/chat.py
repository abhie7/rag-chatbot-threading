from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from datetime import datetime

from app.services.vector_store import get_chat_output
from app.services.utils import get_time, md
from app.database import update_chat_history

import os
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

class ChatPayload(BaseModel):
    query: str
    user_uuid: str
    document_hash: str

@router.post("/chat")
async def chat(payload: ChatPayload = Body(...)):
    if not payload.user_uuid:
        raise HTTPException(status_code=400, detail="User UUID is required")

    try:
        user_uuid = payload.user_uuid
        document_hash = payload.document_hash
        query = payload.query

        base_db_path = os.getenv('BASE_DB_PATH')
        sub_path = f"{user_uuid}/{document_hash}"
        vector_db_path = os.path.join(base_db_path, sub_path)

        if os.path.exists(vector_db_path):
            response = await get_chat_output(query, vector_db_path)

            await md(f"[RFP Chat][{await get_time()}]\n{response}")

            # Update chat history in the document
            chat_message_user = {"sender": "user", "text": query, "timestamp": datetime.now()}
            chat_message_bot = {"sender": "bot", "text": response, "timestamp": datetime.now()}
            await update_chat_history(user_uuid, document_hash, [chat_message_user, chat_message_bot])

            return {"chat_response": response}
        else:
            print(f"[RFP Chat][{await get_time()}] Vector DB does not exist at {vector_db_path}")
            raise HTTPException(status_code=404, detail="Vector DB not found")
    except Exception as e:
        print(f"[RFP Chat][{await get_time()}] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))