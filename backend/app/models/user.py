import uuid
from datetime import datetime
from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import List
import os
from dotenv import load_dotenv
load_dotenv()

class SubDocModel(BaseModel):
    document_hash: str
    filename: str
    upload_date: str

class User(Document):
    user_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    hashed_password: str
    display_name: str
    avatar_seed: str
    created_at: datetime = Field(default_factory=datetime.now)
    last_login: datetime = Field(default_factory=datetime.now)
    documents: List[SubDocModel] = Field(default_factory=list)
    
    class Settings:
        collection = os.getenv("MONGO_USERS_COLLECTION", "users")  # Specify MongoDB collection name

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_uuid: str
    email: EmailStr
    display_name: str
    avatar_seed: str