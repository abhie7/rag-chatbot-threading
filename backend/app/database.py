from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User
from app.models.rfp import RFP
import os

async def init_db():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    await init_beanie(database=client.rfp_db, document_models=[User, RFP])

