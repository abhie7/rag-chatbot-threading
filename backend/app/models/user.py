from beanie import Document
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid

class User(Document):
    user_uuid: str = str(uuid.uuid4())
    email: EmailStr
    hashed_password: str
    display_name: str
    avatar_seed: str
    created_at: datetime = datetime.now()
    last_login: datetime = datetime.now()

    class Settings:
        name = "users"

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